'use client'

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Cloud, CheckCircle2} from 'lucide-react'
import {STEAM_TYPES} from './constants'
import type {ScopeFormData, SteamType} from '@/types/scopeType'

interface SteamFormProps {
  /** 현재 폼 데이터 */
  formData: ScopeFormData
  /** 폼 데이터 업데이트 핸들러 */
  setFormData: (data: ScopeFormData) => void
}

/**
 * 스팀사용 데이터 입력 폼 컴포넌트 (Scope 2)
 *
 * 주요 기능:
 * - 스팀 타입 선택 (타입 A, B, C - 압력별 분류)
 * - 시설명, 시설 위치 입력
 * - 스팀 사용량 입력 (GJ 단위 고정)
 * - 각 스팀 타입별 배출계수 표시
 * - 실시간 유효성 검사 및 시각적 피드백
 */
export default function SteamForm({formData, setFormData}: SteamFormProps) {
  /**
   * 스팀 타입 변경 핸들러
   * 스팀 타입이 변경되면 사용량을 초기화하고 단위를 GJ로 설정
   */
  const handleSteamTypeChange = (steamType: SteamType) => {
    setFormData({
      ...formData,
      steam: {
        ...formData.steam!,
        steamType,
        facilityName: formData.steam?.facilityName || '',
        steamUsage: '', // 스팀 타입 변경시 사용량 초기화
        unit: 'GJ', // 스팀은 항상 GJ 단위
        createdBy: 'system'
      }
    })
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="p-4 space-y-6">
        {/* 스팀 타입 선택 */}
        <div>
          <Label className="flex items-center gap-1 mb-3 text-sm font-medium text-gray-700">
            스팀 타입
            <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {STEAM_TYPES.map(type => {
              const isSelected = formData.steam?.steamType === type.value

              return (
                <div
                  key={type.value}
                  className={`group p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected
                      ? 'border-customG bg-customGLight shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => handleSteamTypeChange(type.value)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`${type.label} 선택`}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSteamTypeChange(type.value)
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
                      className={`text-xs leading-relaxed mb-2 ${
                        isSelected
                          ? 'text-black'
                          : 'text-gray-600 group-hover:text-customG'
                      }`}>
                      {type.description}
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        isSelected
                          ? 'text-black'
                          : 'text-gray-700 group-hover:text-customG'
                      }`}>
                      {type.factor} tCO₂/GJ
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
              value={formData.steam?.facilityName || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  steam: {
                    ...formData.steam!,
                    facilityName: e.target.value
                  }
                })
              }
              placeholder="예: 스팀 보일러"
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
              value={formData.steam?.facilityLocation || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  steam: {
                    ...formData.steam!,
                    facilityLocation: e.target.value
                  }
                })
              }
              placeholder="예: 공장 지하 1층"
              className="border-gray-300 h-11 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* 스팀 사용량 입력 */}
        <div className="space-y-2">
          <Label
            htmlFor="steamUsage"
            className="flex items-center gap-1 text-sm font-medium text-gray-700">
            스팀 사용량
            <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="steamUsage"
              type="number"
              step="0.001"
              value={formData.steam?.steamUsage || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  steam: {
                    ...formData.steam!,
                    steamUsage: e.target.value
                  }
                })
              }
              placeholder="0.000"
              className="border-gray-300 h-11 focus:border-blue-500 focus:ring-blue-500/20"
            />
            <div className="flex items-center justify-center px-4 text-sm font-medium text-gray-700 border border-gray-200 rounded-md bg-gray-50 min-w-[80px]">
              GJ
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
