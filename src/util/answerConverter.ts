import {AnswerConverter, SelfAssessmentRequest} from '@/types/csdddType'
import {Question} from '@/types/csdddType'

export type AnswerValue = 'yes' | 'no' | 'partial'

const isValidAnswer = (value: any): value is AnswerValue => {
  return (
    typeof value === 'string' && ['yes', 'no', 'partial'].includes(value.toLowerCase())
  )
}

const normalizeAnswerValue = (value: any): AnswerValue => {
  if (typeof value !== 'string') {
    throw new Error(`답변은 문자열이어야 합니다. 받은 타입: ${typeof value}`)
  }

  const normalized = value.toLowerCase().trim()

  if (!isValidAnswer(normalized)) {
    throw new Error(`유효하지 않은 답변입니다: "${value}". 가능한 값: yes, no, partial`)
  }

  return normalized as AnswerValue
}

export interface ExtendedBooleanAnswer {
  questionId: string
  answer: boolean | 'partial'
}

export const answerConverter: AnswerConverter = {
  fromStringToEnumCompatible: (
    answers: Record<string, string>,
    questions: Question[]
  ): SelfAssessmentRequest[] => {
    if (!answers || typeof answers !== 'object') {
      throw new Error('답변 데이터가 올바르지 않습니다.')
    }

    const results: SelfAssessmentRequest[] = []
    const errors: string[] = []

    Object.entries(answers).forEach(([questionId, value]) => {
      try {
        if (!questionId || typeof questionId !== 'string' || questionId.trim() === '') {
          errors.push(`유효하지 않은 질문 ID: ${questionId}`)
          return
        }

        if (value === null || value === undefined) {
          errors.push(`질문 ${questionId}: 답변이 null 또는 undefined입니다.`)
          return
        }

        const normalizedAnswer = normalizeAnswerValue(value)

        const matchedQuestion = questions.find(q => q.id === questionId)
        const category = matchedQuestion?.category ?? 'UNKNOWN'

        results.push({
          questionId: questionId.trim(),
          answer: normalizedAnswer,
          category,
          weight: matchedQuestion?.weight ?? 1,
          critical: matchedQuestion?.criticalViolation !== undefined,
          criticalGrade: matchedQuestion?.criticalViolation?.grade ?? undefined
        })
      } catch (error) {
        errors.push(
          `질문 ${questionId}: ${
            error instanceof Error ? error.message : '알 수 없는 오류'
          }`
        )
      }
    })

    if (errors.length > 0) {
      throw new Error(`답변 변환 중 오류가 발생했습니다:\n${errors.join('\n')}`)
    }

    if (results.length === 0) {
      throw new Error('변환할 수 있는 유효한 답변이 없습니다.')
    }

    return results
  },

  fromBooleanToString: (
    answers: Array<{questionId: string; answer: boolean}>
  ): Record<string, string> => {
    if (!Array.isArray(answers)) {
      throw new Error('답변은 배열 형태여야 합니다.')
    }

    const result: Record<string, string> = {}
    const errors: string[] = []

    answers.forEach((item, index) => {
      try {
        if (!item || typeof item !== 'object') {
          errors.push(`인덱스 ${index}: 유효하지 않은 답변 객체`)
          return
        }

        const {questionId, answer} = item

        if (!questionId || typeof questionId !== 'string') {
          errors.push(`인덱스 ${index}: 유효하지 않은 질문 ID: ${questionId}`)
          return
        }

        if (typeof answer !== 'boolean') {
          errors.push(
            `인덱스 ${index}: 답변은 boolean 타입이어야 합니다. 받은 타입: ${typeof answer}`
          )
          return
        }

        result[questionId.trim()] = answer ? 'yes' : 'no'
      } catch (error) {
        errors.push(
          `인덱스 ${index}: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        )
      }
    })

    if (errors.length > 0) {
      throw new Error(`boolean 답변 변환 중 오류가 발생했습니다:\n${errors.join('\n')}`)
    }

    return result
  }
}

export const extendedAnswerConverter = {
  fromExtendedBooleanToString: (
    answers: ExtendedBooleanAnswer[]
  ): Record<string, string> => {
    if (!Array.isArray(answers)) {
      throw new Error('답변은 배열 형태여야 합니다.')
    }

    const result: Record<string, string> = {}
    const errors: string[] = []

    answers.forEach((item, index) => {
      try {
        if (!item || typeof item !== 'object') {
          errors.push(`인덱스 ${index}: 유효하지 않은 답변 객체`)
          return
        }

        const {questionId, answer} = item

        if (!questionId || typeof questionId !== 'string') {
          errors.push(`인덱스 ${index}: 유효하지 않은 질문 ID: ${questionId}`)
          return
        }

        if (answer === 'partial') {
          result[questionId.trim()] = 'partial'
        } else if (typeof answer === 'boolean') {
          result[questionId.trim()] = answer ? 'yes' : 'no'
        } else {
          errors.push(
            `인덱스 ${index}: 답변은 boolean 또는 'partial'이어야 합니다. 받은 값: ${answer}`
          )
        }
      } catch (error) {
        errors.push(
          `인덱스 ${index}: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        )
      }
    })

    if (errors.length > 0) {
      throw new Error(`확장된 답변 변환 중 오류가 발생했습니다:\n${errors.join('\n')}`)
    }

    return result
  },

  fromStringToExtendedBoolean: (
    answers: Record<string, string>
  ): ExtendedBooleanAnswer[] => {
    if (!answers || typeof answers !== 'object') {
      throw new Error('답변 데이터가 올바르지 않습니다.')
    }

    const results: ExtendedBooleanAnswer[] = []
    const errors: string[] = []

    Object.entries(answers).forEach(([questionId, value]) => {
      try {
        if (!questionId || typeof questionId !== 'string') {
          errors.push(`유효하지 않은 질문 ID: ${questionId}`)
          return
        }

        const normalizedValue = normalizeAnswerValue(value)

        let answer: boolean | 'partial'
        switch (normalizedValue) {
          case 'yes':
            answer = true
            break
          case 'no':
            answer = false
            break
          case 'partial':
            answer = 'partial'
            break
          default:
            throw new Error(`예상하지 못한 답변 값: ${normalizedValue}`)
        }

        results.push({
          questionId: questionId.trim(),
          answer
        })
      } catch (error) {
        errors.push(
          `질문 ${questionId}: ${
            error instanceof Error ? error.message : '알 수 없는 오류'
          }`
        )
      }
    })

    if (errors.length > 0) {
      throw new Error(`확장된 boolean 변환 중 오류가 발생했습니다:\n${errors.join('\n')}`)
    }

    return results
  }
}

export const answerUtils = {
  isEmpty: (answers: SelfAssessmentRequest[]): boolean => {
    return !answers || answers.length === 0
  },

  findAnswer: (
    answers: SelfAssessmentRequest[],
    questionId: string
  ): AnswerValue | undefined => {
    const answer = answers.find(a => a.questionId === questionId)
    return answer?.answer
  },

  getAnswerStats: (answers: SelfAssessmentRequest[]) => {
    const stats = {
      total: answers.length,
      yes: 0,
      no: 0,
      partial: 0
    }

    answers.forEach(answer => {
      stats[answer.answer]++
    })

    return {
      ...stats,
      yesPercentage: stats.total > 0 ? (stats.yes / stats.total) * 100 : 0,
      noPercentage: stats.total > 0 ? (stats.no / stats.total) * 100 : 0,
      partialPercentage: stats.total > 0 ? (stats.partial / stats.total) * 100 : 0
    }
  },

  validateAnswers: (
    answers: SelfAssessmentRequest[]
  ): {isValid: boolean; errors: string[]} => {
    const errors: string[] = []

    if (!Array.isArray(answers)) {
      return {isValid: false, errors: ['답변은 배열 형태여야 합니다.']}
    }

    if (answers.length === 0) {
      return {isValid: false, errors: ['최소 하나의 답변이 필요합니다.']}
    }

    const questionIds = new Set<string>()

    answers.forEach((answer, index) => {
      if (!answer || typeof answer !== 'object') {
        errors.push(`인덱스 ${index}: 유효하지 않은 답변 객체`)
        return
      }

      const {questionId, answer: answerValue} = answer

      if (!questionId || typeof questionId !== 'string') {
        errors.push(`인덱스 ${index}: 유효하지 않은 질문 ID`)
        return
      }

      if (questionIds.has(questionId)) {
        errors.push(`중복된 질문 ID: ${questionId}`)
        return
      }

      questionIds.add(questionId)

      if (!isValidAnswer(answerValue)) {
        errors.push(`질문 ${questionId}: 유효하지 않은 답변 값 "${answerValue}"`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}
