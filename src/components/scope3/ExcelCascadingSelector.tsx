import React, { useState, useEffect, useRef } from 'react'
import Papa from 'papaparse'
import { Card, CardContent } from '@/components/ui/card'
import type { SelectorState } from '@/lib/types'
export interface CO2Data {
  category: string
  separate: string
  RawMaterial: string
  unit: string
  kgCO2eq: number
}

interface ExcelCascadingSelectorProps {
  id: number
  state: SelectorState
  onChangeState: (state: SelectorState) => void
  onChangeTotal: (id: number, emission: number) => void
}

export function ExcelCascadingSelector({
  id,
  state,
  onChangeState,
  onChangeTotal
}: ExcelCascadingSelectorProps) {
  const [data, setData] = useState<CO2Data[]>([])
  const [selectedItem, setSelectedItem] = useState<CO2Data | null>(null)

  const prevSelectedItemRef = useRef<CO2Data | null>(null)
  const isFirstRenderRef = useRef(true)

  useEffect(() => {
    const loadCSVData = async () => {
      try {
        const response = await fetch('/co2.csv')
        const csvText = await response.text()

        const results = Papa.parse(csvText, { header: true })
        const parsed = (results.data as any[])
          .filter(row => row['대분류'] && row['구분'] && row['원료/에너지'])
          .map(row => ({
            category: row['대분류'].trim(),
            separate: row['구분'].trim(),
            RawMaterial: row['원료/에너지'].trim(),
            unit: row['단위']?.trim() || '',
            kgCO2eq: parseFloat(row['탄소발자국']) || 0
          }))

        console.log(`CSV 데이터 로딩 완료: ${parsed.length}개 항목`)
        setData(parsed)
      } catch (error) {
        console.error('CSV 데이터 로딩 실패:', error)
        setData([])
      }
    }

    loadCSVData()
  }, [])

  const unique = (arr: string[]) => [...new Set(arr.filter(Boolean))]

  const categoryList = unique(data.map(d => d.category))
  const separateList = unique(data.filter(d => d.category === state.category).map(d => d.separate))
  const rawMaterialList = unique(
    data.filter(d => d.category === state.category && d.separate === state.separate).map(d => d.RawMaterial)
  )

 useEffect(() => {
  // selectedItem은 state.category, state.separate, state.rawMaterial 변화에 따라 변함
  // 따라서 useEffect 의 의존성에 selectedItem이 아닌 해당 state들만 넣는 게 낫다.

  const selected =
    data.find(
      d =>
        d.category === state.category &&
        d.separate === state.separate &&
        d.RawMaterial === state.rawMaterial
    ) || null

  setSelectedItem(selected)

  const quantity = parseFloat(state.quantity)

  // 이전 selectedItem과 비교해 실제로 변경된 경우에만 onChangeTotal 호출
  if (
    selected &&
    prevSelectedItemRef.current !== selected &&
    !isNaN(quantity) &&
    quantity > 0
  ) {
    const emission = quantity * selected.kgCO2eq
    onChangeTotal(id, emission)
    prevSelectedItemRef.current = selected // 이 위치로 이동 (중복 호출 방지)
  } else if (
    (!selected || quantity <= 0 || isNaN(quantity)) &&
    prevSelectedItemRef.current !== selected
  ) {
    onChangeTotal(id, 0)
    prevSelectedItemRef.current = selected
  }
}, [state.category, state.separate, state.rawMaterial, state.quantity, data, id, onChangeTotal])


  const handleSelect = (value: string, type: 'category' | 'separate' | 'raw') => {
    if (type === 'category') {
      onChangeState({
        category: value,
        separate: '',
        rawMaterial: '',
        quantity: state.quantity
      })
      onChangeTotal(id, 0)
    } else if (type === 'separate') {
      onChangeState({
        ...state,
        separate: value,
        rawMaterial: ''
      })
      onChangeTotal(id, 0)
    } else if (type === 'raw') {
      onChangeState({
        ...state,
        rawMaterial: value
      })
      // 배출량은 useEffect에서 자동 계산됨
    }
  }

  const handleQuantityChange = (value: string) => {
    onChangeState({
      ...state,
      quantity: value
    })

    if (value === '') {
      onChangeTotal(id, 0)
      return
    }

    const num = parseFloat(value)
    if (isNaN(num) || num < 0) {
      console.warn('유효하지 않은 수량 입력:', value)
      onChangeTotal(id, 0)
      return
    }

    if (selectedItem) {
      const emission = num * selectedItem.kgCO2eq
      onChangeTotal(id, emission)
    } else {
      onChangeTotal(id, 0)
    }
  }

  return (
    <Card className="w-full max-w-2xl shadow-sm">
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-customG-700">
            <span className="flex justify-center items-center mr-2 w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
              1
            </span>
            대분류 선택
          </label>
          <select
            value={state.category}
            onChange={e => handleSelect(e.target.value, 'category')}
            className="px-3 py-2 w-full text-sm rounded-lg border border-customG-300 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-customG-400"
          >
            <option value="">대분류를 선택하세요</option>
            {categoryList.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {state.category && (
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-customG-700">
              <span className="flex justify-center items-center mr-2 w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                2
              </span>
              구분 선택
            </label>
            <select
              value={state.separate}
              onChange={e => handleSelect(e.target.value, 'separate')}
              className="px-3 py-2 w-full text-sm rounded-lg border border-customG-300 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-customG-400"
            >
              <option value="">구분을 선택하세요</option>
              {separateList.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        {state.separate && (
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-customG-700">
              <span className="flex justify-center items-center mr-2 w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                3
              </span>
              원료/에너지 선택
            </label>
            <select
              value={state.rawMaterial}
              onChange={e => handleSelect(e.target.value, 'raw')}
              className="px-3 py-2 w-full text-sm rounded-lg border border-customG-300 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-customG-400"
            >
              <option value="">원료/에너지를 선택하세요</option>
              {rawMaterialList.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        )}

        {state.rawMaterial && (
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-customG-700">
              <span className="flex justify-center items-center mr-2 w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                4
              </span>
              단위
            </label>
            <input
              readOnly
              value={selectedItem?.unit || ''}
              className="px-3 py-2 w-full text-sm rounded-lg border border-customG-300 bg-gray-100 cursor-not-allowed"
            />
          </div>
        )}

        {state.rawMaterial && (
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-customG-700">
              <span className="flex justify-center items-center mr-2 w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                5
              </span>
              배출계수 (kgCO₂eq)
            </label>
            <input
              readOnly
              value={selectedItem?.kgCO2eq.toFixed(3) || ''}
              className="px-3 py-2 w-full text-sm rounded-lg border border-customG-300 bg-gray-100 cursor-not-allowed"
            />
          </div>
        )}

        {state.rawMaterial && (
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-customG-700">
              <span className="flex justify-center items-center mr-2 w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                6
              </span>
              수량 입력
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={state.quantity}
              onChange={e => handleQuantityChange(e.target.value)}
              className="px-3 py-2 w-full text-sm rounded-lg border border-customG-300 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-customG-400"
              placeholder="수량을 입력하세요"
            />
          </div>
        )}

        {/* 결과 출력 */}
        <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-blue-200 shadow-sm mt-6">
          <span className="text-sm font-medium text-customG-600">계산된 배출량:</span>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-600">
              {state.quantity &&
              selectedItem &&
              !isNaN(parseFloat(state.quantity)) &&
              parseFloat(state.quantity) > 0
                ? (parseFloat(state.quantity) * selectedItem.kgCO2eq).toLocaleString(undefined, {
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
