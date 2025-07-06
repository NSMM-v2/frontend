/**
 * Scope 1 배출량 관리 폼 컴포넌트
 *
 * 주요 기능:
 * - 고정연소/이동연소 배출량 데이터 관리
 * - 카테고리별 계산기 추가/삭제 기능
 * - CSV 데이터 기반 배출계수 적용
 * - 실시간 배출량 계산 및 집계
 * - scope3Form.tsx와 동일한 레이아웃 구조 적용
 * - 백엔드 API 연동으로 데이터 영속화 지원
 * - 보고연도/월별 데이터 관리
 *
 * @author ESG Project Team
 * @version 2.0
 * @since 2024
 * @lastModified 2024-12-20
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

// 분리된 Scope1 컴포넌트들 임포트
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
 * Scope 1 계산기 데이터 구조
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
// 메인 Scope1 폼 컴포넌트 (Main Scope1 Form Component)
// ============================================================================

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

  // 전체 Scope1 배출량 데이터 (년/월 기준)
  const [scope1Data, setScope1Data] = useState<ScopeEmissionResponse[]>([])

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
   * 특정 카테고리의 총 배출량 계산
   */
  const getPotentialTotalEmission = (category: Scope1PotentialCategoryKey): number =>
    (potentialCategoryTotals[category] || []).reduce((sum, t) => sum + t.emission, 0)
  const getKineticTotalEmission = (category: Scope1KineticCategoryKey): number =>
    (kineticCategoryTotals[category] || []).reduce((sum, t) => sum + t.emission, 0)
  const getProcessTotalEmission = (category: Scope1ProcessCategoryKey): number =>
    (processCategoryTotals[category] || []).reduce((sum, t) => sum + t.emission, 0)
  const getLeakTotalEmission = (category: Scope1LeakCategoryKey): number =>
    (leakCategoryTotals[category] || []).reduce((sum, t) => sum + t.emission, 0)

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
            state: {category: '', separate: '', rawMaterial: '', quantity: ''}
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
            state: {category: '', separate: '', rawMaterial: '', quantity: ''}
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
            state: {category: '', separate: '', rawMaterial: '', quantity: ''}
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
    if (activePotentialCategory) {
      const currentCalculators =
        potentialCategoryCalculators[activePotentialCategory] || []
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
          const newTemporaryId = generateNewTemporaryId(activePotentialCategory)
          setPotentialCategoryCalculators(prev => ({
            ...prev,
            [activePotentialCategory]: [
              {
                id: newTemporaryId,
                state: {category: '', separate: '', rawMaterial: '', quantity: ''}
              }
            ]
          }))
          setPotentialCategoryTotals(prev => ({
            ...prev,
            [activePotentialCategory]: [{id: newTemporaryId, emission: 0}]
          }))
        } else {
          setPotentialCategoryCalculators(prev => ({
            ...prev,
            [activePotentialCategory]: (prev[activePotentialCategory] || []).filter(
              c => c.id !== id
            )
          }))
          setPotentialCategoryTotals(prev => ({
            ...prev,
            [activePotentialCategory]: (prev[activePotentialCategory] || []).filter(
              t => t.id !== id
            )
          }))
        }

        // 백엔드 데이터가 있었던 경우 전체 데이터 새로고침
        if (isEmissionId(id)) {
          await loadScope1Data()
        }
      } catch (error) {
        console.error('계산기 삭제 중 오류 발생:', error)
        alert('데이터 삭제 중 오류가 발생했습니다.')
      }
    } else if (activeKineticCategory) {
      const currentCalculators = kineticCategoryCalculators[activeKineticCategory] || []
      const isLastItem = currentCalculators.length === 1

      try {
        if (isEmissionId(id)) {
          const deleteSuccess = await deleteScopeEmission(id)
          if (!deleteSuccess) {
            alert('서버에서 데이터 삭제에 실패했습니다. 다시 시도해주세요.')
            return
          }
        }

        if (isLastItem) {
          const newTemporaryId = generateNewTemporaryId(activeKineticCategory)
          setKineticCategoryCalculators(prev => ({
            ...prev,
            [activeKineticCategory]: [
              {
                id: newTemporaryId,
                state: {category: '', separate: '', rawMaterial: '', quantity: ''}
              }
            ]
          }))
          setKineticCategoryTotals(prev => ({
            ...prev,
            [activeKineticCategory]: [{id: newTemporaryId, emission: 0}]
          }))
        } else {
          setKineticCategoryCalculators(prev => ({
            ...prev,
            [activeKineticCategory]: (prev[activeKineticCategory] || []).filter(
              c => c.id !== id
            )
          }))
          setKineticCategoryTotals(prev => ({
            ...prev,
            [activeKineticCategory]: (prev[activeKineticCategory] || []).filter(
              t => t.id !== id
            )
          }))
        }

        if (isEmissionId(id)) {
          await loadScope1Data()
        }
      } catch (error) {
        console.error('계산기 삭제 중 오류 발생:', error)
        alert('데이터 삭제 중 오류가 발생했습니다.')
      }
    } else if (activeProcessCategory) {
      const currentCalculators = processCategoryCalculators[activeProcessCategory] || []
      const isLastItem = currentCalculators.length === 1

      try {
        if (isEmissionId(id)) {
          const deleteSuccess = await deleteScopeEmission(id)
          if (!deleteSuccess) {
            alert('서버에서 데이터 삭제에 실패했습니다. 다시 시도해주세요.')
            return
          }
        }

        if (isLastItem) {
          const newTemporaryId = generateNewTemporaryId(activeProcessCategory)
          setProcessCategoryCalculators(prev => ({
            ...prev,
            [activeProcessCategory]: [
              {
                id: newTemporaryId,
                state: {category: '', separate: '', rawMaterial: '', quantity: ''}
              }
            ]
          }))
          setProcessCategoryTotals(prev => ({
            ...prev,
            [activeProcessCategory]: [{id: newTemporaryId, emission: 0}]
          }))
        } else {
          setProcessCategoryCalculators(prev => ({
            ...prev,
            [activeProcessCategory]: (prev[activeProcessCategory] || []).filter(
              c => c.id !== id
            )
          }))
          setProcessCategoryTotals(prev => ({
            ...prev,
            [activeProcessCategory]: (prev[activeProcessCategory] || []).filter(
              t => t.id !== id
            )
          }))
        }

        if (isEmissionId(id)) {
          await loadScope1Data()
        }
      } catch (error) {
        console.error('계산기 삭제 중 오류 발생:', error)
        alert('데이터 삭제 중 오류가 발생했습니다.')
      }
    } else if (activeLeakCategory) {
      const currentCalculators = leakCategoryCalculators[activeLeakCategory] || []
      const isLastItem = currentCalculators.length === 1

      try {
        if (isEmissionId(id)) {
          const deleteSuccess = await deleteScopeEmission(id)
          if (!deleteSuccess) {
            alert('서버에서 데이터 삭제에 실패했습니다. 다시 시도해주세요.')
            return
          }
        }

        if (isLastItem) {
          const newTemporaryId = generateNewTemporaryId(activeLeakCategory)
          setLeakCategoryCalculators(prev => ({
            ...prev,
            [activeLeakCategory]: [
              {
                id: newTemporaryId,
                state: {category: '', separate: '', rawMaterial: '', quantity: ''}
              }
            ]
          }))
          setLeakCategoryTotals(prev => ({
            ...prev,
            [activeLeakCategory]: [{id: newTemporaryId, emission: 0}]
          }))
        } else {
          setLeakCategoryCalculators(prev => ({
            ...prev,
            [activeLeakCategory]: (prev[activeLeakCategory] || []).filter(
              c => c.id !== id
            )
          }))
          setLeakCategoryTotals(prev => ({
            ...prev,
            [activeLeakCategory]: (prev[activeLeakCategory] || []).filter(
              t => t.id !== id
            )
          }))
        }

        if (isEmissionId(id)) {
          await loadScope1Data()
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
            state: {category: '', separate: '', rawMaterial: '', quantity: ''}
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
            state: {category: '', separate: '', rawMaterial: '', quantity: ''}
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
            state: {category: '', separate: '', rawMaterial: '', quantity: ''}
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
   * selectedYear, selectedMonth 변경 시 자동 호출
   */
  const loadScope1Data = async () => {
    if (!selectedYear || !selectedMonth) return

    setIsLoading(true)
    try {
      // 1. 전체 배출량 데이터 조회 (Scope 1만 필터링)
      const emissionsData = await fetchEmissionsByYearAndMonth(
        selectedYear,
        selectedMonth,
        'SCOPE1'
      )
      setScope1Data(emissionsData)

      // 2. 카테고리별 요약 데이터 조회
      const summaryData = await fetchCategorySummaryByScope(
        'SCOPE1',
        selectedYear,
        selectedMonth
      )
      setCategorySummary(summaryData)

      // 3. 기존 데이터를 카테고리별 계산기로 변환
      convertBackendDataToCalculators(emissionsData)
    } catch (error) {
      console.error('Scope1 데이터 로드 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 백엔드 데이터를 프론트엔드 계산기 형식으로 변환
   */
  const convertBackendDataToCalculators = (data: ScopeEmissionResponse[]) => {
    const potentialData: CalculatorData[] = []
    const kineticData: CalculatorData[] = []
    const processData: CalculatorData[] = []
    const leakData: CalculatorData[] = []

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

      // 카테고리 번호에 따라 분류 - 안전한 체크 추가
      if (
        emission.scope1CategoryNumber &&
        emission.scope1CategoryNumber >= 1 &&
        emission.scope1CategoryNumber <= 3
      ) {
        potentialData.push(calculatorData)
      } else if (
        emission.scope1CategoryNumber &&
        emission.scope1CategoryNumber >= 4 &&
        emission.scope1CategoryNumber <= 6
      ) {
        kineticData.push(calculatorData)
      } else if (
        emission.scope1CategoryNumber &&
        emission.scope1CategoryNumber >= 7 &&
        emission.scope1CategoryNumber <= 8
      ) {
        processData.push(calculatorData)
      } else if (
        emission.scope1CategoryNumber &&
        emission.scope1CategoryNumber >= 9 &&
        emission.scope1CategoryNumber <= 10
      ) {
        leakData.push(calculatorData)
      }

      // 수동 입력 모드 상태 복원 (화면 반전 로직 고려)
      if (emission.inputType !== undefined && emission.scope1CategoryNumber) {
        const categoryKey =
          `list${emission.scope1CategoryNumber}` as keyof typeof calculatorModes
        setCalculatorModes(prev => ({
          ...prev,
          [categoryKey]: {
            ...prev[categoryKey],
            [calculatorId]: emission.inputType === 'LCA' // 수정: 화면에서 반전되므로 LCA일 때 true
          }
        }))
      }
    })

    // 상태 업데이트 - 카테고리별로 분류하여 저장
    setPotentialCategoryCalculators({
      list1: potentialData.filter(d => d.savedData?.scope1CategoryNumber === 1),
      list2: potentialData.filter(d => d.savedData?.scope1CategoryNumber === 2),
      list3: potentialData.filter(d => d.savedData?.scope1CategoryNumber === 3)
    })

    setKineticCategoryCalculators({
      list4: kineticData.filter(d => d.savedData?.scope1CategoryNumber === 4),
      list5: kineticData.filter(d => d.savedData?.scope1CategoryNumber === 5),
      list6: kineticData.filter(d => d.savedData?.scope1CategoryNumber === 6)
    })

    setProcessCategoryCalculators({
      list7: processData.filter(d => d.savedData?.scope1CategoryNumber === 7),
      list8: processData.filter(d => d.savedData?.scope1CategoryNumber === 8)
    })

    setLeakCategoryCalculators({
      list9: leakData.filter(d => d.savedData?.scope1CategoryNumber === 9),
      list10: leakData.filter(d => d.savedData?.scope1CategoryNumber === 10)
    })

    // 배출량 총계 업데이트
    setPotentialCategoryTotals({
      list1: potentialData
        .filter(d => d.savedData?.scope1CategoryNumber === 1)
        .map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
      list2: potentialData
        .filter(d => d.savedData?.scope1CategoryNumber === 2)
        .map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
      list3: potentialData
        .filter(d => d.savedData?.scope1CategoryNumber === 3)
        .map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        }))
    })

    setKineticCategoryTotals({
      list4: kineticData
        .filter(d => d.savedData?.scope1CategoryNumber === 4)
        .map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
      list5: kineticData
        .filter(d => d.savedData?.scope1CategoryNumber === 5)
        .map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
      list6: kineticData
        .filter(d => d.savedData?.scope1CategoryNumber === 6)
        .map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        }))
    })

    setProcessCategoryTotals({
      list7: processData
        .filter(d => d.savedData?.scope1CategoryNumber === 7)
        .map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
      list8: processData
        .filter(d => d.savedData?.scope1CategoryNumber === 8)
        .map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        }))
    })

    setLeakCategoryTotals({
      list9: leakData
        .filter(d => d.savedData?.scope1CategoryNumber === 9)
        .map(calc => ({
          id: calc.id,
          emission: calc.savedData?.totalEmission || 0
        })),
      list10: leakData
        .filter(d => d.savedData?.scope1CategoryNumber === 10)
        .map(calc => ({
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
      loadScope1Data()
    }
  }, [selectedYear, selectedMonth, refreshTrigger])

  // ========================================================================
  // 데이터 새로고침 함수 (Data Refresh Function)
  // ========================================================================

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // 전체 총 배출량 계산
  const grandTotal =
    Object.keys(scope1PotentialCategoryList).reduce(
      (sum, key) => sum + getPotentialTotalEmission(key as Scope1PotentialCategoryKey),
      0
    ) +
    Object.keys(scope1KineticCategoryList).reduce(
      (sum, key) => sum + getKineticTotalEmission(key as Scope1KineticCategoryKey),
      0
    ) +
    Object.keys(scope1ProcessCategoryList).reduce(
      (sum, key) => sum + getProcessTotalEmission(key as Scope1ProcessCategoryKey),
      0
    ) +
    Object.keys(scope1LeakCategoryList).reduce(
      (sum, key) => sum + getLeakTotalEmission(key as Scope1LeakCategoryKey),
      0
    )

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
              <span className="font-bold text-blue-600">Scope1</span>
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
                          총 Scope 1 배출량
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
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onDataChange={refreshData}
          />
        )
      )}
    </div>
  )
}
