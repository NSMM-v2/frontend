'use client'

// ============================================================================
// 외부 라이브러리 임포트 (External Library Imports)
// ============================================================================

import React, {useState, useEffect, useCallback} from 'react'
import Link from 'next/link'
import {motion} from 'framer-motion'

// ============================================================================
// 아이콘 라이브러리 임포트 (Icon Library Imports)
// ============================================================================

import {
  Building2, // 빌딩 아이콘 - 협력\사 표시
  Home, // 홈 아이콘 - 브레드크럼 네비게이션
  Users, // 사용자 그룹 아이콘 - 협력사 관리
  ArrowLeft // 왼쪽 화살표 - 뒤로가기 버튼
} from 'lucide-react'

// ============================================================================
// 내부 컴포넌트 임포트 (Internal Component Imports)
// ============================================================================

import {PageHeader} from '@/components/layout/PageHeader'
import {DirectionButton} from '@/components/layout/direction'

// 협력사 관련 컴포넌트 (통합 완료)
import {
  PartnerCompanyModal,
  EditPartnerModal,
  PartnerDeleteDialog
} from '@/components/partner/PartnerModals'
import {
  PartnerSearchSection,
  PartnerPagination,
  EmptyPartnerState,
  SearchEmptyState,
  PartnerLoadingState,
  PageLoadingState
} from '@/components/partner/PartnerComponents'
import {PartnerTable} from '@/components/partner/PartnerTable'

// UI 컴포넌트
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

// ============================================================================
// 서비스 및 유틸리티 임포트 (Services & Utilities)
// ============================================================================

// 커스텀 API 훅
import {usePartnerCompanyAPI} from '@/hooks/usePartnerCompanyAPI'

// 커스텀 훅
import {useDebounce} from '@/hooks/useDebounce'

// 타입 정의
import {DartCorpInfo, PartnerCompany} from '@/types/partnerCompanyType'

// 인증 서비스
import {createPartner as authCreatePartner} from '@/services/authService'
import authService from '@/services/authService'

// 토스트 알림
import toast from '@/util/toast'

/**
 * 협력사 관리 폼 컴포넌트
 *
 * ESG 경영을 위한 협력사 관리 기능을 제공합니다.
 * scope3Form.tsx와 동일한 구조적 패턴 적용:
 * - 상단 브레드크럼 네비게이션
 * - 뒤로가기 버튼 + PageHeader
 * - Framer Motion 애니메이션 효과
 * - space-y-6 간격의 컴포넌트 배치
 *
 * 주요 기능:
 * - 협력사 목록 조회 및 검색 (페이지네이션 지원)
 * - DART API를 통한 기업 정보 검색 및 등록
 * - 협력사 정보 수정 및 삭제
 * - 실시간 검색 및 필터링
 */
export default function ManagePartnerForm() {
  // ========================================================================
  // 커스텀 훅 (Custom Hooks)
  // ========================================================================

  const {
    createPartner,
    updatePartner,
    deletePartner,
    fetchPartners,
    searchDartCompanies: searchDartAPI,
    checkDuplicateName,
    isLoading: apiIsLoading,
    error: apiError,
    clearError
  } = usePartnerCompanyAPI()

  // ========================================================================
  // 상태 관리 (State Management)
  // ========================================================================

  // 협력사 데이터 관련 상태
  const [partners, setPartners] = useState<PartnerCompany[]>([]) // 협력사 목록 데이터

  // 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(false) // 일반적인 로딩 상태
  const [isPageLoading, setIsPageLoading] = useState(true) // 페이지 초기 로딩 상태
  const [isSubmitting, setIsSubmitting] = useState(false) // 폼 제출 중 로딩 상태

  // 검색 및 필터링 상태
  const [searchQuery, setSearchQuery] = useState('') // 협력사 목록 검색어

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1) // 현재 페이지 번호
  const [totalPages, setTotalPages] = useState(1) // 전체 페이지 수
  const [totalItems, setTotalItems] = useState(0) // 전체 아이템 수
  const [pageSize] = useState(10) // 페이지당 아이템 수

  // 다이얼로그 상태 관리
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false) // 협력사 추가 다이얼로그
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false) // 협력사 수정 다이얼로그
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false) // 협력사 삭제 다이얼로그
  const [selectedPartner, setSelectedPartner] = useState<PartnerCompany | null>(null) // 선택된 협력사

  // 추가/수정 다이얼로그 내부 상태
  const [companySearchQuery, setCompanySearchQuery] = useState('') // DART 기업 검색어
  const [dartSearchResults, setDartSearchResults] = useState<DartCorpInfo[]>([]) // DART API 검색 결과
  const [selectedDartCompany, setSelectedDartCompany] = useState<DartCorpInfo | null>(
    null
  ) // DART에서 선택된 기업

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    id: '', // 협력사 ID (수정 시 사용)
    companyName: '', // 회사명
    corpCode: '', // DART 기업 코드
    contractStartDate: new Date().toISOString().split('T')[0] // 계약 시작일
  })

  // 협력사 추가 시 계약 시작일 (별도 상태)
  const [contractStartDate, setContractStartDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  const [dialogError, setDialogError] = useState<string | null>(null) // 다이얼로그 내 에러 메시지

  // 중복 검사 관련 상태
  const [isDuplicateChecking, setIsDuplicateChecking] = useState(false) // 회사명 중복 검사 진행 중 여부
  const [duplicateCheckResult, setDuplicateCheckResult] = useState<{
    isDuplicate: boolean
    message: string
  } | null>(null) // 회사명 중복 검사 결과
  const [lastCheckedCompanyName, setLastCheckedCompanyName] = useState('') // 마지막 중복 검사한 회사명

  // ========================================================================
  // 디바운스된 값들 (Debounced Values)
  // ========================================================================

  const debouncedMainSearchQuery = useDebounce(searchQuery, 500) // 협력사 목록 검색용
  const debouncedDartSearchQuery = useDebounce(companySearchQuery, 500) // DART 기업 검색용
  const debouncedCompanyName = useDebounce(formData.companyName, 800) // 회사명 중복 검사용

  // ========================================================================
  // API 호출 함수들 (API Functions)
  // ========================================================================

  /**
   * 협력사 목록을 서버에서 가져오는 함수
   * 페이지네이션과 검색 필터를 지원합니다.
   */
  const loadPartners = useCallback(
    async (page: number, companyNameFilter?: string) => {
      setIsLoading(true)
      setIsPageLoading(false)
      try {
        const response = await fetchPartners(page, pageSize, companyNameFilter)

        // API 응답이 Spring Data Page 형태인지 확인하고 적절히 처리
        const partners = response.content || response.data || []
        const totalElements = response.totalElements || response.total || 0
        const totalPages = response.totalPages || Math.ceil(totalElements / pageSize)

        setPartners(partners)
        setTotalItems(totalElements)
        setTotalPages(totalPages)
        setCurrentPage(page)
      } catch (error) {
        console.error('협력사 목록 조회 오류:', error)
        setPartners([])
        setTotalItems(0)
        setTotalPages(1)
      } finally {
        setIsLoading(false)
        setIsPageLoading(false)
      }
    },
    [pageSize, fetchPartners]
  )

  /**
   * DART API에서 기업 정보를 검색하는 함수
   */
  const searchDartCompanies = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setDartSearchResults([])
        return
      }

      setIsLoading(true)
      try {
        const response = await searchDartAPI({
          corpNameFilter: query.trim(),
          page: 1,
          pageSize: 20
        })
        setDartSearchResults(response.content)
      } catch (error) {
        console.error('DART 기업 검색 오류:', error)
        setDartSearchResults([])
      } finally {
        setIsLoading(false)
      }
    },
    [searchDartAPI]
  )

  /**
   * 회사명 중복 검사를 수행하는 함수
   */
  const checkDuplicateCompanyName = useCallback(
    async (companyName: string) => {
      if (!companyName.trim() || companyName === lastCheckedCompanyName) {
        return
      }

      setIsDuplicateChecking(true)
      setDuplicateCheckResult(null)

      try {
        const response = await checkDuplicateName(companyName.trim())
        const result = {
          isDuplicate: response.isDuplicate,
          message: response.message
        }
        setDuplicateCheckResult(result)
        setLastCheckedCompanyName(companyName)
      } catch (error) {
        console.error('회사명 중복 검사 오류:', error)
        setDuplicateCheckResult({
          isDuplicate: false,
          message: '중복 검사를 수행할 수 없습니다.'
        })
      } finally {
        setIsDuplicateChecking(false)
      }
    },
    [lastCheckedCompanyName, checkDuplicateName]
  )

  // ========================================================================
  // CRUD 함수들 (CRUD Functions)
  // ========================================================================

  /**
   * 새로운 협력\사를 등록하는 함수
   */
  const handleCreatePartner = async () => {
    setIsSubmitting(true)
    setDialogError(null)

    try {
      // 유효성 검사
      if (!selectedDartCompany) {
        setDialogError('DART 기업을 선택해주세요.')
        return
      }

      if (!contractStartDate) {
        setDialogError('계약 시작일을 선택해주세요.')
        return
      }

      // 협력\사 등록 API 호출 - 새로운 형식
      await createPartner({
        corpCode: selectedDartCompany.corpCode || selectedDartCompany.corp_code!,
        contractStartDate: contractStartDate
      })

      setIsAddDialogOpen(false)
      resetForm()
      await loadPartners(currentPage, debouncedMainSearchQuery)
    } catch (error) {
      console.error('협력사 등록 오류:', error)
      // 에러 토스트는 커스텀 훅에서 자동 처리됨
      setDialogError('협력사 등록에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * 협력\사 정보를 수정하는 함수
   */
  const handleUpdatePartner = async () => {
    if (!selectedPartner) return

    setIsSubmitting(true)
    setDialogError(null)

    try {
      // 유효성 검사
      if (!formData.corpCode.trim()) {
        setDialogError('기업 코드를 입력해주세요.')
        return
      }

      if (!formData.contractStartDate) {
        setDialogError('계약 시작일을 선택해주세요.')
        return
      }

      // 협력\사 수정 API 호출
      await updatePartner(selectedPartner.id!, {
        corpCode: formData.corpCode.trim(),
        contractStartDate: formData.contractStartDate
      })

      setIsEditDialogOpen(false)
      resetForm()
      await loadPartners(currentPage, debouncedMainSearchQuery)
    } catch (error) {
      console.error('협력사 수정 오류:', error)
      // 에러 토스트는 커스텀 훅에서 자동 처리됨
      setDialogError('협력사 정보 수정에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * 협력\사를 삭제하는 함수
   */
  const handleDeletePartner = async () => {
    if (!selectedPartner) return

    setIsSubmitting(true)

    try {
      await deletePartner(selectedPartner.id!, selectedPartner.companyName)
      setIsDeleteDialogOpen(false)
      setSelectedPartner(null)

      // 현재 페이지에 아이템이 하나도 없다면 이전 페이지로 이동
      const remainingItems = partners.length - 1
      if (remainingItems === 0 && currentPage > 1) {
        await loadPartners(currentPage - 1, debouncedMainSearchQuery)
      } else {
        await loadPartners(currentPage, debouncedMainSearchQuery)
      }
    } catch (error) {
      console.error('협력사 삭제 오류:', error)
      // 에러 토스트는 커스텀 훅에서 자동 처리됨
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========================================================================
  // 다이얼로그 관리 함수들 (Dialog Management Functions)
  // ========================================================================

  /**
   * 협력\사 수정 다이얼로그를 여는 함수
   */
  const openEditDialog = (partner: PartnerCompany) => {
    setSelectedPartner(partner)
    setFormData({
      id: partner.id || '',
      companyName: partner.companyName || '',
      corpCode: partner.corpCode || '',
      contractStartDate:
        typeof partner.contractStartDate === 'string'
          ? partner.contractStartDate
          : partner.contractStartDate?.toISOString().split('T')[0] ||
            new Date().toISOString().split('T')[0]
    })
    setDuplicateCheckResult(null)
    setLastCheckedCompanyName('')
    setDialogError(null)
    setIsEditDialogOpen(true)
  }

  /**
   * 협력\사 추가 다이얼로그를 여는 함수
   */
  const openAddDialog = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  /**
   * 협력\사 삭제 확인 다이얼로그를 여는 함수
   */
  const openDeleteDialog = (partner: PartnerCompany) => {
    setSelectedPartner(partner)
    setIsDeleteDialogOpen(true)
  }

  /**
   * 모든 폼 데이터와 관련 상태를 초기화하는 함수
   */
  const resetForm = () => {
    setFormData({
      id: '',
      companyName: '',
      corpCode: '',
      contractStartDate: new Date().toISOString().split('T')[0]
    })
    setContractStartDate(new Date().toISOString().split('T')[0])
    setSelectedDartCompany(null)
    setCompanySearchQuery('')
    setDartSearchResults([])
    setDialogError(null)
    setDuplicateCheckResult(null)
    setLastCheckedCompanyName('')
  }

  // ========================================================================
  // 이벤트 핸들러들 (Event Handlers)
  // ========================================================================

  /**
   * 페이지 변경 이벤트 핸들러
   */
  const handlePageChange = (page: number) => {
    loadPartners(page, debouncedMainSearchQuery)
  }

  /**
   * 검색어 변경 이벤트 핸들러
   */
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // 검색 시 첫 페이지로 이동
  }

  /**
   * DART에서 회사 선택 이벤트 핸들러
   */
  const handleDartCompanySelect = (company: DartCorpInfo) => {
    setSelectedDartCompany(company)
    setFormData(prev => ({
      ...prev,
      companyName: company.corp_name || company.corpName || '',
      corpCode: company.corp_code || company.corpCode || ''
    }))
    setCompanySearchQuery('')
    setDartSearchResults([])
  }

  /**
   * 기존 협력\사를 위한 auth 계정 생성 함수
   * authService의 createPartner 함수를 활용 (DART API 기반)
   */
  const handleCreateAccount = async (partner: PartnerCompany) => {
    setIsSubmitting(true)
    try {
      // 필수 정보 검증
      if (!partner.id) {
        throw new Error('협력사 UUID가 없습니다.')
      }

      // 현재 사용자 정보 조회하여 parentUuid 결정
      let parentUuid: string | undefined = undefined

      try {
        const currentUserResponse = await authService.getCurrentUserByType()
        if (currentUserResponse?.success && currentUserResponse.data) {
          const currentUser = currentUserResponse.data

          // 협력사가 로그인한 경우, 해당 협력사를 상위로 설정
          if (currentUser.userType === 'PARTNER' && currentUser.uuid) {
            parentUuid = currentUser.uuid
            console.log('협력사 로그인: 상위 UUID 설정됨', parentUuid)
          }
          // 본사가 로그인한 경우 parentUuid는 undefined (1차 협력사로 생성)
        }
      } catch (error) {
        console.warn('현재 사용자 정보 조회 실패, 1차 협력사로 생성됩니다:', error)
      }

      // 디버깅 로그 (개발 환경에서만)
      if (process.env.NODE_ENV === 'development') {
        console.log('계정 생성 대상 협력사:', {
          id: partner.id,
          corpName: partner.corpName,
          ceoName: partner.ceoName,
          address: partner.address,
          phoneNumber: partner.phoneNumber,
          parentUuid
        })
      }

      // PartnerCreateRequest 구조에 맞는 데이터 준비
      const accountData = {
        uuid: partner.id, // DART API 회사 고유 식별자
        contactPerson: partner.ceoName || '담당자', // DART API 대표자명
        companyName: partner.corpName || partner.companyName || '협력사', // DART API 회사명
        ...(partner.address && {address: partner.address}), // 주소가 있으면 포함
        ...(partner.phoneNumber && {phone: partner.phoneNumber}), // 전화번호가 있으면 포함
        parentUuid // 현재 사용자 타입에 따라 결정된 상위 UUID
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('계정 생성 요청 데이터:', accountData)
      }

      // auth 계정 생성 API 호출
      const response = await authCreatePartner(accountData)

      if (response.success && response.data) {
        // 성공 토스트 알림
        toast.success(
          `${
            partner.corpName || partner.companyName
          }의 계정이 성공적으로 생성되었습니다.\n계정번호: ${
            response.data.fullAccountNumber
          }\n초기 비밀번호: ${response.data.initialPassword}`
        )

        // 협력\사 목록 새로고침
        await loadPartners(currentPage, debouncedMainSearchQuery || undefined)

        console.log('계정 생성 성공:', response.data)
      } else {
        throw new Error(response.message || '계정 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('계정 생성 실패:', error)
      const errorMessage =
        error instanceof Error ? error.message : '계정 생성 중 오류가 발생했습니다.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========================================================================
  // 생명주기 관리 (Lifecycle Management)
  // ========================================================================

  /**
   * 컴포넌트 마운트 시 초기 데이터 로드
   */
  useEffect(() => {
    loadPartners(1)
  }, [loadPartners])

  /**
   * 디바운스된 메인 검색어 변경 시 검색 실행
   */
  useEffect(() => {
    if (debouncedMainSearchQuery !== undefined) {
      loadPartners(1, debouncedMainSearchQuery)
    }
  }, [debouncedMainSearchQuery, loadPartners])

  /**
   * 디바운스된 DART 검색어 변경 시 DART 검색 실행
   */
  useEffect(() => {
    if (debouncedDartSearchQuery && isAddDialogOpen) {
      searchDartCompanies(debouncedDartSearchQuery)
    }
  }, [debouncedDartSearchQuery, isAddDialogOpen, searchDartCompanies])

  /**
   * 디바운스된 회사명 변경 시 중복 검사 실행
   */
  useEffect(() => {
    if (debouncedCompanyName && (isAddDialogOpen || isEditDialogOpen)) {
      checkDuplicateCompanyName(debouncedCompanyName)
    }
  }, [debouncedCompanyName, isAddDialogOpen, isEditDialogOpen, checkDuplicateCompanyName])

  // 현재 페이지의 데이터만 새로고침하는 함수
  const refreshCurrentPage = async () => {
    await loadPartners(currentPage, searchQuery)
  }

  return (
    <div className="flex flex-col w-full pt-24">
      {/* ======================================================================
          상단 네비게이션 섹션 (Top Navigation Section)
          ====================================================================== */}
      <div className="flex flex-row items-center p-2 px-2 mb-4 text-sm text-gray-500 bg-white rounded-lg shadow-sm">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Home className="w-4 h-4 mr-1" />
              <BreadcrumbLink href="/dashboard">대시보드</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="font-bold text-blue-600">협력사 추가</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ======================================================================
          헤더 섹션 (Header Section)
          ====================================================================== */}
      <div className="flex flex-row justify-between w-full mb-4">
        <div className="flex flex-row items-center p-3 space-x-4 transition rounded-md">
          <PageHeader
            icon={<Users className="w-6 h-6 text-blue-600" />}
            title="협력사 추가"
            description="ESG 경영을 위한 협력사를 등록하고 관리합니다"
            module="PARTNERCOMPANY"
            submodule="managePartner"
          />
        </div>
        {/* 협력\사 검색 섹션 */}
        <PartnerSearchSection
          searchQuery={searchQuery}
          onSearchQueryChange={handleSearchChange}
          onOpenAddDialog={openAddDialog}
        />
      </div>

      {/* ======================================================================
          메인 콘텐츠 영역 (Main Content Area)
          ====================================================================== */}
      <motion.div
        initial={{opacity: 0, scale: 0.95}}
        animate={{opacity: 1, scale: 1}}
        transition={{delay: 0.6, duration: 0.5}}
        className="space-y-4">
        {/* 페이지 로딩 상태 표시 */}
        {isPageLoading ? (
          <PageLoadingState />
        ) : (
          <>
            {/* 협력\사 목록 테이블 또는 빈 상태 */}
            {partners.length === 0 ? (
              searchQuery ? (
                <SearchEmptyState searchQuery={searchQuery} />
              ) : (
                <EmptyPartnerState onOpenAddDialog={openAddDialog} />
              )
            ) : (
              <>
                <PartnerTable
                  partners={partners}
                  onEditPartner={openEditDialog}
                  onDeletePartner={openDeleteDialog}
                  onCreateAccount={handleCreateAccount}
                  onRefresh={refreshCurrentPage}
                />

                {/* 페이지네이션 */}
                <PartnerPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </>
        )}
      </motion.div>

      {/* ======================================================================
          다이얼로그 모달들 (Dialog Modals)
          ====================================================================== */}

      {/* 협력\사 추가 다이얼로그 */}
      <PartnerCompanyModal
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleCreatePartner}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        companySearchQuery={companySearchQuery}
        onCompanySearchQueryChange={setCompanySearchQuery}
        dartSearchResults={dartSearchResults}
        selectedDartCompany={selectedDartCompany}
        onSelectDartCompany={handleDartCompanySelect}
        contractStartDate={contractStartDate}
        onContractStartDateChange={setContractStartDate}
        dialogError={dialogError}
        duplicateCheckResult={duplicateCheckResult}
      />

      {/* 협력\사 수정 다이얼로그 */}
      <EditPartnerModal
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleUpdatePartner}
        isSubmitting={isSubmitting}
        formData={formData}
        onFormDataChange={data => setFormData(prev => ({...prev, ...data}))}
      />

      {/* 협력\사 삭제 확인 다이얼로그 */}
      <PartnerDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={open => setIsDeleteDialogOpen(open)}
        selectedPartner={selectedPartner}
        onConfirmDelete={handleDeletePartner}
        isSubmitting={isSubmitting}
        onClearSelection={() => setSelectedPartner(null)}
      />

      {/* 네비게이션 버튼 */}
      <DirectionButton
        direction="right"
        tooltip="재무 리스크로 이동"
        href="/financialRisk"
        fixed
        position="middle-right"
        size={48}
      />
    </div>
  )
}
