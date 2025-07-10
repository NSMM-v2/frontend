import api from '@/lib/axios'
import {
  showError,
  showSuccess,
  showLoading,
  dismissLoading
} from '@/util/toast'
import {ApiResponse} from '@/types/scopeTypes'

// ============================================================================
// 집계 관련 타입 정의
// ============================================================================

/**
 * Scope 배출량 종합 집계 응답 (백엔드 ScopeAggregationResponse와 1:1 매핑)
 */
export interface ScopeAggregationResponse {
  reportingYear: number
  reportingMonth: number
  scope1Total: number
  scope2Total: number
  scope3Total: number
  totalEmission: number
  
  // Scope 3 특수 집계 결과
  scope3Category1Aggregated: number
  scope3Category2Aggregated: number
  scope3Category4Aggregated: number
  scope3Category5Aggregated: number
  
  // 상세 정보 (옵션)
  aggregationDetails?: any
  productSummaries?: any[]
  hierarchicalSummaries?: HierarchicalEmissionSummary[]
}

/**
 * 계층별 배출량 집계 요약
 */
export interface HierarchicalEmissionSummary {
  treePath: string
  companyName: string
  level: number
  scope1Emission: number
  scope2Emission: number
  scope3Emission: number
  totalEmission: number
  childCount: number
}

/**
 * 제품별 배출량 집계 요약
 */
export interface ProductEmissionSummary {
  productCode: string
  productName: string
  scope1Emission: number
  scope2Emission: number
  scope3Emission: number
  totalEmission: number
}

// ============================================================================
// 집계 API 함수들
// ============================================================================

/**
 * 종합 집계 결과 조회
 * 백엔드 엔드포인트: GET /api/v1/scope/aggregation/comprehensive/{year}/{month}
 * @param year 보고 연도
 * @param month 보고 월
 * @returns Promise<ScopeAggregationResponse> 종합 집계 데이터
 */
export const fetchComprehensiveAggregation = async (
  year: number,
  month: number
): Promise<ScopeAggregationResponse | null> => {
  try {
    showLoading('종합 집계 데이터를 조회중입니다...')

    const response = await api.get<ApiResponse<ScopeAggregationResponse>>(
      `/api/v1/scope/aggregation/comprehensive/${year}/${month}`
    )

    dismissLoading()

    if (response.data.success && response.data.data) {
      return response.data.data
    } else {
      // 데이터가 없는 경우 에러 표시하지 않고 null 반환
      return null
    }
  } catch (error: any) {
    dismissLoading()
    if (error?.response?.status === 404) {
      // 404는 데이터가 없는 정상적인 상황으로 처리
      return null
    }
    showError(
      error.response?.data?.message || '종합 집계 데이터 조회 중 오류가 발생했습니다.'
    )
    return null
  }
}

/**
 * 계층적 집계 결과 조회
 * 백엔드 엔드포인트: GET /api/v1/scope/aggregation/hierarchical/{year}/{month}
 * @param year 보고 연도
 * @param month 보고 월
 * @param baseTreePath 기준 계층 경로 (선택사항)
 * @returns Promise<HierarchicalEmissionSummary[]> 계층적 집계 데이터
 */
export const fetchHierarchicalAggregation = async (
  year: number,
  month: number,
  baseTreePath?: string
): Promise<HierarchicalEmissionSummary[]> => {
  try {
    const params = baseTreePath ? `?baseTreePath=${encodeURIComponent(baseTreePath)}` : ''
    const response = await api.get<ApiResponse<HierarchicalEmissionSummary[]>>(
      `/api/v1/scope/aggregation/hierarchical/${year}/${month}${params}`
    )

    if (response.data.success && response.data.data) {
      return response.data.data
    } else {
      throw new Error(response.data.message || '계층적 집계 데이터 조회에 실패했습니다.')
    }
  } catch (error: any) {
    showError(
      error.response?.data?.message || '계층적 집계 데이터 조회 중 오류가 발생했습니다.'
    )
    return []
  }
}

/**
 * 제품별 집계 결과 조회
 * 백엔드 엔드포인트: GET /api/v1/scope/aggregation/product/{year}/{month}
 * @param year 보고 연도
 * @param month 보고 월
 * @returns Promise<ProductEmissionSummary[]> 제품별 집계 데이터
 */
export const fetchProductAggregation = async (
  year: number,
  month: number
): Promise<ProductEmissionSummary[]> => {
  try {
    const response = await api.get<ApiResponse<ProductEmissionSummary[]>>(
      `/api/v1/scope/aggregation/product/${year}/${month}`
    )

    if (response.data.success && response.data.data) {
      return response.data.data
    } else {
      throw new Error(response.data.message || '제품별 집계 데이터 조회에 실패했습니다.')
    }
  } catch (error: any) {
    showError(
      error.response?.data?.message || '제품별 집계 데이터 조회 중 오류가 발생했습니다.'
    )
    return []
  }
}

// ============================================================================
// 유틸리티 함수들
// ============================================================================

/**
 * 특정 Scope 3 카테고리의 누적 집계 값 조회
 * @param aggregationData 종합 집계 데이터
 * @param categoryNumber 카테고리 번호 (1, 2, 4, 5)
 * @returns 해당 카테고리의 누적 집계 값 또는 null
 */
export const getScope3CategoryAggregation = (
  aggregationData: ScopeAggregationResponse | null,
  categoryNumber: number
): number | null => {
  if (!aggregationData) return null

  switch (categoryNumber) {
    case 1:
      return aggregationData.scope3Category1Aggregated
    case 2:
      return aggregationData.scope3Category2Aggregated
    case 4:
      return aggregationData.scope3Category4Aggregated
    case 5:
      return aggregationData.scope3Category5Aggregated
    default:
      return null // 특수 집계 공식이 없는 카테고리
  }
}

/**
 * 특수 집계 공식이 적용되는 카테고리인지 확인
 * @param categoryNumber 카테고리 번호
 * @returns 특수 집계 적용 여부
 */
export const hasSpecialAggregation = (categoryNumber: number): boolean => {
  return [1, 2, 4, 5].includes(categoryNumber)
}