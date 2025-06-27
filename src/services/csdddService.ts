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
  resultId: number
): Promise<SelfAssessmentResponse> => {
  const response = await api.get(`/api/v1/csddd/${resultId}`)
  return response.data.data // ApiResponse<SelfAssessmentResponse> 구조 고려
}

/**
 * 자가진단 결과 목록 조회 (페이징)
 */
export const getSelfAssessmentResults = async (params?: {
  companyName?: string
  category?: string
  startDate?: string
  endDate?: string
  page?: number
  size?: number
}): Promise<PaginatedSelfAssessmentResponse> => {
  const response = await api.get('/api/v1/csddd/results', {params})
  return response.data.data // ApiResponse<Page<SelfAssessmentResponse>> 구조 고려
}

/**
 * 자가진단 응답만 추출 (프론트엔드용)
 * 특정 결과 ID의 응답을 추출
 */
export const fetchSelfAssessmentAnswers = async (
  resultId: number
): Promise<Record<string, string>> => {
  const response = await getSelfAssessmentResult(resultId)
  const answersArray = response.answers ?? []
  const answerMap: Record<string, string> = {}
  answersArray.forEach((item: {questionId: string; answer: string}) => {
    answerMap[item.questionId] = item.answer
  })
  return answerMap
}
