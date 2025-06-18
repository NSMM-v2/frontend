'use client'

import {Card, CardContent} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {CheckCircle2} from 'lucide-react'
import {STATIONARY_COMBUSTION_TYPES} from './constants'
import PurposeSelector from './PurposeSelector'
import type {
  ScopeFormData,
  FuelType,
  StationaryCombustionType,
  PurposeCategory
} from '@/types/scopeType'

interface StationaryCombustionFormProps {
  /** 현재 폼 데이터 */
  formData: ScopeFormData
  /** 폼 데이터 업데이트 핸들러 */
  setFormData: (data: ScopeFormData) => void
  /** 선택 가능한 연료 목록 */
  availableFuels: FuelType[]
}

/**
 * 고정연소 데이터 입력 폼 컴포넌트
 *
 * 주요 기능:
 * - 연료 유형 선택 (액체, 가스, 고체)
 * - 시설명, 시설 위치 입력
 * - 연료 선택 및 사용량 입력
 * - 용도 구분 선택 (상업용, 산업용, 주거용, 공공용)
 * - 실시간 유효성 검사 및 시각적 피드백
 */
export default function StationaryCombustionForm({
  formData,
  setFormData,
  availableFuels
}: StationaryCombustionFormProps) {
  /**
   * 연료 유형 변경 핸들러
   * 연료 유형이 변경되면 연료 ID와 사용량을 초기화
   */
  const handleCombustionTypeChange = (combustionType: StationaryCombustionType) => {
    setFormData({
      ...formData,
      stationaryCombustion: {
        ...formData.stationaryCombustion!,
        combustionType,
        facilityName: formData.stationaryCombustion?.facilityName || '',
        fuelId: '', // 연료 유형 변경시 연료 선택 초기화
        fuelUsage: '', // 사용량도 초기화
        unit: '',
        createdBy: 'system'
      }
    })
  }

  /**
   * 연료 선택 변경 핸들러
   * 연료가 변경되면 해당 연료의 단위를 자동으로 설정
   */
  const handleFuelChange = (fuelId: string) => {
    const fuel = availableFuels.find(f => f.id === fuelId)
    setFormData({
      ...formData,
      stationaryCombustion: {
        ...formData.stationaryCombustion!,
        fuelId,
        unit: fuel?.unit || ''
      }
    })
  }

  /**
   * 용도 구분 변경 핸들러
   */
  const handlePurposeChange = (purposeCategory: PurposeCategory) => {
    setFormData({
      ...formData,
      stationaryCombustion: {
        ...formData.stationaryCombustion!,
        purposeCategory
      }
    })
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="p-4 space-y-6">
        {/* 연료 유형 선택 */}
        <div>
          <Label className="flex items-center gap-1 mb-3 text-sm font-medium text-gray-700">
            연료 유형
            <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {STATIONARY_COMBUSTION_TYPES.map(type => {
              const isSelected =
                formData.stationaryCombustion?.combustionType === type.value

              return (
                <div
                  key={type.value}
                  className={`group p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected
                      ? 'border-customG bg-customGLight shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => handleCombustionTypeChange(type.value)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`${type.label} 선택`}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleCombustionTypeChange(type.value)
                    }
                  }}>
                  <div className="relative">
                    <div
                      className={`text-sm font-semibold mb-1 ${
                        isSelected
                          ? 'text-black'
                          : 'text-gray-800 group-hover:text-customG'
                      }`}>
                      {type.label}
                    </div>
                    <div
                      className={`text-xs leading-relaxed ${
                        isSelected
                          ? 'text-black'
                          : 'text-gray-600 group-hover:text-customG'
                      }`}>
                      {type.description}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 시설 정보 입력 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="facilityName"
              className="flex items-center gap-1 text-sm font-medium text-gray-700">
              시설명
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="facilityName"
              value={formData.stationaryCombustion?.facilityName || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  stationaryCombustion: {
                    ...formData.stationaryCombustion!,
                    facilityName: e.target.value
                  }
                })
              }
              placeholder="예: 보일러 #1"
              className="border-gray-300 h-11 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="facilityLocation"
              className="text-sm font-medium text-gray-700">
              시설 위치
            </Label>
            <Input
              id="facilityLocation"
              value={formData.stationaryCombustion?.facilityLocation || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  stationaryCombustion: {
                    ...formData.stationaryCombustion!,
                    facilityLocation: e.target.value
                  }
                })
              }
              placeholder="예: 공장 1동"
              className="border-gray-300 h-11 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* 연료 및 사용량 입력 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="fuel"
              className="flex items-center gap-1 text-sm font-medium text-gray-700">
              연료
              <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.stationaryCombustion?.fuelId || ''}
              onValueChange={handleFuelChange}>
              <SelectTrigger className="border-gray-300 h-11 focus:border-blue-500 focus:ring-blue-500/20">
                <SelectValue placeholder="연료를 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {availableFuels.map(fuel => (
                  <SelectItem key={fuel.id} value={fuel.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{fuel.name}</span>
                      <span className="ml-2 text-sm text-gray-500">({fuel.unit})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="usage"
              className="flex items-center gap-1 text-sm font-medium text-gray-700">
              사용량
              <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="usage"
                type="number"
                step="0.001"
                value={formData.stationaryCombustion?.fuelUsage || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    stationaryCombustion: {
                      ...formData.stationaryCombustion!,
                      fuelUsage: e.target.value
                    }
                  })
                }
                placeholder="0.000"
                className="border-gray-300 h-11 focus:border-blue-500 focus:ring-blue-500/20"
              />
              <div className="flex items-center justify-center px-4 text-sm font-medium text-gray-700 border border-gray-200 rounded-md bg-gray-50 min-w-[80px]">
                {formData.stationaryCombustion?.unit || '단위'}
              </div>
            </div>
          </div>
        </div>

        {/* 용도 구분 선택 */}
        <PurposeSelector
          selectedPurpose={formData.stationaryCombustion?.purposeCategory}
          onPurposeChange={handlePurposeChange}
          activityType="STATIONARY_COMBUSTION"
        />
      </CardContent>
    </Card>
  )
}
