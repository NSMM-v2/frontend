'use client'

import {useState, useMemo, useEffect} from 'react'
import authService, {UserInfo} from '@/services/authService'
import {
  getSelfAssessmentResults,
  getSelfAssessmentResult,
  getViolationMeta
} from '@/services/csdddService'
import type {
  SelfAssessmentResponse,
  PaginatedSelfAssessmentResponse
} from '@/types/csdddType'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Shield,
  BarChart3,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react'

// 수정된 PartnerInfo 인터페이스
interface PartnerInfo {
  partnerId: number
  uuid: string
  companyName: string
  hierarchicalId: string
  level: number
  status: string
  parentPartnerId?: number
  parentPartnerName?: string
  createdAt: string
  results: SelfAssessmentResponse[]
}

interface DetailedResult {
  [key: number]: SelfAssessmentResponse
}

const gradeColors: Record<string, string> = {
  A: 'bg-emerald-500 text-white',
  B: 'bg-blue-500 text-white',
  C: 'bg-yellow-500 text-white',
  D: 'bg-red-500 text-white'
}

export default function CSDDDDashboard() {
  const [partners, setPartners] = useState<PartnerInfo[]>([])
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPartner, setSelectedPartner] = useState<PartnerInfo | null>(null)
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [detailedResults, setDetailedResults] = useState<DetailedResult>({})
  const [expandedViolations, setExpandedViolations] = useState<{[key: number]: boolean}>(
    {}
  )
  const [violationMeta, setViolationMeta] = useState<{
    category: string
    penaltyInfo: string
    legalBasis: string
  } | null>(null)
  const [selectedViolationId, setSelectedViolationId] = useState<string | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    loadPartnerData()
  }, [])

  // 수정된 데이터 로드 함수
  const loadPartnerData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 현재 사용자 정보 조회
      const userResponse = await authService.getCurrentUserByType()
      if (!userResponse || !userResponse.success) {
        throw new Error('사용자 정보를 가져올 수 없습니다')
      }

      const userData = userResponse.data
      setUserInfo(userData)

      // 접근 가능한 협력사 목록 조회
      const partnersResponse = await authService.getAccessiblePartners()
      if (!partnersResponse || !partnersResponse.success) {
        throw new Error('협력사 목록을 가져올 수 없습니다')
      }

      // 실제 자가진단 결과 데이터 가져오기
      let response: PaginatedSelfAssessmentResponse

      if (userData.userType === 'HEADQUARTERS') {
        response = await getSelfAssessmentResults({
          onlyPartners: true
        })
      } else if (userData.userType === 'PARTNER') {
        response = await getSelfAssessmentResults({
          onlyPartners: true
        })
      } else {
        setPartners([])
        return
      }

      // 협력사별로 결과 그룹화
      const resultsByCompany = (response.content || []).reduce(
        (
          acc: {[key: string]: SelfAssessmentResponse[]},
          result: SelfAssessmentResponse
        ) => {
          const companyName = result.companyName
          if (!acc[companyName]) {
            acc[companyName] = []
          }
          acc[companyName].push(result)
          return acc
        },
        {}
      )

      // 협력사 기본 정보와 결과 매핑
      const partnerData: PartnerInfo[] = partnersResponse.data.map((partner: any) => {
        const partnerResults = resultsByCompany[partner.companyName] || []

        return {
          partnerId: partner.partnerId,
          uuid: partner.uuid,
          companyName: partner.companyName,
          hierarchicalId: partner.hierarchicalId,
          level: partner.level,
          status: partner.status,
          parentPartnerId: partner.parentPartnerId,
          parentPartnerName: partner.parentPartnerName,
          createdAt: partner.createdAt,
          results: partnerResults.sort((a, b) => {
            const dateA = new Date(a.completedAt || 0).getTime()
            const dateB = new Date(b.completedAt || 0).getTime()
            return dateB - dateA
          })
        }
      })

      // 레벨별로 정렬 (1차 -> 2차 -> 3차 순)
      const sortedPartners = partnerData.sort((a, b) => {
        if (a.level !== b.level) {
          return a.level - b.level
        }
        return a.hierarchicalId.localeCompare(b.hierarchicalId)
      })

      setPartners(sortedPartners)

      // 첫 번째 협력사를 기본 선택
      if (sortedPartners.length > 0) {
        setSelectedPartner(sortedPartners[0])
        setSelectedResultIndex(0)
      }
    } catch (err) {
      console.error('협력사 데이터 로드 실패:', err)
      setError(err instanceof Error ? err.message : '데이터 로드 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const fetchDetailResult = async (resultId: number) => {
    if (detailedResults[resultId]) return detailedResults[resultId]

    setDetailLoading(true)
    try {
      const result = await getSelfAssessmentResult(resultId)
      setDetailedResults(prev => ({...prev, [resultId]: result}))
      return result
    } catch (error) {
      console.error('상세 결과 조회 실패:', error)
      return null
    } finally {
      setDetailLoading(false)
    }
  }

  const handleViolationClick = async (questionId: string) => {
    setSelectedViolationId(questionId)
    try {
      const meta = await getViolationMeta(questionId)
      setViolationMeta(meta)
    } catch (error) {
      console.error('Violation meta 불러오기 실패:', error)
    }
  }

  const toggleViolationExpansion = async (resultId: number) => {
    setExpandedViolations(prev => ({
      ...prev,
      [resultId]: !prev[resultId]
    }))

    if (!expandedViolations[resultId]) {
      await fetchDetailResult(resultId)
    }
  }

  const groupViolationsByCategory = (answers: any[]) => {
    const violations = answers.filter(a => a.answer === false)
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

  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case 'A':
        return {
          text: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          badge: 'bg-emerald-500 text-white'
        }
      case 'B':
        return {
          text: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          badge: 'bg-blue-500 text-white'
        }
      case 'C':
        return {
          text: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          badge: 'bg-yellow-500 text-white'
        }
      case 'D':
        return {
          text: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          badge: 'bg-red-500 text-white'
        }
      default:
        return {
          text: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          badge: 'bg-gray-500 text-white'
        }
    }
  }

  // 수정된 필터링 로직
  const filteredPartners = useMemo(() => {
    const q = searchQuery.toLowerCase()
    if (!q) return partners
    return partners.filter(
      partner =>
        partner.companyName.toLowerCase().includes(q) ||
        partner.hierarchicalId.toLowerCase().includes(q) ||
        (partner.parentPartnerName?.toLowerCase().includes(q) ?? false)
    )
  }, [partners, searchQuery])

  const getLevelStyle = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 2:
        return 'bg-green-50 border-green-200 text-green-800'
      case 3:
        return 'bg-purple-50 border-purple-200 text-purple-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getLevelText = (level: number) => {
    return `${level}차 협력사`
  }

  const handlePartnerSelect = (partner: PartnerInfo) => {
    setSelectedPartner(partner)
    setSelectedResultIndex(0)
  }

  // 현재 선택된 결과
  const currentResult = useMemo(() => {
    if (!selectedPartner || !selectedPartner.results[selectedResultIndex]) return null
    return selectedPartner.results[selectedResultIndex]
  }, [selectedPartner, selectedResultIndex])

  // 대시보드 통계

  return (
    <div className="h-[calc(100vh-80px)] w-full p-4">
      {/* 메인 레이아웃 */}
      <div className="flex flex-row gap-6 min-h-[450px]">
        {/* 협력사 목록 사이드바 */}
        <Card className="w-[30%] bg-white rounded-lg p-4 flex flex-col">
          <div className="flex flex-row items-center justify-between gap-2 mb-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="협력사 검색"
              className="w-full h-8 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col flex-1 gap-2 p-2 border rounded-lg max-h-[500px] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-500">
                협력사 목록을 불러오는 중...
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-sm text-center text-red-500">
                <div>오류가 발생했습니다</div>
                <div className="mt-1 text-xs">{error}</div>
                <button
                  onClick={loadPartnerData}
                  className="px-3 py-1 mt-2 text-xs text-red-700 bg-red-100 rounded hover:bg-red-200">
                  다시 시도
                </button>
              </div>
            ) : filteredPartners.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-500">
                {searchQuery ? '검색 결과가 없습니다' : '등록된 협력사가 없습니다'}
              </div>
            ) : (
              filteredPartners.map(partner => (
                <div
                  key={partner.partnerId}
                  onClick={() => handlePartnerSelect(partner)}
                  className={`rounded-lg border shadow-sm min-h-16 p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedPartner?.partnerId === partner.partnerId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}>
                  <div className="flex flex-col gap-1">
                    {/* 회사명 */}
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {partner.companyName}
                    </div>

                    {/* 계층적 ID와 레벨 */}
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-500">
                        {partner.hierarchicalId}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${getLevelStyle(
                          partner.level
                        )}`}>
                        {getLevelText(partner.level)}
                      </span>
                    </div>

                    {/* 상위 협력사 정보 (2차, 3차인 경우) */}
                    {partner.parentPartnerName && (
                      <div className="text-xs text-gray-400">
                        상위: {partner.parentPartnerName}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* 협력사 상세 패널 */}
        <Card className="flex-1 flex flex-col bg-white rounded-lg shadow-md min-h-[400px]">
          <CardHeader className="flex flex-row items-center gap-4 p-6 border-b border-gray-100">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                {currentResult && (
                  <Badge
                    className={`px-3 py-1 text-base font-bold rounded-full border ${
                      gradeColors[currentResult.finalGrade || 'D']
                    }`}>
                    {currentResult.finalGrade || 'D'}
                  </Badge>
                )}
                {selectedPartner ? selectedPartner.companyName : '협력사 상세'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 p-6">
            {selectedPartner && currentResult ? (
              <>
                {/* 회차 선택 탭 */}
                {selectedPartner.results.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50">
                    {[...selectedPartner.results]
                      .sort(
                        (a, b) =>
                          new Date(b.completedAt || 0).getTime() -
                          new Date(a.completedAt || 0).getTime()
                      )
                      .map((result, index) => (
                        <button
                          key={result.id}
                          onClick={() => setSelectedResultIndex(index)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            selectedResultIndex === index
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}>
                          {selectedPartner.results.length - index}회차
                          <span className="ml-1 text-xs opacity-75">
                            (
                            {new Date(result.completedAt || '').toLocaleDateString(
                              'ko-KR'
                            )}
                            )
                          </span>
                        </button>
                      ))}
                  </div>
                )}

                {/* 기본 정보 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-row items-center gap-2 p-3 border rounded-lg bg-gradient-to-br from-blue-50 to-white">
                    <BarChart3 className="w-5 h-5 text-blue-600" />

                    <div>
                      <div className="text-xs text-gray-500">진단 점수</div>
                      <div className="font-semibold text-gray-900">
                        {currentResult.score || 0}/100
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row items-center gap-2 p-3 border rounded-lg bg-gradient-to-br from-blue-50 to-white">
                    <BarChart3 className="w-5 h-5 text-gray-700" />
                    <div>
                      <div className="text-xs text-gray-500">종합 점수</div>
                      <div className="font-semibold text-gray-900">
                        {currentResult.actualScore?.toFixed(1) || '0.0'}/132.5
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row items-center gap-2 p-3 border rounded-lg bg-gradient-to-br from-blue-50 to-white">
                    <TrendingUp className="w-5 h-5 text-yellow-600" />
                    <div>
                      <div className="text-xs text-gray-500">총 위반</div>
                      <div className="font-semibold text-gray-900">
                        {currentResult.noAnswerCount || 0}건
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row items-center gap-2 p-3 border rounded-lg bg-gradient-to-br from-blue-50 to-white">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <div className="text-xs text-gray-500">중대 위반</div>
                      <div className="font-semibold text-gray-900">
                        {currentResult.criticalViolationCount || 0}건
                      </div>
                    </div>
                  </div>
                </div>

                {/* 위반 항목 상세 */}
                <div className="border rounded-lg">
                  <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <h3 className="font-medium text-gray-900">위반 항목 상세</h3>
                    <button
                      onClick={() => toggleViolationExpansion(currentResult.id)}
                      className="p-2 transition-colors rounded-full hover:bg-gray-100"
                      disabled={detailLoading}>
                      {detailLoading ? (
                        <div className="w-5 h-5 border-2 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                      ) : expandedViolations[currentResult.id] ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>

                  {expandedViolations[currentResult.id] &&
                    detailedResults[currentResult.id] && (
                      <div className="p-4">
                        {detailedResults[currentResult.id].answers?.filter(
                          a => a.answer === false
                        ).length === 0 ? (
                          <div className="py-8 text-center">
                            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                            <p className="font-medium text-green-600">모든 항목 준수</p>
                            <p className="text-sm text-gray-500">위반 항목이 없습니다.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {Object.entries(
                              groupViolationsByCategory(
                                detailedResults[currentResult.id].answers || []
                              )
                            ).map(([categoryId, violations]) => (
                              <div
                                key={categoryId}
                                className="border border-red-200 rounded-lg bg-red-50">
                                <div className="px-4 py-3 bg-red-100 border-b border-red-200">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-red-800">
                                      {getCategoryName(categoryId)}
                                    </h4>
                                    <Badge variant="destructive" className="text-xs">
                                      {violations.length}건
                                    </Badge>
                                  </div>
                                </div>
                                <div className="p-4">
                                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                                    {violations.map((violation, i) => (
                                      <button
                                        key={i}
                                        onClick={() =>
                                          handleViolationClick(violation.questionId)
                                        }
                                        className="flex items-center justify-center p-2 text-xs font-medium text-red-800 transition-colors bg-white border border-red-300 rounded-md hover:bg-red-50">
                                        <span className="font-mono truncate">
                                          {violation.questionId}
                                        </span>
                                        <ExternalLink className="w-3 h-3 ml-1" />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-24 text-gray-400">
                <Shield className="w-16 h-16 mb-4 text-gray-200" />
                <div className="text-lg font-bold">협력사를 선택하세요</div>
                <div className="mt-2 text-sm text-center">
                  왼쪽 목록에서 협력사를 클릭하면 상세 정보를 볼 수 있습니다.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 위반 항목 상세 모달 */}
      <Dialog
        open={!!selectedViolationId}
        onOpenChange={() => {
          setSelectedViolationId(null)
          setViolationMeta(null)
        }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl font-bold">위반 항목 상세 정보</DialogTitle>
            <DialogDescription>
              항목 ID:{' '}
              <span className="font-mono font-medium text-blue-600">
                {selectedViolationId}
              </span>
            </DialogDescription>
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
