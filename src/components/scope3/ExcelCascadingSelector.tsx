/**
 * Excel CSV 기반 연쇄 선택 계산기 컴포넌트
 *
 * 주요 기능:
 * - CSV 파일에서 배출계수 데이터 로딩
 * - 대분류 → 구분 → 원료/에너지 단계별 선택
 * - 실시간 배출량 계산 및 업데이트
 * - 입력 데이터 유효성 검증
 *
 * @author ESG Project Team
 * @version 1.0
 * @since 2024
 */

import React, {useState, useEffect, useRef} from 'react'
import Papa from 'papaparse'
import {Card, CardContent} from '@/components/ui/card'

// ============================================================================
// 타입 정의 (Type Definitions)
// ============================================================================

/**
 * CO2 배출계수 데이터 구조
 */
export interface CO2Data {
  category: string // 대분류
  separate: string // 구분
  RawMaterial: string // 원료/에너지
  unit: string // 단위
  kgCO2eq: number // 탄소발자국 (kgCO₂eq)
}

/**
 * 계산기 입력 상태 타입
 */
export type SelectorState = {
  category: string // 대분류
  separate: string // 구분
  rawMaterial: string // 원료/에너지
  quantity: string // 수량
}

/**
 * ExcelCascadingSelector 컴포넌트 Props 타입
 */
interface ExcelCascadingSelectorProps {
  /** 계산기 고유 ID */
  id: number
  /** 현재 입력 상태 */
  state: SelectorState
  /** 상태 변경 핸들러 */
  onChangeState: (state: SelectorState) => void
  /** 배출량 변경 핸들러 */
  onChangeTotal: (id: number, emission: number) => void
}

/**
 * ExcelCascadingSelector 컴포넌트
 * CSV 데이터를 기반으로 배출계수를 적용하여 배출량을 계산하는 컴포넌트
 */
export function ExcelCascadingSelector({
  id,
  state,
  onChangeState,
  onChangeTotal
}: ExcelCascadingSelectorProps) {
  // ========================================================================
  // 상태 관리 (State Management)
  // ========================================================================

  const [data, setData] = useState<CO2Data[]>([]) // CSV 데이터 저장
  const [selectedItem, setSelectedItem] = useState<CO2Data | null>(null) // 선택된 배출계수 항목

  // 이전 선택 항목 추적 (불필요한 재계산 방지)
  const prevSelectedItemRef = useRef<CO2Data | null>(null)
  const isFirstRenderRef = useRef(true)

  // ========================================================================
  // CSV 데이터 로딩 (CSV Data Loading)
  // ========================================================================

  /**
   * 컴포넌트 마운트 시 CSV 파일에서 배출계수 데이터 로딩
   */
  useEffect(() => {
    const loadCSVData = async () => {
      try {
        const response = await fetch('/co2.csv')
        const csvText = await response.text()

        const results = Papa.parse(csvText, {header: true})
        const parsed = (results.data as any[])
          .filter(row => row['대분류'] && row['구분'] && row['원료/에너지']) // 빈 행 제외
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

  // ========================================================================
  // 데이터 필터링 (Data Filtering)
  // ========================================================================

  /**
   * 배열에서 중복 제거 유틸리티 함수
   */
  const unique = (arr: string[]) => [...new Set(arr.filter(Boolean))]

  // 단계별 선택 옵션 생성
  const categoryList = unique(data.map(d => d.category))
  const separateList = unique(
    data.filter(d => d.category === state.category).map(d => d.separate)
  )
  const rawMaterialList = unique(
    data
      .filter(d => d.category === state.category && d.separate === state.separate)
      .map(d => d.RawMaterial)
  )

  // ========================================================================
  // 배출량 계산 로직 (Emission Calculation Logic)
  // ========================================================================

  /**
   * 선택된 항목 변경 시 배출량 자동 계산
   */
  useEffect(() => {
    // 현재 선택된 배출계수 항목 찾기
    const selected =
      data.find(
        d =>
          d.category === state.category &&
          d.separate === state.separate &&
          d.RawMaterial === state.rawMaterial
      ) || null

    setSelectedItem(selected)

    // 첫 렌더링 시에는 계산하지 않음
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      prevSelectedItemRef.current = selected
      return
    }

    // 배출계수가 변경되고 수량이 입력된 경우에만 재계산
    if (selected && prevSelectedItemRef.current !== selected) {
      const quantity = parseFloat(state.quantity)
      if (!isNaN(quantity) && quantity > 0) {
        const emission = quantity * selected.kgCO2eq
        console.log(`배출량 계산: ${quantity} × ${selected.kgCO2eq} = ${emission} kgCO₂`)
        onChangeTotal(id, emission) // 부모 컴포넌트에 배출량 전달
      } else {
        onChangeTotal(id, 0) // 수량이 없으면 0으로 설정
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

  // ========================================================================
  // 이벤트 핸들러 (Event Handlers)
  // ========================================================================

  /**
   * 선택 항목 변경 핸들러
   * 상위 단계 변경 시 하위 단계 초기화
   */
  const handleSelect = (value: string, type: 'category' | 'separate' | 'raw') => {
    if (type === 'category') {
      // 대분류 변경 시 모든 하위 항목 초기화
      onChangeState({
        category: value,
        separate: '',
        rawMaterial: '',
        quantity: state.quantity // 수량은 유지
      })
      onChangeTotal(id, 0) // 배출량 초기화
    } else if (type === 'separate') {
      // 구분 변경 시 원료만 초기화
      onChangeState({
        ...state,
        separate: value,
        rawMaterial: ''
        // quantity는 유지
      })
      onChangeTotal(id, 0) // 배출량 초기화
    } else if (type === 'raw') {
      // 원료 변경 시 수량은 유지
      onChangeState({
        ...state,
        rawMaterial: value
        // quantity는 유지
      })
      // 배출량은 useEffect에서 자동 계산됨
    }
  }

  /**
   * 수량 입력 변경 핸들러
   * 실시간으로 배출량 계산 및 업데이트
   */
  const handleQuantityChange = (value: string) => {
    onChangeState({
      ...state,
      quantity: value
    })

    // 빈 값인 경우 배출량 0으로 설정
    if (value === '') {
      onChangeTotal(id, 0)
      return
    }

    // 숫자 유효성 검증
    const num = parseFloat(value)
    if (isNaN(num)) {
      console.warn('유효하지 않은 수량 입력:', value)
      onChangeTotal(id, 0)
      return
    }

    // 음수 값 방지
    if (num < 0) {
      console.warn('음수 값은 입력할 수 없습니다:', num)
      onChangeTotal(id, 0)
      return
    }

    // 배출량 계산 및 업데이트
    if (selectedItem) {
      const emission = num * selectedItem.kgCO2eq
      onChangeTotal(id, emission)
    } else {
      onChangeTotal(id, 0)
    }
  }

  // ========================================================================
  // 렌더링 (Rendering)
  // ========================================================================

  return (
    <Card className="w-full max-w-2xl shadow-sm min-w-2xl">
      <CardContent className="p-6 space-y-6">
        {/* 1단계: 대분류 선택 */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-customG-700">
            <span className="flex items-center justify-center w-6 h-6 mr-2 text-xs font-bold text-white bg-blue-500 rounded-full">
              1
            </span>
            대분류 선택
          </label>
          <select
            value={state.category}
            onChange={e => handleSelect(e.target.value, 'category')}
            className="w-full px-3 py-2 text-sm transition-all duration-200 border rounded-lg border-customG-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-customG-400">
            <option value="">대분류를 선택하세요</option>
            {categoryList.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* 2단계: 구분 선택 (대분류 선택 후 활성화) */}
        {state.category && (
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-customG-700">
              <span className="flex items-center justify-center w-6 h-6 mr-2 text-xs font-bold text-white bg-blue-500 rounded-full">
                2
              </span>
              구분 선택
            </label>
            <select
              value={state.separate}
              onChange={e => handleSelect(e.target.value, 'separate')}
              className="w-full px-3 py-2 text-sm transition-all duration-200 border rounded-lg border-customG-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-customG-400">
              <option value="">구분을 선택하세요</option>
              {separateList.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 3단계: 원료/에너지 선택 (구분 선택 후 활성화) */}
        {state.separate && (
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-customG-700">
              <span className="flex items-center justify-center w-6 h-6 mr-2 text-xs font-bold text-white bg-blue-500 rounded-full">
                3
              </span>
              원료/에너지 선택
            </label>
            <select
              value={state.rawMaterial}
              onChange={e => handleSelect(e.target.value, 'raw')}
              className="w-full p-2 text-sm transition-all duration-200 border rounded-lg border-customG-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-customG-400">
              <option value="">원료/에너지를 선택하세요</option>
              {rawMaterialList.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 4단계: 수량 입력 및 배출량 계산 결과 */}
        {selectedItem && (
          <div className="p-4 space-y-4 border border-blue-200 rounded-lg">
            {/* 배출계수 정보 표시 */}
            <div className="p-3 bg-white border border-blue-100 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-customG-700">선택된 배출계수:</span>
                <span className="font-bold text-blue-600">
                  {selectedItem.kgCO2eq} kgCO₂/{selectedItem.unit}
                </span>
              </div>
            </div>

            {/* 수량 입력 */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-customG-700">
                <span className="flex items-center justify-center w-6 h-6 mr-2 text-xs font-bold text-white bg-blue-500 rounded-full">
                  4
                </span>
                수량 입력
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={state.quantity}
                  onChange={e => handleQuantityChange(e.target.value)}
                  placeholder={`${selectedItem.unit} 단위로 입력`}
                  className="w-full px-3 py-2 pr-20 text-sm transition-all duration-200 border rounded-lg border-customG-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-customG-400"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-customG-500">
                  {selectedItem.unit}
                </div>
              </div>
            </div>

            {/* 실시간 배출량 계산 결과 */}
            <div className="flex items-center justify-between p-4 bg-white border border-blue-200 rounded-lg shadow-sm">
              <span className="text-sm font-medium text-customG-600">계산된 배출량:</span>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">
                  {state.quantity &&
                  !isNaN(parseFloat(state.quantity)) &&
                  parseFloat(state.quantity) >= 0
                    ? (parseFloat(state.quantity) * selectedItem.kgCO2eq).toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits: 3,
                          minimumFractionDigits: 3
                        }
                      )
                    : '0.000'}
                </div>
                <div className="text-xs text-customG-500">kgCO₂ equivalent</div>
              </div>
            </div>
          </div>
        )}

        {/* 데이터 로딩 상태 표시 */}
        {data.length === 0 && (
          <div className="p-4 text-sm text-center rounded-lg text-customG-500 bg-gray-50">
            배출계수 데이터를 로딩 중입니다...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
