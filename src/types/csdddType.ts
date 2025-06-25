export interface SelfAssessmentRequest {
  questionId: string
  answer: 'yes' | 'no' | 'partial'
  category: string
  weight: number

  critical: boolean
  criticalGrade?: 'B/C' | 'B' | 'C' | 'D'
}

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

export interface AnswerConverter {
  fromStringToEnumCompatible: (
    answers: Record<string, string>,
    questions: Question[]
  ) => Array<SelfAssessmentRequest>

  fromBooleanToString: (
    answers: Array<{questionId: string; answer: boolean}>
  ) => Record<string, string>
}

export interface AnalysisData {
  score: number // 정규화 점수 (백분율, 예: 96)
  actualScore: number // 실제 가중치 합 (예: 51)
  totalPossibleScore: number // 전체 가중치 합 (예: 53)
}
