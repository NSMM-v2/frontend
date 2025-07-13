'use client'

import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'

import {Home, Factory, CalendarDays, TrendingUp} from 'lucide-react'

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
  Scope1PotentialCategoryKey,
  Scope1KineticCategoryKey,
  Scope1ProcessCategoryKey,
  Scope1LeakCategoryKey,
  scope1PotentialCategoryList,
  scope1KineticCategoryList,
  scope1ProcessCategoryList,
  scope1LeakCategoryList
} from '@/components/scopeTotal/Scope123CategorySelector'
import {Scope1DataInput} from '@/components/scope12/Scope1DataInput'
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
 * Scope 1 계산기 데이터 구조
 * 백엔드 ScopeEmission 엔티티와 연동되는 프론트엔드 계산기 상태
 */
interface CalculatorData {
  id: number // 식별자: emissionId(양수) 또는 임시ID(음수)
  state: SelectorState // 사용자 입력 상태
  savedData?: ScopeEmissionResponse // 백엔드에서 받은 전체 데이터 (저장된 경우에만)
  factoryEnabled: boolean // 계산기별 공장 설비 활성화 상태
}

/**
 * Scope 1 배출량 관리 메인 컴포넌트
 * scope3Form.tsx와 동일한 레이아웃 구조를 적용하여 일관성 있는 UI 제공
 */
export default function Scope1Form() {
  // ========================================================================
  // 기본 상태 관리 (Basic State Management)
  // ========================================================================
  const [calculatorModes, setCalculatorModes] = useState<
    Record<
      | Scope1PotentialCategoryKey
      | Scope1KineticCategoryKey
      | Scope1ProcessCategoryKey
      | Scope1LeakCategoryKey,
      Record<number, boolean>
    >
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
    list10: {}
  })

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()) // 선택된 연도
  const currentMonth = new Date().getMonth() + 1 // JavaScript의 월은 0부터 시작하므로 1을 더함
  const [selectedMonth, setSelectedMonth] = useState<number | null>(currentMonth) // 선택된 월 (null이면 전체)

  const [activePotentialCategory, setActivePotentialCategory] =
    useState<Scope1PotentialCategoryKey | null>(null) // 현재 선택된 고정연소 카테고리
  const [activeKineticCategory, setActiveKineticCategory] =
    useState<Scope1KineticCategoryKey | null>(null) // 현재 선택된 이동연소 카테고리
  const [activeProcessCategory, setActiveProcessCategory] =
    useState<Scope1ProcessCategoryKey | null>(null) // 현재 선택된 공정 카테고리
  const [activeLeakCategory, setActiveLeakCategory] =
    useState<Scope1LeakCategoryKey | null>(null) // 현재 선택된 누출 카테고리

  // 카테고리별 계산기 목록 관리
  const [potentialCategoryCalculators, setPotentialCategoryCalculators] = useState<
    Record<Scope1PotentialCategoryKey, CalculatorData[]>
  >({
    list1: [],
    list2: [],
    list3: []
  })
  const [kineticCategoryCalculators, setKineticCategoryCalculators] = useState<
    Record<Scope1KineticCategoryKey, CalculatorData[]>
  >({
    list4: [],
    list5: [],
    list6: []
  })
  const [processCategoryCalculators, setProcessCategoryCalculators] = useState<
    Record<Scope1ProcessCategoryKey, CalculatorData[]>
  >({
    list7: [],
    list8: []
  })
  const [leakCategoryCalculators, setLeakCategoryCalculators] = useState<
    Record<Scope1LeakCategoryKey, CalculatorData[]>
  >({
    list9: [],
    list10: []
  })

  // 카테고리별 배출량 총계 관리
  const [potentialCategoryTotals, setPotentialCategoryTotals] = useState<
    Record<Scope1PotentialCategoryKey, {id: number; emission: number}[]>
  >({
    list1: [],
    list2: [],
    list3: []
  })
  const [kineticCategoryTotals, setKineticCategoryTotals] = useState<
    Record<Scope1KineticCategoryKey, {id: number; emission: number}[]>
  >({
    list4: [],
    list5: [],
    list6: []
  })
  const [processCategoryTotals, setProcessCategoryTotals] = useState<
    Record<Scope1ProcessCategoryKey, {id: number; emission: number}[]>
  >({
    list7: [],
    list8: []
  })
  const [leakCategoryTotals, setLeakCategoryTotals] = useState<
    Record<Scope1LeakCategoryKey, {id: number; emission: number}[]>
  >({
    list9: [],
    list10: []
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
    if (activePotentialCategory) {
      return potentialCategoryCalculators[activePotentialCategory] || []
    } else if (activeKineticCategory) {
      return kineticCategoryCalculators[activeKineticCategory] || []
    } else if (activeProcessCategory) {
      return processCategoryCalculators[activeProcessCategory] || []
    } else if (activeLeakCategory) {
      return leakCategoryCalculators[activeLeakCategory] || []
    }
    return []
  }

  /**
   * 특정 카테고리의 총 배출량 계산 (백엔드 집계 데이터 우선 사용)
   */
  const getPotentialTotalEmission = (category: Scope1PotentialCategoryKey): number => {
    // 카테고리 키에서 번호 추출 (list1 -> 1, list2 -> 2, list3 -> 3)
    const categoryNumber = parseInt(category.replace('list', ''))

    // 백엔드 집계 데이터에서 해당 카테고리 번호 데이터 조회
    const targetData = selectedMonth
      ? categoryMonthlyData.filter(
          data => data.month === selectedMonth && data.categoryNumber === categoryNumber
        )
      : categoryYearlyData.filter(data => data.categoryNumber === categoryNumber)

    if (targetData.length > 0) {
      return targetData.reduce((sum, data) => sum + data.totalEmission, 0)
    }

    // 백엔드 데이터가 없으면 프론트엔드 계산값 사용 (fallback)
    return (potentialCategoryTotals[category] || []).reduce(
      (sum, t) => sum + t.emission,
      0
    )
  }

  const getKineticTotalEmission = (category: Scope1KineticCategoryKey): number => {
    // 카테고리 키에서 번호 추출 (list4 -> 4, list5 -> 5, list6 -> 6)
    const categoryNumber = parseInt(category.replace('list', ''))

    const targetData = selectedMonth
      ? categoryMonthlyData.filter(
          data => data.month === selectedMonth && data.categoryNumber === categoryNumber
        )
      : categoryYearlyData.filter(data => data.categoryNumber === categoryNumber)

    if (targetData.length > 0) {
      return targetData.reduce((sum, data) => sum + data.totalEmission, 0)
    }

    return (kineticCategoryTotals[category] || []).reduce((sum, t) => sum + t.emission, 0)
  }

  const getProcessTotalEmission = (category: Scope1ProcessCategoryKey): number => {
    // 카테고리 키에서 번호 추출 (list7 -> 7, list8 -> 8)
    const categoryNumber = parseInt(category.replace('list', ''))

    const targetData = selectedMonth
      ? categoryMonthlyData.filter(
          data => data.month === selectedMonth && data.categoryNumber === categoryNumber
        )
      : categoryYearlyData.filter(data => data.categoryNumber === categoryNumber)

    if (targetData.length > 0) {
      return targetData.reduce((sum, data) => sum + data.totalEmission, 0)
    }

    return (processCategoryTotals[category] || []).reduce((sum, t) => sum + t.emission, 0)
  }

  const getLeakTotalEmission = (category: Scope1LeakCategoryKey): number => {
    // 카테고리 키에서 번호 추출 (list9 -> 9, list10 -> 10)
    const categoryNumber = parseInt(category.replace('list', ''))

    const targetData = selectedMonth
      ? categoryMonthlyData.filter(
          data => data.month === selectedMonth && data.categoryNumber === categoryNumber
        )
      : categoryYearlyData.filter(data => data.categoryNumber === categoryNumber)

    if (targetData.length > 0) {
      return targetData.reduce((sum, data) => sum + data.totalEmission, 0)
    }

    return (leakCategoryTotals[category] || []).reduce((sum, t) => sum + t.emission, 0)
  }

  // ========================================================================
  // 유틸리티 함수 - ID 생성 (Utility Functions - ID Generation)
  // ========================================================================

  type Scope1CategoryGroup = 'potential' | 'kinetic' | 'process' | 'leak'

  const getCategoryGroupFromKey = (
    categoryKey: string
  ): Scope1CategoryGroup | undefined => {
    if ((categoryKey as Scope1PotentialCategoryKey) in potentialCategoryCalculators)
      return 'potential'
    if ((categoryKey as Scope1KineticCategoryKey) in kineticCategoryCalculators)
      return 'kinetic'
    if ((categoryKey as Scope1ProcessCategoryKey) in processCategoryCalculators)
      return 'process'
    if ((categoryKey as Scope1LeakCategoryKey) in leakCategoryCalculators) return 'leak'
    return undefined
  }

  /**
   * 새로운 임시 ID 생성 (음수 사용)
   */
  const generateNewTemporaryId = (
    categoryKey:
      | Scope1PotentialCategoryKey
      | Scope1KineticCategoryKey
      | Scope1ProcessCategoryKey
      | Scope1LeakCategoryKey
  ): number => {
    const group = getCategoryGroupFromKey(categoryKey)
    let existingCalculators: {id: number}[] = []

    switch (group) {
      case 'potential':
        existingCalculators =
          potentialCategoryCalculators[categoryKey as Scope1PotentialCategoryKey] || []
        break
      case 'kinetic':
        existingCalculators =
          kineticCategoryCalculators[categoryKey as Scope1KineticCategoryKey] || []
        break
      case 'process':
        existingCalculators =
          processCategoryCalculators[categoryKey as Scope1ProcessCategoryKey] || []
        break
      case 'leak':
        existingCalculators =
          leakCategoryCalculators[categoryKey as Scope1LeakCategoryKey] || []
        break
      default:
        return -1
    }

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
    const activeCategory =
      activePotentialCategory ||
      activeKineticCategory ||
      activeProcessCategory ||
      activeLeakCategory
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
    if (activePotentialCategory) {
      setPotentialCategoryTotals(prev => ({
        ...prev,
        [activePotentialCategory]: (prev[activePotentialCategory] || [])
          .map(t => (t.id === id ? {id, emission} : t))
          .concat(
            (prev[activePotentialCategory] || []).find(t => t.id === id)
              ? []
              : [{id, emission}]
          )
      }))
    } else if (activeKineticCategory) {
      setKineticCategoryTotals(prev => ({
        ...prev,
        [activeKineticCategory]: (prev[activeKineticCategory] || [])
          .map(t => (t.id === id ? {id, emission} : t))
          .concat(
            (prev[activeKineticCategory] || []).find(t => t.id === id)
              ? []
              : [{id, emission}]
          )
      }))
    } else if (activeProcessCategory) {
      setProcessCategoryTotals(prev => ({
        ...prev,
        [activeProcessCategory]: (prev[activeProcessCategory] || [])
          .map(t => (t.id === id ? {id, emission} : t))
          .concat(
            (prev[activeProcessCategory] || []).find(t => t.id === id)
              ? []
              : [{id, emission}]
          )
      }))
    } else if (activeLeakCategory) {
      setLeakCategoryTotals(prev => ({
        ...prev,
        [activeLeakCategory]: (prev[activeLeakCategory] || [])
          .map(t => (t.id === id ? {id, emission} : t))
          .concat(
            (prev[activeLeakCategory] || []).find(t => t.id === id)
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
    if (activePotentialCategory) {
      const newId = generateNewTemporaryId(activePotentialCategory)
      setPotentialCategoryCalculators(prev => ({
        ...prev,
        [activePotentialCategory]: [
          ...prev[activePotentialCategory],
          {
            id: newId,
            state: {category: '', separate: '', rawMaterial: '', quantity: ''},
            factoryEnabled: false // 기본값: 공장 설비 비활성화
          }
        ]
      }))
    } else if (activeKineticCategory) {
      const newId = generateNewTemporaryId(activeKineticCategory)
      setKineticCategoryCalculators(prev => ({
        ...prev,
        [activeKineticCategory]: [
          ...prev[activeKineticCategory],
          {
            id: newId,
            state: {category: '', separate: '', rawMaterial: '', quantity: ''},
            factoryEnabled: false // 기본값: 공장 설비 비활성화
          }
        ]
      }))
    } else if (activeProcessCategory) {
      const newId = generateNewTemporaryId(activeProcessCategory)
      setProcessCategoryCalculators(prev => ({
        ...prev,
        [activeProcessCategory]: [
          ...prev[activeProcessCategory],
          {
            id: newId,
            state: {category: '', separate: '', rawMaterial: '', quantity: ''},
            factoryEnabled: false // 기본값: 공장 설비 비활성화
          }
        ]
      }))
    } else if (activeLeakCategory) {
      const newId = generateNewTemporaryId(activeLeakCategory)
      setLeakCategoryCalculators(prev => ({
        ...prev,
        [activeLeakCategory]: [
          ...prev[activeLeakCategory],
          {
            id: newId,
            state: {category: '', separate: '', rawMaterial: '', quantity: ''},
            factoryEnabled: false // 기본값: 공장 설비 비활성화
          }
        ]
      }))
    }
  }

  /**
   * 계산기 삭제 핸들러
   * scope3Form.tsx와 동일한 패턴으로 수정
   */
  const removeCalculator = async (id: number) => {
    // 현재 활성화된 카테고리 확인
    const activeCategory =
      activePotentialCategory ||
      activeKineticCategory ||
      activeProcessCategory ||
      activeLeakCategory

    if (!activeCategory) {
      return
    }

    // 현재 카테고리의 계산기 목록 가져오기
    let currentCalculators: CalculatorData[] = []
    if (activePotentialCategory) {
      currentCalculators = potentialCategoryCalculators[activePotentialCategory] || []
    } else if (activeKineticCategory) {
      currentCalculators = kineticCategoryCalculators[activeKineticCategory] || []
    } else if (activeProcessCategory) {
      currentCalculators = processCategoryCalculators[activeProcessCategory] || []
    } else if (activeLeakCategory) {
      currentCalculators = leakCategoryCalculators[activeLeakCategory] || []
    }

    const targetCalculator = currentCalculators.find(c => c.id === id)
    const isLastItem = currentCalculators.length === 1

    if (!targetCalculator) {
      alert('삭제할 항목을 찾을 수 없습니다.')
      return
    }

    try {
      // 백엔드에 저장된 데이터가 있으면 API 호출로 삭제
      if (isEmissionId(targetCalculator.id)) {
        try {
          const deleteSuccess = await deleteScopeEmission(targetCalculator.id)
          if (!deleteSuccess) {
            // nothing
          }
        } catch (error) {
          // nothing
        }
      } else {
        // nothing
      }

      // 항목이 하나만 있는 경우: 값 초기화 (빈 계산기로 변경)
      if (isLastItem) {
        const newTemporaryId = generateNewTemporaryId(activeCategory)

        // 상태 업데이트
        if (activePotentialCategory) {
          setPotentialCategoryCalculators(prev => ({
            ...prev,
            [activePotentialCategory]: [
              {
                id: newTemporaryId,
                state: {category: '', separate: '', rawMaterial: '', quantity: ''},
                factoryEnabled: false // 기본값: 공장 설비 비활성화
              }
            ]
          }))
          setPotentialCategoryTotals(prev => ({
            ...prev,
            [activePotentialCategory]: [{id: newTemporaryId, emission: 0}]
          }))
        } else if (activeKineticCategory) {
          setKineticCategoryCalculators(prev => ({
            ...prev,
            [activeKineticCategory]: [
              {
                id: newTemporaryId,
                state: {category: '', separate: '', rawMaterial: '', quantity: ''},
                factoryEnabled: false // 기본값: 공장 설비 비활성화
              }
            ]
          }))
          setKineticCategoryTotals(prev => ({
            ...prev,
            [activeKineticCategory]: [{id: newTemporaryId, emission: 0}]
          }))
        } else if (activeProcessCategory) {
          setProcessCategoryCalculators(prev => ({
            ...prev,
            [activeProcessCategory]: [
              {
                id: newTemporaryId,
                state: {category: '', separate: '', rawMaterial: '', quantity: ''},
                factoryEnabled: false // 기본값: 공장 설비 비활성화
              }
            ]
          }))
          setProcessCategoryTotals(prev => ({
            ...prev,
            [activeProcessCategory]: [{id: newTemporaryId, emission: 0}]
          }))
        } else if (activeLeakCategory) {
          setLeakCategoryCalculators(prev => ({
            ...prev,
            [activeLeakCategory]: [
              {
                id: newTemporaryId,
                state: {category: '', separate: '', rawMaterial: '', quantity: ''},
                factoryEnabled: false // 기본값: 공장 설비 비활성화
              }
            ]
          }))
          setLeakCategoryTotals(prev => ({
            ...prev,
            [activeLeakCategory]: [{id: newTemporaryId, emission: 0}]
          }))
        }

        // 수동 입력 모드도 초기화 (기본값: 자동 모드)
        handleModeChange(newTemporaryId, false)
      } else {
        // 여러 항목이 있는 경우: 선택된 항목만 완전 삭제
        if (activePotentialCategory) {
          setPotentialCategoryCalculators(prev => ({
            ...prev,
            [activePotentialCategory]: prev[activePotentialCategory].filter(
              c => c.id !== id
            )
          }))
          setPotentialCategoryTotals(prev => ({
            ...prev,
            [activePotentialCategory]: prev[activePotentialCategory].filter(
              t => t.id !== id
            )
          }))
        } else if (activeKineticCategory) {
          setKineticCategoryCalculators(prev => ({
            ...prev,
            [activeKineticCategory]: prev[activeKineticCategory].filter(c => c.id !== id)
          }))
          setKineticCategoryTotals(prev => ({
            ...prev,
            [activeKineticCategory]: prev[activeKineticCategory].filter(t => t.id !== id)
          }))
        } else if (activeProcessCategory) {
          setProcessCategoryCalculators(prev => ({
            ...prev,
            [activeProcessCategory]: prev[activeProcessCategory].filter(c => c.id !== id)
          }))
          setProcessCategoryTotals(prev => ({
            ...prev,
            [activeProcessCategory]: prev[activeProcessCategory].filter(t => t.id !== id)
          }))
        } else if (activeLeakCategory) {
          setLeakCategoryCalculators(prev => ({
            ...prev,
            [activeLeakCategory]: prev[activeLeakCategory].filter(c => c.id !== id)
          }))
          setLeakCategoryTotals(prev => ({
            ...prev,
            [activeLeakCategory]: prev[activeLeakCategory].filter(t => t.id !== id)
          }))
        }

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
    if (activePotentialCategory) {
      setPotentialCategoryCalculators(prev => ({
        ...prev,
        [activePotentialCategory]: (prev[activePotentialCategory] || []).map(c =>
          c.id === id ? {...c, state: newState} : c
        )
      }))
    } else if (activeKineticCategory) {
      setKineticCategoryCalculators(prev => ({
        ...prev,
        [activeKineticCategory]: (prev[activeKineticCategory] || []).map(c =>
          c.id === id ? {...c, state: newState} : c
        )
      }))
    } else if (activeProcessCategory) {
      setProcessCategoryCalculators(prev => ({
        ...prev,
        [activeProcessCategory]: (prev[activeProcessCategory] || []).map(c =>
          c.id === id ? {...c, state: newState} : c
        )
      }))
    } else if (activeLeakCategory) {
      setLeakCategoryCalculators(prev => ({
        ...prev,
        [activeLeakCategory]: (prev[activeLeakCategory] || []).map(c =>
          c.id === id ? {...c, state: newState} : c
        )
      }))
    }
  }

  /**
   * 계산기별 공장 설비 상태 업데이트 핸들러
   */
  const updateFactoryEnabled = (id: number, enabled: boolean) => {
    if (activePotentialCategory) {
      setPotentialCategoryCalculators(prev => ({
        ...prev,
        [activePotentialCategory]: (prev[activePotentialCategory] || []).map(c =>
          c.id === id ? {...c, factoryEnabled: enabled} : c
        )
      }))
    } else if (activeKineticCategory) {
      setKineticCategoryCalculators(prev => ({
        ...prev,
        [activeKineticCategory]: (prev[activeKineticCategory] || []).map(c =>
          c.id === id ? {...c, factoryEnabled: enabled} : c
        )
      }))
    } else if (activeProcessCategory) {
      setProcessCategoryCalculators(prev => ({
        ...prev,
        [activeProcessCategory]: (prev[activeProcessCategory] || []).map(c =>
          c.id === id ? {...c, factoryEnabled: enabled} : c
        )
      }))
    } else if (activeLeakCategory) {
      setLeakCategoryCalculators(prev => ({
        ...prev,
        [activeLeakCategory]: (prev[activeLeakCategory] || []).map(c =>
          c.id === id ? {...c, factoryEnabled: enabled} : c
        )
      }))
    }
  }

  /**
   * 카테고리 선택 핸들러
   */
  const handlePotentialCategorySelect = (category: Scope1PotentialCategoryKey) => {
    setActivePotentialCategory(category)
    setActiveKineticCategory(null)
    setActiveProcessCategory(null)
    setActiveLeakCategory(null)

    // 해당 카테고리에 계산기가 없으면 기본 계산기 1개 생성
    if (
      !potentialCategoryCalculators[category] ||
      potentialCategoryCalculators[category]!.length === 0
    ) {
      const newId = generateNewTemporaryId(category)
      setPotentialCategoryCalculators(prev => ({
        ...prev,
        [category]: [
          {
            id: newId,
            state: {category: '', separate: '', rawMaterial: '', quantity: ''},
            factoryEnabled: false // 기본값: 공장 설비 비활성화
          }
        ]
      }))
    }
  }

  const handleKineticCategorySelect = (category: Scope1KineticCategoryKey) => {
    setActiveKineticCategory(category)
    setActivePotentialCategory(null)
    setActiveProcessCategory(null)
    setActiveLeakCategory(null)

    if (
      !kineticCategoryCalculators[category] ||
      kineticCategoryCalculators[category]!.length === 0
    ) {
      const newId = generateNewTemporaryId(category)
      setKineticCategoryCalculators(prev => ({
        ...prev,
        [category]: [
          {
            id: newId,
            state: {category: '', separate: '', rawMaterial: '', quantity: ''},
            factoryEnabled: false // 기본값: 공장 설비 비활성화
          }
        ]
      }))
    }
  }

  const handleProcessCategorySelect = (category: Scope1ProcessCategoryKey) => {
    setActiveProcessCategory(category)
    setActivePotentialCategory(null)
    setActiveKineticCategory(null)
    setActiveLeakCategory(null)

    if (
      !processCategoryCalculators[category] ||
      processCategoryCalculators[category]!.length === 0
    ) {
      const newId = generateNewTemporaryId(category)
      setProcessCategoryCalculators(prev => ({
        ...prev,
        [category]: [
          {
            id: newId,
            state: {category: '', separate: '', rawMaterial: '', quantity: ''},
            factoryEnabled: false // 기본값: 공장 설비 비활성화
          }
        ]
      }))
    }
  }

  const handleLeakCategorySelect = (category: Scope1LeakCategoryKey) => {
    setActiveLeakCategory(category)
    setActivePotentialCategory(null)
    setActiveKineticCategory(null)
    setActiveProcessCategory(null)

    if (
      !leakCategoryCalculators[category] ||
      leakCategoryCalculators[category]!.length === 0
    ) {
      const newId = generateNewTemporaryId(category)
      setLeakCategoryCalculators(prev => ({
        ...prev,
        [category]: [
          {
            id: newId,
            state: {category: '', separate: '', rawMaterial: '', quantity: ''},
            factoryEnabled: false // 기본값: 공장 설비 비활성화
          }
        ]
      }))
    }
  }

  /**
   * 카테고리 입력 완료 핸들러
   */
  const handleComplete = () => {
    setActivePotentialCategory(null)
    setActiveKineticCategory(null)
    setActiveProcessCategory(null)
    setActiveLeakCategory(null)
  }

  /**
   * 목록으로 돌아가기 핸들러
   */
  const handleBackToList = () => {
    setActivePotentialCategory(null)
    setActiveKineticCategory(null)
    setActiveProcessCategory(null)
    setActiveLeakCategory(null)
  }

  // ========================================================================
  // 백엔드 데이터 로드 함수 (Backend Data Loading Functions)
  // ========================================================================

  /**
   * 연도/월별 Scope1 데이터 전체 조회
   * Scope2/Scope3와 동일한 로직으로 완전 재구현
   */
  const loadScope1Data = async () => {
    if (!selectedYear) return

    try {
      // 1. 항상 연간 데이터 조회 (연간 배출량 카드용)
      const yearlyData = await fetchCategoryYearlyEmissions('SCOPE1', selectedYear)
      setCategoryYearlyData(yearlyData)

      // 연간 데이터에서 총합 계산 및 설정 (연도 변경시에만 업데이트)
      const yearlyTotal = yearlyData.reduce((sum, data) => sum + data.totalEmission, 0)
      setYearlyTotalEmission(yearlyTotal)

      // 2. 월간 데이터 조회 및 처리
      if (selectedMonth) {
        const monthlyData = await fetchCategoryMonthlyEmissions('SCOPE1', selectedYear)
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

      // 3. 항상 전체 배출량 데이터 조회 (계산기용)
      const emissionsData = await fetchEmissionsByScope('SCOPE1')

      // 4. 선택된 기간에 맞는 데이터만 필터링
      const filteredEmissions = selectedMonth
        ? emissionsData.filter(
            emission =>
              emission.reportingYear === selectedYear &&
              emission.reportingMonth === selectedMonth
          )
        : emissionsData.filter(emission => emission.reportingYear === selectedYear)

      // 5. 백엔드 데이터를 계산기 형식으로 변환 (완전 초기화)
      convertBackendDataToCalculators(filteredEmissions)
    } catch (error) {
      console.error('Scope1 데이터 로드 오류:', error)
    }
  }

  /**
   * 백엔드 데이터를 프론트엔드 계산기 형식으로 변환
   * Scope2/Scope3와 동일한 완전 초기화 방식 적용
   */
  const convertBackendDataToCalculators = (data: ScopeEmissionResponse[]) => {
    // 완전 초기화를 위한 임시 데이터 구조
    const newPotentialData: CalculatorData[] = []
    const newKineticData: CalculatorData[] = []
    const newProcessData: CalculatorData[] = []
    const newLeakData: CalculatorData[] = []
    const newCalculatorModes: Record<string, Record<number, boolean>> = {
      list1: {},
      list2: {},
      list3: {},
      list4: {},
      list5: {},
      list6: {},
      list7: {},
      list8: {},
      list9: {},
      list10: {}
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
      if (
        emission.scope1CategoryNumber &&
        emission.scope1CategoryNumber >= 1 &&
        emission.scope1CategoryNumber <= 3
      ) {
        newPotentialData.push(calculatorData)
      } else if (
        emission.scope1CategoryNumber &&
        emission.scope1CategoryNumber >= 4 &&
        emission.scope1CategoryNumber <= 6
      ) {
        newKineticData.push(calculatorData)
      } else if (
        emission.scope1CategoryNumber &&
        emission.scope1CategoryNumber >= 7 &&
        emission.scope1CategoryNumber <= 8
      ) {
        newProcessData.push(calculatorData)
      } else if (
        emission.scope1CategoryNumber &&
        emission.scope1CategoryNumber >= 9 &&
        emission.scope1CategoryNumber <= 10
      ) {
        newLeakData.push(calculatorData)
      }

      // 수동 입력 모드 상태 설정 (화면 반전 로직 고려)
      if (emission.inputType !== undefined && emission.scope1CategoryNumber) {
        const categoryKey = `list${emission.scope1CategoryNumber}`
        newCalculatorModes[categoryKey][calculatorId] = emission.inputType === 'LCA'
      }
    })

    // 완전 새로운 상태로 교체 (이전 데이터 잔존 방지)
    setPotentialCategoryCalculators({
      list1: newPotentialData.filter(d => d.savedData?.scope1CategoryNumber === 1),
      list2: newPotentialData.filter(d => d.savedData?.scope1CategoryNumber === 2),
      list3: newPotentialData.filter(d => d.savedData?.scope1CategoryNumber === 3)
    })

    setKineticCategoryCalculators({
      list4: newKineticData.filter(d => d.savedData?.scope1CategoryNumber === 4),
      list5: newKineticData.filter(d => d.savedData?.scope1CategoryNumber === 5),
      list6: newKineticData.filter(d => d.savedData?.scope1CategoryNumber === 6)
    })

    setProcessCategoryCalculators({
      list7: newProcessData.filter(d => d.savedData?.scope1CategoryNumber === 7),
      list8: newProcessData.filter(d => d.savedData?.scope1CategoryNumber === 8)
    })

    setLeakCategoryCalculators({
      list9: newLeakData.filter(d => d.savedData?.scope1CategoryNumber === 9),
      list10: newLeakData.filter(d => d.savedData?.scope1CategoryNumber === 10)
    })

    // 배출량 총계 완전 교체
    setPotentialCategoryTotals({
      list1: newPotentialData
        .filter(d => d.savedData?.scope1CategoryNumber === 1)
        .map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
      list2: newPotentialData
        .filter(d => d.savedData?.scope1CategoryNumber === 2)
        .map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
      list3: newPotentialData
        .filter(d => d.savedData?.scope1CategoryNumber === 3)
        .map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        }))
    })

    setKineticCategoryTotals({
      list4: newKineticData
        .filter(d => d.savedData?.scope1CategoryNumber === 4)
        .map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
      list5: newKineticData
        .filter(d => d.savedData?.scope1CategoryNumber === 5)
        .map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
      list6: newKineticData
        .filter(d => d.savedData?.scope1CategoryNumber === 6)
        .map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        }))
    })

    setProcessCategoryTotals({
      list7: newProcessData
        .filter(d => d.savedData?.scope1CategoryNumber === 7)
        .map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
      list8: newProcessData
        .filter(d => d.savedData?.scope1CategoryNumber === 8)
        .map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        }))
    })

    setLeakCategoryTotals({
      list9: newLeakData
        .filter(d => d.savedData?.scope1CategoryNumber === 9)
        .map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
      list10: newLeakData
        .filter(d => d.savedData?.scope1CategoryNumber === 10)
        .map(calc => ({
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
   * Scope2/Scope3와 동일한 로직으로 월이 null이어도 로드
   */
  useEffect(() => {
    if (selectedYear) {
      loadScope1Data()
    }
  }, [selectedYear, selectedMonth, refreshTrigger])

  // ========================================================================
  // 데이터 새로고침 함수 (Data Refresh Function)
  // ========================================================================

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // 전체 총 배출량은 yearlyTotalEmission/monthlyTotalEmission으로 관리

  // ========================================================================
  // 렌더링 (Rendering)
  // ========================================================================

  return (
    <div className="flex flex-col pt-24 pb-4 w-full h-full">
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
              <span className="font-bold text-blue-600">Scope1</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ========================================================================
          헤더 섹션 (Header Section)
          - 뒤로가기 버튼과 페이지 제목/설명
          ======================================================================== */}
      <div className="flex flex-row justify-between mb-4 w-full">
        <div className="flex flex-row items-center p-4">
          <PageHeader
            icon={<Factory className="w-6 h-6 text-blue-600" />}
            title="Scope 1 배출량 관리"
            description="직접 배출량 (고정연소, 이동연소) 데이터를 관리하고 추적합니다"
            module="SCOPE"
            submodule="scope1"
          />
        </div>
      </div>

      {/* ========================================================================
          메인 컨텐츠 영역 (Main Content Area)
          - 카테고리 선택 또는 데이터 입력 화면
          ======================================================================== */}
      {!activePotentialCategory &&
      !activeKineticCategory &&
      !activeProcessCategory &&
      !activeLeakCategory ? (
        /* ====================================================================
            카테고리 선택 화면 (Category Selection Screen)
            ==================================================================== */

        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.4, delay: 0.1}}>
          {/* header card ================================================================================================================== */}
          <div className="flex flex-row gap-4 justify-between mb-4 w-full">
            {/* 연도 총 배출량 카드 ============================================================================================================== */}
            <Card className="justify-center w-full h-24 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
              <CardContent className="flex gap-6 justify-between items-center p-4">
                <div className="flex flex-row items-center">
                  <div className="p-2 mr-3 bg-blue-100 rounded-full">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Scope1 연 배출량</p>
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
                <div className="flex flex-col space-y-3 w-full">
                  <label className="flex gap-2 items-center text-sm font-semibold whitespace-nowrap text-customG-700">
                    <CalendarDays className="w-4 h-4" />
                    연도
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
              </CardContent>
            </Card>

            {/* 월 총 배출량 카드 ============================================================================================================== */}
            <Card className="justify-center w-full h-24 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
              <CardContent className="flex gap-6 justify-between items-center p-4">
                <div className="flex flex-row items-center">
                  <div className="p-2 mr-3 bg-blue-100 rounded-full">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Scope1 {selectedMonth ? `${selectedMonth}월` : '월'} 배출량
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
                <div className="flex flex-col space-y-3 w-full">
                  <label className="flex gap-2 items-center text-sm font-semibold text-customG-700">
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
            {/* 고정연소 카테고리 */}
            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.5, delay: 0.2}}>
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-bold text-customG-800">
                  고정연소 배출량
                </h2>
                <p className="text-sm text-customG-600">
                  연료 연소 시설에서 발생하는 직접 배출량
                </p>
              </div>
              <CategorySelector
                categoryList={scope1PotentialCategoryList}
                getTotalEmission={getPotentialTotalEmission}
                onCategorySelect={handlePotentialCategorySelect}
                animationDelay={0.1}
              />
            </motion.div>

            {/* 이동연소 카테고리 */}
            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.5, delay: 0.4}}>
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-bold text-customG-800">
                  이동연소 배출량
                </h2>
                <p className="text-sm text-customG-600">
                  이동수단 연료 사용으로 발생하는 직접 배출량
                </p>
              </div>
              <CategorySelector
                categoryList={scope1KineticCategoryList}
                getTotalEmission={getKineticTotalEmission}
                onCategorySelect={handleKineticCategorySelect}
                animationDelay={0.2}
              />
            </motion.div>

            {/* 공정 배출량 카테고리 */}
            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.5, delay: 0.6}}>
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-bold text-customG-800">공정 배출량</h2>
                <p className="text-sm text-customG-600">
                  제품 생산이나 화학 반응 등 산업 공정 중 원재료의 화학적 변화로 인해
                  직접적으로 발생하는 온실가스 배출량
                </p>
              </div>
              <CategorySelector
                categoryList={scope1ProcessCategoryList}
                getTotalEmission={getProcessTotalEmission}
                onCategorySelect={handleProcessCategorySelect}
                animationDelay={0.2}
              />
            </motion.div>

            {/* 냉매 누출 배출량 카테고리 */}
            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.5, delay: 0.8}}>
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-bold text-customG-800">
                  냉매 누출 배출량
                </h2>
                <p className="text-sm text-customG-600">
                  냉방, 냉동 설비 등에 사용되는 냉매가 설치, 유지보수, 폐기 과정에서 대기
                  중으로 누출되어 발생하는 온실가스 배출량
                </p>
              </div>
              <CategorySelector
                categoryList={scope1LeakCategoryList}
                getTotalEmission={getLeakTotalEmission}
                onCategorySelect={handleLeakCategorySelect}
                animationDelay={0.2}
              />
            </motion.div>
          </div>
        </motion.div>
      ) : (
        /* ====================================================================
            카테고리별 데이터 입력 화면 (Category Data Input Screen)
            ==================================================================== */
        (activePotentialCategory ||
          activeKineticCategory ||
          activeProcessCategory ||
          activeLeakCategory) && (
          <Scope1DataInput
            activeCategory={
              activePotentialCategory ||
              activeKineticCategory ||
              activeProcessCategory ||
              activeLeakCategory!
            }
            calculators={getCurrentCalculators()}
            getTotalEmission={category => {
              const group = getCategoryGroupFromKey(category)
              switch (group) {
                case 'potential':
                  return getPotentialTotalEmission(category as Scope1PotentialCategoryKey)
                case 'kinetic':
                  return getKineticTotalEmission(category as Scope1KineticCategoryKey)
                case 'process':
                  return getProcessTotalEmission(category as Scope1ProcessCategoryKey)
                case 'leak':
                  return getLeakTotalEmission(category as Scope1LeakCategoryKey)
                default:
                  return 0
              }
            }}
            onAddCalculator={addCalculator}
            onRemoveCalculator={removeCalculator}
            onUpdateCalculatorState={updateCalculatorState}
            onChangeTotal={updateTotal}
            onComplete={handleComplete}
            onBackToList={handleBackToList}
            calculatorModes={
              calculatorModes[
                activePotentialCategory ||
                  activeKineticCategory ||
                  activeProcessCategory ||
                  activeLeakCategory!
              ] || {}
            }
            onModeChange={handleModeChange}
            onFactoryEnabledChange={updateFactoryEnabled}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onDataChange={refreshData}
          />
        )
      )}
      {/* ======================================================================
          하단 네비게이션 버튼 (Bottom Navigation Button)
          ====================================================================== */}
      <DirectionButton
        direction="right"
        tooltip="Scope 2로 이동"
        href="/scope2"
        fixed
        position="middle-right"
        size={48}
      />
    </div>
  )
}
