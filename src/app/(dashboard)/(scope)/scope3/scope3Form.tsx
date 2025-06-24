/**
 * Scope 3 배출량 관리 폼 컴포넌트
 *
 * 주요 기능:
 * - Scope 3 15개 카테고리별 배출량 데이터 관리
 * - 카테고리별 계산기 추가/삭제 기능
 * - CSV 데이터 기반 배출계수 적용
 * - 실시간 배출량 계산 및 집계
 * - scope2Form.tsx와 동일한 레이아웃 구조 적용
 *
 * @author ESG Project Team
 * @version 1.0
 * @since 2024
 */
'use client'

// React 및 애니메이션 라이브러리 임포트
import React, {useState} from 'react'
import {motion} from 'framer-motion'
import Link from 'next/link'

// UI 아이콘 임포트 (Lucide React)
import {
  Home, // 홈 아이콘
  ArrowLeft, // 왼쪽 화살표 (뒤로가기)
  Factory, // 공장 아이콘
  CalendarDays
} from 'lucide-react'

// 브레드크럼 네비게이션 컴포넌트 임포트
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

// 레이아웃 컴포넌트 임포트
import {PageHeader} from '@/components/layout/PageHeader'
import {DirectionButton} from '@/components/layout/direction'

// 분리된 Scope3 컴포넌트들 임포트
import {CategorySummaryCard} from '@/components/scope3/CategorySummaryCard'
import {CategorySelector, Scope3CategoryKey} from '@/components/scope3/CategorySelector'
import {CategoryDataInput} from '@/components/scope3/CategoryDataInput'
import {SelectorState} from '@/components/scope3/ExcelCascadingSelector'
import {MonthSelector} from '@/components/scope/MonthSelector'
import {Input} from '@/components/ui/input'
import {Card, CardContent} from '@/components/ui/card'

// ============================================================================
// 타입 정의 (Type Definitions)
// ============================================================================

/**
 * 계산기 데이터 타입
 */
interface CalculatorData {
  id: number
  state: SelectorState
}

// ============================================================================
// 메인 Scope3 폼 컴포넌트 (Main Scope3 Form Component)
// ============================================================================

/**
 * Scope 3 배출량 관리 메인 컴포넌트
 * scope2Form.tsx와 동일한 레이아웃 구조를 적용하여 일관성 있는 UI 제공
 */
export default function Scope3Form() {
  // ========================================================================
  // 상태 관리 (State Management)
  // ========================================================================
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()) // 선택된 연도
  const currentMonth = new Date().getMonth() + 1 // JavaScript의 월은 0부터 시작하므로 1을 더함
  const [selectedMonth, setSelectedMonth] = useState<number | null>(currentMonth) // 선택된 월 (null이면 전체)

  const [activeCategory, setActiveCategory] = useState<Scope3CategoryKey | null>(null) // 현재 선택된 카테고리

  // 카테고리별 계산기 목록 관리
  const [categoryCalculators, setCategoryCalculators] = useState<{
    [key in Scope3CategoryKey]?: CalculatorData[]
  }>({})

  // 카테고리별 배출량 총계 관리
  const [categoryTotals, setCategoryTotals] = useState<{
    [key in Scope3CategoryKey]?: {id: number; emission: number}[]
  }>({})

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
  // 이벤트 핸들러 (Event Handlers)
  // ========================================================================

  /**
   * 계산기의 배출량 업데이트 핸들러
   */
  const updateTotal = (id: number, emission: number) => {
    if (!activeCategory) return

    setCategoryTotals(prev => {
      const old = prev[activeCategory] || []
      const updated = old.some(t => t.id === id)
        ? old.map(t => (t.id === id ? {id, emission} : t)) // 기존 항목 업데이트
        : [...old, {id, emission}] // 새 항목 추가
      return {...prev, [activeCategory]: updated}
    })
  }

  /**
   * 새로운 계산기 추가 핸들러
   */
  const addCalculator = () => {
    if (!activeCategory) return

    const current = categoryCalculators[activeCategory] || []
    const newId = current.length > 0 ? current[current.length - 1].id + 1 : 1

    setCategoryCalculators(prev => ({
      ...prev,
      [activeCategory]: [
        ...current,
        {id: newId, state: {category: '', separate: '', rawMaterial: '', quantity: ''}}
      ]
    }))
  }

  /**
   * 계산기 삭제 핸들러
   */
  const removeCalculator = (id: number) => {
    if (!activeCategory) return

    // 계산기 목록에서 제거
    setCategoryCalculators(prev => ({
      ...prev,
      [activeCategory]: (prev[activeCategory] || []).filter(c => c.id !== id)
    }))

    // 배출량 총계에서도 제거
    setCategoryTotals(prev => ({
      ...prev,
      [activeCategory]: (prev[activeCategory] || []).filter(t => t.id !== id)
    }))
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
      setCategoryCalculators(prev => ({
        ...prev,
        [category]: [
          {id: 1, state: {category: '', separate: '', rawMaterial: '', quantity: ''}}
        ]
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
  // 렌더링 (Rendering)
  // ========================================================================

  return (
    <div className="flex flex-col w-full h-full p-4">
      {/* ========================================================================
          상단 네비게이션 (Top Navigation)
          - 브레드크럼을 통한 현재 위치 표시
          ======================================================================== */}
      <div className="flex flex-row items-center p-2 px-2 mb-6 text-sm text-gray-500 bg-white rounded-lg shadow-sm">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Home className="w-4 h-4 mr-1" />
              <BreadcrumbLink href="/dashboard">대시보드</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="font-bold text-customG">Scope3</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ========================================================================
          헤더 섹션 (Header Section)
          - 뒤로가기 버튼과 페이지 제목/설명
          ======================================================================== */}
      <div className="flex flex-row justify-between w-full h-24 mb-6">
        <Link
          href="/dashboard"
          className="flex flex-row items-center p-4 space-x-4 transition rounded-md cursor-pointer hover:bg-gray-200">
          <ArrowLeft className="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
          <PageHeader
            icon={<Factory className="w-6 h-6 text-customG-600" />}
            title="Scope 3 배출량 관리"
            description="15개 카테고리별 간접 배출량 데이터를 관리하고 추적합니다"
            module="SCOPE"
            submodule="scope3"
          />
        </Link>
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
          <Card className="mb-4 overflow-hidden shadow-sm">
            <CardContent className="p-4">
              <div className="grid items-center justify-center h-24 grid-cols-1 gap-8 md:grid-cols-3">
                <CategorySummaryCard totalEmission={grandTotal} animationDelay={0.1} />

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

          {/* 카테고리 선택 그리드 */}
          <CategorySelector
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
        />
      )}
    </div>
  )
}
