/**
 * Scope 3 카테고리 선택 그리드 컴포넌트
 *
 * 주요 기능:
 * - 15개 Scope 3 카테고리를 그리드 형태로 표시
 * - 각 카테고리별 배출량 현황 표시
 * - 카테고리 클릭 시 데이터 입력 화면으로 이동
 * - 데이터 입력 여부에 따른 시각적 구분
 *
 * @author ESG Project Team
 * @version 1.0
 * @since 2024
 */

import React from 'react'
import {motion} from 'framer-motion'
import {Card, CardHeader, CardTitle} from '@/components/ui/card'

/**
 * Scope 3 카테고리 목록 (15개 카테고리)
 */
export const scope3CategoryList = {
  list1: '구매한 상품 및 서비스',
  list2: '자본재',
  list3: '연료 및 에너지 관련 활동',
  list4: '업스트림 운송 및 유통',
  list5: '폐기물 처리',
  list6: '사업장 관련 활동',
  list7: '직원 통근',
  list8: '출장',
  list9: '다운스트림 및 유통',
  list10: '판매 후 처리',
  list11: '제품 사용',
  list12: '제품 폐기',
  list13: '임대 자산',
  list14: '프랜차이즈',
  list15: '투자'
} as const

export type Scope3CategoryKey = keyof typeof scope3CategoryList

/**
 * CategorySelector 컴포넌트 Props 타입
 */
interface CategorySelectorProps {
  /** 카테고리별 배출량 총계 함수 */
  getTotalEmission: (category: Scope3CategoryKey) => number
  /** 카테고리 선택 핸들러 */
  onCategorySelect: (category: Scope3CategoryKey) => void
  /** 애니메이션 지연 시간 (초) */
  animationDelay?: number
}

/**
 * CategorySelector 컴포넌트
 * 15개 Scope 3 카테고리를 그리드 형태로 표시하고 선택할 수 있게 하는 컴포넌트
 */
export function CategorySelector({
  getTotalEmission,
  onCategorySelect,
  animationDelay = 0
}: CategorySelectorProps) {
  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      transition={{delay: animationDelay, duration: 0.6}}
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Object.entries(scope3CategoryList).map(([key, value], index) => {
        const emission = getTotalEmission(key as Scope3CategoryKey)
        const hasData = emission > 0

        return (
          <motion.div
            key={key}
            initial={{opacity: 0, scale: 0.9}}
            animate={{opacity: 1, scale: 1}}
            transition={{
              delay: animationDelay + index * 0.05,
              duration: 0.4,
              type: 'spring',
              stiffness: 100
            }}>
            <Card
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                hasData
                  ? 'bg-gradient-to-br from-blue-50 to-emerald-50 border-blue-200 shadow-md'
                  : 'bg-white hover:border-customG-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-25'
              }`}
              onClick={() => onCategorySelect(key as Scope3CategoryKey)}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  {/* 카테고리 정보 */}
                  <div className="flex-1">
                    {/* 카테고리 번호 */}
                    <div className="mb-2 text-xs font-medium text-customG-500">
                      카테고리 {key.replace('list', '')}
                    </div>
                    {/* 카테고리 제목 */}
                    <CardTitle className="text-sm leading-tight text-customG-800 hover:text-blue-700 transition-colors">
                      {value}
                    </CardTitle>
                  </div>

                  {/* 배출량 정보 */}
                  <div className="ml-3 text-right">
                    <div
                      className={`text-lg font-bold transition-colors ${
                        hasData ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                      {emission.toFixed(1)}
                    </div>
                    <div className="text-xs text-customG-500">kgCO₂</div>
                  </div>
                </div>

                {/* 데이터 상태 표시 */}
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                  <div
                    className={`flex items-center text-xs ${
                      hasData ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                    <div
                      className={`mr-2 w-2 h-2 rounded-full ${
                        hasData ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                    {hasData ? '데이터 입력됨' : '데이터 없음'}
                  </div>

                  {/* 진행 화살표 */}
                  <div
                    className={`text-xs transition-colors ${
                      hasData ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                    →
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
