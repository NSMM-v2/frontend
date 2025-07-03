'use client'

import React, {useMemo, useState} from 'react'
import {MoreHorizontal, Edit3, Trash, Building2, UserPlus} from 'lucide-react'
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
import {PartnerCompany} from '@/types/partnerCompanyType'
import {cn} from '@/lib/utils'
import {updateAccountCreatedStatus} from '@/services/partnerCompanyService'
import {toast} from '@/hooks/use-toast'

interface PartnerTableProps {
  partners: PartnerCompany[]
  onEditPartner: (partner: PartnerCompany) => void
  onDeletePartner: (partner: PartnerCompany) => void
  onCreateAccount: (partner: PartnerCompany) => Promise<void>
  onRefresh?: () => Promise<void>
}

type SortKey = 'corpName' | 'dartCode' | 'stockCode' | 'contractStartDate'
type SortConfig = {key: SortKey | null; direction: 'asc' | 'desc' | null}

export function PartnerTable({
  partners,
  onEditPartner,
  onDeletePartner,
  onCreateAccount,
  onRefresh
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
      <span className={cn(baseStyle, 'font-bold text-blue-600')}>
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
    <div className="overflow-hidden bg-white rounded-2xl border-2 shadow-sm border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r border-b-2 from-slate-50 to-slate-100 border-slate-200">
            {[
              {label: '회사명', key: 'corpName'},
              {label: 'DART 코드', key: 'dartCode'},
              {label: '상장 정보', key: 'stockCode'},
              {label: '계약 시작일', key: 'contractStartDate'},
              {label: '계정 상태', key: 'accountStatus'}
            ].map(({label, key}) => (
              <TableHead
                key={key}
                onClick={() => key !== 'accountStatus' && handleSort(key as SortKey)}
                className={cn(
                  'px-6 text-base font-bold h-14 transition-colors',
                  key !== 'accountStatus'
                    ? 'cursor-pointer select-none hover:bg-slate-100'
                    : '',
                  sortConfig.key === key
                    ? 'bg-slate-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-800'
                )}>
                <div className="inline-flex items-center">
                  {label} {key !== 'accountStatus' && renderSortIcon(key as SortKey)}
                </div>
              </TableHead>
            ))}
            <TableHead className="px-6 h-14 text-base font-bold text-center text-slate-800">
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
            // 계정 생성 여부 확인 (accountCreated 필드 사용)
            const hasAccount = partner.accountCreated === true

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
                className="border-b transition-all duration-200 hover:bg-slate-50/80 border-slate-100 last:border-b-0">
                <TableCell className="px-6 h-16 text-base font-semibold text-slate-800">
                  <div className="flex gap-3 items-center">
                    <div className="flex justify-center items-center w-8 h-8 bg-blue-100 rounded-full ring-1 transition-all duration-300 ring-blue-600/30">
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                    </div>
                    {corpName}
                  </div>
                </TableCell>
                <TableCell className="px-6 h-16">
                  <code className="px-3 py-1 font-mono text-sm font-medium rounded-lg bg-slate-100 text-slate-700">
                    {dartCode}
                  </code>
                </TableCell>
                <TableCell className="px-6 h-16">
                  {isValid ? (
                    <Badge
                      variant="outline"
                      className="px-3 py-1 font-semibold text-blue-700 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div className="mr-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                      {String(stockCode).trim()}
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="px-3 py-1 font-semibold rounded-lg border-2 text-slate-600 bg-slate-100 border-slate-200">
                      <div className="mr-2 w-2 h-2 rounded-full bg-slate-400"></div>
                      비상장
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="px-6 h-16 font-medium text-slate-600">
                  {contractDate
                    ? new Date(contractDate).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : '-'}
                </TableCell>
                <TableCell className="px-6 h-16">
                  {hasAccount ? (
                    <Badge
                      variant="outline"
                      className="px-3 py-1 font-semibold text-green-700 bg-green-50 rounded-lg border-2 border-green-200">
                      <div className="mr-2 w-2 h-2 bg-green-500 rounded-full"></div>
                      계정 생성됨
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="px-3 py-1 font-semibold text-orange-700 bg-orange-50 rounded-lg border-2 border-orange-200">
                      <div className="mr-2 w-2 h-2 bg-orange-500 rounded-full"></div>
                      계정 없음
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="px-6 h-16 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-10 h-10 rounded-lg transition-colors hover:bg-slate-100">
                        <MoreHorizontal className="w-5 h-5 text-slate-600" />
                        <span className="sr-only">메뉴 열기</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="p-2 w-48 bg-white rounded-xl border-2 shadow-xl border-slate-200">
                      {!hasAccount && (
                        <DropdownMenuItem
                          onClick={async () => {
                            if (hasAccount) {
                              toast({
                                variant: 'destructive',
                                title: '계정 생성 실패',
                                description: '계정이 이미 존재합니다.'
                              })
                              return
                            }

                            try {
                              // 계정 생성 시도
                              await onCreateAccount(partner)

                              // 계정 생성이 성공했으면 accountCreated 상태 업데이트
                              if (partner.id) {
                                await updateAccountCreatedStatus(partner.id)
                                // 데이터 새로고침
                                if (onRefresh) {
                                  await onRefresh()
                                }
                                toast({
                                  title: '계정 생성 성공',
                                  description: '협력사 계정이 성공적으로 생성되었습니다.'
                                })
                              }
                            } catch (error) {
                              console.error('계정 생성 중 오류 발생:', error)
                              toast({
                                variant: 'destructive',
                                title: '계정 생성 실패',
                                description: '계정 생성 중 오류가 발생했습니다.'
                              })
                            }
                          }}
                          className="flex gap-3 items-center px-4 py-3 rounded-lg transition-colors cursor-pointer hover:bg-gray-100">
                          <UserPlus className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-700">계정 생성</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onEditPartner(partner)}
                        className="flex gap-3 items-center px-4 py-3 rounded-lg transition-colors cursor-pointer hover:bg-slate-50">
                        <Edit3 className="w-4 h-4 text-slate-600" />
                        <span className="font-medium text-slate-700">정보 수정</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeletePartner(partner)}
                        className="flex gap-3 items-center px-4 py-3 text-red-600 rounded-lg transition-colors cursor-pointer hover:bg-red-50 focus:text-red-600 focus:bg-red-50">
                        <Trash className="w-4 h-4" />
                        <span className="font-medium">협력사 삭제</span>
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
