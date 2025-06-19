'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {cn} from '@/lib/utils'

interface MonthSelectorProps {
  selectedMonth?: number | null
  onSelect: (month: number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

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

export function MonthSelector({
  selectedMonth,
  onSelect,
  placeholder = '월을 선택하세요',
  disabled = false,
  className
}: MonthSelectorProps) {
  return (
    <Select
      value={selectedMonth ? selectedMonth.toString() : undefined}
      onValueChange={value => onSelect(parseInt(value))}
      disabled={disabled}>
      <SelectTrigger
        className={cn(
          'bg-white border-gray-200 hover:border-indigo-300 focus-visible:ring-indigo-500 transition-all duration-200',
          className
        )}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="border shadow-xl bg-white/95 backdrop-blur-sm border-white/50">
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
