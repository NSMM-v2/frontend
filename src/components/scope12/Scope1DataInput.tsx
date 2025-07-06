// Scope 1 데이터 입력 컴포넌트
// 고정연소/이동연소 배출량 데이터 입력, 계산기 추가/삭제, 실시간 배출량 계산, 백엔드 API 연동
'use client'

// React 및 애니메이션 라이브러리 임포트
import React, {useState, useEffect} from 'react'
import {motion, AnimatePresence} from 'framer-motion'

// UI 아이콘 임포트
import {
  Plus, // 플러스 아이콘 (추가)
  Trash2, // 삭제 아이콘
  Save, // 저장 아이콘
  Sparkles, // LCA 모드용 아이콘 추가
  Database, // 수동 입력 모드용 아이콘 추가
  AlertTriangle // 경고 아이콘 (삭제 확인용)
} from 'lucide-react'

// UI 컴포넌트 임포트
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {Switch} from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

// 커스텀 컴포넌트 임포트
import {
  Scope1PotentialCategoryKey,
  Scope1KineticCategoryKey,
  Scope1ProcessCategoryKey,
  Scope1LeakCategoryKey,
  scope1PotentialCategoryList,
  scope1KineticCategoryList,
  scope1ProcessCategoryList,
  scope1LeakCategoryList
} from '@/components/scopeTotal/Scope123CategorySelector'
import {SelfInputScope12Calculator} from '@/components/scope12/Scope12SelfInputCaculator'
import {ExcelCascadingSelector} from '@/components/scope12/Scope12ExcelCascadingSelector'

// 타입 및 서비스 임포트
import {
  SelectorState,
  ScopeEmissionResponse,
  ScopeEmissionRequest,
  ScopeEmissionUpdateRequest,
  InputType
} from '@/types/scopeTypes'
import {
  createScopeEmission,
  updateScopeEmission,
  deleteScopeEmission
} from '@/services/scopeService'
import {showSuccess, showError} from '@/util/toast'

// 타입 정의

// Scope 1 계산기 데이터 구조
interface Scope1CalculatorData {
  id: number // 식별자: emissionId(양수) 또는 임시ID(음수)
  state: SelectorState // 사용자 입력 상태
  savedData?: ScopeEmissionResponse // 백엔드에서 받은 전체 데이터 (저장된 경우에만)
}

// 컴포넌트 Props 정의
interface Scope1DataInputProps {
  activeCategory:
    | Scope1PotentialCategoryKey
    | Scope1KineticCategoryKey
    | Scope1ProcessCategoryKey
    | Scope1LeakCategoryKey
  calculators: Scope1CalculatorData[]
  getTotalEmission: (
    category:
      | Scope1PotentialCategoryKey
      | Scope1KineticCategoryKey
      | Scope1ProcessCategoryKey
      | Scope1LeakCategoryKey
  ) => number
  onAddCalculator: () => void
  onRemoveCalculator: (id: number) => void
  onUpdateCalculatorState: (id: number, newState: SelectorState) => void
  onChangeTotal: (id: number, emission: number) => void
  onComplete: () => void
  onBackToList: () => void
  calculatorModes: Record<number, boolean>
  onModeChange: (id: number, checked: boolean) => void
  selectedYear: number
  selectedMonth: number | null
  onDataChange: () => void
}

// 메인 컴포넌트

// Scope 1 데이터 입력 컴포넌트
export function Scope1DataInput({
  activeCategory,
  calculators,
  getTotalEmission,
  onAddCalculator,
  onRemoveCalculator,
  onUpdateCalculatorState,
  onChangeTotal,
  onComplete,
  onBackToList,
  calculatorModes,
  onModeChange,
  selectedYear,
  selectedMonth,
  onDataChange
}: Scope1DataInputProps) {
  // 상태 관리

  // 삭제 다이얼로그 표시 상태 관리 (각 계산기별로 개별 상태 관리)
  const [deleteDialogStates, setDeleteDialogStates] = useState<Record<number, boolean>>(
    {}
  )

  // 백엔드 API 연동 함수

  // 계산기 데이터 저장/수정 처리 (임시 ID면 생성, 양수 ID면 수정)
  const saveCalculatorData = async (
    calc: Scope1CalculatorData,
    isManualInput: boolean
  ) => {
    if (!selectedYear || !selectedMonth) {
      showError('보고연도와 보고월을 먼저 선택해주세요.')
      return
    }

    try {
      const requestData = createRequestPayload(calc, isManualInput)
      let response: ScopeEmissionResponse

      if (isTemporaryId(calc.id)) {
        // 새로운 데이터 생성
        response = await createScopeEmission(requestData)
      } else {
        // 기존 데이터 수정
        response = await updateScopeEmission(calc.id, requestData)
      }

      // 성공 시 전체 데이터 새로고침
      onDataChange()
      return response
    } catch (error) {
      throw error
    }
  }

  // API 요청 데이터 생성 (통합 Scope 시스템에 맞춤)
  const createRequestPayload = (
    calc: Scope1CalculatorData,
    isManualInput: boolean
  ): ScopeEmissionRequest => {
    const state = calc.state

    // 안전한 숫자 변환 및 정밀도 제한
    const emissionFactor =
      Math.round(parseFloat(state.kgCO2eq || '0') * 1000000) / 1000000 // 소수점 6자리
    const activityAmount = Math.round(parseFloat(state.quantity || '0') * 1000) / 1000 // 소수점 3자리
    const totalEmission = Math.round(emissionFactor * activityAmount * 1000000) / 1000000 // 소수점 6자리

    const categoryMapping = {
      // 고정연소
      list1: {number: 1, major: '고정연소', sub: '액체 연료'},
      list2: {number: 2, major: '고정연소', sub: '가스 연료'},
      list3: {number: 3, major: '고정연소', sub: '고체 연료'},
      // 이동연소
      list4: {number: 4, major: '이동연소', sub: '차량'},
      list5: {number: 5, major: '이동연소', sub: '항공기'},
      list6: {number: 6, major: '이동연소', sub: '선박'},
      // 공정배출
      list7: {number: 7, major: '공정배출', sub: '제조 배출'},
      list8: {number: 8, major: '공정배출', sub: '폐수 처리'},
      // 냉매누출
      list9: {number: 9, major: '냉매누출', sub: '냉동/냉방 설비 냉매'},
      list10: {number: 10, major: '냉매누출', sub: '소화기 방출'}
    }

    const category = categoryMapping[activeCategory]
    if (!category) {
      throw new Error('유효하지 않은 카테고리입니다.')
    }

    return {
      // Scope 분류 정보
      scopeType: 'SCOPE1',
      scope1CategoryNumber: category.number,
      majorCategory: category.major,

      // 배출원 정보
      subcategory: state.separate || '',
      rawMaterial: state.rawMaterial || '',

      // 제품 관련 정보
      ...(state.productName || state.productCode
        ? {
            companyProductCode: state.productCode || '',
            productName: state.productName || ''
          }
        : {}),

      // 수치 데이터
      activityAmount,
      unit: state.unit || '',
      emissionFactor,
      totalEmission,

      // 시간 정보
      reportingYear: selectedYear,
      reportingMonth: selectedMonth || 1,

      // 입력 모드 제어
      inputType: isManualInput ? 'MANUAL' : 'LCA',
      hasProductMapping: !!(state.productName || state.productCode)
    }
  }

  // 유틸리티 함수

  // ID가 임시 ID인지 확인 (음수면 임시 ID)
  const isTemporaryId = (id: number): boolean => id < 0

  // ID가 저장된 데이터 ID인지 확인 (양수면 emissionId)
  const isEmissionId = (id: number): boolean => id > 0

  // 이벤트 핸들러

  // 삭제 다이얼로그 표시/숨김 처리
  const handleShowDeleteDialog = (calculatorId: number, show: boolean) => {
    setDeleteDialogStates(prev => ({
      ...prev,
      [calculatorId]: show
    }))
  }

  // 삭제 확인 핸들러
  const handleDeleteConfirm = async (
    calculatorId: number,
    index: number,
    mode: boolean
  ) => {
    try {
      // 백엔드에 저장된 데이터가 있으면 API 호출로 삭제
      if (isEmissionId(calculatorId)) {
        const deleteSuccess = await deleteScopeEmission(calculatorId)
        if (!deleteSuccess) {
          showError('서버에서 데이터 삭제에 실패했습니다. 다시 시도해주세요.')
          return
        }
      }

      onRemoveCalculator(calculatorId)
      handleShowDeleteDialog(calculatorId, false)
      showSuccess(
        `${mode ? 'LCA 기반 배출계수 선택' : '수동 입력'} ${
          index + 1
        }이(가) 삭제되었습니다.`
      )

      // 백엔드 데이터가 있었던 경우 전체 데이터 새로고침
      if (isEmissionId(calculatorId)) {
        onDataChange()
      }
    } catch (error) {
      showError('데이터 삭제 중 오류가 발생했습니다.')
    }
  }

  // 계산기 상태 변경 처리
  const handleCalculatorStateChange = (id: number, newState: SelectorState) => {
    // 상태 업데이트만 수행 (자동 저장 제거)
    onUpdateCalculatorState(id, newState)
  }

  // 입력 완료 처리 (모든 계산기 데이터 저장)
  const handleComplete = async () => {
    if (!selectedYear || !selectedMonth) {
      showError('보고연도와 보고월을 먼저 선택해주세요.')
      return
    }

    try {
      // 입력된 데이터가 있는 계산기들만 저장
      const calculatorsToSave = calculators.filter(calc => hasInputData(calc))

      if (calculatorsToSave.length === 0) {
        showError('저장할 데이터가 없습니다. 최소 하나의 계산기에 데이터를 입력해주세요.')
        return
      }

      // 각 계산기별로 저장 처리
      const savePromises = calculatorsToSave.map(async calc => {
        const isManualInput = !(calculatorModes[calc.id] || false) // 기본값 false(Manual)
        return await saveCalculatorData(calc, isManualInput)
      })

      await Promise.all(savePromises)

      showSuccess(`${calculatorsToSave.length}개의 데이터가 성공적으로 저장되었습니다.`)

      // 저장 후 데이터 새로고침
      onDataChange()

      // 목록으로 돌아가기
      onComplete()
    } catch (error) {
      showError('데이터 저장 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  // 유틸리티 함수

  // 카테고리 정보 조회
  const getCategoryInfo = () => {
    if (!activeCategory) return null

    // 고정연소 카테고리 확인
    if (activeCategory in scope1PotentialCategoryList) {
      return {
        key: activeCategory,
        title:
          scope1PotentialCategoryList[
            activeCategory as keyof typeof scope1PotentialCategoryList
          ],
        description: '고정연소 배출원에서 발생하는 직접 배출량'
      }
    }

    // 이동연소 카테고리 확인
    if (activeCategory in scope1KineticCategoryList) {
      return {
        key: activeCategory,
        title:
          scope1KineticCategoryList[
            activeCategory as keyof typeof scope1KineticCategoryList
          ],
        description: '이동연소 배출원에서 발생하는 직접 배출량'
      }
    }

    // 공정배출 카테고리 확인
    if (activeCategory in scope1ProcessCategoryList) {
      return {
        key: activeCategory,
        title:
          scope1ProcessCategoryList[
            activeCategory as keyof typeof scope1ProcessCategoryList
          ],
        description: '공정에서 발생하는 직접 배출량'
      }
    }

    // 누출배출 카테고리 확인
    if (activeCategory in scope1LeakCategoryList) {
      return {
        key: activeCategory,
        title:
          scope1LeakCategoryList[activeCategory as keyof typeof scope1LeakCategoryList],
        description: '누출배출에서 발생하는 직접 배출량'
      }
    }

    return null
  }

  // 입력된 데이터가 있는지 확인
  const hasInputData = (calculator: Scope1CalculatorData): boolean => {
    const {separate, rawMaterial, quantity} = calculator.state
    return !!(separate || rawMaterial || quantity)
  }

  const categoryInfo = getCategoryInfo()
  const totalEmission = activeCategory ? getTotalEmission(activeCategory as any) : 0

  // 렌더링

  if (!activeCategory || !categoryInfo) {
    return null
  }

  return (
    <motion.div
      initial={{opacity: 0, scale: 0.95}}
      animate={{opacity: 1, scale: 1}}
      transition={{delay: 0.6, duration: 0.5}}
      className="flex flex-col justify-center space-y-4 w-full">
      {/* 카테고리 헤더 */}
      <div className="overflow-hidden bg-white rounded-3xl border-0 shadow-sm">
        <div className="p-6 bg-white">
          <div className="flex flex-row justify-between items-center">
            <motion.div
              initial={{opacity: 0, x: -20}}
              animate={{opacity: 1, x: 0}}
              transition={{delay: 0.1, duration: 0.5}}
              onClick={onBackToList}
              className="flex flex-row items-center p-4 rounded-xl transition-all duration-200 hover:cursor-pointer hover:bg-blue-50">
              <div className="mr-4 text-2xl text-blue-500">←</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{categoryInfo.title}</h1>
                <div className="mt-1 text-sm text-gray-600">
                  {categoryInfo.description}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {selectedYear}년 {selectedMonth}월 데이터
                </div>
              </div>
            </motion.div>

            {/* 현재 카테고리 소계 카드 */}
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
                      {totalEmission.toFixed(2)}
                    </span>
                    <div className="text-sm text-gray-500">kgCO₂</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 계산기 목록 섹션 */}
      <div className="flex flex-col items-center space-y-8 w-full">
        <AnimatePresence mode="popLayout" initial={false}>
          {calculators.map((calculator, index) => {
            // 모드별 제목 및 설명 설정
            const mode = calculatorModes[calculator.id] || false
            const title = mode
              ? `LCA 기반 배출계수 선택 ${index + 1}`
              : `수동 입력 ${index + 1}`
            const description = mode
              ? '배출계수를 단계별로 선택하여 자동 계산하세요'
              : '직접 값을 입력하여 배출량을 계산하세요.'
            const IconComponent = mode ? Database : Sparkles

            return (
              <div key={calculator.id} className="flex flex-col items-center w-full">
                {/* 계산기 간 구분선 */}
                {index > 0 && (
                  <motion.div
                    initial={{scaleX: 0}}
                    animate={{scaleX: 1}}
                    transition={{delay: 0, duration: 0.3}}
                    className="relative mt-6 mb-2 w-[80%]">
                    {/* 심플한 구분선 */}
                    <div className="h-px bg-blue-200" />

                    {/* 중앙 포인트 */}
                    <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2" />
                  </motion.div>
                )}

                {/* 개별 계산기 컨테이너 */}
                <motion.div
                  initial={{opacity: 0, y: 30}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, y: -30}}
                  transition={{
                    delay: 0,
                    duration: 0.5
                  }}
                  className="w-[80%]">
                  <Card className="overflow-hidden bg-white rounded-3xl border-0 shadow-lg">
                    {/* 계산기 헤더 */}
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100">
                      <div className="flex relative items-center">
                        {/* 계산기 번호 배지 */}
                        <motion.div
                          initial={{scale: 0}}
                          animate={{scale: 1}}
                          transition={{
                            delay: 0,
                            duration: 0.3
                          }}
                          className="flex justify-center items-center mr-5 w-14 h-14 bg-blue-500 rounded-2xl shadow-md">
                          <span className="text-lg font-bold text-white">
                            {index + 1}
                          </span>
                        </motion.div>

                        {/* 계산기 제목 및 설명 */}
                        <div className="flex-1">
                          <motion.div
                            initial={{opacity: 0, x: -20}}
                            animate={{opacity: 1, x: 0}}
                            transition={{delay: 0, duration: 0.4}}>
                            <div className="flex items-center mb-1 space-x-2">
                              <IconComponent className="w-5 h-5 text-blue-500" />
                              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                            </div>
                            <p className="text-sm text-gray-600">{description}</p>
                          </motion.div>
                        </div>

                        {/* 오른쪽 컨트롤 영역 */}
                        <div className="flex items-center space-x-4">
                          {/* 수동 입력 모드 토글 */}
                          <motion.div
                            initial={{opacity: 0, scale: 0.8}}
                            animate={{opacity: 1, scale: 1}}
                            transition={{delay: 0, duration: 0.3}}
                            className="flex items-center px-4 py-2 space-x-3 bg-white rounded-xl border border-blue-200 shadow-sm transition-all hover:bg-blue-50">
                            {/* 토글 스위치 */}
                            <Switch
                              checked={mode}
                              onCheckedChange={checked =>
                                onModeChange(calculator.id, checked)
                              }
                              className="data-[state=checked]:bg-blue-500"
                            />

                            {/* 라벨 */}
                            <span
                              className={`text-sm font-medium transition-colors ${
                                mode ? 'text-blue-600' : 'text-gray-500'
                              }`}>
                              LCA 기반 입력
                            </span>
                          </motion.div>

                          {/* 삭제 버튼 - 입력된 데이터가 있으면 상시 표시 */}
                          {hasInputData(calculator) && (
                            <motion.div
                              initial={{opacity: 0, scale: 0.8}}
                              animate={{opacity: 1, scale: 1}}
                              transition={{delay: 0, duration: 0.3}}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleShowDeleteDialog(calculator.id, true)
                                }
                                className="px-4 py-2 text-red-500 bg-red-50 rounded-xl border border-red-200 transition-all duration-200 hover:text-red-700 hover:bg-red-100 hover:border-red-300 hover:scale-105">
                                <Trash2 className="mr-2 w-4 h-4" />
                                <span className="font-medium">삭제</span>
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 계산기 내용 영역 */}
                    <CardContent className="p-8 bg-white">
                      <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0, duration: 0.4}}>
                        {mode ? (
                          /* LCA 기반 자동 계산 모드 */
                          <ExcelCascadingSelector
                            activeCategory={activeCategory}
                            key={`auto-${calculator.id}`}
                            id={calculator.id}
                            state={calculator.state}
                            onChangeState={(newState: SelectorState) =>
                              handleCalculatorStateChange(calculator.id, newState)
                            }
                            onChangeTotal={(id: number, emission: number) =>
                              onChangeTotal(id, emission)
                            }
                          />
                        ) : (
                          /* 수동 입력 모드 */
                          <SelfInputScope12Calculator
                            key={`manual-${calculator.id}`}
                            id={calculator.id}
                            state={calculator.state}
                            onChangeState={(newState: SelectorState) =>
                              handleCalculatorStateChange(calculator.id, newState)
                            }
                            onChangeTotal={(id: number, emission: number) =>
                              onChangeTotal(id, emission)
                            }
                          />
                        )}
                      </motion.div>
                    </CardContent>
                  </Card>

                  {/* 삭제 확인 다이얼로그 */}
                  <AlertDialog
                    open={deleteDialogStates[calculator.id] || false}
                    onOpenChange={open => handleShowDeleteDialog(calculator.id, open)}>
                    <AlertDialogContent className="max-w-md">
                      <AlertDialogHeader>
                        <div className="flex items-center mb-2 space-x-3">
                          <div className="flex justify-center items-center w-12 h-12 bg-red-100 rounded-full">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                          </div>
                          <div>
                            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                              계산기 삭제 확인
                            </AlertDialogTitle>
                          </div>
                        </div>
                      </AlertDialogHeader>

                      <AlertDialogDescription className="space-y-3 leading-relaxed text-gray-600">
                        <span className="block">
                          <span className="font-medium text-gray-900">
                            {mode ? 'LCA 기반 배출계수 선택' : '수동 입력'} {index + 1}
                          </span>
                          을(를) 삭제하시겠습니까?
                        </span>
                        <span className="block text-sm text-red-600">
                          입력된 모든 데이터가 완전히 삭제되며, 이 작업은 되돌릴 수
                          없습니다.
                        </span>
                        {isEmissionId(calculator.id) && (
                          <span className="block text-sm font-medium text-red-700">
                            백엔드에 저장된 데이터도 함께 삭제됩니다.
                          </span>
                        )}
                      </AlertDialogDescription>

                      <AlertDialogFooter className="gap-3">
                        <AlertDialogCancel className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg border-0 transition-all hover:bg-gray-200">
                          취소
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteConfirm(calculator.id, index, mode)}
                          className="px-6 py-2 text-white bg-red-500 rounded-lg border-0 transition-all hover:bg-red-600">
                          삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </motion.div>
              </div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* 액션 버튼들 */}
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.8, duration: 0.4}}
        className="flex gap-4 justify-center items-center pt-8 border-t border-gray-200">
        <Button
          onClick={onAddCalculator}
          className="px-8 py-4 text-lg font-semibold text-white bg-blue-500 rounded-xl shadow-lg transition-all duration-300 transform hover:bg-blue-600 hover:scale-105 hover:shadow-xl">
          <Plus className="mr-2 w-5 h-5" />
          계산기 추가
        </Button>
        <Button
          onClick={handleComplete}
          variant="outline"
          className="px-8 py-4 text-lg font-semibold text-green-700 bg-white rounded-xl border-2 border-green-500 shadow-lg transition-all duration-300 hover:bg-green-50 hover:scale-105 hover:shadow-xl">
          <Save className="mr-2 w-5 h-5" />
          저장 및 완료
        </Button>
      </motion.div>
    </motion.div>
  )
}
