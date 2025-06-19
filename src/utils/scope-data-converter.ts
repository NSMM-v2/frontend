/**
 * Scope 데이터 변환 유틸리티
 * UI 폼 데이터와 백엔드 API 데이터 간의 변환을 담당
 */

import type {
  ScopeFormData,
  StationaryCombustionFormUI,
  MobileCombustionFormUI,
  ElectricityUsageFormUI,
  SteamUsageFormUI,
  StationaryCombustionForm,
  MobileCombustionForm,
  ElectricityUsageForm,
  SteamUsageForm
} from '@/types/scopeType'

/**
 * UI 고정연소 폼 데이터를 API 요청 형식으로 변환
 */
export const convertStationaryCombustionUIToForm = (
  uiData: StationaryCombustionFormUI,
  memberId: number = 1
): StationaryCombustionForm => {
  return {
    memberId,
    companyId: uiData.companyId,
    reportingYear: uiData.reportingYear,
    reportingMonth: uiData.reportingMonth,
    facilityName: uiData.facilityName,
    facilityLocation: uiData.facilityLocation || '',
    combustionType: uiData.combustionType,
    fuelId: uiData.fuelId,
    fuelName: uiData.fuelName || '',
    fuelUsage:
      typeof uiData.fuelUsage === 'string'
        ? parseFloat(uiData.fuelUsage)
        : uiData.fuelUsage,
    unit: uiData.unit,
    createdBy: uiData.createdBy,
    notes: uiData.notes || ''
  }
}

/**
 * UI 이동연소 폼 데이터를 API 요청 형식으로 변환
 */
export const convertMobileCombustionUIToForm = (
  uiData: MobileCombustionFormUI,
  memberId: number = 1
): MobileCombustionForm => {
  return {
    memberId,
    companyId: uiData.companyId,
    reportingYear: uiData.reportingYear,
    reportingMonth: uiData.reportingMonth,
    vehicleType: uiData.vehicleType,
    transportType: uiData.transportType,
    fuelId: uiData.fuelId,
    fuelName: uiData.fuelName || '',
    fuelUsage:
      typeof uiData.fuelUsage === 'string'
        ? parseFloat(uiData.fuelUsage)
        : uiData.fuelUsage,
    unit: uiData.unit,
    distance: uiData.distance
      ? typeof uiData.distance === 'string'
        ? parseFloat(uiData.distance)
        : uiData.distance
      : 0,
    createdBy: uiData.createdBy,
    notes: uiData.notes || ''
  }
}

/**
 * UI 전력 사용량 폼 데이터를 API 요청 형식으로 변환
 */
export const convertElectricityUsageUIToForm = (
  uiData: ElectricityUsageFormUI,
  memberId: number = 1
): ElectricityUsageForm => {
  return {
    memberId,
    companyId: uiData.companyId,
    reportingYear: uiData.reportingYear,
    reportingMonth: uiData.reportingMonth,
    facilityName: uiData.facilityName,
    facilityLocation: uiData.facilityLocation || '',
    electricityUsage:
      typeof uiData.electricityUsage === 'string'
        ? parseFloat(uiData.electricityUsage)
        : uiData.electricityUsage,
    unit: uiData.unit,
    isRenewable: uiData.isRenewable,
    renewableType: uiData.renewableType || '',
    createdBy: uiData.createdBy,
    notes: uiData.notes || ''
  }
}

/**
 * UI 스팀 사용량 폼 데이터를 API 요청 형식으로 변환
 */
export const convertSteamUsageUIToForm = (
  uiData: SteamUsageFormUI,
  memberId: number = 1
): SteamUsageForm => {
  return {
    memberId,
    companyId: uiData.companyId,
    reportingYear: uiData.reportingYear,
    reportingMonth: uiData.reportingMonth,
    facilityName: uiData.facilityName,
    facilityLocation: uiData.facilityLocation || '',
    steamType: uiData.steamType,
    steamUsage:
      typeof uiData.steamUsage === 'string'
        ? parseFloat(uiData.steamUsage)
        : uiData.steamUsage,
    unit: uiData.unit,
    createdBy: uiData.createdBy,
    notes: uiData.notes || ''
  }
}

/**
 * 통합 폼 데이터를 각 배출활동별 API 형식으로 변환
 */
export const convertScopeFormDataForAPI = (
  formData: ScopeFormData,
  memberId: number = 1
): {
  stationaryCombustion?: StationaryCombustionForm
  mobileCombustion?: MobileCombustionForm
  electricity?: ElectricityUsageForm
  steam?: SteamUsageForm
} => {
  const result: any = {}

  // 공통 필드들을 각 세부 데이터에 병합
  const commonFields = {
    companyId: formData.companyId,
    reportingYear: formData.reportingYear,
    reportingMonth: formData.reportingMonth
  }

  if (formData.stationaryCombustion) {
    // 공통 필드와 세부 필드를 병합
    const mergedData = {
      ...formData.stationaryCombustion,
      ...commonFields
    }
    result.stationaryCombustion = convertStationaryCombustionUIToForm(
      mergedData,
      memberId
    )
  }

  if (formData.mobileCombustion) {
    // 공통 필드와 세부 필드를 병합
    const mergedData = {
      ...formData.mobileCombustion,
      ...commonFields
    }
    result.mobileCombustion = convertMobileCombustionUIToForm(mergedData, memberId)
  }

  if (formData.electricity) {
    // 공통 필드와 세부 필드를 병합
    const mergedData = {
      ...formData.electricity,
      ...commonFields
    }
    result.electricity = convertElectricityUsageUIToForm(mergedData, memberId)
  }

  if (formData.steam) {
    // 공통 필드와 세부 필드를 병합
    const mergedData = {
      ...formData.steam,
      ...commonFields
    }
    result.steam = convertSteamUsageUIToForm(mergedData, memberId)
  }

  return result
}
