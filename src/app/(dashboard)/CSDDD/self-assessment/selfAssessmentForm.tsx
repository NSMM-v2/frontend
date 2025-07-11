'use client'
import toast from '@/util/toast'
import {useState, useEffect, useRef} from 'react'
import {
  AlertTriangle,
  Send,
  Home,
  ArrowLeft,
  Shield,
  Activity,
  TrendingUp,
  Users,
  Globe,
  FileText,
  Zap,
  AlertCircle,
  Eye
} from 'lucide-react'
import {motion, AnimatePresence} from 'framer-motion'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

import Link from 'next/link'
import {PageHeader} from '@/components/layout/PageHeader'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

import authService from '@/services/authService'

import {submitSelfAssessmentToBackend} from '@/services/csdddService'

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

interface Answer {
  questionId: string
  answer: 'yes' | 'no' | ''
}

export const questions: Question[] = [
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

const categoryMeta = [
  {
    key: '인권 및 노동',
    icon: Users,
    color: 'from-blue-100 to-blue-50',
    activeColor: 'from-blue-500 to-cyan-500',
    text: 'text-blue-700',
    bar: 'bg-blue-500'
  },
  {
    key: '산업안전·보건',
    icon: Shield,
    color: 'from-blue-100 to-blue-50',
    activeColor: 'from-blue-500 to-cyan-500',
    text: 'text-blue-700',
    bar: 'bg-blue-500'
  },
  {
    key: '환경경영',
    icon: Globe,
    color: 'from-blue-100 to-blue-50',
    activeColor: 'from-blue-500 to-cyan-500',
    text: 'text-blue-700',
    bar: 'bg-blue-500'
  },
  {
    key: '공급망 및 조달',
    icon: Activity,
    color: 'from-blue-100 to-blue-50',
    activeColor: 'from-blue-500 to-cyan-500',
    text: 'text-blue-700',
    bar: 'bg-blue-500'
  },
  {
    key: '윤리경영 및 정보보호',
    icon: FileText,
    color: 'from-blue-100 to-blue-50',
    activeColor: 'from-blue-500 to-cyan-500',
    text: 'text-blue-700',
    bar: 'bg-blue-500'
  }
]

export default function CSAssessmentPage() {
  const [companyName, setCompanyName] = useState('')
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    {}
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentCategoryIdx, setCurrentCategoryIdx] = useState(0)
  const [showUnansweredModal, setShowUnansweredModal] = useState(false)
  const [unansweredQuestions, setUnansweredQuestions] = useState<Question[]>([])
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const currentCategory = categoryMeta[currentCategoryIdx].key

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
        answer
      }
    }))
  }

  const questionsByCategory = questions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = []
    }
    acc[question.category].push(question)
    return acc
  }, {} as Record<string, Question[]>)

  const moveToUnansweredQuestion = (questionId: string) => {
    const question = questions.find(q => q.id === questionId)
    if (!question) return

    const categoryIdx = categoryMeta.findIndex(c => c.key === question.category)
    if (categoryIdx !== -1) {
      setCurrentCategoryIdx(categoryIdx)

      setTimeout(() => {
        const questionElement = questionRefs.current[questionId]
        if (questionElement) {
          questionElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
          questionElement.classList.add('ring-4', 'ring-amber-300', 'ring-opacity-75')
          setTimeout(() => {
            questionElement.classList.remove(
              'ring-4',
              'ring-amber-300',
              'ring-opacity-75'
            )
          }, 2000)
        }
      }, 500)
    }
    setShowUnansweredModal(false)
  }

  const handleSubmit = async () => {
    const unanswered = questions.filter(
      q => !answers[q.id] || answers[q.id].answer === ''
    )

    if (unanswered.length > 0) {
      setUnansweredQuestions(unanswered)
      setShowUnansweredModal(true)
      return
    }

    setIsSubmitting(true)

    try {
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
              criticalGrade: question.criticalViolation?.grade
            }
          })
          .filter((item): item is NonNullable<typeof item> => item !== null)
      }

      await submitSelfAssessmentToBackend(submissionData)

      toast.success('자가진단이 성공적으로 제출되었습니다!')
      window.location.href = '/CSDDD/evaluation'
    } catch (error) {
      console.error('제출 중 오류 발생:', error)
      toast.error('제출 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCategoryClick = (category: string) => {
    const idx = categoryMeta.findIndex(c => c.key === category)
    if (idx !== -1) setCurrentCategoryIdx(idx)
  }

  const UnansweredQuestionsModal = () => (
    <AnimatePresence>
      {showUnansweredModal && (
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={() => setShowUnansweredModal(false)}>
          <motion.div
            initial={{scale: 0.9, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            exit={{scale: 0.9, opacity: 0}}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    미답변 질문이 있습니다
                  </h3>
                  <p className="text-sm text-slate-600">
                    {unansweredQuestions.length}개의 질문에 답변이 필요합니다
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              <div className="space-y-3">
                {unansweredQuestions.map((question, index) => (
                  <div
                    key={question.id}
                    className="flex items-start justify-between p-4 transition-colors border cursor-pointer bg-amber-50 rounded-xl border-amber-200 hover:bg-amber-100"
                    onClick={() => moveToUnansweredQuestion(question.id)}>
                    <div className="flex-1">
                      <div className="flex items-center mb-2 space-x-2">
                        <span className="px-2 py-1 text-xs font-bold rounded-lg text-amber-700 bg-amber-200">
                          {question.id}
                        </span>
                        <span className="text-xs font-medium text-amber-600">
                          {question.category}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700">
                        {question.text}
                      </p>
                    </div>
                    <Eye className="flex-shrink-0 w-5 h-5 ml-3 text-amber-600" />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowUnansweredModal(false)}
                  className="flex-1 px-4 py-3 font-medium transition-colors bg-white border border-gray-300 rounded-xl text-slate-600 hover:bg-gray-50">
                  닫기
                </button>
                <button
                  onClick={() => moveToUnansweredQuestion(unansweredQuestions[0]?.id)}
                  className="flex-1 px-4 py-3 font-medium text-white transition-colors bg-amber-500 rounded-xl hover:bg-amber-600">
                  첫 번째 미답변으로 이동
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const renderCurrentCategorySection = () => {
    const category = currentCategory
    const categoryQuestions = questionsByCategory[category] || []
    const isFirst = currentCategoryIdx === 0
    const isLast = currentCategoryIdx === categoryMeta.length - 1

    return (
      <motion.div
        key={category}
        initial={{opacity: 0, x: 40}}
        animate={{opacity: 1, x: 0}}
        exit={{opacity: 0, x: -40}}
        transition={{duration: 0.5}}
        className="mb-2">
        <div className="flex justify-end mb-2">
          <button
            onClick={() => {
              const categoryQuestions = questionsByCategory[currentCategory] || []
              const updatedAnswers = {...answers}
              categoryQuestions.forEach(q => {
                updatedAnswers[q.id] = {
                  questionId: q.id,
                  answer: 'yes'
                }
              })
              setAnswers(updatedAnswers)
            }}
            className="px-4 py-2 text-sm font-semibold text-white transition-all bg-blue-500 rounded-lg shadow hover:bg-blue-600">
            모두 예 선택
          </button>
        </div>
        <div className="space-y-3">
          {categoryQuestions.map((question, index) => {
            const answer = answers[question.id]
            const isCritical = !!question.criticalViolation
            const isAnswered = answer?.answer !== '' && answer?.answer

            return (
              <motion.div
                key={question.id}
                ref={el => {
                  questionRefs.current[question.id] = el
                }}
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: index * 0.05}}
                className={`relative p-2 transition-all bg-white border rounded-lg shadow hover:shadow-md transform hover:-translate-y-0.5 ${
                  isAnswered
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center justify-center w-12 h-8 text-xs font-bold text-blue-600 bg-blue-100 border-2 border-blue-200 rounded-lg shadow-sm">
                      {question.id}
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between w-full">
                      <p className="flex-1 pr-4 text-base font-bold leading-relaxed text-left text-slate-800">
                        {question.text}
                      </p>
                      <div className="flex items-center flex-shrink-0 space-x-2">
                        {question.criticalViolation && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex-shrink-0 p-1.5 bg-red-100 rounded-full shadow-sm cursor-help">
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs text-sm text-left text-red-800 border border-red-300 rounded-lg shadow-md bg-red-50">
                                <div className="mb-1 font-semibold">
                                  {question.criticalViolation?.grade} 등급 위반
                                </div>
                                <div>{question.criticalViolation?.reason}</div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <div className="px-2 py-0.5 text-[11px] font-medium rounded-full shadow-sm text-slate-600 bg-slate-100">
                          가중치 {question.weight}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <label className="flex items-center px-2 py-1 space-x-2 transition-all border-2 border-transparent cursor-pointer rounded-2xl group hover:bg-blue-50 hover:border-blue-200">
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
                          className="w-6 h-6 border-2 border-blue-300 rounded-full shadow-sm appearance-none cursor-pointer checked:bg-blue-300 checked:ring-2 checked:ring-blue-100"
                        />
                        <span className="text-xs font-medium text-blue-600 transition-colors group-hover:text-blue-700">
                          예
                        </span>
                      </label>

                      <label className="flex items-center px-2 py-1 space-x-2 transition-all border-2 border-transparent cursor-pointer rounded-2xl group hover:bg-blue-50 hover:border-blue-200">
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
                          className="w-6 h-6 border-2 border-blue-300 rounded-full shadow-sm appearance-none cursor-pointer checked:bg-blue-300 checked:ring-2 checked:ring-blue-100"
                        />
                        <span className="text-xs font-medium text-blue-600 transition-colors group-hover:text-blue-700">
                          아니오
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="flex items-center justify-between gap-3 mt-12">
          <button
            onClick={() => {
              setCurrentCategoryIdx(idx => Math.max(0, idx - 1))
              window.scrollTo({top: 0, behavior: 'smooth'})
            }}
            disabled={isFirst}
            className="flex items-center px-8 py-4 space-x-3 text-sm font-semibold text-gray-700 transition-all duration-300 bg-white border-2 border-gray-300 shadow-lg rounded-2xl hover:shadow-xl disabled:opacity-50 disabled:transform-none hover:bg-gray-50 hover:-translate-y-1">
            <ArrowLeft className="w-3 h-3" />
            <span>이전</span>
          </button>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex items-center space-x-3 px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 ${
                isSubmitting
                  ? 'text-white cursor-not-allowed bg-slate-400'
                  : 'text-white bg-blue-500 hover:bg-blue-600'
              }`}>
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-t-2 rounded-full animate-spin border-white/20 border-t-white"></div>
                  <span>제출 중...</span>
                </>
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  <span>자가진단 제출</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => {
                setCurrentCategoryIdx(idx => Math.min(categoryMeta.length - 1, idx + 1))
                window.scrollTo({top: 0, behavior: 'smooth'})
              }}
              className="flex items-center px-8 py-4 space-x-3 text-sm font-semibold text-white transition-all duration-300 bg-blue-500 shadow-lg rounded-2xl hover:shadow-xl hover:bg-blue-600 hover:-translate-y-1">
              <span>다음</span>
              <ArrowLeft className="w-3 h-3 rotate-180" />
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <UnansweredQuestionsModal />

      <div className="p-4 pb-0">
        <div className="flex flex-row items-center p-4 mb-4 text-sm text-gray-600 border shadow-sm rounded-2xl backdrop-blur-sm bg-white/90 border-white/50">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <Home className="w-4 h-4 mr-1" />
                <BreadcrumbLink
                  href="/dashboard"
                  className="transition-colors hover:text-blue-600">
                  대시보드
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/CSDDD"
                  className="transition-colors hover:text-blue-600">
                  CSDDD
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="font-bold text-blue-600">자가진단 결과</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="px-4 pb-0">
        <div className="flex flex-row w-full mb-4">
          <Link
            href="/CSDDD"
            className="flex flex-row items-center p-4 space-x-4 transition-all rounded-2xl backdrop-blur-sm hover:bg-white/30 group">
            <ArrowLeft className="w-6 h-6 text-gray-500 transition-colors group-hover:text-blue-600" />
            <PageHeader
              icon={<Shield className="w-6 h-6 text-blue-600" />}
              title="CSDDD 자가진단 시스템"
              description="유럽연합 공급망 실사 지침 준수를 위한 종합 평가 시스템"
              module="CSDDD"
              submodule="assessment"
            />
          </Link>
        </div>
      </div>

      <div className="flex-1 px-4 pb-8">
        <div className="p-4 mb-4 border shadow-xl rounded-3xl backdrop-blur-xl bg-white/70 border-white/50 shadow-blue-500/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-500 shadow-lg rounded-xl">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">진행 현황</h2>
                <p className="text-sm text-slate-500">현재 평가 진행 상태를 확인하세요</p>
              </div>
            </div>
          </div>

          <div className="relative mb-4">
            {(() => {
              const totalQuestions = questions.length
              const answeredQuestions = Object.values(answers).filter(
                answer => answer.answer !== ''
              ).length
              const progress = Math.round((answeredQuestions / totalQuestions) * 100)
              return (
                <>
                  <div className="w-full h-3 overflow-hidden rounded-full shadow-inner bg-gradient-to-r from-slate-200 to-slate-300">
                    <div
                      className="relative h-full transition-all duration-1000 ease-out rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      style={{width: `${progress}%`}}>
                      <div className="absolute inset-0 rounded-full animate-pulse bg-white/20"></div>
                    </div>
                  </div>
                  <div className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                    <Zap className="w-3 h-3 text-white animate-pulse" />
                  </div>
                </>
              )
            })()}
          </div>

          <div className="flex flex-row items-center justify-between gap-2 px-2 py-3 mt-1 bg-white border border-gray-100 shadow-sm rounded-2xl md:px-8">
            {categoryMeta.map((cat, idx) => {
              const total = questions.filter(q => q.category === cat.key).length
              const done = questions.filter(
                q => q.category === cat.key && answers[q.id]?.answer !== ''
              ).length
              const isActive = currentCategory === cat.key
              const Icon = cat.icon
              return (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryClick(cat.key)}
                  className={`flex flex-col items-center flex-1 group transition-all duration-300 ${
                    isActive ? 'scale-105' : 'opacity-80 hover:scale-102'
                  }`}
                  style={{minWidth: 0}}>
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl shadow-md mb-1 ${
                      isActive ? 'bg-blue-500' : 'bg-slate-200'
                    } transition-all`}>
                    <Icon
                      className={`w-7 h-7 ${isActive ? 'text-white' : 'text-slate-600'}`}
                    />
                  </div>
                  <span className={`text-[15px] font-semibold truncate ${cat.text}`}>
                    {cat.key}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {renderCurrentCategorySection()}
      </div>
    </div>
  )
}
