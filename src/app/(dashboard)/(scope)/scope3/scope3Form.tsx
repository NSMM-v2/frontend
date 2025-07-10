'use client'

import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {
  Home, // 홈 아이콘
  Factory, // 공장 아이콘
  CalendarDays, // 달력 아이콘
  TrendingUp // 상승 트렌드 아이콘 (배출량 카드용)
} from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

// 레이아웃 컴포넌트 임포트
import {PageHeader} from '@/components/layout/PageHeader'

// 분리된 Scope3 컴포넌트들 임포트
import {
  CategorySelector,
  Scope3CategoryKey
} from '@/components/scopeTotal/Scope123CategorySelector'
import {CategoryDataInput} from '@/components/scope3/Scope3DataInput'
import {MonthSelector} from '@/components/scopeTotal/Scope123MonthSelector'
import {Input} from '@/components/ui/input'
import {Card, CardContent} from '@/components/ui/card'
import {scope3CategoryList} from '@/components/scopeTotal/Scope123CategorySelector'
import {
  SelectorState,
  ScopeEmissionResponse,
  ScopeCategorySummary,
  ScopeAggregationResponse
} from '@/types/scopeTypes'
import {
  fetchEmissionsByYearAndMonth,
  fetchCategorySummaryByScope,
  deleteScopeEmission
} from '@/services/scopeService'
import {fetchComprehensiveAggregation} from '@/services/aggregationService'
import {DirectionButton} from '@/components/layout/direction'

// ============================================================================
// 타입 정의 (Type Definitions)
// ============================================================================

/**
 * 계산기 데이터 구조 (Calculator Data Structure)
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
// 메인 Scope3 폼 컴포넌트 (Main Scope3 Form Component)
// ============================================================================

/**
 * Scope 3 배출량 관리 메인 컴포넌트
 * scope2Form.tsx와 동일한 레이아웃 구조를 적용하여 일관성 있는 UI 제공
 */
export default function Scope3Form() {
  // ========================================================================
  // 기본 상태 관리 (Basic State Management)
  // ========================================================================
  const [calculatorModes, setCalculatorModes] = useState<
    Record<Scope3CategoryKey, Record<number, boolean>>
  >({
    list1: {},
    list2: {},
    list3: {},
    list4: {},
    list5: {},
    list6: {},
    list7: {},
    list8: {},
    list9: {},
    list10: {},
    list11: {},
    list12: {},
    list13: {},
    list14: {},
    list15: {}
  })
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()) // 선택된 연도
  const currentMonth = new Date().getMonth() + 1 // JavaScript의 월은 0부터 시작하므로 1을 더함
  const [selectedMonth, setSelectedMonth] = useState<number | null>(currentMonth) // 선택된 월 (null이면 전체)

  const [activeCategory, setActiveCategory] = useState<Scope3CategoryKey | null>(null) // 현재 선택된 카테고리

  // 카테고리별 계산기 목록 관리
  const [categoryCalculators, setCategoryCalculators] = useState<
    Record<Scope3CategoryKey, CalculatorData[]>
  >({
    list1: [],
    list2: [],
    list3: [],
    list4: [],
    list5: [],
    list6: [],
    list7: [],
    list8: [],
    list9: [],
    list10: [],
    list11: [],
    list12: [],
    list13: [],
    list14: [],
    list15: []
  })

  // 카테고리별 배출량 총계 관리
  const [categoryTotals, setCategoryTotals] = useState<
    Record<Scope3CategoryKey, {id: number; emission: number}[]>
  >({
    list1: [],
    list2: [],
    list3: [],
    list4: [],
    list5: [],
    list6: [],
    list7: [],
    list8: [],
    list9: [],
    list10: [],
    list11: [],
    list12: [],
    list13: [],
    list14: [],
    list15: []
  })

  // ========================================================================
  // 백엔드 연동 상태 관리 (Backend Integration State)
  // ========================================================================

  // 전체 Scope3 배출량 데이터 (년/월 기준)
  const [scope3Data, setScope3Data] = useState<ScopeEmissionResponse[]>([])

  // 카테고리별 요약 데이터 (CategorySummaryCard용)
  const [categorySummary, setCategorySummary] = useState<ScopeCategorySummary>({})

  // 종합 집계 데이터 (계층적 집계 표시용)
  const [aggregationData, setAggregationData] = useState<ScopeAggregationResponse | null>(
    null
  )

  // 로딩 상태 관리
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // 데이터 새로고침 트리거 (CRUD 작업 후 데이터 다시 로드용)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)

  // ========================================================================
  // 유틸리티 함수 (Utility Functions)
  // ========================================================================

  /**
   * 현재 활성 카테고리의 계산기 목록 반환
   * 카테고리가 선택되지 않았을 때는 빈 배열 반환
   */
  const getCurrentCalculators = (): CalculatorData[] => {
    if (!activeCategory) return []
    return categoryCalculators[activeCategory] || []
  }

  /**
   * 특정 카테고리의 총 배출량 계산
   */
  const getTotalEmission = (category: Scope3CategoryKey): number =>
    (categoryTotals[category] || []).reduce((sum, t) => sum + t.emission, 0)

  // ========================================================================
  // 유틸리티 함수 - ID 생성 (Utility Functions - ID Generation)
  // ========================================================================

  /**
   * 새로운 임시 ID 생성 (음수 사용)
   * 기존 ID들과 겹치지 않는 음수 ID 생성
   */
  const generateNewTemporaryId = (categoryKey: Scope3CategoryKey): number => {
    const existingCalculators = categoryCalculators[categoryKey] || []
    const existingIds = existingCalculators.map(c => c.id).filter(id => id < 0) // 임시 ID만 필터링

    // 가장 작은 음수에서 -1을 뺀 값 반환
    const minId = existingIds.length > 0 ? Math.min(...existingIds) : 0
    const newId = minId - 1

    return newId
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
    if (!activeCategory) return

    setCategoryTotals(prev => ({
      ...prev,
      [activeCategory]: (prev[activeCategory] || [])
        .map(t => (t.id === id ? {id, emission} : t))
        .concat(
          (prev[activeCategory] || []).find(t => t.id === id) ? [] : [{id, emission}]
        )
    }))
  }

  /**
   * 새로운 계산기 추가 핸들러
   */
  const addCalculator = () => {
    if (!activeCategory) return

    const newId = generateNewTemporaryId(activeCategory)

    setCategoryCalculators(prev => ({
      ...prev,
      [activeCategory]: [
        ...prev[activeCategory],
        {
          id: newId,
          state: {category: '', separate: '', rawMaterial: '', quantity: ''}
          // savedData는 없음 (아직 저장되지 않은 새 데이터)
        }
      ]
    }))

    // 새 계산기의 기본 모드를 수동 입력(false)으로 설정
    setCalculatorModes(prev => ({
      ...prev,
      [activeCategory]: {
        ...prev[activeCategory],
        [newId]: false // 수동 입력이 기본값 (false)
      }
    }))
  }

  /**
   * 계산기 삭제 핸들러
   * - 여러 항목이 있는 경우: 선택된 항목만 완전 삭제
   * - 단일 항목인 경우: 백엔드에서 삭제 후 빈 계산기로 초기화 (완전 제거하지 않음)
   */
  const removeCalculator = async (id: number) => {
    if (!activeCategory) {
      return
    }

    const currentCalculators = categoryCalculators[activeCategory] || []
    const targetCalculator = currentCalculators.find(c => c.id === id)
    const isLastItem = currentCalculators.length === 1

    if (!targetCalculator) {
      alert('삭제할 항목을 찾을 수 없습니다.')
      return
    }

    try {
      // 백엔드에 저장된 데이터가 있으면 API 호출로 삭제
      if (isEmissionId(targetCalculator.id)) {
        const deleteSuccess = await deleteScopeEmission(targetCalculator.id)

        if (!deleteSuccess) {
          alert('서버에서 데이터 삭제에 실패했습니다. 다시 시도해주세요.')
          return
        }
      }

      // 항목이 하나만 있는 경우: 값 초기화 (빈 계산기로 변경)
      if (isLastItem) {
        const newTemporaryId = generateNewTemporaryId(activeCategory)

        setCategoryCalculators(prev => {
          const updated = {
            ...prev,
            [activeCategory]: [
              {
                id: newTemporaryId, // 새로운 임시 ID로 교체
                state: {
                  category: '',
                  separate: '',
                  rawMaterial: '',
                  quantity: '',
                  unit: '',
                  kgCO2eq: ''
                }
                // savedData는 없음 (새로운 빈 데이터)
              }
            ]
          }
          return updated
        })

        // 배출량 총계도 0으로 초기화
        setCategoryTotals(prev => {
          const updated = {
            ...prev,
            [activeCategory]: [
              {
                id: newTemporaryId,
                emission: 0
              }
            ]
          }
          return updated
        })

        // 수동 입력 모드도 초기화 (기본값: 자동 모드)
        handleModeChange(newTemporaryId, false)
      } else {
        // 여러 항목이 있는 경우: 선택된 항목만 완전 삭제
        setCategoryCalculators(prev => {
          const updated = {
            ...prev,
            [activeCategory]: (prev[activeCategory] || []).filter(c => c.id !== id)
          }
          return updated
        })

        // 배출량 총계에서도 제거
        setCategoryTotals(prev => {
          const updated = {
            ...prev,
            [activeCategory]: (prev[activeCategory] || []).filter(t => t.id !== id)
          }
          return updated
        })

        // 수동 입력 모드에서도 제거
        setCalculatorModes(prev => {
          const categoryModes = prev[activeCategory] || {}
          const {[id]: _, ...updatedModes} = categoryModes
          return {
            ...prev,
            [activeCategory]: updatedModes
          }
        })
      }

      // 백엔드 데이터가 있었던 경우 전체 데이터 새로고침
      if (isEmissionId(targetCalculator.id)) {
        await refreshData()
      }
    } catch (error) {
      alert('데이터 삭제 중 오류가 발생했습니다. 콘솔을 확인해주세요.')
    }
  }

  /**
   * 계산기 입력 상태 업데이트 핸들러
   */
  const updateCalculatorState = (id: number, newState: SelectorState) => {
    if (!activeCategory) return

    setCategoryCalculators(prev => ({
      ...prev,
      [activeCategory]: (prev[activeCategory] || []).map(c =>
        c.id === id ? {...c, state: newState} : c
      )
    }))
  }

  /**
   * 카테고리 선택 핸들러
   * 새로운 카테고리 선택 시 기본 계산기 1개 자동 생성
   */
  const handleCategorySelect = (category: Scope3CategoryKey) => {
    setActiveCategory(category)

    // 해당 카테고리에 계산기가 없으면 기본 계산기 1개 생성
    if (!categoryCalculators[category] || categoryCalculators[category]!.length === 0) {
      const newId = generateNewTemporaryId(category)

      setCategoryCalculators(prev => ({
        ...prev,
        [category]: [
          {
            id: newId,
            state: {category: '', separate: '', rawMaterial: '', quantity: ''}
            // savedData는 없음 (아직 저장되지 않은 새 데이터)
          }
        ]
      }))

      // 기본 계산기의 모드를 수동 입력(false)으로 설정
      setCalculatorModes(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [newId]: false // 수동 입력이 기본값 (false)
        }
      }))
    }
  }

  /**
   * 카테고리 입력 완료 핸들러
   */
  const handleComplete = () => {
    setActiveCategory(null) // 카테고리 선택 화면으로 돌아가기
  }

  /**
   * 목록으로 돌아가기 핸들러
   */
  const handleBackToList = () => {
    setActiveCategory(null)
  }

  // 전체 총 배출량 계산
  const grandTotal = Object.keys({
    list1: '',
    list2: '',
    list3: '',
    list4: '',
    list5: '',
    list6: '',
    list7: '',
    list8: '',
    list9: '',
    list10: '',
    list11: '',
    list12: '',
    list13: '',
    list14: '',
    list15: ''
  }).reduce((sum, key) => sum + getTotalEmission(key as Scope3CategoryKey), 0)

  // ========================================================================
  // 백엔드 데이터 로드 함수 (Backend Data Loading Functions)
  // ========================================================================

  /**
   * 연도/월별 Scope3 데이터 전체 조회
   * selectedYear, selectedMonth 변경 시 자동 호출
   */
  const loadScope3Data = async () => {
    if (!selectedYear || !selectedMonth) return

    setIsLoading(true)
    try {
      // 1. 전체 배출량 데이터 조회 (Scope 3만 필터링)
      const emissionsData = await fetchEmissionsByYearAndMonth(
        selectedYear,
        selectedMonth,
        'SCOPE3'
      )
      setScope3Data(emissionsData)

      // 2. 카테고리별 요약 데이터 조회
      const summaryData = await fetchCategorySummaryByScope(
        'SCOPE3',
        selectedYear,
        selectedMonth
      )
      setCategorySummary(summaryData)

      // 3. 종합 집계 데이터 조회 (계층적 집계 표시용)
      const aggregationData = await fetchComprehensiveAggregation(
        selectedYear,
        selectedMonth
      )
      setAggregationData(aggregationData)

      // 4. 기존 데이터를 카테고리별 계산기로 변환
      convertBackendDataToCalculators(emissionsData)
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 백엔드 데이터를 프론트엔드 계산기 형식으로 변환
   * 기존 저장된 데이터를 각 카테고리의 계산기 목록으로 변환하여 표시
   */
  const convertBackendDataToCalculators = (data: ScopeEmissionResponse[]) => {
    const categorizedData: {[key in Scope3CategoryKey]?: CalculatorData[]} = {}

    // 카테고리별로 데이터 그룹화
    data.forEach(emission => {
      const categoryKey = getCategoryKeyByNumber(emission.scope3CategoryNumber || 0)
      if (!categoryKey) return

      if (!categorizedData[categoryKey]) {
        categorizedData[categoryKey] = []
      }

      // 백엔드 데이터를 계산기 형식으로 변환
      // id가 유효하지 않으면 새 ID 생성
      const calculatorId =
        emission.id && emission.id > 0 ? emission.id : generateNewTemporaryId(categoryKey)

      const calculatorData: CalculatorData = {
        id: calculatorId, // 유효한 ID 사용
        state: {
          category: emission.majorCategory,
          separate: emission.subcategory,
          rawMaterial: emission.rawMaterial,
          unit: emission.unit,
          kgCO2eq: emission.emissionFactor.toString(),
          quantity: emission.activityAmount.toString()
        },
        savedData: emission // 전체 백엔드 데이터 보관
      }

      // 수동 입력 모드 상태도 함께 복원 (화면 반전 로직 고려)
      if (emission.inputType !== undefined) {
        setCalculatorModes(prev => ({
          ...prev,
          [categoryKey]: {
            ...prev[categoryKey],
            [calculatorId]: emission.inputType === 'LCA' // 수정: 화면에서 반전되므로 LCA일 때 true
          }
        }))
      }

      categorizedData[categoryKey].push(calculatorData)
    })

    // 실제 state 업데이트 수행
    setCategoryCalculators(prevState => {
      const newState = {...prevState}
      Object.entries(categorizedData).forEach(([categoryKey, calculators]) => {
        newState[categoryKey as Scope3CategoryKey] = calculators || []
      })
      return newState
    })

    setCategoryTotals(prevState => {
      const newState = {...prevState}
      Object.entries(categorizedData).forEach(([categoryKey, calculators]) => {
        newState[categoryKey as Scope3CategoryKey] = (calculators || []).map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        }))
      })
      return newState
    })
  }

  /**
   * 카테고리 번호를 카테고리 키로 변환
   * 백엔드의 categoryNumber(1~15)를 프론트엔드의 list1~list15로 매핑
   */
  const getCategoryKeyByNumber = (categoryNumber: number): Scope3CategoryKey | null => {
    const categoryMap: {[key: number]: Scope3CategoryKey} = {
      1: 'list1',
      2: 'list2',
      3: 'list3',
      4: 'list4',
      5: 'list5',
      6: 'list6',
      7: 'list7',
      8: 'list8',
      9: 'list9',
      10: 'list10',
      11: 'list11',
      12: 'list12',
      13: 'list13',
      14: 'list14',
      15: 'list15'
    }
    return categoryMap[categoryNumber] || null
  }

  // ========================================================================
  // useEffect 훅 (Lifecycle Effects)
  // ========================================================================

  /**
   * 연도/월 변경 시 데이터 자동 로드
   * 새로운 년도나 월을 선택하면 해당 기간의 기존 데이터를 불러와서 표시
   */
  useEffect(() => {
    if (selectedYear && selectedMonth) {
      loadScope3Data()
    }
  }, [selectedYear, selectedMonth, refreshTrigger]) // refreshTrigger로 CRUD 후 재조회

  /**
   * 컴포넌트 마운트 시 잘못된 ID 수정
   */
  useEffect(() => {
    // 약간의 지연 후 ID 수정 실행 (데이터 로딩 완료 후)
    const timer = setTimeout(() => {
      fixInvalidCalculatorIds()
    }, 1000)

    return () => clearTimeout(timer)
  }, []) // 마운트 시 한 번만 실행

  /**
   * 기존 계산기들의 잘못된 ID를 수정하는 함수
   * undefined나 잘못된 ID를 가진 계산기들을 새로운 유효한 ID로 교체
   */
  const fixInvalidCalculatorIds = () => {
    setCategoryCalculators(prev => {
      const updated = {...prev}
      let hasChanges = false

      Object.keys(updated).forEach(categoryKey => {
        const calculators = updated[categoryKey as Scope3CategoryKey] || []
        const fixedCalculators = calculators.map(calc => {
          if (
            calc.id === undefined ||
            calc.id === null ||
            isNaN(calc.id) ||
            calc.id <= 0
          ) {
            const newId = generateNewTemporaryId(categoryKey as Scope3CategoryKey)
            hasChanges = true
            return {...calc, id: newId}
          }
          return calc
        })

        if (hasChanges) {
          updated[categoryKey as Scope3CategoryKey] = fixedCalculators
        }
      })

      if (hasChanges) {
        return updated
      }

      return prev
    })
  }

  /**
   * 데이터 새로고침 함수
   * CategoryDataInput에서 CRUD 작업 완료 후 호출하여 최신 데이터 반영
   */
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // ========================================================================
  // 렌더링 (Rendering)
  // ========================================================================

  return (
    <div className="flex flex-col w-full h-full p-4">
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
              <span className="font-bold text-blue-600">Scope3</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ========================================================================
          헤더 섹션 (Header Section)
          - 뒤로가기 버튼과 페이지 제목/설명
          ======================================================================== */}
      <div className="flex flex-row justify-between w-full h-24 mb-4">
        <div className="flex flex-row items-center p-4">
          <PageHeader
            icon={<Factory className="w-6 h-6 text-blue-600" />}
            title="Scope 3 배출량 관리"
            description="15개 카테고리별 간접 배출량 데이터를 관리하고 추적합니다"
            module="SCOPE"
            submodule="scope3"
          />
        </div>
      </div>

      {/* ========================================================================
          메인 컨텐츠 영역 (Main Content Area)
          - 카테고리 선택 또는 데이터 입력 화면
          ======================================================================== */}
      {activeCategory === null ? (
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
                    <p className="text-sm font-medium text-gray-500">연 배출량</p>
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
                </div>
                <div className="flex flex-col w-full space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-customG-700 whitespace-nowrap">
                    <CalendarDays className="w-4 h-4" />
                    보고연도
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
                    <p className="text-sm font-medium text-gray-500">월 배출량</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {aggregationData
                        ? (
                            aggregationData.scope3Category1Aggregated +
                            aggregationData.scope3Category2Aggregated +
                            aggregationData.scope3Category4Aggregated +
                            aggregationData.scope3Category5Aggregated +
                            // 나머지 카테고리는 본인 입력값 사용
                            Object.entries(categorySummary)
                              .filter(
                                ([catNum]) => ![1, 2, 4, 5].includes(Number(catNum))
                              )
                              .reduce((sum, [, emission]) => sum + emission, 0)
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2
                          })
                        : '0.00'}
                      <span className="ml-1 text-sm font-normal text-gray-500">
                        kgCO₂eq
                      </span>
                    </h3>
                  </div>
                </div>
                <div className="flex flex-col w-full space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-customG-700">
                    <CalendarDays className="w-4 h-4" />
                    보고월
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

          {/* 카테고리 선택 그리드 */}
          <CategorySelector
            categoryList={scope3CategoryList}
            getTotalEmission={getTotalEmission}
            onCategorySelect={handleCategorySelect}
            animationDelay={0.2}
          />
        </motion.div>
      ) : (
        /* ====================================================================
            카테고리별 데이터 입력 화면 (Category Data Input Screen)
            ==================================================================== */
        <CategoryDataInput
          activeCategory={activeCategory}
          calculators={getCurrentCalculators()}
          getTotalEmission={getTotalEmission}
          onAddCalculator={addCalculator}
          onRemoveCalculator={removeCalculator}
          onUpdateCalculatorState={updateCalculatorState}
          onChangeTotal={updateTotal}
          onComplete={handleComplete}
          onBackToList={handleBackToList}
          calculatorModes={calculatorModes[activeCategory] || {}} // 현재 카테고리만 전달
          onModeChange={handleModeChange}
          selectedYear={selectedYear} // 백엔드 저장용 연도
          selectedMonth={selectedMonth} // 백엔드 저장용 월
          onDataChange={refreshData} // CRUD 작업 후 데이터 새로고침 콜백
          aggregationData={aggregationData} // 집계 데이터 전달
        />
      )}

      <DirectionButton
        direction="left"
        tooltip="Scope 2로 이동"
        href="/scope2"
        fixed
        position="middle-left"
        size={48}
      />
    </div>
  )
}
