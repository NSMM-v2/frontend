import api from '@/lib/axios'

// ============================================================================
// 타입 정의
// ============================================================================

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errorCode?: string
  timestamp: string
}

/**
 * 자재코드 할당 요청 인터페이스
 */
export interface MaterialAssignmentRequest {
  materialCode: string
  materialName: string
  materialCategory?: string
  materialSpec?: string
  materialDescription?: string
  toPartnerId: number
  assignedBy?: string
  assignmentReason?: string
}

/**
 * 자재코드 일괄 할당 요청 인터페이스
 */
export interface MaterialAssignmentBatchRequest {
  toPartnerId: number
  materialCodes: MaterialCodeInfo[]
  assignedBy?: string
  assignmentReason?: string
}

/**
 * 자재코드 정보 인터페이스
 */
export interface MaterialCodeInfo {
  materialCode: string
  materialName: string
  materialCategory?: string
  materialSpec?: string
  materialDescription?: string
}

/**
 * 자재코드 할당 응답 인터페이스
 */
export interface MaterialAssignmentResponse {
  id: number
  headquartersId: number
  fromPartnerId?: number
  toPartnerId: number
  fromLevel?: number
  toLevel: number
  materialCode: string
  materialName: string
  materialCategory?: string
  materialSpec?: string
  materialDescription?: string
  assignedBy?: string
  assignmentReason?: string
  isActive: boolean
  isMapped: boolean
  mappingCount: number
  activeMappingCount: number
  createdAt: string
  updatedAt: string
  fromPartnerName?: string
  toPartnerName?: string
}

// ============================================================================
// 자재코드 할당 서비스
// ============================================================================

/**
 * 자재코드 할당 관련 API 서비스
 *
 * 협력사에게 자재코드를 할당하고 관리하는 기능을 제공합니다.
 */
export const materialAssignmentService = {
  /**
   * 협력사별 할당된 자재코드 목록 조회
   */
  async getAssignmentsByPartner(
    partnerId: number
  ): Promise<MaterialAssignmentResponse[]> {
    try {
      const response = await api.get<ApiResponse<MaterialAssignmentResponse[]>>(
        `/api/v1/material-assignments/partner/${partnerId}`
      )

      if (response.data.success && response.data.data) {
        return response.data.data
      }

      throw new Error(response.data.message || '자재코드 할당 목록 조회에 실패했습니다')
    } catch (error) {
      console.error('협력사별 자재코드 할당 조회 오류:', error)
      throw error
    }
  },

  /**
   * 본사별 모든 자재코드 할당 목록 조회
   */
  async getAssignmentsByHeadquarters(): Promise<MaterialAssignmentResponse[]> {
    try {
      const response = await api.get<ApiResponse<MaterialAssignmentResponse[]>>(
        '/api/v1/scope/material-assignments/headquarters'
      )

      if (response.data.success && response.data.data) {
        return response.data.data
      }

      throw new Error(
        response.data.message || '본사 자재코드 할당 목록 조회에 실패했습니다'
      )
    } catch (error) {
      console.error('본사별 자재코드 할당 조회 오류:', error)
      throw error
    }
  },

  /**
   * 자재코드 할당 생성
   */
  async createAssignment(
    request: MaterialAssignmentRequest
  ): Promise<MaterialAssignmentResponse> {
    try {
      const response = await api.post<ApiResponse<MaterialAssignmentResponse>>(
        '/api/v1/material-assignments',
        request
      )

      if (response.data.success && response.data.data) {
        return response.data.data
      }

      throw new Error(response.data.message || '자재코드 할당에 실패했습니다')
    } catch (error) {
      console.error('자재코드 할당 생성 오류:', error)

      // 백엔드 에러 메시지 추출
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message)
        }
      }

      throw error
    }
  },

  /**
   * 자재코드 일괄 할당
   */
  async createBatchAssignments(
    request: MaterialAssignmentBatchRequest
  ): Promise<MaterialAssignmentResponse[]> {
    try {
      const response = await api.post<ApiResponse<MaterialAssignmentResponse[]>>(
        '/api/v1/scope/material-assignments/batch',
        request
      )

      if (response.data.success && response.data.data) {
        return response.data.data
      }

      throw new Error(response.data.message || '자재코드 일괄 할당에 실패했습니다')
    } catch (error) {
      console.error('자재코드 일괄 할당 오류:', error)

      // 백엔드 에러 메시지 추출
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message)
        }
      }

      throw error
    }
  },

  /**
   * 자재코드 할당 수정
   */
  async updateAssignment(
    assignmentId: number,
    request: MaterialAssignmentRequest
  ): Promise<MaterialAssignmentResponse> {
    try {
      const response = await api.put<ApiResponse<MaterialAssignmentResponse>>(
        `/api/v1/scope/material-assignments/${assignmentId}`,
        request
      )

      if (response.data.success && response.data.data) {
        return response.data.data
      }

      throw new Error(response.data.message || '자재코드 할당 수정에 실패했습니다')
    } catch (error) {
      console.error('자재코드 할당 수정 오류:', error)

      // 백엔드 에러 메시지 추출
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message)
        }
      }

      throw error
    }
  },

  /**
   * 자재코드 할당 삭제
   */
  async deleteAssignment(assignmentId: number): Promise<void> {
    try {
      const response = await api.delete<ApiResponse<string>>(
        `/api/v1/scope/material-assignments/${assignmentId}`
      )

      if (!response.data.success) {
        throw new Error(response.data.message || '자재코드 할당 삭제에 실패했습니다')
      }
    } catch (error) {
      console.error('자재코드 할당 삭제 오류:', error)

      // 백엔드 에러 메시지 추출
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message)
        }
      }

      throw error
    }
  }
}

// ============================================================================
// 유틸리티 함수들
// ============================================================================

/**
 * 자재코드 카테고리 목록
 */
export const MATERIAL_CATEGORIES = [
  {value: 'raw_material', label: '원자재'},
  {value: 'component', label: '부품'},
  {value: 'assembly', label: '조립품'},
  {value: 'finished_goods', label: '완제품'},
  {value: 'packaging', label: '포장재'},
  {value: 'consumables', label: '소모품'},
  {value: 'other', label: '기타'}
] as const

/**
 * 카테고리 값을 한국어 라벨로 변환
 */
export const getCategoryLabel = (value: string): string => {
  const category = MATERIAL_CATEGORIES.find(cat => cat.value === value)
  return category?.label || value
}

/**
 * 자재코드 할당 상태 검증
 */
export const validateMaterialCode = (code: string): boolean => {
  // 자재코드 형식 검증 (예: 영문+숫자 조합, 3-50자)
  const codeRegex = /^[A-Za-z0-9]{3,50}$/
  return codeRegex.test(code)
}

/**
 * 자재코드 할당 요청 데이터 검증
 */
export const validateAssignmentRequest = (
  request: MaterialAssignmentRequest
): string[] => {
  const errors: string[] = []

  if (!request.materialCode?.trim()) {
    errors.push('자재코드는 필수입니다')
  } else if (!validateMaterialCode(request.materialCode)) {
    errors.push('자재코드는 영문과 숫자 조합으로 3-50자여야 합니다')
  }

  if (!request.materialName?.trim()) {
    errors.push('자재명은 필수입니다')
  } else if (request.materialName.length > 200) {
    errors.push('자재명은 200자 이하여야 합니다')
  }

  if (!request.toPartnerId || request.toPartnerId <= 0) {
    errors.push('할당받을 협력사를 선택해주세요')
  }

  if (request.materialDescription && request.materialDescription.length > 1000) {
    errors.push('자재 설명은 1000자 이하여야 합니다')
  }

  return errors
}

export default materialAssignmentService
