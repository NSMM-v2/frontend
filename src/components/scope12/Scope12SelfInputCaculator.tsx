// 수동 입력 계산기 컴포넌트
import React, {useEffect, useRef, useState} from 'react'
import {motion} from 'framer-motion'
import {Card, CardContent} from '@/components/ui/card'
import {Input} from '../ui/input'
import {
  Layers,
  Tag,
  Zap,
  Ruler,
  Calculator,
  Hash,
  TrendingUp,
  Cog,
  Building2
} from 'lucide-react'
import type {SelectorState} from '@/types/scopeTypes'
import {showWarning} from '@/util/toast'
import {Switch} from '../ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type {
  AssignedMaterialCode,
  MaterialCodeMapping,
  HierarchicalMaterialCodeState
} from '@/types/partnerCompanyType'

interface SelfInputCalculatorProps {
  id: number
  state: SelectorState
  onChangeState: (state: SelectorState) => void
  onChangeTotal: (id: number, emission: number) => void
}

export function SelfInputScope12Calculator({
  id,
  state,
  onChangeState,
  onChangeTotal
}: SelfInputCalculatorProps) {
  // 상태 관리 및 배출량 계산 (State Management & Calculation)

  const prevEmissionRef = useRef<number>(-1) // 이전 배출량 값 저장

  /**
   * 안전한 배출량 계산 함수 (정밀도 손실 방지 및 최대값 검증)
   */
  const calculateSafeEmission = () => {
    const qty = parseFloat(state.quantity || '0')
    const factor = parseFloat(state.kgCO2eq || '0')

    if (isNaN(qty) || isNaN(factor) || qty < 0 || factor < 0) {
      return 0
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

    if (prevEmissionRef.current !== emission) {
      onChangeTotal(id, emission)
      prevEmissionRef.current = emission
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
      const newValue = e.target.value
      const newState = {...state, [key]: newValue}

      onChangeState(newState)

      // 제품 정보 필드 변경 시 토글 상태 자동 업데이트
      if (key === 'productName' || key === 'productCode') {
        setProductEnabled(!!(newState.productName || newState.productCode))
      }
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
      if (!/^\d*\.?\d*$/.test(val)) {
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

  const basicInfoFields = [
    {
      step: '1',
      label: '구분',
      key: 'separate' as keyof SelectorState,
      type: 'text',
      placeholder: '예: 원료 및 에너지 생산',
      icon: Tag,
      description: '세부 구분을 입력하세요'
    },
    {
      step: '2',
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
      step: '3',
      label: '단위',
      key: 'unit' as keyof SelectorState,
      type: 'text',
      placeholder: '예: kg, ton, kWh, m³',
      icon: Ruler,
      description: '수량의 단위를 입력하세요'
    },
    {
      step: '4',
      label: '배출계수',
      key: 'kgCO2eq' as keyof SelectorState,
      type: 'number',
      placeholder: '0.000000',
      icon: Calculator,
      description: 'kgCO₂ equivalent 값 (최대 9자리.소수점6자리)',
      maxInfo: '최대: 999,999,999.999999'
    },
    {
      step: '5',
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
  const [productEnabled, setProductEnabled] = useState(
    !!(state.productName || state.productCode)
  )

  // 계층적 자재코드 관리 상태
  const [assignedMaterialCodes, setAssignedMaterialCodes] = useState<
    AssignedMaterialCode[]
  >([])
  const [existingMappings, setExistingMappings] = useState<MaterialCodeMapping[]>([])
  const [hierarchicalState, setHierarchicalState] =
    useState<HierarchicalMaterialCodeState>({
      hasExistingMapping: false,
      isCreatingNewMapping: false
    })
  const [isLoadingMaterialCodes] = useState(false)

  // 더미 계층적 자재코드 데이터 (실제 구현에서는 API 호출로 대체)
  useEffect(() => {
    const dummyAssignedCodes: AssignedMaterialCode[] = [
      {
        id: '1',
        parentMaterialCode: 'HQ-A001',
        parentMaterialName: '본사 타이어 규격',
        parentCategory: 'component',
        assignedBy: 'headquarters-001',
        assignedByName: '본사',
        assignedAt: '2024-01-15T10:00:00Z',
        isActive: true
      },
      {
        id: '2',
        parentMaterialCode: 'HQ-B001',
        parentMaterialName: '본사 철강 소재',
        parentCategory: 'raw_material',
        assignedBy: 'headquarters-001',
        assignedByName: '본사',
        assignedAt: '2024-01-15T10:00:00Z',
        isActive: true
      },
      {
        id: '3',
        parentMaterialCode: 'HQ-E001',
        parentMaterialName: '본사 엔진 부품',
        parentCategory: 'component',
        assignedBy: 'headquarters-001',
        assignedByName: '본사',
        assignedAt: '2024-01-15T10:00:00Z',
        isActive: true
      }
    ]

    // const dummyExistingMappings: MaterialCodeMapping[] = [
    //   {
    //     id: 'mapping-1',
    //     parentMaterialCode: 'HQ-A001',
    //     parentMaterialName: '본사 타이어 규격',
    //     childMaterialCode: 'P1-A001',
    //     childMaterialName: '1차사 전용 타이어',
    //     partnerId: 'partner-001',
    //     partnerName: '1차 협력사',
    //     createdAt: '2024-01-20T10:00:00Z',
    //     updatedAt: '2024-01-20T10:00:00Z',
    //     isActive: true
    //   }
    // ]

    setAssignedMaterialCodes(dummyAssignedCodes)
    // setExistingMappings(dummyExistingMappings)
  }, [])

  // 제품 정보 상태 동기화
  useEffect(() => {
    setProductEnabled(!!(state.productName || state.productCode))
  }, [state.productName, state.productCode])

  // 제품 정보 토글 변경 핸들러 추가
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
  const handleAssignedMaterialCodeSelect = (parentMaterialCode: string) => {
    // 기존 매핑이 있는지 확인
    const existingMapping = existingMappings.find(
      mapping => mapping.parentMaterialCode === parentMaterialCode
    )

    if (existingMapping) {
      // 기존 매핑이 있는 경우
      setHierarchicalState({
        assignedMaterialCode: parentMaterialCode,
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
        assignedMaterialCode: parentMaterialCode,
        mappedMaterialCode: '',
        materialName: '',
        hasExistingMapping: false,
        isCreatingNewMapping: true
      })

      // 기존 상태 초기화
      onChangeState({
        ...state,
        productCode: '',
        productName: ''
      })
    }
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
            className="space-y-4">
            <div className="flex items-center pb-4 space-x-2 border-b border-gray-200">
              <Layers className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">기본 정보</h3>
              <span className="text-sm text-gray-500">ESG 데이터 분류 정보</span>
            </div>

            {/* 제품 관련 토글 - Scope 1/2 모드 토글과 동일한 스타일 적용 */}
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
              <div className="space-y-6">
                {/* 1. 상위 협력사 지정 자재코드 드롭다운 */}
                <div>
                  <div className="flex items-center mb-3 space-x-2">
                    <div className="flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full">
                      <span className="text-xs font-bold text-purple-600">1</span>
                    </div>
                    <Building2 className="w-4 h-4 text-purple-500" />
                    <label className="text-sm font-semibold text-gray-700">
                      상위 협력사 지정 자재코드
                    </label>
                  </div>
                  <Select
                    value={hierarchicalState.assignedMaterialCode || ''}
                    onValueChange={handleAssignedMaterialCodeSelect}
                    disabled={isLoadingMaterialCodes}>
                    <SelectTrigger className="w-full px-4 py-2 text-sm transition-all duration-200 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-purple-300">
                      <SelectValue placeholder="상위에서 할당받은 자재코드를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignedMaterialCodes.map(assigned => (
                        <SelectItem key={assigned.id} value={assigned.parentMaterialCode}>
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {assigned.parentMaterialCode}
                            </span>
                            <span className="text-xs text-gray-500">
                              {assigned.parentMaterialName}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-2 text-xs text-gray-500">
                    {hierarchicalState.assignedMaterialCode
                      ? `선택됨: ${
                          assignedMaterialCodes.find(
                            a =>
                              a.parentMaterialCode ===
                              hierarchicalState.assignedMaterialCode
                          )?.parentMaterialName
                        }`
                      : '상위 협력사에서 할당받은 자재코드 중에서 선택하세요'}
                  </p>
                </div>

                {/* 2. 연결된 자재코드 */}
                {hierarchicalState.assignedMaterialCode && (
                  <div>
                    <div className="flex items-center mb-3 space-x-2">
                      <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                        <span className="text-xs font-bold text-green-600">2</span>
                      </div>
                      <Tag className="w-4 h-4 text-green-500" />
                      <label className="text-sm font-semibold text-gray-700">
                        연결된 자재코드
                      </label>
                      {hierarchicalState.hasExistingMapping && (
                        <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                          기존 매핑
                        </span>
                      )}
                      {hierarchicalState.isCreatingNewMapping && (
                        <span className="px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                          새 매핑 생성
                        </span>
                      )}
                    </div>
                    <Input
                      type="text"
                      value={hierarchicalState.mappedMaterialCode || ''}
                      onChange={handleMappedMaterialCodeChange}
                      placeholder="내 자재코드를 입력하세요 (예: P1-A001)"
                      disabled={hierarchicalState.hasExistingMapping}
                      className={`w-full px-4 py-2 text-sm transition-all duration-200 border-2 rounded-xl focus:ring-4 ${
                        hierarchicalState.hasExistingMapping
                          ? 'border-blue-200 bg-blue-50 text-blue-700 cursor-not-allowed'
                          : 'border-green-200 focus:border-green-500 focus:ring-green-100 hover:border-green-300'
                      }`}
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      {hierarchicalState.hasExistingMapping
                        ? '이미 매핑된 자재코드입니다. 수정하려면 자재코드 관리에서 변경하세요.'
                        : '상위 자재코드와 연결될 내 자재코드를 입력하세요'}
                    </p>
                  </div>
                )}

                {/* 3. 자재명 */}
                {hierarchicalState.assignedMaterialCode && (
                  <div>
                    <div className="flex items-center mb-3 space-x-2">
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
                        <span className="text-xs font-bold text-blue-600">3</span>
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
                      placeholder="자재명을 입력하세요 (예: 1차사 전용 타이어)"
                      disabled={hierarchicalState.hasExistingMapping}
                      className={`w-full px-4 py-2 text-sm transition-all duration-200 border-2 rounded-xl focus:ring-4 ${
                        hierarchicalState.hasExistingMapping
                          ? 'border-blue-200 bg-blue-50 text-blue-700 cursor-not-allowed'
                          : 'border-blue-200 focus:border-blue-500 focus:ring-blue-100 hover:border-blue-300'
                      }`}
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      {hierarchicalState.hasExistingMapping
                        ? '기존 매핑의 자재명입니다.'
                        : '해당 자재의 명칭을 입력하세요'}
                    </p>
                  </div>
                )}

                {/* 매핑 관계 시각화 */}
                {hierarchicalState.assignedMaterialCode &&
                  hierarchicalState.mappedMaterialCode &&
                  hierarchicalState.materialName && (
                    <div className="p-4 border-2 border-indigo-200 rounded-xl bg-indigo-50">
                      <h4 className="flex items-center gap-2 mb-3 text-sm font-semibold text-indigo-700">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        자재코드 매핑 관계
                      </h4>
                      <div className="flex items-center justify-between p-3 bg-white border border-indigo-200 rounded-lg">
                        <div className="text-center">
                          <div className="text-xs font-medium text-gray-500">
                            상위 자재코드
                          </div>
                          <div className="font-semibold text-indigo-600">
                            {hierarchicalState.assignedMaterialCode}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-0.5 bg-indigo-300"></div>
                          <div className="w-2 h-2 mx-1 bg-indigo-500 rounded-full"></div>
                          <div className="w-4 h-0.5 bg-indigo-300"></div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-medium text-gray-500">
                            내 자재코드
                          </div>
                          <div className="font-semibold text-indigo-600">
                            {hierarchicalState.mappedMaterialCode}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-0.5 bg-indigo-300"></div>
                          <div className="w-2 h-2 mx-1 bg-indigo-500 rounded-full"></div>
                          <div className="w-4 h-0.5 bg-indigo-300"></div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-medium text-gray-500">자재명</div>
                          <div className="font-semibold text-indigo-600">
                            {hierarchicalState.materialName}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            )}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    value={state[field.key] || ''}
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

                  {/* 입력 필드 */}
                  <Input
                    type={field.type}
                    inputMode={field.type === 'number' ? 'decimal' : undefined}
                    value={state[field.key] || ''}
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
                    {calculatedEmission.toLocaleString(undefined, {
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
                    {calculatedEmission.toLocaleString()} kgCO₂
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
