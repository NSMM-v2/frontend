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
 *
 * @author ESG Project Team
 * @version 1.0
 * @since 2024
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
  CalendarDays // 달력 아이콘
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
  Scope1CategoryKey,
  scope1CategoryList
} from '@/components/scopeTotal/CategorySelector'
import {Scope1DataInput} from '@/components/scope1/Scope1DataInput'
import {MonthSelector} from '@/components/scopeTotal/MonthSelector'
import {Input} from '@/components/ui/input'
import {Card, CardContent} from '@/components/ui/card'

// ============================================================================
// 타입 및 서비스 임포트 (Types & Services Imports)
// ============================================================================
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
    Record<Scope1CategoryKey, Record<number, boolean>>
  >({
    kinetic: [],
    potential: []
  })
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()) // 선택된 연도
  const currentMonth = new Date().getMonth() + 1 // JavaScript의 월은 0부터 시작하므로 1을 더함
  const [selectedMonth, setSelectedMonth] = useState<number | null>(currentMonth) // 선택된 월 (null이면 전체)

  const [activeCategory, setActiveCategory] = useState<Scope1CategoryKey | null>(null) // 현재 선택된 이동연소 카테고리

  // 카테고리별 계산기 목록 관리
  const [categoryCalculators, setCategoryCalculators] = useState<
    Record<Scope1CategoryKey, CalculatorData[]>
  >({
    kinetic: [],
    potential: []
  })

  // 카테고리별 배출량 총계 관리
  const [categoryTotals, setCategoryTotals] = useState<
    Record<Scope1CategoryKey, {id: number; emission: number}[]>
  >({
    kinetic: [],
    potential: []
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
   * 현재 활성 카테고리의 계산기 목록 반환
   */
  const getCurrentCalculators = (): CalculatorData[] => {
    if (activeCategory) {
      return categoryCalculators[activeCategory] || []
    }
    return []
  }

  /**
   * 특정 카테고리의 총 배출량 계산
   */
  const getTotalEmission = (category: Scope1CategoryKey): number =>
    (categoryTotals[category] || []).reduce((sum, t) => sum + t.emission, 0)

  // ========================================================================
  // 유틸리티 함수 - ID 생성 (Utility Functions - ID Generation)
  // ========================================================================

  /**
   * 새로운 임시 ID 생성 (음수 사용)
   */
  const generateNewTemporaryId = (
    categoryKey: Scope1CategoryKey | Scope1CategoryKey
  ): number => {
    const existingCalculators = activeCategory
      ? categoryCalculators[categoryKey as Scope1CategoryKey] || []
      : []
    const existingIds = existingCalculators.map(c => c.id).filter(id => id < 0)

    const minId = existingIds.length > 0 ? Math.min(...existingIds) : 0
    return minId - 1
  }

  // ========================================================================
  // 이벤트 핸들러 (Event Handlers)
  // ========================================================================
  const handleModeChange = (id: number, checked: boolean) => {
    const activeScope1Category = activeCategory
    if (!activeScope1Category) return

    setCalculatorModes(prev => ({
      ...prev,
      [activeScope1Category]: {
        ...prev[activeScope1Category],
        [id]: checked
      }
    }))
  }

  /**
   * 계산기의 배출량 업데이트 핸들러
   */
  const updateTotal = (id: number, emission: number) => {
    if (activeCategory) {
      setCategoryTotals(prev => ({
        ...prev,
        [activeCategory]: (prev[activeCategory] || [])
          .map(t => (t.id === id ? {id, emission} : t))
          .concat(
            (prev[activeCategory] || []).find(t => t.id === id) ? [] : [{id, emission}]
          )
      }))
    }
  }

  /**
   * 새로운 계산기 추가 핸들러
   */
  const addCalculator = () => {
    if (activeCategory) {
      const newId = generateNewTemporaryId(activeCategory)
      setCategoryCalculators(prev => ({
        ...prev,
        [activeCategory]: [
          ...prev[activeCategory],
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
    if (activeCategory) {
      const currentCalculators = categoryCalculators[activeCategory] || []
      const isLastItem = currentCalculators.length === 1

      if (isLastItem) {
        const newTemporaryId = generateNewTemporaryId(activeCategory)
        setCategoryCalculators(prev => ({
          ...prev,
          [activeCategory]: [
            {
              id: newTemporaryId,
              state: {category: '', separate: '', rawMaterial: '', quantity: ''}
            }
          ]
        }))
        setCategoryTotals(prev => ({
          ...prev,
          [activeCategory]: [{id: newTemporaryId, emission: 0}]
        }))
      } else {
        setCategoryCalculators(prev => ({
          ...prev,
          [activeCategory]: (prev[activeCategory] || []).filter(c => c.id !== id)
        }))
        setCategoryTotals(prev => ({
          ...prev,
          [activeCategory]: (prev[activeCategory] || []).filter(t => t.id !== id)
        }))
      }
    }
  }

  /**
   * 계산기 입력 상태 업데이트 핸들러
   */
  const updateCalculatorState = (id: number, newState: SelectorState) => {
    if (activeCategory) {
      setCategoryCalculators(prev => ({
        ...prev,
        [activeCategory]: (prev[activeCategory] || []).map(c =>
          c.id === id ? {...c, state: newState} : c
        )
      }))
    }
  }

  /**
   * 카테고리 선택 핸들러
   */
  const handleCategorySelect = (category: Scope1CategoryKey) => {
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
          }
        ]
      }))
    }
  }

  /**
   * 카테고리 입력 완료 핸들러
   */
  const handleComplete = () => {
    setActiveCategory(null)
  }

  /**
   * 목록으로 돌아가기 핸들러
   */
  const handleBackToList = () => {
    setActiveCategory(null)
  }

  // 전체 총 배출량 계산
  const grandTotal = Object.keys(scope1CategoryList).reduce(
    (sum, key) => sum + getTotalEmission(key as Scope1CategoryKey),
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
      {!activeCategory ? (
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
                categoryList={scope1CategoryList.potential}
                getTotalEmission={getTotalEmission}
                onCategorySelect={handleCategorySelect}
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
              <CategorySelector<'list1' | 'list2' | 'list3'>
                categoryList={scope1CategoryList.kinetic}
                getTotalEmission={getTotalEmission}
                onCategorySelect={handleCategorySelect}
                animationDelay={0.1}
              />
            </motion.div>
          </div>
        </motion.div>
      ) : (
        /* ====================================================================
            카테고리별 데이터 입력 화면 (Category Data Input Screen)
            ==================================================================== */
        <Scope1DataInput
          activeCategory={activeCategory || activeCategory}
          calculators={getCurrentCalculators()}
          getTotalEmission={category =>
            activeCategory
              ? getTotalEmission(category as Scope1CategoryKey)
              : getTotalEmission(category as Scope1CategoryKey)
          }
          onAddCalculator={addCalculator}
          onRemoveCalculator={removeCalculator}
          onUpdateCalculatorState={updateCalculatorState}
          onChangeTotal={updateTotal}
          onComplete={handleComplete}
          onBackToList={handleBackToList}
          calculatorModes={calculatorModes[activeCategory || activeCategory!] || {}}
          onModeChange={handleModeChange}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onDataChange={refreshData}
        />
      )}
    </div>
  )
}
