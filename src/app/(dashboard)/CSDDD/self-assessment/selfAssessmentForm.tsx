'use client'
import {useState, useEffect} from 'react'
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  Building,
  Send,
  Home,
  ArrowLeft,
  Shield,
  Star,
  Sparkles,
  Activity,
  TrendingUp,
  Clock,
  Users,
  Globe,
  FileText,
  Zap
} from 'lucide-react'
import {motion} from 'framer-motion'

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

const categoryIcons: Record<(typeof categories)[number], React.ComponentType<any>> = {
  '인권 및 노동': Users,
  '산업안전·보건': Shield,
  환경경영: Globe,
  '공급망 및 조달': Activity,
  '윤리경영 및 정보보호': FileText
}

const categoryColors: Record<(typeof categories)[number], string> = {
  '인권 및 노동': 'from-purple-500 to-pink-500',
  '산업안전·보건': 'from-blue-500 to-cyan-500',
  환경경영: 'from-green-500 to-emerald-500',
  '공급망 및 조달': 'from-orange-500 to-red-500',
  '윤리경영 및 정보보호': 'from-indigo-500 to-purple-500'
}

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

// 카테고리별 아이콘/색상 정의 (Toss 스타일)
const categoryMeta = [
  {
    key: '인권 및 노동',
    icon: Users,
    color: 'from-purple-100 to-purple-50',
    activeColor: 'from-purple-500 to-pink-500',
    text: 'text-purple-700',
    bar: 'bg-purple-500'
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
    color: 'from-green-100 to-green-50',
    activeColor: 'from-green-500 to-emerald-500',
    text: 'text-green-700',
    bar: 'bg-green-500'
  },
  {
    key: '공급망 및 조달',
    icon: Activity,
    color: 'from-orange-100 to-orange-50',
    activeColor: 'from-orange-500 to-red-500',
    text: 'text-orange-700',
    bar: 'bg-orange-500'
  },
  {
    key: '윤리경영 및 정보보호',
    icon: FileText,
    color: 'from-indigo-100 to-purple-50',
    activeColor: 'from-indigo-500 to-purple-500',
    text: 'text-indigo-700',
    bar: 'bg-indigo-500'
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

  // 카테고리 클릭 시 해당 섹션으로 이동
  const handleCategoryClick = (category: string) => {
    const idx = categoryMeta.findIndex(c => c.key === category)
    if (idx !== -1) setCurrentCategoryIdx(idx)
  }

  // ============================================================================
  // 카테고리별 섹션 전환 구조 (한 번에 한 섹션만, Toss 스타일)
  // ============================================================================
  const renderCurrentCategorySection = () => {
    const category = currentCategory
    const categoryQuestions = questionsByCategory[category] || []
    const isFirst = currentCategoryIdx === 0
    const isLast = currentCategoryIdx === categoryMeta.length - 1
    const answeredInCategory = categoryQuestions.filter(q => answers[q.id]?.answer).length
    const CategoryIcon = categoryMeta[currentCategoryIdx].icon
    const gradientClass = categoryMeta[currentCategoryIdx].activeColor

    return (
      <motion.div
        key={category}
        initial={{opacity: 0, x: 40}}
        animate={{opacity: 1, x: 0}}
        exit={{opacity: 0, x: -40}}
        transition={{duration: 0.5}}
        className="mb-8">
        {/* Toss 스타일 카테고리 헤더 카드 */}
        <div
          className={`flex items-center p-6 mb-6 text-white bg-gradient-to-br rounded-2xl shadow-md ${gradientClass}`}>
          <div className="flex justify-center items-center mr-4 w-12 h-12 rounded-xl bg-white/20">
            <CategoryIcon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="mb-1 text-xl font-bold">{category}</h3>
            <p className="text-sm opacity-90">
              {categoryQuestions.length}개 질문 • {answeredInCategory}개 답변 완료
            </p>
          </div>
        </div>
        {/* 카테고리별 질문 카드 */}
        <div className="space-y-6">
          {categoryQuestions.map((question, index) => {
            const answer = answers[question.id]
            const isCritical = !!question.criticalViolation
            return (
              <motion.div
                key={question.id}
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: index * 0.05}}
                className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="inline-flex justify-center items-center w-12 h-8 text-sm font-bold text-blue-600 bg-blue-100 rounded-xl border-2 border-blue-200">
                      {question.id}
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start space-x-3">
                      <p className="flex-1 font-medium leading-relaxed text-slate-800">
                        {question.text}
                      </p>
                      {question.criticalViolation && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex-shrink-0 p-1 bg-red-100 rounded-full cursor-help">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs text-sm text-left text-red-800 bg-red-50 rounded-lg border border-red-300 shadow-md">
                              <div className="mb-1 font-semibold">
                                {question.criticalViolation?.grade} 등급 위반
                              </div>
                              <div>{question.criticalViolation?.reason}</div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="flex items-center space-x-6">
                      <label className="flex items-center p-3 space-x-3 rounded-xl transition-colors cursor-pointer group hover:bg-green-50">
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
                          className="w-5 h-5 text-green-600 border-2 border-green-300 focus:ring-green-500 focus:ring-2"
                        />
                        <span className="font-medium text-green-700 transition-colors group-hover:text-green-800">
                          예
                        </span>
                      </label>
                      <label className="flex items-center p-3 space-x-3 rounded-xl transition-colors cursor-pointer group hover:bg-red-50">
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
                          className="w-5 h-5 text-red-600 border-2 border-red-300 focus:ring-red-500 focus:ring-2"
                        />
                        <span className="font-medium text-red-700 transition-colors group-hover:text-red-800">
                          아니오
                        </span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        비고 (선택사항)
                      </label>
                      <textarea
                        value={answer?.remarks || ''}
                        onChange={e => handleRemarksChange(question.id, e.target.value)}
                        placeholder="추가 설명이나 특이사항을 입력하세요"
                        rows={3}
                        className="px-4 py-3 w-full text-sm rounded-2xl border-2 backdrop-blur-sm transition-colors border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 hover:border-slate-300"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="px-3 py-1 text-xs font-medium rounded-full text-slate-600 bg-slate-100">
                          가중치 {question.weight}
                        </div>
                      </div>
                      {answer?.answer && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">완료</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
        {/* 하단 네비게이션 버튼 (이전/다음/제출) */}
        <div className="flex gap-4 justify-between items-center mt-10">
          <button
            onClick={() => setCurrentCategoryIdx(idx => Math.max(0, idx - 1))}
            disabled={isFirst}
            className="px-8 py-4 text-lg font-semibold text-gray-700 bg-gray-100 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:transform-none hover:bg-gray-200">
            이전
          </button>
          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={progress !== 100 || isSubmitting}
              className={`px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none ${
                progress === 100 && !isSubmitting
                  ? 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105'
                  : 'bg-slate-400 text-white cursor-not-allowed'
              }`}>
              {isSubmitting ? '제출 중...' : '자가진단 제출'}
            </button>
          ) : (
            <button
              onClick={() =>
                setCurrentCategoryIdx(idx => Math.min(categoryMeta.length - 1, idx + 1))
              }
              className="px-8 py-4 text-lg font-semibold text-white bg-blue-500 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-blue-600 hover:scale-105">
              다음
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* 브레드크럼 영역 */}
      <div className="p-4 pb-0">
        <div className="flex flex-row items-center p-3 mb-6 text-sm text-gray-600 rounded-xl border shadow-sm backdrop-blur-sm bg-white/80 border-white/50">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <Home className="mr-1 w-4 h-4" />
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

      {/* 페이지 헤더 영역 */}
      <div className="px-4 pb-0">
        <div className="flex flex-row mb-6 w-full">
          <Link
            href="/dashboard"
            className="flex flex-row items-center p-4 space-x-4 rounded-xl backdrop-blur-sm transition-all hover:bg-white/30 group">
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
        {/* 진행률 대시보드 */}
        <div className="p-8 mb-8 rounded-3xl border shadow-xl backdrop-blur-xl bg-white/70 border-white/50 shadow-blue-500/10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">진행 현황</h2>
                <p className="text-slate-600">현재 평가 진행 상태를 확인하세요</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {progress}%
              </div>
              <p className="mt-1 text-sm text-slate-500">완료율</p>
            </div>
          </div>

          {/* 진행률 바 */}
          <div className="relative mb-6">
            <div className="overflow-hidden w-full h-4 bg-gradient-to-r rounded-full shadow-inner from-slate-200 to-slate-300">
              <div
                className="relative h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                style={{width: `${progress}%`}}>
                <div className="absolute inset-0 rounded-full animate-pulse bg-white/20"></div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Zap className="w-4 h-4 text-white animate-pulse" />
            </div>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200/50">
              <div className="mb-1 text-2xl font-bold text-green-600">
                {Object.values(answers).filter(a => a.answer === 'yes').length}
              </div>
              <div className="text-sm text-green-700">준수 항목</div>
            </div>
            <div className="p-4 text-center bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border border-red-200/50">
              <div className="mb-1 text-2xl font-bold text-red-600">
                {Object.values(answers).filter(a => a.answer === 'no').length}
              </div>
              <div className="text-sm text-red-700">미준수 항목</div>
            </div>
            <div className="p-4 text-center bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-200/50">
              <div className="mb-1 text-2xl font-bold text-amber-600">
                {questions.length -
                  Object.values(answers).filter(a => a.answer !== '').length}
              </div>
              <div className="text-sm text-amber-700">미답변 항목</div>
            </div>
          </div>

          {progress === 100 && (
            <div className="p-4 mt-6 text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
              <div className="flex justify-center items-center space-x-2">
                <Star className="w-5 h-5 animate-spin" />
                <span className="font-semibold">
                  모든 질문 답변 완료! 제출할 수 있습니다.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 상단 프로그레스바/카테고리 네비게이션 컴포넌트 (Toss 스타일) */}
        <CategoryProgressBar
          answers={answers}
          currentCategory={currentCategory}
          onCategoryClick={handleCategoryClick}
        />

        {/* 질문 카테고리별 섹션 */}
        {renderCurrentCategorySection()}

        {/* 제출 섹션 */}
        <div className="p-8 bg-gradient-to-br rounded-3xl border shadow-xl backdrop-blur-xl from-white/80 to-slate-50/80 border-white/50 shadow-blue-500/10">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">자가진단 완료</h3>
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>총 {questions.length}개 질문</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-green-600">
                    {Object.values(answers).filter(a => a.answer !== '').length}개 답변
                    완료
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={progress !== 100 || isSubmitting}
              className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                progress === 100 && !isSubmitting
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 hover:shadow-blue-500/40'
                  : 'bg-slate-400 cursor-not-allowed'
              }`}>
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-t-2 animate-spin border-white/20 border-t-white"></div>
                  <span>제출 중...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>자가진단 제출</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ChevronRight 컴포넌트 추가
function ChevronRight({className}: {className?: string}) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  )
}

// ============================================================================
// 상단 프로그레스바/카테고리 네비게이션 컴포넌트 (Toss 스타일)
// ============================================================================
function CategoryProgressBar({
  answers,
  currentCategory,
  onCategoryClick
}: {
  answers: Record<string, Answer>
  currentCategory: string
  onCategoryClick: (category: string) => void
}) {
  return (
    <motion.div
      initial={{opacity: 0, y: -20}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.6}}
      className="flex flex-row gap-2 justify-between items-center px-2 py-4 mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm md:px-8">
      {categoryMeta.map((cat, idx) => {
        // 카테고리별 전체/완료 질문 수 계산
        const total = questions.filter(q => q.category === cat.key).length
        const done = questions.filter(
          q => q.category === cat.key && answers[q.id]?.answer !== ''
        ).length
        const percent = Math.round((done / total) * 100)
        const isActive = currentCategory === cat.key
        const Icon = cat.icon
        return (
          <button
            key={cat.key}
            onClick={() => onCategoryClick(cat.key)}
            className={`flex flex-col items-center flex-1 group transition-all duration-300 ${
              isActive ? 'scale-105' : 'opacity-80 hover:scale-102'
            }`}
            style={{minWidth: 0}}>
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-xl shadow-md mb-2 bg-gradient-to-br ${
                isActive ? cat.activeColor : cat.color
              } transition-all`}>
              <Icon className={`w-6 h-6 ${cat.text}`} />
            </div>
            <span className={`text-xs font-semibold truncate ${cat.text}`}>
              {cat.key}
            </span>
            <div className="overflow-hidden mt-2 w-full h-2 bg-gray-200 rounded-full">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${cat.bar}`}
                style={{width: `${percent}%`}}
              />
            </div>
            <span className="text-[10px] text-gray-500 mt-1">
              {done}/{total}
            </span>
          </button>
        )
      })}
    </motion.div>
  )
}
