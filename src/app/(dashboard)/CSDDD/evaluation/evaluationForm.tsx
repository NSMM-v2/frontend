'use client'
import {useEffect, useState, useMemo} from 'react'
import {fetchFullSelfAssessmentResult} from '@/services/csdddService'
import {Button} from '@/components/ui/button'
import {Card} from '@/components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Target,
  Calendar,
  FileText,
  Download,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Lightbulb,
  Flag,
  Users,
  Building,
  Leaf,
  Gavel,
  Globe
} from 'lucide-react'

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
    violationGrade: string
    violationReason: string
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

export default function EvaluationForm({
  headquartersId,
  accountNumber
}: {
  headquartersId: string
  accountNumber: string
}) {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [activeView, setActiveView] = useState<'overview' | 'detailed' | 'improvement'>(
    'overview'
  )
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // 주요 강점: strengths 우선, 없으면 categoryAnalysis에서 '우수'만 추출 (카테고리 누락 시 인덱스 기반 이름 대입)
  const fullCategoryList = [
    '인권 및 노동',
    '산업안전·보건',
    '환경경영',
    '공급망 및 조달',
    '윤리경영 및 정보보호'
  ]

  // 주요 강점 섹션 개선된 코드 (문자열/객체 모두 지원, 타입 안전성 향상)
  const strengthsToShow = useMemo(() => {
    const strengths = analysisData?.strengths

    // Type guard: check if array is string[]
    const isStringArray = (arr: any[]): arr is string[] =>
      arr.length > 0 && typeof arr[0] === 'string'

    // Type guard: check if array is object[]
    const isObjectArray = (
      arr: any[]
    ): arr is {
      category: string
      score: number
      status?: string
      color?: string
    }[] => arr.length > 0 && typeof arr[0] === 'object' && 'category' in arr[0]

    if (Array.isArray(strengths)) {
      if (isStringArray(strengths)) {
        return strengths.map(category => ({
          category,
          score: undefined,
          status: undefined,
          color: 'green'
        }))
      } else if (isObjectArray(strengths)) {
        return strengths
      }
    }

    // fallback
    if (analysisData?.categoryAnalysis && analysisData.categoryAnalysis.length > 0) {
      return analysisData.categoryAnalysis
        .filter(cat => cat.status === '우수' || cat.color === 'green')
        .map((cat, idx) => ({
          ...cat,
          category: cat.category || fullCategoryList[idx] || '알 수 없는 카테고리'
        }))
    }

    return []
  }, [analysisData])

  // 위험도 정보 개선
  const riskInfo = useMemo(() => {
    if (!analysisData?.finalGrade) return null

    const grade = analysisData.finalGrade.toUpperCase().trim()
    return RISK_LEVEL_MAP[grade as keyof typeof RISK_LEVEL_MAP] || null
  }, [analysisData?.finalGrade])

  useEffect(() => {
    fetchFullSelfAssessmentResult(headquartersId, accountNumber)
      .then(data => {
        console.log('📦 분석결과:', data)
        setAnalysisData(data?.data) // 수정: 실제 결과는 data.data에 있음
      })
      .catch(err => {
        console.error('❌ 분석 결과 불러오기 실패:', err)
      })
  }, [])

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName)
    return category?.icon || Building
  }

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName)
    return category?.color || 'from-gray-500 to-gray-600'
  }

  // Deprecated: generateActionPlan, use analysisData.actionPlan directly if available.

  const exportDetailedReport = () => {
    if (!analysisData) return

    const report = {
      ...analysisData,
      analysisDate: new Date().toISOString(),
      // Use actionPlan directly if available
      actionPlan: analysisData.actionPlan,
      recommendations: (analysisData?.categoryAnalysis ?? []).map(cat => ({
        category: cat.category,
        score: cat.score,
        recommendations:
          improvementTemplates[cat.category as keyof typeof improvementTemplates] || []
      }))
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ESG-evaluation-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!analysisData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
          <p className="text-lg text-gray-600">분석 데이터를 로딩 중입니다...</p>
        </div>
      </div>
    )
  }

  // REMOVED duplicate riskInfo declaration
  // Use actionPlan from analysisData if available, fallback to []
  const actionPlans = analysisData?.actionPlan ?? []

  // 렌더링 부분 개선
  return (
    <div className="w-full min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">ESG 종합분석 리포트</h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            자가진단 결과를 바탕으로 한 심층 분석 및 개선 방안 제시
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex p-1 bg-white border rounded-lg shadow-sm">
            {[
              {key: 'overview', label: '종합 개요', icon: PieChart},
              {key: 'detailed', label: '상세 분석', icon: BarChart3},
              {key: 'improvement', label: '개선 계획', icon: Target}
            ].map(({key, label, icon: Icon}) => (
              <button
                key={key}
                onClick={() => setActiveView(key as typeof activeView)}
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
            <Card className="p-6 shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">경영진 요약</h2>
                <Button
                  onClick={exportDetailedReport}
                  className="flex items-center gap-2"
                  disabled={!analysisData}>
                  <Download className="w-4 h-4" />
                  상세 리포트 다운로드
                </Button>
              </div>

              {/* 최종 등급 표시 */}
              {riskInfo && analysisData?.finalGrade && (
                <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-4">
                  <div
                    className={`p-6 rounded-lg border-2 ${riskInfo.bgColor} ${riskInfo.borderColor}`}>
                    <div className="text-center">
                      <div className={`mb-2 text-4xl font-bold ${riskInfo.color}`}>
                        {analysisData.finalGrade}
                      </div>
                      <div className="text-sm font-semibold text-gray-700">최종 등급</div>
                      <div className="mt-2 text-xs text-gray-600">
                        위험도: {riskInfo.level}
                      </div>
                    </div>
                  </div>

                  {/* 추가 정보 카드들 */}
                  <div className="p-6 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="text-center">
                      <div className="mb-2 text-2xl font-bold text-blue-600">
                        {analysisData.baseScore || 0}%
                      </div>
                      <div className="text-sm font-semibold text-gray-700">달성률</div>
                    </div>
                  </div>

                  <div className="p-6 border border-purple-200 rounded-lg bg-purple-50">
                    <div className="text-center">
                      <div className="mb-2 text-2xl font-bold text-purple-600">
                        {analysisData.criticalViolations?.length || 0}
                      </div>
                      <div className="text-sm font-semibold text-gray-700">중대 위반</div>
                    </div>
                  </div>

                  <div className="p-6 border border-green-200 rounded-lg bg-green-50">
                    <div className="text-center">
                      <div className="mb-2 text-2xl font-bold text-green-600">
                        {strengthsToShow.length}
                      </div>
                      <div className="text-sm font-semibold text-gray-700">강점 영역</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Assessment */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    위험도 평가
                  </h3>
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <Shield className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">
                          전체 위험도: {analysisData?.finalGrade || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {analysisData?.summary || '평가 정보가 없습니다.'}
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-700">
                        <strong className="text-gray-800">권장 조치:</strong>{' '}
                        {analysisData?.recommendations || '추가 분석이 필요합니다.'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 주요 강점 개선된 섹션 */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    주요 강점 ({strengthsToShow.length})
                  </h3>
                  {strengthsToShow.length > 0 ? (
                    <div className="space-y-3">
                      {strengthsToShow.map((strength: any, idx: number) => (
                        <div
                          key={`strength-${idx}`}
                          className="flex items-center gap-3 p-3 transition-colors border border-green-200 rounded-lg bg-green-50 hover:bg-green-100">
                          <div className="flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-green-800 truncate">
                              {strength.category || '알 수 없는 카테고리'}
                            </div>
                            <div className="text-sm text-green-700">
                              {strength.score !== undefined && (
                                <span className="inline-block mr-2">
                                  점수: {strength.score}%
                                </span>
                              )}
                              {strength.status && (
                                <span className="inline-block px-2 py-1 text-xs bg-green-200 rounded-full">
                                  {strength.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center border border-gray-200 rounded-lg bg-gray-50">
                      <div className="mb-2 text-gray-500">
                        <Lightbulb className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        현재 뚜렷한 강점 영역이 없습니다.
                      </div>
                      <div className="text-sm text-gray-600">
                        상세 분석을 통해 개선 가능한 영역을 확인해보세요.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Category Performance */}
            <Card className="p-6 shadow-lg bg-white/80 backdrop-blur-sm">
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
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${borderBgClass}`}
                        onClick={() => setSelectedCategory(cat.category)}>
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-r ${colorClass}`}>
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
            {/* Critical Violations */}
            {(analysisData?.criticalViolations?.length ?? 0) > 0 && (
              <Card className="p-6 shadow-lg bg-white/80 backdrop-blur-sm">
                <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-red-800">
                  <AlertTriangle className="w-6 h-6" />
                  중대 위반 사항
                </h2>
                <div className="space-y-4">
                  {(analysisData?.criticalViolations ?? []).map((violation, index) => (
                    <div
                      key={`${violation.questionId}-${index}`}
                      className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-red-100 rounded-full">
                          <span className="text-sm font-bold text-red-700">
                            {violation.questionId}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-2 font-semibold text-red-900">
                            {violation.questionText}
                          </h3>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="px-2 py-1 font-medium text-red-800 bg-red-200 rounded">
                              등급 영향: {violation.violationGrade}
                            </span>
                            <span className="text-red-700">
                              {violation.violationReason}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Detailed Category Analysis */}
            <Card className="p-6 shadow-lg bg-white/80 backdrop-blur-sm">
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
                        <span className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="w-4 h-4" />
                          우수
                        </span>
                      )
                    } else if (status === '개선 필요' || color === 'red') {
                      statusElem = (
                        <span className="flex items-center gap-1 text-red-600">
                          <TrendingDown className="w-4 h-4" />
                          개선 필요
                        </span>
                      )
                    } else if (status === '보통' || color === 'yellow') {
                      statusElem = (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <Activity className="w-4 h-4" />
                          보통
                        </span>
                      )
                    } else {
                      statusElem = (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Activity className="w-4 h-4" />-
                        </span>
                      )
                    }
                    return (
                      <div
                        key={cat.category}
                        className="p-6 border rounded-lg bg-gray-50">
                        <div className="flex items-center gap-4 mb-4">
                          <div
                            className={`p-3 rounded-lg bg-gradient-to-r ${colorClass}`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {cat.category}
                            </h3>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-2xl font-bold text-blue-600">
                                {cat.score}%
                              </span>
                              {statusElem}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                          <div>
                            <h4 className="mb-3 font-medium text-gray-800">
                              개선 권장사항
                            </h4>
                            <ul className="space-y-1 text-sm text-gray-600">
                              {(recommendations ?? []).slice(0, 3).map((rec, idx) => (
                                <li key={rec} className="flex items-center gap-2">
                                  <ArrowRight className="w-3 h-3 text-blue-500" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
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

        {activeView === 'improvement' && (
          <div className="space-y-6">
            {/* Action Plans */}
            <Card className="p-6 shadow-lg bg-white/80 backdrop-blur-sm">
              <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-gray-900">
                <Target className="w-6 h-6" />
                개선 실행 계획
              </h2>
              <div className="space-y-6">
                {actionPlans.map((plan, index) => (
                  <div
                    key={plan.title + plan.priority}
                    className="p-6 border-2 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${
                              plan.priority === '긴급'
                                ? 'bg-red-200 text-red-800'
                                : plan.priority === '높음'
                                ? 'bg-orange-200 text-orange-800'
                                : 'bg-blue-200 text-blue-800'
                            }`}>
                            {plan.priority} 우선순위
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {plan.title}
                        </h3>
                        <p className="mt-1 text-gray-600">{plan.description}</p>
                      </div>
                      <Flag className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Implementation Timeline */}
            <Card className="p-6 shadow-lg bg-white/80 backdrop-blur-sm">
              <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-gray-900">
                <Clock className="w-6 h-6" />
                구현 타임라인
              </h2>
              <div className="space-y-4">
                {[
                  {
                    period: '1개월 이내',
                    tasks: ['중대 위반 사항 즉시 개선', '긴급 리스크 완화 조치'],
                    color: 'bg-red-100 border-red-300'
                  },
                  {
                    period: '3개월 이내',
                    tasks: ['저성과 영역 집중 개선', '내부 프로세스 정비'],
                    color: 'bg-orange-100 border-orange-300'
                  },
                  {
                    period: '6개월 이내',
                    tasks: ['ESG 관리 시스템 구축', '전사적 체계 정립'],
                    color: 'bg-blue-100 border-blue-300'
                  },
                  {
                    period: '12개월 이내',
                    tasks: ['성과 모니터링 및 개선', '지속가능성 전략 수립'],
                    color: 'bg-green-100 border-green-300'
                  }
                ].map((timeline, index) => (
                  <div
                    key={timeline.period}
                    className={`p-4 border-2 rounded-lg ${timeline.color}`}>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full">
                        <span className="text-sm font-bold text-gray-700">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{timeline.period}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {timeline.tasks.map(task => (
                            <span
                              key={task}
                              className="px-2 py-1 text-xs bg-white rounded">
                              {task}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Resource Requirements */}
            <Card className="p-6 shadow-lg bg-white/80 backdrop-blur-sm">
              <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-gray-900">
                <Lightbulb className="w-6 h-6" />
                구현 가이드라인
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-800">
                    필요 리소스
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg bg-gray-50">
                      <div className="font-medium text-gray-900">인력</div>
                      <div className="text-sm text-gray-600">
                        ESG 전담팀 구성, 외부 컨설팅 고려
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg bg-gray-50">
                      <div className="font-medium text-gray-900">예산</div>
                      <div className="text-sm text-gray-600">
                        시스템 구축비, 교육비, 인증 취득비
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg bg-gray-50">
                      <div className="font-medium text-gray-900">시스템</div>
                      <div className="text-sm text-gray-600">
                        모니터링 도구, 데이터 관리 시스템
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-800">성공 요인</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-700">
                        경영진의 강력한 의지와 지원
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-700">
                        전 직원의 ESG 인식 제고
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-700">
                        단계적 접근과 지속적 모니터링
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-700">
                        이해관계자와의 적극적 소통
                      </span>
                    </div>
                  </div>
                </div>
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
          <div className="mt-4">
            <Button onClick={() => window.print()} variant="outline" className="mr-4">
              <FileText className="w-4 h-4 mr-2" />
              리포트 인쇄
            </Button>
            <Button
              onClick={exportDetailedReport}
              className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              상세 데이터 내보내기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
