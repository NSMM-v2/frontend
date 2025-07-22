// 엑셀 데이터 기반 계단식 선택기 컴포넌트
// CSV 데이터에서 배출계수 정보 로드, 계단식 선택을 통한 배출계수 자동 선택, 실시간 배출량 계산

import React, {useState, useEffect, useRef, useMemo} from 'react'
import Papa from 'papaparse'
import {motion} from 'framer-motion'
import {Card, CardContent} from '@/components/ui/card'
import {
  Layers,
  Tag,
  Zap,
  Ruler,
  Calculator,
  Hash,
  TrendingUp,
  Cog,
  Building2,
  AlertCircle,
  Package
} from 'lucide-react'
import type {SelectorState} from '@/types/scopeTypes'
import {Switch} from '../ui/switch'
import {Input} from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {materialAssignmentService} from '@/services/materialAssignmentService'
import type {MaterialAssignmentResponse} from '@/types/partnerCompanyType'
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
  materialState?: string // 상태 (예: 액체, 고체 등)
  scopeCategory?: string // ESG Scope 분류 (추정)
}
type SeparateFilterRule = {include: string[]} | {exclude: string[]} | undefined
type StateFilterRule = {include: string[]} | {exclude: string[]} | undefined

// HierarchicalMaterialCodeState 타입 정의 (기존 MaterialCodeMapping은 서비스에서 가져옴)
interface HierarchicalMaterialCodeState {
  assignedMaterialCode?: string
  mappedMaterialCode?: string
  materialName?: string
  hasExistingMapping: boolean
  isCreatingNewMapping: boolean
}
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
  // 상태 관리
  const [data, setData] = useState<CO2Data[]>([])
  const [selectedItem, setSelectedItem] = useState<CO2Data | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const prevSelectedItemRef = useRef<CO2Data | null>(null)
  const isFirstRenderRef = useRef(true)

  // 제품 관련 상태
  const [productEnabled, setProductEnabled] = useState(
    !!(state.productName || state.productCode)
  )

  // 계층적 자재코드 관리 상태
  const [assignedMaterialCodes, setAssignedMaterialCodes] = useState<
    MaterialAssignmentResponse[]
  >([])
  const [existingMappings, setExistingMappings] = useState<any[]>([])
  const [hierarchicalState, setHierarchicalState] =
    useState<HierarchicalMaterialCodeState>({
      hasExistingMapping: false,
      isCreatingNewMapping: false
    })
  const [isLoadingMaterialCodes, setIsLoadingMaterialCodes] = useState(true)
  const [materialCodesError, setMaterialCodesError] = useState<string | null>(null)

  // 자재코드 정보 Popover 상태
  const [selectedMaterialForInfo, setSelectedMaterialForInfo] =
    useState<MaterialAssignmentResponse | null>(null)
  const [isMaterialInfoPopoverOpen, setIsMaterialInfoPopoverOpen] = useState(false)

  // 데이터 로딩 및 초기 상태 복원

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
            kgCO2eq: parseFloat(row['탄소발자국 (CO2e)']) || 0,
            materialState: row['종류'],
            scopeCategory: row['ESG Scope 분류 (추정)']
          }))

        setData(parsed)

        // CSV 데이터 로딩 완료 후 초기 상태 복원
        if (state.separate && state.rawMaterial && !isInitialized) {
          restoreInitialSelection(parsed)
        }

        setIsInitialized(true)
      } catch (error) {
        setData([])
        setIsInitialized(true)
      }
    }

    loadCSVData()
  }, [])

  // 실제 자재코드 데이터 API 호출
  useEffect(() => {
    const fetchMaterialData = async () => {
      try {
        setIsLoadingMaterialCodes(true)
        setMaterialCodesError(null)

        console.log('자재코드 데이터 로딩 시작...')
        const data = await materialAssignmentService.getMyMaterialData()
        console.log('자재코드 데이터 로딩 성공:', data)
        setAssignedMaterialCodes(data)
      } catch (error) {
        console.error('자재 데이터 로딩 실패:', error)
        setMaterialCodesError(
          error instanceof Error ? error.message : '자재 데이터를 불러올 수 없습니다'
        )
        setAssignedMaterialCodes([])
      } finally {
        setIsLoadingMaterialCodes(false)
      }
    }

    fetchMaterialData()
  }, [])

  // 제품 정보 상태 동기화
  useEffect(() => {
    setProductEnabled(!!(state.productName || state.productCode))
  }, [state.productName, state.productCode])

  // 백엔드에서 불러온 데이터로 초기 선택 상태 복원
  const restoreInitialSelection = (csvData: CO2Data[]) => {
    if (!state.separate || !state.rawMaterial) return

    // CSV 데이터에서 매칭되는 항목 찾기
    const matchingItem = csvData.find(
      item => item.separate === state.separate && item.RawMaterial === state.rawMaterial
    )

    if (matchingItem) {
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
    }
  }

  const unique = (arr: string[]) => [...new Set(arr.filter(Boolean))]

  const separateFilterMap: Record<typeof activeCategory, SeparateFilterRule> = {
    list1: undefined, // 예시
    list2: undefined, // list2는 필터링 안 함 → 전체 표시
    list3: undefined, // list3는 에너지, 육상수송, 항공수송, 해상수송만 표시
    list4: undefined,
    list5: undefined,
    list6: undefined, // list6는 필터링 안 함 → 전체 표시
    list7: undefined, // list7는 필터링 안 함 → 전체 표시
    list8: {include: ['매립', '소각']},
    list9: undefined, // list9는 필터링 안 함 → 전체 표시
    list10: undefined, // list15는 필터링 안 함 → 전체 표시
    list11: undefined,
    list12: undefined
  }
  const scopeCategoryFilterMap: Record<typeof activeCategory, SeparateFilterRule> = {
    list1: {include: ['고정']}, // 예시
    list2: {include: ['고정']}, // list2는 필터링 안 함 → 전체 표시
    list3: {include: ['고정']}, // list3는 에너지, 육상수송, 항공수송, 해상수송만 표시
    list4: {include: ['이동']},
    list5: {include: ['이동']},
    list6: {include: ['이동']}, // list6는 필터링 안 함 → 전체 표시
    list7: {include: ['공정']}, // list7는 필터링 안 함 → 전체 표시
    list8: {include: ['공정']},
    list9: {include: ['냉매']}, // list9는 필터링 안 함 → 전체 표시
    list10: {include: ['냉매']}, // list15는 필터링 안 함 → 전체 표시
    list11: {include: ['전기']},
    list12: {include: ['스팀']}
  }
  const stateFilterMap: Record<typeof activeCategory, StateFilterRule> = {
    list1: {include: ['액체']}, // 예시
    list2: {include: ['기체']}, // list2는 필터링 안 함 → 전체 표시
    list3: {include: ['고체']}, // list3는 에너지, 육상수송, 항공수송, 해상수송만 표시
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
    const validSeparates = unique(
      data
        .filter(item => {
          // 1️⃣ scopeCategory 조건
          const scopeRule = scopeCategoryFilterMap[activeCategory]
          const scopeOK = scopeRule
            ? 'include' in scopeRule
              ? scopeRule.include.some(inc =>
                  (item.scopeCategory || '').trim().includes(inc)
                )
              : scopeRule.exclude.every(
                  exc => !(item.scopeCategory || '').trim().includes(exc)
                )
            : true

          // 2️⃣ materialState 조건
          const stateRule = stateFilterMap[activeCategory]
          const stateOK = stateRule
            ? 'include' in stateRule
              ? stateRule.include.includes((item.materialState || '').trim())
              : !stateRule.exclude.includes((item.materialState || '').trim())
            : true

          // 3️⃣ separateFilterMap 조건
          const separateRule = separateFilterMap[activeCategory]
          const separateOK = separateRule
            ? 'include' in separateRule
              ? separateRule.include.some(inc =>
                  (item.separate || '').trim().includes(inc)
                )
              : separateRule.exclude.every(
                  exc => !(item.separate || '').trim().includes(exc)
                )
            : true

          return scopeOK && stateOK && separateOK
        })
        .map(item => item.separate)
    )

    return validSeparates
  }, [data, activeCategory])

  const rawMaterialList = useMemo(() => {
    // 1️⃣ 먼저 선택된 separate로 필터링
    let filtered = data.filter(d => d.separate === state.separate)

    // 2️⃣ scopeCategoryFilterMap 규칙 적용 (separate처럼)
    const separateRule = scopeCategoryFilterMap[activeCategory]
    if (separateRule) {
      if ('include' in separateRule) {
        filtered = filtered.filter(d =>
          separateRule.include.some(inc => (d.scopeCategory || '').includes(inc))
        )
      } else if ('exclude' in separateRule) {
        filtered = filtered.filter(d =>
          separateRule.exclude.every(exc => !(d.scopeCategory || '').includes(exc))
        )
      }
    }

    // 3️⃣ 상태 필터 (기존)
    const stateRule = stateFilterMap[activeCategory]
    if (stateRule) {
      if ('include' in stateRule) {
        filtered = filtered.filter(d => stateRule.include.includes(d.materialState || ''))
      } else if ('exclude' in stateRule) {
        filtered = filtered.filter(
          d => !stateRule.exclude.includes(d.materialState || '')
        )
      }
    }

    return unique(filtered.map(d => d.RawMaterial))
  }, [data, state.separate, activeCategory])

  // 선택된 아이템 및 배출량 계산

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

  // 이벤트 핸들러 (Event Handlers)
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

  // 상위 협력사 자재코드 선택 핸들러
  const handleAssignedMaterialCodeSelect = (materialCode: string) => {
    // 선택된 자재코드 찾기
    const selectedMaterial = assignedMaterialCodes.find(
      material => material.materialCode === materialCode
    )

    if (!selectedMaterial) return

    // 기존 매핑이 있는지 확인
    const existingMapping = existingMappings.find(
      mapping => mapping.parentMaterialCode === materialCode
    )

    if (existingMapping) {
      // 기존 매핑이 있는 경우
      setHierarchicalState({
        assignedMaterialCode: materialCode,
        mappedMaterialCode: existingMapping.childMaterialCode,
        materialName: existingMapping.childMaterialName,
        hasExistingMapping: true,
        isCreatingNewMapping: false
      })

      // 상태 업데이트
      onChangeState({
        ...state,
        productCode: existingMapping.childMaterialCode,
        productName: existingMapping.childMaterialName
      })
    } else {
      // 새로운 매핑이 필요한 경우
      setHierarchicalState({
        assignedMaterialCode: materialCode,
        mappedMaterialCode: '',
        materialName: selectedMaterial.materialName,
        hasExistingMapping: false,
        isCreatingNewMapping: true
      })

      // 기존 상태 초기화 (자재명은 선택된 자재의 이름으로 설정)
      onChangeState({
        ...state,
        productCode: '',
        productName: selectedMaterial.materialName
      })
    }

    // Popover에 표시할 선택된 자재 정보 설정
    setSelectedMaterialForInfo(selectedMaterial)
  }

  // 연결된 자재코드 입력 핸들러
  const handleMappedMaterialCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mappedCode = e.target.value
    setHierarchicalState(prev => ({
      ...prev,
      mappedMaterialCode: mappedCode
    }))

    onChangeState({
      ...state,
      productCode: mappedCode
    })
  }

  // 자재명 입력 핸들러
  const handleMaterialNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const materialName = e.target.value
    setHierarchicalState(prev => ({
      ...prev,
      materialName
    }))

    onChangeState({
      ...state,
      productName: materialName
    })
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

  // 입력 필드 설정 데이터 (Input Field Configuration)
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
      className="w-full max-w-4xl mx-auto">
      <Card className="overflow-hidden bg-white border-0 shadow-sm rounded-3xl">
        {/* ======================================================================
            카드 헤더 (Card Header)
            ====================================================================== */}

        <CardContent className="p-8 space-y-8">
          {/* ====================================================================
              기본 정보 섹션 (Basic Information Section)
              ==================================================================== */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.1, duration: 0.4}}
            className="space-y-4">
            <div className="flex items-center pb-4 space-x-2 border-b border-gray-200">
              <Layers className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">기본 정보</h3>
              <span className="text-sm text-gray-500">ESG 데이터 분류 정보</span>
            </div>

            {/* 제품 관련 토글 */}
            <div className="flex items-center px-4 py-3 mb-4 space-x-3 transition-all bg-white border border-blue-200 shadow-sm rounded-xl hover:bg-blue-50">
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

            {/* 계층적 자재코드 필드 렌더링 */}
            {productEnabled && (
              <div className="space-y-4">
                {/* 한 줄로 배치된 자재코드 필드들 */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* 1. 상위 협력사 지정 자재코드 드롭다운 */}
                  <div>
                    <div className="flex items-center mb-2 space-x-2">
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                        <span className="text-xs font-bold text-white">1</span>
                      </div>
                      <Building2 className="w-4 h-4 text-blue-500" />
                      <label className="text-sm font-semibold text-gray-700">
                        할당된 자재코드
                      </label>
                      <Popover
                        open={isMaterialInfoPopoverOpen}
                        onOpenChange={setIsMaterialInfoPopoverOpen}>
                        <PopoverTrigger asChild>
                          <AlertCircle className="w-4 h-4 text-blue-500 transition-colors cursor-pointer hover:text-blue-700" />
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          {selectedMaterialForInfo ? (
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                                <Package className="w-5 h-5 text-blue-500" />
                                <h4 className="text-lg font-semibold text-gray-900">
                                  자재코드 정보
                                </h4>
                              </div>

                              <div className="space-y-4">
                                {/* 자재코드 */}
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                                      <span className="text-xs font-bold text-white">
                                        1
                                      </span>
                                    </span>
                                    <Package className="w-4 h-4 text-blue-500" />
                                    <label className="text-sm font-semibold text-gray-700">
                                      자재코드
                                    </label>
                                  </div>
                                  <div className="px-4 py-3 font-mono text-sm font-bold text-gray-900 transition-all duration-200 border-2 border-gray-200 rounded-xl bg-gray-50">
                                    {selectedMaterialForInfo.materialCode}
                                  </div>
                                </div>

                                {/* 자재명 */}
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                                      <span className="text-xs font-bold text-white">
                                        2
                                      </span>
                                    </span>
                                    <Tag className="w-4 h-4 text-blue-500" />
                                    <label className="text-sm font-semibold text-gray-700">
                                      자재명
                                    </label>
                                  </div>
                                  <div className="px-4 py-3 text-sm font-semibold text-gray-900 transition-all duration-200 border-2 border-gray-200 rounded-xl bg-gray-50">
                                    {selectedMaterialForInfo.materialName}
                                  </div>
                                </div>

                                {/* 카테고리 */}
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                                      <span className="text-xs font-bold text-white">
                                        3
                                      </span>
                                    </span>
                                    <Cog className="w-4 h-4 text-blue-500" />
                                    <label className="text-sm font-semibold text-gray-700">
                                      카테고리
                                    </label>
                                  </div>
                                  <div className="px-4 py-3 text-sm font-medium text-gray-900 transition-all duration-200 border-2 border-gray-200 rounded-xl bg-gray-50">
                                    {(() => {
                                      if (!selectedMaterialForInfo.materialCategory)
                                        return '-'

                                      const categoryMap = {
                                        raw_material: '원자재',
                                        component: '부품',
                                        assembly: '조립품',
                                        finished_goods: '완제품',
                                        packaging: '포장재',
                                        consumables: '소모품',
                                        other: '기타'
                                      }

                                      return (
                                        categoryMap[
                                          selectedMaterialForInfo.materialCategory as keyof typeof categoryMap
                                        ] || selectedMaterialForInfo.materialCategory
                                      )
                                    })()}
                                  </div>
                                </div>

                                {/* 설명 */}
                                {selectedMaterialForInfo.materialDescription ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <span className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                                        <span className="text-xs font-bold text-white">
                                          4
                                        </span>
                                      </span>
                                      <AlertCircle className="w-4 h-4 text-blue-500" />
                                      <label className="text-sm font-semibold text-gray-700">
                                        설명
                                      </label>
                                    </div>
                                    <div className="px-4 py-3 text-sm leading-relaxed text-gray-900 transition-all duration-200 border-2 border-gray-200 rounded-xl bg-gray-50">
                                      {selectedMaterialForInfo.materialDescription}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <span className="flex items-center justify-center w-6 h-6 bg-gray-400 rounded-full">
                                        <span className="text-xs font-bold text-white">
                                          4
                                        </span>
                                      </span>
                                      <AlertCircle className="w-4 h-4 text-gray-400" />
                                      <label className="text-sm font-semibold text-gray-500">
                                        설명
                                      </label>
                                    </div>
                                    <div className="flex items-center justify-center px-4 py-3 text-sm text-gray-500 transition-all duration-200 border-2 border-gray-200 border-dashed rounded-xl bg-gray-50">
                                      <AlertCircle className="w-4 h-4 mr-2" />
                                      추가 설명이 없습니다
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                                <Package className="w-5 h-5 text-gray-400" />
                                <h4 className="text-lg font-semibold text-gray-500">
                                  자재코드 정보
                                </h4>
                              </div>
                              <div className="flex items-center justify-center px-4 py-6 text-sm text-gray-500 transition-all duration-200 border-2 border-gray-200 border-dashed rounded-xl bg-gray-50">
                                <AlertCircle className="w-5 h-5 mr-2" />
                                자재코드를 먼저 선택해주세요
                              </div>
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* 로딩 상태 */}
                    {isLoadingMaterialCodes && (
                      <div className="flex items-center gap-2 p-2 text-gray-600 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="w-3 h-3 border border-gray-300 rounded-full border-t-blue-500 animate-spin"></div>
                        <span className="text-xs">로딩 중...</span>
                      </div>
                    )}

                    {/* 에러 상태 */}
                    {materialCodesError && (
                      <div className="flex items-center gap-2 p-2 text-red-600 border border-red-200 rounded-lg bg-red-50">
                        <AlertCircle className="w-3 h-3" />
                        <span className="text-xs">{materialCodesError}</span>
                      </div>
                    )}

                    {/* 빈 상태 */}
                    {!isLoadingMaterialCodes &&
                      !materialCodesError &&
                      assignedMaterialCodes.length === 0 && (
                        <div className="flex items-center gap-2 p-2 border rounded-lg text-amber-600 bg-amber-50 border-amber-200">
                          <AlertCircle className="w-3 h-3" />
                          <span className="text-xs">할당된 자재 코드가 없습니다</span>
                        </div>
                      )}

                    {/* 자재코드 선택 드롭다운 */}
                    {!isLoadingMaterialCodes &&
                      !materialCodesError &&
                      assignedMaterialCodes.length > 0 && (
                        <Select
                          value={hierarchicalState.assignedMaterialCode || ''}
                          onValueChange={handleAssignedMaterialCodeSelect}
                          disabled={isLoadingMaterialCodes}>
                          <SelectTrigger className="w-full px-4 py-3 text-sm transition-all duration-200 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300">
                            <SelectValue placeholder="자재코드 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            {assignedMaterialCodes.map(assigned => (
                              <SelectItem key={assigned.id} value={assigned.materialCode}>
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold">
                                    {assigned.materialCode}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {assigned.materialName}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                    <p className="mt-1 text-xs text-gray-500">
                      {hierarchicalState.assignedMaterialCode
                        ? `선택됨: ${
                            assignedMaterialCodes.find(
                              a =>
                                a.materialCode === hierarchicalState.assignedMaterialCode
                            )?.materialName || ''
                          }`
                        : assignedMaterialCodes.length > 0
                        ? '상위 협력사 자재코드'
                        : ''}
                    </p>
                  </div>

                  {/* 2. 연결된 자재코드 */}
                  {hierarchicalState.assignedMaterialCode && (
                    <div>
                      <div className="flex items-center mb-2 space-x-2">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                          <span className="text-xs font-bold text-white">2</span>
                        </div>
                        <Tag className="w-4 h-4 text-blue-500" />
                        <label className="text-sm font-semibold text-gray-700">
                          연결된 자재코드
                        </label>
                        {hierarchicalState.hasExistingMapping && (
                          <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                            기존
                          </span>
                        )}
                        {hierarchicalState.isCreatingNewMapping && (
                          <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                            신규
                          </span>
                        )}
                      </div>
                      <Input
                        type="text"
                        value={hierarchicalState.mappedMaterialCode || ''}
                        onChange={handleMappedMaterialCodeChange}
                        placeholder="내 자재코드 (예: P1-A001)"
                        disabled={hierarchicalState.hasExistingMapping}
                        className={`w-full px-4 py-3 text-sm transition-all duration-200 border-2 rounded-xl focus:ring-4 ${
                          hierarchicalState.hasExistingMapping
                            ? 'border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed'
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100 hover:border-gray-300'
                        }`}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {hierarchicalState.hasExistingMapping
                          ? '기존 매핑된 코드'
                          : '내 자재코드 입력'}
                      </p>
                    </div>
                  )}

                  {/* 3. 자재명 */}
                  {hierarchicalState.assignedMaterialCode && (
                    <div>
                      <div className="flex items-center mb-2 space-x-2">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                          <span className="text-xs font-bold text-white">3</span>
                        </div>
                        <Cog className="w-4 h-4 text-blue-500" />
                        <label className="text-sm font-semibold text-gray-700">
                          자재명
                        </label>
                      </div>
                      <Input
                        type="text"
                        value={hierarchicalState.materialName || ''}
                        onChange={handleMaterialNameChange}
                        placeholder="자재명 (예: 1차사 전용 타이어)"
                        disabled={hierarchicalState.hasExistingMapping}
                        className={`w-full px-4 py-3 text-sm transition-all duration-200 border-2 rounded-xl focus:ring-4 ${
                          hierarchicalState.hasExistingMapping
                            ? 'border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed'
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100 hover:border-gray-300'
                        }`}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {hierarchicalState.hasExistingMapping
                          ? '기존 매핑의 자재명'
                          : '자재 명칭 입력'}
                      </p>
                    </div>
                  )}
                </div>

                {/* 매핑 관계 시각화 - 컴팩트 버전 */}
                {hierarchicalState.assignedMaterialCode &&
                  hierarchicalState.mappedMaterialCode &&
                  hierarchicalState.materialName && (
                    <div className="p-3 border-2 border-indigo-200 rounded-lg bg-indigo-50">
                      <h4 className="flex items-center gap-2 mb-2 text-xs font-semibold text-indigo-700">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                        자재코드 매핑 관계
                      </h4>
                      <div className="flex items-center justify-between p-2 bg-white border border-indigo-200 rounded-lg">
                        <div className="flex-1 text-center">
                          <div className="text-xs font-medium text-gray-500">상위</div>
                          <div className="text-xs font-semibold text-indigo-600 truncate">
                            {hierarchicalState.assignedMaterialCode}
                          </div>
                        </div>
                        <div className="flex items-center px-2">
                          <div className="w-2 h-0.5 bg-indigo-300"></div>
                          <div className="w-1 h-1 mx-1 bg-indigo-500 rounded-full"></div>
                          <div className="w-2 h-0.5 bg-indigo-300"></div>
                        </div>
                        <div className="flex-1 text-center">
                          <div className="text-xs font-medium text-gray-500">내 코드</div>
                          <div className="text-xs font-semibold text-indigo-600 truncate">
                            {hierarchicalState.mappedMaterialCode}
                          </div>
                        </div>
                        <div className="flex items-center px-2">
                          <div className="w-2 h-0.5 bg-indigo-300"></div>
                          <div className="w-1 h-1 mx-1 bg-indigo-500 rounded-full"></div>
                          <div className="w-2 h-0.5 bg-indigo-300"></div>
                        </div>
                        <div className="flex-1 text-center">
                          <div className="text-xs font-medium text-gray-500">자재명</div>
                          <div className="text-xs font-semibold text-indigo-600 truncate">
                            {hierarchicalState.materialName}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </motion.div>

          {/* ====================================================================
              분류 선택 섹션 (Category Selection Section)
              ==================================================================== */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.3, duration: 0.4}}
            className="space-y-6">
            <div className="flex items-center pb-4 space-x-2 border-b border-gray-200">
              <Tag className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">분류 선택</h3>
              <span className="text-sm text-gray-500">배출계수 데이터 선택</span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {selectionFields.map((field, index) => (
                <motion.div
                  key={field.step}
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: 0.4 + index * 0.1, duration: 0.4}}
                  className="space-y-2">
                  {/* 필드 라벨 */}
                  <div className="flex items-center mb-2 space-x-2">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                      <span className="text-xs font-bold text-white">{field.step}</span>
                    </div>
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
                    className="w-full px-4 py-3 text-sm transition-all duration-200 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed min-h-12">
                    <option value="">{field.placeholder}</option>
                    {field.options.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  {/* 설명 텍스트 */}
                  <p className="mt-1 text-xs text-gray-500">{field.description}</p>
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {infoFields.map((field, index) => (
                <motion.div
                  key={field.step}
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: 0.7 + index * 0.1, duration: 0.4}}
                  className="space-y-2">
                  {/* 필드 라벨 */}
                  <div className="flex items-center mb-2 space-x-2">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                      <span className="text-xs font-bold text-white">{field.step}</span>
                    </div>
                    <field.icon className="w-4 h-4 text-blue-500" />
                    <label className="text-sm font-semibold text-gray-700">
                      {field.label}
                    </label>
                  </div>

                  {/* 정보 표시 필드 */}
                  <div className="px-4 py-3 text-sm transition-all duration-200 border-2 border-gray-200 rounded-xl bg-gray-50 min-h-12">
                    {field.value}
                    {field.unit && (
                      <span className="ml-1 text-xs text-gray-500">{field.unit}</span>
                    )}
                  </div>

                  {/* 설명 텍스트 */}
                  <p className="mt-1 text-xs text-gray-500">{field.description}</p>
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
              className="space-y-2">
              {/* 필드 라벨 */}
              <div className="flex items-center mb-2 space-x-2">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                  <span className="text-xs font-bold text-white">6</span>
                </div>
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
                className={`px-4 py-3 w-full text-sm rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-blue-100 min-h-12 ${
                  !state.rawMaterial
                    ? 'border-gray-200 bg-gray-100 cursor-not-allowed text-gray-500'
                    : 'border-gray-200 hover:border-gray-300 focus:border-blue-500'
                }`}
                placeholder={
                  state.rawMaterial ? '수량을 입력하세요' : '먼저 원료를 선택하세요'
                }
              />

              {/* 설명 텍스트 */}
              <p className="mt-1 text-xs text-gray-500">
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
