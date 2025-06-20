'use client'

import {Label} from '@/components/ui/label'
import {CheckCircle2} from 'lucide-react'
import {PURPOSE_CATEGORIES, MOBILE_PURPOSE_CATEGORIES} from './constants'
import type {PurposeCategory} from '@/types/scopeType'

interface PurposeSelectorProps {
  /** 현재 선택된 용도 구분 */
  selectedPurpose: PurposeCategory | undefined
  /** 용도 구분 변경 핸들러 */
  onPurposeChange: (purpose: PurposeCategory) => void
  /** 활동 유형 (고정연소 또는 이동연소) */
  activityType: 'STATIONARY_COMBUSTION' | 'MOBILE_COMBUSTION'
}

/**
 * 용도 구분 선택 컴포넌트
 *
 * 주요 기능:
 * - 활동 유형에 따라 다른 용도 카테고리 표시
 * - 고정연소: 상업용, 산업용, 주거용, 공공용
 * - 이동연소: 영업용, 산업용, 개인용, 공공용
 * - 선택된 항목 시각적 강조 표시
 * - 클릭으로 용도 변경 가능
 */
export default function PurposeSelector({
  selectedPurpose,
  onPurposeChange,
  activityType
}: PurposeSelectorProps) {
  // 활동 유형에 따라 다른 카테고리 사용
  const categories =
    activityType === 'MOBILE_COMBUSTION' ? MOBILE_PURPOSE_CATEGORIES : PURPOSE_CATEGORIES

  return (
    <div>
      <Label className="flex items-center gap-1 mb-3 text-sm font-medium text-gray-700">
        용도 구분
        <span className="text-red-500">*</span>
      </Label>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {categories.map(category => {
          const isSelected = selectedPurpose === category.value

          return (
            <div
              key={category.value}
              className={`group p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? 'border-customG bg-customGLight shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 hover:text-customG'
              }`}
              onClick={() => onPurposeChange(category.value)}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`${category.label} 선택`}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onPurposeChange(category.value)
                }
              }}>
              <div className="relative">
                <div className={`text-sm font-medium mb-1`}>{category.label}</div>
                <div className={`text-xs leading-relaxed`}>{category.description}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
