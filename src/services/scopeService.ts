import api from '@/lib/axios'
import {
  showError,
  showSuccess,
  showLoading,
  showWarning,
  dismissLoading
} from '@/util/toast'
import {
  ScopeEmissionRequest,
  ScopeEmissionResponse,
  ScopeEmissionUpdateRequest,
  ScopeCategoryResponse,
  ScopeCategorySummary,
  ApiResponse,
  ScopeType,
  MonthlyEmissionSummary,
  CategoryYearlyEmission,
  CategoryMonthlyEmission
} from '@/types/scopeTypes'

// 통합 Scope 배출량 데이터 생성 API (Creation APIs)
export const createScopeEmission = async (
  data: ScopeEmissionRequest
): Promise<ScopeEmissionResponse> => {
  try {
    showLoading(`${data.scopeType} 배출량 데이터를 저장중입니다...`)

    const response = await api.post<ApiResponse<ScopeEmissionResponse>>(
      '/api/v1/scope/emissions',
      data
    )

    dismissLoading()

    if (response.data.success && response.data.data) {
      showSuccess(`${data.scopeType} 배출량 데이터가 저장되었습니다.`)
      return response.data.data
    } else {
      throw new Error(response.data.message || '배출량 데이터 저장에 실패했습니다.')
    }
  } catch (error: any) {
    dismissLoading()
    handleScopeEmissionError(error, '저장')
    throw error
  }
}
// ============================================================================

// 통합 Scope 배출량 데이터 수정 API (Update APIs)
export const updateScopeEmission = async (
  id: number,
  data: ScopeEmissionUpdateRequest
): Promise<ScopeEmissionResponse> => {
  try {

    const response = await api.put<ApiResponse<ScopeEmissionResponse>>(
      `/api/v1/scope/emissions/${id}`,
      data
    )

    dismissLoading()

    if (response.data.success && response.data.data) {
      showSuccess('배출량 데이터가 수정되었습니다.')
      return response.data.data
    } else {
      throw new Error(response.data.message || '배출량 데이터 수정에 실패했습니다.')
    }
  } catch (error: any) {
    dismissLoading()
    handleScopeEmissionError(error, '수정')
    throw error
  }
}
// ============================================================================

// 통합 Scope 배출량 데이터 삭제 API (Delete APIs)
export const deleteScopeEmission = async (id: number): Promise<boolean> => {
  try {

    const response = await api.delete<ApiResponse<string>>(
      `/api/v1/scope/emissions/${id}`
    )

    dismissLoading()

    if (response.data.success) {
      showSuccess('배출량 데이터가 삭제되었습니다.')
      return true
    } else {
      showError(response.data.message || '삭제에 실패했습니다.')
      return false
    }
  } catch (error: any) {
    dismissLoading()
    showError(error.response?.data?.message || '삭제 중 오류가 발생했습니다.')
    return false
  }
}
// ============================================================================

// 통합 Scope 배출량 데이터 단건 조회 API (Query APIs)
export const fetchScopeEmissionById = async (
  id: number
): Promise<ScopeEmissionResponse | null> => {
  try {
    const response = await api.get<ApiResponse<ScopeEmissionResponse>>(
      `/api/v1/scope/emissions/${id}`
    )

    if (response.data.success && response.data.data) {
      return response.data.data
    } else {
      throw new Error(response.data.message || '배출량 데이터 조회에 실패했습니다.')
    }
  } catch (error: any) {
    showError(
      error.response?.data?.message || '배출량 데이터 조회 중 오류가 발생했습니다.'
    )
    return null
  }
}

// 특정 Scope 타입의 배출량 데이터 조회 API (Query APIs)
export const fetchEmissionsByScope = async (
  scopeType: ScopeType
): Promise<ScopeEmissionResponse[]> => {
  try {
    const response = await api.get<ApiResponse<ScopeEmissionResponse[]>>(
      `/api/v1/scope/emissions/scope/${scopeType}`
    )

    if (response.data.success && response.data.data) {
      return response.data.data
    } else {
      throw new Error(response.data.message || '배출량 데이터 조회에 실패했습니다.')
    }
  } catch (error: any) {
    showError(
      error.response?.data?.message || '배출량 데이터 조회 중 오류가 발생했습니다.'
    )
    return []
  }
}
// ============================================================================
// 집계 및 요약 API (Summary & Aggregation APIs)
// ============================================================================

/**
 * 협력사별 월별 배출량 집계 조회
 * 백엔드 엔드포인트: GET /api/v1/scope/aggregation/partner/{partnerId}/year/{year}/monthly-summary
 * @param partnerId 협력사 ID
 * @param year 보고년도
 * @returns Promise<MonthlyEmissionSummary[]> 월별 배출량 집계 데이터
 */
export const fetchPartnerMonthlyEmissions = async (
  partnerId: number,
  year: number
): Promise<MonthlyEmissionSummary[]> => {
  try {
    // showLoading('월별 배출량 데이터를 조회중입니다...')

    const response = await api.get<ApiResponse<MonthlyEmissionSummary[]>>(
      `/api/v1/scope/aggregation/partner/${partnerId}/year/${year}/monthly-summary`
    )

    dismissLoading()

    if (response.data.success && response.data.data) {
      return response.data.data
    } else {
      throw new Error(response.data.message || '월별 배출량 집계 조회에 실패했습니다.')
    }
  } catch (error: any) {
    dismissLoading()
    showError(
      error.response?.data?.message || '월별 배출량 집계 조회 중 오류가 발생했습니다.'
    )
    return []
  }
}

/**
 * Scope 카테고리별 총계 조회
 * 백엔드 엔드포인트: GET /api/v1/scope/emissions/summary/scope/{scopeType}/year/{year}/month/{month}
 * @param scopeType Scope 타입
 * @param year 보고년도
 * @param month 보고월
 * @returns Promise<ScopeCategorySummary> 카테고리별 총 배출량
 */
export const fetchCategorySummaryByScope = async (
  scopeType: ScopeType,
  year: number,
  month: number
): Promise<ScopeCategorySummary> => {
  try {
    const response = await api.get<ApiResponse<ScopeCategorySummary>>(
      `/api/v1/scope/emissions/summary/scope/${scopeType}/year/${year}/month/${month}`
    )

    if (response.data.success && response.data.data) {
      return response.data.data
    } else {
      throw new Error(
        response.data.message || '카테고리 요약 데이터 조회에 실패했습니다.'
      )
    }
  } catch (error: any) {
    showError(
      error.response?.data?.message || '카테고리 요약 데이터 조회 중 오류가 발생했습니다.'
    )
    return {}
  }
}

// ============================================================================
// 에러 처리 헬퍼 함수 (Error Handling Helper Functions)
// ============================================================================

/**
 * Scope 배출량 관련 에러 처리 헬퍼 함수
 * 백엔드 컨트롤러의 에러 코드와 매핑하여 사용자 친화적 메시지 제공
 * @param error 에러 객체
 * @param operation 수행 중인 작업 (저장, 수정, 삭제 등)
 */
const handleScopeEmissionError = (error: any, operation: string) => {
  if (error?.response?.status === 400) {
    const errorMessage =
      error.response?.data?.message || '입력 데이터가 올바르지 않습니다.'
    const errorCode = error.response?.data?.errorCode

    let userFriendlyMessage = errorMessage

    // 백엔드 ErrorCode에 따른 사용자 친화적 메시지 변환
    switch (errorCode) {
      case 'VALIDATION_ERROR':
        userFriendlyMessage = '모든 필수 필드를 올바르게 입력해주세요'
        break
      case 'MISSING_REQUIRED_FIELD':
        userFriendlyMessage = '모든 필수 필드를 입력해주세요'
        break
      case 'INVALID_CATEGORY_NUMBER':
        userFriendlyMessage = '올바른 범위를 입력해주세요'
        break
      case 'INVALID_EMISSION_FACTOR':
        userFriendlyMessage = '배출계수 입력 오류 예: 999,999,999.999999'
        break
      case 'INVALID_ACTIVITY_AMOUNT':
        userFriendlyMessage = '수량 입력 오류 예: 999,999,999,999.999'
        break
      case 'INVALID_TOTAL_EMISSION':
        userFriendlyMessage =
          '⚠️ 계산 결과 오류\n\n📍 해결 방법:\n• 수량 × 배출계수 = 총 배출량\n• 계산 결과를 다시 확인해주세요'
        break
      default:
        // 메시지 내용 기반 변환
        if (errorMessage.includes('제품 코드')) {
          userFriendlyMessage = '제품 코드 매핑 오류 Scope 3는 제품 코드 매핑 불가'
        } else if (errorMessage.includes('배출량 계산')) {
          userFriendlyMessage = '배출량 계산 오류 수량 × 배출계수 = 총 배출량'
        }
        break
    }

    showWarning(userFriendlyMessage)
  } else if (error?.response?.status === 404) {
    const errorCode = error.response?.data?.errorCode
    if (errorCode === 'EMISSION_DATA_NOT_FOUND') {
      showError(`${operation}하려는 배출량 데이터를 찾을 수 없습니다.`)
    } else {
      showError(`${operation}하려는 데이터를 찾을 수 없습니다.`)
    }
  } else if (error?.response?.status === 409) {
    const errorCode = error.response?.data?.errorCode
    if (errorCode === 'DUPLICATE_EMISSION_DATA') {
      showError('동일한 조건의 배출량 데이터가 이미 존재합니다.')
    } else {
      showError('데이터 중복 오류가 발생했습니다.')
    }
  } else if (error?.response?.status === 403) {
    const errorCode = error.response?.data?.errorCode
    if (errorCode === 'ACCESS_DENIED') {
      showError('이 작업을 수행할 권한이 없습니다.')
    } else {
      showError('접근 권한이 부족합니다.')
    }
  } else if (error?.response?.status === 500) {
    showError('서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
  } else if (error?.response?.status === 401) {
    showError('로그인이 필요합니다. 다시 로그인해주세요.')
  } else if (error?.response?.data?.message) {
    showError(error.response.data.message)
  } else if (
    error?.code === 'NETWORK_ERROR' ||
    error?.message?.includes('Network Error')
  ) {
    showError('네트워크 연결을 확인해주세요.')
  } else {
    showError(`배출량 데이터 ${operation} 중 오류가 발생했습니다.`)
  }
}

// ============================================================================
// 카테고리별 집계 API (Category Aggregation APIs)
// ============================================================================

/**
 * 카테고리별 연간 배출량 집계 조회
 * 백엔드 엔드포인트: GET /api/v1/scope/aggregation/category/{scopeType}/year/{year}
 * @param scopeType Scope 타입 (SCOPE1, SCOPE2, SCOPE3)
 * @param year 보고년도
 * @returns Promise<CategoryYearlyEmission[]> 카테고리별 연간 배출량 목록
 */
export const fetchCategoryYearlyEmissions = async (
  scopeType: ScopeType,
  year: number
): Promise<CategoryYearlyEmission[]> => {
  try {
    showLoading('카테고리별 연간 배출량을 조회중입니다...')

    const response = await api.get<ApiResponse<CategoryYearlyEmission[]>>(
      `/api/v1/scope/aggregation/category/${scopeType}/year/${year}`
    )
    console.log(response)

    dismissLoading()

    if (response.data.success && response.data.data) {
      return response.data.data
    } else {
      throw new Error(
        response.data.message || '카테고리별 연간 배출량 조회에 실패했습니다.'
      )
    }
  } catch (error: any) {
    dismissLoading()
    showError(
      error.response?.data?.message ||
        '카테고리별 연간 배출량 조회 중 오류가 발생했습니다.'
    )
    return []
  }
}

/**
 * 카테고리별 월간 배출량 집계 조회
 * 백엔드 엔드포인트: GET /api/v1/scope/aggregation/category/{scopeType}/year/{year}/monthly
 * @param scopeType Scope 타입 (SCOPE1, SCOPE2, SCOPE3)
 * @param year 보고년도
 * @returns Promise<CategoryMonthlyEmission[]> 카테고리별 월간 배출량 목록
 */
export const fetchCategoryMonthlyEmissions = async (
  scopeType: ScopeType,
  year: number
): Promise<CategoryMonthlyEmission[]> => {
  try {
    showLoading('카테고리별 월간 배출량을 조회중입니다...')

    const response = await api.get<ApiResponse<CategoryMonthlyEmission[]>>(
      `/api/v1/scope/aggregation/category/${scopeType}/year/${year}/monthly`
    )

    dismissLoading()

    if (response.data.success && response.data.data) {
      return response.data.data
    } else {
      throw new Error(
        response.data.message || '카테고리별 월간 배출량 조회에 실패했습니다.'
      )
    }
  } catch (error: any) {
    dismissLoading()
    showError(
      error.response?.data?.message ||
        '카테고리별 월간 배출량 조회 중 오류가 발생했습니다.'
    )
    return []
  }
}
