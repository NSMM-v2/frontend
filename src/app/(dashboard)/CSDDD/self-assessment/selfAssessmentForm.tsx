'use client'
import {useState, useEffect} from 'react'
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  Building,
  Send
} from 'lucide-react'

import authService from '@/services/authService'

import {submitSelfAssessmentToBackend} from '@/services/csdddService'
// 질문 데이터 타입 정의
interface Question {
  id: string
  category: string
  text: string
  weight: number
  criticalViolation?: {
    grade: string
    reason: string
  }
}

// 답변 상태 타입
interface Answer {
  questionId: string
  answer: 'yes' | 'no' | ''
  remarks?: string
}

const categories = [
  '인권 및 노동',
  '산업안전·보건',
  '환경경영',
  '공급망 및 조달',
  '윤리경영 및 정보보호'
]

const questions: Question[] = [
  // 인권 및 노동 카테고리
  {
    id: '1.1',
    category: '인권 및 노동',
    text: '18세 미만의 아동노동을 금지하고 있습니까?',
    weight: 2.0,
    criticalViolation: {
      grade: 'D',
      reason: '형사처벌 + ILO 기준 위반 + CSDDD Art.6'
    }
  },
  {
    id: '1.2',
    category: '인권 및 노동',
    text: '강제노동 및 담보노동, 구속노동을 금지하고 있습니까?',
    weight: 2.0
  },
  {
    id: '1.3',
    category: '인권 및 노동',
    text: '성별·인종·국적 등에 의한 차별 금지 정책을 갖추고 있습니까?',
    weight: 1.5
  },
  {
    id: '1.4',
    category: '인권 및 노동',
    text: '직장 내 괴롭힘 및 폭력을 방지하기 위한 정책을 마련하고 있습니까?',
    weight: 1.0,
    criticalViolation: {
      grade: 'C',
      reason: '사회적 평판 리스크 + 반복 시 B → C'
    }
  },
  {
    id: '1.5',
    category: '인권 및 노동',
    text: '근로계약서를 사전에 제공하고 동의를 받고 있습니까?',
    weight: 1.0
  },
  {
    id: '1.6',
    category: '인권 및 노동',
    text: '법정 근로시간 준수, 휴식시간 보장, 초과근무 수당 지급 등을 준수하고 있습니까?',
    weight: 1.5,
    criticalViolation: {
      grade: 'C',
      reason: '반복 위반 시 + 현장점검 필요'
    }
  },
  {
    id: '1.7',
    category: '인권 및 노동',
    text: '결사의 자유 및 단체교섭권을 보장하고 있습니까?',
    weight: 1.0,
    criticalViolation: {
      grade: 'C',
      reason: '노동 기본권 위반으로 C'
    }
  },
  {
    id: '1.8',
    category: '인권 및 노동',
    text: '인권 영향평가를 정기적으로 수행하고 있습니까?',
    weight: 1.5,
    criticalViolation: {
      grade: 'C',
      reason: 'EU 규정 위반, 사업 영향도 중'
    }
  },
  {
    id: '1.9',
    category: '인권 및 노동',
    text: '근로자 고충처리 메커니즘을 갖추고 있습니까?',
    weight: 1.0,
    criticalViolation: {
      grade: 'C',
      reason: '시스템 미비 → B, 고의 누락 → C'
    }
  },

  // 산업안전보건
  {
    id: '2.1',
    category: '산업안전·보건',
    text: '정기적인 안전보건 교육을 실시하고 있습니까?',
    weight: 1.5
  },
  {
    id: '2.2',
    category: '산업안전·보건',
    text: '작업장 내 기계·장비의 안전장치 설치 여부를 확인하고 있습니까?',
    weight: 1.5
  },
  {
    id: '2.3',
    category: '산업안전·보건',
    text: '화재·재난 등 비상 상황 대응 체계 구비 여부를 확인하고 있습니까?',
    weight: 1.5
  },
  {
    id: '2.4',
    category: '산업안전·보건',
    text: '청소년·임산부 등 보호 대상자에 대한 작업 제한 조치를 취하고 있습니까?',
    weight: 1.0,
    criticalViolation: {
      grade: 'C',
      reason: '근기법 위반 및 행정벌 대상'
    }
  },
  {
    id: '2.5',
    category: '산업안전·보건',
    text: '화학물질을 분류·표시하고 적절히 관리하고 있습니까?',
    weight: 1.5,
    criticalViolation: {
      grade: 'C',
      reason: '사고 발생 시 D 전환 가능'
    }
  },
  {
    id: '2.6',
    category: '산업안전·보건',
    text: '근로자 건강검진 실시 및 사후조치 이행 여부를 확인하고 있습니까?',
    weight: 1.5
  },

  // 환경경영
  {
    id: '3.1',
    category: '환경경영',
    text: 'ISO 14001 등 환경경영시스템을 보유하고 있습니까?',
    weight: 2.0
  },
  {
    id: '3.2',
    category: '환경경영',
    text: '온실가스 배출량을 관리하고 감축 계획을 수립하고 있습니까?',
    weight: 1.5,
    criticalViolation: {
      grade: 'B',
      reason: '공시 목적 미달로 B'
    }
  },
  {
    id: '3.3',
    category: '환경경영',
    text: '물 사용량을 절감하거나 재활용하고 있습니까?',
    weight: 1.5
  },
  {
    id: '3.4',
    category: '환경경영',
    text: '대기오염물질 배출을 관리하기 위한 체계를 갖추고 있습니까?',
    weight: 1.0
  },
  {
    id: '3.5',
    category: '환경경영',
    text: '폐기물을 분리 배출하고 감축을 위해 노력하고 있습니까?',
    weight: 1.0
  },
  {
    id: '3.6',
    category: '환경경영',
    text: '공장 운영으로 인해 주변 생태계를 훼손하지 않고 있습니까?',
    weight: 1.0
  },
  {
    id: '3.7',
    category: '환경경영',
    text: '최근 환경 관련 법 위반 이력이 없습니까?',
    weight: 1.5,
    criticalViolation: {
      grade: 'C',
      reason: '이력 존재 시 B, 반복시 C'
    }
  },
  {
    id: '3.8',
    category: '환경경영',
    text: '환경 리스크를 평가하고 그에 대한 대응 계획을 수립하고 있습니까?',
    weight: 1.0
  },

  // 공급망 및 조달
  {
    id: '4.1',
    category: '공급망 및 조달',
    text: '하도급사를 포함한 공급망에 대해 실사를 수행하고 있습니까?',
    weight: 2.0,
    criticalViolation: {
      grade: 'C',
      reason: '공급망 전이 리스크 있음'
    }
  },
  {
    id: '4.2',
    category: '공급망 및 조달',
    text: '공급 계약서에 ESG 관련 조항을 포함하고 있습니까?',
    weight: 1.5
  },
  {
    id: '4.3',
    category: '공급망 및 조달',
    text: '공급망의 추적 가능성을 확보하고 있습니까?',
    weight: 1.5,
    criticalViolation: {
      grade: 'C',
      reason: 'OECD Due Diligence 위반'
    }
  },
  {
    id: '4.4',
    category: '공급망 및 조달',
    text: '분쟁광물이나 고위험 자재의 사용 여부를 점검하고 있습니까?',
    weight: 1.0,
    criticalViolation: {
      grade: 'D',
      reason: 'EU 직접 규제 항목, 수입 금지 가능'
    }
  },
  {
    id: '4.5',
    category: '공급망 및 조달',
    text: '공급망 내 강제노동 리스크에 대한 평가를 이행하고 있습니까?',
    weight: 1.5,
    criticalViolation: {
      grade: 'D',
      reason: 'UFLPA 등 글로벌 수입금지 규정 위반'
    }
  },
  {
    id: '4.6',
    category: '공급망 및 조달',
    text: 'ISO, RBA 등 제3자 인증을 보유하고 있습니까?',
    weight: 1.0
  },
  {
    id: '4.7',
    category: '공급망 및 조달',
    text: '내부 및 외부 제보 시스템을 운영하고 있습니까?',
    weight: 1.5,
    criticalViolation: {
      grade: 'C',
      reason: '내부통제 미비로 C 등급'
    }
  },
  {
    id: '4.8',
    category: '공급망 및 조달',
    text: '공급망 실사 결과에 대한 보고서를 작성하고 있습니까?',
    weight: 1.5,
    criticalViolation: {
      grade: 'C',
      reason: '공시 누락 시 제재 가능'
    }
  },
  {
    id: '4.9',
    category: '공급망 및 조달',
    text: '협력사에 행동강령 및 윤리 기준을 전달하고 있습니까?',
    weight: 1.5
  },

  // 윤리경영 및 정보보호
  {
    id: '5.1',
    category: '윤리경영 및 정보보호',
    text: '사내에 반부패 정책을 수립하고 실행하고 있습니까?',
    weight: 1.5,
    criticalViolation: {
      grade: 'D',
      reason: '형사처벌 대상, 글로벌 리스크 큼'
    }
  },
  {
    id: '5.2',
    category: '윤리경영 및 정보보호',
    text: '이해상충 상황에 대한 사전신고 제도를 운영하고 있습니까?',
    weight: 1.0,
    criticalViolation: {
      grade: 'C',
      reason: '정책 미비로 투명성 저해'
    }
  },
  {
    id: '5.3',
    category: '윤리경영 및 정보보호',
    text: '윤리경영과 관련된 사내 교육을 정기적으로 운영하고 있습니까?',
    weight: 1.0
  },
  {
    id: '5.4',
    category: '윤리경영 및 정보보호',
    text: '기술 및 지식재산권 보호를 위한 정책이 마련되어 있습니까?',
    weight: 1.0
  },
  {
    id: '5.5',
    category: '윤리경영 및 정보보호',
    text: '정보보안 관련 정책과 시스템을 보유하고 있습니까?',
    weight: 1.0,
    criticalViolation: {
      grade: 'C',
      reason: 'GDPR 위반 가능성 높음'
    }
  },
  {
    id: '5.6',
    category: '윤리경영 및 정보보호',
    text: '개인정보를 수집·보관·활용할 때 암호화 등 보호조치를 이행하고 있습니까?',
    weight: 1.0,
    criticalViolation: {
      grade: 'D',
      reason: '벌금 + 형사처벌 대상, GDPR 연계'
    }
  },
  {
    id: '5.7',
    category: '윤리경영 및 정보보호',
    text: '정보 유출 사고 발생 시 대응할 수 있는 프로세스를 수립하고 있습니까?',
    weight: 1.0
  },
  {
    id: '5.8',
    category: '윤리경영 및 정보보호',
    text: 'ESG 전담 인력 또는 책임자를 지정하고 있습니까?',
    weight: 1.0
  }
]

export default function CSAssessmentPage() {
  const [companyName, setCompanyName] = useState('')
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    {}
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    authService
      .getCurrentUserByType()
      .then(res => {
        if (res?.data?.companyName) {
          setCompanyName(res.data.companyName)
        }
      })
      .catch(err => console.error('회사명 로드 실패:', err))
  }, [])

  // 답변 변경 핸들러
  const handleAnswerChange = (
    questionId: string,
    answer: 'yes' | 'no',
    category: string,
    weight: number,
    critical: boolean,
    criticalGrade?: string
  ) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        answer,
        remarks: prev[questionId]?.remarks || ''
      }
    }))
  }

  // 비고 변경 핸들러
  const handleRemarksChange = (questionId: string, remarks: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        answer: prev[questionId]?.answer || '',
        remarks
      }
    }))
  }

  // 카테고리 토글
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  // 진행률 계산
  const calculateProgress = () => {
    const totalQuestions = questions.length
    const answeredQuestions = Object.values(answers).filter(
      answer => answer.answer !== ''
    ).length
    return Math.round((answeredQuestions / totalQuestions) * 100)
  }

  // 카테고리별 질문 그룹화
  const questionsByCategory = questions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = []
    }
    acc[question.category].push(question)
    return acc
  }, {} as Record<string, Question[]>)

  // 카테고리 전체 선택 핸들러
  const handleSelectAllInCategory = (category: string, answer: 'yes' | 'no') => {
    const updatedAnswers = {...answers}
    const categoryQuestions = questionsByCategory[category] || []

    categoryQuestions.forEach(question => {
      updatedAnswers[question.id] = {
        questionId: question.id,
        answer,
        remarks: answers[question.id]?.remarks || ''
      }
    })

    setAnswers(updatedAnswers)
  }

  // 제출 핸들러
  const handleSubmit = async () => {
    const unansweredQuestions = questions.filter(
      q => !answers[q.id] || answers[q.id].answer === ''
    )
    if (unansweredQuestions.length > 0) {
      alert(`모든 질문에 답변해주세요. (미답변: ${unansweredQuestions.length}개)`)
      return
    }

    setIsSubmitting(true)

    try {
      // TypeScript 인터페이스에 맞는 데이터 구조로 변환
      const submissionData = {
        companyName,
        answers: questions
          .map(question => {
            const answerValue = answers[question.id]?.answer
            if (answerValue !== 'yes' && answerValue !== 'no') return null

            return {
              questionId: question.id,
              answer: answerValue as 'yes' | 'no',
              category: question.category,
              weight: question.weight,
              critical: !!question.criticalViolation,
              criticalGrade: question.criticalViolation?.grade,
              remarks: answers[question.id].remarks || undefined
            }
          })
          .filter((item): item is NonNullable<typeof item> => item !== null) // 타입 가드 사용
      }

      console.log('📦 제출 데이터:', submissionData)

      // 실제 API 호출
      await submitSelfAssessmentToBackend(submissionData)

      alert('자가진단이 성공적으로 제출되었습니다!')
    } catch (error) {
      console.error('제출 중 오류 발생:', error)
      alert('제출 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = calculateProgress()

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-4xl px-4 mx-auto">
        {/* 헤더 */}
        <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Building className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">CSDDD 자가진단</h1>
          </div>

          {/* 진행률 표시 */}
          <div className="mb-4">
            <div className="flex justify-between mb-1 text-sm text-gray-600">
              <span>진행률</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 transition-all duration-300 bg-blue-600 rounded-full"
                style={{width: `${progress}%`}}
              />
            </div>
          </div>

          <p className="text-sm text-gray-600">
            총 {questions.length}개 질문에 답변해주세요.
            <span className="ml-1 text-red-600">*</span> 표시는 중요 위반사항입니다.
          </p>
        </div>

        {/* 질문 카테고리별 섹션 */}
        {categories.map(category => {
          const categoryQuestions = questionsByCategory[category] || []
          const isExpanded = expandedCategories[category]
          const answeredInCategory = categoryQuestions.filter(
            q => answers[q.id]?.answer
          ).length

          return (
            <div key={category} className="mb-4 bg-white rounded-lg shadow-sm">
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center justify-between w-full px-6 py-4 transition-colors hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">{category}</h2>
                  <span className="text-sm text-gray-500">
                    ({answeredInCategory}/{categoryQuestions.length})
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200">
                  <div className="flex justify-end gap-2 px-6 py-2">
                    <button
                      onClick={() => handleSelectAllInCategory(category, 'yes')}
                      className="text-sm text-green-600 hover:underline">
                      전체 예
                    </button>
                    <button
                      onClick={() => handleSelectAllInCategory(category, 'no')}
                      className="text-sm text-red-600 hover:underline">
                      전체 아니오
                    </button>
                  </div>
                  {categoryQuestions.map((question, index) => {
                    const answer = answers[question.id]
                    const isCritical = !!question.criticalViolation

                    return (
                      <div
                        key={question.id}
                        className="p-6 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-start gap-3 mb-4">
                          <span className="text-sm font-medium text-gray-500 min-w-[3rem]">
                            {question.id}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-medium text-gray-900">{question.text}</p>
                              {isCritical && (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              )}
                            </div>

                            {isCritical && (
                              <div className="p-3 mb-3 border border-red-200 rounded-md bg-red-50">
                                <p className="text-sm text-red-800">
                                  <strong>
                                    위반 등급: {question.criticalViolation?.grade}
                                  </strong>
                                </p>
                                <p className="mt-1 text-sm text-red-700">
                                  {question.criticalViolation?.reason}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-4 mb-3">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={question.id}
                                  value="yes"
                                  checked={answer?.answer === 'yes'}
                                  onChange={() =>
                                    handleAnswerChange(
                                      question.id,
                                      'yes',
                                      question.category,
                                      question.weight,
                                      isCritical,
                                      question.criticalViolation?.grade
                                    )
                                  }
                                  className="text-green-600 focus:ring-green-500"
                                />
                                <span className="font-medium text-green-700">예</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={question.id}
                                  value="no"
                                  checked={answer?.answer === 'no'}
                                  onChange={() =>
                                    handleAnswerChange(
                                      question.id,
                                      'no',
                                      question.category,
                                      question.weight,
                                      isCritical,
                                      question.criticalViolation?.grade
                                    )
                                  }
                                  className="text-red-600 focus:ring-red-500"
                                />
                                <span className="font-medium text-red-700">아니오</span>
                              </label>
                            </div>

                            <div>
                              <label className="block mb-1 text-sm font-medium text-gray-700">
                                비고 (선택사항)
                              </label>
                              <textarea
                                value={answer?.remarks || ''}
                                onChange={e =>
                                  handleRemarksChange(question.id, e.target.value)
                                }
                                placeholder="추가 설명이나 특이사항을 입력하세요"
                                rows={2}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-500">
                                가중치: {question.weight}
                              </span>
                              {answer?.answer && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* 제출 버튼 */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                총 {questions.length}개 질문 중{' '}
                {Object.values(answers).filter(a => a.answer !== '').length}개 답변 완료
              </p>
              {progress === 100 && (
                <p className="mt-1 text-sm font-medium text-green-600">
                  모든 질문에 답변하였습니다!
                </p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={progress !== 100 || isSubmitting}
              className="flex items-center gap-2 px-6 py-3 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
              <Send className="w-4 h-4" />
              {isSubmitting ? '제출 중...' : '자가진단 제출'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
