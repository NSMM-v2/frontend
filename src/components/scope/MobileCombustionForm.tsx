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
import {MOBILE_COMBUSTION_TYPES} from './constants'
import PurposeSelector from './PurposeSelector'
import type {
  ScopeFormData,
  FuelType,
  MobileCombustionType,
  PurposeCategory
} from '@/types/scopeType'

interface MobileCombustionFormProps {
  /** 현재 폼 데이터 */
  formData: ScopeFormData
  /** 폼 데이터 업데이트 핸들러 */
  setFormData: (data: ScopeFormData) => void
  /** 선택 가능한 연료 목록 */
  availableFuels: FuelType[]
}

/**
 * 이동연소 데이터 입력 폼 컴포넌트
 *
 * 주요 기능:
 * - 교통수단 유형 선택 (도로, 수상, 항공, 철도)
 * - 차량/장비명, 이동거리 입력
 * - 연료 선택 및 사용량 입력
 * - 용도 구분 선택 (영업용, 산업용, 개인용, 공공용)
 * - 실시간 유효성 검사 및 시각적 피드백
 */
export default function MobileCombustionForm({
  formData,
  setFormData,
  availableFuels
}: MobileCombustionFormProps) {
  /**
   * 교통수단 유형 변경 핸들러
   * 교통수단 유형이 변경되면 연료 ID와 사용량을 초기화
   */
  const handleTransportTypeChange = (transportType: MobileCombustionType) => {
    setFormData({
      ...formData,
      mobileCombustion: {
        ...formData.mobileCombustion!,
        transportType,
        vehicleType: formData.mobileCombustion?.vehicleType || '',
        fuelId: '', // 교통수단 유형 변경시 연료 선택 초기화
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
      mobileCombustion: {
        ...formData.mobileCombustion!,
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
      mobileCombustion: {
        ...formData.mobileCombustion!,
        purposeCategory
      }
    })
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="p-4 space-y-6">
        {/* 교통수단 유형 선택 */}
        <div>
          <Label className="flex items-center gap-1 mb-3 text-sm font-medium text-gray-700">
            교통수단 유형
            <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {MOBILE_COMBUSTION_TYPES.map(type => {
              const isSelected = formData.mobileCombustion?.transportType === type.value

              return (
                <div
                  key={type.value}
                  className={`group p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected
                      ? 'border-customG bg-customGLight shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => handleTransportTypeChange(type.value)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`${type.label} 선택`}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleTransportTypeChange(type.value)
                    }
                  }}>
                  <div className="relative">
                    <div
                      className={`text-sm font-semibold ${
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

        {/* 차량 정보 및 이동거리 입력 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="vehicleType"
              className="flex items-center gap-1 text-sm font-medium text-gray-700">
              차량/장비명
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="vehicleType"
              value={formData.mobileCombustion?.vehicleType || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  mobileCombustion: {
                    ...formData.mobileCombustion!,
                    vehicleType: e.target.value
                  }
                })
              }
              placeholder="예: 승용차, 화물차, 항공기"
              className="border-gray-300 h-11 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="distance" className="text-sm font-medium text-gray-700">
              이동거리 (km)
            </Label>
            <Input
              id="distance"
              type="number"
              step="0.1"
              value={formData.mobileCombustion?.distance || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  mobileCombustion: {
                    ...formData.mobileCombustion!,
                    distance: e.target.value
                  }
                })
              }
              placeholder="0.0"
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
              value={formData.mobileCombustion?.fuelId || ''}
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
                value={formData.mobileCombustion?.fuelUsage || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    mobileCombustion: {
                      ...formData.mobileCombustion!,
                      fuelUsage: e.target.value
                    }
                  })
                }
                placeholder="0.000"
                className="border-gray-300 h-11 focus:border-blue-500 focus:ring-blue-500/20"
              />
              <div className="flex items-center justify-center px-4 text-sm font-medium text-gray-700 border border-gray-200 rounded-md bg-gray-50 min-w-[80px]">
                {formData.mobileCombustion?.unit || '단위'}
              </div>
            </div>
          </div>
        </div>

        {/* 용도 구분 선택 */}
        <PurposeSelector
          selectedPurpose={formData.mobileCombustion?.purposeCategory}
          onPurposeChange={handlePurposeChange}
          activityType="MOBILE_COMBUSTION"
        />
      </CardContent>
    </Card>
  )
}
