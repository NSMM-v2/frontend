'use client'
import {useState, useEffect} from 'react'

import {
  getSelfAssessmentResults,
  getSelfAssessmentResult,
  getViolationMeta
} from '@/services/csdddService'
import authService from '@/services/authService'
import type {
  SelfAssessmentResponse,
  PaginatedSelfAssessmentResponse
} from '@/types/csdddType'
import Link from 'next/link'
import {PageHeader} from '@/components/layout/PageHeader'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import {
  Shield,
  AlertCircle,
  FileText,
  Home,
  ArrowLeft,
  BarChart3,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

import {
  generatePDFReport,
  transformToPDFProps
} from '@/components/CSDDD/PDFReportGenerator'

export default function EvaluationForm() {
  const [results, setResults] = useState<SelfAssessmentResponse[]>([])
  const [selectedResults, setSelectedResults] = useState<{
    [key: number]: SelfAssessmentResponse
  }>({})
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<any>(null)

  const [violationMeta, setViolationMeta] = useState<{
    category: string
    penaltyInfo: string
    legalBasis: string
  } | null>(null)
  const [selectedViolationId, setSelectedViolationId] = useState<string | null>(null)

  const [expandedViolations, setExpandedViolations] = useState<{[key: number]: boolean}>(
    {}
  )

  const toggleViolationExpansion = (resultId: number) => {
    setExpandedViolations(prev => ({
      ...prev,
      [resultId]: !prev[resultId]
    }))
  }

  const handleViolationClick = async (questionId: string) => {
    setSelectedViolationId(questionId)
    try {
      const meta = await getViolationMeta(questionId) // Remove userInfo parameter
      setViolationMeta(meta)
    } catch (error) {
      console.error('Violation meta 불러오기 실패:', error)
    }
  }

  const groupViolationsByCategory = (answers: any[]) => {
    const violations = answers.filter(a => a.answer === false) // boolean 비교로 수정
    const grouped: {[key: string]: any[]} = {}

    violations.forEach(violation => {
      const category = violation.questionId.split('.')[0]
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(violation)
    })

    return grouped
  }

  const getCategoryName = (categoryId: string) => {
    const categoryNames: {[key: string]: string} = {
      '1': '인권 및 노동',
      '2': '산업안전 및 보건',
      '3': '환경 경영',
      '4': '공급망 및 조달',
      '5': '윤리경영 및 정보보호'
    }
    return categoryNames[categoryId] || `카테고리 ${categoryId}`
  }

  const fetchResults = async () => {
    setLoading(true)
    try {
      const user = await authService.getCurrentUserByType()
      if (user && user.success) {
        const userInfo = user.data
        setUserInfo(userInfo)

        let response: PaginatedSelfAssessmentResponse

        response = await getSelfAssessmentResults({
          onlyPartners: false
        })

        setResults(
          (response.content || []).sort(
            (a, b) =>
              new Date(b.completedAt ?? new Date()).getTime() -
              new Date(a.completedAt ?? new Date()).getTime()
          )
        )

        setAuthError(null)
      } else {
        setResults([])
      }
    } catch (error: any) {
      console.error('결과 조회 실패:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const fetchDetailResult = async (resultId: number) => {
    setDetailLoading(true)
    try {
      if (!userInfo) return
      const result = await getSelfAssessmentResult(resultId)
      setSelectedResults(prev => ({...prev, [resultId]: result}))
    } catch (error: any) {
      console.error('상세 결과 조회 실패:', error)
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => {
    fetchResults()
  }, [])

  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case 'A':
        return {
          text: 'text-emerald-500',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          badge: 'bg-emerald-500 text-white'
        }
      case 'B':
        return {
          text: 'text-blue-500',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          badge: 'bg-blue-500 text-white'
        }
      case 'C':
        return {
          text: 'text-yellow-500',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          badge: 'bg-yellow-500 text-white'
        }
      case 'D':
        return {
          text: 'text-red-500',
          bg: 'bg-red-50',
          border: 'border-red-200',
          badge: 'bg-red-500 text-white'
        }
      default:
        return {
          text: 'text-gray-500',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          badge: 'bg-gray-500 text-white'
        }
    }
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="p-4 pb-0">
        <div className="flex flex-row items-center p-3 mb-6 text-sm text-gray-600 border shadow-sm rounded-xl backdrop-blur-sm bg-white/80 border-white/50">
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
        <div className="flex flex-row w-full mb-6">
          <Link
            href="/CSDDD"
            className="flex flex-row items-center p-4 space-x-4 transition-all rounded-xl backdrop-blur-sm hover:bg-white/30 group">
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
        <div className="lg:col-span-3">
          <div className="border shadow-xl rounded-xl backdrop-blur-sm bg-white/95 border-white/50">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-gray-900">진단 결과 목록</h2>
                  <div className="relative group">
                    <AlertCircle className="w-4 h-4 text-orange-500 cursor-pointer" />
                    <div className="absolute z-10 hidden p-3 text-sm text-orange-800 transform -translate-x-1/2 bg-white border border-orange-200 rounded shadow-lg top-full left-1/2 max-w-none whitespace-nowrap group-hover:block">
                      <p>• 위반 항목은 펼쳐서 상세 내용을 확인하세요</p>
                      <p>• 위반 항목을 클릭하면 법적 근거를 볼 수 있습니다</p>
                    </div>
                  </div>
                  <div className="relative group">
                    <AlertCircle className="w-4 h-4 text-blue-500 cursor-pointer" />
                    <div className="absolute z-10 hidden p-3 text-sm text-blue-800 transform -translate-x-1/2 bg-white border border-blue-200 rounded shadow-lg top-full left-1/2 max-w-none whitespace-nowrap group-hover:block">
                      <p>
                        • 점수에 따라 등급이 부여됩니다: A (90↑), B (75↑), C (60↑), D (60
                        미만)
                      </p>
                      <p>• 중대 위반이 있으면 점수와 관계없이 자동 강등됩니다</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                  <p className="text-gray-600">데이터를 불러오는 중...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="py-12 text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="font-medium text-gray-600">진단 결과가 없습니다.</p>
                  <p className="mt-1 text-sm text-gray-500">
                    새로운 자가진단을 실시해보세요.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result, index) => {
                    const gradeStyle = getGradeStyle(result.finalGrade ?? 'D')
                    const selectedResult = selectedResults[result.id]
                    const violationCount =
                      selectedResult && selectedResult.answers
                        ? selectedResult.answers.filter(
                            a => a.hasCriticalViolation === true
                          ).length
                        : result.criticalViolationCount

                    const isExpanded = expandedViolations[result.id]

                    return (
                      <div
                        key={result.id}
                        className="p-4 transition-all border border-gray-200 rounded-xl bg-white/50 hover:border-gray-300 hover:shadow-lg">
                        <div className="">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-1.5 bg-blue-100 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {result.companyName}
                                </h3>
                                <span className="text-sm text-gray-500">
                                  {`${results.length - index}차 자가진단 결과`}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm font-semibold text-gray-500">
                                완료 일시:{' '}
                                {new Date(
                                  result.completedAt ?? new Date()
                                ).toLocaleString('ko-KR', {
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              <button
                                onClick={async () => {
                                  if (!selectedResults[result.id]) {
                                    await fetchDetailResult(result.id)
                                  }
                                  const detail = selectedResults[result.id]
                                  if (detail) {
                                    const props = await transformToPDFProps(detail)
                                    generatePDFReport(props)
                                  } else {
                                    alert('상세 결과를 불러오는 데 실패했습니다.')
                                  }
                                }}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                PDF 다운로드
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-5 gap-4 mb-4">
                            <div className="p-3 border border-blue-300 rounded-lg bg-gradient-to-br from-blue-50 to-white">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col">
                                  <span className="text-sm text-gray-500">최종 등급</span>
                                  <div className="flex items-center space-x-1">
                                    <p
                                      className={`text-lg font-semibold ${gradeStyle.text}`}>
                                      {result.finalGrade}
                                    </p>
                                    <span className="text-sm text-gray-400">등급</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 border border-blue-300 rounded-lg bg-gradient-to-br from-blue-50 to-white">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col">
                                  <span className="text-sm text-gray-500">
                                    총 위반 건수
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    <p
                                      className={`text-lg font-semibold ${gradeStyle.text}`}>
                                      {result.noAnswerCount ?? 0}
                                    </p>
                                    <span className="text-sm text-gray-400">건</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 border border-blue-300 rounded-lg bg-gradient-to-br from-blue-50 to-white">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col">
                                  <span className="text-sm text-gray-500">
                                    중대 위반 건수
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    <p
                                      className={`text-lg font-semibold ${gradeStyle.text}`}>
                                      {violationCount}
                                    </p>
                                    <span className="text-sm text-gray-400">건</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 border border-blue-300 rounded-lg bg-gradient-to-br from-blue-50 to-white">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col">
                                  <span className="text-sm text-gray-500">진단 점수</span>
                                  <div className="flex items-center space-x-1">
                                    <p className="text-lg font-semibold text-gray-900">
                                      {result.score}
                                    </p>
                                    <span className="text-sm text-gray-400">점</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 border border-blue-300 rounded-lg bg-gradient-to-br from-blue-50 to-white">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col">
                                  <span className="text-sm text-gray-500">종합 점수</span>
                                  <div className="flex items-center space-x-1">
                                    <p className="text-lg font-semibold text-gray-900">
                                      {result.actualScore.toFixed(1)}
                                    </p>
                                    <span className="text-sm text-gray-400">
                                      / {result.totalPossibleScore.toFixed(1)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-center">
                            <button
                              onClick={() => {
                                toggleViolationExpansion(result.id)
                                fetchDetailResult(result.id)
                              }}
                              className="p-2 transition-colors rounded-full hover:bg-gray-100">
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        {isExpanded && selectedResult?.answers && (
                          <div className="pt-4 mt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  위반 항목 상세 정보
                                </h3>
                                <p className="text-sm text-gray-500">
                                  각 위반 항목을 클릭하면 법적 근거와 벌칙 정보를 확인할
                                  수 있습니다
                                </p>
                              </div>
                              <div className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-md">
                                총{' '}
                                {
                                  selectedResult.answers.filter(a => a.answer === false)
                                    .length
                                }
                                건
                              </div>
                            </div>
                            <div className="space-y-4">
                              {selectedResult.answers.filter(a => a.answer === false)
                                .length === 0 ? (
                                <div className="p-6 border border-blue-200 shadow-sm bg-gradient-to-br from-blue-50 to-white rounded-xl">
                                  <div className="text-center">
                                    <h4 className="text-lg font-bold text-blue-800">
                                      완벽한 준수
                                    </h4>
                                    <p className="mt-1 text-sm text-blue-600">
                                      모든 CSDDD 항목을 준수했습니다. 훌륭한 준수 체계를
                                      유지하고 있습니다.
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {Object.entries(
                                    groupViolationsByCategory(selectedResult.answers)
                                  ).map(([categoryId, violations]) => (
                                    <div
                                      key={categoryId}
                                      className="overflow-hidden border border-blue-200 shadow-sm bg-gradient-to-br from-blue-50 to-white rounded-xl">
                                      <div className="px-4 py-3 border-b border-blue-200 bg-gradient-to-r from-blue-100 to-blue-50">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <h4 className="text-base font-semibold text-blue-800">
                                              {getCategoryName(categoryId)}
                                            </h4>
                                          </div>
                                          <div className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-200 rounded-md">
                                            {violations.length}건
                                          </div>
                                        </div>
                                      </div>

                                      <div className="p-4">
                                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                          {violations.map((violation, i) => (
                                            <button
                                              key={i}
                                              className="flex items-center justify-center min-w-0 p-2 text-xs font-medium text-blue-800 transition-all bg-white border border-blue-300 rounded-md hover:bg-blue-100 hover:border-blue-400"
                                              onClick={e => {
                                                e.stopPropagation()
                                                handleViolationClick(violation.questionId)
                                              }}>
                                              <span className="font-mono text-xs truncate">
                                                {violation.questionId}
                                              </span>
                                              <FileText className="flex-shrink-0 w-3 h-3 ml-1 text-blue-600" />
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={!!selectedViolationId}
        onOpenChange={() => {
          setSelectedViolationId(null)
          setViolationMeta(null)
        }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  위반 항목 상세 정보
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm text-gray-600">
                  항목 ID:{' '}
                  <span className="font-mono font-medium text-blue-600">
                    {selectedViolationId}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="pt-6">
            {violationMeta ? (
              <div className="space-y-6">
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <h4 className="pb-2 mb-4 text-lg font-semibold text-gray-800 border-b border-gray-100">
                    카테고리 분류
                  </h4>
                  <p className="text-base leading-relaxed text-gray-900">
                    {violationMeta.category}
                  </p>
                </div>

                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <h4 className="pb-2 mb-4 text-lg font-semibold text-gray-800 border-b border-gray-100">
                    벌칙 및 제재 내용
                  </h4>

                  <p className="text-base leading-relaxed text-gray-900 whitespace-pre-wrap">
                    {violationMeta.penaltyInfo}
                  </p>
                </div>

                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <h4 className="pb-2 mb-4 text-lg font-semibold text-gray-800 border-b border-gray-100">
                    관련 법적 근거
                  </h4>

                  <p className="text-base leading-relaxed text-gray-900 whitespace-pre-wrap">
                    {violationMeta.legalBasis}
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="text-sm text-gray-700">
                    <p className="mb-2 font-medium">참고사항</p>
                    <p className="leading-relaxed">
                      위 정보는 CSDDD(Corporate Sustainability Due Diligence Directive)
                      지침에 따른 것으로, 실제 적용 시에는 관련 법무팀 또는 전문가와
                      상담하시기 바랍니다.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="w-12 h-12 mx-auto mb-6 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    상세 정보를 불러오는 중입니다
                  </h3>
                  <p className="text-sm text-gray-500">
                    법적 근거와 벌칙 정보를 조회하고 있습니다. 잠시만 기다려주세요.
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
