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
  CategoryYearlyEmission,
  CategoryMonthlyEmission,
  Scope3SpecialAggregationResponse
} from '@/types/scopeTypes'
import {
  deleteScopeEmission,
  fetchCategoryYearlyEmissions,
  fetchCategoryMonthlyEmissions,
  fetchEmissionsByScope,
  fetchScope3SpecialAggregation
} from '@/services/scopeService'
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
  const [, setScope3Data] = useState<ScopeEmissionResponse[]>([])

  // 카테고리별 요약 데이터 (CategorySummaryCard용)
  const [categorySummary, setCategorySummary] = useState<ScopeCategorySummary>({})

  // 데이터 새로고침 트리거 (CRUD 작업 후 데이터 다시 로드용)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)

  // 기간별 데이터 상태 관리 (Period-specific Data State)
  const [periodEmissions, setPeriodEmissions] = useState<ScopeEmissionResponse[]>([])
  const [periodTotal, setPeriodTotal] = useState<number>(0)
  const [filteredCategoryTotals, setFilteredCategoryTotals] = useState<
    Record<Scope3CategoryKey, number>
  >({
    list1: 0,
    list2: 0,
    list3: 0,
    list4: 0,
    list5: 0,
    list6: 0,
    list7: 0,
    list8: 0,
    list9: 0,
    list10: 0,
    list11: 0,
    list12: 0,
    list13: 0,
    list14: 0,
    list15: 0
  })

  // 카테고리별 상세 데이터 상태 (Category Detail Data State)
  const [categoryYearlyData, setCategoryYearlyData] = useState<CategoryYearlyEmission[]>(
    []
  )
  const [categoryMonthlyData, setCategoryMonthlyData] = useState<
    CategoryMonthlyEmission[]
  >([])
  const [totalSumAllCategories, setTotalSumAllCategories] = useState<number>(0)

  // Scope 3 특수 집계 데이터 상태 (Scope 3 Special Aggregation State)
  const [scope3SpecialData, setScope3SpecialData] =
    useState<Scope3SpecialAggregationResponse | null>(null)

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
  // const isTemporaryId = (id: number): boolean => id < 0

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
        refreshData()
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
   * 새로운 카테고리별 API 메서드 사용으로 상세한 집계 정보 제공
   * + Scope 3 특수 집계 데이터 조회 추가
   */
  const loadScope3Data = async () => {
    if (!selectedYear) return

    try {
      // 1. 항상 연간 데이터 조회 (연 배출량 카드용)
      const yearlyData = await fetchCategoryYearlyEmissions('SCOPE3', selectedYear)
      setCategoryYearlyData(yearlyData)

      // 2. 연간 총 배출량 설정
      let yearlyTotalSum = 0
      if (yearlyData.length > 0 && yearlyData[0].totalSumAllCategories) {
        yearlyTotalSum = yearlyData[0].totalSumAllCategories
      }
      setTotalSumAllCategories(yearlyTotalSum)

      // 3. 월이 선택된 경우 월간 데이터 조회
      let monthlyFilteredData: CategoryMonthlyEmission[] = []
      let monthlyTotalSum = 0

      if (selectedMonth) {
        // 월간 데이터 조회
        const monthlyData = await fetchCategoryMonthlyEmissions('SCOPE3', selectedYear)
        // 선택된 월의 데이터만 필터링
        monthlyFilteredData = monthlyData.filter(data => data.month === selectedMonth)
        setCategoryMonthlyData(monthlyFilteredData)

        // 해당 월의 총 배출량 계산
        monthlyTotalSum = monthlyFilteredData.reduce((sum, category) => {
          return sum + (category.totalEmission || 0)
        }, 0)

        // 4. Scope 3 특수 집계 데이터 조회 (월이 선택된 경우에만)
        try {
          console.log(
            `[Scope3Form] 특수 집계 데이터 요청: ${selectedYear}년 ${selectedMonth}월`
          )
          const specialAggregationData = await fetchScope3SpecialAggregation(
            selectedYear,
            selectedMonth
          )
          setScope3SpecialData(specialAggregationData)

          if (specialAggregationData) {
            console.log('[Scope3Form] 특수 집계 데이터 로드 완료:', {
              연도: specialAggregationData.reportingYear,
              월: specialAggregationData.reportingMonth,
              사용자타입: specialAggregationData.userType,
              조직ID: specialAggregationData.organizationId,
              'Cat.1 총 배출량 (계층적 롤업)':
                specialAggregationData.category1TotalEmission,
              'Cat.2 총 배출량 (계층적 롤업)':
                specialAggregationData.category2TotalEmission,
              'Cat.4 총 배출량 (계층적 롤업)':
                specialAggregationData.category4TotalEmission,
              'Cat.5 총 배출량 (계층적 롤업)':
                specialAggregationData.category5TotalEmission
            })
          } else {
            console.log('[Scope3Form] 특수 집계 데이터 없음')
          }
        } catch (error) {
          console.warn('[Scope3Form] 특수 집계 데이터 조회 실패:', error)
          setScope3SpecialData(null)
        }
      } else {
        setCategoryMonthlyData([])
        setScope3SpecialData(null) // 월이 선택되지 않으면 특수 집계 데이터 초기화
        console.log('[Scope3Form] 월이 선택되지 않아 특수 집계 데이터 초기화')
      }

      // 5. 상세 배출량 데이터 조회 (연간/월간 공통 - 계산기용)
      const emissionsData = await fetchEmissionsByScope('SCOPE3')

      // 선택된 기간에 맞게 필터링
      const filteredEmissions = selectedMonth
        ? emissionsData.filter(
            emission =>
              emission.reportingYear === selectedYear &&
              emission.reportingMonth === selectedMonth
          )
        : emissionsData.filter(emission => emission.reportingYear === selectedYear)

      setPeriodEmissions(filteredEmissions)
      setScope3Data(filteredEmissions)
      convertBackendDataToCalculators(filteredEmissions)

      // 6. 기간별 총 배출량 설정 (월이 선택된 경우 월 총합, 아니면 연 총합)
      setPeriodTotal(selectedMonth ? monthlyTotalSum : yearlyTotalSum)

      // 7. 카테고리별 필터링된 총합 계산 (하단 카테고리 목록용)
      const categoryTotals: Record<Scope3CategoryKey, number> = {
        list1: 0,
        list2: 0,
        list3: 0,
        list4: 0,
        list5: 0,
        list6: 0,
        list7: 0,
        list8: 0,
        list9: 0,
        list10: 0,
        list11: 0,
        list12: 0,
        list13: 0,
        list14: 0,
        list15: 0
      }

      // 월이 선택된 경우 월별 데이터 기준, 아니면 연간 데이터 기준으로 카테고리 총합 계산
      const dataForCategories = selectedMonth ? monthlyFilteredData : yearlyData
      dataForCategories.forEach(category => {
        const categoryKey = getCategoryKeyByNumber(category.categoryNumber || 0)
        if (categoryKey) {
          categoryTotals[categoryKey] = category.totalEmission || 0
        }
      })

      setFilteredCategoryTotals(categoryTotals)
    } catch (error) {
      console.error('Scope3 데이터 로딩 중 오류:', error)
      // 에러 발생 시 상태 초기화
      setPeriodEmissions([])
      setPeriodTotal(0)
      setTotalSumAllCategories(0)
      setCategoryYearlyData([])
      setCategoryMonthlyData([])
      setScope3SpecialData(null)
      setFilteredCategoryTotals({
        list1: 0,
        list2: 0,
        list3: 0,
        list4: 0,
        list5: 0,
        list6: 0,
        list7: 0,
        list8: 0,
        list9: 0,
        list10: 0,
        list11: 0,
        list12: 0,
        list13: 0,
        list14: 0,
        list15: 0
      })
    }
  }

  /**
   * 백엔드 데이터를 프론트엔드 계산기 형식으로 변환
   * 기존 저장된 데이터를 각 카테고리의 계산기 목록으로 변환하여 표시
   * 완전 초기화를 통해 이전 데이터 잔존 방지
   */
  const convertBackendDataToCalculators = (data: ScopeEmissionResponse[]) => {
    const categorizedData: {[key in Scope3CategoryKey]?: CalculatorData[]} = {}
    const newCalculatorModes: Record<Scope3CategoryKey, Record<number, boolean>> = {
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
    }

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
        newCalculatorModes[categoryKey][calculatorId] = emission.inputType === 'LCA'
      }

      categorizedData[categoryKey].push(calculatorData)
    })

    // 모든 카테고리를 완전히 새로운 상태로 초기화
    const newCategoryCalculators: Record<Scope3CategoryKey, CalculatorData[]> = {
      list1: categorizedData.list1 || [],
      list2: categorizedData.list2 || [],
      list3: categorizedData.list3 || [],
      list4: categorizedData.list4 || [],
      list5: categorizedData.list5 || [],
      list6: categorizedData.list6 || [],
      list7: categorizedData.list7 || [],
      list8: categorizedData.list8 || [],
      list9: categorizedData.list9 || [],
      list10: categorizedData.list10 || [],
      list11: categorizedData.list11 || [],
      list12: categorizedData.list12 || [],
      list13: categorizedData.list13 || [],
      list14: categorizedData.list14 || [],
      list15: categorizedData.list15 || []
    }

    const newCategoryTotals: Record<Scope3CategoryKey, {id: number; emission: number}[]> =
      {
        list1: (categorizedData.list1 || []).map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
        list2: (categorizedData.list2 || []).map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
        list3: (categorizedData.list3 || []).map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
        list4: (categorizedData.list4 || []).map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
        list5: (categorizedData.list5 || []).map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
        list6: (categorizedData.list6 || []).map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
        list7: (categorizedData.list7 || []).map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
        list8: (categorizedData.list8 || []).map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
        list9: (categorizedData.list9 || []).map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
        list10: (categorizedData.list10 || []).map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
        list11: (categorizedData.list11 || []).map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
        list12: (categorizedData.list12 || []).map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
        list13: (categorizedData.list13 || []).map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
        list14: (categorizedData.list14 || []).map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
        list15: (categorizedData.list15 || []).map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        }))
      }

    // state를 완전히 새로운 상태로 설정
    setCategoryCalculators(newCategoryCalculators)
    setCategoryTotals(newCategoryTotals)
    setCalculatorModes(newCalculatorModes)
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
   * selectedMonth가 null이면 연간 데이터 조회
   */
  useEffect(() => {
    if (selectedYear) {
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
  // 특수 집계 데이터 활용 함수 (Special Aggregation Data Functions)
  // ========================================================================

  /**
   * 특수 집계 데이터가 있는 카테고리의 배출량 반환
   * Cat.1, 2, 4, 5는 특수 집계 값 우선 사용 (월이 선택된 경우에만)
   */
  const getEmissionForCategory = (categoryKey: Scope3CategoryKey): number => {
    // 특수 집계 데이터가 있고 월이 선택된 경우
    if (scope3SpecialData && selectedMonth) {
      switch (categoryKey) {
        case 'list1': // Cat.1: 구매한 상품 및 서비스
          console.log(
            `[getEmissionForCategory] Cat.1 특수 집계 값 사용: ${scope3SpecialData.category1TotalEmission}`
          )
          return scope3SpecialData.category1TotalEmission
        case 'list2': // Cat.2: 자본재
          console.log(
            `[getEmissionForCategory] Cat.2 특수 집계 값 사용: ${scope3SpecialData.category2TotalEmission}`
          )
          return scope3SpecialData.category2TotalEmission
        case 'list4': // Cat.4: 업스트림 운송 및 유통
          console.log(
            `[getEmissionForCategory] Cat.4 특수 집계 값 사용: ${scope3SpecialData.category4TotalEmission}`
          )
          return scope3SpecialData.category4TotalEmission
        case 'list5': // Cat.5: 폐기물 처리
          console.log(
            `[getEmissionForCategory] Cat.5 특수 집계 값 사용: ${scope3SpecialData.category5TotalEmission}`
          )
          return scope3SpecialData.category5TotalEmission
        default:
          // 다른 카테고리는 기존 로직 사용
          break
      }
    }

    // 일반 집계 데이터 사용 (Cat.3, 6-15 또는 특수 집계 데이터가 없는 경우)
    const filteredTotal = filteredCategoryTotals[categoryKey] || 0
    const localTotal = getTotalEmission(categoryKey)
    const finalValue = Math.max(filteredTotal, localTotal)

    if (filteredTotal > 0 || localTotal > 0) {
      console.log(
        `[getEmissionForCategory] ${categoryKey} 일반 집계 값 사용: ${finalValue} (filtered: ${filteredTotal}, local: ${localTotal})`
      )
    }

    return finalValue
  }

  /**
   * 특수 집계 카테고리 여부 확인
   */
  const isSpecialAggregationCategory = (categoryKey: Scope3CategoryKey): boolean => {
    return ['list1', 'list2', 'list4', 'list5'].includes(categoryKey)
  }

  /**
   * 특수 집계 배지 표시 여부
   */
  const shouldShowSpecialBadge = (categoryKey: Scope3CategoryKey): boolean => {
    return (
      scope3SpecialData !== null &&
      selectedMonth !== null &&
      isSpecialAggregationCategory(categoryKey)
    )
  }

  // ========================================================================
  // 렌더링 (Rendering)
  // ========================================================================

  return (
    <div className="flex flex-col w-full h-full pt-24">
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
      <div className="flex flex-row justify-between w-full mb-4">
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
                    <p className="text-sm font-medium text-gray-500">
                      {selectedYear}년 연 배출량
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {categoryYearlyData.length > 0 &&
                      categoryYearlyData[0].totalSumAllCategories
                        ? categoryYearlyData[0].totalSumAllCategories.toLocaleString(
                            undefined,
                            {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 2
                            }
                          )
                        : '0.00'}

                      <span className="ml-1 text-sm font-normal text-gray-500">
                        kgCO₂eq
                      </span>
                    </h3>
                  </div>
                </div>
                <div className="flex flex-col w-full space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap text-customG-700">
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
                    <p className="text-sm font-medium text-gray-500">
                      {selectedMonth
                        ? `${selectedYear}년 ${selectedMonth}월`
                        : '월을 선택하세요'}{' '}
                      배출량
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedMonth && categoryMonthlyData.length > 0
                        ? categoryMonthlyData
                            .reduce(
                              (sum: number, category: CategoryMonthlyEmission) =>
                                sum + (category.totalEmission || 0),
                              0
                            )
                            .toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 2
                            })
                        : selectedMonth
                        ? '0.00'
                        : '월 선택 필요'}

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
            getTotalEmission={getEmissionForCategory} // 특수 집계 값 반영하는 함수 사용
            onCategorySelect={handleCategorySelect}
            animationDelay={0.2}
          />
        </motion.div>
      ) : (
        // 카테고리별 데이터 입력 화면 (Category Data Input Screen)
        activeCategory && (
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
          />
        )
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
