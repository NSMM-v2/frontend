'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, CalendarDays } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ScopeType } from '@/types/scopeTypes'

// ============================================================================
// 타입 정의 (Type Definitions)
// ============================================================================

interface PeriodSummaryCardProps {
  /** Scope 타입 (SCOPE1, SCOPE2, SCOPE3) */
  scopeType: ScopeType
  /** 선택된 보고년도 */
  selectedYear: number
  /** 선택된 보고월 (null이면 연간 총합 표시) */
  selectedMonth: number | null
  /** 해당 기간의 총 배출량 */
  totalEmission: number
  /** 로딩 상태 */
  isLoading?: boolean
  /** 데이터 건수 (옵션) */
  dataCount?: number
  /** 추가 CSS 클래스 */
  className?: string
}

// ============================================================================
// 유틸리티 함수 (Utility Functions)
// ============================================================================

/**
 * Scope 타입별 색상 반환
 */
const getScopeColor = (scopeType: ScopeType) => {
  switch (scopeType) {
    case 'SCOPE1':
      return 'from-red-500 to-red-600'
    case 'SCOPE2':
      return 'from-yellow-500 to-orange-600'
    case 'SCOPE3':
      return 'from-blue-500 to-blue-600'
    default:
      return 'from-gray-500 to-gray-600'
  }
}

/**
 * Scope 타입별 한글명 반환
 */
const getScopeName = (scopeType: ScopeType) => {
  switch (scopeType) {
    case 'SCOPE1':
      return 'Scope 1 (직접배출)'
    case 'SCOPE2':
      return 'Scope 2 (간접배출)'
    case 'SCOPE3':
      return 'Scope 3 (기타간접배출)'
    default:
      return scopeType
  }
}

/**
 * 기간 텍스트 생성
 */
const getPeriodText = (year: number, month: number | null) => {
  if (month === null) {
    return `${year}년 연간`
  }
  return `${year}년 ${month}월`
}

/**
 * 숫자 포맷팅 (천단위 콤마)
 */
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

// ============================================================================
// PeriodSummaryCard 컴포넌트
// ============================================================================

export const PeriodSummaryCard: React.FC<PeriodSummaryCardProps> = ({
  scopeType,
  selectedYear,
  selectedMonth,
  totalEmission,
  isLoading = false,
  dataCount,
  className = ''
}) => {
  const scopeColor = getScopeColor(scopeType)
  const scopeName = getScopeName(scopeType)
  const periodText = getPeriodText(selectedYear, selectedMonth)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg">
        <div className={`absolute inset-0 bg-gradient-to-r ${scopeColor} opacity-90`} />
        <CardContent className="relative p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* 기간 정보 */}
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="w-4 h-4" />
                <span className="text-sm font-medium opacity-90">
                  {periodText} 배출량
                </span>
              </div>

              {/* Scope 타입 */}
              <h3 className="text-lg font-semibold mb-1">
                {scopeName}
              </h3>

              {/* 배출량 표시 */}
              <div className="flex items-baseline gap-2">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">조회중...</span>
                  </div>
                ) : (
                  <>
                    <span className="text-2xl font-bold">
                      {formatNumber(totalEmission)}
                    </span>
                    <span className="text-sm opacity-90">tCO₂eq</span>
                  </>
                )}
              </div>

              {/* 데이터 건수 (옵션) */}
              {dataCount !== undefined && !isLoading && (
                <div className="mt-2 text-xs opacity-75">
                  총 {dataCount}건의 데이터
                </div>
              )}
            </div>

            {/* 아이콘 */}
            <div className="flex-shrink-0">
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}