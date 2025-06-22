'use client'

import {useState, useEffect, useRef} from 'react'
import Papa from 'papaparse'

interface CO2Data {
  category: string
  separate: string
  RawMaterial: string
  unit: string
  kgCO2eq: number
}

interface ExcelCascadingSelectorProps {
  id: number
  state: {
    category: string
    separate: string
    rawMaterial: string
    quantity: string
  }
  onChangeState: (state: {
    category: string
    separate: string
    rawMaterial: string
    quantity: string
  }) => void
  onChangeTotal: (id: number, emission: number) => void
}

export default function ExcelCascadingSelector({
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
    fetch('/co2.csv')
      .then(res => res.text())
      .then(csvText => {
        const results = Papa.parse(csvText, {header: true})
        const parsed = (results.data as any[]).map(row => ({
          category: row['대분류'],
          separate: row['구분'],
          RawMaterial: row['원료/에너지'],
          unit: row['단위'],
          kgCO2eq: parseFloat(row['탄소발자국'])
        }))
        setData(parsed)
      })
  }, [])

  const unique = (arr: string[]) => [...new Set(arr)]

  const categoryList = unique(data.map(d => d.category))
  const separateList = unique(
    data.filter(d => d.category === state.category).map(d => d.separate)
  )
  const rawMaterialList = unique(
    data
      .filter(d => d.category === state.category && d.separate === state.separate)
      .map(d => d.RawMaterial)
  )

  useEffect(() => {
    const selected =
      data.find(
        d =>
          d.category === state.category &&
          d.separate === state.separate &&
          d.RawMaterial === state.rawMaterial
      ) || null

    setSelectedItem(selected)

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      prevSelectedItemRef.current = selected
      return
    }

    // 조건: 수량이 있고, 새 selected가 존재하고, 이전과 다를 경우에만 재계산
    if (selected && prevSelectedItemRef.current !== selected) {
      const quantity = parseFloat(state.quantity)
      if (!isNaN(quantity)) {
        const emission = quantity * selected.kgCO2eq
        onChangeTotal(id, emission) // 수량으로 재계산
      } else {
        onChangeTotal(id, 0) // 수량이 없거나 잘못된 경우만 0
      }
      prevSelectedItemRef.current = selected
    }
  }, [
    state.category,
    state.separate,
    state.rawMaterial,
    state.quantity,
    data,
    id,
    onChangeTotal
  ])
  const handleSelect = (value: string, type: 'category' | 'separate' | 'raw') => {
    if (type === 'category') {
      onChangeState({
        category: value,
        separate: '',
        rawMaterial: '',
        quantity: ''
      })
      onChangeTotal(id, 0)
    } else if (type === 'separate') {
      onChangeState({
        ...state,
        separate: value,
        rawMaterial: '',
        quantity: ''
      })
      onChangeTotal(id, 0)
    } else if (type === 'raw') {
      onChangeState({
        ...state,
        rawMaterial: value,
        quantity: ''
      })
      onChangeTotal(id, 0)
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
    if (isNaN(num)) {
      alert('숫자를 입력해주세요.')
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
    <div className="p-4 w-full max-w-md rounded border shadow-sm">
      <div className="mb-4">
        <label className="block mb-1">대분류 (category)</label>
        <select
          value={state.category}
          onChange={e => handleSelect(e.target.value, 'category')}
          className="px-2 py-1 w-full border">
          <option value="">선택하세요</option>
          {categoryList.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {state.category && (
        <div className="mb-4">
          <label className="block mb-1">구분 (separate)</label>
          <select
            value={state.separate}
            onChange={e => handleSelect(e.target.value, 'separate')}
            className="px-2 py-1 w-full border">
            <option value="">선택하세요</option>
            {separateList.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {state.separate && (
        <div className="mb-4">
          <label className="block mb-1">원료/에너지 (RawMaterial)</label>
          <select
            value={state.rawMaterial}
            onChange={e => handleSelect(e.target.value, 'raw')}
            className="px-2 py-1 w-full border">
            <option value="">선택하세요</option>
            {rawMaterialList.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedItem && (
        <div className="p-4 mt-4 bg-gray-100 rounded">
          <label className="block mb-2">
            수량 입력 ({selectedItem.unit}당 kgCO₂: {selectedItem.kgCO2eq})
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={state.quantity}
            onChange={e => handleQuantityChange(e.target.value)}
            placeholder={selectedItem.unit}
            className="px-2 py-1 w-full border"
          />
          <div className="mt-2 font-semibold">
            ➤ 배출량:{' '}
            {state.quantity && !isNaN(parseFloat(state.quantity))
              ? (parseFloat(state.quantity) * selectedItem.kgCO2eq).toFixed(3)
              : '0.000'}{' '}
            kgCO₂
          </div>
        </div>
      )}
    </div>
  )
}
