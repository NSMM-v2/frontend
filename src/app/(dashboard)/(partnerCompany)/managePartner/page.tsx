/**
 * ===================================================================
 * 파트너사 관리 페이지 (Partner Company Management Page)
 * ===================================================================
 *
 * ESG 경영을 위한 파트너사 등록, 조회, 수정, 삭제 기능을 제공합니다.
 * DART 데이터베이스와 연동하여 기업 정보를 자동으로 가져옵니다.
 *
 * 주요 기능:
 * - 파트너사 목록 조회 및 검색 (페이지네이션 지원)
 * - DART API를 통한 기업 정보 검색 및 등록
 * - 파트너사 정보 수정 및 삭제
 * - 실시간 검색 및 필터링
 *
 * @author ESG Project Team
 * @version 1.0
 * @since 2024
 */

'use client'

/**
 * ===================================================================
 * 라이브러리 및 컴포넌트 임포트 (Imports)
 * ===================================================================
 */

// React 핵심 라이브러리
import React, {useState, useEffect, useCallback} from 'react'

import {PageHeader} from '@/components/layout/PageHeader'

// 아이콘 라이브러리
import {
  Building2, // 빌딩 아이콘 (파트너사 표시)
  Home, // 홈 아이콘 (브레드크럼)
  ChevronRight, // 오른쪽 화살표 (브레드크럼)
  ChevronLeft, // 왼쪽 화살표 (페이지네이션)
  Users, // 사용자 그룹 아이콘
  ArrowLeft
} from 'lucide-react'

// 파트너사 관련 컴포넌트
import {PartnerCompanyModal} from '@/components/partner/PartnerCompanyModal'
import {EditPartnerModal} from '@/components/partner/EditPartnerModal'
import {PartnerSearchSection} from '@/components/partner/PartnerSearchSection'
import {PartnerTable} from '@/components/partner/PartnerTable'
import {
  EmptyPartnerState,
  SearchEmptyState
} from '@/components/partner/PartnerEmptyStates'
import {PartnerPagination} from '@/components/partner/PartnerPagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {DirectionButton} from '@/components/layout/direction'
// 커스텀 훅
import {useToast} from '@/hooks/use-toast'
import {
  PartnerLoadingState,
  PageLoadingState
} from '@/components/partner/PartnerLoadingStates'
import {PartnerDeleteDialog} from '@/components/partner/PartnerDeleteDialog'

// 토스트 유틸리티
import {showError, showWarning, showPartnerRestore, showSuccess} from '@/util/toast'

// API 서비스 함수들
import {
  fetchPartnerCompanies, // 파트너사 목록 조회
  createPartnerCompany, // 파트너사 등록
  deletePartnerCompany, // 파트너사 삭제
  updatePartnerCompany, // 파트너사 정보 수정
  searchCompaniesFromDart, // DART API 기업 검색
  checkCompanyNameDuplicate // 회사명 중복 검사
} from '@/services/partnerCompany'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import Link from 'next/link'

// 커스텀 훅
import {useDebounce} from '@/hooks/useDebounce'

// 타입 정의
import {DartCorpInfo, PartnerCompany} from '@/types/IFRS/partnerCompany'
import {motion} from 'framer-motion'

/**
 * ===================================================================
 * 메인 컴포넌트 (Main Component)
 * ===================================================================
 */

/**
 * 파트너사 관리 페이지 메인 컴포넌트
 *
 * ESG 경영을 위한 파트너사 관리 기능을 제공합니다.
 * 주요 기능:
 * - 파트너사 목록 조회 및 검색 (페이지네이션 지원)
 * - DART API를 통한 기업 정보 검색 및 등록
 * - 파트너사 정보 수정 및 삭제
 * - 실시간 검색 및 필터링
 *
 * @returns JSX.Element
 */
export default function ManagePartnerPage() {
  /**
   * ===================================================================
   * 상태 관리 (State Management)
   * ===================================================================
   */

  // 파트너사 데이터 관련 상태
  /** 파트너사 목록 데이터 */
  const [partners, setPartners] = useState<PartnerCompany[]>([])

  // 로딩 상태 관리
  /** 일반적인 로딩 상태 (목록 조회, DART 검색 등) */
  const [isLoading, setIsLoading] = useState(false)
  /** 페이지 초기 로딩 상태 */
  const [isPageLoading, setIsPageLoading] = useState(true)
  /** 폼 제출 중 로딩 상태 (추가/수정/삭제) */
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 검색 및 필터링 상태
  /** 파트너사 목록 검색어 */
  const [searchQuery, setSearchQuery] = useState('')

  // 페이지네이션 상태
  /** 현재 페이지 번호 */
  const [currentPage, setCurrentPage] = useState(1)
  /** 전체 페이지 수 */
  const [totalPages, setTotalPages] = useState(1)
  /** 전체 아이템 수 */
  const [totalItems, setTotalItems] = useState(0)
  /** 페이지당 아이템 수 */
  const [pageSize] = useState(10)

  // 다이얼로그 상태 관리
  /** 파트너사 추가 다이얼로그 열림 상태 */
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  /** 파트너사 수정 다이얼로그 열림 상태 */
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  /** 파트너사 삭제 확인 다이얼로그 열림 상태 */
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  /** 현재 선택된 파트너사 (수정/삭제용) */
  const [selectedPartner, setSelectedPartner] = useState<PartnerCompany | null>(null)

  // 추가/수정 다이얼로그 내부 상태
  /** DART 기업 검색어 */
  const [companySearchQuery, setCompanySearchQuery] = useState('')
  /** DART API 검색 결과 목록 */
  const [dartSearchResults, setDartSearchResults] = useState<DartCorpInfo[]>([])
  /** DART에서 선택된 기업 정보 */
  const [selectedDartCompany, setSelectedDartCompany] = useState<DartCorpInfo | null>(
    null
  )

  // 폼 데이터 상태
  /** 파트너사 등록/수정 폼 데이터 */
  const [formData, setFormData] = useState({
    /** 파트너사 ID (수정 시 사용) */
    id: '',
    /** 회사명 */
    companyName: '',
    /** DART 기업 코드 */
    corpCode: '',
    /** 계약 시작일 */
    contractStartDate: new Date().toISOString().split('T')[0]
  })

  /** 다이얼로그 내 에러 메시지 */
  const [dialogError, setDialogError] = useState<string | null>(null)

  // 중복 검사 관련 상태
  /** 회사명 중복 검사 진행 중 여부 */
  const [isDuplicateChecking, setIsDuplicateChecking] = useState(false)
  /** 회사명 중복 검사 결과 */
  const [duplicateCheckResult, setDuplicateCheckResult] = useState<{
    isDuplicate: boolean
    message: string
  } | null>(null)
  /** 마지막으로 중복 검사한 회사명 */
  const [lastCheckedCompanyName, setLastCheckedCompanyName] = useState('')

  /**
   * ===================================================================
   * 디바운스된 값들 (Debounced Values)
   * ===================================================================
   */

  /** 파트너사 목록 검색을 위한 디바운스된 검색어 (500ms 지연) */
  const debouncedMainSearchQuery = useDebounce(searchQuery, 500)
  /** DART 기업 검색을 위한 디바운스된 검색어 (500ms 지연) */
  const debouncedDartSearchQuery = useDebounce(companySearchQuery, 500)
  /** 회사명 중복 검사를 위한 디바운스된 값 (800ms 지연) */
  const debouncedCompanyName = useDebounce(formData.companyName, 800)

  /**
   * ===================================================================
   * API 호출 함수들 (API Functions)
   * ===================================================================
   */

  /**
   * 파트너사 목록을 서버에서 가져오는 함수
   * 페이지네이션과 검색 필터를 지원합니다.
   *
   * @param page - 가져올 페이지 번호 (1부터 시작)
   * @param companyNameFilter - 회사명 필터 (선택적)
   */
  const loadPartners = useCallback(
    async (page: number, companyNameFilter?: string) => {
      setIsLoading(true)
      setIsPageLoading(false) // 실제 로딩 시작 시 페이지 로딩 상태 false
      try {
        const response = await fetchPartnerCompanies(page, pageSize, companyNameFilter)

        // API 응답이 Spring Data Page 형태인지 확인하고 적절히 처리
        const partners = response.content || response.data || []

        // 백엔드 응답의 다양한 필드명 형식을 통일된 형태로 변환
        const transformedData = partners.map(p => ({
          ...p,
          companyName: p.corp_name || p.corpName || p.companyName,
          corpName: p.corp_name || p.corpName,
          corpCode: p.corp_code || p.corpCode,
          stockCode: p.stock_code || p.stockCode,
          contractStartDate: p.contract_start_date || p.contractStartDate,
          modifyDate: p.modify_date || p.modifyDate
        }))

        // 상태 업데이트
        setPartners(transformedData)
        setCurrentPage(response.number ? response.number + 1 : response.page || page)
        setTotalPages(
          response.totalPages ||
            Math.ceil(
              (response.totalElements || response.total || 0) /
                (response.size || response.pageSize || pageSize)
            )
        )
        setTotalItems(response.totalElements || response.total || 0)
      } catch (error) {
        console.error('Failed to load partner companies:', error)
        showError('파트너사 목록을 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    },
    [pageSize]
  )

  // 페이지 첫 로드 시 파트너사 목록 조회
  useEffect(() => {
    setIsPageLoading(true)
    loadPartners(1).finally(() => setIsPageLoading(false))
  }, [loadPartners])

  // 메인 검색어 변경 시 파트너사 목록 재조회
  useEffect(() => {
    // isPageLoading이 true일때는 초기 로딩이므로, 검색어 변경으로 인한 재조회를 막습니다.
    if (!isPageLoading) {
      loadPartners(1, debouncedMainSearchQuery || undefined)
    }
  }, [debouncedMainSearchQuery, loadPartners, isPageLoading])

  // DART 기업 검색 (HEAD + origin/develop 통합)
  const searchDartCompanies = useCallback(async () => {
    if (!debouncedDartSearchQuery) {
      setDartSearchResults([])
      setDialogError(null)
      return
    }

    setIsLoading(true) // DART 검색 중 로딩 상태
    setDialogError(null)
    setDartSearchResults([])
    try {
      const response = await searchCompaniesFromDart({
        page: 1, // origin/develop 에서는 페이지 없었으나, API 스펙에 따라 추가/조정 가능
        pageSize: 5, // origin/develop 에서는 10, HEAD 에서는 5. 일단 5로 통일
        listedOnly: true, // HEAD 기준
        corpNameFilter: debouncedDartSearchQuery
      })

      setDartSearchResults(response.content || response.data || []) // API 응답이 content 또는 data 배열을 포함한다고 가정
      if ((response.content || response.data || []).length === 0) {
        setDialogError(`'${debouncedDartSearchQuery}'에 대한 검색 결과가 없습니다.`)
      }
    } catch (error) {
      console.error('Failed to search companies from DART:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'DART 기업 검색 중 오류가 발생했습니다.'
      setDialogError(errorMessage)
      showError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [debouncedDartSearchQuery])

  // DART 검색어 변경 시 또는 다이얼로그 열릴 때 DART 검색 (isAddDialogOpen || isEditDialogOpen)
  useEffect(() => {
    if (debouncedDartSearchQuery && (isAddDialogOpen || isEditDialogOpen)) {
      searchDartCompanies()
    }
  }, [debouncedDartSearchQuery, isAddDialogOpen, isEditDialogOpen, searchDartCompanies])

  /**
   * 회사명 중복 검사 함수
   * 디바운스된 회사명으로 실시간 중복 검사를 수행합니다.
   */
  const checkCompanyNameDuplicateInline = useCallback(
    async (companyName: string) => {
      if (!companyName || companyName.trim().length < 2) {
        setDuplicateCheckResult(null)
        setLastCheckedCompanyName('')
        return
      }

      // 이미 검사한 회사명인 경우 스킵
      if (companyName === lastCheckedCompanyName) {
        return
      }

      // 수정 모드에서 기존 회사명과 동일한 경우 스킵
      if (
        isEditDialogOpen &&
        selectedPartner &&
        companyName === selectedPartner.companyName
      ) {
        setDuplicateCheckResult(null)
        setLastCheckedCompanyName(companyName)
        return
      }

      setIsDuplicateChecking(true)
      try {
        const result = await checkCompanyNameDuplicate(companyName.trim())

        if (result.isDuplicate) {
          // 중복된 회사명일 때 토스트 메시지 표시
          showError('이미 추가된 파트너사입니다')
        }

        setDuplicateCheckResult({
          isDuplicate: result.isDuplicate,
          message: result.isDuplicate
            ? '이미 등록된 회사명입니다.'
            : '사용 가능한 회사명입니다.'
        })
        setLastCheckedCompanyName(companyName)
      } catch (error) {
        console.error('중복 검사 실패:', error)
        setDuplicateCheckResult({
          isDuplicate: false,
          message: '중복 검사에 실패했습니다. 다시 시도해주세요.'
        })
        showWarning('중복 검사에 실패했습니다. 다시 시도해주세요.')
      } finally {
        setIsDuplicateChecking(false)
      }
    },
    [lastCheckedCompanyName, isEditDialogOpen, selectedPartner]
  )

  // 디바운스된 회사명으로 실시간 중복 검사 실행
  useEffect(() => {
    if ((isAddDialogOpen || isEditDialogOpen) && debouncedCompanyName) {
      checkCompanyNameDuplicateInline(debouncedCompanyName)
    } else {
      setDuplicateCheckResult(null)
      setLastCheckedCompanyName('')
    }
  }, [
    debouncedCompanyName,
    isAddDialogOpen,
    isEditDialogOpen,
    checkCompanyNameDuplicateInline
  ])

  // DART 검색 결과에서 회사 선택 시 (HEAD + origin/develop)
  const handleSelectDartCompany = useCallback((company: DartCorpInfo) => {
    setSelectedDartCompany(company)
    setFormData(prev => ({
      ...prev,
      companyName: company.corpName || company.corp_name || '',
      corpCode: company.corpCode || company.corp_code || '',
      contractStartDate: new Date().toISOString().split('T')[0]
    }))
    // 선택한 회사명을 검색 필드에 유지
    setCompanySearchQuery(company.corpName || company.corp_name || '')
    // 검색 결과는 유지하되, 에러는 제거
    setDialogError(null)
  }, [])

  // 모달 상태 초기화 (HEAD + origin/develop)
  const resetModalStateAndClose = useCallback(() => {
    setFormData({
      id: '',
      companyName: '',
      corpCode: '',
      contractStartDate: new Date().toISOString().split('T')[0]
    })
    setCompanySearchQuery('')
    setDartSearchResults([])
    setSelectedDartCompany(null)
    setDialogError(null)
    setIsSubmitting(false)
    setIsAddDialogOpen(false)
    setIsEditDialogOpen(false)

    // 중복 검사 상태 초기화
    setDuplicateCheckResult(null)
    setIsDuplicateChecking(false)
    setLastCheckedCompanyName('')
  }, [])

  // 파트너사 추가/수정 핸들러 (HEAD + origin/develop 통합)
  const handleSubmitPartner = useCallback(async () => {
    // 기본 유효성 검사
    if (!formData.companyName || !formData.corpCode || !formData.contractStartDate) {
      setDialogError('회사명, DART코드, 계약 시작일은 필수입니다.')
      showError('회사명, DART코드, 계약 시작일은 필수입니다.')
      return
    }

    // 중복 검사 결과 확인 (추가 모드일 때만)
    if (!isEditDialogOpen && duplicateCheckResult?.isDuplicate) {
      setDialogError('이미 등록된 회사명입니다. 다른 회사명을 입력해주세요.')
      showError('이미 추가된 파트너사입니다')
      return
    }

    // 수정 모드에서 회사명이 변경되었을 때 중복 검사
    if (
      isEditDialogOpen &&
      selectedPartner &&
      formData.companyName !== selectedPartner.companyName &&
      duplicateCheckResult?.isDuplicate
    ) {
      setDialogError('이미 등록된 회사명입니다. 다른 회사명을 입력해주세요.')
      showError('이미 추가된 파트너사입니다')
      return
    }

    setIsSubmitting(true)
    setDialogError(null)

    console.log('=== 파트너사 저장 시작 ===')
    console.log('모드:', isEditDialogOpen ? '수정' : '추가')
    console.log('formData:', formData)
    console.log('selectedDartCompany:', selectedDartCompany)
    console.log('selectedPartner:', selectedPartner)

    try {
      // 선택된 DART 회사에서 주식코드 가져오기
      const stockCode = selectedDartCompany?.stockCode || selectedDartCompany?.stock_code
      console.log('stockCode:', stockCode)

      if (isEditDialogOpen && selectedPartner?.id) {
        // 수정 모드
        const updatedPartner = await updatePartnerCompany(selectedPartner.id, {
          companyName: formData.companyName,
          corpName: formData.companyName,
          corpCode: formData.corpCode,
          contractStartDate: formData.contractStartDate,
          stockCode: stockCode // 주식코드 추가
        })

        // 복원 여부 확인 후 적절한 토스트 표시
        if (updatedPartner?.isRestored) {
          showPartnerRestore(updatedPartner.companyName)
        } else {
          showSuccess('파트너사가 수정되었습니다.')
        }
      } else {
        // 추가 모드
        console.log('=== 파트너사 추가 API 호출 ===')
        const createData = {
          companyName: formData.companyName,
          corpCode: formData.corpCode,
          contractStartDate: formData.contractStartDate,
          stockCode: stockCode // 주식코드 추가
        }
        console.log('createData:', createData)

        const newPartner = await createPartnerCompany(createData)
        console.log('생성된 파트너사:', newPartner)

        // 복원 여부 확인 후 적절한 토스트 표시
        if (newPartner?.isRestored) {
          // 복구된 경우: "기존 회사를 복구했습니다"
          showPartnerRestore(newPartner.companyName)
        } else {
          // 새로 생성된 경우 또는 이미 존재하는 경우: "파트너사가 추가되었습니다"
          showSuccess('파트너사가 추가되었습니다.')
        }
      }
      resetModalStateAndClose()
      await loadPartners(
        isEditDialogOpen ? currentPage : 1,
        debouncedMainSearchQuery || undefined
      )
    } catch (error: unknown) {
      console.error('Failed to save partner company:', error)
      const errorMessage =
        error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'

      // 409 Conflict 에러 (중복 파트너사)인 경우 특별한 처리
      if (
        errorMessage.includes('이미 등록된') ||
        errorMessage.includes('이미 등록되어 있습니다')
      ) {
        showError('이미 등록된 파트너사입니다')
      } else {
        showError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [
    formData,
    currentPage,
    debouncedMainSearchQuery,
    loadPartners,
    resetModalStateAndClose,
    isEditDialogOpen,
    selectedPartner
  ])

  // 파트너사 삭제 핸들러 (HEAD 기준)
  const handleDeletePartner = useCallback(async () => {
    if (!selectedPartner?.id) return

    setIsSubmitting(true) // 삭제 작업도 submitting 상태 사용
    try {
      await deletePartnerCompany(selectedPartner.id)

      showSuccess('파트너사가 삭제되었습니다.')

      setIsDeleteDialogOpen(false)
      setSelectedPartner(null) // 선택 해제
      // 현재 페이지의 아이템이 모두 삭제되었을 경우, 이전 페이지로 이동하거나 1페이지로 이동
      let pageToLoad = currentPage
      if (partners.length === 1 && currentPage > 1) {
        pageToLoad = currentPage - 1
      }
      await loadPartners(pageToLoad, debouncedMainSearchQuery || undefined)
    } catch (error) {
      console.error('Failed to delete partner company:', error)
      showError('파트너사 삭제에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }, [
    selectedPartner,
    currentPage,
    partners.length,
    debouncedMainSearchQuery,
    loadPartners
  ])

  // 페이지 이동 핸들러 (HEAD 기준)
  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage) return
      loadPartners(page, debouncedMainSearchQuery || undefined)
    },
    [totalPages, currentPage, debouncedMainSearchQuery, loadPartners]
  )

  // 수정 다이얼로그 열기 핸들러
  const openEditDialog = (partner: PartnerCompany) => {
    setSelectedPartner(partner)

    setFormData({
      id: partner.id || '',
      companyName: partner.corpName || partner.companyName,
      corpCode: partner.corpCode || partner.corp_code || '',
      contractStartDate:
        partner.contract_start_date || partner.contractStartDate
          ? (partner.contract_start_date || partner.contractStartDate)
              ?.toString()
              .split('T')[0] || new Date().toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
    })
    setCompanySearchQuery(partner.corpName || partner.companyName)
    setSelectedDartCompany({
      // 선택된 DART 회사 정보도 설정 (수정 시 DART 재검색 불필요하게 안 하도록)
      corpCode: partner.corpCode || partner.corp_code || '',
      corpName: partner.corpName || partner.companyName,
      stockCode: partner.stockCode || partner.stock_code,
      modifyDate: partner.modifyDate || partner.modify_date || '',
      // 백엔드 호환성
      corp_code: partner.corpCode || partner.corp_code || '',
      corp_name: partner.corpName || partner.companyName,
      stock_code: partner.stockCode || partner.stock_code,
      modify_date: partner.modifyDate || partner.modify_date || ''
    })

    // 중복 검사 상태 초기화 (수정 모드에서는 기존 회사명으로 시작하므로 중복 검사 결과 초기화)
    setDuplicateCheckResult(null)
    setIsDuplicateChecking(false)
    setLastCheckedCompanyName('')

    setIsEditDialogOpen(true)
  }

  // 추가 다이얼로그 열기 핸들러
  const openAddDialog = () => {
    resetModalStateAndClose() // 이전 상태 초기화
    setIsAddDialogOpen(true)
  }

  // 로딩 UI
  if (isPageLoading && partners.length === 0) {
    // 초기 전체 페이지 로딩
    return <PageLoadingState />
  }

  return (
    <div className="flex flex-col w-full h-full p-4">
      <motion.div
        initial={{opacity: 0, y: -10}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.3}}
        className="flex flex-row items-center px-4 py-2 mb-6 text-sm text-gray-500 bg-white rounded-lg shadow-sm">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Home className="w-4 h-4 mr-1" />
              <BreadcrumbLink href="/home">대시보드</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="font-bold text-customG">파트너사 관리</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>
      {/* PageHeader + ArrowLeft */}
      <div className="flex flex-row justify-between w-full h-full mb-6">
        <Link
          href="/home"
          className="flex flex-row items-center p-4 space-x-4 transition rounded-md cursor-pointer hover:bg-gray-200">
          <ArrowLeft className="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
          <PageHeader
            icon={<Building2 className="w-6 h-6 text-customG" />}
            title="파트너사 관리"
            description="파트너사를 등록, 조회, 수정 및 삭제합니다."
            module="PARTNERCOMPANY"
            submodule="managePartner"
          />
        </Link>

        {/* 검색 및 필터 섹션 */}
        <PartnerSearchSection
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onOpenAddDialog={openAddDialog}
        />
      </div>

      <div className="flex flex-col gap-8">
        {/* 파트너사 추가 모달 */}
        <PartnerCompanyModal
          isOpen={isAddDialogOpen}
          onClose={resetModalStateAndClose}
          onSubmit={handleSubmitPartner}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          companySearchQuery={companySearchQuery}
          onCompanySearchQueryChange={setCompanySearchQuery}
          dartSearchResults={dartSearchResults}
          selectedDartCompany={selectedDartCompany}
          onSelectDartCompany={handleSelectDartCompany}
          dialogError={dialogError}
          duplicateCheckResult={duplicateCheckResult}
        />

        {/* 파트너사 수정 모달 */}
        <EditPartnerModal
          isOpen={isEditDialogOpen}
          onClose={resetModalStateAndClose}
          onSubmit={handleSubmitPartner}
          isSubmitting={isSubmitting}
          formData={formData}
          onFormDataChange={data => setFormData(prev => ({...prev, ...data}))}
        />

        {isLoading && partners.length === 0 && !isPageLoading ? (
          <PartnerLoadingState />
        ) : partners.length === 0 && !searchQuery ? (
          <EmptyPartnerState onOpenAddDialog={openAddDialog} />
        ) : partners.length === 0 && searchQuery ? (
          <SearchEmptyState searchQuery={searchQuery} />
        ) : (
          <PartnerTable
            partners={partners}
            onEditPartner={openEditDialog}
            onDeletePartner={partner => {
              setSelectedPartner(partner)
              setIsDeleteDialogOpen(true)
            }}
          />
        )}

        <PartnerPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <PartnerDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedPartner={selectedPartner}
        onConfirmDelete={handleDeletePartner}
        isSubmitting={isSubmitting}
        onClearSelection={() => setSelectedPartner(null)}
      />
      <DirectionButton
        direction="right"
        tooltip="재무 제표 리스크 관리로 이동"
        href="/financialRisk"
        fixed
        position="middle-right"
        size={48}
      />
    </div>
  )
}
