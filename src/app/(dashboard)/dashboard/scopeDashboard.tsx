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
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {Bar} from 'react-chartjs-2'
import {useState, useEffect} from 'react'
import authService, {UserInfo} from '@/services/authService'
import {fetchPartnerMonthlyEmissions} from '@/services/scopeService'
import {MonthlyEmissionSummary} from '@/types/scopeTypes'

// ============================================================================
// Chart.js 설정 (Chart.js Configuration)
// ============================================================================

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend)

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

// =====================================================================================================================================================================임시 제품 리스트
const products = [
  {productName: '휠', productCode: 'L01'},
  {productName: '엔진', productCode: 'L02'},
  {productName: '차체', productCode: 'L03'}
] as const

type Product = (typeof products)[number]

export default function ScopeDashboard() {
  // ========================================================================
  // 상태 관리 (State Management)
  // ========================================================================

  const [partners, setPartners] = useState<PartnerInfo[]>([]) // 협력사 목록
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null) // 현재 사용자 정보
  const [loading, setLoading] = useState(true) // 로딩 상태
  const [error, setError] = useState<string | null>(null) // 에러 상태
  const [selectedPartner, setSelectedPartner] = useState<PartnerInfo | null>(null) // 선택된 협력사
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null) //선택한 제품============================================================================================
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()) // 선택된 년도
  const [monthlyData, setMonthlyData] = useState<MonthlyEmissionSummary[]>([]) // 월별 배출량 데이터
  const [chartLoading, setChartLoading] = useState(false) // 차트 로딩 상태
  const [chartError, setChartError] = useState<string | null>(null) // 차트 에러 상태

  // ========================================================================
  // 생명주기 관리 (Lifecycle Management)
  // ========================================================================

  useEffect(() => {
    loadPartnerData()
  }, [])

  // 선택된 협력사가 있으면 자동으로 현재 년도 데이터 로드
  useEffect(() => {
    if (selectedPartner?.partnerId !== undefined && !chartLoading) {
      loadPartnerMonthlyData(selectedPartner.partnerId, selectedYear)
    }
  }, [selectedPartner?.partnerId])

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
   * 년도 선택 핸들러
   */
  const handleYearSelect = (year: number) => {
    setSelectedYear(year)
    // 년도 변경 시 선택된 협력사가 있으면 데이터 다시 로드
    if (selectedPartner?.partnerId !== undefined) {
      loadPartnerMonthlyData(selectedPartner.partnerId, year)
    }
  }
  //============================================================================================================제품 선택 부분
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
  }
  //============================================================================================================search 부분

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'company' | 'product'>('company')

  const filteredPartners = partners.filter(partner => {
    const q = searchQuery.toLowerCase()
    return (
      partner.companyName.toLowerCase().includes(q) ||
      partner.hierarchicalId.toLowerCase().includes(q) ||
      (partner.parentPartnerName?.toLowerCase().includes(q) ?? false)
    )
  })

  const filteredProducts = products.filter(product => {
    const q = searchQuery.toLowerCase()
    return product.productCode.toLowerCase().includes(q)
  })

  // ========================================================================
  // 렌더링 헬퍼 함수 (Rendering Helper Functions)
  // ========================================================================

  /**
   * 협력사 레벨에 따른 스타일 클래스 반환
   */
  const getLevelStyle = (level: number) => {
    switch (level) {
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
    if (level === 0) {
      return '본사'
    }
    return `${level}차 협력사`
  }

  /**
   * 권한 정보 표시 텍스트 반환
   */
  const getAccessInfoText = () => {
    if (!userInfo) return ''

    if (userInfo.userType === 'HEADQUARTERS') {
      return '모든 협력사 조회 가능'
    } else {
      const level = userInfo.level || 1
      return `본인 + ${level + 1}차 협력사 조회 가능`
    }
  }

  /**
   * 월별 데이터를 기반으로 차트 데이터 생성
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
    <div className="py-4 pt-2 w-full h-screen">
      <div className="flex flex-col gap-4 w-full h-full">
        <div className="flex flex-row h-[50%] w-full gap-4">
          {/* ======================================================================
              협력사 리스트 섹션 (Partner List Section)
              ====================================================================== */}
          <Card className="w-[30%] flex-1 bg-white rounded-lg p-4 flex flex-col">
            <Tabs defaultValue="company" className="w-full">
              <div className="flex flex-row gap-2 justify-between items-center">
                <TabsList>
                  <TabsTrigger value="company" onClick={() => setActiveTab('company')}>
                    협력사
                  </TabsTrigger>
                  <TabsTrigger value="product" onClick={() => setActiveTab('product')}>
                    제품
                  </TabsTrigger>
                </TabsList>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={activeTab === 'company' ? '협력사 검색' : '제품코드 검색'}
                  className="p-2 w-full h-8 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <CardContent className="flex w-full max-h-[280px] p-0 overflow-hidden overflow-y-auto border rounded-lg custom-scrollbar">
                <TabsContent value="company">
                  <div className="flex flex-col gap-2 p-2 h-full">
                    {loading && (
                      <div className="flex justify-center items-center h-full">
                        <div className="text-sm text-gray-500">
                          협력사 목록을 불러오는 중...
                        </div>
                      </div>
                    )}

                    {/* 에러 상태 */}
                    {error && (
                      <div className="flex justify-center items-center h-full">
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
                      <div className="flex justify-center items-center h-full">
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
                            <div className="flex gap-2 items-center">
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
                      ))}
                  </div>
                </TabsContent>
                {/* 제품 탭 -------------------------------------------------- */}
                <TabsContent value="product">
                  <div className="flex overflow-y-auto flex-col flex-1 gap-2 p-2 rounded-lg border scroll-auto custom-scrollbar">
                    {filteredProducts.map(product => (
                      <div
                        key={product.productCode}
                        onClick={() => handleProductSelect(product)}
                        className={`rounded-lg border shadow-sm min-h-16 p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedProduct?.productCode === product.productCode
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }}`}>
                        <div className="font-medium">{product.productName}</div>
                        <div className="text-sm text-gray-500">{product.productCode}</div>
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
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg font-bold">총 탄소 배출량</CardTitle>
                  <CardDescription>
                    {selectedPartner
                      ? selectedPartner.companyName
                      : '협력사를 선택해주세요'}
                  </CardDescription>
                </div>
                {/* 년도 선택 드롭다운 */}
                <div className="flex gap-2 items-center">
                  <label className="text-sm font-medium text-gray-700">년도:</label>
                  <select
                    value={selectedYear}
                    onChange={e => handleYearSelect(Number(e.target.value))}
                    className="px-3 py-1 text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    {generateYearOptions().map(year => (
                      <option key={year} value={year}>
                        {year}년
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-2 rounded-lg border">
              {selectedPartner ? (
                chartError ? (
                  <div className="flex justify-center items-center w-full h-full">
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
                  <div className="w-full h-full">
                    <Bar options={chartOptions} data={generateChartData()} />
                  </div>
                ) : (
                  <div className="flex justify-center items-center w-full h-full">
                    <div className="text-center text-gray-500">
                      <div className="mb-2 text-lg">📝</div>
                      <div>{selectedYear}년 배출량 데이터가 없습니다</div>
                      <div className="text-sm">다른 년도를 선택해보세요</div>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex justify-center items-center w-full h-full">
                  <div className="text-center text-gray-500">
                    <div className="mb-2 text-lg">📊</div>
                    <div>협력사를 선택하면</div>
                    <div>해당 협력사의 탄소 배출량 데이터를 표시합니다</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ======================================================================
            배출량 데이터 테이블 섹션 (Emissions Data Table Section)
            ====================================================================== */}
        <Card className="flex flex-col flex-1 p-4 w-full bg-white rounded-lg">
          {/* 헤더 부분 ============================================================================================================================= */}
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-bold">탄소 배출량 데이터</CardTitle>
            <CardDescription>
              {selectedPartner
                ? `${selectedPartner.companyName} 상세 데이터`
                : '협력사를 선택해주세요'}
            </CardDescription>
          </CardHeader>
          {/* 콘텐트 부분 ============================================================================================================================= */}
          <CardContent className="overflow-y-auto flex-1 p-2 rounded-lg border scroll-auto custom-scrollbar">
            {selectedPartner ? (
              chartError ? (
                <div className="flex justify-center items-center w-full h-full">
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
              ) : // 데이터 테이블 =======================================================================================================================================
              monthlyData.length > 0 ? (
                <div className="max-h-0">
                  <table className="w-full text-sm border">
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
                </div>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center text-gray-500">
                    <div className="mb-2 text-lg">📝</div>
                    <div>{selectedYear}년 배출량 데이터가 없습니다</div>
                    <div className="text-sm">다른 년도를 선택해보세요</div>
                  </div>
                </div>
              )
            ) : (
              <div className="flex justify-center items-center h-full">
                <div className="text-center text-gray-500">
                  <div className="mb-2 text-lg">📋</div>
                  <div>협력사를 선택하면</div>
                  <div>해당 협력사의 월별 배출량 데이터를 표시합니다</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
