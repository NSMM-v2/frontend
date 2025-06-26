import api from '@/lib/axios'
import type {
  SelfAssessmentRequest,
  SelfAssessmentSubmissionRequest
} from '@/types/csdddType'

/**
 * 자가진단 결과 제출 (공통)
 */
export const submitSelfAssessmentToBackend = (
  request: SelfAssessmentSubmissionRequest
) => {
  return api.post('/api/v1/csddd/submit', request)
}

/**
 * 자가진단 결과 수정 (공통)
 */
export const updateSelfAssessmentToBackend = (
  request: SelfAssessmentSubmissionRequest
) => {
  return api.put('/api/v1/csddd/update', request)
}

/**
 * 결과 간단 조회 (본인)
 */
export const fetchSelfAssessmentResult = async () => {
  return api.get('/api/v1/csddd/result')
}

/**
 * 전체 문항 포함한 상세 결과 조회 (본인)
 */
export const fetchFullSelfAssessmentResult = async () => {
  const res = await api.get('/api/v1/csddd/result/full')
  return res.data
}

/**
 * 위반 항목만 조회 (본인)
 */
export const fetchViolationItems = async () => {
  return api.get('/api/v1/csddd/result/violations')
}

/**
 * 본사 - 전체 협력사 결과 리스트 조회
 */
export const fetchPartnerResults = async () => {
  return api.get('/api/v1/csddd/partners/results')
}

/**
 * 1차 협력사 - 소속 2차 협력사 결과 리스트 조회
 */
export const fetchSubPartnerResults = async () => {
  return api.get('/api/v1/csddd/sub-partners/results')
}

/**
 * 본사 - 특정 협력사 결과 조회
 */
export const fetchPartnerResult = async (partnerId: number) => {
  return api.get(`/api/v1/csddd/partner/${partnerId}/result`)
}

/**
 * 1차 협력사 - 특정 2차 협력사 결과 조회
 */
export const fetchSubPartnerResult = async (subPartnerId: number) => {
  return api.get(`/api/v1/csddd/sub-partner/${subPartnerId}/result`)
}

/**
 * 협력사 자가진단 제출 (1차/2차 공통)
 */
export const submitPartnerSelfAssessment = (request: SelfAssessmentSubmissionRequest) => {
  return api.post('/api/v1/csddd/submit', request)
}

/**
 * 1차 협력사 자가진단 결과 조회 (내 결과)
 */
export const fetchFirstTierPartnerResult = async () => {
  return api.get('/api/v1/csddd/result')
}

/**
 * 2차 협력사 자가진단 결과 조회 (내 결과)
 */
export const fetchSecondTierPartnerResult = async () => {
  return api.get('/api/v1/csddd/result')
}

/**
 * 자가진단 응답만 추출 (프론트엔드용)
 */
export const fetchSelfAssessmentAnswers = async (): Promise<Record<string, string>> => {
  const response = await fetchFullSelfAssessmentResult()
  const answersArray = response.answers ?? []
  const answerMap: Record<string, string> = {}
  answersArray.forEach((item: {questionId: string; answer: string}) => {
    answerMap[item.questionId] = item.answer
  })
  return answerMap
}
