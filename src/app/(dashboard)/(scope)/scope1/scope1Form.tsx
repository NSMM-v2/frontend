/**More actions
 * Scope 1 배출량 관리 폼 컴포넌트
 *
 * 주요 기능:
 * - 고정연소/이동연소 배출량 데이터 관리
 * - 카테고리별 계산기 추가/삭제 기능
 * - CSV 데이터 기반 배출계수 적용
 * - 실시간 배출량 계산 및 집계
 * - scope3Form.tsx와 동일한 레이아웃 구조 적용
 * - 백엔드 API 연동으로 데이터 영속화 지원
 *
 * @author ESG Project Team
 * @version 1.0
 * @since 2024
 */
'use client'

import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {Home, Factory, CalendarDays} from 'lucide-react'
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
} from '@/components/scopeTotal/CategorySelector'
import {Scope1DataInput} from '@/components/scope1/Scope1DataInput'
import {MonthSelector} from '@/components/scopeTotal/MonthSelector'
import {Input} from '@/components/ui/input'
import {Card, CardContent} from '@/components/ui/card'
import {SelectorState} from '@/types/scopeTypes'

// ============================================================================
// 타입 정의 (Type Definitions)
// ============================================================================

/**
 * Scope 1 계산기 데이터 구조
 */
interface CalculatorData {
  id: number // 식별자: emissionId(양수) 또는 임시ID(음수)
  state: SelectorState // 사용자 입력 상태
  savedData?: any // 백엔드에서 받은 전체 데이터 (저장된 경우에만)
}

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
    list8: {}
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

  // 카테고리별 계산기 목록 관리 ===========================================================================================
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
    list7: []
  })
  const [leakCategoryCalculators, setLeakCategoryCalculators] = useState<
    Record<Scope1LeakCategoryKey, CalculatorData[]>
  >({
    list8: []
  })

  // 카테고리별 배출량 총계 관리 ===========================================================================================
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
    list7: []
  })
  const [leakCategoryTotals, setLeakCategoryTotals] = useState<
    Record<Scope1LeakCategoryKey, {id: number; emission: number}[]>
  >({
    list8: []
  })

  // ========================================================================
  // 백엔드 연동 상태 관리 (Backend Integration State)
  // ========================================================================

  // 로딩 상태 관리
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // 데이터 새로고침 트리거 (CRUD 작업 후 데이터 다시 로드용)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)

  // ========================================================================
  // 유틸리티 함수 (Utility Functions)
  // ========================================================================

  /**
   * 현재 활성 카테고리의 계산기 목록 반환 =================================================================================
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
   * 특정 카테고리의 총 배출량 계산 ===========================================================================================
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
    } else if (activeKineticCategory) {
      const currentCalculators = kineticCategoryCalculators[activeKineticCategory] || []
      const isLastItem = currentCalculators.length === 1

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
    } else if (activeProcessCategory) {
      const currentCalculators = processCategoryCalculators[activeProcessCategory] || []
      const isLastItem = currentCalculators.length === 1

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
    } else if (activeLeakCategory) {
      const currentCalculators = leakCategoryCalculators[activeLeakCategory] || []
      const isLastItem = currentCalculators.length === 1

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
          [activeLeakCategory]: (prev[activeLeakCategory] || []).filter(c => c.id !== id)
        }))
        setLeakCategoryTotals(prev => ({
          ...prev,
          [activeLeakCategory]: (prev[activeLeakCategory] || []).filter(t => t.id !== id)
        }))
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
    setActiveKineticCategory(null) // 다른 타입 카테고리는 초기화
    setActiveProcessCategory(null) // 다른 타입 카테고리는 초기화
    setActiveLeakCategory(null) // 다른 타입 카테고리는 초기화

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
    setActivePotentialCategory(null) // 다른 타입 카테고리는 초기화
    setActiveProcessCategory(null) // 다른 타입 카테고리는 초기화
    setActiveLeakCategory(null) // 다른 타입 카테고리는 초기화

    // 해당 카테고리에 계산기가 없으면 기본 계산기 1개 생성
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
    setActivePotentialCategory(null) // 다른 타입 카테고리는 초기화
    setActiveKineticCategory(null) // 다른 타입 카테고리는 초기화
    setActiveLeakCategory(null) // 다른 타입 카테고리는 초기화

    // 해당 카테고리에 계산기가 없으면 기본 계산기 1개 생성
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
    setActivePotentialCategory(null) // 다른 타입 카테고리는 초기화
    setActiveKineticCategory(null) // 다른 타입 카테고리는 초기화
    setActiveProcessCategory(null) // 다른 타입 카테고리는 초기화

    // 해당 카테고리에 계산기가 없으면 기본 계산기 1개 생성
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
  // 데이터 새로고침 함수 (Data Refresh Function)
  // ========================================================================

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
              <span className="font-bold text-blue-600">Scope1</span>
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
      {!activePotentialCategory && !activeKineticCategory ? (
        /* ====================================================================
            카테고리 선택 화면 (Category Selection Screen)
            ==================================================================== */

        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.4, delay: 0.1}}>
          <Card className="mb-4 overflow-hidden shadow-sm">
            <CardContent className="p-4">
              <div className="grid items-center justify-center h-24 grid-cols-1 gap-8 md:grid-cols-3">
                {/* 총 배출량 카드 */}
                <Card className="justify-center h-24 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                  <CardContent className="flex items-center p-4">
                    <div className="p-2 mr-3 bg-blue-100 rounded-full">
                      <Factory className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        총 Scope 1 배출량
                      </p>
                      <h3 className="text-2xl font-bold">
                        {grandTotal.toFixed(2)}
                        <span className="ml-1 text-sm font-normal text-gray-500">
                          tCO₂eq
                        </span>
                      </h3>
                    </div>
                  </CardContent>
                </Card>

                {/* 보고연도 입력 필드 */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-customG-700">
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

                {/* 보고월 선택 드롭다운 (선택사항) */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-customG-700">
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

            {/* 이동연소 카테고리 */}
            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.5, delay: 0.4}}>
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

            {/* 이동연소 카테고리 */}
            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.5, delay: 0.4}}>
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
        <Scope1DataInput
          activeCategory={
            activePotentialCategory ||
            activeKineticCategory ||
            activeProcessCategory ||
            activeLeakCategory
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
      )}
    </div>
  )
}
