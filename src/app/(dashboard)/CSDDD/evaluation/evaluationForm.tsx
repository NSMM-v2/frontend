'use client'
import {useState, useEffect} from 'react'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
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
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

export default function EvaluationForm() {
  const [results, setResults] = useState<SelfAssessmentResponse[]>([])
  const [selectedResult, setSelectedResult] = useState<SelfAssessmentResponse | null>(
    null
  )
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [expandedViolations, setExpandedViolations] = useState<{[key: number]: boolean}>(
    {}
  )

  const [violationMeta, setViolationMeta] = useState<{
    category: string
    penaltyInfo: string
    legalBasis: string
  } | null>(null)
  const [selectedViolationId, setSelectedViolationId] = useState<string | null>(null)

  const toggleViolationExpansion = (resultId: number) => {
    setExpandedViolations(prev => {
      const newExpansion: {[key: number]: boolean} = {}
      Object.keys(prev).forEach(key => {
        newExpansion[parseInt(key)] = false
      })
      newExpansion[resultId] = !prev[resultId]
      return newExpansion
    })
  }

  const handleViolationClick = async (questionId: string) => {
    setSelectedViolationId(questionId)
    try {
      if (!userInfo) return
      const meta = await getViolationMeta(questionId, userInfo)
      setViolationMeta(meta)
    } catch (error) {
      console.error('Violation meta 불러오기 실패:', error)
    }
  }

  // 결과 목록 조회
  const fetchResults = async () => {
    setLoading(true)
    try {
      const user = await authService.getCurrentUserByType()
      if (user && user.success) {
        const userInfo = user.data
        setUserInfo(userInfo)
        // console.log('🔍 로그인된 사용자 정보:', userInfo)

        let response: PaginatedSelfAssessmentResponse

        if (userInfo.userType === 'HEADQUARTERS') {
          // Only fetch headquarters' own result (no treePath, no partnerId)
          response = await getSelfAssessmentResults({
            userType: userInfo.userType,
            headquartersId: userInfo.headquartersId!,
            partnerId: undefined,
            treePath: undefined
          })
        } else if (userInfo.userType === 'PARTNER') {
          // Only fetch results for the current partner
          response = await getSelfAssessmentResults({
            userType: userInfo.userType,
            headquartersId: userInfo.headquartersId!,
            partnerId: userInfo.partnerId,
            treePath: userInfo.treePath,
            forPartnerEvaluation: false // Explicitly include this field by extending the function's parameter type
          })
        } else {
          throw new Error('Unknown user type')
        }

        setResults(response.content || [])
        // Expand all result IDs by default
        const initialExpansion: {[key: number]: boolean} = {}
        ;(response.content || []).forEach(result => {
          initialExpansion[result.id] = false
        })
        setExpandedViolations(initialExpansion)
        setAuthError(null)
      } else {
        // setAuthError('로그인이 필요합니다.')
        setResults([])
      }
    } catch (error: any) {
      console.error('결과 조회 실패:', error)
      // setAuthError('인증 확인에 실패했습니다.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // 상세 결과 조회
  const fetchDetailResult = async (resultId: number) => {
    setDetailLoading(true)
    // setAuthError(null)

    try {
      // const isAuthenticated = await checkAuth()
      // if (!isAuthenticated) {
      //   return
      // }
      if (!userInfo) return
      const result = await getSelfAssessmentResult(resultId, {
        userType: userInfo.userType,
        headquartersId: userInfo.headquartersId!,
        partnerId: userInfo.partnerId,
        treePath: userInfo.treePath!
      })
      setSelectedResult(result)
      setExpandedViolations(prev => ({
        ...prev,
        [resultId]: true
      }))
    } catch (error: any) {
      console.error('상세 결과 조회 실패:', error)

      setSelectedResult(null)
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
          text: 'text-emerald-700',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          badge: 'bg-emerald-500 text-white'
        }
      case 'B':
        return {
          text: 'text-blue-700',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          badge: 'bg-blue-500 text-white'
        }
      case 'C':
        return {
          text: 'text-yellow-700',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          badge: 'bg-yellow-500 text-white'
        }
      case 'D':
        return {
          text: 'text-red-700',
          bg: 'bg-red-50',
          border: 'border-red-200',
          badge: 'bg-red-500 text-white'
        }
      default:
        return {
          text: 'text-gray-700',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          badge: 'bg-gray-500 text-white'
        }
    }
  }

  // 점수별 진행바 색상
  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 90) return 'bg-emerald-500'
    if (percentage >= 80) return 'bg-blue-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
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
        {/* 결과 목록 */}
        <div className="lg:col-span-3">
          <div className="border shadow-xl rounded-xl backdrop-blur-sm bg-white/95 border-white/50">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-gray-900">진단 결과 목록</h2>
                  <div className="relative group">
                    <AlertCircle className="w-4 h-4 text-orange-500 cursor-pointer" />
                    <div className="absolute z-10 hidden w-64 p-3 text-sm text-orange-800 transform -translate-x-1/2 bg-white border border-orange-200 rounded shadow-lg left-1/2 top-full group-hover:block">
                      <p>• 진단 결과를 클릭하면 상세 정보를 확인할 수 있습니다</p>
                      <p>• 위반 항목은 펼쳐서 상세 내용을 확인하세요</p>
                      <p>• 위반 항목을 클릭하면 법적 근거를 볼 수 있습니다</p>
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

            <div className="p-6">
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
                  {results.map(result => {
                    const gradeStyle = getGradeStyle(result.finalGrade)
                    const scorePercentage =
                      (result.actualScore / result.totalPossibleScore) * 100
                    const isExpanded = expandedViolations[result.id]
                    const violationCount =
                      selectedResult?.id === result.id && selectedResult.answers
                        ? selectedResult.answers.filter(a => a.answer === 'no').length
                        : result.criticalViolationCount

                    return (
                      <div
                        key={result.id}
                        className="p-5 transition-all border border-gray-200 rounded-xl bg-white/50 hover:border-gray-300 hover:shadow-lg">
                        {/* 기본 정보 섹션 */}
                        <div
                          onClick={() => fetchDetailResult(result.id)}
                          className="cursor-pointer">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900">
                                  {result.companyName}
                                </h3>
                                <p className="text-sm text-gray-600">자가진단 결과</p>
                              </div>
                            </div>
                            <span
                              className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${gradeStyle.badge}`}>
                              등급 {result.finalGrade}
                            </span>
                          </div>

                          {/* 점수 진행바 */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2 text-sm">
                              <span className="font-medium text-gray-700">종합 점수</span>
                              <span className="font-bold text-gray-900">
                                {result.actualScore.toFixed(1)} /{' '}
                                {result.totalPossibleScore.toFixed(1)}
                                <span className="ml-1 text-blue-600">
                                  ({scorePercentage.toFixed(1)}%)
                                </span>
                              </span>
                            </div>
                            <div className="w-full h-3 overflow-hidden bg-gray-200 rounded-full">
                              <div
                                className={`h-3 rounded-full transition-all duration-500 ${getScoreColor(
                                  result.actualScore,
                                  result.totalPossibleScore
                                )}`}
                                style={{width: `${Math.min(scorePercentage, 100)}%`}}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="p-3 text-center rounded-lg bg-gray-50">
                              <span className="block mb-1 text-gray-500">진단 점수</span>
                              <p className="text-lg font-bold text-gray-900">
                                {result.score}점
                              </p>
                            </div>
                            <div className="p-3 text-center rounded-lg bg-gray-50">
                              <span className="block mb-1 text-gray-500">위반 건수</span>
                              <p
                                className={`font-bold text-lg ${
                                  violationCount > 0 ? 'text-red-400' : 'text-green-500'
                                }`}>
                                {violationCount}건
                              </p>
                            </div>
                            <div className="p-3 text-center rounded-lg bg-gray-50">
                              <span className="block mb-1 text-gray-500">완료 일시</span>
                              <p className="font-bold text-gray-900">
                                {new Date(result.completedAt).toLocaleString('ko-KR', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 위반 항목 토글 버튼 - 항상 표시 */}
                        {selectedResult?.id === result.id && selectedResult.answers && (
                          <div className="pt-4 mt-4 border-t border-gray-200">
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                toggleViolationExpansion(result.id)
                              }}
                              className="flex items-center justify-between w-full p-3 text-left transition-colors rounded-lg hover:bg-gray-50">
                              <div className="flex items-center space-x-2">
                                <AlertCircle className="w-5 h-5 text-orange-500" />
                                <span className="font-medium text-gray-900">
                                  위반 항목 상세 정보
                                </span>
                                <span className="px-2 py-1 text-xs font-bold text-orange-800 bg-orange-100 rounded-full">
                                  {
                                    selectedResult.answers.filter(a => a.answer === 'no')
                                      .length
                                  }
                                  건
                                </span>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </button>

                            {/* 위반 항목 상세 */}
                            {isExpanded && (
                              <div className="mt-3 space-y-3">
                                {selectedResult.answers.filter(a => a.answer === 'no')
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
                                  <div className="space-y-2">
                                    {selectedResult.answers
                                      .filter(a => a.answer === 'no')
                                      .map((a, i) => (
                                        <div
                                          key={i}
                                          className="p-3 transition-colors border border-red-200 rounded-lg cursor-pointer bg-red-50 hover:bg-red-100"
                                          onClick={e => {
                                            e.stopPropagation()
                                            handleViolationClick(a.questionId)
                                          }}>
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                              <XCircle className="w-4 h-4 text-red-500" />
                                              <span className="text-sm font-medium text-red-700">
                                                {a.questionId} 항목 위반
                                              </span>
                                            </div>
                                            <span className="text-xs text-red-600 hover:underline">
                                              상세 보기
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </div>
                            )}
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
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 border border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium tracking-wide text-blue-500 uppercase">
                      질문 ID
                    </span>
                    <div className="px-3 py-1 text-xs font-bold text-blue-800 bg-blue-100 rounded-full">
                      {selectedViolationId}
                    </div>
                  </div>
                  <div className="h-px mb-3 bg-gray-200"></div>
                  <p className="text-lg font-bold text-gray-900">{selectedViolationId}</p>
                </div>

                <div className="p-4 border border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-white">
                  <div className="flex items-center mb-3 space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium tracking-wide text-blue-600 uppercase">
                      카테고리
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {violationMeta.category}
                  </p>
                </div>

                <div className="p-4 border border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-white">
                  <div className="flex items-center mb-3 space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium tracking-wide uppercase text-blued-600">
                      벌칙 정보
                    </span>
                  </div>
                  <p className="text-lg font-bold leading-relaxed text-gray-900">
                    {violationMeta.penaltyInfo}
                  </p>
                </div>

                <div className="p-4 border border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-white">
                  <div className="flex items-center mb-3 space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium tracking-wide text-blue-600 uppercase">
                      법적 근거
                    </span>
                  </div>
                  <p className="text-lg font-bold leading-relaxed text-gray-900">
                    {violationMeta.legalBasis}
                  </p>
                </div>
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
