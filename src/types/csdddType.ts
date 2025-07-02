/**
 * 자가진단 제출 요청 타입
 */
export interface SelfAssessmentSubmissionRequest {
  companyName: string // 누락된 필드 추가
  answers: SelfAssessmentAnswerRequest[]
}

/**
 * 자가진단 문항 제출 요청 타입 (백엔드 DTO와 일치)
 */
export interface SelfAssessmentAnswerRequest {
  questionId: string
  category: string
  answer: 'yes' | 'no'
  weight: number
  critical?: boolean
  criticalGrade?: string
  remarks?: string
}

/**
 * 자가진단 문항 응답 타입 (백엔드에서 받는 데이터)
 */
export interface SelfAssessmentAnswerResponse {
  id: number
  questionId: string
  category: string
  answer: boolean // 백엔드에서는 boolean으로 응답
  remarks?: string
  weight: number
  earnedScore: number
  criticalViolation: boolean
  hasCriticalViolation: boolean
  criticalGrade?: string
  createdAt: string
  updatedAt: string
}

/**
 * 자가진단 결과 응답 타입
 */
export interface SelfAssessmentResponse {
  // 기본 식별 정보
  id: number
  companyName: string
  userType: string

  // 사용자 식별 정보
  headquartersId: number
  partnerId?: number | null
  treePath: string

  // 평가 점수 정보
  score: number
  actualScore: number
  totalPossibleScore: number
  completionRate: number

  // 평가 상태 및 결과 정보
  status: string
  finalGrade?: string
  criticalViolationCount: number
  noAnswerCount: number
  isHighRisk: boolean
  summary?: string
  recommendations?: string

  // 타임스탬프
  createdAt: string
  updatedAt: string
  completedAt?: string

  // 상세 정보 (상세 조회 시에만)
  answers?: SelfAssessmentAnswerResponse[]
  categoryAnalysis?: CategoryAnalysisDto[]
  strengths?: string[]
  actionPlan?: ActionPlanDto[]
}

/**
 * 카테고리별 분석 결과 타입
 */
export interface CategoryAnalysisDto {
  category: string
  score: number
  status: string
  color: string
}

/**
 * 개선 계획 제안 타입
 */
export interface ActionPlanDto {
  issue: string
  priority: string
  recommendation: string
}

/**
 * 페이징 응답 타입
 */
export interface PaginatedSelfAssessmentResponse {
  content: SelfAssessmentResponse[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  first: boolean
  last: boolean
  empty: boolean
}

/**
 * 중대위반 메타데이터 타입
 */
export interface ViolationMeta {
  category: string
  penaltyInfo: string
  legalBasis: string
}

/**
 * API 응답 공통 타입
 */
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errorCode?: string
  errors?: string[]
  timestamp: string
}

/**
 * 자가진단 관련 타입 별칭 (하위 호환성)
 */
export type SelfAssessmentAnswerItem = SelfAssessmentAnswerRequest
export type SelfAssessmentFullResponse = SelfAssessmentResponse
