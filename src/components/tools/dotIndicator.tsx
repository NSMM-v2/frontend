/**
 * DotIndicator - 섹션 네비게이션 인디케이터
 *
 * 심플하고 모던한 디자인의 도트 네비게이션
 * Toss 스타일의 미니멀한 UI 적용
 *
 * 주요 기능:
 * - 현재 섹션 시각적 표시
 * - 클릭으로 섹션 이동
 * - 부드러운 애니메이션 효과
 */

'use client'

import {cn} from '@/lib/utils'

interface DotIndicatorProps {
  total: number
  currentIndex: number
  onDotClick?: (index: number) => void
}

export default function DotIndicator({
  total,
  currentIndex,
  onDotClick
}: DotIndicatorProps) {
  return (
    <div className="fixed z-50 flex flex-col gap-2 -translate-y-1/2 right-8 top-1/2">
      {Array.from({length: total}).map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick?.(i)}
          className={cn(
            'rounded-full transition-all duration-300 ease-out hover:scale-110',
            'focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50',
            currentIndex === i
              ? 'w-3 h-8 bg-blue-400 shadow-lg' // 활성 상태: 세로로 긴 형태
              : 'w-3 h-3 bg-gray-300 hover:bg-gray-400' // 비활성 상태: 작은 원형
          )}
          aria-label={`섹션 ${i + 1}로 이동`}
        />
      ))}
    </div>
  )
}
