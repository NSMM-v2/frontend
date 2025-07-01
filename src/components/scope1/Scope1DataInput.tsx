/**
 * Scope 1 데이터 입력 컴포넌트
 *
 * 주요 기능:
 * - 고정연소/이동연소 배출량 데이터 입력
 * - 계산기 추가/삭제 기능
 * - 실시간 배출량 계산
 * - 백엔드 API 연동 (CRUD)
 *
 * @author ESG Project Team
 * @version 1.0
 * @since 2024
 */
'use client'

import React, {useState} from 'react'
import {motion} from 'framer-motion'
import {
  ArrowLeft, // 왼쪽 화살표 (뒤로가기)
  Plus, // 플러스 아이콘 (추가)
  Trash2, // 삭제 아이콘
  Save, // 저장 아이콘
  Calculator // 계산기 아이콘
} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Switch} from '@/components/ui/switch'
import {
  Scope1PotentialCategoryKey,
  Scope1KineticCategoryKey,
  Scope1ProcessCategoryKey,
  Scope1LeakCategoryKey,
  scope1PotentialCategoryList,
  scope1KineticCategoryList,
  scope1ProcessCategoryList,
  scope1LeakCategoryList
} from '@/components/scopeTotal/CategorySelector'
import {SelfInputScope12Calculator} from '@/components/scope1/SelfInputScope12Caculator'
import {ExcelCascadingSelector} from '@/components/scope1/ExcelCascadingSelector'
import {SelectorState} from '@/types/scopeTypes'

// ============================================================================
// 타입 정의 (Type Definitions)
// ============================================================================

/**
 * Scope 1 계산기 데이터 구조
 */
interface Scope1CalculatorData {
  id: number
  state: SelectorState
  savedData?: any // 백엔드에서 받은 전체 데이터
}

/**
 * 컴포넌트 Props 정의
 */
interface Scope1DataInputProps {
  activeCategory:
    | Scope1PotentialCategoryKey
    | Scope1KineticCategoryKey
    | Scope1ProcessCategoryKey
    | Scope1LeakCategoryKey
    | null
  calculators: Scope1CalculatorData[]
  getTotalEmission: (
    category:
      | Scope1PotentialCategoryKey
      | Scope1KineticCategoryKey
      | Scope1ProcessCategoryKey
      | Scope1LeakCategoryKey
  ) => number
  onAddCalculator: () => void
  onRemoveCalculator: (id: number) => void
  onUpdateCalculatorState: (id: number, newState: SelectorState) => void
  onChangeTotal: (id: number, emission: number) => void
  onComplete: () => void
  onBackToList: () => void
  calculatorModes: Record<number, boolean>
  onModeChange: (id: number, checked: boolean) => void
  selectedYear: number
  selectedMonth: number | null
  onDataChange: () => void
}

// ============================================================================
// 메인 컴포넌트 (Main Component)
// ============================================================================

/**
 * Scope 1 데이터 입력 컴포넌트
 * CategoryDataInput과 유사한 구조이지만 Scope 1 특성에 맞게 커스터마이징
 */
export function Scope1DataInput({
  activeCategory,
  calculators,
  getTotalEmission,
  onAddCalculator,
  onRemoveCalculator,
  onUpdateCalculatorState,
  onChangeTotal,
  onComplete,
  onBackToList,
  calculatorModes,
  onModeChange,
  selectedYear,
  selectedMonth,
  onDataChange
}: Scope1DataInputProps) {
  // ========================================================================
  // 유틸리티 함수 (Utility Functions)
  // ========================================================================

  /**
   * 카테고리 정보 조회
   */
  const getCategoryInfo = () => {
    if (!activeCategory) return null

    // 고정연소 카테고리 확인
    if (activeCategory in scope1PotentialCategoryList) {
      return {
        key: activeCategory,
        title:
          scope1PotentialCategoryList[
            activeCategory as keyof typeof scope1PotentialCategoryList
          ],
        description: '고정연소 배출원에서 발생하는 직접 배출량',
        icon: '🔥'
      }
    }

    // 이동연소 카테고리 확인
    if (activeCategory in scope1KineticCategoryList) {
      return {
        key: activeCategory,
        title:
          scope1KineticCategoryList[
            activeCategory as keyof typeof scope1KineticCategoryList
          ],
        description: '이동연소 배출원에서 발생하는 직접 배출량',
        icon: '🚗'
      }
    }

    // 공정배출 카테고리 확인
    if (activeCategory in scope1ProcessCategoryList) {
      return {
        key: activeCategory,
        title:
          scope1ProcessCategoryList[
            activeCategory as keyof typeof scope1ProcessCategoryList
          ],
        description: '공정에서 발생하는 직접 배출량',
        icon: '🏭'
      }
    }

    // 누출배출 카테고리 확인
    if (activeCategory in scope1LeakCategoryList) {
      return {
        key: activeCategory,
        title:
          scope1LeakCategoryList[activeCategory as keyof typeof scope1LeakCategoryList],
        description: '누출배출에서 발생하는 직접 배출량',
        icon: '💧'
      }
    }

    return null
  }

  const categoryInfo = getCategoryInfo()
  const totalEmission = activeCategory ? getTotalEmission(activeCategory as any) : 0

  // ========================================================================
  // 렌더링 (Rendering)
  // ========================================================================

  if (!activeCategory || !categoryInfo) {
    return null
  }

  return (
    <motion.div
      initial={{opacity: 0, scale: 0.95}}
      animate={{opacity: 1, scale: 1}}
      transition={{delay: 0.6, duration: 0.5}}
      className="flex flex-col justify-center w-full space-y-4">
      {/* ====================================================================
          카테고리 헤더 (Category Header)
          ==================================================================== */}
      <div className="overflow-hidden bg-white border-0 shadow-sm rounded-3xl">
        <div className="p-6 bg-white">
          <div className="flex flex-row items-center justify-between">
            <motion.div
              initial={{opacity: 0, x: -20}}
              animate={{opacity: 1, x: 0}}
              transition={{delay: 0.1, duration: 0.5}}
              onClick={onBackToList}
              className="flex flex-row items-center p-4 transition-all duration-200 rounded-xl hover:cursor-pointer hover:bg-blue-50">
              <div className="mr-4 text-2xl text-blue-500">←</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{categoryInfo.title}</h1>
                <div className="mt-1 text-sm text-gray-600">
                  {categoryInfo.description}
                </div>
              </div>
            </motion.div>

            {/* ========================================================================
                    현재 카테고리 소계 카드 (Category Summary Card)
                    - 현재 카테고리의 총 배출량 표시
                    ======================================================================== */}
            <motion.div
              initial={{opacity: 0, x: 20}}
              animate={{opacity: 1, x: 0}}
              transition={{delay: 0.1, duration: 0.5}}>
              <Card className="bg-white border-2 border-blue-200 shadow-sm rounded-2xl min-w-md">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <span className="text-lg font-semibold text-gray-900">
                      현재 카테고리 소계:
                    </span>
                    <div className="mt-1 text-xs text-gray-500">
                      {calculators.length}개 항목 입력됨
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-600">
                      {totalEmission.toFixed(2)}
                    </span>
                    <div className="text-sm text-gray-500">kgCO₂</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          계산기 목록 (Calculator List)
          ==================================================================== */}
      <div className="flex flex-col items-center w-full space-y-8">
        {calculators.map((calculator, index) => (
          <Card key={calculator.id} className="p-4 overflow-hidden shadow-sm w-[80%]">
            <CardHeader className="pb-2 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">계산기 {index + 1}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {/* 수동 입력 모드 스위치 */}
                  <div className="flex items-center space-x-2">
                    <Label
                      htmlFor={`manual-${calculator.id}`}
                      className="text-sm text-gray-600">
                      LCA 사용
                    </Label>
                    <Switch
                      id={`manual-${calculator.id}`}
                      checked={calculatorModes[calculator.id] || false}
                      onCheckedChange={checked => onModeChange(calculator.id, checked)}
                    />
                  </div>
                  {/* 계산기 삭제 버튼 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveCalculator(calculator.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {calculatorModes[calculator.id] ? (
                /* 자동 계산 모드 */
                <ExcelCascadingSelector
                  key={`auto-${calculator.id}`}
                  id={calculator.id}
                  state={calculator.state}
                  onChangeState={(newState: SelectorState) =>
                    onUpdateCalculatorState(calculator.id, newState)
                  }
                  onChangeTotal={(id: number, emission: number) =>
                    onChangeTotal(id, emission)
                  }
                />
              ) : (
                /* 수동 입력 모드 */
                <SelfInputScope12Calculator
                  key={`manual-${calculator.id}`}
                  id={calculator.id}
                  state={calculator.state}
                  onChangeState={(newState: SelectorState) =>
                    onUpdateCalculatorState(calculator.id, newState)
                  }
                  onChangeTotal={(id: number, emission: number) =>
                    onChangeTotal(id, emission)
                  }
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ====================================================================
          액션 버튼들 (Action Buttons)
          ==================================================================== */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Button
          onClick={onAddCalculator}
          className="text-white bg-blue-500 hover:bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          계산기 추가
        </Button>
        <Button
          onClick={onComplete}
          variant="outline"
          className="text-green-700 border-green-500 hover:bg-green-50">
          <Save className="w-4 h-4 mr-2" />
          완료
        </Button>
      </div>
    </motion.div>
  )
}
