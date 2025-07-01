/**
 * 엑셀 데이터 기반 계단식 선택기 컴포넌트
 *
 * 주요 기능:
 * - CSV 데이터에서 배출계수 정보 로드
 * - 계단식 선택을 통한 배출계수 자동 선택
 * - 실시간 배출량 계산 및 표시
 * - SelfInputCalculator와 통일된 NSMM 디자인
 *
 * 디자인 특징:
 * - 통일된 블루 색상 체계
 * - 섹션별 그룹화 레이아웃
 * - 단계별 번호 표시 및 아이콘
 * - 아름다운 결과 영역 3D 효과
 *
 * @author ESG Project Team
 * @version 3.0
 * @since 2024
 * @lastModified 2024-12-20
 */

import React, {useState, useEffect, useRef} from 'react'
import Papa from 'papaparse'
import {motion} from 'framer-motion'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {
  Database,
  Layers,
  Tag,
  Zap,
  Ruler,
  Calculator,
  Hash,
  TrendingUp,
  Cog
} from 'lucide-react'
import type {SelectorState} from '@/types/scopeTypes'
import {Switch} from '../ui/switch'
import {Input} from '../ui/input'

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
  // ========================================================================
  // 상태 관리 (State Management)
  // ========================================================================

  const [data, setData] = useState<CO2Data[]>([])
  const [selectedItem, setSelectedItem] = useState<CO2Data | null>(null)

  const prevSelectedItemRef = useRef<CO2Data | null>(null)
  const isFirstRenderRef = useRef(true)

  // ========================================================================
  // 데이터 로딩 및 선택 리스트 생성 (Data Loading & List Generation)
  // ========================================================================

  useEffect(() => {
    const loadCSVData = async () => {
      try {
        const response = await fetch('/co2.csv')
        const csvText = await response.text()

        const results = Papa.parse(csvText, {header: true})
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
  const separateList = unique(
    data.filter(d => d.category === state.category).map(d => d.separate)
  )
  const rawMaterialList = unique(
    data
      .filter(d => d.category === state.category && d.separate === state.separate)
      .map(d => d.RawMaterial)
  )

  // ========================================================================
  // 선택된 아이템 및 배출량 계산 (Selected Item & Emission Calculation)
  // ========================================================================

  useEffect(() => {
    const selected =
      data.find(
        d =>
          d.category === state.category &&
          d.separate === state.separate &&
          d.RawMaterial === state.rawMaterial
      ) || null

    setSelectedItem(selected)

    // 선택된 아이템이 있을 때만 unit과 kgCO2eq 업데이트 (변경된 경우에만)
    if (
      selected &&
      (state.unit !== selected.unit || state.kgCO2eq !== selected.kgCO2eq.toString())
    ) {
      onChangeState({
        ...state,
        unit: selected.unit,
        kgCO2eq: selected.kgCO2eq.toString()
      })
    } else if (!selected && (state.unit !== '' || state.kgCO2eq !== '')) {
      // 선택된 아이템이 없으면 빈 값으로 초기화 (변경된 경우에만)
      onChangeState({
        ...state,
        unit: '',
        kgCO2eq: ''
      })
    }

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
      prevSelectedItemRef.current = selected
    } else if (
      (!selected || quantity <= 0 || isNaN(quantity)) &&
      prevSelectedItemRef.current !== selected
    ) {
      onChangeTotal(id, 0)
      prevSelectedItemRef.current = selected
    }
  }, [
    state.category,
    state.separate,
    state.rawMaterial,
    state.quantity,
    data,
    id,
    onChangeTotal,
    onChangeState
  ])

  // ========================================================================
  // 이벤트 핸들러 (Event Handlers)
  // ========================================================================

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

  // ========================================================================
  // 입력 필드 설정 데이터 (Input Field Configuration)
  // ========================================================================

  /**
   * 선택 단계 필드 (대분류, 구분, 원료/에너지)
   */
  const productInfoFields = [
    {
      step: '1',
      label: '제품명',
      key: 'productName' as keyof SelectorState,
      type: 'text',
      placeholder: '예: 타이어, 엔진',
      icon: Cog,
      description: '제품 명을 입력하세요'
    },
    {
      step: '2',
      label: '제품 코드',
      key: 'productCode' as keyof SelectorState,
      type: 'text',
      placeholder: '예: P12345',
      icon: Cog,
      description: '제품 코드를 입력하세요'
    }
  ]
  const selectionFields = [
    {
      step: '1',
      label: '대분류',
      type: 'select',
      value: state.category,
      options: categoryList,
      placeholder: '대분류를 선택하세요',
      icon: Layers,
      description: 'ESG 데이터 카테고리를 선택하세요',
      onChange: (value: string) => handleSelect(value, 'category')
    },
    {
      step: '2',
      label: '구분',
      type: 'select',
      value: state.separate,
      options: separateList,
      placeholder: '구분을 선택하세요',
      icon: Tag,
      description: '세부 구분을 선택하세요',
      onChange: (value: string) => handleSelect(value, 'separate'),
      disabled: !state.category
    },
    {
      step: '3',
      label: '원료/에너지',
      type: 'select',
      value: state.rawMaterial,
      options: rawMaterialList,
      placeholder: '원료/에너지를 선택하세요',
      icon: Zap,
      description: '사용된 원료나 에너지를 선택하세요',
      onChange: (value: string) => handleSelect(value, 'raw'),
      disabled: !state.separate
    }
  ]

  /**
   * 정보 표시 필드 (단위, 배출계수)
   */
  const infoFields = [
    {
      step: '4',
      label: '단위',
      value: selectedItem?.unit || '',
      icon: Ruler,
      description: '선택된 원료/에너지의 단위'
    },
    {
      step: '5',
      label: '배출계수',
      value: selectedItem?.kgCO2eq.toFixed(3) || '0.000',
      unit: 'kgCO₂eq',
      icon: Calculator,
      description: '선택된 원료/에너지의 배출계수'
    }
  ]

  /**
   * 계산된 배출량 값
   */
  const calculatedEmission =
    state.quantity &&
    selectedItem &&
    !isNaN(parseFloat(state.quantity)) &&
    parseFloat(state.quantity) > 0
      ? parseFloat(state.quantity) * selectedItem.kgCO2eq
      : 0

  const [productEnabled, setProductEnabled] = useState(false)

  return (
    <motion.div
      initial={{opacity: 0, scale: 0.95}}
      animate={{opacity: 1, scale: 1}}
      transition={{duration: 0.5, type: 'spring', stiffness: 100}}
      className="w-full max-w-4xl mx-auto">
      <Card className="overflow-hidden bg-white border-0 shadow-sm rounded-3xl">
        {/* ======================================================================
            카드 헤더 (Card Header)
            ====================================================================== */}

        <CardContent className="p-8 space-y-8">
          {/* ====================================================================
              분류 선택 섹션 (Category Selection Section)
              ==================================================================== */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.3, duration: 0.4}}
            className="space-y-6">
            <div className="flex items-center pb-4 space-x-2 border-b border-gray-200">
              <Layers className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">분류 선택</h3>
              <span className="text-sm text-gray-500">배출계수 데이터 선택</span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-lg font-semibold">제품 관련</h2>
              <Switch checked={productEnabled} onCheckedChange={setProductEnabled} />
            </div>

            {/* 필드 렌더링 */}
            {productEnabled && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {productInfoFields.map(field => (
                  <div key={field.key}>
                    <div className="flex items-center mb-3 space-x-2">
                      <field.icon className="w-4 h-4 text-blue-500" />
                      <label className="text-sm font-semibold text-gray-700">
                        {field.label}
                      </label>
                    </div>
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 text-sm transition-all duration-200 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300"
                    />
                    <p className="mt-2 text-xs text-gray-500">{field.description}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {selectionFields.map((field, index) => (
                <motion.div
                  key={field.step}
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: 0.4 + index * 0.1, duration: 0.4}}
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

                  {/* 선택 필드 */}
                  <select
                    value={field.value}
                    onChange={e => field.onChange(e.target.value)}
                    disabled={field.disabled}
                    className="w-full px-4 py-3 text-sm transition-all duration-200 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed">
                    <option value="">{field.placeholder}</option>
                    {field.options.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  {/* 설명 텍스트 */}
                  <p className="text-xs text-gray-500">{field.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ====================================================================
              계수 정보 섹션 (Coefficient Information Section)
              ==================================================================== */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.6, duration: 0.4}}
            className="space-y-6">
            <div className="flex items-center pb-4 space-x-2 border-b border-gray-200">
              <Calculator className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">계수 정보</h3>
              <span className="text-sm text-gray-500">자동 설정된 계수 정보</span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {infoFields.map((field, index) => (
                <motion.div
                  key={field.step}
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: 0.7 + index * 0.1, duration: 0.4}}
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

                  {/* 정보 표시 필드 */}
                  <div className="px-4 py-3 text-sm bg-gray-100 border-2 border-gray-200 min-h-12 rounded-xl">
                    {field.value}
                    {field.unit && (
                      <span className="ml-1 text-xs text-gray-500">{field.unit}</span>
                    )}
                  </div>

                  {/* 설명 텍스트 */}
                  <p className="text-xs text-gray-500">{field.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ====================================================================
              수량 입력 섹션 (Quantity Input Section)
              ==================================================================== */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.8, duration: 0.4}}
            className="space-y-6">
            <div className="flex items-center pb-4 space-x-2 border-b border-gray-200">
              <Hash className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">수량 입력</h3>
              <span className="text-sm text-gray-500">사용량 또는 구매량 입력</span>
            </div>

            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: 0.9, duration: 0.4}}
              className="space-y-3">
              {/* 필드 라벨 */}
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center text-xs font-bold text-white bg-blue-500 rounded-full w-7 h-7">
                  6
                </span>
                <Hash className="w-4 h-4 text-blue-500" />
                <label className="text-sm font-semibold text-gray-700">수량</label>
              </div>

              {/* 수량 입력 필드 */}
              <input
                type="number"
                min="0"
                step="any"
                value={state.quantity}
                onChange={e => handleQuantityChange(e.target.value)}
                disabled={!state.rawMaterial}
                className={`px-4 py-3 w-full text-sm rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-blue-100 ${
                  !state.rawMaterial
                    ? 'border-gray-200 bg-gray-100 cursor-not-allowed text-gray-500'
                    : 'border-gray-200 hover:border-gray-300 focus:border-blue-500'
                }`}
                placeholder={
                  state.rawMaterial ? '수량을 입력하세요' : '먼저 원료를 선택하세요'
                }
              />

              {/* 설명 텍스트 */}
              <p className="text-xs text-gray-500">
                {state.rawMaterial
                  ? `사용량이나 구매량을 입력하세요 (단위: ${selectedItem?.unit || '-'})`
                  : '원료를 선택하면 수량을 입력할 수 있습니다'}
              </p>
            </motion.div>
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
                  <motion.div
                    key={calculatedEmission}
                    initial={{scale: 1.1, opacity: 0.8}}
                    animate={{scale: 1, opacity: 1}}
                    transition={{duration: 0.3}}
                    className="text-3xl font-bold text-blue-600">
                    {calculatedEmission.toLocaleString(undefined, {
                      maximumFractionDigits: 3,
                      minimumFractionDigits: 3
                    })}
                  </motion.div>
                  <div className="text-sm font-medium text-blue-500">
                    kgCO₂ equivalent
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
