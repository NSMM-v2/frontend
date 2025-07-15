'use client'

import React, {useMemo, useState} from 'react'
import {
  MoreHorizontal,
  Edit3,
  Trash,
  Building2,
  UserPlus,
  AlertCircle,
  User,
  MapPin,
  Phone,
  Globe,
  Code,
  TrendingUp,
  Package
} from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {PartnerCompany, MaterialCodeModalState, MaterialCodeCreateRequest, MaterialCodeUpdateRequest, MaterialCodeBatchCreateRequest} from '@/types/partnerCompanyType'
import {cn} from '@/lib/utils'
import {updateAccountCreatedStatus} from '@/services/partnerCompanyService'
import {toast} from '@/hooks/use-toast'
import {MaterialCodeModal} from './MaterialCodeModal'

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

  // 회사정보 다이얼로그 상태 관리
  const [isCompanyInfoDialogOpen, setIsCompanyInfoDialogOpen] = useState(false)
  const [selectedCompanyForInfo, setSelectedCompanyForInfo] =
    useState<PartnerCompany | null>(null)

  // 자재코드 모달 상태 관리
  const [materialCodeModalState, setMaterialCodeModalState] = useState<MaterialCodeModalState>({
    isOpen: false,
    mode: 'create'
  })
  const [isMaterialCodeSubmitting, setIsMaterialCodeSubmitting] = useState(false)
  const [materialCodeError, setMaterialCodeError] = useState<string | null>(null)

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // 자재코드 모달 열기 함수
  const openMaterialCodeModal = (partner: PartnerCompany) => {
    setMaterialCodeModalState({
      isOpen: true,
      mode: 'create', // batch 모드 대신 create 모드로 설정
      partnerId: partner.id || partner.partnerId?.toString(),
      partnerName: partner.corpName || partner.companyName
    })
    setMaterialCodeError(null)
  }

  // 자재코드 모달 닫기 함수
  const closeMaterialCodeModal = () => {
    setMaterialCodeModalState({
      isOpen: false,
      mode: 'create'
    })
    setMaterialCodeError(null)
  }

  // 자재코드 저장 함수
  const handleMaterialCodeSave = async (data: MaterialCodeCreateRequest | MaterialCodeUpdateRequest | MaterialCodeBatchCreateRequest) => {
    setIsMaterialCodeSubmitting(true)
    setMaterialCodeError(null)

    try {
      // TODO: 실제 API 호출 구현
      console.log('자재코드 저장:', data)
      console.log('협력사 정보:', materialCodeModalState.partnerId, materialCodeModalState.partnerName)
      
      // 저장 타입 확인
      if ('materialCodes' in data) {
        // 다중 자재코드 저장
        console.log('다중 자재코드 저장:', data.materialCodes.length, '개')
        toast({
          title: '자재코드 관리',
          description: `${data.materialCodes.length}개의 자재코드가 성공적으로 저장되었습니다.`
        })
      } else if ('materialCode' in data) {
        // 단일 자재코드 생성
        console.log('단일 자재코드 생성:', data.materialCode)
        toast({
          title: '자재코드 관리',
          description: '자재코드가 성공적으로 저장되었습니다.'
        })
      } else {
        // 자재코드 수정
        console.log('자재코드 수정')
        toast({
          title: '자재코드 관리',
          description: '자재코드가 성공적으로 수정되었습니다.'
        })
      }
      
      // 임시 딜레이 (실제 구현에서는 제거)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      closeMaterialCodeModal()
    } catch (error) {
      console.error('자재코드 저장 실패:', error)
      setMaterialCodeError('자재코드 저장 중 오류가 발생했습니다.')
      toast({
        variant: 'destructive',
        title: '자재코드 저장 실패',
        description: '자재코드 저장 중 오류가 발생했습니다.'
      })
    } finally {
      setIsMaterialCodeSubmitting(false)
    }
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
    <div className="overflow-hidden bg-white border-2 shadow-sm rounded-2xl border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
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
                className="transition-all duration-200 border-b hover:bg-slate-50/80 border-slate-100 last:border-b-0">
                <TableCell className="h-16 px-6 text-base font-semibold text-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 transition-all duration-300 bg-blue-100 rounded-full ring-1 ring-blue-600/30">
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                    </div>
                    <span className="flex-1">{corpName}</span>
                    <AlertCircle
                      className="w-4 h-4 text-blue-500 transition-colors cursor-pointer hover:text-blue-700"
                      onClick={() => {
                        setSelectedCompanyForInfo(partner)
                        setIsCompanyInfoDialogOpen(true)
                      }}
                    />
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
                      className="px-3 py-1 font-semibold text-blue-700 border-2 border-blue-200 rounded-lg bg-blue-50">
                      <div className="w-2 h-2 mr-2 bg-blue-500 rounded-full"></div>
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
                <TableCell className="h-16 px-6">
                  {hasAccount ? (
                    <Badge
                      variant="outline"
                      className="px-3 py-1 font-semibold text-green-700 border-2 border-green-200 rounded-lg bg-green-50">
                      <div className="w-2 h-2 mr-2 bg-green-500 rounded-full"></div>
                      계정 생성됨
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="px-3 py-1 font-semibold text-orange-700 border-2 border-orange-200 rounded-lg bg-orange-50">
                      <div className="w-2 h-2 mr-2 bg-orange-500 rounded-full"></div>
                      계정 없음
                    </Badge>
                  )}
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
                      className="w-48 p-2 bg-white border-2 shadow-xl rounded-xl border-slate-200">
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
                          className="flex items-center gap-3 px-4 py-3 transition-colors rounded-lg cursor-pointer hover:bg-gray-100">
                          <UserPlus className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-700">계정 생성</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => openMaterialCodeModal(partner)}
                        className="flex items-center gap-3 px-4 py-3 transition-colors rounded-lg cursor-pointer hover:bg-slate-50">
                        <Package className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-700">자재코드 관리</span>
                      </DropdownMenuItem>
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

      {/* 회사정보 다이얼로그 */}
      <Dialog open={isCompanyInfoDialogOpen} onOpenChange={setIsCompanyInfoDialogOpen}>
        <DialogContent className="max-w-2xl border-2 shadow-2xl bg-gradient-to-br from-white to-slate-50 rounded-2xl border-slate-200">
          <DialogHeader className="pb-6 border-b-2 border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 transition-all duration-300 bg-blue-100 rounded-full ring-2 ring-blue-600/30">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-slate-800">
                  {selectedCompanyForInfo?.corpName ||
                    selectedCompanyForInfo?.companyName ||
                    '회사'}
                </DialogTitle>
                <DialogDescription className="mt-1 text-base text-slate-600">
                  회사의 상세 정보를 확인하실 수 있습니다.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            {/* 기본 정보 섹션 */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* 회사명 */}
              <div className="p-4 transition-all duration-200 border-2 rounded-xl bg-slate-50/50 border-slate-200 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <span className="block text-sm font-medium text-slate-500">
                      회사명
                    </span>
                    <span className="text-base font-semibold text-slate-800">
                      {selectedCompanyForInfo?.corpName ||
                        selectedCompanyForInfo?.companyName ||
                        '정보 없음'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 영문 회사명 */}
              {selectedCompanyForInfo?.corpNameEng && (
                <div className="p-4 transition-all duration-200 border-2 rounded-xl bg-slate-50/50 border-slate-200 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100">
                      <Globe className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-sm font-medium text-slate-500">
                        영문 회사명
                      </span>
                      <span className="text-base font-semibold text-slate-800">
                        {selectedCompanyForInfo.corpNameEng}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 대표이사 */}
              {selectedCompanyForInfo?.ceoName && (
                <div className="p-4 transition-all duration-200 border-2 rounded-xl bg-slate-50/50 border-slate-200 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                      <User className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-sm font-medium text-slate-500">
                        대표이사
                      </span>
                      <span className="text-base font-semibold text-slate-800">
                        {selectedCompanyForInfo.ceoName}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 전화번호 */}
              {selectedCompanyForInfo?.phoneNumber && (
                <div className="p-4 transition-all duration-200 border-2 rounded-xl bg-slate-50/50 border-slate-200 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg">
                      <Phone className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-sm font-medium text-slate-500">
                        전화번호
                      </span>
                      <span className="text-base font-semibold text-slate-800">
                        {selectedCompanyForInfo.phoneNumber}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 주소 (전체 너비) */}
            {selectedCompanyForInfo?.address && (
              <div className="p-4 transition-all duration-200 border-2 rounded-xl bg-slate-50/50 border-slate-200 hover:bg-slate-50">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg">
                    <MapPin className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <span className="block text-sm font-medium text-slate-500">주소</span>
                    <span className="text-base font-semibold text-slate-800">
                      {selectedCompanyForInfo.address}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 홈페이지 */}
            {selectedCompanyForInfo?.homepageUrl && (
              <div className="p-4 transition-all duration-200 border-2 rounded-xl bg-slate-50/50 border-slate-200 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                    <Globe className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <span className="block text-sm font-medium text-slate-500">
                      홈페이지
                    </span>
                    <a
                      href={
                        selectedCompanyForInfo.homepageUrl.startsWith('http')
                          ? selectedCompanyForInfo.homepageUrl
                          : `https://${selectedCompanyForInfo.homepageUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-semibold text-blue-600 transition-colors hover:text-blue-800 hover:underline">
                      {selectedCompanyForInfo.homepageUrl}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* DART 정보 섹션 */}
            <div className="pt-6 mt-6 border-t-2 border-slate-200">
              <h3 className="mb-4 text-lg font-bold text-slate-800">DART 정보</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* DART 코드 */}
                <div className="p-4 transition-all duration-200 border-2 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200 hover:from-slate-100 hover:to-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-200">
                      <Code className="w-4 h-4 text-slate-700" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-sm font-medium text-slate-500">
                        DART 코드
                      </span>
                      <Badge className="px-3 py-1 mt-1 font-mono text-sm font-semibold text-slate-700 bg-slate-100 border-slate-300">
                        {selectedCompanyForInfo?.corpCode || '정보 없음'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* 종목 코드 */}
                {(selectedCompanyForInfo?.stockCode ||
                  selectedCompanyForInfo?.stock_code) && (
                  <div className="p-4 transition-all duration-200 border-2 border-blue-200 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-200 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-blue-700" />
                      </div>
                      <div className="flex-1">
                        <span className="block text-sm font-medium text-blue-600">
                          종목 코드
                        </span>
                        <Badge className="px-3 py-1 mt-1 font-mono text-sm font-semibold text-blue-700 bg-blue-100 border-blue-300">
                          <div className="w-2 h-2 mr-2 bg-blue-500 rounded-full"></div>
                          {selectedCompanyForInfo.stockCode ||
                            selectedCompanyForInfo.stock_code}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 자재코드 관리 모달 */}
      <MaterialCodeModal
        modalState={materialCodeModalState}
        onClose={closeMaterialCodeModal}
        onSave={handleMaterialCodeSave}
        isSubmitting={isMaterialCodeSubmitting}
        error={materialCodeError}
        existingCodes={[]} // TODO: 기존 자재코드 목록 연동
      />
    </div>
  )
}
