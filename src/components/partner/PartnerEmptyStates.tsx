/**
 * 빈 상태 컴포넌트들
 */

import React from 'react'
import {Users, Search, Plus} from 'lucide-react'
import {Button} from '@/components/ui/button'

interface EmptyStateProps {
  onOpenAddDialog: () => void
}

interface SearchEmptyStateProps {
  searchQuery: string
}

export function EmptyPartnerState({onOpenAddDialog}: EmptyStateProps) {
  return (
    <div className="bg-white border-2 shadow-sm border-slate-200 rounded-2xl">
      <div className="py-16 text-center">
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl">
          <Users className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="mb-2 text-2xl font-bold text-slate-800">
          아직 등록된 파트너사가 없습니다
        </h3>
        <p className="max-w-md mx-auto mb-8 text-base text-slate-500">
          ESG 경영을 함께할 파트너사를 등록해보세요. DART 데이터베이스와 연동하여 손쉽게
          관리할 수 있습니다.
        </p>
        <Button
          onClick={onOpenAddDialog}
          className="h-12 px-8 font-semibold text-white transition-all duration-200 transform shadow-sm bg-gradient-to-r from-customG to-emerald-600 hover:from-customGDark hover:to-emerald-700 rounded-xl hover:shadow-sm hover:scale-105">
          <Plus className="w-5 h-5 mr-2" />첫 번째 파트너사 등록하기
        </Button>
      </div>
    </div>
  )
}

export function SearchEmptyState({searchQuery}: SearchEmptyStateProps) {
  return (
    <div className="bg-white border-2 shadow-sm border-slate-200 rounded-2xl">
      <div className="py-16 text-center">
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl">
          <Search className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="mb-2 text-2xl font-bold text-slate-800">검색 결과가 없습니다</h3>
        <p className="mb-2 text-base text-slate-500">
          '<span className="font-semibold text-slate-700">{searchQuery}</span>'와 일치하는
          파트너사를 찾을 수 없습니다.
        </p>
        <p className="text-sm text-slate-400">
          다른 검색어로 시도해보시거나, 새로운 파트너사를 등록해보세요.
        </p>
      </div>
    </div>
  )
}
