/**
 * 카테고리별 데이터 입력 화면 컴포넌트
 *
 * 주요 기능:
 * - 선택된 카테고리의 데이터 입력 관리
 * - 계산기 추가/삭제 기능
 * - 카테고리별 배출량 소계 표시
 * - 빈 상태 및 액션 버튼 관리
 *
 * @author ESG Project Team
 * @version 1.0
 * @since 2024
 */

import React from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {Plus} from 'lucide-react'
import {CalculatorItem} from './CalculatorItem'
import {scope3CategoryList, Scope3CategoryKey} from './CategorySelector'
import {SelectorState} from '@/lib/types'

/**
 * 계산기 데이터 타입
 */
interface CalculatorData {
  id: number
  state: SelectorState
}

/**
 * CategoryDataInput 컴포넌트 Props 타입
 */
interface CategoryDataInputProps {
  /** 현재 활성 카테고리 */
  activeCategory: Scope3CategoryKey
  /** 현재 카테고리의 계산기 목록 */
  calculators: CalculatorData[]

  /** 카테고리별 배출량 총계 함수 */
  getTotalEmission: (category: Scope3CategoryKey) => number
  /** 계산기 추가 핸들러 */
  onAddCalculator: () => void
  /** 계산기 삭제 핸들러 */
  onRemoveCalculator: (id: number) => void
  /** 계산기 상태 업데이트 핸들러 */
  onUpdateCalculatorState: (id: number, newState: SelectorState) => void
  /** 배출량 변경 핸들러 */
  onChangeTotal: (id: number, emission: number) => void
  /** 입력 완료 핸들러 */
  onComplete: () => void
  /** 목록으로 돌아가기 핸들러 */
  onBackToList: () => void
  calculatorModes: { [id: number]: boolean }
  onModeChange: (id: number, checked: boolean) => void
}

/**
 * CategoryDataInput 컴포넌트
 * 선택된 카테고리의 데이터 입력을 관리하는 컴포넌트
 */
export function CategoryDataInput({
  activeCategory,
  calculators,
  calculatorModes,
  getTotalEmission,
  onAddCalculator,
  onRemoveCalculator,
  onUpdateCalculatorState,
  onChangeTotal,
  onComplete,
  onBackToList,
  onModeChange
}: CategoryDataInputProps) {
  const categoryTitle = scope3CategoryList[activeCategory]
  const categoryNumber = activeCategory.replace('list', '')
  const totalEmission = getTotalEmission(activeCategory)

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.6}}
      className="space-y-12">
      {/* ========================================================================
          헤더 섹션 (Header Section)
          - 카테고리 제목 및 목록으로 돌아가기 버튼
          ======================================================================== */}
      <div className="flex flex-row items-center justify-between w-full p-4 bg-white rounded-lg shadow-sm">
        <motion.div
          initial={{opacity: 0, x: -20}}
          animate={{opacity: 1, x: 0}}
          transition={{delay: 0.1, duration: 0.5}}
          onClick={onBackToList}
          className="flex flex-row items-center p-4 rounded-lg hover:cursor-pointer hover:bg-gray-100">
          <div className="mr-4 text-2xl">←</div>
          <div>
            <h1 className="text-3xl font-bold text-customG-900">{categoryTitle}</h1>
            {/* <p className="mt-2 text-customG-600">카테고리 {categoryNumber} 데이터 입력</p> */}
            <div className="text-sm text-customG-500">
              배출계수를 선택하고 활동량을 입력하여 배출량을 계산하세요
            </div>
          </div>
        </motion.div>

        {/* ========================================================================
          현재 카테고리 소계 카드 (Category Summary Card)
          - 현재 카테고리의 총 배출량 표시
          ======================================================================== */}

        <motion.div
          initial={{opacity: 0, x: -20}}
          animate={{opacity: 1, x: 0}}
          transition={{delay: 0.1, duration: 0.5}}>
          <Card className="border-blue-200 min-w-md bg-gradient-to-r from-blue-50 to-emerald-50">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <span className="text-lg font-medium text-customG-700">
                  현재 카테고리 소계:
                </span>
                <div className="mt-1 text-xs text-customG-500">
                  {calculators.length}개 항목 입력됨
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-600">
                  {totalEmission.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  })}
                </span>
                <div className="text-sm text-customG-500">kgCO₂</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      {/* ========================================================================
          계산기 목록 (Calculator List)
          - 현재 카테고리의 모든 계산기 표시
          ======================================================================== */}
      <div className="flex flex-col items-center w-full space-y-8">
        <AnimatePresence mode="popLayout">
          {calculators.length > 0 ? (
            calculators.map((calc, index) => (
              <CalculatorItem
                key={calc.id}
                id={calc.id}
                index={index + 1}
                state={calc.state}
                totalCount={calculators.length}
                onChangeState={onUpdateCalculatorState}
                onChangeTotal={onChangeTotal}
                onRemove={onRemoveCalculator}
                animationDelay={index * 0.1}
                mode={calculatorModes[calc.id] || false}
                onModeChange={(checked) => onModeChange(calc.id, checked)}
              />
            ))
          ) : (
            /* ================================================================
                빈 상태 (Empty State)
                - 계산기가 없을 때 표시되는 안내 화면
                ================================================================ */
            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: 0.4, duration: 0.5}}>
              <Card className="border-2 border-gray-300 border-dashed">
                <CardContent className="p-12 text-center">
                  {/* 빈 상태 아이콘 */}
                  <motion.div
                    initial={{scale: 0}}
                    animate={{scale: 1}}
                    transition={{delay: 0.5, duration: 0.4}}
                    className="mb-6 text-gray-400">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </motion.div>

                  {/* 빈 상태 메시지 */}
                  <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 0.6, duration: 0.4}}>
                    <h3 className="mb-3 text-xl font-semibold text-customG-900">
                      첫 번째 항목을 추가하세요
                    </h3>
                    <p className="mb-8 text-customG-600">
                      이 카테고리에 배출량 데이터를 입력할 수 있습니다.
                      <br />
                      배출계수를 선택하고 활동량을 입력하여 배출량을 계산하세요.
                    </p>

                    {/* 첫 번째 항목 추가 버튼 */}
                    <Button
                      onClick={onAddCalculator}
                      className="px-8 py-3 text-lg text-white transition-all duration-200 shadow-md bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg">
                      <Plus className="w-5 h-5 mr-2" />
                      항목 추가하기
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================================
          액션 버튼들 (Action Buttons)
          - 계산기가 있을 때만 표시되는 추가/완료 버튼
          ======================================================================== */}
      {calculators.length > 0 && (
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.7, duration: 0.5}}
          className="flex items-center justify-center gap-6 pt-8 border-t border-customG-200">
          {/* 항목 추가 버튼 */}
          <Button
            onClick={onAddCalculator}
            variant="outline"
            className="px-8 py-3 text-lg transition-all duration-200 border-customG-300 hover:bg-customG-50 hover:border-customG-400">
            <Plus className="w-5 h-5 mr-2" />
            항목 추가
          </Button>

          {/* 입력 완료 버튼 */}
          <Button
            onClick={onComplete}
            className="px-12 py-3 text-lg text-white transition-all duration-200 shadow-md bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg">
            입력 완료
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
