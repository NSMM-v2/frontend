'use client'

import {useState, useEffect, useCallback} from 'react'
import {Check, ChevronDown, Building2} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {Badge} from '@/components/ui/badge'
import {cn} from '@/lib/utils'
import {PartnerCompanyForScope} from '@/types/scopeType'

interface PartnerSelectorProps {
  selectedPartnerId?: string | null
  onSelect: (partnerId: string | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  includeInactive?: boolean
}

export function PartnerSelector({
  selectedPartnerId,
  onSelect,
  placeholder = '협력사를 선택하세요',
  disabled = false,
  className,
  includeInactive = false
}: PartnerSelectorProps) {
  const [open, setOpen] = useState(false)
  const [partners, setPartners] = useState<PartnerCompanyForScope[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const selectedPartner = partners.find(p => p.id === selectedPartnerId)

  // 파트너 회사 데이터를 PartnerCompanyForScope 형식으로 변환하는 함수
  const convertToPartnerCompanyForScope = useCallback(
    (partners: any[]): PartnerCompanyForScope[] => {
      const converted = partners.map(partner => {
        const name =
          partner.companyName || partner.corpName || partner.corp_name || '이름 없음'
        return {
          id: partner.id,
          name: name,
          status: partner.status || 'ACTIVE'
        }
      })
      return converted
    },
    []
  )

  // 파트너사 목록 로드 함수
  const loadPartners = useCallback(() => {
    setLoading(true)
    const dummyPartner: PartnerCompanyForScope = {
      id: 'dummy-1',
      name: '더미 협력사',
      status: 'ACTIVE'
    }
    setPartners([dummyPartner])
    setLoading(false)
  }, [])

  // 초기 파트너사 목록 로드
  useEffect(() => {
    loadPartners()
  }, [loadPartners])

  const handleSelect = (partner: PartnerCompanyForScope) => {
    onSelect(partner.id)
    setOpen(false)
  }

  const handleClear = () => {
    onSelect(null)
    setOpen(false)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default'
      case 'INACTIVE':
        return 'secondary'
      case 'SUSPENDED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '활성'
      case 'INACTIVE':
        return '비활성'
      case 'SUSPENDED':
        return '정지'
      default:
        return status
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between bg-white border-gray-200 hover:border-indigo-300 hover:bg-white',
            !selectedPartner && 'text-muted-foreground',
            className
          )}
          disabled={disabled}>
          {selectedPartner ? (
            <div className="flex gap-2 items-center">
              <span className="text-gray-800 truncate">{selectedPartner.name}</span>
            </div>
          ) : (
            <div className="flex gap-2 items-center">
              <span>{placeholder}</span>
            </div>
          )}
          <ChevronDown className="ml-2 w-4 h-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-white/95 backdrop-blur-sm border border-white/50 shadow-xl">
        <Command>
          <CommandInput
            placeholder="협력사 검색..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="p-1 my-1 border-0 focus-visible:ring-1 focus-visible:ring-indigo-500"
          />
          <CommandEmpty className="py-6 text-center text-gray-500">
            {loading ? '로딩 중...' : '협력사를 찾을 수 없습니다.'}
          </CommandEmpty>
          <CommandGroup className="overflow-auto p-2 max-h-64">
            {selectedPartner && (
              <CommandItem
                key="clear"
                onSelect={handleClear}
                className="flex justify-center items-center p-3 m-1 rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer text-slate-500 hover:bg-slate-50">
                선택 해제
              </CommandItem>
            )}
            {partners.map(partner => (
              <CommandItem
                key={partner.id}
                value={`${partner.name}`}
                onSelect={() => handleSelect(partner)}
                className={cn(
                  'flex items-center justify-between p-3 m-1 transition-all duration-200 rounded-lg cursor-pointer border-2',
                  selectedPartnerId === partner.id
                    ? 'bg-customG/5 border-customG text-customG'
                    : 'border-transparent hover:border-customG/20 hover:bg-customG/5'
                )}>
                <div className="flex flex-1 gap-3 items-center">
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200',
                      selectedPartnerId === partner.id
                        ? 'bg-customG/10 ring-1 ring-customG'
                        : 'bg-slate-50'
                    )}>
                    <Building2
                      className={cn(
                        'w-4 h-4',
                        selectedPartnerId === partner.id
                          ? 'text-customG'
                          : 'text-slate-400'
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      'font-medium',
                      selectedPartnerId === partner.id ? 'text-customG' : 'text-slate-700'
                    )}>
                    {partner.name}
                    {partner.status === 'INACTIVE' && (
                      <span className="ml-1 text-sm text-slate-400">(비활성)</span>
                    )}
                  </span>
                </div>
                {selectedPartnerId === partner.id && (
                  <Check className="w-4 h-4 text-customG" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
