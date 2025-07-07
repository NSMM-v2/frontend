'use client'

// ============================================================================
// 월 선택 드롭다운 컴포넌트 (MonthSelector)
// ----------------------------------------------------------------------------
// - ESG Scope 입력 폼에서 보고월 선택에 사용
// - 1~12월 중 하나를 선택, 선택값은 숫자(1~12)
// - Toss/NSMM 스타일의 Select UI 적용
// - 외부에서 선택값/콜백/플레이스홀더/비활성화/클래스명 지정 가능
// ============================================================================

// ============================================================================
// UI 컴포넌트 임포트 (Select 관련)
// ============================================================================
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {cn} from '@/lib/utils'

// ============================================================================
// Props 타입 정의 (Props Type Definition)
// ============================================================================
/**
 * MonthSelector 컴포넌트 Props
 * @property selectedMonth 현재 선택된 월 (1~12, null/undefined 허용)
 * @property onSelect 월 선택 시 호출되는 콜백 (숫자 1~12)
 * @property placeholder 플레이스홀더 텍스트 (기본값: '월을 선택하세요')
 * @property disabled 비활성화 여부 (기본값: false)
 * @property className 추가 CSS 클래스명
 */
interface MonthSelectorProps {
  selectedMonth?: number | null
  onSelect: (month: number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

// ============================================================================
// 월 상수 배열 (1~12월)
// ============================================================================
/**
 * MONTHS: 1~12월을 value/label 쌍으로 정의
 * - value: 실제 선택값(숫자)
 * - label: 사용자 표시용 한글 월명
 */
const MONTHS = [
  {value: 1, label: '1월'},
  {value: 2, label: '2월'},
  {value: 3, label: '3월'},
  {value: 4, label: '4월'},
  {value: 5, label: '5월'},
  {value: 6, label: '6월'},
  {value: 7, label: '7월'},
  {value: 8, label: '8월'},
  {value: 9, label: '9월'},
  {value: 10, label: '10월'},
  {value: 11, label: '11월'},
  {value: 12, label: '12월'}
]

// ============================================================================
// MonthSelector 컴포넌트 구현
// ============================================================================
/**
 * 월 선택 드롭다운 컴포넌트
 * - 1~12월 중 하나를 선택할 수 있음
 * - 외부에서 선택값, 콜백, 플레이스홀더, 비활성화, 클래스명 지정 가능
 * - Toss/NSMM 스타일의 Select UI 적용
 */
export function MonthSelector({
  selectedMonth,
  onSelect,
  placeholder = '월을 선택하세요',
  disabled = false,
  className
}: MonthSelectorProps) {
  return (
    // Select: 외부 라이브러리 기반 드롭다운
    <Select
      value={selectedMonth ? selectedMonth.toString() : undefined}
      onValueChange={value => onSelect(parseInt(value))}
      disabled={disabled}>
      {/* 드롭다운 트리거 (선택된 값/플레이스홀더 표시) */}
      <SelectTrigger
        className={cn(
          'bg-white border-gray-200 transition-all duration-200 hover:border-indigo-300 focus-visible:ring-indigo-500',
          className
        )}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      {/* 드롭다운 옵션 목록 */}
      <SelectContent className="border shadow-xl backdrop-blur-sm bg-white/95 border-white/50">
        {MONTHS.map(month => (
          <SelectItem
            key={month.value}
            value={month.value.toString()}
            className="transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50">
            {month.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
