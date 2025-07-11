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

  factoryEnabled?: boolean

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

  factoryEnabled?: boolean

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

  factoryEnabled?: boolean

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
  productName?: string
  productCode?: string
}

export interface MonthlyEmissionSummary {
  year: number
  month: number
  scope1Total: number
  scope2Total: number
  scope3Total: number
  totalEmission: number
  dataCount: number
}

/**
 * 카테고리별 연간 배출량 집계 (백엔드 CategoryYearlyEmission과 1:1 매핑)
 */
export interface CategoryYearlyEmission {
  categoryNumber: number
  categoryName: string
  year: number
  totalEmission: number
  dataCount: number
  scopeType: string
  totalSumAllCategories: number
}

/**
 * 카테고리별 월간 배출량 집계 (백엔드 CategoryMonthlyEmission과 1:1 매핑)
 */
export interface CategoryMonthlyEmission {
  categoryNumber: number
  categoryName: string
  year: number
  month: number
  totalEmission: number
  dataCount: number
  scopeType: string
  totalSumAllCategories: number
}

// ============================================================================
// Scope 3 특수 집계 타입 정의 (Scope 3 Special Aggregation Types)
// ============================================================================

/**
 * Scope 3 특수 집계 응답 (백엔드 Scope3SpecialAggregationResponse와 1:1 매핑)
 * Cat.1, 2, 4, 5에 대한 특수 집계 규칙 적용 결과 (계층적 롤업 포함)
 */
export interface Scope3SpecialAggregationResponse {
  // 기본 정보
  reportingYear: number // 보고 연도
  reportingMonth: number // 보고 월
  userType: string // 사용자 타입 (HEADQUARTERS/PARTNER)
  organizationId: number // 조직 ID (본사 ID 또는 협력사 ID)

  // Cat.1: 구매한 상품 및 서비스 (특수 집계 + 계층적 롤업)
  category1TotalEmission: number // Cat.1 총 배출량 (본인 + 하위 조직)
  category1Detail: Category1Detail // Cat.1 상세 계산 내역

  // Cat.2: 자본재 (특수 집계 + 계층적 롤업)
  category2TotalEmission: number // Cat.2 총 배출량 (본인 + 하위 조직)
  category2Detail: Category2Detail // Cat.2 상세 계산 내역

  // Cat.4: 업스트림 운송 및 유통 (특수 집계 + 계층적 롤업)
  category4TotalEmission: number // Cat.4 총 배출량 (본인 + 하위 조직)
  category4Detail: Category4Detail // Cat.4 상세 계산 내역

  // Cat.5: 폐기물 처리 (특수 집계 + 계층적 롤업)
  category5TotalEmission: number // Cat.5 총 배출량 (본인 + 하위 조직)
  category5Detail: Category5Detail // Cat.5 상세 계산 내역
}

/**
 * Cat.1 상세 계산 내역
 * Cat.1 = (Scope1 전체 - 이동연소 - 공장설비 - 폐수처리) + (Scope2 - 공장설비) + Scope3 Cat.1
 */
export interface Category1Detail {
  scope1Total: number // Scope1 전체
  scope1MobileCombustion: number // Scope1 이동연소 (제외)
  scope1Factory: number // Scope1 공장설비 (제외)
  scope1WasteWater: number // Scope1 폐수처리 (제외)
  scope1Remaining: number // Scope1 잔여 (전체 - 제외 항목들)

  scope2Total: number // Scope2 전체
  scope2Factory: number // Scope2 공장설비 (제외)
  scope2Remaining: number // Scope2 잔여 (전체 - 공장설비)

  scope3Category1: number // Scope3 Cat.1
  finalTotal: number // 최종 총계
}

/**
 * Cat.2 상세 계산 내역
 * Cat.2 = Scope1 공장설비 + Scope2 공장설비 + Scope3 Cat.2
 */
export interface Category2Detail {
  scope1Factory: number // Scope1 공장설비
  scope2Factory: number // Scope2 공장설비
  scope3Category2: number // Scope3 Cat.2
  finalTotal: number // 최종 총계
}

/**
 * Cat.4 상세 계산 내역
 * Cat.4 = Scope1 이동연소 + Scope3 Cat.4
 */
export interface Category4Detail {
  scope1MobileCombustion: number // Scope1 이동연소
  scope3Category4: number // Scope3 Cat.4
  finalTotal: number // 최종 총계
}

/**
 * Cat.5 상세 계산 내역
 * Cat.5 = Scope1 폐수처리 + Scope3 Cat.5
 */
export interface Category5Detail {
  scope1WasteWater: number // Scope1 폐수처리
  scope3Category5: number // Scope3 Cat.5
  finalTotal: number // 최종 총계
}
