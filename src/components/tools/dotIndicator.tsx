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
    <div className="fixed z-50 flex flex-col gap-3 -translate-y-1/2 right-6 top-1/2">
      {Array.from({length: total}).map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick?.(i)}
          className={cn(
            'rounded-full border-2 transition-colors duration-300 hover:cursor-pointer',
            currentIndex === i
              ? 'w-4 h-6 bg-blue-500 border-blue-500'
              : 'w-4 h-4 bg-white border-gray-400'
          )}
          aria-label={`Go to section ${i + 1}`}
        />
      ))}
    </div>
  )
}
