export interface SelectorState {
  category: string
  separate: string
  rawMaterial: string
  unit?: string
  kgCO2eq?: string
  quantity: string
}

// ============================================================================
// Scope3 배출량 관리 타입 정의 (Scope3 Emission Types)
// ============================================================================

/**
 * Scope3 배출량 요청 데이터 (백엔드 API와 1:1 매핑)
 */
export interface Scope3EmissionRequest {
  majorCategory: string // 대분류 (카테고리 1~15)
  subcategory: string // 구분 (세부 분류)
  rawMaterial: string // 원료/에너지
  unit: string // 단위
  emissionFactor: number // 배출계수 (kgCO2eq/단위)
  activityAmount: number // 수량 (활동량)
  totalEmission: number // 총 배출량 (계산된 값)
  reportingYear: number // 보고년도
  reportingMonth: number // 보고월
  scope3CategoryNumber: number // 카테고리 번호 (1~15)
  scope3CategoryName: string // 카테고리명
  isManualInput: boolean // 수동 입력 여부 (true: 수동, false: 자동)
}

/**
 * Scope3 배출량 응답 데이터 (백엔드에서 받는 형식)
 */
export interface Scope3EmissionResponse {
  id: number // 배출량 데이터 ID (백엔드 entity.id와 매핑)
  companyUuid: string // 회사 UUID
  treePath: string // 계층 경로
  headquartersId: number // 본사 ID
  majorCategory: string // 대분류
  subcategory: string // 구분
  rawMaterial: string // 원료/에너지
  unit: string // 단위
  emissionFactor: number // 배출계수
  activityAmount: number // 활동량
  totalEmission: number // 총 배출량
  reportingYear: number // 보고년도
  reportingMonth: number // 보고월
  scope3CategoryNumber: number // 카테고리 번호
  scope3CategoryName: string // 카테고리명
  isManualInput: boolean // 수동 입력 여부 (true: 수동, false: 자동)
  createdAt: string // 생성일시
  updatedAt: string // 수정일시
  createdBy: string // 생성자
  updatedBy: string // 수정자
}

/**
 * Scope3 배출량 업데이트 요청 데이터
 */
export interface Scope3EmissionUpdateRequest {
  majorCategory?: string
  subcategory?: string
  rawMaterial?: string
  unit?: string
  emissionFactor?: number
  activityAmount?: number
  totalEmission?: number
  reportingYear?: number
  reportingMonth?: number
  scope3CategoryNumber?: number
  scope3CategoryName?: string
  isManualInput?: boolean // 수동 입력 여부 (true: 수동, false: 자동)
}

/**
 * 백엔드 API 표준 응답 형식
 */
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T | null
  errorCode: string | null
}

/**
 * 카테고리별 배출량 요약 데이터
 * Map<categoryNumber, totalEmission> 형식
 */
export interface Scope3CategorySummary {
  [scope3CategoryNumber: number]: number
}
