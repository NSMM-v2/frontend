'use client'

import React, {useMemo, useState} from 'react'
import {MoreHorizontal, Edit3, Trash, Building2} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {PartnerCompany} from '@/types/IFRS/partnerCompany'
import {cn} from '@/lib/utils'

interface PartnerTableProps {
  partners: PartnerCompany[]
  onEditPartner: (partner: PartnerCompany) => void
  onDeletePartner: (partner: PartnerCompany) => void
}

type SortKey = 'corpName' | 'dartCode' | 'stockCode' | 'contractStartDate'
type SortConfig = {key: SortKey | null; direction: 'asc' | 'desc' | null}

export function PartnerTable({
  partners,
  onEditPartner,
  onDeletePartner
}: PartnerTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: null
  })

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const renderSortIcon = (key: SortKey) => {
    const baseStyle = 'ml-1 text-xs relative top-[1px]'
    if (sortConfig.key !== key)
      return <span className={cn(baseStyle, 'text-slate-400')}>⇅</span>
    return (
      <span className={cn(baseStyle, 'font-bold text-customG')}>
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  const sortedPartners = useMemo(() => {
    const isValidStockCode = (code?: string | number | null): boolean => {
      const str = String(code || '').trim()
      return (
        /^\d{6}$/.test(str) &&
        !['000000', 'n/a', 'null', 'undefined'].includes(str.toLowerCase())
      )
    }

    if (!sortConfig.key) return partners

    return [...partners].sort((a, b) => {
      const dir = sortConfig.direction === 'asc' ? 1 : -1
      switch (sortConfig.key) {
        case 'corpName': {
          const nameA = String(a.corpName || a.companyName || '')
          const nameB = String(b.corpName || b.companyName || '')
          return nameA.localeCompare(nameB, 'ko-KR') * dir
        }
        case 'dartCode': {
          const codeA = String(a.corpCode || a.corp_code || '')
          const codeB = String(b.corpCode || b.corp_code || '')
          return codeA.localeCompare(codeB) * dir
        }
        case 'stockCode': {
          const aValid = isValidStockCode(a.stockCode || a.stock_code)
          const bValid = isValidStockCode(b.stockCode || b.stock_code)
          return (Number(aValid) - Number(bValid)) * dir
        }
        case 'contractStartDate': {
          const dateA = new Date(
            a.contractStartDate || a.contract_start_date || ''
          ).getTime()
          const dateB = new Date(
            b.contractStartDate || b.contract_start_date || ''
          ).getTime()
          return (dateA - dateB) * dir
        }
        default:
          return 0
      }
    })
  }, [partners, sortConfig])

  return (
    <div className="overflow-hidden bg-white border-2 shadow-sm border-slate-200 rounded-2xl">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
            {[
              {label: '회사명', key: 'corpName'},
              {label: 'DART 코드', key: 'dartCode'},
              {label: '상장 정보', key: 'stockCode'},
              {label: '계약 시작일', key: 'contractStartDate'}
            ].map(({label, key}) => (
              <TableHead
                key={key}
                onClick={() => handleSort(key as SortKey)}
                className={cn(
                  'px-6 text-base font-bold h-14 cursor-pointer select-none transition-colors',
                  'hover:bg-slate-100',
                  sortConfig.key === key
                    ? 'bg-slate-50 text-customG border-b-2 border-customG'
                    : 'text-slate-800'
                )}>
                <div className="inline-flex items-center">
                  {label} {renderSortIcon(key as SortKey)}
                </div>
              </TableHead>
            ))}
            <TableHead className="px-6 text-base font-bold text-center h-14 text-slate-800">
              관리
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPartners.map((partner, index) => {
            const stockCode = partner.stockCode || partner.stock_code
            const corpName = partner.corpName || partner.companyName
            const dartCode = partner.corpCode || partner.corp_code
            const contractDate = partner.contract_start_date || partner.contractStartDate

            const isValid = (() => {
              const str = String(stockCode || '').trim()
              return (
                /^\d{6}$/.test(str) &&
                !['000000', 'n/a', 'null', 'undefined'].includes(str.toLowerCase())
              )
            })()

            return (
              <TableRow
                key={partner.id || `partner-${index}`}
                className="transition-all duration-200 border-b hover:bg-slate-50/80 border-slate-100 last:border-b-0">
                <TableCell className="h-16 px-6 text-base font-semibold text-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 transition-all duration-300 rounded-full bg-customG/10 ring-1 ring-customG/30">
                      <Building2 className="w-4 h-4 text-customG shrink-0" />
                    </div>
                    {corpName}
                  </div>
                </TableCell>
                <TableCell className="h-16 px-6">
                  <code className="px-3 py-1 font-mono text-sm font-medium rounded-lg bg-slate-100 text-slate-700">
                    {dartCode}
                  </code>
                </TableCell>
                <TableCell className="h-16 px-6">
                  {isValid ? (
                    <Badge
                      variant="outline"
                      className="px-3 py-1 font-semibold border-2 rounded-lg text-emerald-700 bg-emerald-50 border-emerald-200">
                      <div className="w-2 h-2 mr-2 rounded-full bg-emerald-500"></div>
                      {String(stockCode).trim()}
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="px-3 py-1 font-semibold border-2 rounded-lg text-slate-600 bg-slate-100 border-slate-200">
                      <div className="w-2 h-2 mr-2 rounded-full bg-slate-400"></div>
                      비상장
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="h-16 px-6 font-medium text-slate-600">
                  {contractDate
                    ? new Date(contractDate).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : '-'}
                </TableCell>
                <TableCell className="h-16 px-6 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-10 h-10 transition-colors rounded-lg hover:bg-slate-100">
                        <MoreHorizontal className="w-5 h-5 text-slate-600" />
                        <span className="sr-only">메뉴 열기</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 p-2 bg-white border-2 shadow-xl border-slate-200 rounded-xl">
                      <DropdownMenuItem
                        onClick={() => onEditPartner(partner)}
                        className="flex items-center gap-3 px-4 py-3 transition-colors rounded-lg cursor-pointer hover:bg-slate-50">
                        <Edit3 className="w-4 h-4 text-slate-600" />
                        <span className="font-medium text-slate-700">정보 수정</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeletePartner(partner)}
                        className="flex items-center gap-3 px-4 py-3 text-red-600 transition-colors rounded-lg cursor-pointer hover:bg-red-50 focus:text-red-600 focus:bg-red-50">
                        <Trash className="w-4 h-4" />
                        <span className="font-medium">파트너사 삭제</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
