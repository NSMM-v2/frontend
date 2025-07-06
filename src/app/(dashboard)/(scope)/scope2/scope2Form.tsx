/**
 * Scope 2 배출량 관리 폼 컴포넌트
 *
 * 주요 기능:
 * - 전력/스팀 사용량 데이터 관리
 * - 카테고리별 계산기 추가/삭제 기능
 * - CSV 데이터 기반 배출계수 적용
 * - 실시간 배출량 계산 및 집계
 * - scope3Form.tsx와 동일한 레이아웃 구조 적용
 * - 백엔드 API 연동으로 데이터 영속화 지원
 *
 * @author ESG Project Team
 * @version 1.0
 */
'use client'

// ============================================================================
// React 및 애니메이션 라이브러리 임포트 (React & Animation Imports)
// ============================================================================
import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'

// ============================================================================
// UI 아이콘 임포트 (UI Icon Imports)
// ============================================================================
import {
  Home, // 홈 아이콘
  Factory, // 공장 아이콘
  CalendarDays, // 달력 아이콘
  TrendingUp // 상승 트렌드 아이콘
} from 'lucide-react'

// ============================================================================
// 컴포넌트 임포트 (Component Imports)
// ============================================================================
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

// 레이아웃 컴포넌트 임포트
import {PageHeader} from '@/components/layout/PageHeader'

// 분리된 Scope2 컴포넌트들 임포트
import {
  CategorySelector,
  Scope2ElectricCategoryKey,
  Scope2SteamCategoryKey,
  scope2ElectricCategoryList,
  scope2SteamCategoryList
} from '@/components/scopeTotal/Scope123CategorySelector'
import {Scope2DataInput} from '@/components/scope12/Scope2DataInput'
import {MonthSelector} from '@/components/scopeTotal/Scope123MonthSelector'
import {Input} from '@/components/ui/input'
import {Card, CardContent} from '@/components/ui/card'

// ============================================================================
// 타입 및 서비스 임포트 (Types & Services Imports)
// ============================================================================
import {
  SelectorState,
  ScopeEmissionResponse,
  ScopeCategorySummary
} from '@/types/scopeTypes'
import {
  fetchEmissionsByYearAndMonth,
  fetchCategorySummaryByScope,
  deleteScopeEmission
} from '@/services/scopeService'

// ============================================================================
// 타입 정의 (Type Definitions)
// ============================================================================

/**
 * Scope 2 계산기 데이터 구조
 * 백엔드 ScopeEmission 엔티티와 연동되는 프론트엔드 계산기 상태
 */
interface CalculatorData {
  id: number // 식별자: emissionId(양수) 또는 임시ID(음수)
  state: SelectorState // 사용자 입력 상태
  savedData?: ScopeEmissionResponse // 백엔드에서 받은 전체 데이터 (저장된 경우에만)
}

/**
 * ID 관리 규칙:
 * - 저장된 데이터: id = emissionId (양수, 1, 2, 3...)
 * - 미저장 데이터: id = 임시ID (음수, -1, -2, -3...)
 */

// ============================================================================
// 메인 Scope2 폼 컴포넌트 (Main Scope2 Form Component)
// ============================================================================

/**
 * Scope 2 배출량 관리 메인 컴포넌트
 * scope3Form.tsx와 동일한 레이아웃 구조를 적용하여 일관성 있는 UI 제공
 */
export default function Scope2Form() {
  // ========================================================================
  // 기본 상태 관리 (Basic State Management)
  // ========================================================================
  const [calculatorModes, setCalculatorModes] = useState<
    Record<Scope2ElectricCategoryKey | Scope2SteamCategoryKey, Record<number, boolean>>
  >({
    list11: {}, // 전력 카테고리
    list12: {} // 스팀 카테고리
  })
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()) // 선택된 연도
  const currentMonth = new Date().getMonth() + 1 // JavaScript의 월은 0부터 시작하므로 1을 더함
  const [selectedMonth, setSelectedMonth] = useState<number | null>(currentMonth) // 선택된 월 (null이면 전체)

  const [activeElectricCategory, setActiveElectricCategory] =
    useState<Scope2ElectricCategoryKey | null>(null) // 현재 선택된 전력 카테고리
  const [activeSteamCategory, setActiveSteamCategory] =
    useState<Scope2SteamCategoryKey | null>(null) // 현재 선택된 스팀 카테고리

  // 카테고리별 계산기 목록 관리
  const [electricCategoryCalculators, setElectricCategoryCalculators] = useState<
    Record<Scope2ElectricCategoryKey, CalculatorData[]>
  >({
    list11: [] // 전력 카테고리
  })

  const [steamCategoryCalculators, setSteamCategoryCalculators] = useState<
    Record<Scope2SteamCategoryKey, CalculatorData[]>
  >({
    list12: [] // 스팀 카테고리
  })

  // 카테고리별 배출량 총계 관리
  const [electricCategoryTotals, setElectricCategoryTotals] = useState<
    Record<Scope2ElectricCategoryKey, {id: number; emission: number}[]>
  >({
    list11: [] // 전력 카테고리
  })

  const [steamCategoryTotals, setSteamCategoryTotals] = useState<
    Record<Scope2SteamCategoryKey, {id: number; emission: number}[]>
  >({
    list12: [] // 스팀 카테고리
  })

  // ========================================================================
  // 백엔드 연동 상태 관리 (Backend Integration State)
  // ========================================================================

  // 전체 Scope2 배출량 데이터 (년/월 기준)
  const [scope2Data, setScope2Data] = useState<ScopeEmissionResponse[]>([])

  // 카테고리별 요약 데이터 (CategorySummaryCard용)
  const [categorySummary, setCategorySummary] = useState<ScopeCategorySummary>({})

  // 로딩 상태 관리
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // 데이터 새로고침 트리거 (CRUD 작업 후 데이터 다시 로드용)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)

  // ========================================================================
  // 유틸리티 함수 (Utility Functions)
  // ========================================================================

  /**
   * 현재 활성 카테고리의 계산기 목록 반환
   */
  const getCurrentCalculators = (): CalculatorData[] => {
    if (activeElectricCategory) {
      return electricCategoryCalculators[activeElectricCategory] || []
    }
    if (activeSteamCategory) {
      return steamCategoryCalculators[activeSteamCategory] || []
    }
    return []
  }

  /**
   * 특정 카테고리의 총 배출량 계산
   */
  const getElectricTotalEmission = (category: Scope2ElectricCategoryKey): number =>
    (electricCategoryTotals[category] || []).reduce((sum, t) => sum + t.emission, 0)

  const getSteamTotalEmission = (category: Scope2SteamCategoryKey): number =>
    (steamCategoryTotals[category] || []).reduce((sum, t) => sum + t.emission, 0)

  // ========================================================================
  // 유틸리티 함수 - ID 생성 (Utility Functions - ID Generation)
  // ========================================================================

  /**
   * 새로운 임시 ID 생성 (음수 사용)
   */
  const generateNewTemporaryId = (
    categoryKey: Scope2ElectricCategoryKey | Scope2SteamCategoryKey
  ): number => {
    const existingCalculators = activeElectricCategory
      ? electricCategoryCalculators[categoryKey as Scope2ElectricCategoryKey] || []
      : steamCategoryCalculators[categoryKey as Scope2SteamCategoryKey] || []
    const existingIds = existingCalculators.map(c => c.id).filter(id => id < 0)

    const minId = existingIds.length > 0 ? Math.min(...existingIds) : 0
    return minId - 1
  }

  /**
   * ID가 임시 ID인지 확인 (음수면 임시 ID)
   */
  const isTemporaryId = (id: number): boolean => id < 0

  /**
   * ID가 저장된 데이터 ID인지 확인 (양수면 emissionId)
   */
  const isEmissionId = (id: number): boolean => id > 0

  // ========================================================================
  // 이벤트 핸들러 (Event Handlers)
  // ========================================================================
  const handleModeChange = (id: number, checked: boolean) => {
    const activeCategory = activeElectricCategory || activeSteamCategory
    if (!activeCategory) return

    setCalculatorModes(prev => ({
      ...prev,
      [activeCategory]: {
        ...prev[activeCategory],
        [id]: checked
      }
    }))
  }

  /**
   * 계산기의 배출량 업데이트 핸들러
   */
  const updateTotal = (id: number, emission: number) => {
    if (activeElectricCategory) {
      setElectricCategoryTotals(prev => ({
        ...prev,
        [activeElectricCategory]: (prev[activeElectricCategory] || [])
          .map(t => (t.id === id ? {id, emission} : t))
          .concat(
            (prev[activeElectricCategory] || []).find(t => t.id === id)
              ? []
              : [{id, emission}]
          )
      }))
    } else if (activeSteamCategory) {
      setSteamCategoryTotals(prev => ({
        ...prev,
        [activeSteamCategory]: (prev[activeSteamCategory] || [])
          .map(t => (t.id === id ? {id, emission} : t))
          .concat(
            (prev[activeSteamCategory] || []).find(t => t.id === id)
              ? []
              : [{id, emission}]
          )
      }))
    }
  }

  /**
   * 새로운 계산기 추가 핸들러
   */
  const addCalculator = () => {
    if (activeElectricCategory) {
      const newId = generateNewTemporaryId(activeElectricCategory)
      setElectricCategoryCalculators(prev => ({
        ...prev,
        [activeElectricCategory]: [
          ...prev[activeElectricCategory],
          {
            id: newId,
            state: {category: '', separate: '', rawMaterial: '', quantity: ''}
          }
        ]
      }))
    } else if (activeSteamCategory) {
      const newId = generateNewTemporaryId(activeSteamCategory)
      setSteamCategoryCalculators(prev => ({
        ...prev,
        [activeSteamCategory]: [
          ...prev[activeSteamCategory],
          {
            id: newId,
            state: {category: '', separate: '', rawMaterial: '', quantity: ''}
          }
        ]
      }))
    }
  }

  /**
   * 계산기 삭제 핸들러
   */
  const removeCalculator = async (id: number) => {
    if (activeElectricCategory) {
      const currentCalculators = electricCategoryCalculators[activeElectricCategory] || []
      const targetCalculator = currentCalculators.find(c => c.id === id)
      const isLastItem = currentCalculators.length === 1

      try {
        // 백엔드에 저장된 데이터가 있으면 API 호출로 삭제
        if (isEmissionId(id)) {
          const deleteSuccess = await deleteScopeEmission(id)
          if (!deleteSuccess) {
            alert('서버에서 데이터 삭제에 실패했습니다. 다시 시도해주세요.')
            return
          }
        }

        if (isLastItem) {
          const newTemporaryId = generateNewTemporaryId(activeElectricCategory)
          setElectricCategoryCalculators(prev => ({
            ...prev,
            [activeElectricCategory]: [
              {
                id: newTemporaryId,
                state: {category: '', separate: '', rawMaterial: '', quantity: ''}
              }
            ]
          }))
          setElectricCategoryTotals(prev => ({
            ...prev,
            [activeElectricCategory]: [{id: newTemporaryId, emission: 0}]
          }))
        } else {
          setElectricCategoryCalculators(prev => ({
            ...prev,
            [activeElectricCategory]: (prev[activeElectricCategory] || []).filter(
              c => c.id !== id
            )
          }))
          setElectricCategoryTotals(prev => ({
            ...prev,
            [activeElectricCategory]: (prev[activeElectricCategory] || []).filter(
              t => t.id !== id
            )
          }))
        }

        // 백엔드 데이터가 있었던 경우 전체 데이터 새로고침
        if (isEmissionId(id)) {
          await refreshData()
        }
      } catch (error) {
        console.error('계산기 삭제 중 오류 발생:', error)
        alert('데이터 삭제 중 오류가 발생했습니다.')
      }
    } else if (activeSteamCategory) {
      const currentCalculators = steamCategoryCalculators[activeSteamCategory] || []
      const targetCalculator = currentCalculators.find(c => c.id === id)
      const isLastItem = currentCalculators.length === 1

      try {
        // 백엔드에 저장된 데이터가 있으면 API 호출로 삭제
        if (isEmissionId(id)) {
          const deleteSuccess = await deleteScopeEmission(id)
          if (!deleteSuccess) {
            alert('서버에서 데이터 삭제에 실패했습니다. 다시 시도해주세요.')
            return
          }
        }

        if (isLastItem) {
          const newTemporaryId = generateNewTemporaryId(activeSteamCategory)
          setSteamCategoryCalculators(prev => ({
            ...prev,
            [activeSteamCategory]: [
              {
                id: newTemporaryId,
                state: {category: '', separate: '', rawMaterial: '', quantity: ''}
              }
            ]
          }))
          setSteamCategoryTotals(prev => ({
            ...prev,
            [activeSteamCategory]: [{id: newTemporaryId, emission: 0}]
          }))
        } else {
          setSteamCategoryCalculators(prev => ({
            ...prev,
            [activeSteamCategory]: (prev[activeSteamCategory] || []).filter(
              c => c.id !== id
            )
          }))
          setSteamCategoryTotals(prev => ({
            ...prev,
            [activeSteamCategory]: (prev[activeSteamCategory] || []).filter(
              t => t.id !== id
            )
          }))
        }

        // 백엔드 데이터가 있었던 경우 전체 데이터 새로고침
        if (isEmissionId(id)) {
          await refreshData()
        }
      } catch (error) {
        console.error('계산기 삭제 중 오류 발생:', error)
        alert('데이터 삭제 중 오류가 발생했습니다.')
      }
    }
  }

  /**
   * 계산기 입력 상태 업데이트 핸들러
   */
  const updateCalculatorState = (id: number, newState: SelectorState) => {
    if (activeElectricCategory) {
      setElectricCategoryCalculators(prev => ({
        ...prev,
        [activeElectricCategory]: (prev[activeElectricCategory] || []).map(c =>
          c.id === id ? {...c, state: newState} : c
        )
      }))
    } else if (activeSteamCategory) {
      setSteamCategoryCalculators(prev => ({
        ...prev,
        [activeSteamCategory]: (prev[activeSteamCategory] || []).map(c =>
          c.id === id ? {...c, state: newState} : c
        )
      }))
    }
  }

  /**
   * 카테고리 선택 핸들러
   */
  const handleElectricCategorySelect = (category: Scope2ElectricCategoryKey) => {
    setActiveElectricCategory(category)
    setActiveSteamCategory(null) // 다른 타입 카테고리는 초기화

    // 해당 카테고리에 계산기가 없으면 기본 계산기 1개 생성
    if (
      !electricCategoryCalculators[category] ||
      electricCategoryCalculators[category]!.length === 0
    ) {
      const newId = generateNewTemporaryId(category)
      setElectricCategoryCalculators(prev => ({
        ...prev,
        [category]: [
          {
            id: newId,
            state: {category: '', separate: '', rawMaterial: '', quantity: ''}
          }
        ]
      }))
    }
  }

  const handleSteamCategorySelect = (category: Scope2SteamCategoryKey) => {
    setActiveSteamCategory(category)
    setActiveElectricCategory(null) // 다른 타입 카테고리는 초기화

    // 해당 카테고리에 계산기가 없으면 기본 계산기 1개 생성
    if (
      !steamCategoryCalculators[category] ||
      steamCategoryCalculators[category]!.length === 0
    ) {
      const newId = generateNewTemporaryId(category)
      setSteamCategoryCalculators(prev => ({
        ...prev,
        [category]: [
          {
            id: newId,
            state: {category: '', separate: '', rawMaterial: '', quantity: ''}
          }
        ]
      }))
    }
  }

  /**
   * 카테고리 입력 완료 핸들러
   */
  const handleComplete = () => {
    setActiveElectricCategory(null)
    setActiveSteamCategory(null)
  }

  /**
   * 목록으로 돌아가기 핸들러
   */
  const handleBackToList = () => {
    setActiveElectricCategory(null)
    setActiveSteamCategory(null)
  }

  // 전체 총 배출량 계산
  const grandTotal =
    Object.keys(scope2ElectricCategoryList).reduce(
      (sum, key) => sum + getElectricTotalEmission(key as Scope2ElectricCategoryKey),
      0
    ) +
    Object.keys(scope2SteamCategoryList).reduce(
      (sum, key) => sum + getSteamTotalEmission(key as Scope2SteamCategoryKey),
      0
    )

  // ========================================================================
  // 백엔드 데이터 로드 함수 (Backend Data Loading Functions)
  // ========================================================================

  /**
   * 연도/월별 Scope2 데이터 전체 조회
   * selectedYear, selectedMonth 변경 시 자동 호출
   */
  const loadScope2Data = async () => {
    if (!selectedYear || !selectedMonth) return

    setIsLoading(true)
    try {
      // 1. 전체 배출량 데이터 조회 (Scope 2만 필터링)
      const emissionsData = await fetchEmissionsByYearAndMonth(
        selectedYear,
        selectedMonth,
        'SCOPE2'
      )
      setScope2Data(emissionsData)

      // 2. 카테고리별 요약 데이터 조회
      const summaryData = await fetchCategorySummaryByScope(
        'SCOPE2',
        selectedYear,
        selectedMonth
      )
      setCategorySummary(summaryData)

      // 3. 기존 데이터를 카테고리별 계산기로 변환
      convertBackendDataToCalculators(emissionsData)
    } catch (error) {
      console.error('Scope2 데이터 로드 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 백엔드 데이터를 프론트엔드 계산기 형식으로 변환
  const convertBackendDataToCalculators = (data: ScopeEmissionResponse[]) => {
    const electricData: CalculatorData[] = []
    const steamData: CalculatorData[] = []

    data.forEach(emission => {
      const calculatorId =
        emission.id && emission.id > 0 ? emission.id : Math.abs(Math.random() * 1000000)

      const calculatorData: CalculatorData = {
        id: calculatorId,
        state: {
          category: emission.majorCategory,
          separate: emission.subcategory,
          rawMaterial: emission.rawMaterial,
          unit: emission.unit,
          kgCO2eq: emission.emissionFactor.toString(),
          quantity: emission.activityAmount.toString()
        },
        savedData: emission
      }

      // 카테고리 번호에 따라 분류
      if (emission.scope2CategoryNumber === 1) {
        electricData.push(calculatorData)
      } else if (emission.scope2CategoryNumber === 2) {
        steamData.push(calculatorData)
      }

      // 수동 입력 모드 상태 복원 (화면 반전 로직 고려)
      if (emission.inputType !== undefined) {
        const categoryKey = emission.scope2CategoryNumber === 1 ? 'list11' : 'list12'
        setCalculatorModes(prev => ({
          ...prev,
          [categoryKey]: {
            ...prev[categoryKey],
            [calculatorId]: emission.inputType === 'LCA' // 수정: 화면에서 반전되므로 LCA일 때 true
          }
        }))
      }
    })

    // 상태 업데이트
    setElectricCategoryCalculators({list11: electricData})
    setSteamCategoryCalculators({list12: steamData})

    setElectricCategoryTotals({
      list11: electricData.map(calc => ({
        id: calc.id,
        emission: calc.savedData?.totalEmission || 0
      }))
    })

    setSteamCategoryTotals({
      list12: steamData.map(calc => ({
        id: calc.id,
        emission: calc.savedData?.totalEmission || 0
      }))
    })
  }

  // ========================================================================
  // useEffect 훅 (Lifecycle Effects)
  // ========================================================================

  /**
   * 연도/월 변경 시 데이터 자동 로드
   */
  useEffect(() => {
    if (selectedYear && selectedMonth) {
      loadScope2Data()
    }
  }, [selectedYear, selectedMonth, refreshTrigger])

  // ========================================================================
  // 데이터 새로고침 함수 (Data Refresh Function)
  // ========================================================================

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // ========================================================================
  // 렌더링 (Rendering)
  // ========================================================================

  return (
    <div className="flex flex-col p-4 w-full h-full">
      {/* ========================================================================
          상단 네비게이션 (Top Navigation)
          - 브레드크럼을 통한 현재 위치 표시
          ======================================================================== */}
      <div className="flex flex-row items-center p-2 px-2 mb-4 text-sm text-gray-500 bg-white rounded-lg shadow-sm">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Home className="mr-1 w-4 h-4" />
              <BreadcrumbLink href="/dashboard">대시보드</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="font-bold text-blue-600">Scope2</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ========================================================================
          헤더 섹션 (Header Section)
          - 뒤로가기 버튼과 페이지 제목/설명
          ======================================================================== */}
      <div className="flex flex-row justify-between mb-4 w-full h-24">
        <div className="flex flex-row items-center p-4">
          <PageHeader
            icon={<Factory className="w-6 h-6 text-blue-600" />}
            title="Scope 2 배출량 관리"
            description="간접 배출량 (전력, 스팀) 데이터를 관리하고 추적합니다"
            module="SCOPE"
            submodule="scope2"
          />
        </div>
      </div>

      {/* ========================================================================
          메인 컨텐츠 영역 (Main Content Area)
          - 카테고리 선택 또는 데이터 입력 화면
          ======================================================================== */}
      {!activeElectricCategory && !activeSteamCategory ? (
        /* ====================================================================
            카테고리 선택 화면 (Category Selection Screen)
            ==================================================================== */

        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.4, delay: 0.1}}>
          <Card className="overflow-hidden mb-4 shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-8 justify-center items-center h-24 md:grid-cols-3">
                {/* 백엔드 데이터 기반 총 배출량 카드 */}
                <motion.div
                  initial={{opacity: 0, scale: 0.95}}
                  animate={{opacity: 1, scale: 1}}
                  transition={{delay: 0.1, duration: 0.5}}
                  className="max-w-md">
                  <Card className="justify-center h-24 bg-gradient-to-br from-blue-50 to-white border-blue-100">
                    <CardContent className="flex items-center p-4">
                      <div className="p-2 mr-3 bg-blue-100 rounded-full">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          총 Scope 2 배출량
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {Object.values(categorySummary)
                            .reduce((sum, emission) => sum + emission, 0)
                            .toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 2
                            })}
                          <span className="ml-1 text-sm font-normal text-gray-500">
                            kgCO₂eq
                          </span>
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* 보고연도 입력 필드 */}
                <div className="space-y-3">
                  <label className="flex gap-2 items-center text-sm font-semibold text-customG-700">
                    <CalendarDays className="w-4 h-4" />
                    보고연도
                  </label>
                  <Input
                    type="number"
                    value={selectedYear}
                    onChange={e => setSelectedYear(parseInt(e.target.value))}
                    min="1900"
                    max="2200"
                    className="px-3 py-2 w-full h-9 text-sm backdrop-blur-sm border-customG-200 focus:border-customG-400 focus:ring-customG-100 bg-white/80"
                  />
                </div>

                {/* 보고월 선택 드롭다운 (선택사항) */}
                <div className="space-y-3">
                  <label className="flex gap-2 items-center text-sm font-semibold text-customG-700">
                    <CalendarDays className="w-4 h-4" />
                    보고월 (선택사항)
                  </label>
                  <MonthSelector
                    className="w-full"
                    selectedMonth={selectedMonth}
                    onSelect={setSelectedMonth}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 카테고리 선택 영역 */}
          <div className="space-y-8">
            {/* 전력 카테고리 */}
            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.5, delay: 0.2}}>
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-bold text-customG-800">전력 사용량</h2>
                <p className="text-sm text-customG-600">
                  시설별 전력 소비량 및 배출량 관리
                </p>
              </div>
              <CategorySelector
                categoryList={scope2ElectricCategoryList}
                getTotalEmission={getElectricTotalEmission}
                onCategorySelect={handleElectricCategorySelect}
                animationDelay={0.1}
              />
            </motion.div>

            {/* 스팀 카테고리 */}
            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.5, delay: 0.4}}>
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-bold text-customG-800">스팀 사용량</h2>
                <p className="text-sm text-customG-600">
                  시설별 스팀 소비량 및 배출량 관리
                </p>
              </div>
              <CategorySelector
                categoryList={scope2SteamCategoryList}
                getTotalEmission={getSteamTotalEmission}
                onCategorySelect={handleSteamCategorySelect}
                animationDelay={0.2}
              />
            </motion.div>
          </div>
        </motion.div>
      ) : (
        /* ====================================================================
            카테고리별 데이터 입력 화면 (Category Data Input Screen)
            ==================================================================== */
        <Scope2DataInput
          activeCategory={activeElectricCategory || activeSteamCategory!}
          calculators={getCurrentCalculators()}
          getTotalEmission={category =>
            activeElectricCategory
              ? getElectricTotalEmission(category as Scope2ElectricCategoryKey)
              : getSteamTotalEmission(category as Scope2SteamCategoryKey)
          }
          onAddCalculator={addCalculator}
          onRemoveCalculator={removeCalculator}
          onUpdateCalculatorState={updateCalculatorState}
          onChangeTotal={updateTotal}
          onComplete={handleComplete}
          onBackToList={handleBackToList}
          calculatorModes={
            calculatorModes[activeElectricCategory || activeSteamCategory!] || {}
          }
          onModeChange={handleModeChange}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onDataChange={refreshData}
        />
      )}
    </div>
  )
}
