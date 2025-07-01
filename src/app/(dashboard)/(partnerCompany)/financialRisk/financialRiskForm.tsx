/**
 * 재무 리스크 분석 폼 컴포넌트
 *
 * 주요 기능:
 * - 협력사별 재무 위험도 분석
 * - 연도/분기별 재무제표 기반 분석
 * - 위험 항목별 상세 정보 제공
 * - 실시간 데이터 로드 및 자동 선택 기능
 *
 * 사용된 기술:
 * - Next.js 14 App Router
 * - React Hooks (useState, useEffect)
 * - Shadcn/ui 컴포넌트 시스템
 * - Lucide React 아이콘
 * - 커스텀 API 훅
 *
 * @author ESG Project Team
 * @version 1.0
 */

'use client'

// ============================================================================
// 외부 라이브러리 임포트 (External Library Imports)
// ============================================================================

import React, {useState, useEffect} from 'react'

// ============================================================================
// 아이콘 라이브러리 임포트 (Icon Library Imports)
// ============================================================================

import {
  Home, // 홈 아이콘 - 브레드크럼 네비게이션
  Building2, // 빌딩 아이콘 - 협력사 표시
  AlertTriangle, // 경고 삼각형 - 위험 상태 표시
  CheckCircle, // 체크 원형 - 안전 상태 표시
  Info, // 정보 아이콘 - 상세 설명
  ChevronsDown, // 더블 화살표 아래 - 모두 펼치기
  ChevronsUp, // 더블 화살표 위 - 모두 접기
  FileSearch, // 파일 검색 아이콘 - 분석 기능
  Check, // 체크 아이콘 - 선택 상태
  ChevronsUpDown, // 더블 화살표 상하 - 드롭다운
  RefreshCcw, // 새로고침 아이콘 - 데이터 갱신
  ArrowLeft, // 왼쪽 화살표 - 뒤로가기
  Calendar, // 달력 아이콘 - 날짜/기간 선택
  Clock, // 시계 아이콘 - 자동 선택 표시
  ChevronDown, // 단일 화살표 아래 - 확장/축소
  ChevronRight // 단일 화살표 오른쪽 - 네비게이션
} from 'lucide-react'

// ============================================================================
// UI 컴포넌트 임포트 (UI Components)
// ============================================================================

import {
  Accordion, // 아코디언 컨테이너
  AccordionContent, // 아코디언 내용
  AccordionItem, // 아코디언 항목
  AccordionTrigger // 아코디언 트리거
} from '@/components/ui/accordion'

import {Button} from '@/components/ui/button' // 버튼 컴포넌트
import {
  Card, // 카드 컨테이너
  CardContent, // 카드 내용
  CardHeader, // 카드 헤더
  CardTitle, // 카드 제목
  CardDescription // 카드 설명
} from '@/components/ui/card'

import {
  Command, // 명령어 컨테이너
  CommandEmpty, // 빈 상태 표시
  CommandGroup, // 명령어 그룹
  CommandInput, // 검색 입력
  CommandItem, // 명령어 항목
  CommandList // 명령어 목록
} from '@/components/ui/command'

import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover' // 팝오버 컴포넌트
import {LoadingState} from '@/components/ui/loading-state' // 로딩 상태 컴포넌트

import {
  Breadcrumb, // 브레드크럼 컨테이너
  BreadcrumbItem, // 브레드크럼 항목
  BreadcrumbLink, // 브레드크럼 링크
  BreadcrumbList, // 브레드크럼 목록
  BreadcrumbSeparator // 브레드크럼 구분자
} from '@/components/ui/breadcrumb'

// ============================================================================
// 내부 컴포넌트 임포트 (Internal Components)
// ============================================================================

import Link from 'next/link' // Next.js 링크 컴포넌트
import {PageHeader} from '@/components/layout/PageHeader' // 페이지 헤더 컴포넌트
import {DirectionButton} from '@/components/layout/direction' // 방향 버튼 컴포넌트
import {motion} from 'framer-motion' // 애니메이션 라이브러리

// ============================================================================
// 유틸리티 및 훅 임포트 (Utilities & Hooks)
// ============================================================================

import {cn} from '@/lib/utils' // 클래스명 유틸리티
import {
  useFetchPartnerCompanies, // 협력사 목록 조회 훅
  useFetchFinancialRisk // 재무 위험 분석 훅
} from '@/hooks/usePartnerCompanyAPI'
import {showError} from '@/util/toast' // 에러 토스트 유틸리티
import {useSearchParams} from 'next/navigation' // URL 쿼리 파라미터 훅

// ============================================================================
// 타입 및 서비스 임포트 (Types & Services)
// ============================================================================

import {
  FinancialRiskAssessment, // 재무 위험 평가 타입
  ReportCode, // 보고서 코드 타입
  YearQuarterOption, // 연도/분기 옵션 타입
  AvailablePeriod // 이용 가능한 기간 타입
} from '@/types/partnerCompanyType'
import {fetchAvailablePeriods} from '@/services/partnerCompanyService' // 이용 가능한 기간 조회 서비스

// ============================================================================
// API 응답 타입 정의 (API Response Types)
// ============================================================================

/**
 * 재무 위험 항목 인터페이스
 * 개별 재무 지표의 위험도 분석 결과
 */
interface RiskItem {
  description: string // 위험 항목 설명
  actualValue: string // 실제 값 (재무제표에서 조회한 값)
  threshold: string // 위험 기준값 (임계치)
  notes: string | null // 추가 설명 및 분석 노트
  itemNumber: number // 항목 번호 (순서 표시용)
  atRisk: boolean // 위험 여부 (true: 위험, false: 안전)
}

/**
 * 재무 위험 분석 데이터 인터페이스
 * 특정 협력사의 특정 기간에 대한 전체 재무 위험 분석 결과
 */
interface FinancialRiskData {
  partnerCompanyId: string // 협력사 DART 코드
  partnerCompanyName: string // 협력사명
  assessmentYear: string // 분석 대상 연도
  reportCode: string // 보고서 코드 (사업보고서, 분기보고서 등)
  riskItems: RiskItem[] // 위험 항목 목록
}

// ============================================================================
// 연도/분기 선택 관련 유틸리티 함수
// ============================================================================

/**
 * 보고서 코드별 정보를 반환합니다.
 * DART API의 보고서 코드를 기반으로 사용자 친화적인 정보 제공
 *
 * @param code - DART 보고서 코드 ('11011', '11012', '11013', '11014')
 * @returns 보고서 정보 객체 (name, description, period, quarter)
 */
function getReportCodeInfo(code: ReportCode) {
  const reportCodeMap = {
    '11011': {
      name: '사업보고서', // 연간 사업보고서
      description: '연간 종합 보고서', // 1년 전체 기간
      period: '연간',
      quarter: undefined
    },
    '11012': {
      name: '반기보고서', // 상반기 보고서
      description: '상반기 보고서', // 1월~6월 기간
      period: '상반기',
      quarter: 2
    },
    '11013': {
      name: '1분기보고서', // 1분기 보고서
      description: '1분기 보고서', // 1월~3월 기간
      period: '1분기',
      quarter: 1
    },
    '11014': {
      name: '3분기보고서', // 3분기 보고서
      description: '3분기 보고서', // 7월~9월 기간
      period: '3분기',
      quarter: 3
    }
  }
  return reportCodeMap[code]
}

/**
 * 현재 날짜 기준으로 자동 선택될 연도/분기 옵션을 생성합니다.
 * 재무제표 공시 일정을 고려하여 가장 최근에 공시된 보고서를 자동 선택
 *
 * 자동 선택 규칙:
 * - 1~3월: 작년 3분기 보고서 (가장 최근 공시)
 * - 4~6월: 작년 사업보고서 (연간 보고서)
 * - 7~9월: 올해 1분기 보고서
 * - 10~12월: 올해 상반기 보고서
 *
 * @returns YearQuarterOption 객체 (isAuto: true 포함)
 */
function getAutoYearQuarterOption(): YearQuarterOption {
  const today = new Date() // 현재 날짜
  const currentYear = today.getFullYear() // 현재 연도
  const month = today.getMonth() + 1 // 현재 월 (1-12)

  let year: string
  let reportCode: ReportCode
  let label: string
  let period: string

  if (month >= 1 && month < 4) {
    // 1~3월: 작년 3분기 보고서 (가장 최근 공시된 분기 보고서)
    year = String(currentYear - 1)
    reportCode = '11014'
    label = `${year}년 3분기 (자동 선택)`
    period = `${year}년 7월~9월`
  } else if (month >= 4 && month < 7) {
    // 4~6월: 작년 사업보고서 (연간 종합 데이터)
    year = String(currentYear - 1)
    reportCode = '11011'
    label = `${year}년 사업보고서 (자동 선택)`
    period = `${year}년 연간`
  } else if (month >= 7 && month < 10) {
    // 7~9월: 올해 1분기 보고서 (최신 분기 데이터)
    year = String(currentYear)
    reportCode = '11013'
    label = `${year}년 1분기 (자동 선택)`
    period = `${year}년 1월~3월`
  } else {
    // 10~12월: 올해 상반기 보고서 (가장 최근 반기 데이터)
    year = String(currentYear)
    reportCode = '11012'
    label = `${year}년 상반기 (자동 선택)`
    period = `${year}년 1월~6월`
  }

  return {year, reportCode, label, period, isAuto: true}
}

/**
 * AvailablePeriod 배열을 YearQuarterOption 배열로 변환합니다.
 * 백엔드 API에서 받은 이용 가능한 기간 데이터를 UI에서 사용할 수 있는 형태로 변환
 *
 * @param availablePeriods - 백엔드에서 받은 이용 가능한 기간 배열
 * @returns UI에서 사용할 수 있는 YearQuarterOption 배열
 */
function convertAvailablePeriodsToOptions(
  availablePeriods: AvailablePeriod[]
): YearQuarterOption[] {
  return availablePeriods.map(period => ({
    year: period.bsnsYear, // 사업연도
    reportCode: period.reprtCode, // 보고서 코드
    label: period.isAutoSelected
      ? `${period.periodDescription} (자동 선택)` // 자동 선택된 기간 표시
      : period.periodDescription, // 일반 기간 표시
    period: period.periodDescription, // 기간 설명
    isAuto: period.isAutoSelected // 자동 선택 여부
  }))
}

// ============================================================================
// 연도/분기 선택 컴포넌트
// ============================================================================

/**
 * 연도/분기 선택 컴포넌트 Props 인터페이스
 * 재무제표 분석 기간을 선택할 수 있는 드롭다운 컴포넌트의 속성
 */
interface YearQuarterSelectorProps {
  value: YearQuarterOption | null // 현재 선택된 연도/분기 옵션
  onChange: (option: YearQuarterOption) => void // 연도/분기 선택 시 콜백 함수
  disabled?: boolean // 컴포넌트 비활성화 여부 (로딩 중일 때 사용)
  options: YearQuarterOption[] // 선택 가능한 연도/분기 옵션 목록
}

/**
 * 연도/분기 선택 컴포넌트
 * 협력사의 이용 가능한 재무제표 기간을 드롭다운으로 선택
 * 자동 선택된 옵션과 수동 선택 옵션을 구분하여 표시
 */
function YearQuarterSelector({
  value,
  onChange,
  disabled,
  options
}: YearQuarterSelectorProps) {
  const [open, setOpen] = useState(false) // 드롭다운 열림/닫힘 상태

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="justify-between w-full h-11 font-medium rounded-xl border-2 transition-all duration-200 bg-slate-50 border-slate-200 hover:border-blue-500 hover:bg-white">
          <div className="flex gap-2 items-center">
            <Calendar className="w-4 h-4 text-slate-400" />
            {disabled && options.length === 0 ? (
              <span className="text-slate-400">이용 가능한 기간 로드 중...</span>
            ) : value ? (
              <span className="text-slate-800">{value.label}</span>
            ) : (
              <span className="text-slate-400">분석 기간을 선택해주세요...</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 w-4 h-4 text-slate-400 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-full bg-white rounded-xl border-2 shadow-sm border-slate-200"
        style={{minWidth: 'var(--radix-popover-trigger-width)'}}>
        <Command className="rounded-xl">
          <CommandInput
            placeholder="연도/분기 검색..."
            className="h-12 rounded-t-xl border-0 border-b border-slate-100"
          />
          <CommandList className="max-h-64">
            <CommandEmpty className="py-8 text-center text-slate-500">
              <Calendar className="mx-auto mb-2 w-8 h-8 text-slate-300" />
              {options.length === 0
                ? '해당 협력사의 재무제표 데이터가 없습니다.'
                : '해당하는 분기가 없습니다.'}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option, index) => (
                <CommandItem
                  key={`${option.year}-${option.reportCode}`}
                  value={option.label}
                  onSelect={() => {
                    onChange(option)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 mx-2 my-1 transition-all duration-300 rounded-lg cursor-pointer',
                    value?.year === option.year && value?.reportCode === option.reportCode
                      ? 'bg-blue-50 border border-blue-200 shadow-sm'
                      : 'hover:bg-blue-50'
                  )}>
                  <div className="flex gap-3 items-center">
                    <div
                      className={cn(
                        'flex items-center justify-center w-8 h-8 transition-all duration-300 rounded-full',
                        value?.year === option.year &&
                          value?.reportCode === option.reportCode
                          ? 'bg-blue-100 ring-1 ring-blue-300'
                          : option.isAuto
                          ? 'bg-green-50 ring-1 ring-green-200'
                          : 'bg-slate-50 ring-1 ring-slate-200/80'
                      )}>
                      {option.isAuto ? (
                        <Clock className={cn('w-4 h-4 shrink-0', 'text-green-600')} />
                      ) : (
                        <Calendar
                          className={cn(
                            'w-4 h-4 shrink-0',
                            value?.year === option.year &&
                              value?.reportCode === option.reportCode
                              ? 'text-blue-600'
                              : 'text-slate-400'
                          )}
                        />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          'font-medium',
                          value?.year === option.year &&
                            value?.reportCode === option.reportCode
                            ? 'text-blue-600 text-[15px]'
                            : option.isAuto
                            ? 'text-green-600'
                            : 'text-slate-800'
                        )}>
                        {option.label}
                      </span>
                      <span
                        className={cn(
                          'text-xs',
                          value?.year === option.year &&
                            value?.reportCode === option.reportCode
                            ? 'text-blue-500'
                            : option.isAuto
                            ? 'text-green-500'
                            : 'text-slate-500'
                        )}>
                        {option.period}
                      </span>
                    </div>
                  </div>
                  {value?.year === option.year &&
                    value?.reportCode === option.reportCode && (
                      <Check className="w-4 h-4 text-blue-600 shrink-0" />
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

/**
 * 위험 항목 개수에 따른 상태 레이블을 반환하는 유틸리티 함수
 * 재무 위험도를 3단계로 분류하여 시각적 표시
 *
 * 위험도 분류 기준:
 * - 안전: 위험 항목 0개 (모든 지표가 정상 범위)
 * - 주의: 위험 항목 1-2개 (일부 지표에서 주의 필요)
 * - 위험: 위험 항목 3개 이상 (다수 지표에서 위험 신호)
 *
 * @param atRiskCount - 위험 상태인 항목의 개수
 * @returns 상태 정보 객체 (label, color, icon)
 */
function getStatusLabel(atRiskCount: number) {
  if (atRiskCount === 0) {
    return {
      label: '안전', // 모든 재무 지표가 정상 범위
      color: 'text-emerald-600', // 녹색 계열
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" /> // 체크 원형 아이콘
    }
  }
  if (atRiskCount <= 2) {
    return {
      label: '주의', // 일부 지표에서 주의 필요
      color: 'text-amber-600', // 주황색 계열
      icon: <Info className="w-5 h-5 text-amber-500" /> // 정보 아이콘
    }
  }
  return {
    label: '위험', // 다수 지표에서 위험 신호
    color: 'text-red-600', // 빨간색 계열
    icon: <AlertTriangle className="w-5 h-5 text-red-500" /> // 경고 삼각형 아이콘
  }
}

// ============================================================================
// 컴포넌트 Props 타입 정의 (Component Props Types)
// ============================================================================

/**
 * 협력사 선택 콤보박스 Props 인터페이스
 * 드롭다운으로 협력사를 선택할 수 있는 컴포넌트의 속성
 */
interface PartnerComboboxProps {
  options: Array<{name: string; code: string}> // 협력사 목록 (이름, DART 코드)
  value: string | null // 선택된 협력사의 DART 코드
  onChange: (code: string) => void // 협력사 선택 시 콜백 함수
}

/**
 * 협력사 선택 콤보박스 컴포넌트
 * 등록된 협력사 목록에서 재무 분석 대상을 선택하는 드롭다운
 * 협력사명과 DART 코드를 함께 표시하여 식별 용이성 제공
 */
function PartnerCombobox({options, value, onChange}: PartnerComboboxProps) {
  const [open, setOpen] = useState(false) // 드롭다운 열림/닫힘 상태
  const selectedOption = options.find(option => option.code === value) // 현재 선택된 협력사 정보

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-full h-11 font-medium rounded-xl border-2 transition-all duration-200 bg-slate-50 border-slate-200 hover:border-blue-500 hover:bg-white">
          <div className="flex gap-2 items-center">
            <Building2 className="w-4 h-4 text-slate-400" />
            {selectedOption ? (
              <span className="text-slate-800">{selectedOption.name}</span>
            ) : (
              <span className="text-slate-400">협력사를 선택해주세요...</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 w-4 h-4 text-slate-400 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-full bg-white rounded-xl border-2 shadow-sm border-slate-200"
        style={{minWidth: 'var(--radix-popover-trigger-width)'}}>
        <Command className="rounded-xl">
          <CommandInput
            placeholder="협력사 검색..."
            className="h-12 rounded-t-xl border-0 border-b border-slate-100"
          />
          <CommandList className="max-h-64">
            <CommandEmpty className="py-8 text-center text-slate-500">
              <Building2 className="mx-auto mb-2 w-8 h-8 text-slate-300" />
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
                      ? 'bg-blue-50 border border-blue-200 shadow-sm'
                      : 'hover:bg-blue-50'
                  )}>
                  <div className="flex gap-3 items-center">
                    <div
                      className={cn(
                        'flex items-center justify-center w-8 h-8 transition-all duration-300 rounded-full',
                        value === option.code
                          ? 'bg-blue-100 ring-1 ring-blue-300'
                          : 'bg-slate-50 ring-1 ring-slate-200/80'
                      )}>
                      <Building2
                        className={cn(
                          'w-4 h-4 shrink-0',
                          value === option.code ? 'text-blue-600' : 'text-slate-400'
                        )}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          'font-medium',
                          value === option.code
                            ? 'text-blue-600 text-[15px]'
                            : 'text-slate-800'
                        )}>
                        {option.name}
                      </span>
                      <span
                        className={cn(
                          'font-mono text-xs',
                          value === option.code ? 'text-blue-500' : 'text-slate-500'
                        )}>
                        코드: {option.code}
                      </span>
                    </div>
                  </div>
                  {value === option.code && (
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
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
  // ========================================================================
  // 커스텀 훅 (Custom Hooks)
  // ========================================================================

  const {fetchPartners} = useFetchPartnerCompanies() // 협력사 목록 조회 훅
  const {fetchFinancialRisk} = useFetchFinancialRisk() // 재무 위험 분석 훅

  // ========================================================================
  // 상태 관리 (State Management)
  // ========================================================================

  const [isLoading, setIsLoading] = useState(false) // 메인 로딩 상태
  const [error, setError] = useState<string | null>(null) // 에러 메시지

  // 협력사 관련 상태
  const [partnerOptions, setPartnerOptions] = useState<
    Array<{name: string; code: string}>
  >([]) // 선택 가능한 협력사 목록
  const [selectedPartnerCode, setSelectedPartnerCode] = useState<string | null>(null) // 선택된 협력사 DART 코드
  const [selectedPartnerName, setSelectedPartnerName] = useState<string | null>(null) // 선택된 협력사명

  // 재무 분석 관련 상태
  const [riskData, setRiskData] = useState<FinancialRiskAssessment | null>(null) // 재무 위험 분석 결과
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set()) // 확장된 위험 항목 번호들
  const [accordionValue, setAccordionValue] = useState<string[]>([]) // 아코디언 열림 상태 배열

  // 연도/분기 선택 관련 상태
  const [selectedYearQuarter, setSelectedYearQuarter] =
    useState<YearQuarterOption | null>(null) // 선택된 분석 기간
  const [availableOptions, setAvailableOptions] = useState<YearQuarterOption[]>([]) // 이용 가능한 기간 옵션들
  const [isLoadingOptions, setIsLoadingOptions] = useState(false) // 기간 옵션 로딩 상태

  // ========================================================================
  // URL 파라미터 처리 (URL Parameter Handling)
  // ========================================================================

  const searchParams = useSearchParams() // URL 쿼리 파라미터 훅
  const companyId = searchParams.get('companyId') // 협력사 DART 코드
  const companyName = searchParams.get('companyName') // 협력사명

  // ========================================================================
  // 생명주기 관리 (Lifecycle Management)
  // ========================================================================

  /**
   * URL 파라미터를 통한 회사 자동 선택 및 데이터 로드
   * 다른 페이지에서 특정 협력사로 이동해온 경우 자동으로 해당 협력사 선택
   */
  useEffect(() => {
    if (companyId && companyName) {
      setSelectedPartnerCode(companyId) // 협력사 코드 설정
      setSelectedPartnerName(decodeURIComponent(companyName)) // 협력사명 설정 (URL 디코딩)

      // URL에서 온 경우 자동으로 최신 분기 기준으로 재무 분석 수행
      loadFinancialRiskData(companyId, decodeURIComponent(companyName), null)
    }
  }, [companyId, companyName])

  /**
   * 페이지 로드 시 자동 선택 연도/분기 설정
   * 현재 날짜 기준으로 가장 최근 공시된 재무제표 기간을 자동 선택
   */
  useEffect(() => {
    if (!selectedYearQuarter) {
      const autoOption = getAutoYearQuarterOption() // 자동 선택 옵션 생성
      setSelectedYearQuarter(autoOption)
    }
  }, [])

  // ========================================================================
  // 이벤트 핸들러 함수 (Event Handler Functions)
  // ========================================================================

  /**
   * 개별 위험 항목의 확장/축소를 토글하는 함수
   * 특정 항목의 상세 정보를 보거나 숨기기 위해 사용
   *
   * @param itemNumber - 토글할 위험 항목 번호
   */
  const toggleExpand = (itemNumber: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemNumber)) {
        newSet.delete(itemNumber) // 이미 확장된 항목이면 축소
      } else {
        newSet.add(itemNumber) // 축소된 항목이면 확장
      }
      return newSet
    })
  }

  /**
   * 모든 위험 항목을 일괄 확장/축소하는 함수
   * 사용자 편의를 위한 전체 제어 기능
   *
   * @param expand - true: 모두 확장, false: 모두 축소
   */
  const toggleAllExpanded = (expand: boolean) => {
    if (riskData?.riskItems) {
      if (expand) {
        // 모든 항목 확장
        const allItemValues = riskData.riskItems.map(item => `item-${item.itemNumber}`)
        setAccordionValue(allItemValues)
        setExpandedItems(new Set(riskData.riskItems.map(item => item.itemNumber)))
      } else {
        // 모든 항목 축소
        setAccordionValue([])
        setExpandedItems(new Set())
      }
    }
  }

  /**
   * 컴포넌트 마운트 시 초기 데이터 로드
   * 협력사 목록을 먼저 로드하여 선택 옵션 제공
   */
  useEffect(() => {
    loadPartnerOptions()
  }, [])

  // ========================================================================
  // API 호출 함수 (API Call Functions)
  // ========================================================================

  /**
   * 협력사 목록을 로드하는 함수
   * 재무 분석 대상으로 선택할 수 있는 협력사들의 목록을 가져옴
   * 다양한 API 응답 형태를 처리하여 일관된 형태로 변환
   */
  const loadPartnerOptions = async () => {
    try {
      setIsLoading(true) // 로딩 상태 시작
      const response = await fetchPartners(1, 100) // 첫 페이지, 100개 항목 조회
      let partnerData: any[] = []

      // API 응답 형태에 따른 데이터 추출 (서로 다른 구조 대응)
      if (response && response.data && Array.isArray(response.data)) {
        partnerData = response.data // { data: [...] } 형태
      } else if (
        response &&
        (response as any).content &&
        Array.isArray((response as any).content)
      ) {
        partnerData = (response as any).content // 페이지네이션 응답 { content: [...] } 형태
      } else if (Array.isArray(response)) {
        partnerData = response // 직접 배열 형태
      }

      if (partnerData.length > 0) {
        // 협력사 데이터를 선택 옵션 형태로 변환
        const options = partnerData.map((partner: any) => ({
          name: partner.corpName || partner.companyName, // 회사명 (다양한 필드명 대응)
          code: partner.corpCode || partner.corp_code // DART 코드 (다양한 필드명 대응)
        }))
        setPartnerOptions(options)
      } else {
        setPartnerOptions([]) // 빈 배열로 초기화
      }
    } catch (err) {
      console.error('협력사 목록 로드 실패:', err)
      setError('파트너사 목록을 불러오는데 실패했습니다.')
      // 에러 토스트는 커스텀 훅에서 자동 처리되지 않음 (목록 조회는 조용히 처리)
    } finally {
      setIsLoading(false) // 로딩 상태 종료
    }
  }

  // 재무 위험 분석 로드 함수
  const loadFinancialRiskData = async (
    corpCode: string,
    partnerName?: string,
    yearQuarter?: YearQuarterOption | null
  ) => {
    try {
      setIsLoading(true)
      setError(null)
      setRiskData(null)

      console.log('재무 위험 분석 요청:', {
        corpCode,
        partnerName,
        year: yearQuarter?.year,
        reportCode: yearQuarter?.reportCode
      })

      const data = await fetchFinancialRisk(
        corpCode,
        partnerName,
        yearQuarter?.year,
        yearQuarter?.reportCode
      )
      setRiskData(data)
      setExpandedItems(new Set())
    } catch (err) {
      console.error('Failed to load financial risk data:', err)
      setError('재무 위험 데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 이용 가능한 기간 옵션 로드
  const loadAvailableOptions = async (corpCode: string, partnerName: string) => {
    try {
      setIsLoadingOptions(true)
      const periods = await fetchAvailablePeriods(corpCode)
      const options = convertAvailablePeriodsToOptions(periods)
      setAvailableOptions(options)

      // 자동 선택된 옵션이 있으면 설정하고 바로 분석 실행
      const autoOption = options.find(option => option.isAuto)
      if (autoOption) {
        setSelectedYearQuarter(autoOption)
        // 자동 선택된 옵션으로 바로 재무 분석 수행
        await loadFinancialRiskData(corpCode, partnerName, autoOption)
      }
    } catch (error) {
      console.error('이용 가능한 기간 로드 실패:', error)
      // 실패하면 빈 배열로 설정
      setAvailableOptions([])
      showError('이용 가능한 재무제표 기간 정보를 불러올 수 없습니다.')
    } finally {
      setIsLoadingOptions(false)
    }
  }

  // 파트너사 선택 시 핸들러
  const handlePartnerSelect = async (code: string) => {
    setSelectedPartnerCode(code)
    const selectedOption = partnerOptions.find(opt => opt.code === code)
    if (selectedOption) {
      setSelectedPartnerName(selectedOption.name)

      // 파트너사 변경 시 이용 가능한 기간 옵션 로드
      await loadAvailableOptions(code, selectedOption.name)

      // 연도/분기 선택 초기화 (새로운 자동 옵션이 설정될 것임)
      setSelectedYearQuarter(null)
    }
  }

  // 연도/분기 선택 시 핸들러
  const handleYearQuarterSelect = async (option: YearQuarterOption) => {
    setSelectedYearQuarter(option)

    // 파트너사가 이미 선택되어 있으면 새로운 연도/분기로 데이터 다시 로드
    if (selectedPartnerCode && selectedPartnerName) {
      await loadFinancialRiskData(selectedPartnerCode, selectedPartnerName, option)
    }
  }

  // ========================================================================
  // 계산된 값 (Computed Values)
  // ========================================================================

  const atRiskCount = riskData?.riskItems?.filter(item => item.atRisk).length || 0 // 위험 상태인 항목 개수
  const statusInfo = getStatusLabel(atRiskCount) // 위험도에 따른 상태 정보

  // ========================================================================
  // 렌더링 (Rendering)
  // ========================================================================

  return (
    <div className="flex flex-col p-4 w-full">
      {/* ======================================================================
          상단 네비게이션 섹션 (Top Navigation Section)
          ====================================================================== */}
      <div className="flex flex-row items-center p-2 px-2 mb-6 text-sm text-gray-500 bg-white rounded-lg shadow-sm">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Home className="mr-1 w-4 h-4" />
              <BreadcrumbLink href="/home">대시보드</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="font-bold text-blue-600">재무 리스크</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-row mb-4 w-full">
        <Link
          href="/dashboard"
          className="flex flex-row items-center p-4 space-x-4 rounded-md transition cursor-pointer hover:bg-gray-200">
          <ArrowLeft className="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
          <PageHeader
            icon={<FileSearch className="w-6 h-6 text-blue-600" />}
            title="재무 리스크"
            description="협력사의 재무 리스크를 분석하고 관리합니다"
            module="PARTNERCOMPANY"
            submodule="financialRisk"
          />
        </Link>
      </div>

      {/* ======================================================================
          협력사 선택 섹션 (Partner Selection Section)
          ====================================================================== */}
      <Card className="overflow-hidden bg-white rounded-xl border-2 shadow-sm transition-all duration-300 border-slate-200">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="flex justify-center items-center w-12 h-12 bg-white rounded-xl border shadow-sm transition-all duration-300 border-slate-200">
                <FileSearch className="w-6 h-6 text-blue-600" />
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
              className="px-6 h-11 font-medium bg-white rounded-xl border-2 transition-all duration-200 border-slate-200 hover:border-blue-500 hover:bg-blue-50">
              <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              데이터 새로고침
            </Button>
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                분석할 협력사
              </label>
              <PartnerCombobox
                options={partnerOptions}
                value={selectedPartnerCode}
                onChange={handlePartnerSelect}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                분석 기간 선택
              </label>
              <YearQuarterSelector
                value={selectedYearQuarter}
                onChange={handleYearQuarterSelect}
                disabled={isLoading || isLoadingOptions}
                options={availableOptions}
              />
              {selectedYearQuarter && (
                <p className="mt-2 text-xs text-slate-500">
                  {selectedYearQuarter.isAuto
                    ? '현재 날짜 기준으로 가장 최근 공시된 재무제표를 자동 선택했습니다.'
                    : `${selectedYearQuarter.period} 기간의 재무제표를 분석합니다.`}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <LoadingState isLoading={isLoading} error={error} isEmpty={!riskData}>
        {riskData && (
          <div className="mt-10 space-y-4">
            {/* ======================================================================
                재무 위험 분석 결과 섹션 (Financial Risk Analysis Results)
                ====================================================================== */}
            <div className="flex flex-row gap-4 mb-2">
              {/* Partner Company Info Card */}
              <Card className="flex-1 bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-blue-100 shadow-sm">
                <CardContent className="flex items-center p-6">
                  <div className="p-2 mr-3 bg-blue-100 rounded-full">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">파트너사</p>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-lg font-bold text-slate-800">
                        {riskData.partnerCompanyName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        DART CODE: {riskData.partnerCompanyId}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assessment Info Card */}
              <Card className="flex-1 bg-gradient-to-br from-emerald-50 to-white rounded-xl border-2 border-emerald-100 shadow-sm">
                <CardContent className="flex items-center p-6">
                  <div className="p-2 mr-3 bg-emerald-100 rounded-full">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">분석 기준</p>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-lg font-bold text-slate-800">
                        {selectedYearQuarter
                          ? selectedYearQuarter.isAuto
                            ? `${selectedYearQuarter.year}년 ${
                                getReportCodeInfo(selectedYearQuarter.reportCode).name
                              }`
                            : selectedYearQuarter.label
                          : `${riskData.assessmentYear}년도`}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {selectedYearQuarter
                          ? selectedYearQuarter.period
                          : `보고서: ${riskData.reportCode}`}
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
                <CardContent className="flex items-center p-6">
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
                    <div className="flex flex-col gap-1">
                      <h3 className={`text-lg font-bold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </h3>
                      <p className="text-xs text-slate-500">
                        위험 항목: {atRiskCount} / {riskData.riskItems.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ======================================================================
                세부 위험 분석 섹션 (Detailed Risk Analysis Section)
                ====================================================================== */}
            <Card className="overflow-hidden mt-10 shadow-sm">
              <CardHeader className="p-8 bg-white border-b">
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <div className="flex justify-center items-center w-12 h-12 bg-white rounded-xl border shadow-sm transition-all duration-300 border-slate-200">
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
                      className="px-4 h-9 text-sm font-medium bg-white rounded-xl border-2 transition-all duration-200 border-slate-200 hover:border-blue-500 hover:bg-blue-50">
                      <ChevronsDown className="w-3.5 h-3.5 mr-1.5" />
                      모두 펼치기
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toggleAllExpanded(false)}
                      className="px-4 h-9 text-sm font-medium bg-white rounded-xl border-2 transition-all duration-200 border-slate-200 hover:border-blue-500 hover:bg-blue-50">
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
                        className={cn(
                          'overflow-hidden mb-4 rounded-xl border-2 shadow-sm transition-all duration-300',
                          item.atRisk
                            ? 'border-red-200 shadow-red-100/50'
                            : 'border-slate-200 shadow-slate-100/50'
                        )}>
                        <AccordionTrigger
                          className={cn(
                            'px-4 py-4 hover:no-underline transition-all duration-200 group',
                            item.atRisk
                              ? 'bg-red-50/50 hover:bg-red-50/80'
                              : 'bg-slate-50/50 hover:bg-slate-50/80'
                          )}>
                          <div className="flex gap-4 justify-between items-center w-full">
                            {/* 왼쪽 콘텐츠 */}
                            <div className="flex flex-1 gap-4 items-center">
                              <div
                                className={cn(
                                  'inline-flex items-center justify-center w-9 h-9 text-base font-bold rounded-xl transition-all duration-200',
                                  item.atRisk
                                    ? 'bg-red-100 text-red-700 group-hover:bg-red-200'
                                    : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                                )}>
                                {item.itemNumber}
                              </div>
                              <div className="flex flex-1 gap-3 items-center">
                                <span className="font-medium text-left text-slate-700 group-hover:text-slate-900">
                                  {item.description}
                                </span>
                                {item.atRisk && (
                                  <span className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-50 rounded-xl border border-red-100 transition-all duration-200 group-hover:bg-red-100">
                                    위험
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* 오른쪽 확장/축소 아이콘 */}
                            <div className="flex gap-3 items-center">
                              {/* 상태 아이콘 */}
                              <div
                                className={cn(
                                  'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200',
                                  item.atRisk
                                    ? 'bg-red-100 text-red-500 group-hover:bg-red-200'
                                    : 'bg-emerald-100 text-emerald-500 group-hover:bg-emerald-200'
                                )}>
                                {item.atRisk ? (
                                  <AlertTriangle className="w-4 h-4" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </div>

                              {/* 펼침 아이콘 */}
                              <div className="flex justify-center items-center w-8 h-8 rounded-full transition-all duration-200 bg-slate-100 text-slate-500 group-hover:bg-slate-200">
                                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="p-5 bg-gradient-to-br from-white border-t to-slate-50/30 border-slate-100">
                          <div className="space-y-4">
                            {/* 실제값 vs 기준값 비교 섹션 */}
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                              {/* 실제값 카드 */}
                              <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
                                <div className="flex gap-3 items-center mb-2">
                                  <div className="flex justify-center items-center w-6 h-6 bg-blue-100 rounded-full">
                                    <span className="text-xs font-bold text-blue-600">
                                      실
                                    </span>
                                  </div>
                                  <span className="font-semibold text-slate-700">
                                    실제값
                                  </span>
                                </div>
                                <div
                                  className={cn(
                                    'px-4 py-3 font-mono text-sm rounded-lg border transition-all duration-200',
                                    item.atRisk
                                      ? 'border-red-200 bg-red-50 text-red-700 shadow-sm'
                                      : 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm'
                                  )}>
                                  {item.actualValue}
                                </div>
                              </div>

                              {/* 기준값 카드 */}
                              <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
                                <div className="flex gap-3 items-center mb-2">
                                  <div className="flex justify-center items-center w-6 h-6 bg-amber-100 rounded-full">
                                    <span className="text-xs font-bold text-amber-600">
                                      기
                                    </span>
                                  </div>
                                  <span className="font-semibold text-slate-700">
                                    기준값
                                  </span>
                                </div>
                                <div className="px-4 py-3 font-mono text-sm text-amber-700 bg-amber-50 rounded-lg border border-amber-200 shadow-sm">
                                  {item.threshold}
                                </div>
                              </div>
                            </div>

                            {/* 추가 설명 섹션 */}
                            {item.notes && (
                              <div className="p-5 bg-gradient-to-br to-white rounded-xl border shadow-sm from-slate-50 border-slate-200">
                                <div className="flex gap-3 items-center mb-3">
                                  <div className="flex justify-center items-center w-8 h-8 bg-blue-100 rounded-full">
                                    <Info className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <span className="font-semibold text-slate-800">
                                    상세 분석
                                  </span>
                                </div>
                                <p className="ml-11 text-sm leading-relaxed text-slate-600">
                                  {item.notes}
                                </p>
                              </div>
                            )}
                          </div>
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
      {/* ======================================================================
          하단 네비게이션 버튼 (Bottom Navigation Button)
          ====================================================================== */}
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
