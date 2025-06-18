'use client'

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Fuel, CheckCircle2} from 'lucide-react'
import {EMISSION_ACTIVITY_TYPES} from './constants'
import type {EmissionActivityType} from '@/types/scopeType'

interface ActivityTypeSelectorProps {
  /** 현재 선택된 배출 활동 유형 */
  selectedActivityType: EmissionActivityType
  /** 배출 활동 유형 변경 핸들러 */
  onActivityTypeChange: (activityType: EmissionActivityType) => void
  /** 현재 스코프 (SCOPE1 또는 SCOPE2) */
  scope: 'SCOPE1' | 'SCOPE2'
}

/**
 * 배출 활동 유형 선택 컴포넌트
 *
 * 주요 기능:
 * - 스코프에 따라 필터링된 배출 활동 유형 표시
 * - 각 활동 유형별 아이콘과 설명 제공
 * - 선택된 항목 시각적 강조 표시
 * - 클릭으로 활동 유형 변경 가능
 */
export default function ActivityTypeSelector({
  selectedActivityType,
  onActivityTypeChange,
  scope
}: ActivityTypeSelectorProps) {
  // 현재 스코프에 해당하는 활동 유형만 필터링
  const filteredActivityTypes = EMISSION_ACTIVITY_TYPES.filter(
    type => type.scope === scope
  )

  return (
    <Card className="mb-6 border-none shadow-none">
      <CardContent>
        <div className="flex flex-row justify-between w-full gap-4">
          {filteredActivityTypes.map(item => {
            const IconComponent = item.icon
            const isSelected = selectedActivityType === item.value

            return (
              <div
                key={item.value}
                className={`group relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 flex-1 ${
                  isSelected
                    ? 'border-customG bg-customGLight shadow-md'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                }`}
                onClick={() => onActivityTypeChange(item.value)}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`${item.label} 선택`}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onActivityTypeChange(item.value)
                  }
                }}>
                {/* 선택 상태 표시 아이콘 */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-customG">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}

                {/* 활동 유형 정보 */}
                <div className="flex flex-col items-center text-center">
                  <IconComponent
                    className={`w-8 h-8 mb-2 ${
                      isSelected ? 'text-black' : 'text-gray-600 group-hover:text-customG'
                    }`}
                  />
                  <div
                    className={`text-sm font-medium mb-1 ${
                      isSelected ? 'text-black' : 'text-gray-900 group-hover:text-customG'
                    }`}>
                    {item.label}
                  </div>
                  <div
                    className={`text-xs ${
                      isSelected ? 'text-black' : 'text-gray-500 group-hover:text-customG'
                    }`}>
                    {item.description}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
