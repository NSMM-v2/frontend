/**
 * 페이지네이션 컴포넌트
 */

import React from 'react'
import {ChevronLeft, ChevronRight} from 'lucide-react'
import {Button} from '@/components/ui/button'

interface PartnerPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PartnerPagination({
  currentPage,
  totalPages,
  onPageChange
}: PartnerPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-3 pt-8 mt-8 border-t-2 border-slate-100">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-10 px-4 font-medium transition-all duration-200 border-2 rounded-lg border-slate-200 hover:border-customG hover:bg-customG/5">
        <ChevronLeft className="w-4 h-4 mr-1" />
        이전
      </Button>

      <div className="flex items-center gap-1">
        {Array.from({length: totalPages}, (_, i) => i + 1)
          .filter(
            page =>
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
          )
          .map((page, index, array) => (
            <React.Fragment key={`page-${page}`}>
              {index > 0 && array[index - 1] !== page - 1 && (
                <span className="px-2 text-slate-400">...</span>
              )}
              <Button
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page)}
                className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                  currentPage === page
                    ? 'bg-customG text-white border-customG shadow-sm hover:bg-customGDark'
                    : 'border-2 border-slate-200 hover:border-customG hover:bg-customG/5'
                }`}>
                {page}
              </Button>
            </React.Fragment>
          ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-10 px-4 font-medium transition-all duration-200 border-2 rounded-lg border-slate-200 hover:border-customG hover:bg-customG/5">
        다음
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  )
}
