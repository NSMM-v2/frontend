'use client'

const normalizeCategory = (name: string) => name.replace('·', ' ').trim()

import {useEffect, useState} from 'react'

import {DollarSign, FileText, Home, Scale} from 'lucide-react'
import {PageHeader} from '@/components/layout/PageHeader'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import Link from 'next/link'
// import {fetchFullSelfAssessmentResult} from '@/services/csdddService'
// import {fetchViolationItems} from '@/services/csdddService'
// import type {ViolationItem} from '@/types/csdddType'
// import type {SelfAssessmentAnswer} from '@/types/csdddType'
import {Card} from '@/components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle2,
  Users,
  Building,
  Leaf,
  Gavel,
  ShieldCheck,
  ThumbsUp,
  AlertCircle,
  HelpCircle,
  ArrowLeft
} from 'lucide-react'
const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'A':
      return 'border-green-500 bg-green-50 text-green-700'
    case 'B':
      return 'border-yellow-500 bg-yellow-50 text-yellow-700'
    case 'C':
      return 'border-orange-400 bg-orange-50 text-orange-700'
    case 'D':
      return 'border-red-500 bg-red-50 text-red-700'
    default:
      return 'border-gray-300 bg-gray-50 text-gray-700'
  }
}

const getGradeIcon = (grade: string) => {
  switch (grade) {
    case 'A':
      return <ShieldCheck className="w-8 h-8 text-green-600" />
    case 'B':
      return <ThumbsUp className="w-8 h-8 text-yellow-600" />
    case 'C':
      return <AlertCircle className="w-8 h-8 text-orange-500" />
    case 'D':
      return <AlertTriangle className="w-8 h-8 text-red-600" />
    default:
      return <HelpCircle className="w-8 h-8 text-gray-500" />
  }
}

interface Question {
  id: string
  category: string
  text: string
  weight: number
  criticalViolation?: {
    grade: 'D' | 'C' | 'B' | 'B/C'
    reason: string
  }
}

interface AnalysisData {
  timestamp: string
  finalGrade: string
  baseScore: number
  totalPossibleScore: number
  actualScore: number
  grade: string
  summary: string
  recommendations: string
  criticalViolations?: Array<{
    questionId: string
    questionText: string
    answer: 'YES' | 'NO' | 'PARTIAL'
    criticalViolation: boolean
    violationGrade: string
    violationReason: string
    penaltyInfo: string
    legalBasis: string
    category: string
  }>
  // categoryScores is deprecated, replaced by categoryAnalysis
  categoryAnalysis?: Array<{
    category: string
    score: number
    status?: string // e.g., '우수', '보통', '개선 필요'
    color?: string // e.g., 'green', 'yellow', 'red'
    // other fields as needed
  }>
  strengths?: Array<{
    category: string
    score: number
    status?: string
    color?: string
  }>
  answers?: Record<string, string>
  gradeInfo: {
    color: string
    description: string
    action: string
  }
  actionPlan?: ActionPlan[]
}

type ActionPlan = {
  priority: string
  title: string
  description: string
  // color?: string
  // timeline?: string
  items?: string[]
}

const categories = [
  {name: '인권 및 노동', icon: Users, color: 'from-red-500 to-pink-500'},
  {name: '산업안전·보건', icon: Shield, color: 'from-orange-500 to-red-500'},
  {name: '환경경영', icon: Leaf, color: 'from-green-500 to-emerald-500'},
  {name: '공급망 및 조달', icon: Building, color: 'from-blue-500 to-indigo-500'},
  {name: '윤리경영 및 정보보호', icon: Gavel, color: 'from-purple-500 to-indigo-500'}
]

// Desired order for category rendering
const desiredOrder = [
  '인권 및 노동',
  '산업안전 보건',
  '환경경영',
  '공급망 및 조달',
  '윤리경영 및 정보보호'
]

const improvementTemplates = {
  '인권 및 노동': [
    '인권 정책 수립 및 공표',
    '정기적인 인권 영향평가 실시',
    '근로자 고충처리 시스템 구축',
    '차별 금지 및 다양성 프로그램 도입',
    '근로시간 관리 시스템 개선'
  ],
  '산업안전·보건': [
    '안전보건 관리체계 구축',
    '정기적인 안전교육 프로그램 운영',
    '작업환경 측정 및 개선',
    '비상대응 체계 수립',
    '보호구 지급 및 관리 강화'
  ],
  환경경영: [
    'ISO 14001 인증 취득',
    '온실가스 배출량 관리 시스템 도입',
    '폐기물 관리 및 재활용 체계 구축',
    '환경 리스크 평가 및 대응',
    '친환경 기술 도입 검토'
  ],
  '공급망 및 조달': [
    '공급업체 실사 체계 구축',
    'ESG 조항 포함 계약서 개선',
    '분쟁광물 관리 시스템 도입',
    '공급망 추적 시스템 구축',
    '제보 시스템 운영'
  ],
  '윤리경영 및 정보보호': [
    '윤리강령 제정 및 교육',
    '정보보안 관리체계 구축',
    '개인정보보호 시스템 강화',
    '부패방지 시스템 도입',
    'ESG 전담조직 구성'
  ]
}

const riskLevels = {
  A: {
    level: '매우 낮음',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  B: {
    level: '낮음',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  C: {
    level: '보통',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  D: {
    level: '높음',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  }
}

export default function EvaluationForm({
  headquartersId,
  accountNumber
}: {
  headquartersId: string
  accountNumber: string
}) {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  // const [violationItems, setViolationItems] = useState<ViolationItem[]>([])
  const [activeView, setActiveView] = useState<'overview' | 'detailed'>('overview')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  // 기존 코드를 다음과 같이 수정
  // useEffect(() => {
  //   // 전체 분석 결과 가져오기 + 위반 항목 병합
  //   fetchFullSelfAssessmentResult()
  //     .then(data => {
  //       fetchViolationItems()
  //         .then(res => {
  //           const enrichedViolations = (data.criticalViolations ?? []).map(
  //             (v: SelfAssessmentAnswer): ViolationItem => {
  //               const match = res.data.find(
  //                 (item: ViolationItem) =>
  //                   item.questionId?.trim() === v.questionId?.trim()
  //               )

  //               if (!match) {
  //                 console.warn(` 매칭 실패: item=${v.questionId}`)
  //               }

  //               return {
  //                 ...v,
  //                 answer: v.answer.toUpperCase() as 'YES' | 'NO' | 'PARTIAL',
  //                 penaltyInfo: match?.penaltyInfo ?? '',
  //                 legalBasis: match?.legalBasis ?? '',
  //                 questionText: match?.questionText ?? `문항 ${v.questionId}`,
  //                 violationGrade: v.criticalGrade ?? 'D',
  //                 violationReason: match?.violationReason ?? '중대 위반 항목',
  //                 criticalViolation: v.critical,
  //                 category: v.category
  //               }
  //             }
  //           )

  //           setAnalysisData({
  //             ...data,
  //             criticalViolations: enrichedViolations
  //           })
  //         })
  //         .catch(err => {
  //           console.error(' 위반 항목 불러오기 실패:', err)
  //           setAnalysisData(data)
  //         })
  //     })
  //     .catch(err => {
  //       console.error(' 분석 결과 불러오기 실패:', err)
  //     })
  // }, [])

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName)
    return category?.icon || Building
  }

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName)
    return category?.color || 'from-gray-500 to-gray-600'
  }

  // Deprecated: generateActionPlan, use analysisData.actionPlan directly if available.

  if (!analysisData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Activity className="mx-auto mb-4 w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-lg text-gray-600">분석 데이터를 로딩 중입니다...</p>
        </div>
      </div>
    )
  }

  const RISK_LEVEL_MAP = {
    A: {
      level: '매우 낮음',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    B: {
      level: '낮음',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    C: {
      level: '보통',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    D: {
      level: '높음',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  }
  const riskInfo = analysisData?.finalGrade
    ? RISK_LEVEL_MAP[analysisData.finalGrade as 'A' | 'B' | 'C' | 'D']
    : undefined
  // Use actionPlan from analysisData if available, fallback to []
  const actionPlans = analysisData?.actionPlan ?? []

  return (
    <div className="p-6 w-full min-h-screen">
      <div className="mx-auto max-w-7xl">
        {/* 상단 네비게이션 섹션 (Breadcrumb) */}
        <div className="flex flex-row items-center p-2 px-2 mb-6 text-sm text-gray-500 bg-white rounded-lg shadow-sm">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <Home className="mr-1 w-4 h-4" />
                <BreadcrumbLink href="/dashboard">대시보드</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/CSDDD">CSDDD</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="font-bold text-blue-500">자가진단 결과</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* 헤더 섹션 */}
        <div className="flex flex-row mb-6 w-full h-24">
          <Link
            href="/CSDDD"
            className="flex flex-row items-center p-4 space-x-4 rounded-md transition cursor-pointer hover:bg-gray-200">
            <ArrowLeft className="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
            <PageHeader
              icon={<Shield className="w-6 h-6 text-blue-600" />}
              title="공급망 실사 자가진단 결과"
              description="ESG 관점에서 공급망의 리스크를 분석하고 개선점을 도출합니다"
              module="CSDDD"
              submodule="evaluation"
            />
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 bg-gradient-to-br via-blue-50 to-green-50 rounded-xl border-b border-gray-200 from-slate-50">
          <div className="px-6 py-12 mx-auto max-w-7xl">
            {/* 상단 메타 정보 */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="flex items-center px-3 py-1 space-x-2 bg-blue-100 rounded-full">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">종합분석</span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <span className="text-sm text-gray-500">
                  생성일: {new Date().toLocaleDateString('ko-KR')}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                  실시간 분석
                </span>
              </div>
            </div>

            {/* 메인 타이틀 */}
            <div className="mb-8 text-center">
              <div className="flex justify-center items-center mb-4 space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium tracking-wider text-green-600 uppercase">
                    ESG COMPREHENSIVE
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>

              <h1 className="mb-4 text-5xl font-bold tracking-tight text-gray-900">
                ESG 종합분석 리포트
              </h1>

              <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600">
                자가진단 결과를 바탕으로 한{' '}
                <span className="font-semibold text-gray-800">심층 분석</span> 및
                <span className="font-semibold text-gray-800"> 전략적 개선방안</span> 제시
              </p>
            </div>

            {/* ESG 아이콘 섹션 */}
            <div className="flex justify-center items-center mb-4 space-x-12">
              <div className="flex flex-col items-center group">
                <div className="flex justify-center items-center mb-3 w-16 h-16 bg-green-100 rounded-2xl transition-colors group-hover:bg-green-200">
                  <Leaf className="w-8 h-8 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Environment</span>
              </div>

              <div className="flex flex-col items-center group">
                <div className="flex justify-center items-center mb-3 w-16 h-16 bg-blue-100 rounded-2xl transition-colors group-hover:bg-blue-200">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Social</span>
              </div>

              <div className="flex flex-col items-center group">
                <div className="flex justify-center items-center mb-3 w-16 h-16 bg-purple-100 rounded-2xl transition-colors group-hover:bg-purple-200">
                  <Gavel className="w-8 h-8 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Governance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex p-1 bg-white rounded-lg border shadow-sm">
            {[
              {key: 'overview', label: '종합 개요', icon: PieChart},
              {key: 'detailed', label: '상세 분석', icon: BarChart3}
            ].map(({key, label, icon: Icon}) => (
              <button
                key={key}
                onClick={() => setActiveView(key as any)}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeView === key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content based on active view */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Executive Summary */}
            <Card className="p-6 shadow-lg backdrop-blur-sm bg-white/80">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">경영진 요약</h2>
              </div>

              {riskInfo && (
                <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-4">
                  <div
                    className={`p-6 rounded-lg border-2 ${riskInfo?.bgColor ?? ''} ${
                      riskInfo?.borderColor ?? ''
                    }`}>
                    <div className="text-center">
                      <div className="mb-2 text-4xl font-bold">
                        {analysisData?.finalGrade ?? ''}
                      </div>
                      <div className="text-sm font-semibold">최종 등급</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Assessment */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex gap-6 items-start">
                  {/* 등급 섹션 */}
                  <div className="flex-shrink-0">
                    <div
                      className={`flex flex-col items-center p-6 rounded-lg border-2 ${getGradeColor(
                        analysisData.grade
                      )}`}>
                      {getGradeIcon(analysisData.grade)}
                      <div className="mt-2 text-3xl font-bold">{analysisData.grade}</div>
                      <div className="mt-1 text-sm font-medium">등급</div>
                    </div>
                  </div>

                  {/* 세부 정보 섹션 */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="mb-1 text-sm text-gray-600">평가 결과</div>
                      <div className="text-gray-800">{analysisData.summary}</div>
                    </div>
                    <div>
                      <div className="mb-1 text-sm font-medium text-gray-700">
                        권장 조치
                      </div>
                      <div className="text-sm text-gray-700">
                        {analysisData.recommendations}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">주요 강점</h3>
                  <div className="space-y-2">
                    {(analysisData?.strengths ?? []).map((cat, index) => {
                      const category =
                        typeof cat === 'string'
                          ? cat
                          : cat.category ?? '알 수 없는 카테고리'
                      const score = typeof cat === 'string' ? undefined : cat.score

                      return (
                        <div
                          key={`${category}-${index}`}
                          className="flex gap-3 items-center p-3 bg-green-50 rounded-lg border border-green-200">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <div className="flex-1">
                            <div className="font-medium text-green-800">{category}</div>
                            {score !== undefined && (
                              <div className="text-sm text-green-600">{score}점 달성</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </Card>

            {/* Category Performance */}
            <Card className="p-6 shadow-lg backdrop-blur-sm bg-white/80">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">영역별 성과</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(() => {
                  // Sort categories according to desiredOrder before rendering
                  const orderedCategoryAnalysis = [
                    ...(analysisData?.categoryAnalysis ?? [])
                  ].sort(
                    (a, b) =>
                      desiredOrder.indexOf(a.category.replace('·', ' ')) -
                      desiredOrder.indexOf(b.category.replace('·', ' '))
                  )
                  return orderedCategoryAnalysis.map(cat => {
                    const IconComponent = getCategoryIcon(cat.category)
                    const colorClass = getCategoryColor(cat.category)
                    // Use status and color from backend, fallback to old logic if not present
                    const status = cat.status
                    const color = cat.color
                    // Color classes for border/background
                    let borderBgClass = 'border-gray-200 bg-white'
                    if (color === 'red' || status === '개선 필요') {
                      borderBgClass = 'border-red-200 bg-red-50'
                    } else if (color === 'green' || status === '우수') {
                      borderBgClass = 'border-green-200 bg-green-50'
                    } else if (color === 'yellow' || status === '보통') {
                      borderBgClass = 'border-yellow-200 bg-yellow-50'
                    }
                    return (
                      <div
                        key={cat.category}
                        className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${borderBgClass}`}
                        onClick={() => setSelectedCategory(cat.category)}>
                        <div className="flex gap-3 items-center mb-3">
                          <div
                            className={`p-2 bg-gradient-to-r rounded-lg ${colorClass}`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {cat.category}
                            </div>
                            <div className="text-2xl font-bold text-gray-800">
                              {cat.score}%
                            </div>
                          </div>
                          {status === '개선 필요' || color === 'red' ? (
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                          ) : null}
                          {status === '우수' || color === 'green' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : null}
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div
                            className={`h-2 rounded-full ${
                              color === 'red' || status === '개선 필요'
                                ? 'bg-red-500'
                                : color === 'green' || status === '우수'
                                ? 'bg-green-500'
                                : color === 'yellow' || status === '보통'
                                ? 'bg-yellow-500'
                                : 'bg-blue-500'
                            }`}
                            style={{width: `${cat.score}%`}}
                          />
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            </Card>
          </div>
        )}

        {activeView === 'detailed' && (
          <div className="space-y-6">
            {/* Detailed Category Analysis */}
            <Card className="p-6 shadow-lg backdrop-blur-sm bg-white/80">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">영역별 상세 분석</h2>
              <div className="space-y-6">
                {(() => {
                  // Sort categories according to desiredOrder before rendering
                  const orderedCategoryAnalysis = [
                    ...(analysisData?.categoryAnalysis ?? [])
                  ].sort(
                    (a, b) =>
                      desiredOrder.indexOf(a.category.replace('·', ' ')) -
                      desiredOrder.indexOf(b.category.replace('·', ' '))
                  )
                  return orderedCategoryAnalysis.map(cat => {
                    const IconComponent = getCategoryIcon(cat.category)
                    const colorClass = getCategoryColor(cat.category)
                    const recommendations =
                      improvementTemplates[
                        cat.category as keyof typeof improvementTemplates
                      ] || []
                    const status = cat.status
                    const color = cat.color
                    let statusElem = null
                    if (status === '우수' || color === 'green') {
                      statusElem = (
                        <span className="flex gap-1 items-center text-green-600">
                          <TrendingUp className="w-4 h-4" />
                          우수
                        </span>
                      )
                    } else if (status === '개선 필요' || color === 'red') {
                      statusElem = (
                        <span className="flex gap-1 items-center text-red-600">
                          <TrendingDown className="w-4 h-4" />
                          개선 필요
                        </span>
                      )
                    } else if (status === '보통' || color === 'yellow') {
                      statusElem = (
                        <span className="flex gap-1 items-center text-yellow-600">
                          <Activity className="w-4 h-4" />
                          보통
                        </span>
                      )
                    } else {
                      statusElem = (
                        <span className="flex gap-1 items-center text-blue-600">
                          <Activity className="w-4 h-4" />-
                        </span>
                      )
                    }
                    return (
                      <div
                        key={cat.category}
                        className="p-6 bg-gray-50 rounded-lg border">
                        <div className="flex gap-4 items-center mb-4">
                          <div
                            className={`p-3 bg-gradient-to-r rounded-lg ${colorClass}`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {cat.category}
                            </h3>
                            <div className="flex gap-4 items-center mt-1">
                              <span className="text-2xl font-bold text-blue-600">
                                {cat.score}%
                              </span>
                              {statusElem}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {/* 왼쪽: 현황 분석 */}
                          <div>
                            <h4 className="mb-3 font-medium text-gray-800">현황 분석</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">준수율</span>
                                <span className="font-medium">{cat.score}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 rounded-full">
                                <div
                                  className="h-2 bg-blue-500 rounded-full"
                                  style={{width: `${cat.score}%`}}
                                />
                              </div>
                            </div>
                          </div>

                          {/* 오른쪽: 벌금 및 법적 근거 분석 */}
                          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-100">
                              <div className="flex gap-3 items-center">
                                <div className="flex justify-center items-center w-10 h-10 bg-red-100 rounded-lg">
                                  <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900">
                                    벌금 및 패널티
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    중대 위반사항에 대한 법적 제재 현황
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="p-6">
                              {(() => {
                                const filteredViolations = (
                                  analysisData?.criticalViolations ?? []
                                ).filter(violation => {
                                  return violation.category === cat.category
                                })

                                if (filteredViolations.length === 0) {
                                  return (
                                    <div className="flex flex-col justify-center items-center py-12 text-center bg-green-50 rounded-lg border-2 border-green-200 border-dashed">
                                      <div className="flex justify-center items-center mb-4 w-16 h-16 bg-green-100 rounded-full">
                                        <FileText className="w-8 h-8 text-green-600" />
                                      </div>
                                      <h4 className="mb-2 text-lg font-semibold text-green-800">
                                        위반사항 없음
                                      </h4>
                                      <p className="text-green-700">
                                        이 영역에서는 중대 위반 항목이 발견되지
                                        않았습니다.
                                      </p>
                                      <div className="px-3 py-1 mt-3 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                        카테고리: {cat.category}
                                      </div>
                                    </div>
                                  )
                                }

                                return (
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                      <div className="flex gap-2 items-center">
                                        <span className="text-sm font-medium text-gray-700">
                                          총 위반사항
                                        </span>
                                        <span className="px-2 py-1 text-xs font-bold text-red-700 bg-red-100 rounded-full">
                                          {filteredViolations.length}건
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        카테고리: {cat.category}
                                      </div>
                                    </div>

                                    {filteredViolations.map((violation, index) => (
                                      <div
                                        key={index}
                                        className="overflow-hidden relative bg-white rounded-lg border border-red-200 shadow-sm transition-shadow hover:shadow-md">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>

                                        <div className="p-5 pl-6">
                                          <div className="flex justify-between items-start mb-3">
                                            <div className="flex gap-2 items-center">
                                              <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded">
                                                위반 #{violation.questionId}
                                              </span>
                                              <span className="text-xs text-gray-500">
                                                중대위반
                                              </span>
                                            </div>
                                          </div>

                                          <h4 className="mb-4 text-base font-bold leading-tight text-gray-900">
                                            {violation.questionText ||
                                              `문항 ${violation.questionId}`}
                                          </h4>

                                          <div className="space-y-3">
                                            {violation.penaltyInfo &&
                                              violation.penaltyInfo !== '' && (
                                                <div className="flex gap-3 items-start p-3 bg-red-50 rounded-lg border border-red-100">
                                                  <DollarSign className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                                  <div>
                                                    <span className="text-sm font-semibold text-red-800">
                                                      벌금/패널티
                                                    </span>
                                                    <p className="mt-1 text-sm text-red-700">
                                                      {violation.penaltyInfo}
                                                    </p>
                                                  </div>
                                                </div>
                                              )}

                                            {violation.legalBasis &&
                                              violation.legalBasis !== '' && (
                                                <div className="flex gap-3 items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                  <Scale className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                  <div>
                                                    <span className="text-sm font-semibold text-blue-800">
                                                      법적 근거
                                                    </span>
                                                    <p className="mt-1 text-sm text-blue-700">
                                                      {violation.legalBasis}
                                                    </p>
                                                  </div>
                                                </div>
                                              )}

                                            {violation.violationReason && (
                                              <div className="flex gap-3 items-start p-3 bg-orange-50 rounded-lg border border-orange-100">
                                                <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                  <span className="text-sm font-semibold text-orange-800">
                                                    위반 사유
                                                  </span>
                                                  <p className="mt-1 text-sm text-orange-700">
                                                    {violation.violationReason}
                                                  </p>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="pt-8 mt-12 text-center border-t border-gray-200">
          <p className="text-sm text-gray-600">
            분석 완료일:{' '}
            {new Date(analysisData?.timestamp ?? '').toLocaleDateString('ko-KR')} | ESG
            자가진단 시스템 v2.0
          </p>
          <div className="mt-4"></div>
        </div>
      </div>
    </div>
  )
}
