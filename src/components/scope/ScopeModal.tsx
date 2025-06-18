'use client'

import {useState, useEffect} from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {AlertCircle, Calculator, Cloud} from 'lucide-react'

// 분리된 컴포넌트들 import
import BasicInfoForm from './BasicInfoForm'
import ActivityTypeSelector from './ActivityTypeSelector'
import StationaryCombustionForm from './StationaryCombustionForm'
import MobileCombustionForm from './MobileCombustionForm'
import ElectricityForm from './ElectricityForm'
import SteamForm from './SteamForm'
import CalculationResult from './CalculationResult'

import type {
  PartnerCompany,
  ScopeFormData,
  EmissionActivityType,
  StationaryCombustionType,
  MobileCombustionType,
  SteamType,
  FuelType,
  EmissionCalculationResult,
  PurposeCategory
} from '@/types/scopeType'

import {
  fetchFuelsByActivityType,
  calculateEmissions,
  submitScopeData,
  validateScopeFormData
} from '@/services/scopeService'

// fuel-data.ts에서 연료 데이터와 헬퍼 함수들 import
import {
  FUEL_DATA,
  getAllFuels,
  getFuelById,
  getFuelsByActivityType as getFuelsByActivityTypeLocal,
  getEmissionFactorByPurpose,
  GWP
} from '@/constants/fuel-data'

import {useToast} from '@/util/toast'

interface ScopeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ScopeFormData) => void
  partnerCompanies: PartnerCompany[]
  defaultPartnerId?: string
  defaultYear?: number
  defaultMonth?: number
  scope: 'SCOPE1' | 'SCOPE2'
}

/**
 * Scope 배출량 데이터 입력 모달 컴포넌트
 *
 * 주요 기능:
 * - 협력사별 배출량 데이터 입력
 * - Scope 1 (직접 배출): 고정연소, 이동연소
 * - Scope 2 (간접 배출): 전력사용, 스팀사용
 * - 실시간 배출량 계산
 * - 데이터 유효성 검사
 * - 서버 저장 기능
 */
export default function ScopeModal({
  isOpen,
  onClose,
  onSubmit,
  partnerCompanies,
  defaultPartnerId,
  defaultYear = new Date().getFullYear(),
  defaultMonth = new Date().getMonth() + 1,
  scope
}: ScopeModalProps) {
  const toast = useToast()

  // 선택된 협력사 정보 찾기
  const selectedPartner = partnerCompanies.find(p => p.id === defaultPartnerId)

  // 상태 관리
  const [formData, setFormData] = useState<ScopeFormData>({
    companyId: defaultPartnerId || '',
    reportingYear: defaultYear,
    reportingMonth: defaultMonth,
    emissionActivityType: scope === 'SCOPE1' ? 'STATIONARY_COMBUSTION' : 'ELECTRICITY'
  })

  const [availableFuels, setAvailableFuels] = useState<FuelType[]>([])
  const [calculationResult, setCalculationResult] =
    useState<EmissionCalculationResult | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  /**
   * 연료 목록 불러오기 함수
   * 선택된 배출 활동 유형에 따라 적절한 연료 목록을 가져옴
   */
  const loadFuels = async () => {
    if (!formData.emissionActivityType) return

    try {
      let subType: string | undefined

      // 고정연소의 경우 연료 유형에 따라 서브타입 설정
      if (
        formData.emissionActivityType === 'STATIONARY_COMBUSTION' &&
        formData.stationaryCombustion
      ) {
        subType = formData.stationaryCombustion.combustionType
      }
      // 이동연소의 경우 전체 이동연소 연료를 가져옴
      else if (formData.emissionActivityType === 'MOBILE_COMBUSTION') {
        subType = undefined
      }

      // fuel-data.ts의 getFuelsByActivityType 함수 사용
      const fuels = getFuelsByActivityTypeLocal(formData.emissionActivityType, subType)

      console.log('🔍 기본 연료 목록 (필터링 전):', {
        activityType: formData.emissionActivityType,
        subType,
        totalFuels: fuels.length,
        fuels: fuels.map(f => ({
          id: f.id,
          name: f.name,
          subcategoryType: f.subcategoryType,
          hasMobileFactors: !!f.mobileEmissionFactors
        }))
      })

      // 이동연소의 경우 mobileEmissionFactors가 있는 연료만 필터링
      let filteredFuels = fuels
      if (formData.emissionActivityType === 'MOBILE_COMBUSTION') {
        filteredFuels = fuels.filter(fuel => fuel.mobileEmissionFactors)
        console.log('🚗 이동연소 연료 필터링 결과:', {
          beforeFilter: fuels.length,
          afterFilter: filteredFuels.length,
          mobileFuels: filteredFuels.map(f => ({
            id: f.id,
            name: f.name,
            unit: f.unit,
            mobileFactors: f.mobileEmissionFactors
          }))
        })
      }

      setAvailableFuels(filteredFuels)
      console.log(
        '✅ 최종 로드된 연료 목록:',
        filteredFuels.map(f => ({
          id: f.id,
          name: f.name,
          unit: f.unit,
          subcategoryType: f.subcategoryType,
          hasMobileFactors: !!f.mobileEmissionFactors
        }))
      )
    } catch (error) {
      console.error('연료 목록 불러오기 실패:', error)
      toast.error('연료 목록을 불러오는데 실패했습니다.')
    }
  }

  // 연료 목록 로드 effect
  useEffect(() => {
    loadFuels()
  }, [
    formData.emissionActivityType,
    formData.stationaryCombustion?.combustionType,
    formData.mobileCombustion?.transportType
  ])

  /**
   * 배출량 계산 함수
   */
  const handleCalculateEmissions = async () => {
    if (isCalculating) return

    let fuelId: string | undefined
    let usage: number | undefined
    let purposeCategory: PurposeCategory | undefined

    const toNumber = (value: string | number): number => {
      return typeof value === 'string' ? parseFloat(value) : value
    }

    const validateUsage = (value: number): boolean => {
      return value > 0 && value <= 1000000
    }

    // 배출 활동 유형별 데이터 추출
    if (
      formData.emissionActivityType === 'STATIONARY_COMBUSTION' &&
      formData.stationaryCombustion
    ) {
      fuelId = formData.stationaryCombustion.fuelId
      usage = toNumber(formData.stationaryCombustion.fuelUsage)
      purposeCategory = formData.stationaryCombustion.purposeCategory
    } else if (
      formData.emissionActivityType === 'MOBILE_COMBUSTION' &&
      formData.mobileCombustion
    ) {
      fuelId = formData.mobileCombustion.fuelId
      usage = toNumber(formData.mobileCombustion.fuelUsage)
      purposeCategory = formData.mobileCombustion.purposeCategory
    } else if (formData.emissionActivityType === 'ELECTRICITY' && formData.electricity) {
      fuelId = 'ELECTRICITY'
      usage = toNumber(formData.electricity.electricityUsage)
    } else if (formData.emissionActivityType === 'STEAM' && formData.steam) {
      fuelId = `STEAM_${formData.steam.steamType.replace('TYPE_', '')}`
      usage = toNumber(formData.steam.steamUsage)
    }

    // 유효성 검사
    if (!fuelId) {
      toast.warning('연료를 선택해주세요.')
      setErrors(['연료를 선택해주세요.'])
      return
    }

    if (!usage || isNaN(usage) || !validateUsage(usage)) {
      toast.warning('사용량을 0보다 크고 1,000,000 이하의 유효한 숫자로 입력해주세요.')
      setErrors(['사용량을 0보다 크고 1,000,000 이하의 유효한 숫자로 입력해주세요.'])
      return
    }

    if (
      (formData.emissionActivityType === 'STATIONARY_COMBUSTION' ||
        formData.emissionActivityType === 'MOBILE_COMBUSTION') &&
      !purposeCategory
    ) {
      toast.warning('용도 구분을 선택해주세요.')
      setErrors(['용도 구분을 선택해주세요.'])
      return
    }

    setIsCalculating(true)
    try {
      const result = await calculateEmissions(fuelId, usage, purposeCategory)
      setCalculationResult(result)
      setErrors([])
      toast.success('배출량이 성공적으로 계산되었습니다.')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '계산 중 오류가 발생했습니다.'
      setErrors([errorMessage])
      setCalculationResult(null)
      toast.error(errorMessage)
    } finally {
      setIsCalculating(false)
    }
  }

  /**
   * 폼 제출 함수
   */
  const handleSubmit = async () => {
    if (isLoading) return

    if (!defaultPartnerId || !selectedPartner) {
      setErrors(['협력사를 먼저 선택해주세요.'])
      toast.error('협력사를 먼저 선택해주세요.')
      return
    }

    const validationErrors = validateScopeFormData(formData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      toast.warning('입력값을 확인해주세요.')
      return
    }

    setIsLoading(true)
    try {
      const submitData = {
        ...formData,
        companyId: defaultPartnerId
      }

      console.log('💾 DB 저장 데이터:', submitData)

      await submitScopeData(submitData)
      onSubmit(submitData)
      onClose()
      toast.success(
        `${
          selectedPartner.companyName || selectedPartner.corpName || selectedPartner.name
        }의 ${scope} 배출량 데이터가 성공적으로 저장되었습니다.`
      )
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.'
      setErrors([errorMessage])
      toast.error(`저장 실패: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 배출활동 타입 변경 핸들러
   */
  const handleActivityTypeChange = (activityType: EmissionActivityType) => {
    const baseFormData: ScopeFormData = {
      ...formData,
      emissionActivityType: activityType,
      stationaryCombustion: undefined,
      mobileCombustion: undefined,
      electricity: undefined,
      steam: undefined
    }

    // 활동 타입에 따라 기본 구조 초기화
    if (activityType === 'STATIONARY_COMBUSTION') {
      baseFormData.stationaryCombustion = {
        companyId: defaultPartnerId || '',
        reportingYear: formData.reportingYear,
        reportingMonth: formData.reportingMonth,
        facilityName: '',
        facilityLocation: '',
        combustionType: 'LIQUID' as StationaryCombustionType,
        purposeCategory: 'COMMERCIAL' as PurposeCategory,
        fuelId: '',
        fuelUsage: '',
        unit: '',
        createdBy: 'current-user'
      }
    } else if (activityType === 'MOBILE_COMBUSTION') {
      baseFormData.mobileCombustion = {
        companyId: defaultPartnerId || '',
        reportingYear: formData.reportingYear,
        reportingMonth: formData.reportingMonth,
        vehicleType: '',
        transportType: 'ROAD' as MobileCombustionType,
        purposeCategory: 'COMMERCIAL' as PurposeCategory,
        fuelId: '',
        fuelUsage: '',
        unit: '',
        distance: '',
        createdBy: 'current-user'
      }
    } else if (activityType === 'ELECTRICITY') {
      baseFormData.electricity = {
        companyId: defaultPartnerId || '',
        reportingYear: formData.reportingYear,
        reportingMonth: formData.reportingMonth,
        facilityName: '',
        facilityLocation: '',
        electricityUsage: '',
        unit: 'kWh',
        isRenewable: false,
        renewableType: '',
        createdBy: 'current-user'
      }
    } else if (activityType === 'STEAM') {
      baseFormData.steam = {
        companyId: defaultPartnerId || '',
        reportingYear: formData.reportingYear,
        reportingMonth: formData.reportingMonth,
        facilityName: '',
        facilityLocation: '',
        steamType: 'TYPE_A' as SteamType,
        steamUsage: '',
        unit: 'GJ',
        createdBy: 'current-user'
      }
    }

    setFormData(baseFormData)
    setCalculationResult(null)
    setErrors([])
  }

  // 폼 초기화 effect
  useEffect(() => {
    if (isOpen) {
      if (defaultPartnerId && selectedPartner) {
        setFormData({
          companyId: defaultPartnerId,
          reportingYear: defaultYear,
          reportingMonth: defaultMonth,
          emissionActivityType:
            scope === 'SCOPE1' ? 'STATIONARY_COMBUSTION' : 'ELECTRICITY'
        })
      } else {
        setFormData({
          companyId: '',
          reportingYear: defaultYear,
          reportingMonth: defaultMonth,
          emissionActivityType:
            scope === 'SCOPE1' ? 'STATIONARY_COMBUSTION' : 'ELECTRICITY'
        })
      }

      setCalculationResult(null)
      setErrors([])
    }
  }, [isOpen, defaultPartnerId, selectedPartner, defaultYear, defaultMonth, scope])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white border-gray-200 custom-scrollbar">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
            <div className="p-3 bg-gray-100 rounded-xl">
              <Cloud className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h1>{scope} 배출량 데이터 입력</h1>
              <p className="mt-1 text-sm font-normal text-gray-600">
                협력사의 배출량 데이터를 입력하고 계산하세요
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {/* 오류 메시지 */}
          {errors.length > 0 && (
            <Alert className="border-red-200 shadow-sm bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {/* 기본 정보 */}
          <BasicInfoForm selectedPartner={selectedPartner} />

          {/* 협력사가 선택된 경우에만 나머지 폼 표시 */}
          {selectedPartner && (
            <>
              {/* 배출 활동 유형 선택 */}
              <ActivityTypeSelector
                selectedActivityType={formData.emissionActivityType}
                onActivityTypeChange={handleActivityTypeChange}
                scope={scope}
              />

              {/* 각 활동 유형별 폼 */}
              {formData.emissionActivityType === 'STATIONARY_COMBUSTION' && (
                <StationaryCombustionForm
                  formData={formData}
                  setFormData={setFormData}
                  availableFuels={availableFuels}
                />
              )}

              {formData.emissionActivityType === 'MOBILE_COMBUSTION' && (
                <MobileCombustionForm
                  formData={formData}
                  setFormData={setFormData}
                  availableFuels={availableFuels}
                />
              )}

              {formData.emissionActivityType === 'ELECTRICITY' && (
                <ElectricityForm formData={formData} setFormData={setFormData} />
              )}

              {formData.emissionActivityType === 'STEAM' && (
                <SteamForm formData={formData} setFormData={setFormData} />
              )}

              {/* 계산 결과 */}
              {calculationResult && (
                <CalculationResult calculationResult={calculationResult} />
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-3 pt-6 border-t border-gray-100 sm:flex-row">
          <div className="flex flex-1 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCalculateEmissions}
              disabled={isCalculating || !selectedPartner}
              className="flex items-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50">
              <Calculator className="w-4 h-4" />
              {isCalculating ? '계산 중...' : '배출량 계산'}
            </Button>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400">
              취소
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !selectedPartner || !calculationResult}
              className="bg-customG hover:bg-customGDark disabled:opacity-50">
              {isLoading ? '저장 중...' : '저장'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
