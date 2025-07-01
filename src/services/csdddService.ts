import api from '@/lib/axios'
import type {
  SelfAssessmentSubmissionRequest,
  SelfAssessmentResponse,
  PaginatedSelfAssessmentResponse
} from '@/types/csdddType'

/**
 * 자가진단 결과 제출
 */
export const submitSelfAssessmentToBackend = (
  request: SelfAssessmentSubmissionRequest
) => {
  return api.post('/api/v1/csddd/submit', request)
}

/**
 * 자가진단 결과 단건 조회
 */
export const getSelfAssessmentResult = async (
  resultId: number,
  userInfo: {
    userType: string
    headquartersId: string
    partnerId?: string
    treePath?: string
  }
): Promise<SelfAssessmentResponse> => {
  const headers: Record<string, string> = {
    'X-USER-TYPE': userInfo.userType,
    'X-HEADQUARTERS-ID': userInfo.headquartersId
  }

  if (
    userInfo.userType === 'PARTNER' &&
    userInfo.partnerId != null &&
    userInfo.partnerId !== ''
  ) {
    headers['X-PARTNER-ID'] = userInfo.partnerId
  }

  if (
    userInfo.userType === 'PARTNER' &&
    userInfo.treePath !== undefined &&
    userInfo.treePath !== null &&
    userInfo.treePath !== ''
  ) {
    headers['X-TREE-PATH'] = userInfo.treePath
  }

  const response = await api.get(`/api/v1/csddd/${resultId}`, {headers})
  return response.data.data
}

/**
 * 자가진단 결과 목록 조회 (페이징)
 */
export const getSelfAssessmentResults = async (
  userInfo: {
    userType: string
    headquartersId: string
    partnerId?: string
    treePath?: string
    forPartnerEvaluation?: boolean
  },
  params?: {
    companyName?: string
    category?: string
    startDate?: string
    endDate?: string
    page?: number
    size?: number
    onlyPartners?: boolean
  }
): Promise<PaginatedSelfAssessmentResponse> => {
  const headers: Record<string, string> = {
    'X-USER-TYPE': userInfo.userType,
    'X-HEADQUARTERS-ID': userInfo.headquartersId
  }

  const isPartnerEval = userInfo.forPartnerEvaluation ?? false
  if (userInfo.userType === 'PARTNER') {
    if (isPartnerEval) {
      headers['X-TREE-PATH'] = userInfo.treePath ?? ''
    } else {
      headers['X-PARTNER-ID'] = userInfo.partnerId ?? ''
    }
  }

  console.log('📦 최종 headers:', headers)

  const finalParams = isPartnerEval ? {...params, onlyPartners: true} : {...params}

  const response = await api.get('/api/v1/csddd/results', {
    params: finalParams,
    headers
  })

  return response.data.data
}

/**
 * 자가진단 응답만 추출 (프론트엔드용)
 */
export const fetchSelfAssessmentAnswers = async (
  resultId: number,
  userInfo: {
    userType: string
    headquartersId: string
    partnerId?: string
    treePath: string
  }
): Promise<Record<string, string>> => {
  const response = await getSelfAssessmentResult(resultId, userInfo)
  const answersArray = response.answers ?? []
  const answerMap: Record<string, string> = {}
  answersArray.forEach((item: {questionId: string; answer: string}) => {
    answerMap[item.questionId] = item.answer
  })
  return answerMap
}

export const getViolationMeta = async (questionId: string, userInfo: any) => {
  const response = await api.get(`/api/v1/csddd/violation-meta/${questionId}`, {
    headers: {
      'X-USER-TYPE': userInfo.userType,
      'X-HEADQUARTERS-ID': userInfo.headquartersId,
      ...(userInfo.partnerId && {'X-PARTNER-ID': userInfo.partnerId}),
      ...(userInfo.treePath && {'X-TREE-PATH': userInfo.treePath})
    }
  })
  return response.data.data
}
