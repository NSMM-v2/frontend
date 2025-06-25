import api from '@/lib/axios'
import type {SelfAssessmentRequest} from '@/types/csdddType'

/**
 * 자가진단 결과 제출 (본사)
 */
export const submitSelfAssessmentToBackend = (requestList: SelfAssessmentRequest[]) => {
  return api.post('/api/v1/csddd/submit', requestList)
}

/**
 * 자가진단 결과 수정 (본사)
 */
export async function updateSelfAssessmentToBackend(
  requestList: SelfAssessmentRequest[]
) {
  return api.put('/api/v1/csddd/update', requestList)
}

/**
 * 결과 간단 조회
 */
export async function fetchSelfAssessmentResult() {
  return api.get('/api/v1/csddd/result')
}

/**
 * 전체 문항 포함한 상세 결과 조회
 */
export const fetchFullSelfAssessmentResult = async () => {
  const res = await api.get('/api/v1/csddd/result/full')
  return res.data
}

/**
 * 위반 항목만 조회
 */
export async function fetchViolationItems() {
  return api.get('/api/v1/csddd/result/violations')
}

/**
 * 협력사 결과 리스트 조회 (본사용)
 */
export async function fetchPartnerResults() {
  return api.get('/api/v1/csddd/partners/results')
}

/**
 * 하위 협력사 결과 리스트 조회 (1차 협력사용)
 */
export async function fetchSubPartnerResults() {
  return api.get('/api/v1/csddd/sub-partners/results')
}

/**
 * 특정 협력사 결과 조회 (본사용)
 */
export async function fetchPartnerResult() {
  return api.get(`/api/v1/csddd/partner/result`)
}

/**
 * 특정 2차 협력사 결과 조회 (1차 협력사용)
 */
export async function fetchSubPartnerResult() {
  return api.get(`/api/v1/csddd/sub-partner/result`)
}

/**
 * 협력사 자가진단 제출 (1차 협력사)
 */
export async function submitPartnerSelfAssessment(requestList: SelfAssessmentRequest[]) {
  return api.post('/api/v1/csddd/submit', requestList)
}

/**
 * 2차 협력사 자가진단 제출
 */
export async function submitSecondTierPartnerSelfAssessment(
  requestList: SelfAssessmentRequest[]
) {
  return api.post('/api/v1/csddd/submit', requestList)
}

/**
 * 1차 협력사 자가진단 결과 조회
 */
export async function fetchFirstTierPartnerResult() {
  return api.get('/api/v1/csddd/result')
}

/**
 * 2차 협력사 자가진단 결과 조회
 */
export async function fetchSecondTierPartnerResult() {
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
