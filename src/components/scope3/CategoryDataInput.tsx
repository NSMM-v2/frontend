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
import {scope3CategoryList, Scope3CategoryKey} from '../scopeTotal/CategorySelector'
import {SelectorState, Scope3EmissionResponse} from '@/types/scopeTypes'
import {createScope3Emission, updateScope3Emission} from '@/services/scopeService'
import {showError, showSuccess, showWarning} from '@/util/toast'

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

  // ========================================================================
  // 데이터 저장 및 완료 처리 (Data Saving & Completion)
  // ========================================================================

  /**
   * 모든 계산기의 데이터를 백엔드에 저장하는 함수
   * 각 계산기의 유효성 검증 후 API 호출하여 저장 처리
   */
  const saveAllCalculatorsToBackend = async (): Promise<boolean> => {
    if (!calculators || calculators.length === 0) {
      console.log('저장할 계산기가 없습니다.')
      showError('저장할 데이터가 없습니다.')
      return false
    }

    console.log('===== 백엔드 저장 프로세스 시작 =====')
    console.log('저장 대상 계산기 목록:', {
      총개수: calculators.length,
      계산기목록: calculators.map(calc => ({
        id: calc.id,
        ID타입: calc.id > 0 ? 'emissionId (저장된 데이터)' : '임시ID (새 데이터)',
        저장여부: !!calc.savedData,
        state: calc.state
      }))
    })

    // 전체 검증 먼저 실행
    const allValidationResults = calculators.map(calc => {
      const isManualInput = calculatorModes[calc.id] || false
      return {
        calculatorId: calc.id,
        validation: validateCalculatorData(calc, isManualInput),
        isManualInput
      }
    })

    // 검증 실패한 항목이 있는지 확인
    const failedValidations = allValidationResults.filter(
      result => !result.validation.isValid
    )

    if (failedValidations.length > 0) {
      console.warn('검증 실패한 계산기들:', failedValidations)

      // 검증 실패 메시지들을 합쳐서 표시
      const errorMessages = failedValidations
        .map(
          failed =>
            `계산기 ${failed.calculatorId}: ${failed.validation.errors.join(', ')}`
        )
        .join('\n')

      showWarning(`입력 데이터를 확인해주세요:\n\n${errorMessages}`)
      return false // 검증 실패 시 저장 중단
    }

    const results = []

    for (const calc of calculators) {
      try {
        console.log(`\n----- 계산기 ${calc.id} 저장 시작 -----`)
        console.log('계산기 상세 정보:', {
          id: calc.id,
          ID타입: calc.id > 0 ? 'emissionId (업데이트)' : '임시ID (신규 생성)',
          저장여부: !!calc.savedData,
          calculatorMode: calculatorModes[calc.id] || false,
          state: calc.state
        })

        const isManualInput = calculatorModes[calc.id] || false

        // 요청 데이터 구성
        const requestData = createRequestPayload(calc, isManualInput)
        console.log('API 요청 데이터:', requestData)

        let response

        if (calc.id > 0) {
          // 저장된 데이터 업데이트 (emissionId 사용)
          console.log(`기존 데이터 업데이트 시작 (emissionId: ${calc.id})`)
          response = await updateScope3Emission(calc.id, requestData)
          console.log('updateScope3Emission 응답:', response)
        } else {
          // 새 데이터 생성 (임시ID는 무시하고 새로 생성)
          console.log(`새 데이터 생성 시작 (임시ID: ${calc.id})`)
          response = await createScope3Emission(requestData)
          console.log('createScope3Emission 응답:', response)
        }

        if (response && response.id) {
          console.log(`계산기 ${calc.id} 저장 성공`)
          console.log('저장 성공 상세:', {
            기존ID: calc.id,
            새ID: response.id,
            처리방식: calc.id > 0 ? '업데이트' : '신규 생성'
          })

          results.push({
            calculatorId: calc.id,
            success: true,
            newEmissionId: response.id,
            response: response
          })
        } else {
          // 응답 데이터 없음 (저장 실패로 간주)
          results.push({
            calculatorId: calc.id,
            success: false,
            error: '응답 데이터 없음'
          })
        }
      } catch (error) {
        // 저장 실패 (scopeService에서 이미 토스트 메시지 표시됨)
        results.push({
          calculatorId: calc.id,
          success: false,
          error: error instanceof Error ? error.message : '알 수 없는 오류'
        })
      }

      console.log(`계산기 ${calc.id} 저장 처리 완료`)
    }

    // 전체 저장 결과 요약
    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    console.log('백엔드 저장 프로세스 완료')
    console.log('저장 결과 요약:', {
      전체개수: results.length,
      성공개수: successCount,
      실패개수: failCount
    })

    if (failCount > 0) {
      // scopeService에서 이미 상세한 토스트 메시지가 표시되므로 여기서는 추가 메시지 없음
      return false // 저장 실패가 있으면 false 반환
    } else {
      console.log('모든 계산기 저장 성공')
      showSuccess(`${successCount}개의 데이터가 성공적으로 저장되었습니다.`)
    }

    // 저장 완료 후 데이터 새로고침
    if (successCount > 0) {
      console.log('저장 성공한 항목이 있어 데이터 새로고침 진행')
      await handleDataChange()
      console.log('데이터 새로고침 완료')
    }

    return successCount > 0 // 성공한 항목이 하나라도 있으면 true 반환
  }

  // ========================================================================
  // 헬퍼 함수들 (Helper Functions)
  // ========================================================================

  /**
   * 강화된 계산기 데이터 유효성 검증
   */
  const validateCalculatorData = (calc: any, isManualInput: boolean) => {
    const errors: string[] = []
    const state = calc.state

    // 기본 필수 필드 검증
    if (!state.unit || state.unit.trim() === '') {
      errors.push('단위는 필수입니다')
    }

    if (isManualInput) {
      // 수동 입력 모드: 직접 입력된 값 검증
      const emissionFactor = parseFloat(state.kgCO2eq || '0')
      const activityAmount = parseFloat(state.quantity || '0')

      if (emissionFactor <= 0) {
        errors.push('배출계수는 0보다 큰 값이어야 합니다')
      }
      if (activityAmount <= 0) {
        errors.push('활동량은 0보다 큰 값이어야 합니다')
      }

      // 백엔드 DTO 제한사항 검증
      if (emissionFactor > 999999999.999999) {
        errors.push('배출계수는 최대 999,999,999.999999까지 입력 가능합니다')
      }
      if (activityAmount > 999999999999.999) {
        errors.push('활동량은 최대 999,999,999,999.999까지 입력 가능합니다')
      }

      // 계산된 배출량 검증
      const totalEmission = emissionFactor * activityAmount
      if (totalEmission > 999999999999999.999999) {
        errors.push(
          '계산된 배출량이 최대값을 초과합니다. 수량 또는 배출계수를 줄여주세요'
        )
      }

      // 소수점 자릿수 검증
      const factorDecimal = (state.kgCO2eq || '').split('.')[1]
      if (factorDecimal && factorDecimal.length > 6) {
        errors.push('배출계수는 소수점 6자리까지만 입력 가능합니다')
      }

      const quantityDecimal = (state.quantity || '').split('.')[1]
      if (quantityDecimal && quantityDecimal.length > 3) {
        errors.push('활동량은 소수점 3자리까지만 입력 가능합니다')
      }
    } else {
      // 자동 계산 모드: 카테고리/세부분류/원재료 검증
      if (!state.category || state.category.trim() === '') {
        errors.push('카테고리는 필수입니다')
      }
      if (!state.rawMaterial || state.rawMaterial.trim() === '') {
        errors.push('원재료는 필수입니다')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 개선된 API 요청 데이터 생성 (안전한 소수점 처리)
   */
  const createRequestPayload = (calc: any, isManualInput: boolean) => {
    const state = calc.state

    // 안전한 숫자 변환 및 정밀도 제한
    const emissionFactor =
      Math.round(parseFloat(state.kgCO2eq || '0') * 1000000) / 1000000 // 소수점 6자리
    const activityAmount = Math.round(parseFloat(state.quantity || '0') * 1000) / 1000 // 소수점 3자리
    const totalEmission = Math.round(emissionFactor * activityAmount * 1000000) / 1000000 // 소수점 6자리

    return {
      majorCategory: state.category || '',
      subcategory: state.separate || '',
      rawMaterial: state.rawMaterial || '',
      unit: state.unit || '',
      emissionFactor: emissionFactor,
      activityAmount: activityAmount,
      totalEmission: totalEmission,
      reportingYear: selectedYear || new Date().getFullYear(),
      reportingMonth: selectedMonth || new Date().getMonth() + 1,
      categoryNumber: Number(categoryNumber) || 1,
      categoryName: categoryTitle,
      isManualInput: isManualInput
    }
  }

  /**
   * 개선된 입력 완료 핸들러 (검증 실패 시 화면 이동 방지)
   */
  const handleCompleteAsync = async () => {
    try {
      console.log('입력 완료 버튼 클릭 - 저장 프로세스 시작')

      // 저장 및 검증 실행
      const saveSuccess = await saveAllCalculatorsToBackend()

      if (saveSuccess) {
        console.log('저장 성공 - 화면 전환 진행')
        onComplete() // 저장 성공 시에만 화면 전환
      } else {
        console.log('저장 실패 또는 검증 실패 - 현재 화면 유지')
        // 저장/검증 실패 시 화면 이동하지 않음 (토스트 메시지만 표시됨)
      }
    } catch (error) {
      console.log('입력 완료 처리 중 오류 발생')
      // 오류 발생 시에도 화면 이동하지 않음 (scopeService에서 토스트 메시지 표시됨)
    }
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
      <div className="overflow-hidden bg-white rounded-3xl border-0 shadow-sm">
        <div className="p-6 bg-white">
          <div className="flex flex-row justify-between items-center">
            <motion.div
              initial={{opacity: 0, x: -20}}
              animate={{opacity: 1, x: 0}}
              transition={{delay: 0.1, duration: 0.5}}
              onClick={handleBackToList}
              className="flex flex-row items-center p-4 rounded-xl transition-all duration-200 hover:cursor-pointer hover:bg-blue-50">
              <div className="mr-4 text-2xl text-blue-500">←</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{categoryTitle}</h1>
                <div className="mt-1 text-sm text-gray-600">
                  배출계수를 선택하고 활동량을 입력하여 배출량을 계산하세요
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
              <Card className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm min-w-md">
                <CardContent className="flex justify-between items-center p-6">
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
                      {totalEmission.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2
                      })}
                    </span>
                    <div className="text-sm text-gray-500">kgCO₂</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
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
                      className="px-8 py-3 text-lg font-semibold text-white bg-blue-500 rounded-xl shadow-sm transition-all duration-200 hover:bg-blue-600 hover:shadow-sm">
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
          className="flex gap-4 justify-center items-center pt-8 border-t border-gray-200">
          {/* 항목 추가 버튼 */}
          <Button
            onClick={handleAddCalculator}
            variant="outline"
            className="px-8 py-3 text-base font-semibold text-blue-600 bg-white rounded-xl border-2 border-blue-500 transition-all duration-200 hover:bg-blue-50 hover:border-blue-600 hover:shadow-sm">
            <Plus className="mr-2 w-5 h-5" />
            항목 추가
          </Button>

          {/* 입력 완료 버튼 */}
          <Button
            onClick={handleCompleteAsync}
            className="px-8 py-3 text-base font-semibold text-white bg-blue-500 rounded-xl shadow-sm transition-all duration-200 hover:bg-blue-600 hover:shadow-sm">
            입력 완료
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
