/**
 * 파트너사 API 호출 및 토스트 처리 통합 커스텀 훅
 *
 * API 호출과 성공/실패 토스트 메시지를 중앙에서 관리하여
 * 일관된 사용자 경험을 제공하고 코드 중복을 제거합니다.
 *
 * 주요 기능:
 * - 모든 파트너사 관련 API 호출 래핑
 * - 자동 성공/실패 토스트 처리
 * - 로딩 상태 관리
 * - 에러 상태 관리
 *
 * 사용된 기술:
 * - React Hooks (useState, useCallback)
 * - 통합 토스트 시스템 (util/toast.tsx)
 *
 * @author ESG Project Team
 * @version 1.0
 * @since 2024
 * @lastModified 2024-12-20
 */

import {useState, useCallback} from 'react'

// ============================================================================
// 서비스 및 유틸리티 임포트 (Services & Utilities)
// ============================================================================

import {
  createPartnerCompany,
  fetchPartnerCompanies,
  updatePartnerCompany,
  deletePartnerCompany,
  searchCompaniesFromDart,
  fetchFinancialRiskAssessment,
  checkCompanyNameDuplicate,
  fetchDartCompanyProfile
} from '@/services/partnerCompanyService'

import {showSuccess, showError, showWarning, showPartnerRestore} from '@/util/toast'

// ============================================================================
// 타입 임포트 (Type Imports)
// ============================================================================

import {
  CreatePartnerCompanyRequest,
  UpdatePartnerCompanyRequest,
  SearchCorpParams,
  PartnerCompany,
  PartnerCompanyResponse,
  DartApiResponse,
  DartCompanyProfile,
  FinancialRiskAssessment,
  CompanyNameDuplicateCheckResult
} from '@/types/partnerCompanyType'

// ============================================================================
// 커스텀 훅 인터페이스 정의 (Custom Hook Interface)
// ============================================================================

interface UsePartnerCompanyAPIReturn {
  // CRUD 함수들
  createPartner: (data: CreatePartnerCompanyRequest) => Promise<PartnerCompany>
  updatePartner: (
    id: string,
    data: UpdatePartnerCompanyRequest
  ) => Promise<PartnerCompany | null>
  deletePartner: (id: string, companyName: string) => Promise<void>
  fetchPartners: (
    page?: number,
    pageSize?: number,
    companyNameFilter?: string
  ) => Promise<PartnerCompanyResponse>

  // DART API 함수들
  searchDartCompanies: (params: SearchCorpParams) => Promise<DartApiResponse>
  fetchDartProfile: (corpCode: string) => Promise<DartCompanyProfile>

  // 기타 함수들
  fetchFinancialRisk: (
    corpCode: string,
    partnerName?: string
  ) => Promise<FinancialRiskAssessment>
  checkDuplicateName: (
    companyName: string,
    excludeId?: string
  ) => Promise<CompanyNameDuplicateCheckResult>

  // 상태 관리
  isLoading: boolean
  error: string | null
  clearError: () => void
}

/**
 * 파트너사 API 통합 관리 커스텀 훅
 *
 * 모든 파트너사 관련 API 호출을 래핑하고 자동으로 토스트 처리를 수행합니다.
 * 성공/실패 메시지가 일관되게 표시되며, 로딩 상태도 함께 관리됩니다.
 *
 * @returns API 함수들과 상태 관리 객체
 */
export function usePartnerCompanyAPI(): UsePartnerCompanyAPIReturn {
  // ========================================================================
  // 상태 관리 (State Management)
  // ========================================================================

  const [isLoading, setIsLoading] = useState(false) // 전역 로딩 상태
  const [error, setError] = useState<string | null>(null) // 에러 상태

  // ========================================================================
  // 유틸리티 함수들 (Utility Functions)
  // ========================================================================

  /**
   * 에러 상태를 초기화하는 함수
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * API 호출을 래핑하는 공통 함수
   * 로딩 상태와 에러 처리를 자동으로 수행합니다.
   */
  const wrapAPICall = useCallback(
    async <T>(apiCall: () => Promise<T>, showErrorToast = true): Promise<T> => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await apiCall()
        return result
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
        setError(errorMessage)

        // 에러 토스트 자동 표시 (옵션)
        if (showErrorToast) {
          showError(errorMessage)
        }

        throw error // 여전히 throw해서 컴포넌트에서 추가 처리 가능
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // ========================================================================
  // CRUD API 함수들 (CRUD API Functions)
  // ========================================================================

  /**
   * 새로운 파트너사를 등록합니다.
   * 성공 시 자동으로 성공 토스트를 표시합니다.
   */
  const createPartner = useCallback(
    async (data: CreatePartnerCompanyRequest): Promise<PartnerCompany> => {
      return wrapAPICall(async () => {
        try {
          const result = await createPartnerCompany(data)
          showSuccess('파트너사가 성공적으로 등록되었습니다.')
          return result
        } catch (error: unknown) {
          // 409 에러이고 복원된 경우 특별 처리
          if (error && typeof error === 'object' && 'message' in error) {
            const errorMessage = (error as {message: string}).message
            if (errorMessage.includes('복원') || errorMessage.includes('restored')) {
              showPartnerRestore(errorMessage)
              // 복원된 파트너사 데이터가 있다면 반환
              throw error // 일단 에러를 다시 던져서 원래 로직 유지
            }
          }
          throw error
        }
      }, false) // createPartner에서는 wrapAPICall의 에러 토스트 사용하지 않음 (직접 처리)
    },
    [wrapAPICall]
  )

  /**
   * 파트너사 정보를 수정합니다.
   * 성공 시 자동으로 성공 토스트를 표시합니다.
   */
  const updatePartner = useCallback(
    async (
      id: string,
      data: UpdatePartnerCompanyRequest
    ): Promise<PartnerCompany | null> => {
      return wrapAPICall(async () => {
        const result = await updatePartnerCompany(id, data)
        if (result) {
          showSuccess('파트너사 정보가 성공적으로 수정되었습니다.')
        }
        return result
      })
    },
    [wrapAPICall]
  )

  /**
   * 파트너사를 삭제합니다.
   * 성공 시 자동으로 성공 토스트를 표시합니다.
   */
  const deletePartner = useCallback(
    async (id: string, companyName: string): Promise<void> => {
      return wrapAPICall(async () => {
        await deletePartnerCompany(id)
        showSuccess(`${companyName}이(가) 성공적으로 삭제되었습니다.`)
      })
    },
    [wrapAPICall]
  )

  /**
   * 파트너사 목록을 조회합니다.
   * 에러 시 자동으로 에러 토스트를 표시합니다.
   */
  const fetchPartners = useCallback(
    async (
      page = 1,
      pageSize = 10,
      companyNameFilter?: string
    ): Promise<PartnerCompanyResponse> => {
      return wrapAPICall(async () => {
        const result = await fetchPartnerCompanies(page, pageSize, companyNameFilter)
        return result
      }, false) // 목록 조회 시에는 토스트 표시하지 않음
    },
    [wrapAPICall]
  )

  // ========================================================================
  // DART API 함수들 (DART API Functions)
  // ========================================================================

  /**
   * DART API에서 기업 정보를 검색합니다.
   * 에러 시 자동으로 에러 토스트를 표시합니다.
   */
  const searchDartCompanies = useCallback(
    async (params: SearchCorpParams): Promise<DartApiResponse> => {
      return wrapAPICall(async () => {
        const result = await searchCompaniesFromDart(params)
        return result
      }, true) // DART 검색 실패 시 토스트 표시
    },
    [wrapAPICall]
  )

  /**
   * 특정 DART 기업의 상세 정보를 조회합니다.
   * 에러 시 자동으로 에러 토스트를 표시합니다.
   */
  const fetchDartProfile = useCallback(
    async (corpCode: string): Promise<DartCompanyProfile> => {
      return wrapAPICall(async () => {
        const result = await fetchDartCompanyProfile(corpCode)
        return result
      })
    },
    [wrapAPICall]
  )

  // ========================================================================
  // 기타 API 함수들 (Other API Functions)
  // ========================================================================

  /**
   * 파트너사의 재무 위험 분석 정보를 조회합니다.
   * 에러 시 자동으로 에러 토스트를 표시합니다.
   */
  const fetchFinancialRisk = useCallback(
    async (corpCode: string, partnerName?: string): Promise<FinancialRiskAssessment> => {
      return wrapAPICall(async () => {
        const result = await fetchFinancialRiskAssessment(corpCode, partnerName)
        return result
      }, true) // 재무 위험 데이터 조회 실패 시 토스트 표시
    },
    [wrapAPICall]
  )

  /**
   * 회사명 중복 검사를 수행합니다.
   * 에러 시 자동으로 에러 토스트를 표시합니다.
   */
  const checkDuplicateName = useCallback(
    async (
      companyName: string,
      excludeId?: string
    ): Promise<CompanyNameDuplicateCheckResult> => {
      return wrapAPICall(async () => {
        const result = await checkCompanyNameDuplicate(companyName, excludeId)
        return result
      }, false) // 중복 검사는 조용히 처리
    },
    [wrapAPICall]
  )

  // ========================================================================
  // 반환 객체 (Return Object)
  // ========================================================================

  return {
    // CRUD 함수들
    createPartner,
    updatePartner,
    deletePartner,
    fetchPartners,

    // DART API 함수들
    searchDartCompanies,
    fetchDartProfile,

    // 기타 함수들
    fetchFinancialRisk,
    checkDuplicateName,

    // 상태 관리
    isLoading,
    error,
    clearError
  }
}

/**
 * 개별 API 호출용 경량 훅들
 * 특정 기능만 필요한 경우 사용할 수 있는 개별 훅들입니다.
 */

/**
 * 파트너사 생성 전용 훅
 */
export function useCreatePartnerCompany() {
  const {createPartner, isLoading, error, clearError} = usePartnerCompanyAPI()

  return {
    createPartner,
    isCreating: isLoading,
    error,
    clearError
  }
}

/**
 * 파트너사 목록 조회 전용 훅
 */
export function useFetchPartnerCompanies() {
  const {fetchPartners, isLoading, error, clearError} = usePartnerCompanyAPI()

  return {
    fetchPartners,
    isFetching: isLoading,
    error,
    clearError
  }
}

/**
 * DART 기업 검색 전용 훅
 */
export function useSearchDartCompanies() {
  const {searchDartCompanies, isLoading, error, clearError} = usePartnerCompanyAPI()

  return {
    searchDartCompanies,
    isSearching: isLoading,
    error,
    clearError
  }
}

/**
 * 재무 위험 분석 전용 훅
 */
export function useFetchFinancialRisk() {
  const {fetchFinancialRisk, isLoading, error, clearError} = usePartnerCompanyAPI()

  return {
    fetchFinancialRisk,
    isFetching: isLoading,
    error,
    clearError
  }
}
