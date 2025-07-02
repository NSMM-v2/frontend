'use client'
import {useState, useEffect} from 'react'
import {Card, CardContent} from '@/components/ui/card'
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
  Building2,
  BarChart3,
  CheckCircle2,
  XCircle
} from 'lucide-react'

export default function PartnerEvaluationForm() {
  const [results, setResults] = useState<SelfAssessmentResponse[]>([])
  const [selectedResult, setSelectedResult] = useState<SelfAssessmentResponse | null>(
    null
  )
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

  // 결과 목록 조회 (본사용 - 협력사 결과만 조회)
  const fetchResults = async () => {
    setLoading(true)
    try {
      const user = await authService.getCurrentUserByType()
      if (!user || !user.success) {
        // setAuthError('로그인이 필요합니다.')
        setResults([])
        return
      }

      setUserInfo(user.data)

      // HQ ID 1 전체 결과 조회 (treePath, partnerId 미사용)
      const userInfo = {
        userType: user.data.userType,
        headquartersId: String(user.data.headquartersId)
      }

      const queryParams = {
        onlyPartners: true
      }

      // 🔍 Log params before API call
      // console.log('🔍 전송 파라미터:', {...userInfo, ...queryParams})

      const response: PaginatedSelfAssessmentResponse = await getSelfAssessmentResults(
        userInfo,
        queryParams
      )

      const partnerRes = await authService.getAccessiblePartners()
      const partnerMap = new Map(
        partnerRes.data.map((p: any) => [p.partnerId, p.companyName])
      )

      const enriched = (response.content || []).map(result => ({
        ...result,
        companyName: String(partnerMap.get(result.partnerId) ?? '알 수 없음')
      }))

      // 본사의 경우 본사 자체 결과는 제외하고 협력사 결과만 표시
      const filteredResults =
        user.data.userType === 'HEADQUARTERS'
          ? enriched.filter(result => result.partnerId !== 0 && result.partnerId !== null)
          : enriched

      setResults(filteredResults)

      if (filteredResults.length === 0 && user.data.userType === 'HEADQUARTERS') {
        // console.log('📋 관할 협력사의 진단 결과가 없습니다.')
      }
    } catch (error: any) {
      console.error('결과 조회 실패:', error)
      // if (error.response?.status === 401 || error.response?.status === 403) {
      //   setAuthError('접근 권한이 없습니다. 다시 로그인해주세요.')
      // } else {
      //   alert('결과를 불러오는데 실패했습니다.')
      // }
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
      const params: {
        userType: string
        headquartersId: string
        treePath: string
        partnerId?: string
      } = {
        userType: userInfo.userType,
        headquartersId: userInfo.headquartersId,
        treePath: String(
          (userInfo as any).treePath ??
            (userInfo as any).partner?.treePath ??
            (userInfo as any).headquarters?.treePath ??
            ''
        )
      }

      if (userInfo.userType === 'PARTNER') {
        params.partnerId = String(userInfo.partnerId ?? '')
      }

      const result = await getSelfAssessmentResult(resultId, params)
      setSelectedResult(result)
    } catch (error: any) {
      console.error('상세 결과 조회 실패:', error)

      // if (error.response?.status === 401) {
      //   setAuthError('로그인이 만료되었습니다. 다시 로그인해주세요.')
      //   setSelectedResult(null)
      // } else if (error.response?.status === 403) {
      //   setAuthError('해당 결과에 대한 접근 권한이 없습니다.')
      //   setSelectedResult(null)
      // } else if (error.response?.status === 404) {
      //   alert('요청한 결과를 찾을 수 없습니다.')
      //   setSelectedResult(null)
      // } else {
      //   alert('상세 결과를 불러오는데 실패했습니다.')
      //   setSelectedResult(null)
      // }
      setSelectedResult(null)
    } finally {
      setDetailLoading(false)
    }
  }

  // 로그인 페이지로 이동
  // const redirectToLogin = () => {
  //   window.location.href = '/login'
  // }

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

  // 인증 에러가 있는 경우
  // if (authError) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen p-4">
  //       <Card className="w-full max-w-md shadow-xl backdrop-blur-sm bg-white/95">
  //         <CardContent className="p-8 text-center">
  //           <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
  //           <h2 className="mb-2 text-xl font-semibold text-gray-900">접근 제한</h2>
  //           <p className="mb-6 text-gray-600">{authError}</p>
  //           <button
  //             onClick={redirectToLogin}
  //             className="w-full px-4 py-2 text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 hover:shadow-lg">
  //             로그인 페이지로 이동
  //           </button>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   )
  // }

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
                <span className="font-bold text-blue-600">
                  {userInfo?.userType === 'HEADQUARTERS'
                    ? '협력사 진단 결과'
                    : '자가진단 결과'}
                </span>
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
              description={
                userInfo?.userType === 'HEADQUARTERS'
                  ? '관할 협력사의 공급망 실사 지침 준수 현황 모니터링'
                  : '유럽연합 공급망 실사 지침 준수를 위한 종합 평가 시스템'
              }
              module="CSDDD"
              submodule="assessment"
            />
          </Link>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 px-4 pb-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* 결과 목록 */}
            <div className="lg:col-span-2">
              <div className="border shadow-xl rounded-xl backdrop-blur-sm bg-white/95 border-white/50">
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                      {userInfo?.userType === 'HEADQUARTERS'
                        ? '협력사 진단 결과 목록'
                        : '진단 결과 목록'}
                    </h2>
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
                  {/* 본사용 안내 메시지 */}
                  {userInfo?.userType === 'HEADQUARTERS' && (
                    <p className="mt-2 text-sm text-gray-600">
                      관할 협력사들의 CSDDD 자가진단 결과를 확인할 수 있습니다.
                    </p>
                  )}
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
                      <p className="font-medium text-gray-600">
                        {userInfo?.userType === 'HEADQUARTERS'
                          ? '관할 협력사의 진단 결과가 없습니다.'
                          : '진단 결과가 없습니다.'}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {userInfo?.userType === 'HEADQUARTERS'
                          ? '협력사들이 자가진단을 완료하면 결과가 표시됩니다.'
                          : '새로운 자가진단을 실시해보세요.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {results.map(result => {
                        const gradeStyle = getGradeStyle(result.finalGrade)
                        const scorePercentage =
                          (result.actualScore / result.totalPossibleScore) * 100
                        const isSelected = selectedResult?.id === result.id

                        return (
                          <div
                            key={result.id}
                            onClick={() => fetchDetailResult(result.id)}
                            className={`border rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg ${
                              isSelected
                                ? 'border-blue-400 shadow-lg bg-blue-50/50'
                                : 'border-gray-200 hover:border-gray-300 bg-white/50'
                            }`}>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <Building2 className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-900">
                                    {result.companyName}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {userInfo?.userType === 'HEADQUARTERS'
                                      ? '협력사 진단 결과'
                                      : '자가진단 결과'}
                                  </p>
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
                                <span className="font-medium text-gray-700">
                                  종합 점수
                                </span>
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
                                <span className="block mb-1 text-gray-500">
                                  진단 점수
                                </span>
                                <p className="text-lg font-bold text-gray-900">
                                  {result.score}점
                                </p>
                              </div>
                              <div className="p-3 text-center rounded-lg bg-gray-50">
                                <span className="block mb-1 text-gray-500">
                                  위반 건수
                                </span>
                                <p
                                  className={`font-bold text-lg ${
                                    result.criticalViolationCount > 0
                                      ? 'text-red-600'
                                      : 'text-green-600'
                                  }`}>
                                  {result.criticalViolationCount}건
                                </p>
                              </div>
                              <div className="p-3 text-center rounded-lg bg-gray-50">
                                <span className="block mb-1 text-gray-500">
                                  완료 일시
                                </span>
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
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 상세 결과 */}
            <div className="lg:col-span-1">
              <div className="sticky border shadow-xl top-6 rounded-xl backdrop-blur-sm bg-white/95 border-white/50">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">상세 결과</h2>
                </div>

                <div className="p-6">
                  {detailLoading ? (
                    <div className="py-8 text-center">
                      <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                      <p className="text-gray-600">상세 정보 로딩 중...</p>
                    </div>
                  ) : !selectedResult ? (
                    <div className="py-8 text-center">
                      <div className="p-4 mx-auto mb-4 rounded-full bg-blue-50 w-fit">
                        <FileText className="w-8 h-8 text-blue-500" />
                      </div>
                      <p className="mb-2 font-medium text-gray-700">
                        상세 정보를 확인하세요
                      </p>
                      <p className="text-sm leading-relaxed text-gray-500">
                        좌측에서 진단 결과를 선택하면
                        <br />
                        상세 정보를 확인할 수 있습니다.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* 기업 정보 */}
                      <div className="p-5 border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-gray-900">
                            {userInfo?.userType === 'HEADQUARTERS'
                              ? '협력사 진단 상세 결과'
                              : '자가진단 상세 결과'}
                          </h3>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-white/70">
                            <span className="text-sm font-medium text-gray-700">
                              최종 등급
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm ${
                                getGradeStyle(selectedResult.finalGrade).badge
                              }`}>
                              {selectedResult.finalGrade}
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-white/70">
                            <span className="text-sm font-medium text-gray-700">
                              총점
                            </span>
                            <span className="font-bold text-gray-900">
                              {selectedResult.actualScore.toFixed(1)} /{' '}
                              {selectedResult.totalPossibleScore.toFixed(1)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-white/70">
                            <span className="text-sm font-medium text-gray-700">
                              위반 건수
                            </span>
                            <span
                              className={`font-bold ${
                                selectedResult.criticalViolationCount > 0
                                  ? 'text-red-600'
                                  : 'text-green-600'
                              }`}>
                              {selectedResult.criticalViolationCount}건
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 위반 항목 요약 */}
                      {selectedResult.answers && (
                        <div>
                          <h4 className="mb-4 font-bold text-gray-900">위반 항목 요약</h4>
                          {selectedResult.answers.filter(a => a.answer === 'no')
                            .length === 0 ? (
                            <div className="p-4 border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-bold text-green-800">완벽한 준수</p>
                                  <p className="text-sm text-green-600">
                                    모든 항목을 준수했습니다.
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                                <p className="text-sm font-bold text-red-700">
                                  {
                                    selectedResult.answers.filter(a => a.answer === 'no')
                                      .length
                                  }
                                  개 항목 위반
                                </p>
                              </div>
                              {selectedResult.answers
                                .filter(a => a.answer === 'no')
                                .map((a, i) => (
                                  <div
                                    key={i}
                                    className="p-3 border border-red-200 rounded-lg bg-red-50"
                                    onClick={() => handleViolationClick(a.questionId)}>
                                    <div className="flex items-center space-x-2">
                                      <XCircle className="w-4 h-4 text-red-500" />
                                      <span className="text-sm font-medium text-red-700">
                                        {a.questionId} 항목 위반
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
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 위반 상세 정보 Dialog */}
      <Dialog
        open={!!selectedViolationId}
        onOpenChange={() => {
          setSelectedViolationId(null)
          setViolationMeta(null)
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>위반 상세 정보</DialogTitle>
            <DialogDescription>
              선택한 위반 항목의 세부 정보를 보여줍니다.
            </DialogDescription>
          </DialogHeader>
          {violationMeta ? (
            <div className="space-y-2">
              <p>
                <strong>질문 ID:</strong> {selectedViolationId}
              </p>
              <p>
                <strong>카테고리:</strong> {violationMeta.category}
              </p>
              <p>
                <strong>벌칙 정보:</strong> {violationMeta.penaltyInfo}
              </p>
              <p>
                <strong>법적 근거:</strong> {violationMeta.legalBasis}
              </p>
            </div>
          ) : (
            <p>로딩 중...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
