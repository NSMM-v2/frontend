// ============================================================================
// 공통 타입 정의 (Common Types)
// ============================================================================

/**
 * Scope 타입 열거형 (백엔드 ScopeType enum과 1:1 매핑)
 */
export type ScopeType = 'SCOPE1' | 'SCOPE2' | 'SCOPE3'

/**
 * 입력 타입 열거형 (백엔드 InputType enum과 1:1 매핑)
 */
export type InputType = 'MANUAL' | 'LCA'

/**
 * 백엔드 API 표준 응답 형식 (백엔드 ApiResponse와 1:1 매핑)
 */
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T | null
  errorCode: string | null
  timestamp?: string
}

// ============================================================================
// 통합 Scope 배출량 관리 타입 정의 (Unified Scope Emission Types)
// ============================================================================

/**
 * 통합 Scope 배출량 요청 데이터 (백엔드 ScopeEmissionRequest와 1:1 매핑)
 */
export interface ScopeEmissionRequest {
  // Scope 분류 및 카테고리 정보
  scopeType: ScopeType // SCOPE1, SCOPE2, SCOPE3
  scope1CategoryNumber?: number // 1-10 (Scope 1인 경우만)
  scope2CategoryNumber?: number // 1-2 (Scope 2인 경우만)
  scope3CategoryNumber?: number // 1-15 (Scope 3인 경우만)

  // 제품 코드 매핑 정보 (Scope 1, 2만 지원)
  companyProductCode?: string // 회사별 제품 코드
  productName?: string // 제품명

  // 프론트엔드 입력 데이터
  majorCategory: string // 대분류
  subcategory: string // 구분
  rawMaterial: string // 원료/에너지
  activityAmount: number // 수량(활동량)
  unit: string // 단위
  emissionFactor: number // 배출계수 (kgCO2eq/단위)
  totalEmission: number // 계산된 배출량
  reportingYear: number // 보고 연도
  reportingMonth: number // 보고 월

  // 입력 모드 제어
  inputType: InputType // MANUAL, LCA
  hasProductMapping: boolean // 제품 코드 매핑 여부
}

/**
 * 통합 Scope 배출량 응답 데이터 (백엔드 ScopeEmissionResponse와 1:1 매핑)
 */
export interface ScopeEmissionResponse {
  id: number // 배출량 고유 식별자

  // Scope 분류 및 카테고리 정보
  scopeType: ScopeType
  scope1CategoryNumber?: number
  scope1CategoryName?: string
  scope1CategoryGroup?: string
  scope2CategoryNumber?: number
  scope2CategoryName?: string
  scope3CategoryNumber?: number
  scope3CategoryName?: string

  // 제품 코드 매핑 정보
  companyProductCode?: string
  productName?: string

  // 프론트엔드 입력 데이터
  majorCategory: string
  subcategory: string
  rawMaterial: string
  activityAmount: number
  unit: string
  emissionFactor: number
  totalEmission: number

  // 입력 모드 및 보고 기간
  inputType: InputType
  hasProductMapping: boolean
  reportingYear: number
  reportingMonth: number

  // 감사 정보
  createdAt: string
  updatedAt: string
}

/**
 * 통합 Scope 배출량 업데이트 요청 데이터 (백엔드 ScopeEmissionUpdateRequest와 1:1 매핑)
 */
export interface ScopeEmissionUpdateRequest {
  // Scope 분류 및 카테고리 정보
  scopeType?: ScopeType
  scope1CategoryNumber?: number
  scope2CategoryNumber?: number
  scope3CategoryNumber?: number

  // 제품 코드 매핑 정보
  companyProductCode?: string
  productName?: string

  // 프론트엔드 입력 데이터
  majorCategory?: string
  subcategory?: string
  rawMaterial?: string
  activityAmount?: number
  unit?: string
  emissionFactor?: number
  totalEmission?: number
  reportingYear?: number
  reportingMonth?: number

  // 입력 모드 제어
  inputType?: InputType
  hasProductMapping?: boolean
}

/**
 * Scope 카테고리 응답 데이터 (백엔드 ScopeCategoryResponse와 1:1 매핑)
 */
export interface ScopeCategoryResponse {
  categoryNumber: number
  categoryName: string
  categoryGroup?: string // Scope 1에서 사용
  description?: string
}

/**
 * Scope 타입별 총계 데이터 (백엔드 컨트롤러 응답 형식과 매핑)
 * Map<String, BigDecimal> 형식
 */
export interface ScopeSummary {
  SCOPE1?: number
  SCOPE2?: number
  SCOPE3?: number
}

/**
 * 카테고리별 배출량 요약 데이터 (백엔드 컨트롤러 응답 형식과 매핑)
 * Map<Integer, BigDecimal> 형식
 */
export interface ScopeCategorySummary {
  [categoryNumber: number]: number
}

// ============================================================================
// 프론트엔드 전용 타입 (Frontend-only Types)
// ============================================================================

/**
 * 프론트엔드 셀렉터 상태 (기존 유지)
 */
export interface SelectorState {
  category: string
  separate: string
  rawMaterial: string
  unit?: string
  kgCO2eq?: string
  quantity: string
}

/**
 * 프론트엔드 폼 상태 관리용 타입
 */
export interface ScopeFormState {
  scopeType: ScopeType
  categoryNumber: number
  hasProductMapping: boolean
  productCode?: string
  productName?: string
  majorCategory: string
  subcategory: string
  rawMaterial: string
  activityAmount: string // 입력 시에는 문자열
  unit: string
  emissionFactor: string // 입력 시에는 문자열
  totalEmission: string // 입력 시에는 문자열
  reportingYear: number
  reportingMonth: number
  inputType: InputType
}

/**
 * 카테고리 선택 옵션
 */
export interface CategoryOption {
  value: number
  label: string
  group?: string
  description?: string
}

/**
 * 연도/월 선택 옵션
 */
export interface YearMonthOption {
  year: number
  month: number
  label: string
}
