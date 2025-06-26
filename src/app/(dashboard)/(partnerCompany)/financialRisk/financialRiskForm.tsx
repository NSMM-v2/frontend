'use client'

import React, {useState, useEffect} from 'react'
import {
  Home,
  Building2,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronsDown,
  ChevronsUp,
  FileSearch,
  Check,
  ChevronsUpDown,
  RefreshCcw,
  ArrowLeft
} from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

import {Button} from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import Link from 'next/link'
import {PageHeader} from '@/components/layout/PageHeader'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {cn} from '@/lib/utils'
import {useToast} from '@/hooks/use-toast'
import {LoadingState} from '@/components/ui/loading-state'
import {
  fetchUniquePartnerCompanyNames,
  fetchFinancialRiskAssessment,
  fetchPartnerCompanies
} from '@/services/partnerCompanyService'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import {DirectionButton} from '@/components/layout/direction'
import {motion} from 'framer-motion'
import {FinancialRiskAssessment} from '@/types/partnerCompanyType'
import {useSearchParams} from 'next/navigation' // 추가

// API 응답 타입 정의
interface RiskItem {
  description: string
  actualValue: string
  threshold: string
  notes: string | null
  itemNumber: number
  atRisk: boolean
}

interface FinancialRiskData {
  partnerCompanyId: string
  partnerCompanyName: string
  assessmentYear: string
  reportCode: string
  riskItems: RiskItem[]
}

// 상태 레이블 유틸리티 함수
function getStatusLabel(atRiskCount: number) {
  if (atRiskCount === 0) {
    return {
      label: '안전',
      color: 'text-emerald-600',
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />
    }
  }
  if (atRiskCount <= 2) {
    return {
      label: '주의',
      color: 'text-amber-600',
      icon: <Info className="w-5 h-5 text-amber-500" />
    }
  }
  return {
    label: '위험',
    color: 'text-red-600',
    icon: <AlertTriangle className="w-5 h-5 text-red-500" />
  }
}

// PartnerCombobox의 props 타입 수정
interface PartnerComboboxProps {
  options: Array<{name: string; code: string}>
  value: string | null // 선택된 협력사의 DART 코드
  onChange: (code: string) => void
}

function PartnerCombobox({options, value, onChange}: PartnerComboboxProps) {
  const [open, setOpen] = useState(false)
  const selectedOption = options.find(option => option.code === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-full font-medium transition-all duration-200 border-2 h-11 bg-slate-50 border-slate-200 hover:border-customG hover:bg-white rounded-xl">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            {selectedOption ? (
              <span className="text-slate-800">{selectedOption.name}</span>
            ) : (
              <span className="text-slate-400">협력사를 선택해주세요...</span>
            )}
          </div>
          <ChevronsUpDown className="w-4 h-4 ml-2 text-slate-400 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0 bg-white border-2 shadow-sm border-slate-200 rounded-xl"
        style={{minWidth: 'var(--radix-popover-trigger-width)'}}>
        <Command className="rounded-xl">
          <CommandInput
            placeholder="협력사 검색..."
            className="h-12 border-0 border-b border-slate-100 rounded-t-xl"
          />
          <CommandList className="max-h-64">
            <CommandEmpty className="py-8 text-center text-slate-500">
              <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              해당하는 협력사가 없습니다.
            </CommandEmpty>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option.code}
                  value={option.name}
                  onSelect={() => {
                    onChange(option.code)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 mx-2 my-1 transition-all duration-300 rounded-lg cursor-pointer',
                    value === option.code
                      ? 'bg-customG/5 border border-customG/20 shadow-sm'
                      : 'hover:bg-customG/5'
                  )}>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex items-center justify-center w-8 h-8 transition-all duration-300 rounded-full',
                        value === option.code
                          ? 'bg-customG/10 ring-1 ring-customG/30'
                          : 'bg-slate-50 ring-1 ring-slate-200/80'
                      )}>
                      <Building2
                        className={cn(
                          'w-4 h-4 shrink-0',
                          value === option.code ? 'text-customG' : 'text-slate-400'
                        )}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          'font-medium',
                          value === option.code
                            ? 'text-customG text-[15px]'
                            : 'text-slate-800'
                        )}>
                        {option.name}
                      </span>
                      <span
                        className={cn(
                          'font-mono text-xs',
                          value === option.code ? 'text-customG/70' : 'text-slate-500'
                        )}>
                        코드: {option.code}
                      </span>
                    </div>
                  </div>
                  {value === option.code && (
                    <Check className="w-4 h-4 text-customG shrink-0" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default function FinancialRiskForm() {
  const {toast} = useToast()

  // 상태 관리
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [partnerOptions, setPartnerOptions] = useState<
    Array<{name: string; code: string}>
  >([])
  const [selectedPartnerCode, setSelectedPartnerCode] = useState<string | null>(null)
  const [selectedPartnerName, setSelectedPartnerName] = useState<string | null>(null)
  const [riskData, setRiskData] = useState<FinancialRiskAssessment | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [accordionValue, setAccordionValue] = useState<string[]>([])

  // URL 쿼리 파라미터에서 companyId와 companyName 가져오기
  const searchParams = useSearchParams()
  const companyId = searchParams.get('companyId')
  const companyName = searchParams.get('companyName')

  // 회사 자동 선택 및 데이터 로드
  useEffect(() => {
    if (companyId && companyName) {
      setSelectedPartnerCode(companyId)
      setSelectedPartnerName(decodeURIComponent(companyName))

      const loadFinancialRisk = async () => {
        try {
          setIsLoading(true)
          setError(null)
          const data = await fetchFinancialRiskAssessment(companyId, companyName)
          setRiskData(data)
        } catch (err) {
          console.error('Failed to load financial risk data:', err)
          setError('재무 위험 데이터를 불러오는데 실패했습니다.')
          toast({
            variant: 'destructive',
            title: '오류',
            description: '재무 위험 데이터를 불러오는데 실패했습니다.'
          })
        } finally {
          setIsLoading(false)
        }
      }

      loadFinancialRisk()
    }
  }, [companyId, companyName])

  // 확장/축소 토글 함수
  const toggleExpand = (itemNumber: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemNumber)) {
        newSet.delete(itemNumber)
      } else {
        newSet.add(itemNumber)
      }
      return newSet
    })
  }

  // 모든 항목 확장/축소 함수
  const toggleAllExpanded = (expand: boolean) => {
    if (riskData?.riskItems) {
      if (expand) {
        const allItemValues = riskData.riskItems.map(item => `item-${item.itemNumber}`)
        setAccordionValue(allItemValues)
        setExpandedItems(new Set(riskData.riskItems.map(item => item.itemNumber)))
      } else {
        setAccordionValue([])
        setExpandedItems(new Set())
      }
    }
  }

  // 초기 데이터 로드
  useEffect(() => {
    loadPartnerOptions()
  }, [])

  // 파트너사 옵션 로드
  const loadPartnerOptions = async () => {
    try {
      setIsLoading(true)
      const response = await fetchPartnerCompanies(1, 100)
      let partnerData: any[] = []
      if (response && response.data && Array.isArray(response.data)) {
        partnerData = response.data
      } else if (
        response &&
        (response as any).content &&
        Array.isArray((response as any).content)
      ) {
        partnerData = (response as any).content
      } else if (Array.isArray(response)) {
        partnerData = response
      }
      if (partnerData.length > 0) {
        const options = partnerData.map((partner: any) => ({
          name: partner.corpName || partner.companyName,
          code: partner.corpCode || partner.corp_code
        }))
        setPartnerOptions(options)
      } else {
        setPartnerOptions([])
      }
    } catch (err) {
      console.error('Failed to load partner options:', err)
      setError('파트너사 목록을 불러오는데 실패했습니다.')
      toast({
        variant: 'destructive',
        title: '오류',
        description: '파트너사 목록을 불러오는데 실패했습니다.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 파트너사 선택 시 핸들러
  const handlePartnerSelect = async (code: string) => {
    setSelectedPartnerCode(code)
    const selectedOption = partnerOptions.find(opt => opt.code === code)
    if (selectedOption) {
      setSelectedPartnerName(selectedOption.name)
    }

    try {
      setIsLoading(true)
      setError(null)
      setRiskData(null)
      const data = await fetchFinancialRiskAssessment(code, selectedOption?.name)
      setRiskData(data)
      setExpandedItems(new Set())
    } catch (err) {
      console.error('Failed to load financial risk data:', err)
      setError('재무 위험 데이터를 불러오는데 실패했습니다.')
      toast({
        variant: 'destructive',
        title: '오류',
        description: '재무 위험 데이터를 불러오는데 실패했습니다.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const atRiskCount = riskData?.riskItems?.filter(item => item.atRisk).length || 0
  const statusInfo = getStatusLabel(atRiskCount)

  return (
    <div className="flex flex-col w-full p-4">
      {/* Breadcrumb */}
      <div className="flex flex-row items-center p-2 px-2 mb-6 text-sm text-gray-500 bg-white rounded-lg shadow-sm">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Home className="w-4 h-4 mr-1" />
              <BreadcrumbLink href="/home">대시보드</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="font-bold text-customG">재무 리스크</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-row w-full h-full mb-6">
        <Link
          href="/dashboard"
          className="flex flex-row items-center p-4 space-x-4 transition rounded-md cursor-pointer hover:bg-gray-200">
          <ArrowLeft className="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
          <PageHeader
            icon={<FileSearch className="w-6 h-6 text-customG-600" />}
            title="재무 리스크"
            description="협력사의 재무 리스크를 분석하고 관리합니다"
            module="PARTNERCOMPANY"
            submodule="financialRisk"
          />
        </Link>
      </div>

      {/* 분석할 파트너사 선택 카드 */}
      <Card className="overflow-hidden transition-all duration-300 bg-white border-2 shadow-sm border-slate-200 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 transition-all duration-300 bg-white border shadow-sm rounded-xl border-slate-200">
                <FileSearch className="w-6 h-6 text-customG" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-slate-800">분석할 파트너사 선택</h3>
                <p className="text-sm text-slate-500">
                  재무 위험도를 분석할 협력사를 선택해주세요
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setIsLoading(true)
                loadPartnerOptions().finally(() => setIsLoading(false))
              }}
              disabled={isLoading}
              className="px-6 font-medium transition-all duration-200 bg-white border-2 h-11 border-slate-200 hover:border-customG hover:bg-customG/5 rounded-xl">
              <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              데이터 새로고침
            </Button>
          </div>
          <div className="mt-6">
            <PartnerCombobox
              options={partnerOptions}
              value={selectedPartnerCode}
              onChange={handlePartnerSelect}
            />
          </div>
        </CardContent>
      </Card>

      <LoadingState isLoading={isLoading} error={error} isEmpty={!riskData}>
        {riskData && (
          <div className="mt-4 space-y-4">
            {/* 상단 3개 요약 카드 */}
            <div className="flex flex-row gap-4 mb-2">
              {/* Partner Company Info Card */}
              <Card className="flex-1 border-2 border-blue-100 shadow-sm bg-gradient-to-br from-blue-50 to-white rounded-xl">
                <CardContent className="flex items-center p-4">
                  <div className="p-2 mr-3 bg-blue-100 rounded-full">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-gray-500">파트너사</p>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold text-slate-800">
                        {riskData.partnerCompanyName}
                      </h3>
                      <p className="px-3 py-1 font-mono text-xs font-medium text-slate-600 ">
                        DART CODE: {riskData.partnerCompanyId}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assessment Info Card */}
              <Card className="flex-1 border-2 shadow-sm border-emerald-100 bg-gradient-to-br from-emerald-50 to-white rounded-xl">
                <CardContent className="flex items-center p-4">
                  <div className="p-2 mr-3 rounded-full bg-emerald-100">
                    <FileSearch className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">분석 기준</p>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold text-slate-800">
                        {riskData.assessmentYear}년도
                      </h3>
                      <p className="px-3 py-1 mt-1 font-mono text-xs font-medium text-slate-600">
                        보고서: {riskData.reportCode}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Status Card */}
              <Card
                className={cn(
                  'flex-1 border-2 bg-gradient-to-br shadow-sm rounded-xl',
                  atRiskCount === 0
                    ? 'border-emerald-100 from-emerald-50 to-white'
                    : atRiskCount <= 2
                    ? 'border-amber-100 from-amber-50 to-white'
                    : 'border-red-100 from-red-50 to-white'
                )}>
                <CardContent className="flex items-center p-4">
                  <div
                    className={cn(
                      'p-2 mr-3 rounded-full',
                      atRiskCount === 0
                        ? 'bg-emerald-100'
                        : atRiskCount <= 2
                        ? 'bg-amber-100'
                        : 'bg-red-100'
                    )}>
                    {React.cloneElement(statusInfo.icon, {
                      className: cn(
                        'w-5 h-5',
                        atRiskCount === 0
                          ? 'text-emerald-600'
                          : atRiskCount <= 2
                          ? 'text-amber-600'
                          : 'text-red-600'
                      )
                    })}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">위험 상태</p>
                    <div className="flex items-center gap-3">
                      <h3 className={`text-2xl font-bold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </h3>
                      <p className="px-3 py-1 mt-1 text-xs font-medium text-slate-600 ">
                        위험 항목: {atRiskCount} / {riskData.riskItems.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 세부 위험 분석 카드 */}
            <Card className="overflow-hidden shadow-sm">
              <CardHeader className="p-4 bg-white border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 transition-all duration-300 bg-white border shadow-sm rounded-xl border-slate-200">
                      <AlertTriangle className="w-6 h-6 text-amber-500" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-lg font-bold text-slate-800">세부 위험 분석</h3>
                      <p className="text-sm text-slate-500">
                        총{' '}
                        <span className="font-semibold text-slate-700">
                          {riskData?.riskItems?.length || 0}개
                        </span>{' '}
                        항목을 분석했습니다
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => toggleAllExpanded(true)}
                      className="px-4 text-sm font-medium transition-all duration-200 bg-white border-2 h-9 border-slate-200 hover:border-customG hover:bg-customG/5 rounded-xl">
                      <ChevronsDown className="w-3.5 h-3.5 mr-1.5" />
                      모두 펼치기
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toggleAllExpanded(false)}
                      className="px-4 text-sm font-medium transition-all duration-200 bg-white border-2 h-9 border-slate-200 hover:border-customG hover:bg-customG/5 rounded-xl">
                      <ChevronsUp className="w-3.5 h-3.5 mr-1.5" />
                      모두 접기
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="bg-white rounded-b-lg">
                  <Accordion
                    type="multiple"
                    value={accordionValue}
                    onValueChange={setAccordionValue}
                    className="p-4">
                    {riskData.riskItems.map(item => (
                      <AccordionItem
                        key={item.itemNumber}
                        value={`item-${item.itemNumber}`}
                        className="mb-3 overflow-hidden border rounded-md shadow-sm">
                        <AccordionTrigger
                          className={cn(
                            'px-4 py-3 hover:no-underline',
                            item.atRisk ? 'bg-red-50/50' : 'bg-slate-50/50'
                          )}>
                          <div className="flex items-center w-full gap-4">
                            <div
                              className={cn(
                                'inline-flex items-center justify-center w-8 h-8 text-base font-bold rounded-xl',
                                item.atRisk
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-slate-100 text-slate-700'
                              )}>
                              {item.itemNumber}
                            </div>
                            <div className="flex items-center flex-1 gap-2">
                              <span className="font-medium text-left text-slate-700">
                                {item.description}
                              </span>
                              {item.atRisk && (
                                <span className="px-3 py-1 text-xs font-semibold text-red-600 border border-red-100 bg-red-50 rounded-xl">
                                  위험
                                </span>
                              )}
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="p-4 bg-white border-t">
                          <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                            <div className="flex items-center gap-3 p-3 bg-white border rounded-lg border-slate-200">
                              <span className="font-semibold text-slate-600">
                                실제값:
                              </span>
                              <div
                                className={cn(
                                  'px-4 py-2 font-mono text-sm rounded-lg border',
                                  item.atRisk
                                    ? 'border-red-200 bg-red-50 text-red-700'
                                    : 'border-slate-200 bg-slate-50 text-slate-800'
                                )}>
                                {item.actualValue}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white border rounded-lg border-slate-200">
                              <span className="font-semibold text-slate-600">
                                기준값:
                              </span>
                              <div className="px-4 py-2 font-mono text-sm border rounded-lg bg-slate-50 border-slate-200 text-slate-800">
                                {item.threshold}
                              </div>
                            </div>
                          </div>
                          {item.notes && (
                            <div className="p-4 border rounded-lg bg-slate-50 border-slate-200">
                              <div className="flex items-center gap-3 mb-3">
                                <FileSearch className="w-5 h-5 text-slate-400" />
                                <span className="font-medium text-slate-700">
                                  추가 설명
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed text-slate-600">
                                {item.notes}
                              </p>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </LoadingState>
      <DirectionButton
        direction="left"
        tooltip="파트너사 관리로 이동"
        href="/managePartner"
        fixed
        position="middle-left"
        size={48}
      />
    </div>
  )
}
