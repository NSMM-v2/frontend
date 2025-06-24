import React, { useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '../ui/input'
import type { SelectorState } from '@/lib/types'


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
  // 배출량 계산 useEffect
  const prevEmissionRef = useRef<number>(-1)  // 초기값 -1(없던 값)

  useEffect(() => {
    const qty = parseFloat(state.quantity)
    const factor = parseFloat(state.kgCO2eq || '')
    const emission = !isNaN(qty) && qty >= 0 && !isNaN(factor) && factor >= 0 ? qty * factor : 0

    if (prevEmissionRef.current !== emission) {
      onChangeTotal(id, emission)
      prevEmissionRef.current = emission
    }
  }, [state.quantity, state.kgCO2eq, id, onChangeTotal])
  // 상태 업데이트 핸들러
  const handleChange = (key: keyof SelectorState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeState({ ...state, [key]: e.target.value })
  }

  // 숫자 입력 필터 (음수 차단)
  const handleNumberInput = (key: keyof SelectorState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      onChangeState({ ...state, [key]: val })
    }
  }

  return (
    <Card className="w-full max-w-2xl shadow-sm">
      <CardContent className="p-6 space-y-4">
        {([
          ['1', '대분류', 'category', 'text'],
          ['2', '구분', 'separate', 'text'],
          ['3', '원료/에너지', 'rawMaterial', 'text'],
          ['4', '단위', 'unit', 'text'],
          ['5', '배출계수 (kgCO₂eq)', 'kgCO2eq', 'number'],
          ['6', '수량', 'quantity', 'number']
        ] as const).map(([step, label, key, type]) => (
          <div key={key} className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-customG-700">
              <span className="flex justify-center items-center mr-2 w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                {step}
              </span>
              {label}
            </label>
            <Input
              type={type}
              inputMode={type === 'number' ? 'decimal' : undefined}
              value={state[key]}
              onChange={type === 'number' ? handleNumberInput(key) : handleChange(key)}
              className="px-3 py-2 w-full text-sm rounded-lg border border-customG-300 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-customG-400"
              placeholder={type === 'number' ? '0 또는 양수 입력' : undefined}
            />
          </div>
        ))}

        {/* 결과 출력 */}
        <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-blue-200 shadow-sm mt-6">
          <span className="text-sm font-medium text-customG-600">계산된 배출량:</span>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-600">
              {state.quantity &&
              state.kgCO2eq &&
              !isNaN(parseFloat(state.quantity)) &&
              !isNaN(parseFloat(state.kgCO2eq))
                ? (parseFloat(state.quantity) * parseFloat(state.kgCO2eq)).toLocaleString(undefined, {
                    maximumFractionDigits: 3,
                    minimumFractionDigits: 3
                  })
                : '0.000'}
            </div>
            <div className="text-xs text-customG-500">kgCO₂ equivalent</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
