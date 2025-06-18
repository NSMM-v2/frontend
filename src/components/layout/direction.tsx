'use client'

import {ChevronLeft, ChevronRight} from 'lucide-react'
import {cn} from '@/lib/utils'
import {useRouter} from 'next/navigation'
import {Button} from '@/components/ui/button'

type PositionType =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'middle-left'
  | 'middle-right'

type DirectionButtonProps = {
  direction: 'left' | 'right'
  onClick?: () => void
  className?: string
  size?: number
  color?: string
  tooltip?: string
  href?: string
  fixed?: boolean
  position?: PositionType
}

/**
 * DirectionButton 컴포넌트
 *
 * 방향 버튼을 고정된 위치 또는 인라인으로 표시합니다.
 * size에 따라 아이콘 및 버튼 크기를 자동 조정합니다.
 */
export function DirectionButton({
  direction,
  onClick,
  className,
  size = 20,
  color = 'text-gray-600',
  tooltip,
  href,
  fixed = false,
  position = 'bottom-right'
}: DirectionButtonProps) {
  const router = useRouter()
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight

  const handleClick = () => {
    if (onClick) return onClick()
    if (href) router.push(href)
  }

  // 버튼 크기 Tailwind 클래스로 조절
  const buttonSizeClass =
    size >= 60
      ? 'w-16 h-16'
      : size >= 48
      ? 'w-12 h-12'
      : size >= 40
      ? 'w-10 h-10'
      : 'w-8 h-8'

  // 위치 고정 클래스
  const fixedPositionClass = fixed
    ? cn(
        'fixed z-50',
        position === 'top-left' && 'top-4 left-4',
        position === 'top-right' && 'top-4 right-4',
        position === 'bottom-left' && 'bottom-4 left-4',
        position === 'bottom-right' && 'bottom-4 right-4',
        position === 'middle-left' && 'top-1/2 left-4 -translate-y-1/2',
        position === 'middle-right' && 'top-1/2 right-4 -translate-y-1/2'
      )
    : ''

  return (
    <Button
      variant="ghost"
      className={cn(
        'hover:bg-gray-200',
        color,
        fixedPositionClass,
        buttonSizeClass,
        className
      )}
      onClick={handleClick}
      title={tooltip}
      aria-label={tooltip}>
      <Icon style={{width: size, height: size}} className={cn(color)} />
    </Button>
  )
}
