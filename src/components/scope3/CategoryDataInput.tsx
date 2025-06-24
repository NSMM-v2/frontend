/**
 * 카테고리별 데이터 입력 화면 컴포넌트
 *
 * 주요 기능:
 * - 선택된 카테고리의 데이터 입력 관리
 * - 계산기 추가/삭제 기능
 * - 카테고리별 배출량 소계 표시
 * - 빈 상태 및 액션 버튼 관리
 * - 백엔드 API 연동으로 데이터 자동 저장/수정/삭제
 *
 * @author ESG Project Team
 * @version 1.0
 * @since 2024
 */

import React, {useCallback} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {Plus} from 'lucide-react'
import {CalculatorItem} from './CalculatorItem'
import {scope3CategoryList, Scope3CategoryKey} from './CategorySelector'
import {
  SelectorState,
  Scope3EmissionResponse,
  Scope3EmissionRequest,
  Scope3EmissionUpdateRequest
} from '@/lib/types'
import {
  createScope3Emission,
  updateScope3Emission,
  deleteScope3Emission
} from '@/services/scopeService'

/**
 * 계산기 데이터 타입 (확장: 백엔드 데이터 포함)
 */
interface CalculatorData {
  id: number
  state: SelectorState
  emissionId?: number // 백엔드에서 받은 배출량 데이터 ID (수정/삭제용)
  savedData?: Scope3EmissionResponse // 백엔드에서 받은 전체 데이터
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
  calculatorModes: {[id: number]: boolean}
  onModeChange: (id: number, checked: boolean) => void

  // ========================================================================
  // 백엔드 연동 Props (Backend Integration Props)
  // ========================================================================
  /** 선택된 보고년도 (백엔드 저장용) */
  selectedYear?: number
  /** 선택된 보고월 (백엔드 저장용) */
  selectedMonth?: number | null
  /** 데이터 변경 후 콜백 (CRUD 작업 완료 후 부모 컴포넌트에서 데이터 새로고침) */
  onDataChange?: () => void
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
  onModeChange,
  selectedYear,
  selectedMonth,
  onDataChange
}: CategoryDataInputProps) {
  const categoryTitle = scope3CategoryList[activeCategory]
  const categoryNumber = activeCategory.replace('list', '')
  const totalEmission = getTotalEmission(activeCategory)

  const handleAddCalculator = useCallback(() => {
    onAddCalculator()
  }, [onAddCalculator])

  const handleRemoveCalculator = useCallback(
    (id: number) => {
      onRemoveCalculator(id)
    },
    [onRemoveCalculator]
  )

  const handleUpdateCalculatorState = useCallback(
    (id: number, newState: SelectorState) => {
      onUpdateCalculatorState(id, newState)
    },
    [onUpdateCalculatorState]
  )

  const handleChangeTotal = useCallback(
    (id: number, emission: number) => {
      onChangeTotal(id, emission)
    },
    [onChangeTotal]
  )

  const handleComplete = useCallback(() => {
    onComplete()
  }, [onComplete])

  const handleBackToList = useCallback(() => {
    onBackToList()
  }, [onBackToList])

  const handleModeChange = useCallback(
    (id: number, checked: boolean) => {
      onModeChange(id, checked)
    },
    [onModeChange]
  )

  const handleDataChange = useCallback(() => {
    onDataChange?.()
  }, [onDataChange])

  /**
   * 입력완료 버튼 클릭 시 모든 계산기 데이터를 백엔드에 저장/수정
   * - emissionId가 없으면 createScope3Emission(POST)
   * - emissionId가 있으면 updateScope3Emission(PUT)
   * 저장 완료 후 onDataChange, onComplete 호출
   */
  const handleCompleteAsync = async () => {
    if (!selectedYear || !selectedMonth) {
      alert('보고년도와 보고월을 선택해주세요.')
      return
    }
    for (const calc of calculators) {
      const {emissionId, state, savedData} = calc
      // 프론트엔드 상태를 백엔드 요청 형식으로 변환
      const payload: Scope3EmissionRequest | Scope3EmissionUpdateRequest = {
        majorCategory: state.category,
        subcategory: state.separate,
        rawMaterial: state.rawMaterial,
        unit: state.unit || '',
        emissionFactor: Number(state.kgCO2eq) || 0,
        activityAmount: Number(state.quantity) || 0,
        totalEmission: (Number(state.kgCO2eq) || 0) * (Number(state.quantity) || 0),
        reportingYear: selectedYear,
        reportingMonth: selectedMonth,
        categoryNumber: Number(categoryNumber),
        categoryName: categoryTitle
      }
      if (!emissionId) {
        // 신규 데이터 생성
        await createScope3Emission(payload as Scope3EmissionRequest)
      } else {
        // 기존 데이터 수정
        await updateScope3Emission(emissionId, payload as Scope3EmissionUpdateRequest)
      }
    }
    // 저장 완료 후 데이터 새로고침 및 화면 전환
    onDataChange?.()
    onComplete()
  }

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
      <div className="flex flex-row justify-between items-center p-4 w-full bg-white rounded-lg shadow-sm">
        <motion.div
          initial={{opacity: 0, x: -20}}
          animate={{opacity: 1, x: 0}}
          transition={{delay: 0.1, duration: 0.5}}
          onClick={handleBackToList}
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
          <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 border-blue-200 min-w-md">
            <CardContent className="flex justify-between items-center p-6">
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
      <div className="flex flex-col items-center space-y-8 w-full">
        <AnimatePresence mode="popLayout">
          {calculators.length > 0 ? (
            calculators.map((calc, index) => (
              <CalculatorItem
                key={calc.id}
                id={calc.id}
                index={index + 1}
                state={calc.state}
                totalCount={calculators.length}
                onChangeState={handleUpdateCalculatorState}
                onChangeTotal={handleChangeTotal}
                onRemove={handleRemoveCalculator}
                animationDelay={index * 0.1}
                mode={calculatorModes[calc.id] || false}
                onModeChange={checked => handleModeChange(calc.id, checked)}
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
                      className="mx-auto w-16 h-16"
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
                      onClick={handleAddCalculator}
                      className="px-8 py-3 text-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-md transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg">
                      <Plus className="mr-2 w-5 h-5" />
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
          className="flex gap-6 justify-center items-center pt-8 border-t border-customG-200">
          {/* 항목 추가 버튼 */}
          <Button
            onClick={handleAddCalculator}
            variant="outline"
            className="px-8 py-3 text-lg transition-all duration-200 border-customG-300 hover:bg-customG-50 hover:border-customG-400">
            <Plus className="mr-2 w-5 h-5" />
            항목 추가
          </Button>

          {/* 입력 완료 버튼 */}
          <Button
            onClick={handleCompleteAsync}
            className="px-12 py-3 text-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-md transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg">
            입력 완료
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
