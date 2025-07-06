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
 */

import React, {useState, useEffect, useRef, useMemo} from 'react'
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
import {
  Scope1PotentialCategoryKey,
  Scope1KineticCategoryKey,
  Scope1ProcessCategoryKey,
  Scope1LeakCategoryKey,
  Scope2ElectricCategoryKey,
  Scope2SteamCategoryKey
} from '@/components/scopeTotal/Scope123CategorySelector'

export interface CO2Data {
  category: string
  separate: string
  RawMaterial: string
  unit: string
  kgCO2eq: number
}
type SeparateFilterRule = {include: string[]} | {exclude: string[]} | undefined
interface ExcelCascadingSelectorProps {
  activeCategory:
    | Scope1PotentialCategoryKey
    | Scope1KineticCategoryKey
    | Scope1ProcessCategoryKey
    | Scope1LeakCategoryKey
    | Scope2ElectricCategoryKey
    | Scope2SteamCategoryKey
  id: number
  state: SelectorState
  onChangeState: (state: SelectorState) => void
  onChangeTotal: (id: number, emission: number) => void
}

export function ExcelCascadingSelector({
  activeCategory,
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
  const [isInitialized, setIsInitialized] = useState(false)

  const prevSelectedItemRef = useRef<CO2Data | null>(null)
  const isFirstRenderRef = useRef(true)

  // ========================================================================
  // 데이터 로딩 및 초기 상태 복원 (Data Loading & Initial State Restoration)
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
            kgCO2eq:
              parseFloat((row['탄소발자국'] as string).replace(/(\.\d+)\.(?=E)/, '$1')) ||
              0
          }))

        console.log(`CSV 데이터 로딩 완료: ${parsed.length}개 항목`)
        setData(parsed)

        // CSV 데이터 로딩 완료 후 초기 상태 복원
        if (state.separate && state.rawMaterial && !isInitialized) {
          restoreInitialSelection(parsed)
        }

        setIsInitialized(true)
      } catch (error) {
        console.error('CSV 데이터 로딩 실패:', error)
        setData([])
        setIsInitialized(true)
      }
    }

    loadCSVData()
  }, [])

  /**
   * 백엔드에서 불러온 데이터로 초기 선택 상태 복원
   */
  const restoreInitialSelection = (csvData: CO2Data[]) => {
    if (!state.separate || !state.rawMaterial) return

    // CSV 데이터에서 매칭되는 항목 찾기
    const matchingItem = csvData.find(
      item => item.separate === state.separate && item.RawMaterial === state.rawMaterial
    )

    if (matchingItem) {
      console.log('LCA 모드 초기 데이터 복원:', {
        separate: state.separate,
        rawMaterial: state.rawMaterial,
        unit: matchingItem.unit,
        kgCO2eq: matchingItem.kgCO2eq
      })

      // 매칭되는 항목이 있으면 선택된 상태로 설정
      setSelectedItem(matchingItem)

      // 단위와 배출계수가 다르면 업데이트 (백엔드 데이터 우선)
      if (
        state.unit !== matchingItem.unit ||
        state.kgCO2eq !== matchingItem.kgCO2eq.toString()
      ) {
        onChangeState({
          ...state,
          unit: matchingItem.unit,
          kgCO2eq: matchingItem.kgCO2eq.toString()
        })
      }

      // 수량이 있으면 배출량 계산
      const quantity = parseFloat(state.quantity || '0')
      if (quantity > 0) {
        const emission = quantity * matchingItem.kgCO2eq
        onChangeTotal(id, emission)
      }
    } else {
      console.warn('CSV 데이터에서 매칭되는 항목을 찾을 수 없습니다:', {
        separate: state.separate,
        rawMaterial: state.rawMaterial
      })
    }
  }

  const unique = (arr: string[]) => [...new Set(arr.filter(Boolean))]

  // ... existing code ...

  const separateFilterMap: Record<typeof activeCategory, SeparateFilterRule> = {
    list1: {include: ['에너지']}, // 예시
    list2: {exclude: ['에너지']}, // list2는 필터링 안 함 → 전체 표시
    list3: {include: ['에너지', '육상수송', '항공수송', '해상수송']}, // list3는 에너지, 육상수송, 항공수송, 해상수송만 표시
    list4: undefined,
    list5: undefined,
    list6: undefined, // list6는 필터링 안 함 → 전체 표시
    list7: undefined, // list7는 필터링 안 함 → 전체 표시
    list8: undefined,
    list9: undefined, // list9는 필터링 안 함 → 전체 표시
    list10: undefined, // list15는 필터링 안 함 → 전체 표시
    list11: undefined,
    list12: undefined
  }
  // ... rest of the code remains the same ...
  // const categoryList = unique(data.map(d => d.category))
  const filteredSeparateList = useMemo(() => {
    const rawList = unique(data.map(d => d.separate))

    const rule = separateFilterMap[activeCategory]

    if (!rule) return rawList

    if ('include' in rule) {
      return rawList.filter(sep => rule.include.includes(sep))
    }

    if ('exclude' in rule) {
      return rawList.filter(sep => !rule.exclude.includes(sep))
    }

    return rawList
  }, [data, state.category, activeCategory])
  const rawMaterialList = unique(
    data.filter(d => d.separate === state.separate).map(d => d.RawMaterial)
  )

  // ========================================================================
  // 선택된 아이템 및 배출량 계산 (Selected Item & Emission Calculation)
  // ========================================================================

  useEffect(() => {
    // CSV 데이터 로딩이 완료되고 초기화가 끝난 후에만 실행
    if (!isInitialized || data.length === 0) return

    const selected =
      data.find(
        d => d.separate === state.separate && d.RawMaterial === state.rawMaterial
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
    onChangeState,
    isInitialized
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

  const [productEnabled, setProductEnabled] = useState(
    !!(state.productName || state.productCode)
  )

  useEffect(() => {
    setProductEnabled(!!(state.productName || state.productCode))
  }, [state.productName, state.productCode])

  // 제품 정보 토글 변경 시 필드 초기화 핸들러 추가
  const handleProductToggle = (checked: boolean) => {
    setProductEnabled(checked)

    // 토글을 끄면 제품 정보 필드 초기화
    if (!checked) {
      onChangeState({
        ...state,
        productName: '',
        productCode: ''
      })
    }
  }

  // handleChange 함수 수정 - 제품 정보 변경 시 토글 상태도 업데이트
  const handleChange =
    (key: keyof SelectorState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      const newState = {
        ...state,
        [key]: newValue
      }

      onChangeState(newState)

      // 제품 정보 필드 변경 시 토글 상태 자동 업데이트
      if (key === 'productName' || key === 'productCode') {
        setProductEnabled(!!(newState.productName || newState.productCode))
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
      label: '구분',
      type: 'select',
      value: state.separate,
      options: filteredSeparateList,
      placeholder: '구분을 선택하세요',
      icon: Tag,
      description: '세부 구분을 선택하세요',
      onChange: (value: string) => handleSelect(value, 'separate')
    },
    {
      step: '2',
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

  return (
    <motion.div
      initial={{opacity: 0, scale: 0.95}}
      animate={{opacity: 1, scale: 1}}
      transition={{duration: 0.5, type: 'spring', stiffness: 100}}
      className="mx-auto w-full max-w-4xl">
      <Card className="overflow-hidden bg-white rounded-3xl border-0 shadow-sm">
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

            <div className="flex items-center px-4 py-2 mb-4 space-x-3 bg-white rounded-xl border border-blue-200 shadow-sm transition-all hover:bg-blue-50">
              {/* 토글 스위치 */}
              <Switch
                checked={productEnabled}
                onCheckedChange={handleProductToggle}
                className="data-[state=checked]:bg-blue-500"
              />

              {/* 라벨 */}
              <span
                className={`text-sm font-medium transition-colors ${
                  productEnabled ? 'text-blue-600' : 'text-gray-500'
                }`}>
                제품 관련 정보 입력
              </span>
              {/* 상태 표시 */}
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                  productEnabled
                    ? 'text-blue-700 bg-blue-100'
                    : 'text-gray-500 bg-gray-100'
                }`}>
                {productEnabled ? '활성' : '비활성'}
              </span>
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
                      value={state[field.key] || ''}
                      onChange={handleChange(field.key)}
                      placeholder={field.placeholder}
                      className="px-4 py-2 w-full text-sm rounded-xl border-2 border-gray-200 transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300"
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
                    <span className="flex justify-center items-center w-7 h-7 text-xs font-bold text-white bg-blue-500 rounded-full">
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
                    className="px-4 py-3 w-full text-sm rounded-xl border-2 border-gray-200 transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed">
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
                    <span className="flex justify-center items-center w-7 h-7 text-xs font-bold text-white bg-blue-500 rounded-full">
                      {field.step}
                    </span>
                    <field.icon className="w-4 h-4 text-blue-500" />
                    <label className="text-sm font-semibold text-gray-700">
                      {field.label}
                    </label>
                  </div>

                  {/* 정보 표시 필드 */}
                  <div className="px-4 py-3 text-sm bg-gray-100 rounded-xl border-2 border-gray-200 min-h-12">
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
                <span className="flex justify-center items-center w-7 h-7 text-xs font-bold text-white bg-blue-500 rounded-full">
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
            <div className="overflow-hidden relative p-6 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 rounded-2xl border-2 border-blue-200 shadow-md">
              {/* 배경 장식 */}
              <div className="absolute top-2 right-2 w-16 h-16 bg-blue-300 rounded-full opacity-20 blur-xl" />
              <div className="absolute bottom-2 left-2 w-12 h-12 bg-blue-400 rounded-lg transform rotate-12 opacity-15" />

              <div className="flex relative justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="flex justify-center items-center w-12 h-12 bg-blue-500 rounded-xl shadow-md">
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
