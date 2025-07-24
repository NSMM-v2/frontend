'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {Bar, Line} from 'react-chartjs-2'
import {useState, useEffect} from 'react'
import authService, {UserInfo} from '@/services/authService'
import {fetchPartnerMonthlyEmissions} from '@/services/scopeService'
import {materialAssignmentService} from '@/services/materialAssignmentService'
import {
  MonthlyEmissionSummary,
  MappedMaterialCodeListItem,
  MappedMaterialMonthlyAggregationResponse,
  MappedMaterialDetail
} from '@/types/scopeTypes'

// ============================================================================
// Chart.js 설정 (Chart.js Configuration)
// ============================================================================

ChartJS.register(BarElement, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false, // 높이를 부모에 맞게 조정
  plugins: {
    legend: {position: 'top' as const},
    title: {display: true, text: '월별 탄소 배출량'}
  },
  scales: {
    x: {stacked: true},
    y: {stacked: true}
  }
}

// 차트 데이터는 이제 동적으로 생성됩니다.

// ============================================================================
// 타입 정의 (Type Definitions)
// ============================================================================

/**
 * 협력사 정보 인터페이스
 * auth-service의 PartnerResponse 타입 매핑
 */
interface PartnerInfo {
  partnerId: number // 협력사 ID
  uuid: string // UUID
  companyName: string // 회사명
  hierarchicalId: string // 계층적 아이디 (L1-001, L2-001 등)
  level: number // 협력사 레벨 (1차, 2차, 3차)
  status: string // 상태
  parentPartnerId?: number // 상위 협력사 ID
  parentPartnerName?: string // 상위 협력사명
  createdAt: string // 생성일시
}

export default function ScopeDashboard() {
  // ========================================================================
  // 상태 관리 (State Management)
  // ========================================================================

  const [partners, setPartners] = useState<PartnerInfo[]>([]) // 협력사 목록
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null) // 현재 사용자 정보
  const [loading, setLoading] = useState(true) // 로딩 상태
  const [error, setError] = useState<string | null>(null) // 에러 상태
  const [selectedPartner, setSelectedPartner] = useState<PartnerInfo | null>(null) // 선택된 협력사
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()) // 선택된 년도
  const [monthlyData, setMonthlyData] = useState<MonthlyEmissionSummary[]>([]) // 월별 배출량 데이터
  const [chartLoading, setChartLoading] = useState(false) // 차트 로딩 상태
  const [chartError, setChartError] = useState<string | null>(null) // 차트 에러 상태

  // 맵핑된 자재코드 관련 상태
  const [mappedMaterials, setMappedMaterials] = useState<MappedMaterialCodeListItem[]>([]) // 맵핑된 자재코드 목록
  const [selectedMaterial, setSelectedMaterial] =
    useState<MappedMaterialCodeListItem | null>(null) // 선택된 자재

  const [materialMonthlyData, setMaterialMonthlyData] =
    useState<MappedMaterialMonthlyAggregationResponse | null>(null) // 자재 월별 총합 데이터
  const [materialLoading, setMaterialLoading] = useState(false) // 자재 로딩 상태
  const [materialError, setMaterialError] = useState<string | null>(null) // 자재 에러 상태

  // UI 상태 관리
  const [searchQuery, setSearchQuery] = useState('') // 검색 쿼리
  const [activeTab, setActiveTab] = useState<'company' | 'material'>('company') // 활성 탭
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar') // 차트 유형 (막대/꺾은선)

  // ========================================================================
  // 생명주기 관리 (Lifecycle Management)
  // ========================================================================

  useEffect(() => {
    loadPartnerData()
    loadMappedMaterials() // 맵핑된 자재코드 목록도 초기 로드
  }, [])

  // 선택된 협력사가 있으면 자동으로 현재 년도 데이터 로드
  useEffect(() => {
    if (selectedPartner?.partnerId !== undefined && !chartLoading) {
      loadPartnerMonthlyData(selectedPartner.partnerId, selectedYear)
    }
  }, [selectedPartner?.partnerId])

  // 자재 탭에서 첫 번째 자재 선택 시 월별 데이터 로드
  useEffect(() => {
    if (selectedMaterial && activeTab === 'material' && !materialLoading) {
      loadMaterialMonthlyData(selectedYear)
    }
  }, [selectedMaterial, activeTab])

  // ========================================================================
  // API 호출 함수 (API Call Functions)
  // ========================================================================

  /**
   * 권한에 따른 협력사 데이터 로드
   * 본사: 모든 협력사, 협력사: 본인 + 직속 하위만
   */
  const loadPartnerData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 현재 사용자 정보 조회
      const userResponse = await authService.getCurrentUserByType()
      if (!userResponse || !userResponse.success) {
        throw new Error('사용자 정보를 가져올 수 없습니다')
      }

      setUserInfo({
        userType: userResponse.data.userType,
        companyName: userResponse.data.companyName,
        level: userResponse.data.level,
        headquartersId: userResponse.data.headquartersId
          ? Number(userResponse.data.headquartersId)
          : undefined,
        partnerId: userResponse.data.partnerId
          ? Number(userResponse.data.partnerId)
          : undefined,
        accountNumber: userResponse.data.accountNumber // 추가 필드들도 포함
      } as UserInfo)

      // 접근 가능한 협력사 목록 조회
      const partnersResponse = await authService.getAccessiblePartners()
      if (!partnersResponse || !partnersResponse.success) {
        throw new Error('협력사 목록을 가져올 수 없습니다')
      }

      // 협력사 데이터 매핑
      const partnerData: PartnerInfo[] = partnersResponse.data.map((partner: any) => ({
        partnerId: partner.partnerId,
        uuid: partner.uuid,
        companyName: partner.companyName,
        hierarchicalId: partner.hierarchicalId,
        level: partner.level,
        status: partner.status,
        contactPerson: partner.contactPerson,
        parentPartnerId: partner.parentPartnerId,
        parentPartnerName: partner.parentPartnerName,
        createdAt: partner.createdAt
      }))

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
      }
    } catch (err) {
      console.error('협력사 데이터 로드 실패:', err)
      setError(err instanceof Error ? err.message : '데이터 로드 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 맵핑된 자재코드 목록 로드
   */
  const loadMappedMaterials = async () => {
    try {
      setMaterialLoading(true)
      setMaterialError(null)

      const materials = await materialAssignmentService.getMappedMaterialCodeList()
      setMappedMaterials(materials)

      // 첫 번째 자재를 기본 선택
      if (materials.length > 0) {
        setSelectedMaterial(materials[0])
      }
    } catch (error) {
      console.error('맵핑된 자재코드 목록 로드 실패:', error)
      setMaterialError(
        error instanceof Error
          ? error.message
          : '자재코드 목록 로드 중 오류가 발생했습니다'
      )
      setMappedMaterials([])
    } finally {
      setMaterialLoading(false)
    }
  }


  /**
   * 자재 월별 총합 데이터 로드
   */
  const loadMaterialMonthlyData = async (year: number) => {
    try {
      setMaterialLoading(true)
      setMaterialError(null)

      const monthlyData =
        await materialAssignmentService.getMappedMaterialMonthlyAggregation(year)
      setMaterialMonthlyData(monthlyData)
    } catch (error) {
      console.error('자재 월별 총합 데이터 로드 실패:', error)
      setMaterialError(
        error instanceof Error
          ? error.message
          : '자재 월별 총합 데이터 로드 중 오류가 발생했습니다'
      )
      setMaterialMonthlyData(null)
    } finally {
      setMaterialLoading(false)
    }
  }

  // ========================================================================
  // 이벤트 핸들러 (Event Handlers)
  // ========================================================================

  /**
   * 협력사별 월별 배출량 데이터 로드
   */
  const loadPartnerMonthlyData = async (partnerId: number, year: number) => {
    try {
      setChartLoading(true)
      setChartError(null)
      const data = await fetchPartnerMonthlyEmissions(partnerId, year)
      setMonthlyData(data)
    } catch (error) {
      console.error('월별 배출량 데이터 로드 실패:', error)
      setChartError(
        error instanceof Error ? error.message : '데이터 로드 중 오류가 발생했습니다'
      )
      setMonthlyData([])
    } finally {
      setChartLoading(false)
    }
  }

  /**
   * 협력사 선택 핸들러
   */
  const handlePartnerSelect = (partner: PartnerInfo) => {
    setSelectedPartner(partner)
    // useEffect에서 자동으로 데이터를 로드하므로 여기서는 호출하지 않음
  }

  /**
   * 자재 선택 핸들러
   */
  const handleMaterialSelect = (material: MappedMaterialCodeListItem) => {
    setSelectedMaterial(material)
    // useEffect에서 자동으로 대시보드 데이터를 로드하므로 여기서는 호출하지 않음
  }

  // 스크롤 이벤트 전파 방지 핸들러
  const handleScrollEvent = (e: React.WheelEvent) => {
    e.stopPropagation()
  }

  // ========================================================================
  // 렌더링 헬퍼 함수 (Rendering Helper Functions)
  // ========================================================================

  /**
   * 검색 쿼리에 따른 필터링된 데이터 반환
   */
  const filteredPartners = partners.filter(partner => {
    const q = searchQuery.toLowerCase()
    return (
      partner.companyName.toLowerCase().includes(q) ||
      partner.hierarchicalId.toLowerCase().includes(q) ||
      (partner.parentPartnerName?.toLowerCase().includes(q) ?? false)
    )
  })

  const filteredMaterials = mappedMaterials.filter(material => {
    const q = searchQuery.toLowerCase()
    return (
      material.materialCode.toLowerCase().includes(q) ||
      material.materialName.toLowerCase().includes(q) ||
      material.materialDescription.toLowerCase().includes(q)
    )
  })

  /**
   * 협력사 레벨에 따른 스타일 클래스 반환
   */
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

  /**
   * 협력사 레벨 표시 텍스트 반환
   */
  const getLevelText = (level: number) => {
    // 문자열로 들어올 수 있으므로 숫자로 변환
    const numLevel = Number(level)
    if (numLevel === 0) {
      return '본사'
    }
    return `${numLevel}차 협력사`
  }

  /**
   * 월별 데이터를 기반으로 차트 데이터 생성 (협력사 탭용)
   */
  const generateChartData = () => {
    if (!monthlyData.length) {
      return {
        labels: [],
        datasets: []
      }
    }

    const labels = monthlyData.map(item => `${item.month}월`)
    const scope1Data = monthlyData.map(item => item.scope1Total)
    const scope2Data = monthlyData.map(item => item.scope2Total)
    const scope3Data = monthlyData.map(item => item.scope3Total)

    return {
      labels,
      datasets: [
        {
          label: 'Scope 1',
          data: scope1Data,
          backgroundColor: 'rgba(255, 99, 132, 0.5)'
        },
        {
          label: 'Scope 2',
          data: scope2Data,
          backgroundColor: 'rgba(53, 162, 235, 0.5)'
        },
        {
          label: 'Scope 3',
          data: scope3Data,
          backgroundColor: 'rgba(75, 192, 192, 0.5)'
        }
      ]
    }
  }


  /**
   * 자재 월별 총합 데이터를 기반으로 차트 데이터 생성 (자재 탭 월별 차트용)
   */
  const generateMaterialMonthlyChartData = () => {
    if (!materialMonthlyData?.monthlyTotals.length) {
      return {
        labels: [],
        datasets: []
      }
    }

    const labels = materialMonthlyData.monthlyTotals.map(item => `${item.month}월`)
    const totalEmissionData = materialMonthlyData.monthlyTotals.map(
      item => item.totalEmission
    )

    const baseDataset = {
      label: '총 배출량',
      data: totalEmissionData,
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2
    }

    // 꺾은선 그래프용 추가 속성
    if (chartType === 'line') {
      return {
        labels,
        datasets: [
          {
            ...baseDataset,
            fill: false,
            tension: 0.4, // 곡선 부드럽게
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: 'rgba(75, 192, 192, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }
        ]
      }
    }

    // 막대그래프용
    return {
      labels,
      datasets: [baseDataset]
    }
  }

  /**
   * 년도 옵션 생성 (현재년도 기준 ±2년)
   */
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      years.push(i)
    }
    return years
  }

  // ========================================================================
  // 메인 렌더링 (Main Rendering)
  // ========================================================================

  return (
    <div className="w-full h-screen pt-24 pb-4 overflow-hidden">
      <div className="flex flex-col w-full h-full gap-4">
        <div className="flex flex-row h-[50%] w-full gap-4">
          {/* ======================================================================
              협력사 리스트 섹션 (Partner List Section)
              ====================================================================== */}
          <Card className="w-[30%] flex flex-col h-full bg-white rounded-lg p-4">
            <Tabs defaultValue="company" className="flex flex-col w-full h-full min-h-0">
              <div className="flex flex-row items-center justify-between gap-2">
                <TabsList>
                  <TabsTrigger value="company" onClick={() => setActiveTab('company')}>
                    협력사
                  </TabsTrigger>
                  <TabsTrigger value="material" onClick={() => setActiveTab('material')}>
                    자재
                  </TabsTrigger>
                </TabsList>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={
                    activeTab === 'company' ? '협력사 검색' : '자재코드/자재명 검색'
                  }
                  className="w-full h-8 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <CardContent className="flex-1 min-h-0 p-0 mt-2 overflow-hidden border rounded-lg">
                <TabsContent
                  value="company"
                  className="h-full overflow-y-auto custom-scrollbar allow-scroll"
                  style={{overscrollBehavior: 'contain', touchAction: 'pan-y'}}
                  onWheel={handleScrollEvent}>
                  <div className="flex flex-col h-full min-h-0 gap-2 p-2">
                    {loading && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-sm text-gray-500">
                          협력사 목록을 불러오는 중...
                        </div>
                      </div>
                    )}

                    {/* 에러 상태 */}
                    {error && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-sm text-center text-red-500">
                          <div>오류가 발생했습니다</div>
                          <div className="mt-1 text-xs">{error}</div>
                          <button
                            onClick={loadPartnerData}
                            className="px-3 py-1 mt-2 text-xs text-red-700 bg-red-100 rounded hover:bg-red-200">
                            다시 시도
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 협력사 목록 */}
                    {!loading && !error && partners.length === 0 && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-sm text-center text-gray-500">
                          <div>등록된 협력사가 없습니다</div>
                          {userInfo?.userType === 'HEADQUARTERS' && (
                            <div className="mt-1 text-xs">협력사를 먼저 등록해주세요</div>
                          )}
                        </div>
                      </div>
                    )}

                    {!loading &&
                      !error &&
                      filteredPartners.map(partner => (
                        <div
                          key={partner.partnerId}
                          onClick={() => handlePartnerSelect(partner)}
                          className={`rounded-lg border min-h-16 p-3 cursor-pointer transition-all duration-200
                            ${
                              selectedPartner?.partnerId === partner.partnerId
                                ? 'border-blue-500 bg-blue-50 font-semibold shadow'
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
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>
                {/* 자재 탭 */}
                <TabsContent
                  value="material"
                  className="h-full overflow-y-auto custom-scrollbar"
                  style={{overscrollBehavior: 'contain', touchAction: 'pan-y'}}
                  onWheel={handleScrollEvent}>
                  <div className="flex flex-col h-full min-h-0 gap-2 p-2">
                    {/* 로딩 상태 */}
                    {materialLoading && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-sm text-gray-500">
                          자재코드 목록을 불러오는 중...
                        </div>
                      </div>
                    )}

                    {/* 에러 상태 */}
                    {materialError && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-sm text-center text-red-500">
                          <div>오류가 발생했습니다</div>
                          <div className="mt-1 text-xs">{materialError}</div>
                          <button
                            onClick={loadMappedMaterials}
                            className="px-3 py-1 mt-2 text-xs text-red-700 bg-red-100 rounded hover:bg-red-200">
                            다시 시도
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 자재코드 목록 */}
                    {!materialLoading &&
                      !materialError &&
                      mappedMaterials.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-sm text-center text-gray-500">
                            <div>맵핑된 자재코드가 없습니다</div>
                            <div className="mt-1 text-xs">
                              자재코드를 먼저 할당받아주세요
                            </div>
                          </div>
                        </div>
                      )}

                    {!materialLoading &&
                      !materialError &&
                      filteredMaterials.map(material => (
                        <div
                          key={`${material.materialCode}-${
                            material.materialDescription || 'default'
                          }`}
                          onClick={() => handleMaterialSelect(material)}
                          className={`rounded-lg border min-h-16 p-3 cursor-pointer transition-all duration-200
                            ${
                              selectedMaterial?.materialCode === material.materialCode
                                ? 'border-blue-500 bg-blue-50 font-semibold shadow'
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                            }`}>
                          <div className="flex flex-col gap-1">
                            {/* 자재명 */}
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {material.materialName}
                            </div>

                            {/* 자재코드 */}
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-gray-500">
                                {material.materialCode}
                              </span>
                              {material.materialDescription && (
                                <span className="text-xs text-gray-400">
                                  {material.materialDescription}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          {/* ======================================================================
              탄소 배출량 차트 섹션 (Carbon Emissions Chart Section)
              ====================================================================== */}
          <Card className="w-[70%] bg-white rounded-lg p-4 flex flex-col">
            <CardHeader className="p-0 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">
                    {activeTab === 'company' ? '총 탄소 배출량' : '월별 총 배출량'}
                  </CardTitle>
                  <CardDescription>
                    {activeTab === 'company'
                      ? selectedPartner
                        ? selectedPartner.companyName
                        : '협력사를 선택해주세요'
                      : selectedMaterial
                      ? selectedMaterial.materialName
                      : '자재를 선택해주세요'}
                  </CardDescription>
                </div>
                {/* 차트 타입 전환 버튼 (자재 탭에서 월별 데이터가 2개 이상일 때만 표시) */}
                {activeTab === 'material' && 
                 materialMonthlyData?.monthlyTotals && 
                 materialMonthlyData.monthlyTotals.length >= 2 && (
                  <div className="flex items-center gap-2">
                    <div className="flex border border-gray-300 rounded-md">
                      <button
                        onClick={() => setChartType('bar')}
                        className={`px-3 py-2 text-lg ${
                          chartType === 'bar'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700'
                        } rounded-l-md hover:bg-blue-400 hover:text-white transition-colors`}
                        title="막대그래프">
                        📊
                      </button>
                      <button
                        onClick={() => setChartType('line')}
                        className={`px-3 py-2 text-lg ${
                          chartType === 'line'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700'
                        } rounded-r-md hover:bg-blue-400 hover:text-white transition-colors`}
                        title="꺾은선그래프">
                        📈
                      </button>
                    </div>
                  </div>
                )}
                {/* 년도 선택 드롭다운 */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">년도:</label>
                  <select
                    value={selectedYear}
                    onChange={e => {
                      const year = Number(e.target.value)
                      setSelectedYear(year)
                      if (
                        activeTab === 'company' &&
                        selectedPartner?.partnerId !== undefined
                      ) {
                        loadPartnerMonthlyData(selectedPartner.partnerId, year)
                      } else if (activeTab === 'material' && selectedMaterial) {
                        loadMaterialMonthlyData(year)
                      }
                    }}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    {generateYearOptions().map(year => (
                      <option key={year} value={year}>
                        {year}년
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-2 border rounded-lg">
              {activeTab === 'company' ? (
                // 협력사 탭 차트
                selectedPartner ? (
                  chartError ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center text-red-500">
                        <div className="mb-2 text-lg">❌</div>
                        <div>데이터 로드 실패</div>
                        <div className="mt-1 text-sm">{chartError}</div>
                        <button
                          onClick={() =>
                            selectedPartner &&
                            selectedPartner.partnerId !== undefined &&
                            loadPartnerMonthlyData(
                              selectedPartner.partnerId,
                              selectedYear
                            )
                          }
                          className="px-3 py-1 mt-2 text-xs text-red-700 bg-red-100 rounded hover:bg-red-200">
                          다시 시도
                        </button>
                      </div>
                    </div>
                  ) : monthlyData.length > 0 ? (
                    <div className="w-full h-full">
                      <Bar options={chartOptions} data={generateChartData()} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center text-gray-500">
                        <div className="mb-2 text-lg">📝</div>
                        <div>{selectedYear}년 배출량 데이터가 없습니다</div>
                        <div className="text-sm">다른 년도를 선택해보세요</div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="text-center text-gray-500">
                      <div className="mb-2 text-lg">📊</div>
                      <div>협력사를 선택하면</div>
                      <div>해당 협력사의 탄소 배출량 데이터를 표시합니다</div>
                    </div>
                  </div>
                )
              ) : // 자재 탭 차트 (월별 총합만)
              selectedMaterial ? (
                materialError ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="text-center text-red-500">
                      <div className="mb-2 text-lg">❌</div>
                      <div>데이터 로드 실패</div>
                      <div className="mt-1 text-sm">{materialError}</div>
                      <button
                        onClick={() => {
                          loadMaterialMonthlyData(selectedYear)
                        }}
                        className="px-3 py-1 mt-2 text-xs text-red-700 bg-red-100 rounded hover:bg-red-200">
                        다시 시도
                      </button>
                    </div>
                  </div>
                ) : materialMonthlyData?.monthlyTotals.length ? (
                  // 월별 총합 차트 (막대그래프 또는 꺾은선그래프)
                  <div className="w-full h-full">
                    {chartType === 'bar' ? (
                      <Bar
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            title: {display: true, text: '월별 총 배출량'}
                          },
                          scales: {
                            x: {stacked: false},
                            y: {stacked: false}
                          }
                        }}
                        data={generateMaterialMonthlyChartData()}
                      />
                    ) : (
                      <Line
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            title: {display: true, text: '월별 총 배출량'}
                          },
                          scales: {
                            x: {stacked: false},
                            y: {stacked: false}
                          }
                        }}
                        data={generateMaterialMonthlyChartData()}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="text-center text-gray-500">
                      <div className="mb-2 text-lg">📝</div>
                      <div>{selectedYear}년 월별 배출량 데이터가 없습니다</div>
                      <div className="text-sm">다른 년도를 선택해보세요</div>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="text-center text-gray-500">
                    <div className="mb-2 text-lg">🏭</div>
                    <div>자재를 선택하면</div>
                    <div>해당 자재의 배출량 데이터를 표시합니다</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ======================================================================
            배출량 데이터 테이블 섹션 (Emissions Data Table Section)
            ====================================================================== */}
        <Card className="flex flex-col w-full h-[48%] p-4 bg-white rounded-lg">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-bold">
              {activeTab === 'company' ? '탄소 배출량 데이터' : '월별 배출량 상세 데이터'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-0 mt-2 overflow-y-auto border rounded-lg custom-scrollbar allow-scroll">
            {activeTab === 'company' ? (
              // 협력사 탭 테이블
              selectedPartner ? (
                chartError ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="text-center text-red-500">
                      <div className="mb-2 text-lg">❌</div>
                      <div>데이터 로드 실패</div>
                      <div className="mt-1 text-sm">{chartError}</div>
                      <button
                        onClick={() =>
                          selectedPartner &&
                          selectedPartner.partnerId !== undefined &&
                          loadPartnerMonthlyData(selectedPartner.partnerId, selectedYear)
                        }
                        className="px-3 py-1 mt-2 text-xs text-red-700 bg-red-100 rounded hover:bg-red-200">
                        다시 시도
                      </button>
                    </div>
                  </div>
                ) : monthlyData.length > 0 ? (
                  <table className="w-full h-full overflow-y-auto custom-scrollbar allow-scroll">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-center border">월</th>
                        <th className="px-4 py-2 text-center border">Scope 1 (tCO₂eq)</th>
                        <th className="px-4 py-2 text-center border">Scope 2 (tCO₂eq)</th>
                        <th className="px-4 py-2 text-center border">Scope 3 (tCO₂eq)</th>
                        <th className="px-4 py-2 text-center border">
                          총 배출량 (tCO₂eq)
                        </th>
                        <th className="px-4 py-2 text-center border">데이터 건수</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyData.map(item => (
                        <tr key={item.month} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-center border">
                            {selectedYear}년 {item.month}월
                          </td>
                          <td className="px-4 py-2 text-right border">
                            {item.scope1Total.toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-right border">
                            {item.scope2Total.toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-right border">
                            {item.scope3Total.toLocaleString()}
                          </td>
                          <td className="px-4 py-2 font-medium text-right border">
                            {item.totalEmission.toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-center text-gray-600 border">
                            {item.dataCount}건
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr className="font-bold">
                        <td className="px-4 py-2 text-center border">합계</td>
                        <td className="px-4 py-2 text-right border">
                          {monthlyData
                            .reduce((sum, item) => sum + item.scope1Total, 0)
                            .toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right border">
                          {monthlyData
                            .reduce((sum, item) => sum + item.scope2Total, 0)
                            .toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right border">
                          {monthlyData
                            .reduce((sum, item) => sum + item.scope3Total, 0)
                            .toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right border">
                          {monthlyData
                            .reduce((sum, item) => sum + item.totalEmission, 0)
                            .toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-center border">
                          {monthlyData.reduce((sum, item) => sum + item.dataCount, 0)}건
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <div className="mb-2 text-lg">📝</div>
                      <div>{selectedYear}년 배출량 데이터가 없습니다</div>
                      <div className="text-sm">다른 년도를 선택해보세요</div>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <div className="mb-2 text-lg">📋</div>
                    <div>협력사를 선택하면</div>
                    <div>해당 협력사의 월별 배출량 데이터를 표시합니다</div>
                  </div>
                </div>
              )
            ) : // 자재 탭 테이블 (월별 총합 테이블만)
            selectedMaterial ? (
              materialError ? (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="text-center text-red-500">
                    <div className="mb-2 text-lg">❌</div>
                    <div>데이터 로드 실패</div>
                    <div className="mt-1 text-sm">{materialError}</div>
                    <button
                      onClick={() => {
                        loadMaterialMonthlyData(selectedYear)
                      }}
                      className="px-3 py-1 mt-2 text-xs text-red-700 bg-red-100 rounded hover:bg-red-200">
                      다시 시도
                    </button>
                  </div>
                </div>
              ) : materialMonthlyData?.materialDetails.length ? (
                // 월별 총합 테이블 - 자재별 상세 정보 표시
                <table className="w-full h-full overflow-y-auto custom-scrollbar allow-scroll">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-center border">자재명</th>
                      <th className="px-4 py-2 text-center border">내부 자재코드</th>
                      <th className="px-4 py-2 text-center border">상위 자재코드</th>
                      <th className="px-4 py-2 text-center border">Scope 1 (tCO₂eq)</th>
                      <th className="px-4 py-2 text-center border">Scope 2 (tCO₂eq)</th>
                      <th className="px-4 py-2 text-center border">
                        통합 배출량 (tCO₂eq)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialMonthlyData.materialDetails.map((item, index) => (
                      <tr
                        key={`${item.internalMaterialCode}-${index}`}
                        className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-center border">
                          {item.materialName}
                        </td>
                        <td className="px-4 py-2 font-mono text-center border">
                          {item.internalMaterialCode}
                        </td>
                        <td className="px-4 py-2 font-mono text-center text-blue-600 border">
                          {item.upstreamMaterialCode || '-'}
                        </td>
                        <td className="px-4 py-2 text-right border">
                          {item.scope1Emission.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right border">
                          {item.scope2Emission.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 font-medium text-right border">
                          {item.totalEmission.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr className="font-bold">
                      <td className="px-4 py-2 text-center border" colSpan={3}>
                        합계
                      </td>
                      <td className="px-4 py-2 text-right border">
                        {materialMonthlyData.materialDetails
                          .reduce((sum, item) => sum + item.scope1Emission, 0)
                          .toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right border">
                        {materialMonthlyData.materialDetails
                          .reduce((sum, item) => sum + item.scope2Emission, 0)
                          .toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right border">
                        {materialMonthlyData.materialDetails
                          .reduce((sum, item) => sum + item.totalEmission, 0)
                          .toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <div className="mb-2 text-lg">📝</div>
                    <div>{selectedYear}년 월별 배출량 데이터가 없습니다</div>
                    <div className="text-sm">다른 년도를 선택해보세요</div>
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <div className="mb-2 text-lg">🏭</div>
                  <div>자재를 선택하면</div>
                  <div>해당 자재의 상세 배출량 데이터를 표시합니다</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
