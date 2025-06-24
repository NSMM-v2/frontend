import axios, {AxiosError} from 'axios'
import type {SelfAssessmentRequest} from '@/types/csdddType'

/**
 * API URL 동적 결정 함수
 */
const getApiBaseUrl = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_SPRING_API_URL
  if (!configuredUrl || configuredUrl.includes('${') || configuredUrl === 'undefined') {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const protocol = window.location.protocol
      const port = hostname === 'localhost' ? ':8080' : ''
      return `${protocol}//${hostname}${port}`
    }
    return 'http://gateway-service:8080'
  }
  return configuredUrl
}

/**
 * Axios 인스턴스 생성
 */
const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 요청 인터셉터
 */
api.interceptors.request.use(
  config => {
    const url = `${config.baseURL || ''}${config.url || ''}`
    console.log(`API 요청: ${config.method?.toUpperCase()} ${url}`)
    return config
  },
  error => {
    console.error('API 요청 오류:', error)
    return Promise.reject(error)
  }
)

/**
 * 응답 인터셉터
 */
api.interceptors.response.use(
  response => {
    console.log(
      `API 응답 성공: ${response.config.method?.toUpperCase()} ${response.config.url}`
    )
    return response
  },
  (error: AxiosError) => {
    const status = error.response?.status
    const url = error.config?.url

    if (status === 401 || status === 403) {
      console.log(`인증 필요: ${status} ${url}`)
    } else {
      // 안전한 에러 데이터 추출
      let errorData = '알 수 없는 오류'

      if (error.response?.data) {
        errorData =
          typeof error.response.data === 'string'
            ? error.response.data
            : JSON.stringify(error.response.data)
      } else if (error.request) {
        errorData = '서버 응답 없음'
      } else if (error.message) {
        errorData = error.message
      }

      console.error(`API 응답 실패: ${status} ${url}`, errorData)
    }

    return Promise.reject(error)
  }
)

/**
 * 자가진단 결과 제출 (본사)
 */
export const submitSelfAssessmentToBackend = (
  requestList: SelfAssessmentRequest[],
  userType: string,
  headquartersId?: string,
  accountNumber?: string,
  partnerId?: string
) => {
  if (!accountNumber) {
    throw new Error('accountNumber is required')
  }

  const headers: Record<string, string> = {
    'X-ACCOUNT-NUMBER': accountNumber,
    'X-USER-TYPE': userType
  }

  if (headquartersId) {
    headers['X-HEADQUARTERS-ID'] = headquartersId
  }

  if (partnerId) {
    headers['X-PARTNER-ID'] = partnerId
  }

  console.log('📦 최종 요청 헤더:', headers)

  return axios.post('/api/v1/csddd/submit', requestList, {
    headers,
    withCredentials: true
  })
}

/**
 * 자가진단 결과 수정 (본사)
 */
export async function updateSelfAssessmentToBackend(
  requestList: SelfAssessmentRequest[],
  accessToken: string,
  headquartersId: string,
  accountNumber: string
) {
  return api.put('/api/v1/csddd/update', requestList, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-HEADQUARTERS-ID': headquartersId,
      'X-USER-TYPE': 'HEADQUARTERS'
    }
  })
}

/**
 * 결과 간단 조회
 */
export async function fetchSelfAssessmentResult(
  accessToken: string,
  headquartersId: string,
  accountNumber: string
) {
  return api.get('/api/v1/csddd/result', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-HEADQUARTERS-ID': headquartersId,
      'X-USER-TYPE': 'HEADQUARTERS'
    }
  })
}

/**
 * 전체 문항 포함한 상세 결과 조회
 */
export const fetchFullSelfAssessmentResult = async (
  headquartersId: string,
  accountNumber: string
) => {
  return await api.get('/api/v1/csddd/result/full', {
    withCredentials: true,
    headers: {
      'X-HEADQUARTERS-ID': headquartersId,
      'X-ACCOUNT-NUMBER': accountNumber
    }
  })
}

/**
 * 위반 항목만 조회
 */
export async function fetchViolationItems(
  accessToken: string,
  headquartersId: string,
  accountNumber: string
) {
  return api.get('/api/v1/csddd/result/violations', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-HEADQUARTERS-ID': headquartersId,
      'X-USER-TYPE': 'HEADQUARTERS'
    }
  })
}

/**
 * 협력사 결과 리스트 조회 (본사용)
 */
export async function fetchPartnerResults(accessToken: string, headquartersId: string) {
  return api.get('/api/v1/csddd/partners/results', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-HEADQUARTERS-ID': headquartersId,
      'X-USER-TYPE': 'HEADQUARTERS'
    }
  })
}

/**
 * 하위 협력사 결과 리스트 조회 (1차 협력사용)
 */
export async function fetchSubPartnerResults(
  accessToken: string,
  headquartersId: string,
  partnerId: string
) {
  return api.get('/api/v1/csddd/sub-partners/results', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-HEADQUARTERS-ID': headquartersId,
      'X-PARTNER-ID': partnerId,
      'X-USER-TYPE': 'FIRST_TIER_PARTNER'
    }
  })
}

/**
 * 특정 협력사 결과 조회 (본사용)
 */
export async function fetchPartnerResult(
  partnerId: string,
  accessToken: string,
  headquartersId: string
) {
  return api.get(`/api/v1/csddd/partner/${partnerId}/result`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-HEADQUARTERS-ID': headquartersId,
      'X-USER-TYPE': 'HEADQUARTERS'
    }
  })
}

/**
 * 특정 2차 협력사 결과 조회 (1차 협력사용)
 */
export async function fetchSubPartnerResult(
  subPartnerId: string,
  accessToken: string,
  headquartersId: string,
  partnerId: string
) {
  return api.get(`/api/v1/csddd/sub-partner/${subPartnerId}/result`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-HEADQUARTERS-ID': headquartersId,
      'X-PARTNER-ID': partnerId,
      'X-USER-TYPE': 'FIRST_TIER_PARTNER'
    }
  })
}

/**
 * 협력사 자가진단 제출 (1차 협력사)
 */
export async function submitPartnerSelfAssessment(
  requestList: SelfAssessmentRequest[],
  accessToken: string,
  headquartersId: string,
  partnerId: string
) {
  return api.post('/api/v1/csddd/submit', requestList, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-HEADQUARTERS-ID': headquartersId,
      'X-PARTNER-ID': partnerId,
      'X-USER-TYPE': 'FIRST_TIER_PARTNER'
    }
  })
}

/**
 * 2차 협력사 자가진단 제출
 */
export async function submitSecondTierPartnerSelfAssessment(
  requestList: SelfAssessmentRequest[],
  accessToken: string,
  headquartersId: string,
  partnerId: string
) {
  return api.post('/api/v1/csddd/submit', requestList, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-HEADQUARTERS-ID': headquartersId,
      'X-PARTNER-ID': partnerId,
      'X-USER-TYPE': 'SECOND_TIER_PARTNER'
    }
  })
}

/**
 * 1차 협력사 자가진단 결과 조회
 */
export async function fetchFirstTierPartnerResult(
  accessToken: string,
  headquartersId: string,
  partnerId: string
) {
  return api.get('/api/v1/csddd/result', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-HEADQUARTERS-ID': headquartersId,
      'X-PARTNER-ID': partnerId,
      'X-USER-TYPE': 'FIRST_TIER_PARTNER'
    }
  })
}

/**
 * 2차 협력사 자가진단 결과 조회
 */
export async function fetchSecondTierPartnerResult(
  accessToken: string,
  headquartersId: string,
  partnerId: string
) {
  return api.get('/api/v1/csddd/result', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-HEADQUARTERS-ID': headquartersId,
      'X-PARTNER-ID': partnerId,
      'X-USER-TYPE': 'SECOND_TIER_PARTNER'
    }
  })
}

/**
 * 자가진단 응답만 추출 (프론트엔드용)
 */
export const fetchSelfAssessmentAnswers = async (
  headquartersId: string,
  accountNumber: string
): Promise<Record<string, string>> => {
  const response = await fetchFullSelfAssessmentResult(headquartersId, accountNumber)
  const answersArray = response.data.answers
  const answerMap: Record<string, string> = {}
  answersArray.forEach((item: {questionId: string; answer: string}) => {
    answerMap[item.questionId] = item.answer
  })
  return answerMap
}
