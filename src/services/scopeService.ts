import api from '@/lib/axios'
import {
  showError,
  showSuccess,
  showLoading,
  showWarning,
  dismissLoading
} from '@/util/toast'
import {
  Scope3EmissionRequest,
  Scope3EmissionResponse,
  Scope3EmissionUpdateRequest,
  ApiResponse,
  Scope3CategorySummary
} from '@/types/scopeTypes'

// =============================================================================
// Scope3 배출량 관리 서비스 (Scope3 Emission Management Service)
// =============================================================================

/**
 * 연도/월별 Scope3 배출량 데이터 조회
 * 프론트엔드에서 보고년/보고월 선택 시 해당 데이터를 모두 가져옴
 *
 * @param year 보고년도
 * @param month 보고월
 * @returns Promise<Scope3EmissionResponse[]> 배출량 데이터 목록
 */
export const fetchScope3EmissionsByYearAndMonth = async (
  year: number,
  month: number
): Promise<Scope3EmissionResponse[]> => {
  try {
    showLoading('Scope 3 배출량 데이터를 조회중입니다...')

    const response = await api.get<ApiResponse<Scope3EmissionResponse[]>>(
      `/api/v1/scope3/emissions/year/${year}/month/${month}`
    )

    dismissLoading()

    if (response.data.success && response.data.data) {
      return response.data.data
    } else {
      throw new Error(response.data.message || 'Scope 3 데이터 조회에 실패했습니다.')
    }
  } catch (error: any) {
    dismissLoading()
    showError(
      error.response?.data?.message || 'Scope 3 배출량 조회 중 오류가 발생했습니다.'
    )
    return []
  }
}

/**
 * 카테고리별 배출량 요약 데이터 조회
 * CategorySummaryCard에서 각 카테고리의 총 배출량 표시용
 *
 * @param year 보고년도
 * @param month 보고월
 * @returns Promise<Scope3CategorySummary> 카테고리별 총 배출량 Map
 */
export const fetchScope3CategorySummary = async (
  year: number,
  month: number
): Promise<Scope3CategorySummary> => {
  const response = await api.get<ApiResponse<Scope3CategorySummary>>(
    `/api/v1/scope3/emissions/summary/year/${year}/month/${month}`
  )

  if (response.data.success && response.data.data) {
    return response.data.data
  } else {
    throw new Error(response.data.message || '카테고리 요약 데이터 조회에 실패했습니다.')
  }
}

/**
 * 개선된 Scope3 배출량 데이터 생성 (상세한 에러 처리)
 * 프론트엔드에서 입력된 배출량 데이터를 백엔드에 저장
 *
 * @param data 배출량 생성 요청 데이터
 * @returns Promise<Scope3EmissionResponse> 생성된 배출량 데이터
 */
export const createScope3Emission = async (
  data: Scope3EmissionRequest
): Promise<Scope3EmissionResponse> => {
  try {
    showLoading('Scope 3 배출량 데이터를 저장중입니다...')

    const response = await api.post<ApiResponse<Scope3EmissionResponse>>(
      `/api/v1/scope3/emissions`,
      data
    )

    dismissLoading()

    if (response.data.success && response.data.data) {
      showSuccess('Scope 3 배출량 데이터가 저장되었습니다.')
      return response.data.data
    } else {
      throw new Error(response.data.message || 'Scope 3 데이터 저장에 실패했습니다.')
    }
  } catch (error: any) {
    dismissLoading()

    // 400 에러 상세 처리 (유효성 검증 실패)
    if (error?.response?.status === 400) {
      const errorMessage =
        error.response?.data?.message || '입력 데이터가 올바르지 않습니다.'

      // 백엔드 유효성 검증 에러 메시지를 사용자 친화적으로 변환
      let userFriendlyMessage = errorMessage

      // 복잡한 검증 에러 메시지를 간단하게 변환
      if (errorMessage.includes('입력 데이터 검증 실패')) {
        // 백엔드에서 오는 복잡한 메시지를 간단한 경고로 변환
        if (
          errorMessage.includes('activityAmount') &&
          errorMessage.includes('totalEmission')
        ) {
          userFriendlyMessage =
            '⚠️ 입력값이 너무 큽니다\n\n📍 수정 방법:\n• 수량: 최대 12자리, 소수점 3자리까지\n• 결과값이 너무 클 경우 수량을 줄여주세요'
        } else if (errorMessage.includes('activityAmount')) {
          userFriendlyMessage =
            '⚠️ 수량 입력값이 범위를 초과했습니다\n\n📍 수정 방법:\n• 최대 12자리, 소수점 3자리까지 입력 가능\n• 예: 999,999,999,999.999'
        } else if (errorMessage.includes('totalEmission')) {
          userFriendlyMessage =
            '⚠️ 계산 결과가 너무 큽니다\n\n📍 수정 방법:\n• 수량 또는 배출계수를 줄여주세요\n• 계산 결과는 최대 15자리까지 가능'
        } else if (errorMessage.includes('emissionFactor')) {
          userFriendlyMessage =
            '⚠️ 배출계수 입력값이 범위를 초과했습니다\n\n📍 수정 방법:\n• 최대 9자리, 소수점 6자리까지 입력 가능\n• 예: 999,999,999.999999'
        } else {
          userFriendlyMessage =
            '⚠️ 입력값이 허용 범위를 초과했습니다\n\n📍 수정 방법:\n• 숫자 크기를 확인해주세요\n• 소수점 자릿수를 줄여주세요'
        }
      } else if (errorMessage.includes('Digits')) {
        if (errorMessage.includes('activityAmount')) {
          userFriendlyMessage =
            '⚠️ 수량 입력 오류\n\n📍 올바른 입력:\n• 최대 12자리, 소수점 3자리까지\n• 예: 999,999,999,999.999'
        } else if (errorMessage.includes('emissionFactor')) {
          userFriendlyMessage =
            '⚠️ 배출계수 입력 오류\n\n📍 올바른 입력:\n• 최대 9자리, 소수점 6자리까지\n• 예: 999,999,999.999999'
        } else if (errorMessage.includes('totalEmission')) {
          userFriendlyMessage =
            '⚠️ 계산 결과 오류\n\n📍 해결 방법:\n• 수량 또는 배출계수를 줄여주세요\n• 계산 결과가 너무 큽니다'
        } else {
          userFriendlyMessage =
            '⚠️ 숫자 입력 오류\n\n📍 확인사항:\n• 숫자 크기가 너무 큽니다\n• 소수점 자릿수를 확인해주세요'
        }
      } else if (errorMessage.includes('DecimalMin')) {
        if (errorMessage.includes('activityAmount')) {
          userFriendlyMessage =
            '⚠️ 수량이 너무 작습니다\n\n📍 수정 방법:\n• 0.001 이상의 값을 입력해주세요'
        } else if (errorMessage.includes('emissionFactor')) {
          userFriendlyMessage =
            '⚠️ 배출계수가 너무 작습니다\n\n📍 수정 방법:\n• 0.000001 이상의 값을 입력해주세요'
        } else if (errorMessage.includes('totalEmission')) {
          userFriendlyMessage =
            '⚠️ 계산 결과가 너무 작습니다\n\n📍 확인사항:\n• 수량과 배출계수를 확인해주세요'
        } else {
          userFriendlyMessage =
            '⚠️ 입력값이 너무 작습니다\n\n📍 수정 방법:\n• 0보다 큰 값을 입력해주세요'
        }
      } else if (errorMessage.includes('NotNull')) {
        userFriendlyMessage =
          '⚠️ 필수 항목 누락\n\n📍 확인사항:\n• 모든 필수 필드를 입력해주세요\n• 빈 값이 있는지 확인해주세요'
      } else if (errorMessage.includes('NotBlank')) {
        if (errorMessage.includes('majorCategory')) {
          userFriendlyMessage =
            '⚠️ 대분류 입력 필요\n\n📍 입력 위치:\n• 기본 정보 → 대분류 필드'
        } else if (errorMessage.includes('subcategory')) {
          userFriendlyMessage =
            '⚠️ 구분 입력 필요\n\n📍 입력 위치:\n• 기본 정보 → 구분 필드'
        } else if (errorMessage.includes('rawMaterial')) {
          userFriendlyMessage =
            '⚠️ 원료/에너지 입력 필요\n\n📍 입력 위치:\n• 기본 정보 → 원료/에너지 필드'
        } else if (errorMessage.includes('unit')) {
          userFriendlyMessage =
            '⚠️ 단위 입력 필요\n\n📍 입력 위치:\n• 계산 정보 → 단위 필드'
        } else {
          userFriendlyMessage =
            '⚠️ 필수 텍스트 입력 필요\n\n📍 확인사항:\n• 모든 텍스트 필드를 입력해주세요'
        }
      } else if (errorMessage.includes('Size')) {
        if (errorMessage.includes('majorCategory')) {
          userFriendlyMessage =
            '⚠️ 대분류 글자 수 초과\n\n📍 수정 방법:\n• 100자 이하로 입력해주세요'
        } else if (errorMessage.includes('subcategory')) {
          userFriendlyMessage =
            '⚠️ 구분 글자 수 초과\n\n📍 수정 방법:\n• 100자 이하로 입력해주세요'
        } else if (errorMessage.includes('rawMaterial')) {
          userFriendlyMessage =
            '⚠️ 원료/에너지 글자 수 초과\n\n📍 수정 방법:\n• 100자 이하로 입력해주세요'
        } else if (errorMessage.includes('unit')) {
          userFriendlyMessage =
            '⚠️ 단위 글자 수 초과\n\n📍 수정 방법:\n• 20자 이하로 입력해주세요'
        } else {
          userFriendlyMessage =
            '⚠️ 입력 글자 수 초과\n\n📍 수정 방법:\n• 텍스트 길이를 줄여주세요'
        }
      } else if (
        errorMessage.includes('Min') &&
        errorMessage.includes('categoryNumber')
      ) {
        userFriendlyMessage =
          '⚠️ 카테고리 번호 오류\n\n📍 올바른 범위:\n• 1~15 사이의 값을 선택해주세요'
      } else if (
        errorMessage.includes('Max') &&
        errorMessage.includes('categoryNumber')
      ) {
        userFriendlyMessage =
          '⚠️ 카테고리 번호 오류\n\n📍 올바른 범위:\n• 1~15 사이의 값을 선택해주세요'
      } else if (
        errorMessage.includes('Min') &&
        errorMessage.includes('reportingMonth')
      ) {
        userFriendlyMessage =
          '⚠️ 보고월 오류\n\n📍 올바른 범위:\n• 1~12 사이의 값을 선택해주세요'
      } else if (
        errorMessage.includes('Max') &&
        errorMessage.includes('reportingMonth')
      ) {
        userFriendlyMessage =
          '⚠️ 보고월 오류\n\n📍 올바른 범위:\n• 1~12 사이의 값을 선택해주세요'
      }

      showWarning(userFriendlyMessage) // 400 에러는 검증 실패이므로 경고로 표시
    } else if (error?.response?.status === 500) {
      showError('서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } else if (error?.response?.status === 401) {
      showError('로그인이 필요합니다. 다시 로그인해주세요.')
    } else if (error?.response?.status === 403) {
      showError('이 작업을 수행할 권한이 없습니다.')
    } else if (error?.response?.data?.message) {
      showError(error.response.data.message)
    } else if (
      error?.code === 'NETWORK_ERROR' ||
      error?.message?.includes('Network Error')
    ) {
      showError('네트워크 연결을 확인해주세요.')
    } else {
      showError('Scope 3 배출량 저장 중 오류가 발생했습니다.')
    }

    throw error
  }
}

/**
 * 개선된 Scope3 배출량 데이터 수정 (상세한 에러 처리)
 * 기존 배출량 데이터를 새로운 값으로 업데이트
 *
 * @param id 수정할 배출량 데이터 ID
 * @param data 배출량 수정 요청 데이터
 * @returns Promise<Scope3EmissionResponse> 수정된 배출량 데이터
 */
export const updateScope3Emission = async (
  id: number,
  data: Scope3EmissionUpdateRequest
): Promise<Scope3EmissionResponse> => {
  try {
    showLoading('Scope 3 배출량 데이터를 수정중입니다...')

    const response = await api.put<ApiResponse<Scope3EmissionResponse>>(
      `/api/v1/scope3/emissions/${id}`,
      data
    )

    dismissLoading()

    if (response.data.success && response.data.data) {
      showSuccess('Scope 3 배출량 데이터가 수정되었습니다.')
      return response.data.data
    } else {
      throw new Error(response.data.message || 'Scope 3 데이터 수정에 실패했습니다.')
    }
  } catch (error: any) {
    dismissLoading()

    // 400 에러 상세 처리 (유효성 검증 실패)
    if (error?.response?.status === 400) {
      const errorMessage =
        error.response?.data?.message || '입력 데이터가 올바르지 않습니다.'

      // 백엔드 유효성 검증 에러 메시지를 사용자 친화적으로 변환
      let userFriendlyMessage = errorMessage

      // 복잡한 검증 에러 메시지를 간단하게 변환
      if (errorMessage.includes('입력 데이터 검증 실패')) {
        // 백엔드에서 오는 복잡한 메시지를 간단한 경고로 변환
        if (
          errorMessage.includes('activityAmount') &&
          errorMessage.includes('totalEmission')
        ) {
          userFriendlyMessage =
            '⚠️ 입력값이 너무 큽니다\n\n📍 수정 방법:\n• 수량: 최대 12자리, 소수점 3자리까지\n• 결과값이 너무 클 경우 수량을 줄여주세요'
        } else if (errorMessage.includes('activityAmount')) {
          userFriendlyMessage =
            '⚠️ 수량 입력값이 범위를 초과했습니다\n\n📍 수정 방법:\n• 최대 12자리, 소수점 3자리까지 입력 가능\n• 예: 999,999,999,999.999'
        } else if (errorMessage.includes('totalEmission')) {
          userFriendlyMessage =
            '⚠️ 계산 결과가 너무 큽니다\n\n📍 수정 방법:\n• 수량 또는 배출계수를 줄여주세요\n• 계산 결과는 최대 15자리까지 가능'
        } else if (errorMessage.includes('emissionFactor')) {
          userFriendlyMessage =
            '⚠️ 배출계수 입력값이 범위를 초과했습니다\n\n📍 수정 방법:\n• 최대 9자리, 소수점 6자리까지 입력 가능\n• 예: 999,999,999.999999'
        } else {
          userFriendlyMessage =
            '⚠️ 입력값이 허용 범위를 초과했습니다\n\n📍 수정 방법:\n• 숫자 크기를 확인해주세요\n• 소수점 자릿수를 줄여주세요'
        }
      } else if (errorMessage.includes('Digits')) {
        if (errorMessage.includes('activityAmount')) {
          userFriendlyMessage =
            '⚠️ 수량 입력 오류\n\n📍 올바른 입력:\n• 최대 12자리, 소수점 3자리까지\n• 예: 999,999,999,999.999'
        } else if (errorMessage.includes('emissionFactor')) {
          userFriendlyMessage =
            '⚠️ 배출계수 입력 오류\n\n📍 올바른 입력:\n• 최대 9자리, 소수점 6자리까지\n• 예: 999,999,999.999999'
        } else if (errorMessage.includes('totalEmission')) {
          userFriendlyMessage =
            '⚠️ 계산 결과 오류\n\n📍 해결 방법:\n• 수량 또는 배출계수를 줄여주세요\n• 계산 결과가 너무 큽니다'
        } else {
          userFriendlyMessage =
            '⚠️ 숫자 입력 오류\n\n📍 확인사항:\n• 숫자 크기가 너무 큽니다\n• 소수점 자릿수를 확인해주세요'
        }
      } else if (errorMessage.includes('DecimalMin')) {
        if (errorMessage.includes('activityAmount')) {
          userFriendlyMessage =
            '⚠️ 수량이 너무 작습니다\n\n📍 수정 방법:\n• 0.001 이상의 값을 입력해주세요'
        } else if (errorMessage.includes('emissionFactor')) {
          userFriendlyMessage =
            '⚠️ 배출계수가 너무 작습니다\n\n📍 수정 방법:\n• 0.000001 이상의 값을 입력해주세요'
        } else if (errorMessage.includes('totalEmission')) {
          userFriendlyMessage =
            '⚠️ 계산 결과가 너무 작습니다\n\n📍 확인사항:\n• 수량과 배출계수를 확인해주세요'
        } else {
          userFriendlyMessage =
            '⚠️ 입력값이 너무 작습니다\n\n📍 수정 방법:\n• 0보다 큰 값을 입력해주세요'
        }
      } else if (errorMessage.includes('NotNull')) {
        userFriendlyMessage =
          '⚠️ 필수 항목 누락\n\n📍 확인사항:\n• 모든 필수 필드를 입력해주세요\n• 빈 값이 있는지 확인해주세요'
      } else if (errorMessage.includes('NotBlank')) {
        if (errorMessage.includes('majorCategory')) {
          userFriendlyMessage =
            '⚠️ 대분류 입력 필요\n\n📍 입력 위치:\n• 기본 정보 → 대분류 필드'
        } else if (errorMessage.includes('subcategory')) {
          userFriendlyMessage =
            '⚠️ 구분 입력 필요\n\n📍 입력 위치:\n• 기본 정보 → 구분 필드'
        } else if (errorMessage.includes('rawMaterial')) {
          userFriendlyMessage =
            '⚠️ 원료/에너지 입력 필요\n\n📍 입력 위치:\n• 기본 정보 → 원료/에너지 필드'
        } else if (errorMessage.includes('unit')) {
          userFriendlyMessage =
            '⚠️ 단위 입력 필요\n\n📍 입력 위치:\n• 계산 정보 → 단위 필드'
        } else {
          userFriendlyMessage =
            '⚠️ 필수 텍스트 입력 필요\n\n📍 확인사항:\n• 모든 텍스트 필드를 입력해주세요'
        }
      } else if (errorMessage.includes('Size')) {
        if (errorMessage.includes('majorCategory')) {
          userFriendlyMessage =
            '⚠️ 대분류 글자 수 초과\n\n📍 수정 방법:\n• 100자 이하로 입력해주세요'
        } else if (errorMessage.includes('subcategory')) {
          userFriendlyMessage =
            '⚠️ 구분 글자 수 초과\n\n📍 수정 방법:\n• 100자 이하로 입력해주세요'
        } else if (errorMessage.includes('rawMaterial')) {
          userFriendlyMessage =
            '⚠️ 원료/에너지 글자 수 초과\n\n📍 수정 방법:\n• 100자 이하로 입력해주세요'
        } else if (errorMessage.includes('unit')) {
          userFriendlyMessage =
            '⚠️ 단위 글자 수 초과\n\n📍 수정 방법:\n• 20자 이하로 입력해주세요'
        } else {
          userFriendlyMessage =
            '⚠️ 입력 글자 수 초과\n\n📍 수정 방법:\n• 텍스트 길이를 줄여주세요'
        }
      } else if (
        errorMessage.includes('Min') &&
        errorMessage.includes('categoryNumber')
      ) {
        userFriendlyMessage =
          '⚠️ 카테고리 번호 오류\n\n📍 올바른 범위:\n• 1~15 사이의 값을 선택해주세요'
      } else if (
        errorMessage.includes('Max') &&
        errorMessage.includes('categoryNumber')
      ) {
        userFriendlyMessage =
          '⚠️ 카테고리 번호 오류\n\n📍 올바른 범위:\n• 1~15 사이의 값을 선택해주세요'
      } else if (
        errorMessage.includes('Min') &&
        errorMessage.includes('reportingMonth')
      ) {
        userFriendlyMessage =
          '⚠️ 보고월 오류\n\n📍 올바른 범위:\n• 1~12 사이의 값을 선택해주세요'
      } else if (
        errorMessage.includes('Max') &&
        errorMessage.includes('reportingMonth')
      ) {
        userFriendlyMessage =
          '⚠️ 보고월 오류\n\n📍 올바른 범위:\n• 1~12 사이의 값을 선택해주세요'
      }

      showWarning(userFriendlyMessage) // 400 에러는 검증 실패이므로 경고로 표시
    } else if (error?.response?.status === 404) {
      showError('수정하려는 데이터를 찾을 수 없습니다.')
    } else if (error?.response?.status === 500) {
      showError('서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } else if (error?.response?.status === 401) {
      showError('로그인이 필요합니다. 다시 로그인해주세요.')
    } else if (error?.response?.status === 403) {
      showError('이 작업을 수행할 권한이 없습니다.')
    } else if (error?.response?.data?.message) {
      showError(error.response.data.message)
    } else if (
      error?.code === 'NETWORK_ERROR' ||
      error?.message?.includes('Network Error')
    ) {
      showError('네트워크 연결을 확인해주세요.')
    } else {
      showError('Scope 3 배출량 수정 중 오류가 발생했습니다.')
    }

    throw error
  }
}

/**
 * Scope3 배출량 데이터 삭제
 * 백엔드에서 데이터 완전 삭제 처리
 *
 * @param id 삭제할 배출량 데이터 ID
 * @returns Promise<boolean> 삭제 성공 여부
 */
export const deleteScope3Emission = async (id: number): Promise<boolean> => {
  try {
    showLoading('Scope 3 배출량 데이터를 삭제중입니다...')

    const response = await api.delete<ApiResponse<string>>(
      `/api/v1/scope3/emissions/${id}`
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

    if (error?.response?.data?.message) {
      showError(error.response.data.message)
    } else {
      showError('삭제 중 오류가 발생했습니다.')
    }

    return false
  }
}

/**
 * 특정 카테고리의 연도/월별 배출량 데이터 조회
 * 카테고리 선택 시 해당 카테고리의 데이터만 필터링하여 조회
 *
 * @param year 보고년도
 * @param month 보고월
 * @param scope3CategoryNumber 카테고리 번호 (1~15)
 * @returns Promise<Scope3EmissionResponse[]> 특정 카테고리의 배출량 데이터
 */
export const fetchScope3EmissionsByCategory = async (
  year: number,
  month: number,
  scope3CategoryNumber: number
): Promise<Scope3EmissionResponse[]> => {
  try {
    const response = await api.get<ApiResponse<Scope3EmissionResponse[]>>(
      `/api/v1/scope3/emissions/year/${year}/month/${month}/category/${scope3CategoryNumber}`
    )

    if (response.data.success && response.data.data) {
      return response.data.data
    } else {
      throw new Error(response.data.message || '카테고리별 배출량 조회에 실패했습니다.')
    }
  } catch (error: any) {
    showError(
      error.response?.data?.message || '카테고리별 배출량 조회 중 오류가 발생했습니다.'
    )
    return []
  }
}
