/**
 * 파트너사 관리 기본 UI 컴포넌트들
 *
 * 이 파일은 파트너사 관리 페이지에서 사용되는 기본적인 UI 컴포넌트들을 포함합니다:
 * - 검색 섹션 (PartnerSearchSection)
 * - 로딩 상태 (PartnerLoadingState, PageLoadingState)
 * - 페이지네이션 (PartnerPagination)
 * - 빈 상태 (EmptyPartnerState, SearchEmptyState)
 *
 * 주요 기능:
 * - 파트너사 추가 버튼 제공
 * - 로딩 상태 시각화
 * - 페이지 네비게이션
 * - 빈 상태 안내 메시지
 *
 * @author ESG Project Team
 * @version 1.0
 * @since 2024
 * @lastModified 2024-12-20
 */

'use client'

import React from 'react'
import {Plus, Loader2, Users, Search, ChevronLeft, ChevronRight} from 'lucide-react'
import {Button} from '@/components/ui/button'

// ============================================================================
// 타입 정의 (Type Definitions)
// ============================================================================

interface PartnerSearchSectionProps {
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  onOpenAddDialog: () => void
}

interface PartnerPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

interface EmptyStateProps {
  onOpenAddDialog: () => void
}

interface SearchEmptyStateProps {
  searchQuery: string
}

// ============================================================================
// 검색 섹션 컴포넌트 (Search Section Component)
// ============================================================================

/**
 * 파트너사 검색 및 액션 버튼 섹션
 *
 * 기능:
 * - 새 파트너사 추가 버튼 제공
 * - 향후 검색 필터 기능 확장 가능한 구조
 */
export function PartnerSearchSection({onOpenAddDialog}: PartnerSearchSectionProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* 액션 버튼 영역 */}
      <div className="flex justify-end items-center w-full">
        <Button
          onClick={onOpenAddDialog}
          className="px-6 h-12 font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg transition-all duration-200 transform hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:scale-105">
          <Plus className="mr-2 w-5 h-5" />새 파트너사 추가
        </Button>
      </div>
    </div>
  )
}

// ============================================================================
// 로딩 상태 컴포넌트들 (Loading State Components)
// ============================================================================

/**
 * 파트너사 목록 로딩 상태 컴포넌트
 *
 * 파트너사 데이터를 불러올 때 표시되는 로딩 UI
 * 사용자에게 진행 상황을 알려주는 스피너와 메시지 포함
 */
export function PartnerLoadingState() {
  return (
    <div className="flex justify-center items-center p-16">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-lg font-medium text-slate-700">
          파트너사 목록을 불러오는 중...
        </p>
        <p className="mt-1 text-sm text-slate-500">잠시만 기다려주세요</p>
      </div>
    </div>
  )
}

/**
 * 페이지 전체 로딩 상태 컴포넌트
 *
 * 페이지 초기 로딩 시 화면 중앙에 표시되는 간단한 스피너
 */
export function PageLoadingState() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
    </div>
  )
}

// ============================================================================
// 페이지네이션 컴포넌트 (Pagination Component)
// ============================================================================

/**
 * 파트너사 목록 페이지네이션 컴포넌트
 *
 * 기능:
 * - 이전/다음 페이지 버튼
 * - 페이지 번호 직접 선택
 * - 페이지 수가 많을 때 생략 표시 (...)
 * - 현재 페이지 하이라이트
 *
 * 페이지가 1개 이하일 때는 렌더링하지 않음
 */
export function PartnerPagination({
  currentPage,
  totalPages,
  onPageChange
}: PartnerPaginationProps) {
  // 페이지가 1개 이하면 페이지네이션 숨김
  if (totalPages <= 1) return null

  return (
    <div className="flex gap-3 justify-center items-center pt-8 mt-8 border-t-2 border-slate-100">
      {/* 이전 페이지 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 h-10 font-medium rounded-lg border-2 transition-all duration-200 border-slate-200 hover:border-blue-500 hover:bg-blue-50">
        <ChevronLeft className="mr-1 w-4 h-4" />
        이전
      </Button>

      {/* 페이지 번호들 */}
      <div className="flex gap-1 items-center">
        {Array.from({length: totalPages}, (_, i) => i + 1)
          .filter(
            page =>
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
          )
          .map((page, index, array) => (
            <React.Fragment key={`page-${page}`}>
              {/* 페이지 사이 생략 표시 */}
              {index > 0 && array[index - 1] !== page - 1 && (
                <span className="px-2 text-slate-400">...</span>
              )}
              {/* 페이지 번호 버튼 */}
              <Button
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page)}
                className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                  currentPage === page
                    ? 'bg-blue-500 text-white border-blue-500 shadow-sm hover:bg-blue-600'
                    : 'border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50'
                }`}>
                {page}
              </Button>
            </React.Fragment>
          ))}
      </div>

      {/* 다음 페이지 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 h-10 font-medium rounded-lg border-2 transition-all duration-200 border-slate-200 hover:border-blue-500 hover:bg-blue-50">
        다음
        <ChevronRight className="ml-1 w-4 h-4" />
      </Button>
    </div>
  )
}

// ============================================================================
// 빈 상태 컴포넌트들 (Empty State Components)
// ============================================================================

/**
 * 파트너사가 없을 때 표시되는 빈 상태 컴포넌트
 *
 * 기능:
 * - 파트너사가 등록되지 않았음을 안내
 * - 첫 번째 파트너사 등록 버튼 제공
 * - 사용자 친화적인 메시지와 아이콘
 */
export function EmptyPartnerState({onOpenAddDialog}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border-2 shadow-sm border-slate-200">
      <div className="py-16 text-center">
        {/* 아이콘 */}
        <div className="flex justify-center items-center mx-auto mb-6 w-24 h-24 bg-gradient-to-br rounded-2xl from-slate-100 to-slate-200">
          <Users className="w-12 h-12 text-slate-400" />
        </div>

        {/* 메인 메시지 */}
        <h3 className="mb-2 text-2xl font-bold text-slate-800">
          아직 등록된 파트너사가 없습니다
        </h3>

        {/* 설명 메시지 */}
        <p className="mx-auto mb-8 max-w-md text-base text-slate-500">
          ESG 경영을 함께할 파트너사를 등록해보세요. DART 데이터베이스와 연동하여 손쉽게
          관리할 수 있습니다.
        </p>

        {/* 액션 버튼 */}
        <Button
          onClick={onOpenAddDialog}
          className="px-8 h-12 font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm transition-all duration-200 transform hover:from-blue-600 hover:to-blue-700 hover:shadow-sm hover:scale-105">
          <Plus className="mr-2 w-5 h-5" />첫 번째 파트너사 등록하기
        </Button>
      </div>
    </div>
  )
}

/**
 * 검색 결과가 없을 때 표시되는 빈 상태 컴포넌트
 *
 * 기능:
 * - 검색 결과가 없음을 안내
 * - 검색어를 강조 표시
 * - 다른 검색어 시도 안내
 */
export function SearchEmptyState({searchQuery}: SearchEmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border-2 shadow-sm border-slate-200">
      <div className="py-16 text-center">
        {/* 검색 아이콘 */}
        <div className="flex justify-center items-center mx-auto mb-6 w-24 h-24 bg-gradient-to-br rounded-2xl from-slate-100 to-slate-200">
          <Search className="w-12 h-12 text-slate-400" />
        </div>

        {/* 메인 메시지 */}
        <h3 className="mb-2 text-2xl font-bold text-slate-800">검색 결과가 없습니다</h3>

        {/* 검색어 포함 설명 */}
        <p className="mb-2 text-base text-slate-500">
          '<span className="font-semibold text-slate-700">{searchQuery}</span>'와 일치하는
          파트너사를 찾을 수 없습니다.
        </p>

        {/* 안내 메시지 */}
        <p className="text-sm text-slate-400">
          다른 검색어로 시도해보시거나, 새로운 파트너사를 등록해보세요.
        </p>
      </div>
    </div>
  )
}
