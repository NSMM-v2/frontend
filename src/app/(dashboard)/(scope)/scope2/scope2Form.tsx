'use client'

import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {
  Home, // 홈 아이콘
  Factory, // 공장 아이콘
  CalendarDays, // 달력 아이콘
  TrendingUp // 상승 트렌드 아이콘
} from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import {PageHeader} from '@/components/layout/PageHeader'
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
import {
  SelectorState,
  ScopeEmissionResponse,
  CategoryYearlyEmission,
  CategoryMonthlyEmission
} from '@/types/scopeTypes'
import {
  deleteScopeEmission,
  fetchCategoryYearlyEmissions,
  fetchCategoryMonthlyEmissions,
  fetchEmissionsByScope
} from '@/services/scopeService'
import {DirectionButton} from '@/components/layout/direction'
/**
 * Scope 2 계산기 데이터 구조
 * 백엔드 ScopeEmission 엔티티와 연동되는 프론트엔드 계산기 상태
 */
interface CalculatorData {
  id: number
  state: SelectorState
  savedData?: ScopeEmissionResponse
  factoryEnabled: boolean // 계산기별 공장 설비 활성화 상태
}

/**
 * Scope 2 배출량 관리 메인 컴포넌트
 * Scope3와 동일한 구조와 기능을 제공하여 일관성 있는 UI 경험 제공
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

  // 카테고리별 집계 데이터 (새로운 API 사용)
  const [categoryYearlyData, setCategoryYearlyData] = useState<CategoryYearlyEmission[]>(
    []
  )
  const [categoryMonthlyData, setCategoryMonthlyData] = useState<
    CategoryMonthlyEmission[]
  >([])
  const [yearlyTotalEmission, setYearlyTotalEmission] = useState<number>(0) // 연 배출량 (고정)
  const [monthlyTotalEmission, setMonthlyTotalEmission] = useState<number>(0) // 월 배출량 (월 선택시)

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
   * 특정 카테고리의 총 배출량 계산 (백엔드 집계 데이터 우선 사용)
   */
  const getElectricTotalEmission = (category: Scope2ElectricCategoryKey): number => {
    // 백엔드 집계 데이터에서 Electric 카테고리(카테고리 번호 1) 데이터 조회
    const targetData = selectedMonth
      ? categoryMonthlyData.filter(
          data => data.month === selectedMonth && data.categoryNumber === 1
        )
      : categoryYearlyData.filter(data => data.categoryNumber === 1)

    if (targetData.length > 0) {
      return targetData.reduce((sum, data) => sum + data.totalEmission, 0)
    }

    // 백엔드 데이터가 없으면 프론트엔드 계산값 사용 (fallback)
    return (electricCategoryTotals[category] || []).reduce(
      (sum, t) => sum + t.emission,
      0
    )
  }

  const getSteamTotalEmission = (category: Scope2SteamCategoryKey): number => {
    // 백엔드 집계 데이터에서 Steam 카테고리(카테고리 번호 2) 데이터 조회
    const targetData = selectedMonth
      ? categoryMonthlyData.filter(
          data => data.month === selectedMonth && data.categoryNumber === 2
        )
      : categoryYearlyData.filter(data => data.categoryNumber === 2)

    if (targetData.length > 0) {
      return targetData.reduce((sum, data) => sum + data.totalEmission, 0)
    }

    // 백엔드 데이터가 없으면 프론트엔드 계산값 사용 (fallback)
    return (steamCategoryTotals[category] || []).reduce((sum, t) => sum + t.emission, 0)
  }

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
  // 데이터 검증 함수 (Data Validation Functions)
  // ========================================================================

  /**
   * 입력된 데이터가 있는지 확인
   * 필수 필드만 체크하도록 수정
   */
  const hasInputData = (calculator: CalculatorData): boolean => {
    const state = calculator.state

    // 필수 필드만 체크
    const requiredFields = [
      state.separate, // 구분
      state.rawMaterial, // 원료/에너지
      state.quantity, // 사용량
      state.unit // 단위
    ]

    // 모든 필수 필드가 채워져 있는지 확인
    const hasRequiredData = requiredFields.every(field => field && field.trim() !== '')

    return hasRequiredData
  }

  /**
   * 현재 활성 카테고리에 유효한 데이터가 있는지 확인
   */
  const hasValidData = (): boolean => {
    const currentCalculators = getCurrentCalculators()
    return currentCalculators.some(calculator => hasInputData(calculator))
  }

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
            state: {
              category: activeElectricCategory,
              separate: '',
              rawMaterial: '',
              quantity: '',
              unit: '',
              kgCO2eq: '',
              productName: '',
              productCode: ''
            },
            factoryEnabled: false
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
            state: {
              category: activeSteamCategory,
              separate: '',
              rawMaterial: '',
              quantity: '',
              unit: '',
              kgCO2eq: '',
              productName: '',
              productCode: ''
            },
            factoryEnabled: false
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
          try {
            const deleteSuccess = await deleteScopeEmission(id)
            if (!deleteSuccess) {
            }
          } catch (apiError) {
            // API 호출 실패해도 프론트엔드에서는 삭제 진행
          }
        }

        // 프론트엔드 상태 업데이트
        if (isLastItem) {
          const newTemporaryId = generateNewTemporaryId(activeElectricCategory)
          setElectricCategoryCalculators(prev => ({
            ...prev,
            [activeElectricCategory]: [
              {
                id: newTemporaryId,
                state: {
                  category: activeElectricCategory,
                  separate: '',
                  rawMaterial: '',
                  quantity: '',
                  unit: '',
                  kgCO2eq: '',
                  productName: '',
                  productCode: ''
                },
                factoryEnabled: false
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
        alert('데이터 삭제 중 오류가 발생했습니다.')
      }
    } else if (activeSteamCategory) {
      const currentCalculators = steamCategoryCalculators[activeSteamCategory] || []
      const targetCalculator = currentCalculators.find(c => c.id === id)
      const isLastItem = currentCalculators.length === 1

      try {
        // 백엔드에 저장된 데이터가 있으면 API 호출로 삭제
        if (isEmissionId(id)) {
          try {
            const deleteSuccess = await deleteScopeEmission(id)
            if (!deleteSuccess) {
            }
          } catch (apiError) {
            // API 호출 실패해도 프론트엔드에서는 삭제 진행
          }
        }

        // 프론트엔드 상태 업데이트
        if (isLastItem) {
          const newTemporaryId = generateNewTemporaryId(activeSteamCategory)
          setSteamCategoryCalculators(prev => ({
            ...prev,
            [activeSteamCategory]: [
              {
                id: newTemporaryId,
                state: {
                  category: activeSteamCategory,
                  separate: '',
                  rawMaterial: '',
                  quantity: '',
                  unit: '',
                  kgCO2eq: '',
                  productName: '',
                  productCode: ''
                },
                factoryEnabled: false
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
   * 계산기별 공장 설비 상태 변경 핸들러
   */
  const handleFactoryEnabledChange = (id: number, enabled: boolean) => {
    if (activeElectricCategory) {
      setElectricCategoryCalculators(prev => ({
        ...prev,
        [activeElectricCategory]: (prev[activeElectricCategory] || []).map(c =>
          c.id === id ? {...c, factoryEnabled: enabled} : c
        )
      }))
    } else if (activeSteamCategory) {
      setSteamCategoryCalculators(prev => ({
        ...prev,
        [activeSteamCategory]: (prev[activeSteamCategory] || []).map(c =>
          c.id === id ? {...c, factoryEnabled: enabled} : c
        )
      }))
    }
  }

  /**
   * 카테고리 선택 핸들러
   */
  const handleElectricCategorySelect = (category: Scope2ElectricCategoryKey) => {
    setActiveElectricCategory(category)
    setActiveSteamCategory(null)

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
            state: {
              category: category,
              separate: '',
              rawMaterial: '',
              quantity: '',
              unit: '',
              kgCO2eq: '',
              productName: '',
              productCode: ''
            },
            factoryEnabled: false
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
            state: {
              category: category,
              separate: '',
              rawMaterial: '',
              quantity: '',
              unit: '',
              kgCO2eq: '',
              productName: '',
              productCode: ''
            },
            factoryEnabled: false
          }
        ]
      }))
    }
  }

  /**
   * 카테고리 입력 완료 핸들러
   * 데이터 검증 추가
   */
  const handleComplete = () => {
    // 데이터 검증
    if (!hasValidData()) {
      return
    }

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

  // 전체 총 배출량은 totalSumAllCategories로 관리

  // ========================================================================
  // 백엔드 데이터 로드 함수 (Backend Data Loading Functions)
  // ========================================================================

  /**
   * 연도/월별 Scope2 데이터 전체 조회
   * Scope3와 동일한 로직으로 완전 재구현
   */
  const loadScope2Data = async () => {
    if (!selectedYear) return

    try {
      // 1. 항상 연간 데이터 조회 (연간 배출량 카드용)
      const yearlyData = await fetchCategoryYearlyEmissions('SCOPE2', selectedYear)
      setCategoryYearlyData(yearlyData)

      // 연간 데이터에서 총합 계산 및 설정 (연도 변경시에만 업데이트)
      const yearlyTotal = yearlyData.reduce((sum, data) => sum + data.totalEmission, 0)
      setYearlyTotalEmission(yearlyTotal)

      // 2. 월간 데이터 조회 및 처리
      if (selectedMonth) {
        const monthlyData = await fetchCategoryMonthlyEmissions('SCOPE2', selectedYear)
        setCategoryMonthlyData(monthlyData)

        // 선택된 월에 해당하는 데이터만 필터링하여 총합 계산
        const monthlyFilteredData = monthlyData.filter(
          data => data.month === selectedMonth
        )
        const monthlyTotal = monthlyFilteredData.reduce(
          (sum, data) => sum + data.totalEmission,
          0
        )
        setMonthlyTotalEmission(monthlyTotal)
      } else {
        // 월이 선택되지 않았으면 월간 데이터 및 월 배출량 초기화
        setCategoryMonthlyData([])
        setMonthlyTotalEmission(0)
      }

      // 4. 항상 전체 배출량 데이터 조회 (계산기용)
      const emissionsData = await fetchEmissionsByScope('SCOPE2')

      // 5. 선택된 기간에 맞는 데이터만 필터링
      const filteredEmissions = selectedMonth
        ? emissionsData.filter(
            emission =>
              emission.reportingYear === selectedYear &&
              emission.reportingMonth === selectedMonth
          )
        : emissionsData.filter(emission => emission.reportingYear === selectedYear)

      // 6. 백엔드 데이터를 계산기 형식으로 변환 (완전 초기화)
      convertBackendDataToCalculators(filteredEmissions)
    } catch (error) {
      console.error('Scope2 데이터 로드 오류:', error)
    }
  }

  /**
   * 백엔드 데이터를 프론트엔드 계산기 형식으로 변환
   * Scope3와 동일한 완전 초기화 방식 적용
   */
  const convertBackendDataToCalculators = (data: ScopeEmissionResponse[]) => {
    // 완전 초기화를 위한 임시 데이터 구조
    const newElectricData: CalculatorData[] = []
    const newSteamData: CalculatorData[] = []
    const newCalculatorModes: Record<string, Record<number, boolean>> = {
      list11: {},
      list12: {}
    }

    data.forEach(emission => {
      const calculatorId =
        emission.id && emission.id > 0 ? emission.id : Math.abs(Math.random() * 1000000)

      const calculatorData: CalculatorData = {
        id: calculatorId,
        state: {
          category: emission.majorCategory,
          separate: emission.subcategory,
          rawMaterial: emission.rawMaterial,
          unit: emission.unit || '',
          kgCO2eq: emission.emissionFactor.toString(),
          quantity: emission.activityAmount.toString(),
          productName: emission.productName || '',
          productCode: emission.companyProductCode || ''
        },
        savedData: emission,
        factoryEnabled: emission.factoryEnabled || false
      }

      // 카테고리 번호에 따라 분류
      if (emission.scope2CategoryNumber === 1) {
        newElectricData.push(calculatorData)
      } else if (emission.scope2CategoryNumber === 2) {
        newSteamData.push(calculatorData)
      }

      // 수동 입력 모드 상태 설정 (화면 반전 로직 고려)
      if (emission.inputType !== undefined) {
        const categoryKey = emission.scope2CategoryNumber === 1 ? 'list11' : 'list12'
        newCalculatorModes[categoryKey][calculatorId] = emission.inputType === 'LCA'
      }
    })

    // 완전 새로운 상태로 교체 (이전 데이터 잔존 방지)
    setElectricCategoryCalculators({list11: newElectricData})
    setSteamCategoryCalculators({list12: newSteamData})

    setElectricCategoryTotals({
      list11: newElectricData.map(calc => ({
        id: calc.id,
        emission: calc.savedData?.totalEmission || 0
      }))
    })

    setSteamCategoryTotals({
      list12: newSteamData.map(calc => ({
        id: calc.id,
        emission: calc.savedData?.totalEmission || 0
      }))
    })

    // 계산기 모드 완전 교체
    setCalculatorModes(prev => ({
      ...prev,
      ...newCalculatorModes
    }))
  }

  // ========================================================================
  // useEffect 훅 (Lifecycle Effects)
  // ========================================================================

  /**
   * 연도/월 변경 시 데이터 자동 로드
   * Scope3와 동일한 로직으로 월이 null이어도 로드
   */
  useEffect(() => {
    if (selectedYear) {
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
    <div className="flex flex-col w-full h-full pt-24 pb-4">
      {/* ========================================================================
          상단 네비게이션 (Top Navigation)
          - 브레드크럼을 통한 현재 위치 표시
          ======================================================================== */}
      <div className="flex flex-row items-center p-2 px-2 mb-4 text-sm text-gray-500 bg-white rounded-lg shadow-sm">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Home className="w-4 h-4 mr-1" />
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
      <div className="flex flex-row justify-between w-full mb-4">
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
          {/* header card ================================================================================================================== */}
          <div className="flex flex-row justify-between w-full gap-4 mb-4">
            {/* 연도 총 배출량 카드 ============================================================================================================== */}
            <Card className="justify-center w-full h-24 border-blue-200 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="flex items-center justify-between gap-6 p-4">
                <div className="flex flex-row items-center">
                  <div className="p-2 mr-3 bg-blue-100 rounded-full">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Scope2 연 배출량</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {yearlyTotalEmission.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2
                      })}
                      <span className="ml-1 text-sm font-normal text-gray-500">
                        kgCO₂eq
                      </span>
                    </h3>
                  </div>
                </div>
                <div className="flex flex-col w-full space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap text-customG-700">
                    <CalendarDays className="w-4 h-4" />
                    연도
                  </label>
                  <Input
                    type="number"
                    value={selectedYear}
                    onChange={e => setSelectedYear(parseInt(e.target.value))}
                    min="1900"
                    max="2200"
                    className="w-full px-3 py-2 text-sm h-9 backdrop-blur-sm border-customG-200 focus:border-customG-400 focus:ring-customG-100 bg-white/80"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 월 총 배출량 카드 ============================================================================================================== */}
            <Card className="justify-center w-full h-24 border-blue-200 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="flex items-center justify-between gap-6 p-4">
                <div className="flex flex-row items-center">
                  <div className="p-2 mr-3 bg-blue-100 rounded-full">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Scope2 {selectedMonth ? `${selectedMonth}월` : '월'} 배출량
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedMonth
                        ? monthlyTotalEmission.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2
                          })
                        : '월 선택 필요'}
                      {selectedMonth && (
                        <span className="ml-1 text-sm font-normal text-gray-500">
                          kgCO₂eq
                        </span>
                      )}
                    </h3>
                  </div>
                </div>
                <div className="flex flex-col w-full space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-customG-700">
                    <CalendarDays className="w-4 h-4" />월
                  </label>
                  <MonthSelector
                    className="w-full"
                    selectedMonth={selectedMonth}
                    onSelect={setSelectedMonth}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 카테고리 선택 영역 */}
          <div className="space-y-8">
            {/* 전력 카테고리 */}
            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.5, delay: 0.2}}>
              <div className="mb-4">
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
              <div className="mb-4">
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
          onFactoryEnabledChange={handleFactoryEnabledChange}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onDataChange={refreshData}
        />
      )}

      {/* ======================================================================
          하단 네비게이션 버튼 (Bottom Navigation Button)
          ====================================================================== */}
      <DirectionButton
        direction="left"
        tooltip="Scope 1로 이동"
        href="/scope1"
        fixed
        position="middle-left"
        size={48}
      />

      <DirectionButton
        direction="right"
        tooltip="Scope 3로 이동"
        href="/scope3"
        fixed
        position="middle-right"
        size={48}
      />
    </div>
  )
}
