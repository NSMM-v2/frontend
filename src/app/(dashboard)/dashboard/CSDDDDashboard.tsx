'use client'

import {useState, useMemo, useEffect} from 'react'
import {useRouter} from 'next/navigation'
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
import {questions} from '@/app/(dashboard)/CSDDD/self-assessment/selfAssessmentForm'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'

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
  Shield,
  BarChart3,
  ExternalLink,
  Users,
  HardHat,
  Leaf,
  Package,
  ShieldCheck,
  AlertCircle,
  AlertOctagon,
  Scale,
  InfoIcon
} from 'lucide-react'

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'
import {Radar} from 'react-chartjs-2'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

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

interface CategoryInfo {
  id: string
  name: string
  icon: React.ComponentType<{className?: string}>
  violations: any[]
}

const gradeColors: Record<string, string> = {
  A: 'bg-emerald-500 text-white',
  B: 'bg-blue-500 text-white',
  C: 'bg-yellow-500 text-white',
  D: 'bg-red-500 text-white'
}

const categoryIcons = {
  '1': Users,
  '2': HardHat,
  '3': Leaf,
  '4': Package,
  '5': ShieldCheck
}

export default function CSDDDDashboard() {
  const router = useRouter()
  const [partners, setPartners] = useState<PartnerInfo[]>([])
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPartner, setSelectedPartner] = useState<PartnerInfo | null>(null)
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [detailedResults, setDetailedResults] = useState<DetailedResult>({})
  const [violationMeta, setViolationMeta] = useState<{
    category: string
    penaltyInfo: string
    legalBasis: string
  } | null>(null)
  const [selectedViolationId, setSelectedViolationId] = useState<string | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  useEffect(() => {
    loadPartnerData()
  }, [])

  const loadPartnerData = async () => {
    try {
      setLoading(true)
      setError(null)

      const userResponse = await authService.getCurrentUserByType()
      if (!userResponse || !userResponse.success) {
        throw new Error('사용자 정보를 가져올 수 없습니다')
      }

      const userData = userResponse.data
      setUserInfo(userData)

      console.log('[CSDDDDashboard] 현재 사용자 정보:', {
        userType: userData.userType,
        companyName: userData.companyName
      })

      const myResultsResponse = await getSelfAssessmentResults({
        onlyPartners: false
      })

      const myResultsFiltered = (myResultsResponse.content || [])
        .filter(
          result =>
            result.companyName.trim().toLowerCase() ===
            userData.companyName.trim().toLowerCase()
        )
        .sort(
          (a, b) =>
            new Date(b.completedAt ?? new Date()).getTime() -
            new Date(a.completedAt ?? new Date()).getTime()
        )

      setMyResults(myResultsFiltered)

      const partnersResponse = await authService.getAccessiblePartners()
      if (!partnersResponse || !partnersResponse.success) {
        throw new Error('협력사 목록을 가져올 수 없습니다')
      }

      console.log(
        '[CSDDDDashboard] 접근 가능한 파트너 목록:',
        partnersResponse.data.map(p => ({
          companyName: p.companyName,
          level: p.level,
          partnerId: p.partnerId
        }))
      )

      let response: PaginatedSelfAssessmentResponse

      if (userData.userType === 'HEADQUARTERS') {
        response = await getSelfAssessmentResults({
          onlyPartners: true // 협력사 결과만 가져오기
        })
      } else if (userData.userType === 'PARTNER') {
        // 협력사인 경우 모든 결과를 가져와서 자기 자신과 하위 협력사 모두 포함
        response = await getSelfAssessmentResults({
          onlyPartners: false // 모든 결과 가져오기 (자기 자신 포함)
        })
      } else {
        setPartners([])
        return
      }

      console.log('[CSDDDDashboard] 자가진단 결과 조회:', {
        userType: userData.userType,
        totalResults: response.content?.length || 0,
        results:
          response.content?.map(r => ({
            companyName: r.companyName,
            completedAt: r.completedAt,
            finalGrade: r.finalGrade
          })) || []
      })

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

      let partnerData: PartnerInfo[] = partnersResponse.data.map((partner: any) => {
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

      // 협력사인 경우 자기 자신이 목록에 없다면 추가
      if (userData.userType === 'PARTNER') {
        const selfExists = partnerData.some(p => p.companyName === userData.companyName)
        if (!selfExists) {
          console.log('[CSDDDDashboard] 협력사 자신을 목록에 추가:', userData.companyName)

          const selfResults = resultsByCompany[userData.companyName] || []
          const selfPartner: PartnerInfo = {
            partnerId: (userData as any).partnerId || 0,
            uuid: `self-${userData.companyName}`,
            companyName: userData.companyName,
            hierarchicalId: `self-${userData.companyName}`,
            level: 1, // 협력사는 기본적으로 level 1로 설정
            status: 'ACTIVE',
            parentPartnerId: undefined,
            parentPartnerName: undefined,
            createdAt: new Date().toISOString(),
            results: selfResults.sort((a, b) => {
              const dateA = new Date(a.completedAt || 0).getTime()
              const dateB = new Date(b.completedAt || 0).getTime()
              return dateB - dateA
            })
          }

          partnerData.unshift(selfPartner) // 맨 앞에 추가
        }
      }

      const sortedPartners = partnerData.sort((a, b) => {
        if (a.level !== b.level) {
          return a.level - b.level
        }
        return a.hierarchicalId.localeCompare(b.hierarchicalId)
      })

      console.log(
        '[CSDDDDashboard] 최종 파트너 데이터 매핑 결과:',
        sortedPartners.map(p => ({
          companyName: p.companyName,
          level: p.level,
          resultsCount: p.results.length,
          hasResults: p.results.length > 0
        }))
      )

      setPartners(sortedPartners)

      // 본사 제외한 협력사 중 첫 번째 자동 선택
      const partnersOnly = sortedPartners.filter(partner => partner.level > 0)
      if (partnersOnly.length > 0) {
        setSelectedPartner(partnersOnly[0])
        setSelectedResultIndex(0)
      } else {
        setSelectedPartner(null)
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

  const [myResults, setMyResults] = useState<SelfAssessmentResponse[]>([])

  const currentResult = useMemo(() => {
    if (!selectedPartner || !selectedPartner.results[selectedResultIndex]) return null
    return selectedPartner.results[selectedResultIndex]
  }, [selectedPartner, selectedResultIndex])

  useEffect(() => {
    if (currentResult) {
      fetchDetailResult(currentResult.id)
    }
  }, [currentResult])

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

  // 등급 기반 점수 계산 함수 (카테고리별 최저 등급 기준)
  const calculateGradeBasedScore = (categoryAnswers: any[]) => {
    const gradePoints = {A: 100, B: 80, C: 60, D: 40}
    const gradeOrder = ['A', 'B', 'C', 'D'] // 등급 순서 (A가 최고, D가 최저)

    let lowestGrade = 'A' // 기본값은 A등급

    categoryAnswers.forEach(answer => {
      // 해당 질문의 criticalViolation 정보 찾기
      const question = questions.find(q => q.id === answer.questionId)

      if (answer.answer === false) {
        // 오답인 경우에만 등급 확인
        if (question?.criticalViolation) {
          const grade = question.criticalViolation.grade
          // 현재 등급이 기존 최저 등급보다 낮으면 업데이트
          if (gradeOrder.indexOf(grade) > gradeOrder.indexOf(lowestGrade)) {
            lowestGrade = grade
          }
        }
        // criticalViolation이 없는 일반 위반은 등급에 영향 없음 (A등급 유지)
      }
    })

    return gradePoints[lowestGrade as keyof typeof gradePoints] || 100
  }

  // 기본 준수율 계산 함수 (기존 방식)
  const calculateBasicComplianceRate = (categoryAnswers: any[]) => {
    const total = categoryAnswers.length
    const correct = categoryAnswers.filter(a => a.answer === true).length
    return total === 0 ? 0 : Math.round((correct / total) * 100)
  }

  const getCategoryInfo = (): CategoryInfo[] => {
    const allCategories = ['1', '2', '3', '4', '5']
    const violationsByCategory =
      currentResult && detailedResults[currentResult.id]
        ? groupViolationsByCategory(detailedResults[currentResult.id].answers || [])
        : {}

    return allCategories.map(categoryId => ({
      id: categoryId,
      name: getCategoryName(categoryId),
      icon: categoryIcons[categoryId as keyof typeof categoryIcons],
      violations: violationsByCategory[categoryId] || []
    }))
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

  const filteredPartners = useMemo(() => {
    const q = searchQuery.toLowerCase()
    // 본사(level: 0) 제외하고 협력사만 필터링
    const partnersOnly = partners.filter(partner => partner.level > 0)

    if (!q) return partnersOnly
    return partnersOnly.filter(
      partner =>
        partner.companyName.toLowerCase().includes(q) ||
        partner.hierarchicalId.toLowerCase().includes(q) ||
        (partner.parentPartnerName?.toLowerCase().includes(q) ?? false)
    )
  }, [partners, searchQuery])

  const getLevelStyle = (level: number) => {
    // 문자열로 들어올 수 있으므로 숫자로 변환
    const numLevel = Number(level)
    switch (numLevel) {
      case 0:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800' // 본사
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
    // 문자열로 들어올 수 있으므로 숫자로 변환
    const numLevel = Number(level)
    if (numLevel === 0) {
      return '본사'
    }
    return `${numLevel}차 협력사`
  }

  const handlePartnerSelect = (partner: PartnerInfo) => {
    setSelectedPartner(partner)
    setSelectedResultIndex(0)
  }

  const handleResultSummaryClick = () => {
    router.push('/CSDDD/evaluation')
  }

  const getSelectedCategoryViolations = () => {
    if (!selectedCategoryId || !currentResult || !detailedResults[currentResult.id])
      return []

    const violationsByCategory = groupViolationsByCategory(
      detailedResults[currentResult.id].answers || []
    )
    return violationsByCategory[selectedCategoryId] || []
  }

  return (
    <div className="w-full h-screen pt-24 pb-4">
      <div className="flex flex-col w-full h-full gap-4">
        {userInfo && (
          <div
            onClick={handleResultSummaryClick}
            className="p-8 transition-colors border rounded-lg shadow-sm cursor-pointer bg-white/80 border-white/60 hover:bg-white/90">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">
                {userInfo?.companyName} 최신 자가진단 결과 요약
              </h2>
              {myResults.length > 0 && myResults[0].completedAt && (
                <div className="text-sm text-gray-500">
                  완료일시:{' '}
                  {new Date(myResults[0].completedAt).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
            <div className="flex flex-row justify-between gap-4">
              {(() => {
                const myResult = myResults.length > 0 ? myResults[0] : null

                if (!myResult) {
                  return (
                    <div className="p-4 text-center text-gray-500 border rounded-lg col-span-full bg-gray-50">
                      <div className="text-sm">아직 자가진단 결과가 없습니다.</div>
                      <div className="mt-1 text-xs">
                        자가진단을 완료하시면 결과가 표시됩니다.
                      </div>
                    </div>
                  )
                }

                const gradeStyle = getGradeStyle(myResult.finalGrade || 'D')
                return (
                  <>
                    <div className="w-full p-3 border rounded-lg bg-gradient-to-br from-blue-50 to-white">
                      <div className="mb-1 text-xs text-gray-500">등급</div>
                      <div className={`text-lg font-bold ${gradeStyle.text}`}>
                        {myResult.finalGrade || 'D'}
                      </div>
                    </div>
                    <div className="w-full p-3 border rounded-lg bg-gradient-to-br from-blue-50 to-white">
                      <div className="mb-1 text-xs text-gray-500">진단 점수</div>
                      <div className="text-lg font-bold text-gray-900">
                        {myResult.score || 0}/100
                      </div>
                    </div>
                    <div className="w-full p-3 border rounded-lg bg-gradient-to-br from-blue-50 to-white">
                      <div className="mb-1 text-xs text-gray-500">종합 점수</div>
                      <div className="text-lg font-bold text-gray-900">
                        {myResult.actualScore?.toFixed(1) || 0}/
                        {myResult.totalPossibleScore?.toFixed(1) || 0}
                      </div>
                    </div>
                    <div className="w-full p-3 border rounded-lg bg-gradient-to-br from-blue-50 to-white">
                      <div className="mb-1 text-xs text-gray-500">총 위반</div>
                      <div className="text-lg font-bold text-gray-900">
                        {myResult.noAnswerCount || 0}건
                      </div>
                    </div>
                    <div className="w-full p-3 border rounded-lg bg-gradient-to-br from-blue-50 to-white">
                      <div className="mb-1 text-xs text-gray-500">중대 위반</div>
                      <div className="text-lg font-bold text-gray-900">
                        {myResult.criticalViolationCount || 0}건
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}

        <div className="flex flex-row gap-4 w-full h-[calc(100vh-300px)]">
          <Card className="w-[30%] h-full bg-white rounded-lg p-4 flex flex-col">
            <div className="flex flex-row items-center justify-between gap-2 mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="협력사 검색"
                className="w-full h-8 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col flex-1 gap-2 p-2 overflow-y-auto border rounded-lg custom-scrollbar allow-scroll">
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
                    className={`rounded-lg border shadow-sm min-h-16 p-3 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                      selectedPartner?.partnerId === partner.partnerId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}>
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {partner.companyName}
                      </div>

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
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="w-[70%] h-full bg-white rounded-lg p-4 flex flex-col overflow-hidden">
            <CardHeader className="flex flex-row items-center flex-shrink-0 gap-4 p-0 pb-4 border-b border-gray-100">
              <div className="flex items-center flex-1">
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

                {selectedPartner?.results && selectedPartner.results.length > 0 && (
                  <select
                    value={selectedResultIndex}
                    onChange={e => setSelectedResultIndex(Number(e.target.value))}
                    className="px-2 py-1 ml-auto text-sm text-gray-700 bg-white border rounded-md shadow-sm">
                    {[...selectedPartner.results]
                      .sort(
                        (a, b) =>
                          new Date(b.completedAt || 0).getTime() -
                          new Date(a.completedAt || 0).getTime()
                      )
                      .map((result, index) => (
                        <option key={result.id} value={index}>
                          {selectedPartner.results.length - index}회차 (
                          {new Date(result.completedAt || '').toLocaleDateString('ko-KR')}
                          )
                        </option>
                      ))}
                  </select>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 overflow-y-auto custom-scrollbar allow-scroll">
              {selectedPartner && currentResult ? (
                <>
                  <div className="flex flex-row justify-between w-full gap-4">
                    <div className="flex flex-row items-center w-full gap-2 p-3 border rounded-lg bg-gradient-to-br from-blue-50 to-white">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-xs text-gray-500">진단 점수</div>
                        <div className="font-semibold text-gray-900">
                          {currentResult.score || 0}/100
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row items-center w-full gap-2 p-3 border rounded-lg bg-gradient-to-br from-blue-50 to-white">
                      <BarChart3 className="w-5 h-5 text-gray-700" />
                      <div>
                        <div className="text-xs text-gray-500">종합 점수</div>
                        <div className="font-semibold text-gray-900">
                          {currentResult.actualScore?.toFixed(1) || '0.0'}/132.5
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row items-center w-full gap-2 p-3 border rounded-lg bg-gradient-to-br from-blue-50 to-white">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <div className="text-xs text-gray-500">총 위반</div>
                        <div className="font-semibold text-gray-900">
                          {currentResult.noAnswerCount || 0}건
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row items-center w-full gap-2 p-3 border rounded-lg bg-gradient-to-br from-blue-50 to-white">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <div>
                        <div className="text-xs text-gray-500">중대 위반</div>
                        <div className="font-semibold text-gray-900">
                          {currentResult.criticalViolationCount || 0}건
                        </div>
                      </div>
                    </div>
                  </div>

                  {currentResult && detailedResults[currentResult.id] && (
                    <div className="p-4 mt-1 bg-white border border-gray-200 shadow-sm rounded-xl">
                      {/* 차트 컨테이너 */}
                      <div className="overflow-x-auto">
                        <div className="min-w-[500px] max-w-[700px] w-full h-[400px] mx-auto">
                          <Radar
                            style={{width: '100%', height: '100%'}}
                            data={{
                              labels: [
                                '인권 및 노동',
                                '산업안전 및 보건',
                                '환경 경영',
                                '공급망 및 조달',
                                '윤리경영 및 정보보호'
                              ],
                              datasets: [
                                {
                                  label: '기본 준수율 (%)',
                                  data: ['1', '2', '3', '4', '5'].map(id => {
                                    const answers =
                                      detailedResults[currentResult.id]?.answers || []
                                    const categoryAnswers = answers.filter(a =>
                                      a.questionId.startsWith(id + '.')
                                    )
                                    return calculateBasicComplianceRate(categoryAnswers)
                                  }),
                                  backgroundColor: 'rgba(53, 162, 235, 0.2)',
                                  borderColor: 'rgba(53, 162, 235, 1)',
                                  borderWidth: 2,
                                  pointBackgroundColor: 'rgba(53, 162, 235, 1)',
                                  pointBorderColor: '#ffffff',
                                  pointBorderWidth: 2,
                                  pointRadius: 6,
                                  pointHoverRadius: 8,
                                  pointHoverBackgroundColor: 'rgba(53, 162, 235, 1)',
                                  pointHoverBorderColor: '#ffffff',
                                  pointHoverBorderWidth: 3
                                },
                                {
                                  label: '등급 반영 점수',
                                  data: ['1', '2', '3', '4', '5'].map(id => {
                                    const answers =
                                      detailedResults[currentResult.id]?.answers || []
                                    const categoryAnswers = answers.filter(a =>
                                      a.questionId.startsWith(id + '.')
                                    )
                                    return calculateGradeBasedScore(categoryAnswers)
                                  }),
                                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                  borderColor: 'rgba(255, 99, 132, 1)',
                                  borderWidth: 2,
                                  pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                                  pointBorderColor: '#ffffff',
                                  pointBorderWidth: 2,
                                  pointRadius: 6,
                                  pointHoverRadius: 8,
                                  pointHoverBackgroundColor: 'rgba(255, 99, 132, 1)',
                                  pointHoverBorderColor: '#ffffff',
                                  pointHoverBorderWidth: 3
                                }
                              ]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              interaction: {
                                intersect: false,
                                mode: 'point'
                              },
                              scales: {
                                r: {
                                  min: 0,
                                  max: 100,
                                  beginAtZero: true,
                                  angleLines: {
                                    display: true,
                                    color: 'rgba(0, 0, 0, 0.1)',
                                    lineWidth: 1
                                  },
                                  grid: {
                                    display: true,
                                    color: 'rgba(0, 0, 0, 0.1)',
                                    lineWidth: 1
                                  },
                                  pointLabels: {
                                    font: {
                                      size: 13,
                                      weight: 600
                                    },
                                    color: '#374151',
                                    padding: 20
                                  },
                                  ticks: {
                                    display: true,
                                    stepSize: 20,
                                    color: '#9CA3AF',
                                    font: {
                                      size: 11
                                    },
                                    backdropColor: 'rgba(255, 255, 255, 0.8)',
                                    backdropPadding: 4,
                                    callback: function (value) {
                                      return value + '%'
                                    }
                                  }
                                }
                              },
                              plugins: {
                                legend: {
                                  display: true,
                                  position: 'bottom',
                                  labels: {
                                    padding: 20,
                                    font: {
                                      size: 13,
                                      weight: 500
                                    },
                                    color: '#374151',
                                    usePointStyle: true,
                                    pointStyle: 'circle'
                                  }
                                },
                                tooltip: {
                                  enabled: true,
                                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                  titleColor: '#ffffff',
                                  bodyColor: '#ffffff',
                                  cornerRadius: 8,
                                  padding: 12,
                                  displayColors: true,
                                  callbacks: {
                                    title: function (context) {
                                      return context[0].label
                                    },
                                    label: function (context) {
                                      const datasetLabel =
                                        context.dataset.label || '알 수 없음'
                                      const value = context.parsed.r
                                      if (datasetLabel.includes('준수율')) {
                                        return `${datasetLabel}: ${value}%`
                                      } else {
                                        return `${datasetLabel}: ${value}점`
                                      }
                                    },
                                    afterBody: function (context) {
                                      if (context.length === 2) {
                                        const basic =
                                          context.find(c =>
                                            c.dataset.label?.includes('준수율')
                                          )?.parsed.r || 0
                                        const grade =
                                          context.find(c =>
                                            c.dataset.label?.includes('등급')
                                          )?.parsed.r || 0
                                        const diff = basic - grade

                                        // 카테고리별 중대 위반 항목 찾기
                                        const categoryId = String(
                                          context[0].dataIndex + 1
                                        )
                                        const answers =
                                          detailedResults[currentResult.id]?.answers || []
                                        const categoryAnswers = answers.filter(a =>
                                          a.questionId.startsWith(categoryId + '.')
                                        )
                                        const criticalViolations = categoryAnswers.filter(
                                          answer => {
                                            const question = questions.find(
                                              q => q.id === answer.questionId
                                            )
                                            return (
                                              answer.answer === false &&
                                              question?.criticalViolation
                                            )
                                          }
                                        )

                                        const result = []
                                        if (diff > 10) {
                                          result.push(
                                            '',
                                            `⚠️ 중대 위반으로 인한 점수 차이: ${diff}점`
                                          )
                                        }

                                        if (criticalViolations.length > 0) {
                                          result.push(
                                            '',
                                            `🚨 중대 위반 항목: ${criticalViolations.length}건`
                                          )
                                          criticalViolations
                                            .slice(0, 3)
                                            .forEach(violation => {
                                              const question = questions.find(
                                                q => q.id === violation.questionId
                                              )
                                              if (question?.criticalViolation) {
                                                result.push(
                                                  `   • ${violation.questionId}: ${question.criticalViolation.grade}등급`
                                                )
                                              }
                                            })
                                          if (criticalViolations.length > 3) {
                                            result.push(
                                              `   • 외 ${
                                                criticalViolations.length - 3
                                              }건...`
                                            )
                                          }
                                        }

                                        return result
                                      }
                                      return []
                                    }
                                  }
                                }
                              },
                              elements: {
                                line: {
                                  tension: 0
                                }
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* 차트 설명 */}
                      <div className="p-4 mt-1 border rounded-lg bg-gradient-to-r from-blue-50 to-red-50">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-blue-700">
                              기본 준수율
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                            <span className="text-sm font-medium text-red-700">
                              등급 반영 점수
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-600">
                          <strong>파란색 선(기본 준수율)</strong>: 단순 정답률 기준 <br />
                          <strong>빨간색 선(등급 반영 점수)</strong>: 카테고리별 최저
                          중대위반 등급에 따른 점수 적용 <br />
                          <span className="py-1 text-xs bg-gray-100 rounded ">
                            A등급=100점, B등급=80점, C등급=60점, D등급=40점
                          </span>
                          <br />
                          중대위반이 1개라도 있으면 해당 카테고리 전체가 해당 등급 점수로
                          결정됩니다.
                        </p>
                      </div>

                      {/* 상세 점수 요약 삭제됨 */}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-24 text-gray-400">
                  <Shield className="w-16 h-16 mb-4 text-gray-200" />
                  <div className="text-lg font-bold">
                    협력사의 자가진단 결과가 없습니다.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* 카테고리 상세 다이얼로그 */}
        <Dialog
          open={!!selectedCategoryId}
          onOpenChange={() => setSelectedCategoryId(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-xl font-bold">
                {selectedCategoryId && getCategoryName(selectedCategoryId)} 상세 위반 항목
              </DialogTitle>
              <DialogDescription>
                해당 카테고리의 위반 항목들을 확인하실 수 있습니다.
              </DialogDescription>
            </DialogHeader>

            <div className="pt-6">
              {getSelectedCategoryViolations().length === 0 ? (
                <div className="py-16 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h3 className="mb-2 text-lg font-semibold text-green-600">
                    모든 항목 준수
                  </h3>
                  <p className="text-sm text-gray-500">
                    이 카테고리에서는 위반 항목이 없습니다.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <h4 className="font-medium text-red-800">
                        총 {getSelectedCategoryViolations().length}건의 위반 항목
                      </h4>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                      {getSelectedCategoryViolations().map((violation, i) => (
                        <button
                          key={i}
                          onClick={() => handleViolationClick(violation.questionId)}
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
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* 위반 항목 상세 다이얼로그 */}
        <Dialog
          open={!!selectedViolationId}
          onOpenChange={() => {
            setSelectedViolationId(null)
            setViolationMeta(null)
          }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                위반 항목 상세 정보
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 font-mono text-sm font-medium text-blue-800 border border-blue-200 rounded-full bg-blue-50">
                  {selectedViolationId}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="pt-6">
              {violationMeta ? (
                <div className="space-y-4">
                  {/* 카테고리 분류 */}
                  <div className="p-6 border border-blue-200 shadow-sm bg-gradient-to-br from-blue-50 to-white rounded-xl">
                    <h4 className="flex items-center gap-2 pb-3 mb-4 text-lg font-semibold text-blue-900 border-b border-blue-100">
                      <Users className="w-5 h-5" />
                      카테고리 분류
                    </h4>
                    <p className="text-base leading-relaxed text-gray-900">
                      {violationMeta.category}
                    </p>
                  </div>

                  {/* 벌칙 및 제재 내용 */}
                  <div className="p-6 border border-red-200 shadow-sm bg-gradient-to-br from-red-50 to-white rounded-xl">
                    <h4 className="flex items-center gap-2 pb-3 mb-4 text-lg font-semibold text-red-900 border-b border-red-100">
                      <AlertOctagon className="w-5 h-5" />
                      벌칙 및 제재 내용
                    </h4>
                    <p className="text-base leading-relaxed text-gray-900 whitespace-pre-wrap">
                      {violationMeta.penaltyInfo}
                    </p>
                  </div>

                  {/* 관련 법적 근거 */}
                  <div className="p-6 border border-purple-200 shadow-sm bg-gradient-to-br from-purple-50 to-white rounded-xl">
                    <h4 className="flex items-center gap-2 pb-3 mb-4 text-lg font-semibold text-purple-900 border-b border-purple-100">
                      <Scale className="w-5 h-5" />
                      관련 법적 근거
                    </h4>
                    <p className="text-base leading-relaxed text-gray-900 whitespace-pre-wrap">
                      {violationMeta.legalBasis}
                    </p>
                  </div>

                  {/* 참고사항 */}
                  <div className="p-4 border border-gray-200 bg-gradient-to-br from-gray-50 to-white rounded-xl">
                    <div className="flex items-start gap-3 text-sm text-gray-700">
                      <InfoIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="mb-2 font-medium">참고사항</p>
                        <p className="leading-relaxed">
                          위 정보는 CSDDD(Corporate Sustainability Due Diligence
                          Directive) 지침에 따른 것으로, 실제 적용 시에는 관련 법무팀 또는
                          전문가와 상담하시기 바랍니다.
                        </p>
                      </div>
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
    </div>
  )
}
