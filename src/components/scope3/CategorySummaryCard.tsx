/**
 * 카테고리 배출량 요약 카드 컴포넌트
 *
 * 주요 기능:
 * - 전체 Scope 3 배출량 총계 표시
 * - 실시간 배출량 업데이트 반영
 * - 시각적으로 강조된 요약 정보 제공
 *
 * @author ESG Project Team
 * @version 1.0
 * @since 2024
 */

import React from 'react'
import {motion} from 'framer-motion'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {TrendingUp} from 'lucide-react'

/**
 * CategorySummaryCard 컴포넌트 Props 타입
 */
interface CategorySummaryCardProps {
  /** 전체 배출량 총계 (kgCO₂ 단위) */
  totalEmission: number
  /** 애니메이션 지연 시간 (초) */
  animationDelay?: number
}

/**
 * CategorySummaryCard 컴포넌트
 * Scope 3 전체 배출량을 요약해서 보여주는 카드
 */
export function CategorySummaryCard({
  totalEmission,
  animationDelay = 0
}: CategorySummaryCardProps) {
  return (
    <motion.div
      initial={{opacity: 0, scale: 0.95}}
      animate={{opacity: 1, scale: 1}}
      transition={{delay: animationDelay, duration: 0.5}}
      className="max-w-md">
      <Card className="justify-center h-24 bg-gradient-to-br from-blue-50 to-white border-blue-100">
        <CardContent className="flex items-center p-4">
          <div className="p-2 mr-3 bg-blue-100 rounded-full">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">전체 Scope 3 배출량</p>
            <h3 className="text-2xl font-bold">
              {totalEmission.toLocaleString(undefined, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
              })}
              <span className="ml-1 text-sm font-normal text-gray-500">kgCO₂eq</span>
            </h3>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
