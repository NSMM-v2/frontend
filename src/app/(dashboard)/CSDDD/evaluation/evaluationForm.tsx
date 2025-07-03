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
  RefreshCw,
  AlertCircle,
  FileText,
  Home,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
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

  // 위반 항목들을 카테고리별로 그룹화
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

  // 카테고리 이름 매핑
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

  // 결과 목록 조회
  const fetchResults = async () => {
    setLoading(true)
    try {
      const user = await authService.getCurrentUserByType()
      if (user && user.success) {
        const userInfo = user.data
        setUserInfo(userInfo)

        let response: PaginatedSelfAssessmentResponse

        // evaluationForm.tsx의 fetchResults 함수 수정
        if (userInfo.userType === 'HEADQUARTERS') {
          response = await getSelfAssessmentResults({
            onlyPartners: false
          })
        } else if (userInfo.userType === 'PARTNER') {
          response = await getSelfAssessmentResults({
            onlyPartners: true
          })
        } else {
          throw new Error('Unknown user type')
        }

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

  // 상세 결과 조회 (여러 개를 누적 저장)
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

  // 등급별 색상 및 스타일
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
      {/* 브레드크럼 영역 */}
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

      {/* 페이지 헤더 영역 */}
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

      {/* 메인 컨텐츠 */}
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
                <button
                  onClick={fetchResults}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                  />
                  {loading ? '새로고침 중...' : '새로고침'}
                </button>
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
                    const scorePercentage =
                      (result.actualScore / result.totalPossibleScore) * 100
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
                        className="p-5 transition-all border border-gray-200 rounded-xl bg-white/50 hover:border-gray-300 hover:shadow-lg">
                        {/* 기본 정보 섹션 */}
                        <div className="">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900">
                                  {result.companyName}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {`${results.length - index}차 자가진단 결과`}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-500">
                              완료 일시:{' '}
                              {new Date(result.completedAt ?? new Date()).toLocaleString(
                                'ko-KR',
                                {
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={async () => {
                                if (!selectedResults[result.id]) {
                                  await fetchDetailResult(result.id)
                                }
                                const detail = selectedResults[result.id]
                                if (detail) {
                                  generatePDFReport(transformToPDFProps(detail))
                                } else {
                                  alert('상세 결과를 불러오는 데 실패했습니다.')
                                }
                              }}
                              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                              PDF 다운로드
                            </button>
                          </div>
                          {/* 점수 및 정보 - 5열 그리드로 확장 */}
                          <div className="grid grid-cols-5 gap-4 mb-4">
                            {/* 최종 등급 */}
                            <div className="p-4 border border-blue-300 rounded-lg bg-gradient-to-br from-blue-50 to-white">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col">
                                  <span className="text-gray-500 text-m">최종 등급</span>
                                  <div className="flex items-center space-x-1">
                                    <p className={`text-xl font-bold ${gradeStyle.text}`}>
                                      {result.finalGrade}
                                    </p>
                                    <span className="text-gray-400 text-m">등급</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* 총 위반 건수 */}
                            <div className="p-4 border border-blue-300 rounded-lg bg-gradient-to-br from-blue-50 to-white">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col">
                                  <span className="text-gray-500 text-m">
                                    총 위반 건수
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    <p className={`text-xl font-bold ${gradeStyle.text}`}>
                                      {result.noAnswerCount ?? 0}
                                    </p>
                                    <span className="text-gray-400 text-m">건</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* 중대 위반 건수 */}
                            <div className="p-4 border border-blue-300 rounded-lg bg-gradient-to-br from-blue-50 to-white">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col">
                                  <span className="text-gray-500 text-m">
                                    중대 위반 건수
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    <p className={`text-xl font-bold ${gradeStyle.text}`}>
                                      {violationCount}
                                    </p>
                                    <span className="text-gray-400 text-m">건</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* 진단 점수 */}
                            <div className="p-4 border border-blue-300 rounded-lg bg-gradient-to-br from-blue-50 to-white">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col">
                                  <span className="text-gray-500 text-m">진단 점수</span>
                                  <div className="flex items-center space-x-1">
                                    <p className="text-xl font-bold text-gray-900">
                                      {result.score}
                                    </p>
                                    <span className="text-gray-400 text-m">점</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* 종합 점수 */}
                            <div className="p-4 border border-blue-300 rounded-lg bg-gradient-to-br from-blue-50 to-white">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col">
                                  <span className="text-gray-500 text-m">종합 점수</span>
                                  <div className="flex items-center space-x-1">
                                    <p className="text-xl font-bold text-gray-900">
                                      {result.actualScore.toFixed(1)}
                                    </p>
                                    <span className="text-gray-400 text-m">
                                      / {result.totalPossibleScore.toFixed(1)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Chevron icon as toggle button */}
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
                            <div className="flex items-center mb-3 space-x-2">
                              <AlertCircle className="w-5 h-5 text-orange-500" />
                              <span className="font-medium text-gray-900">
                                위반 항목 상세 정보
                              </span>
                              <span className="px-2 py-1 text-xs font-bold text-orange-800 bg-orange-100 rounded-full">
                                {
                                  selectedResult.answers.filter(a => a.answer === false)
                                    .length
                                }
                                건
                              </span>
                            </div>
                            <div className="mt-3">
                              {selectedResult.answers.filter(a => a.answer === false)
                                .length === 0 ? (
                                <div className="p-4 border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                                  <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-green-800">
                                        완벽한 준수
                                      </p>
                                      <p className="text-sm text-green-600">
                                        모든 항목을 준수했습니다.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {Object.entries(
                                    groupViolationsByCategory(selectedResult.answers)
                                  ).map(([categoryId, violations]) => (
                                    <div
                                      key={categoryId}
                                      className="p-3 border border-red-200 rounded-lg bg-gradient-to-br from-red-50 to-pink-50">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                          <h4 className="text-sm font-bold text-red-800">
                                            {getCategoryName(categoryId)}
                                          </h4>
                                        </div>
                                        <div className="px-2 py-1 text-xs font-bold text-red-800 bg-red-200 rounded-full">
                                          {violations.length}건
                                        </div>
                                      </div>

                                      {/* 위반 항목들을 가로로 배치하고 높이 제한 */}
                                      <div className="overflow-y-auto max-h-20">
                                        <div className="flex flex-wrap gap-1">
                                          {violations.map((violation, i) => (
                                            <button
                                              key={i}
                                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 transition-colors bg-white border border-red-300 rounded-md hover:bg-red-100 hover:border-red-400"
                                              onClick={e => {
                                                e.stopPropagation()
                                                handleViolationClick(violation.questionId)
                                              }}>
                                              {violation.questionId}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader className="pb-6">
            <div className="flex items-center space-x-3">
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  위반 항목 상세 정보
                </DialogTitle>
                <DialogDescription className="mt-1 text-gray-600">
                  선택한 위반 항목의 세부 정보 및 법적 근거를 확인하세요.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {violationMeta ? (
            <div className="space-y-4">
              <div className="p-4 border border-blue-100 rounded-lg bg-gradient-to-br from-blue-50 to-white">
                <h4 className="mb-1 text-sm font-semibold text-gray-700">카테고리</h4>
                <p className="text-base text-gray-900">{violationMeta.category}</p>
              </div>
              <div className="p-4 border border-blue-100 rounded-lg bg-gradient-to-br from-blue-50 to-white">
                <h4 className="mb-1 text-sm font-semibold text-gray-700">벌칙 정보</h4>
                <p className="text-base text-gray-900">{violationMeta.penaltyInfo}</p>
              </div>
              <div className="p-4 border border-blue-100 rounded-lg bg-gradient-to-br from-blue-50 to-white">
                <h4 className="mb-1 text-sm font-semibold text-gray-700">법적 근거</h4>
                <p className="text-base text-gray-900">{violationMeta.legalBasis}</p>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-12 h-12 mx-auto mb-6 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  상세 정보를 불러오는 중...
                </p>
                <p className="text-sm text-gray-500">잠시만 기다려주세요.</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
