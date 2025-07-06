import api from '@/lib/axios'
import type {
  SelfAssessmentSubmissionRequest,
  SelfAssessmentResponse,
  PaginatedSelfAssessmentResponse,
  ViolationMeta,
  ApiResponse
} from '@/types/csdddType'

/**
 * 자가진단 결과 제출
 * JWT 쿠키를 통한 인증 사용
 */
export const submitSelfAssessmentToBackend = async (
  request: SelfAssessmentSubmissionRequest
): Promise<ApiResponse<void>> => {
  console.log('[CSDDD Service] 자가진단 제출 요청:', {
    companyName: request.companyName,
    answersCount: request.answers.length,
    endpoint: '/api/v1/csddd/submit'
  })

  try {
    const response = await api.post<ApiResponse<void>>('/api/v1/csddd/submit', request)

    console.log('[CSDDD Service] 자가진단 제출 성공:', {
      success: response.data.success,
      message: response.data.message,
      timestamp: response.data.timestamp
    })

    return response.data
  } catch (error: any) {
    console.error('[CSDDD Service] 자가진단 제출 실패:', {
      companyName: request.companyName,
      error: error.response?.data || error.message,
      status: error.response?.status
    })
    throw error
  }
}

/**
 * 자가진단 결과 단건 조회
 * JWT 쿠키를 통한 권한 확인
 */
export const getSelfAssessmentResult = async (
  resultId: number
): Promise<SelfAssessmentResponse> => {
  console.log('[CSDDD Service] 자가진단 결과 단건 조회 요청:', {
    resultId,
    endpoint: `/api/v1/csddd/${resultId}`
  })

  try {
    const response = await api.get<ApiResponse<SelfAssessmentResponse>>(
      `/api/v1/csddd/${resultId}`
    )

    console.log('[CSDDD Service] 자가진단 결과 단건 조회 성공:', {
      resultId: response.data.data.id,
      companyName: response.data.data.companyName,
      score: response.data.data.score,
      status: response.data.data.status,
      finalGrade: response.data.data.finalGrade,
      answersCount: response.data.data.answers?.length || 0
    })

    return response.data.data
  } catch (error: any) {
    console.error('[CSDDD Service] 자가진단 결과 단건 조회 실패:', {
      resultId,
      error: error.response?.data || error.message,
      status: error.response?.status
    })
    throw error
  }
}

/**
 * 자가진단 결과 목록 조회 (페이징)
 * JWT 쿠키를 통한 권한별 데이터 필터링
 */
export const getSelfAssessmentResults = async (params?: {
  companyName?: string
  category?: string
  startDate?: string
  endDate?: string
  page?: number
  size?: number
  onlyPartners?: boolean
}): Promise<PaginatedSelfAssessmentResponse> => {
  console.log('[CSDDD Service] 자가진단 결과 목록 조회 요청:', {
    params,
    endpoint: '/api/v1/csddd/results'
  })

  try {
    const response = await api.get<ApiResponse<PaginatedSelfAssessmentResponse>>(
      '/api/v1/csddd/results',
      {params}
    )

    console.log('[CSDDD Service] 자가진단 결과 목록 조회 성공:', {
      totalElements: response.data.data.totalElements,
      totalPages: response.data.data.totalPages,
      currentPage: response.data.data.number,
      size: response.data.data.size,
      contentLength: response.data.data.content?.length || 0,
      hasContent: !response.data.data.empty
    })

    return response.data.data
  } catch (error: any) {
    console.error('[CSDDD Service] 자가진단 결과 목록 조회 실패:', {
      params,
      error: error.response?.data || error.message,
      status: error.response?.status
    })
    throw error
  }
}

/**
 * 자가진단 응답만 추출 (프론트엔드용)
 * 특정 결과의 답변 데이터를 questionId를 키로 하는 객체로 변환
 */
export const fetchSelfAssessmentAnswers = async (
  resultId: number
): Promise<Record<string, string>> => {
  console.log('[CSDDD Service] 자가진단 답변 추출 요청:', {
    resultId,
    purpose: 'questionId -> answer mapping'
  })

  try {
    const response = await getSelfAssessmentResult(resultId)
    const answersArray = response.answers ?? []

    const answerMap: Record<string, string> = {}
    answersArray.forEach(item => {
      // Boolean 답변을 문자열로 변환
      answerMap[item.questionId] = item.answer ? 'yes' : 'no'
    })

    console.log('[CSDDD Service] 자가진단 답변 추출 성공:', {
      resultId,
      totalAnswers: answersArray.length,
      mappedAnswers: Object.keys(answerMap).length,
      sampleAnswers: Object.keys(answerMap).slice(0, 3),
      sampleValues: Object.values(answerMap).slice(0, 3)
    })

    return answerMap
  } catch (error: any) {
    console.error('[CSDDD Service] 자가진단 답변 추출 실패:', {
      resultId,
      error: error.response?.data || error.message
    })
    throw error
  }
}

/**
 * 중대위반 메타데이터 조회
 * 특정 문항의 법적 근거 및 처벌 정보 조회
 */
export const getViolationMeta = async (questionId: string): Promise<ViolationMeta> => {
  console.log('[CSDDD Service] 중대위반 메타데이터 조회 요청:', {
    questionId,
    endpoint: `/api/v1/csddd/violation-meta/${questionId}`
  })

  try {
    const response = await api.get<ApiResponse<ViolationMeta>>(
      `/api/v1/csddd/violation-meta/${questionId}`
    )

    console.log('[CSDDD Service] 중대위반 메타데이터 조회 성공:', {
      questionId,
      category: response.data.data.category,
      hasPenaltyInfo: !!response.data.data.penaltyInfo,
      hasLegalBasis: !!response.data.data.legalBasis,
      penaltyLength: response.data.data.penaltyInfo?.length || 0,
      legalBasisLength: response.data.data.legalBasis?.length || 0
    })

    return response.data.data
  } catch (error: any) {
    console.error('[CSDDD Service] 중대위반 메타데이터 조회 실패:', {
      questionId,
      error: error.response?.data || error.message,
      status: error.response?.status
    })
    throw error
  }
}

/**
 * 회사명 중복 확인 (향후 확장용)
 * 자가진단 제출 전 회사명 중복 여부 확인
 */
export const checkCompanyName = async (companyName: string): Promise<boolean> => {
  console.log('[CSDDD Service] 회사명 중복 확인 요청:', {
    companyName,
    endpoint: '/api/v1/csddd/check-company'
  })

  try {
    const response = await api.get<ApiResponse<boolean>>('/api/v1/csddd/check-company', {
      params: {companyName}
    })

    console.log('[CSDDD Service] 회사명 중복 확인 성공:', {
      companyName,
      available: response.data.data,
      message: response.data.message,
      canProceed: response.data.data
    })

    return response.data.data
  } catch (error: any) {
    console.error('[CSDDD Service] 회사명 중복 확인 실패:', {
      companyName,
      error: error.response?.data || error.message,
      status: error.response?.status
    })
    throw error
  }
}
