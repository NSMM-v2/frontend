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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import {PageHeader} from '@/components/layout/PageHeader'
import Link from 'next/link'
// 타입 정의
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

export default function CSAssessmentPage() {
  const [companyName, setCompanyName] = useState('테스트 회사')
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    {}
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      await new Promise(resolve => setTimeout(resolve, 2000))
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
    <div className="flex flex-col w-full min-h-screen">
      {/* 브레드크럼 영역 */}
      <div className="p-4 pb-0">
        <div className="flex flex-row items-center p-3 mb-6 text-sm text-gray-600 border shadow-sm bg-white/80 backdrop-blur-sm rounded-xl border-white/50">
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
                <span className="font-bold text-blue-600">자가진단</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* 페이지 헤더 영역 */}
      <div className="px-4 pb-0">
        <div className="flex flex-row w-full mb-6">
          <Link
            href="/dashboard"
            className="flex flex-row items-center p-4 space-x-4 transition-all rounded-xl hover:bg-white/30 backdrop-blur-sm group">
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
        <div className="p-8 mb-8 border shadow-xl bg-white/70 backdrop-blur-xl rounded-3xl border-white/50 shadow-blue-500/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">진행 현황</h2>
                <p className="text-slate-600">현재 평가 진행 상태를 확인하세요</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
                {progress}%
              </div>
              <p className="mt-1 text-sm text-slate-500">완료율</p>
            </div>
          </div>

          {/* 진행률 바 */}
          <div className="relative mb-6">
            <div className="w-full h-4 overflow-hidden rounded-full shadow-inner bg-gradient-to-r from-slate-200 to-slate-300">
              <div
                className="relative h-full transition-all duration-1000 ease-out rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                style={{width: `${progress}%`}}>
                <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
              <Zap className="w-4 h-4 text-white animate-pulse" />
            </div>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 text-center border bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-green-200/50">
              <div className="mb-1 text-2xl font-bold text-green-600">
                {Object.values(answers).filter(a => a.answer === 'yes').length}
              </div>
              <div className="text-sm text-green-700">준수 항목</div>
            </div>
            <div className="p-4 text-center border bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border-red-200/50">
              <div className="mb-1 text-2xl font-bold text-red-600">
                {Object.values(answers).filter(a => a.answer === 'no').length}
              </div>
              <div className="text-sm text-red-700">미준수 항목</div>
            </div>
            <div className="p-4 text-center border bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border-amber-200/50">
              <div className="mb-1 text-2xl font-bold text-amber-600">
                {questions.length -
                  Object.values(answers).filter(a => a.answer !== '').length}
              </div>
              <div className="text-sm text-amber-700">미답변 항목</div>
            </div>
          </div>

          {progress === 100 && (
            <div className="p-4 mt-6 text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
              <div className="flex items-center justify-center space-x-2">
                <Star className="w-5 h-5 animate-spin" />
                <span className="font-semibold">
                  모든 질문 답변 완료! 제출할 수 있습니다.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 질문 카테고리별 섹션 */}
        {categories.map((category, categoryIndex) => {
          const categoryQuestions = questionsByCategory[category] || []
          const isExpanded = expandedCategories[category]
          const answeredInCategory = categoryQuestions.filter(
            q => answers[q.id]?.answer
          ).length
          const CategoryIcon = categoryIcons[category]
          const gradientClass = categoryColors[category]

          return (
            <div
              key={category}
              className="mb-6 overflow-hidden transition-all duration-300 border shadow-xl bg-white/70 backdrop-blur-xl rounded-3xl border-white/50 shadow-blue-500/5 hover:shadow-2xl hover:shadow-blue-500/10"
              style={{animationDelay: `${categoryIndex * 100}ms`}}>
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center justify-between w-full p-6 transition-all duration-300 hover:bg-white/50 group">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 bg-gradient-to-br ${gradientClass} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <CategoryIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold transition-colors text-slate-800 group-hover:text-blue-600">
                      {category}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {categoryQuestions.length}개 질문
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-800">
                        {answeredInCategory}/{categoryQuestions.length}
                      </div>
                      <div className="text-xs text-slate-500">답변 완료</div>
                    </div>
                    {answeredInCategory === categoryQuestions.length &&
                      categoryQuestions.length > 0 && (
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                  </div>
                  <div className="p-2 transition-colors rounded-full bg-slate-100 group-hover:bg-blue-100">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 transition-colors text-slate-600 group-hover:text-blue-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 transition-colors text-slate-600 group-hover:text-blue-600" />
                    )}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-200/60">
                  <div className="flex justify-end gap-3 px-6 py-4 bg-gradient-to-r from-slate-50/50 to-slate-100/50">
                    <button
                      onClick={() => handleSelectAllInCategory(category, 'yes')}
                      className="px-4 py-2 text-sm font-medium text-green-700 transition-all duration-200 bg-green-100 shadow-sm hover:bg-green-200 rounded-xl hover:scale-105 hover:shadow-md">
                      전체 예
                    </button>
                    <button
                      onClick={() => handleSelectAllInCategory(category, 'no')}
                      className="px-4 py-2 text-sm font-medium text-red-700 transition-all duration-200 bg-red-100 shadow-sm hover:bg-red-200 rounded-xl hover:scale-105 hover:shadow-md">
                      전체 아니오
                    </button>
                  </div>

                  {categoryQuestions.map((question, index) => {
                    const answer = answers[question.id]
                    const isCritical = !!question.criticalViolation

                    return (
                      <div
                        key={question.id}
                        className="p-6 transition-all duration-200 border-b border-slate-200/60 last:border-b-0 hover:bg-white/30">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="inline-flex items-center justify-center w-12 h-8 text-sm font-bold text-blue-600 bg-blue-100 border-2 border-blue-200 rounded-xl">
                              {question.id}
                            </div>
                          </div>

                          <div className="flex-1 space-y-4">
                            <div className="flex items-start space-x-3">
                              <p className="flex-1 font-medium leading-relaxed text-slate-800">
                                {question.text}
                              </p>
                              {isCritical && (
                                <div className="flex-shrink-0 p-1 bg-red-100 rounded-full">
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                </div>
                              )}
                            </div>

                            {isCritical && (
                              <div className="p-4 border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl">
                                <div className="flex items-center mb-2 space-x-2">
                                  <div className="px-3 py-1 text-xs font-bold text-red-900 bg-red-200 rounded-full">
                                    {question.criticalViolation?.grade} 등급
                                  </div>
                                </div>
                                <p className="text-sm text-red-700">
                                  {question.criticalViolation?.reason}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center space-x-6">
                              <label className="flex items-center p-3 space-x-3 transition-colors cursor-pointer group rounded-xl hover:bg-green-50">
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
                              <label className="flex items-center p-3 space-x-3 transition-colors cursor-pointer group rounded-xl hover:bg-red-50">
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
                                onChange={e =>
                                  handleRemarksChange(question.id, e.target.value)
                                }
                                placeholder="추가 설명이나 특이사항을 입력하세요"
                                rows={3}
                                className="w-full px-4 py-3 text-sm transition-colors border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm hover:border-slate-300"
                              />
                            </div>

                            <div className="flex items-center justify-between">
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
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* 제출 섹션 */}
        <div className="p-8 border shadow-xl bg-gradient-to-br from-white/80 to-slate-50/80 backdrop-blur-xl rounded-3xl border-white/50 shadow-blue-500/10">
          <div className="flex items-center justify-between">
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
                  <div className="w-5 h-5 border-2 border-t-2 rounded-full border-white/20 border-t-white animate-spin"></div>
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
