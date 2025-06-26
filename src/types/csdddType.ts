// 각 문항 응답 구조
export interface SelfAssessmentRequest {
  questionId: string
  answer: 'yes' | 'no' | 'partial'
  category: string
  weight: number
  critical: boolean
  criticalGrade?: 'B/C' | 'B' | 'C' | 'D'
}

// 전체 자가진단 제출 요청 구조 (회사명 + 문항 응답 리스트)
export interface SelfAssessmentSubmissionRequest {
  companyName: string
  answers: SelfAssessmentRequest[]
}

// 질문 정의
export interface Question {
  id: string
  category: string
  text: string
  weight: number
  criticalViolation?: {
    grade: 'D' | 'C' | 'B' | 'B/C'
    reason: string
  }
}

// 응답 변환기 인터페이스
export interface AnswerConverter {
  fromStringToEnumCompatible: (
    answers: Record<string, string>,
    questions: Question[]
  ) => Array<SelfAssessmentRequest>

  fromBooleanToString: (
    answers: Array<{questionId: string; answer: boolean}>
  ) => Record<string, string>
}

// 분석 결과 (점수 관련)
export interface AnalysisData {
  score: number // 정규화 점수 (백분율)
  actualScore: number // 실제 점수 (가중치 적용)
  totalPossibleScore: number // 총 가중치
}

// 위반 항목 정보
export interface ViolationItem {
  questionId: string
  questionText: string
  answer: 'YES' | 'NO' | 'PARTIAL'
  violationGrade: string
  violationReason: string
  penaltyInfo: string
  legalBasis: string
  category: string
  criticalViolation: boolean
  remarks?: string | null
}

// 백엔드 응답에서 사용하는 별칭
export type SelfAssessmentAnswer = SelfAssessmentRequest
