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
import {Bar} from 'react-chartjs-2'
import {useState, useEffect} from 'react'
import authService from '@/services/authService'

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

const chartData = {
  labels: ['1월', '2월', '3월', '4월'],
  datasets: [
    {
      label: 'Scope 1',
      data: [100, 200, 150, 250],
      backgroundColor: 'rgba(255, 99, 132, 0.5)'
    },
    {
      label: 'Scope 2',
      data: [50, 100, 200, 100],
      backgroundColor: 'rgba(53, 162, 235, 0.5)'
    },
    {
      label: 'Scope 3',
      data: [75, 150, 125, 175],
      backgroundColor: 'rgba(75, 192, 192, 0.5)'
    }
  ]
}

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
  contactPerson: string // 담당자명
  parentPartnerId?: number // 상위 협력사 ID
  parentPartnerName?: string // 상위 협력사명
  createdAt: string // 생성일시
}

/**
 * 사용자 정보 인터페이스
 */
interface UserInfo {
  userType: 'HEADQUARTERS' | 'PARTNER'
  companyName: string
  level?: number
  headquartersId?: number
  partnerId?: number
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

  // ========================================================================
  // 생명주기 관리 (Lifecycle Management)
  // ========================================================================

  useEffect(() => {
    loadPartnerData()
  }, [])

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

      // line 133 수정
      setUserInfo({
        ...userResponse.data,
        headquartersId: userResponse.data.headquartersId
          ? Number(userResponse.data.headquartersId)
          : undefined,
        partnerId: userResponse.data.partnerId
          ? Number(userResponse.data.partnerId)
          : undefined
      })

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
   * 협력사 선택 핸들러
   */
  const handlePartnerSelect = (partner: PartnerInfo) => {
    setSelectedPartner(partner)
    // TODO: 선택된 협력사의 ESG 데이터 로드
    console.log('선택된 협력사:', partner.companyName)
  }

  // ========================================================================
  // 렌더링 헬퍼 함수 (Rendering Helper Functions)
  // ========================================================================

  /**
   * 협력사 레벨에 따른 스타일 클래스 반환
   */
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

  /**
   * 협력사 레벨 표시 텍스트 반환
   */
  const getLevelText = (level: number) => {
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

  // ========================================================================
  // 메인 렌더링 (Main Rendering)
  // ========================================================================

  return (
    <div className="h-[calc(100vh-80px)] w-full p-4">
      <div className="flex flex-col gap-4 w-full h-full">
        <div className="flex flex-row h-[50%] w-full gap-4">
          {/* ======================================================================
              협력사 리스트 섹션 (Partner List Section)
              ====================================================================== */}
          <Card className="w-[30%] bg-white rounded-lg p-4 flex flex-col">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-bold">협력사 리스트</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                {loading
                  ? '로딩 중...'
                  : `총 ${partners.length}개 · ${getAccessInfoText()}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex overflow-y-auto flex-col flex-1 gap-2 p-2 rounded-lg border scroll-auto custom-scrollbar">
              {/* 로딩 상태 */}
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
                partners.map(partner => (
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

                      {/* 담당자 */}
                      <div className="text-xs text-gray-400">
                        담당자: {partner.contactPerson}
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
            </CardContent>
          </Card>

          {/* ======================================================================
              탄소 배출량 차트 섹션 (Carbon Emissions Chart Section)
              ====================================================================== */}
          <Card className="w-[70%] bg-white rounded-lg p-4 flex flex-col">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-bold">총 탄소 배출량</CardTitle>
              <CardDescription>
                {selectedPartner ? selectedPartner.companyName : '협력사를 선택해주세요'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-2 rounded-lg border">
              {selectedPartner ? (
                <div className="w-full h-full">
                  <Bar options={chartOptions} data={chartData} />
                </div>
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
        <Card className="flex flex-col flex-1 p-4 bg-white rounded-lg">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-bold">탄소 배출량 데이터</CardTitle>
            <CardDescription>
              {selectedPartner
                ? `${selectedPartner.companyName} 상세 데이터`
                : '협력사를 선택해주세요'}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-y-auto flex-1 p-2 rounded-lg border scroll-auto custom-scrollbar">
            {selectedPartner ? (
              <div className="flex-1 max-h-0">
                <table className="min-w-full text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-center border">#</th>
                      <th className="px-4 py-2 text-center border">연도</th>
                      <th className="px-4 py-2 text-center border">일련번호</th>
                      <th className="px-4 py-2 text-center border">내부시설명</th>
                      <th className="px-4 py-2 text-center border">배출활동</th>
                      <th className="px-4 py-2 text-center border">활동자료</th>
                      <th className="px-4 py-2 text-center border">단위</th>
                      <th className="px-4 py-2 text-center border">수치</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(20)].map((_, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{index + 1}</td>
                        <td className="px-4 py-2 border">2025</td>
                        <td className="px-4 py-2 border">
                          {selectedPartner.hierarchicalId}-
                          {String(index + 1).padStart(3, '0')}
                        </td>
                        <td className="px-4 py-2 border">
                          제{Math.floor(index / 5) + 1}공장
                        </td>
                        <td className="px-4 py-2 border">
                          {index % 3 === 0
                            ? '연료 연소'
                            : index % 3 === 1
                            ? '전력 사용'
                            : '기타 배출'}
                        </td>
                        <td className="px-4 py-2 border">
                          {index % 3 === 0
                            ? '가스 사용량'
                            : index % 3 === 1
                            ? '전력 사용량'
                            : '기타 활동'}
                        </td>
                        <td className="px-4 py-2 border">tCO₂eq</td>
                        <td className="px-4 py-2 border">
                          {(Math.random() * 1000).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex justify-center items-center h-full">
                <div className="text-center text-gray-500">
                  <div className="mb-2 text-lg">📋</div>
                  <div>협력사를 선택하면</div>
                  <div>해당 협력사의 상세 배출량 데이터를 표시합니다</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
