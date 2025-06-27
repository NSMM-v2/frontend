/**
 * 자가진단 제출 요청 타입
 */
export interface SelfAssessmentSubmissionRequest {
  answers: SelfAssessmentAnswerItem[]
}

/**
 * 자가진단 문항 단건 응답 타입
 */
export interface SelfAssessmentAnswerItem {
  questionId: string
  answer: 'yes' | 'no'
  category: string
  weight: number
  critical: boolean
  criticalGrade?: string
  remarks?: string
}

/**
 * 자가진단 제출 결과 응답 타입 (리스트 항목)
 */
export interface SelfAssessmentResponse {
  id: number
  headquartersId: number
  partnerId: number | null
  treePath: string
  companyName: string // 추가 필요할 수 있음
  score: number
  actualScore: number
  totalPossibleScore: number
  criticalViolationCount: number
  completionRate: number
  finalGrade: string
  summary: string
  recommendations: string
  answers?: SelfAssessmentAnswerItem[] // 상세 조회 시에만 포함될 수 있음
  createdAt: string
  updatedAt: string
  completedAt: string
}

/**
 * 자가진단 상세 결과 응답 타입
 */
export interface SelfAssessmentFullResponse {
  result: SelfAssessmentResponse
  answers: SelfAssessmentAnswerItem[]
}

/**
 * 리스트 조회 시 페이징 응답 타입
 */
export interface PaginatedSelfAssessmentResponse {
  content: SelfAssessmentResponse[]
  totalPages: number
  totalElements: number
  number: number // 현재 페이지 번호
  size: number // 페이지당 개수
}
