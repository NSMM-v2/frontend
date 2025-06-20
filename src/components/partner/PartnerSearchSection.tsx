/**
 * 파트너사 검색 및 필터 섹션 컴포넌트
 */

import React from 'react'
import {Plus} from 'lucide-react'
import {Button} from '@/components/ui/button'

interface PartnerSearchSectionProps {
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  onOpenAddDialog: () => void
}

export function PartnerSearchSection({onOpenAddDialog}: PartnerSearchSectionProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* 액션 버튼 영역 */}
      <div className="flex items-center justify-end w-full">
        <Button
          onClick={onOpenAddDialog}
          className="h-12 px-6 font-semibold text-white transition-all duration-200 transform shadow-lg bg-gradient-to-r from-customG to-emerald-600 hover:from-customGDark hover:to-emerald-700 rounded-xl hover:shadow-xl hover:scale-105">
          <Plus className="w-5 h-5 mr-2" />새 파트너사 추가
        </Button>
      </div>
    </div>
  )
}
