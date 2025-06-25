import api from '@/lib/axios'
import type {SelfAssessmentRequest} from '@/types/csdddType'

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

  return api.post('/api/v1/csddd/submit', requestList, {
    headers
  })
}

/**
 * 자가진단 결과 수정 (본사)
 */
export async function updateSelfAssessmentToBackend(
  requestList: SelfAssessmentRequest[],
  headquartersId: string,
  accountNumber: string
) {
  return api.put('/api/v1/csddd/update', requestList, {
    headers: {
      'X-HEADQUARTERS-ID': headquartersId,
      'X-ACCOUNT-NUMBER': accountNumber,
      'X-USER-TYPE': 'HEADQUARTERS'
    }
  })
}

/**
 * 결과 간단 조회
 */
export async function fetchSelfAssessmentResult(
  headquartersId: string,
  accountNumber: string
) {
  return api.get('/api/v1/csddd/result', {
    headers: {
      'X-HEADQUARTERS-ID': headquartersId,
      'X-ACCOUNT-NUMBER': accountNumber,
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
    headers: {
      'X-HEADQUARTERS-ID': headquartersId,
      'X-ACCOUNT-NUMBER': accountNumber,
      'X-USER-TYPE': 'HEADQUARTERS'
    }
  })
}

/**
 * 위반 항목만 조회
 */
export async function fetchViolationItems(headquartersId: string, accountNumber: string) {
  return api.get('/api/v1/csddd/result/violations', {
    headers: {
      'X-HEADQUARTERS-ID': headquartersId,
      'X-ACCOUNT-NUMBER': accountNumber,
      'X-USER-TYPE': 'HEADQUARTERS'
    }
  })
}

/**
 * 협력사 결과 리스트 조회 (본사용)
 */
export async function fetchPartnerResults(headquartersId: string) {
  return api.get('/api/v1/csddd/partners/results', {
    headers: {
      'X-HEADQUARTERS-ID': headquartersId,
      'X-USER-TYPE': 'HEADQUARTERS'
    }
  })
}

/**
 * 하위 협력사 결과 리스트 조회 (1차 협력사용)
 */
export async function fetchSubPartnerResults(headquartersId: string, partnerId: string) {
  return api.get('/api/v1/csddd/sub-partners/results', {
    headers: {
      'X-HEADQUARTERS-ID': headquartersId,
      'X-PARTNER-ID': partnerId,
      'X-USER-TYPE': 'FIRST_TIER_PARTNER'
    }
  })
}

/**
 * 특정 협력사 결과 조회 (본사용)
 */
export async function fetchPartnerResult(partnerId: string, headquartersId: string) {
  return api.get(`/api/v1/csddd/partner/${partnerId}/result`, {
    headers: {
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
  headquartersId: string,
  partnerId: string
) {
  return api.get(`/api/v1/csddd/sub-partner/${subPartnerId}/result`, {
    headers: {
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
  headquartersId: string,
  partnerId: string
) {
  return api.post('/api/v1/csddd/submit', requestList, {
    headers: {
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
  headquartersId: string,
  partnerId: string
) {
  return api.post('/api/v1/csddd/submit', requestList, {
    headers: {
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
  headquartersId: string,
  partnerId: string
) {
  return api.get('/api/v1/csddd/result', {
    headers: {
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
  headquartersId: string,
  partnerId: string
) {
  return api.get('/api/v1/csddd/result', {
    headers: {
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
