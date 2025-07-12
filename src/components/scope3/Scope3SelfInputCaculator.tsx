import React, {useEffect, useRef} from 'react'
import {motion} from 'framer-motion'
import {Card, CardContent} from '@/components/ui/card'
import {Input} from '../ui/input'
import {Layers, Tag, Zap, Ruler, Calculator, Hash, TrendingUp} from 'lucide-react'
import type {SelectorState} from '@/types/scopeTypes'
import {showWarning} from '@/util/toast'

interface SelfInputCalculatorProps {
  id: number
  state: SelectorState
  onChangeState: (state: SelectorState) => void
  onChangeTotal: (id: number, emission: number) => void
}

export function SelfInputCalculator({
  id,
  state,
  onChangeState,
  onChangeTotal
}: SelfInputCalculatorProps) {
  // ========================================================================
  // 상태 관리 및 배출량 계산 (State Management & Calculation)
  // ========================================================================

  const prevEmissionRef = useRef<number>(-1) // 이전 배출량 값 저장

  /**
   * 안전한 배출량 계산 함수 (정밀도 손실 방지 및 최대값 검증)
   */
  const calculateSafeEmission = () => {
    const qty = parseFloat(state.quantity || '0')
    const factor = parseFloat(state.kgCO2eq || '0')

    if (isNaN(qty) || isNaN(factor) || qty < 0) {
      alert('수량과 배출계수는 숫자여야 하며, 수량은 0 이상이어야 합니다.')
      return 
    }

    const emission = qty * factor

    // totalEmission 최대값 검증 (정수 15자리, 소수점 6자리)
    const maxTotalEmission = 999999999999999.999999
    if (emission > maxTotalEmission) {
      return 0 // 계산 결과가 너무 크면 0 반환
    }

    // 소수점 6자리로 반올림하여 정밀도 손실 방지
    return Math.round(emission * 1000000) / 1000000
  }

  useEffect(() => {
    const emission = calculateSafeEmission()
    if (emission !== undefined){

    if (prevEmissionRef.current !== emission) {
      onChangeTotal(id, emission)
      prevEmissionRef.current = emission
    }
  }
  }, [state.quantity, state.kgCO2eq, id, onChangeTotal])

  // ========================================================================
  // 이벤트 핸들러 (Event Handlers)
  // ========================================================================

  /**
   * 일반 텍스트 입력 핸들러
   */
  const handleChange =
    (key: keyof SelectorState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onChangeState({...state, [key]: e.target.value})
    }

  /**
   * 개선된 숫자 입력 핸들러 (실시간 검증 포함)
   */
  const handleNumberInput =
    (key: keyof SelectorState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value

      // 빈 값 허용
      if (val === '') {
        onChangeState({...state, [key]: val})
        return
      }

      // 숫자 형식 검증 (음수 차단, 소수점 허용)
      if (!/^-?\d*\.?\d*$/.test(val)) {
        return
      }

      // 백엔드 DTO 제한사항에 맞는 실시간 검증
      const numVal = parseFloat(val)

      if (key === 'quantity') {
        // activityAmount: 정수 12자리, 소수점 3자리
        const maxValue = 999999999999.999 // 12자리.3자리
        if (numVal > maxValue) {
          showWarning('수량은 최대 999,999,999,999.999까지 입력 가능합니다.')
          return
        }

        // 소수점 자릿수 검증
        const decimalPart = val.split('.')[1]
        if (decimalPart && decimalPart.length > 3) {
          showWarning('수량은 소수점 3자리까지만 입력 가능합니다.')
          return
        }
      }

      if (key === 'kgCO2eq') {
        // emissionFactor: 정수 9자리, 소수점 6자리
        const maxValue = 999999999.999999 // 9자리.6자리
        if (numVal > maxValue) {
          showWarning('배출계수는 최대 999,999,999.999999까지 입력 가능합니다.')
          return
        }

        // 소수점 자릿수 검증
        const decimalPart = val.split('.')[1]
        if (decimalPart && decimalPart.length > 6) {
          showWarning('배출계수는 소수점 6자리까지만 입력 가능합니다.')
          return
        }
      }

      onChangeState({...state, [key]: val})
    }

  // ========================================================================
  // 입력 필드 설정 데이터 (Input Field Configuration)
  // ========================================================================

  /**
   * 기본 정보 입력 필드 (카테고리, 구분, 원료)
   */
  const basicInfoFields = [
    {
      step: '1',
      label: '대분류',
      key: 'category' as keyof SelectorState,
      type: 'text',
      placeholder: '예: 구매한 상품 및 서비스',
      icon: Layers,
      description: 'Scope 3 배출 카테고리를 입력하세요'
    },
    {
      step: '2',
      label: '구분',
      key: 'separate' as keyof SelectorState,
      type: 'text',
      placeholder: '예: 원료 및 에너지 생산',
      icon: Tag,
      description: '세부 구분을 입력하세요'
    },
    {
      step: '3',
      label: '원료/에너지',
      key: 'rawMaterial' as keyof SelectorState,
      type: 'text',
      placeholder: '예: 에틸렌 프로필렌 디엔 고무',
      icon: Zap,
      description: '사용된 원료나 에너지 유형을 입력하세요'
    }
  ]

  /**
   * 계산 정보 입력 필드 (단위, 배출계수, 수량) - 제한사항 안내 추가
   */
  const calculationFields = [
    {
      step: '4',
      label: '단위',
      key: 'unit' as keyof SelectorState,
      type: 'text',
      placeholder: '예: kg, ton, kWh, m³',
      icon: Ruler,
      description: '수량의 단위를 입력하세요'
    },
    {
      step: '5',
      label: '배출계수',
      key: 'kgCO2eq' as keyof SelectorState,
      type: 'number',
      placeholder: '0.000000',
      icon: Calculator,
      description: 'kgCO₂ equivalent 값 (최대 9자리.소수점6자리)',
      maxInfo: '최대: 999,999,999.999999'
    },
    {
      step: '6',
      label: '수량',
      key: 'quantity' as keyof SelectorState,
      type: 'number',
      placeholder: '0.000',
      icon: Hash,
      description: '사용량이나 구매량 (최대 12자리.소수점3자리)',
      maxInfo: '최대: 999,999,999,999.999'
    }
  ]

  /**
   * 계산된 배출량 값 (안전한 계산)
   */
  const calculatedEmission = calculateSafeEmission()

  return (
    <motion.div
      initial={{opacity: 0, scale: 0.95}}
      animate={{opacity: 1, scale: 1}}
      transition={{duration: 0.5, type: 'spring', stiffness: 100}}
      className="w-full max-w-4xl mx-auto">
      <Card className="overflow-hidden bg-white border-0 shadow-sm rounded-3xl">
        <CardContent className="p-8 space-y-8">
          {/* ====================================================================
              기본 정보 섹션 (Basic Information Section)
              ==================================================================== */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.1, duration: 0.4}}
            className="space-y-6">
            <div className="flex items-center pb-4 space-x-2 border-b border-gray-200">
              <Layers className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">기본 정보</h3>
              <span className="text-sm text-gray-500">ESG 데이터 분류 정보</span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {basicInfoFields.map((field, index) => (
                <motion.div
                  key={field.key}
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: 0.2 + index * 0.1, duration: 0.4}}
                  className="space-y-3">
                  {/* 필드 라벨 */}
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center justify-center text-xs font-bold text-white bg-blue-500 rounded-full w-7 h-7">
                      {field.step}
                    </span>
                    <field.icon className="w-4 h-4 text-blue-500" />
                    <label className="text-sm font-semibold text-gray-700">
                      {field.label}
                    </label>
                  </div>

                  {/* 입력 필드 */}
                  <Input
                    type={field.type}
                    value={state[field.key]}
                    onChange={handleChange(field.key)}
                    className="px-4 py-3 text-sm transition-all duration-200 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300"
                    placeholder={field.placeholder}
                  />

                  {/* 설명 텍스트 */}
                  <p className="text-xs text-gray-500">{field.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ====================================================================
              계산 정보 섹션 (Calculation Information Section)
              ==================================================================== */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.4, duration: 0.4}}
            className="space-y-6">
            <div className="flex items-center pb-4 space-x-2 border-b border-gray-200">
              <Calculator className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">계산 정보</h3>
              <span className="text-sm text-gray-500">배출량 계산을 위한 수치 정보</span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {calculationFields.map((field, index) => (
                <motion.div
                  key={field.key}
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: 0.5 + index * 0.1, duration: 0.4}}
                  className="space-y-3">
                  {/* 필드 라벨 */}
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center justify-center text-xs font-bold text-white bg-blue-500 rounded-full w-7 h-7">
                      {field.step}
                    </span>
                    <field.icon className="w-4 h-4 text-blue-500" />
                    <label className="text-sm font-semibold text-gray-700">
                      {field.label}
                    </label>
                  </div>

                  {/* 입력 필드 */}
                  <Input
                    type={field.type}
                    inputMode={field.type === 'number' ? 'decimal' : undefined}
                    value={state[field.key]}
                    onChange={
                      field.type === 'number'
                        ? handleNumberInput(field.key)
                        : handleChange(field.key)
                    }
                    className="px-4 py-3 text-sm transition-all duration-200 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300"
                    placeholder={field.placeholder}
                  />

                  {/* 설명 텍스트 및 제한사항 안내 */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">{field.description}</p>
                    {field.maxInfo && (
                      <p className="text-xs font-medium text-orange-600">
                        {field.maxInfo}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ====================================================================
              계산 결과 섹션 (Calculation Result Section)
              ==================================================================== */}
          <motion.div
            initial={{opacity: 0, scale: 0.95}}
            animate={{opacity: 1, scale: 1}}
            transition={{delay: 1.0, duration: 0.5}}
            className="relative">
            <div className="relative p-6 overflow-hidden border-2 border-blue-200 shadow-md bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 rounded-2xl">
              {/* 배경 장식 */}
              <div className="absolute w-16 h-16 bg-blue-300 rounded-full top-2 right-2 opacity-20 blur-xl" />
              <div className="absolute w-12 h-12 transform bg-blue-400 rounded-lg bottom-2 left-2 rotate-12 opacity-15" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500 shadow-md rounded-xl">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">계산된 배출량</h4>
                    <p className="text-sm text-gray-600">수량 × 배출계수 결과</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {calculatedEmission?.toLocaleString(undefined, {
                      maximumFractionDigits: 3,
                      minimumFractionDigits: 3
                    })}
                  </div>
                  <div className="text-sm font-medium text-blue-500">
                    kgCO₂ equivalent
                  </div>
                </div>
              </div>

              {/* 계산 공식 표시 */}
              {state.quantity && state.kgCO2eq && (
                <div className="pt-4 mt-4 border-t border-blue-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">계산 공식:</span>{' '}
                    {parseFloat(state.quantity).toLocaleString()} ×{' '}
                    {parseFloat(state.kgCO2eq).toLocaleString()} ={' '}
                    {calculatedEmission?.toLocaleString()} kgCO₂
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
