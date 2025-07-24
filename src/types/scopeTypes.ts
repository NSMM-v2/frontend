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

  // 자재코드 매핑 정보 (Material Code Mapping)
  materialAssignmentId?: number // 자재 할당 정보 연결용 ID
  materialMappingId?: number // 자재 매핑 정보 연결용 ID
  upstreamMaterialCode?: string // 상위에서 할당받은 자재코드 (A100, FE100...) - 최상위인 경우 null
  internalMaterialCode?: string // 내부 자재코드 (B100, FE200...)
  materialName?: string // 자재명
  upstreamPartnerId?: number // 상위 협력사 ID (null이면 본사)

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
  hasMaterialMapping: boolean // 자재 코드 매핑 여부 (renamed from hasProductMapping)
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

  // 자재코드 매핑 정보 (Material Code Mapping)
  materialAssignmentId?: number // 자재 할당 정보 연결용 ID
  materialMappingId?: number // 자재 매핑 정보 연결용 ID
  upstreamMaterialCode?: string // 상위에서 할당받은 자재코드 (A100, FE100...) - 최상위인 경우 null
  internalMaterialCode?: string // 내부 자재코드 (B100, FE200...)
  upstreamPartnerId?: number // 상위 협력사 ID (null이면 본사)
  // 주의: materialName은 백엔드 Response에서 제거됨

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
  hasMaterialMapping: boolean // 자재 코드 매핑 여부 (renamed from hasProductMapping)
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
  // 입력 모드 제어
  inputType?: InputType
  hasMaterialMapping?: boolean // 자재 코드 매핑 여부 (renamed from hasProductMapping)
  factoryEnabled?: boolean

  // 자재코드 매핑 정보 (Material Code Mapping)
  materialAssignmentId?: number // 자재 할당 정보 연결용 ID
  materialMappingId?: number // 자재 매핑 정보 연결용 ID
  upstreamMaterialCode?: string // 상위에서 할당받은 자재코드 (A100, FE100...) - 최상위인 경우 null
  internalMaterialCode?: string // 내부 자재코드 (B100, FE200...)
  materialName?: string // 자재명
  upstreamPartnerId?: number // 상위 협력사 ID (null이면 본사)

  // 프론트엔드 입력 데이터
  majorCategory?: string
  subcategory?: string
  rawMaterial?: string
  activityAmount?: number
  unit?: string
  emissionFactor?: number
  totalEmission?: number
  reportingYear?: number // 선택적 필드 (백엔드에서 @NotNull 잘못 적용됨)
  reportingMonth?: number // 선택적 필드 (백엔드에서 @NotNull 잘못 적용됨)
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
 * 프론트엔드 셀렉터 상태
 * Note: 기존 필드명 유지하되, productName/productCode는 materialName/internalMaterialCode로 매핑됨
 */
export interface SelectorState {
  category: string
  separate: string
  rawMaterial: string
  unit?: string
  kgCO2eq?: string
  quantity: string
  productName?: string // materialName으로 매핑됨
  productCode?: string // internalMaterialCode로 매핑됨
  upstreamMaterialCode?: string // 상위 할당 자재코드 (Material Mapping용)
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

// ============================================================================
// Scope 3 통합 배출량 타입 정의 (Scope 3 Combined Emission Types)
// ============================================================================

/**
 * Scope 3 통합 배출량 응답 (백엔드 Scope3CombinedEmissionResponse와 1:1 매핑)
 * 특수집계배출량 + 일반 Scope3 카테고리별 배출량의 합계를 제공
 */
export interface Scope3CombinedEmissionResponse {
  // 기본 정보
  reportingYear: number // 보고 연도
  reportingMonth?: number // 보고 월 (월별 조회시에만 값 존재)
  userType: string // 사용자 타입 (HEADQUARTERS/PARTNER)
  organizationId: number // 조직 ID (본사 ID 또는 협력사 ID)

  // 특수집계 배출량 (Cat.1, 2, 4, 5 finalTotal 합계)
  specialAggregationTotal: number // 특수집계 총합
  specialAggregationDetail: Scope3SpecialAggregationResponse // 특수집계 상세 내역

  // 일반 Scope3 카테고리별 배출량 합계
  regularCategoryTotal: number // 일반 카테고리 총합
  yearlyCategories?: CategoryYearlyEmission[] // 연별 조회시 카테고리별 데이터
  monthlyCategories?: CategoryMonthlyEmission[] // 월별 조회시 카테고리별 데이터

  // 최종 통합 배출량 (특수집계 + 일반 카테고리)
  totalScope3Emission: number // 최종 Scope 3 총 배출량

  // 데이터 건수
  totalDataCount: number // 총 데이터 건수
}

// ============================================================================
// 맵핑된 자재코드 대시보드 타입 정의 (Mapped Material Dashboard Types)
// ============================================================================

/**
 * 맵핑된 자재코드 대시보드 응답 (백엔드 MappedMaterialDashboardResponse와 1:1 매핑)
 * 맵핑된 자재코드별 Scope 1 + Scope 2 배출량 통합 표시
 */
export interface MappedMaterialDashboardResponse {
  // 조직 정보
  userType: string // HEADQUARTERS | PARTNER
  organizationId: number // 본사ID 또는 협력사ID
  reportingYear: number // 보고 연도
  reportingMonth?: number // 보고 월 (null인 경우 연간 집계)

  // 집계 결과
  mappedMaterials: MappedMaterialItem[] // 맵핑된 자재 목록
  totalScope1Emission: number // 전체 Scope 1 배출량 합계
  totalScope2Emission: number // 전체 Scope 2 배출량 합계
  totalCombinedEmission: number // 전체 Scope 1+2 배출량 합계
  totalDataCount: number // 전체 데이터 건수

  // 계산된 속성
  materialCount?: number // 자재코드 개수
  averageEmissionPerMaterial?: number // 자재당 평균 배출량
}

/**
 * 개별 맵핑된 자재 항목 (백엔드 MappedMaterialItem과 1:1 매핑)
 */
export interface MappedMaterialItem {
  // 자재코드 정보
  internalMaterialCode: string // 내부 자재코드 (예: B100, FE200)
  materialName: string // 자재명
  upstreamMaterialCode: string // 상위에서 할당받은 자재코드 (예: A100, FE100)
  partnerId?: number // 협력사 ID (계층 조회시에만 포함)

  // 배출량 정보
  scope1Emission: number // Scope 1 배출량
  scope2Emission: number // Scope 2 배출량
  combinedEmission: number // Scope 1+2 통합 배출량
  dataCount: number // 해당 자재의 데이터 건수

  // 비율 정보 (전체 대비)
  emissionPercentage: number // 전체 대비 배출량 비율
}

/**
 * 맵핑된 자재코드 목록 조회 응답 아이템 (백엔드 API 응답과 1:1 매핑)
 * 배출량 집계 없이 자재코드 정보만 제공
 */
export interface MappedMaterialCodeListItem {
  materialCode: string // 자재코드 (예: A100)
  materialName: string // 자재명 (예: 1차 협력사 할당 테스트)
  materialDescription: string // 자재 설명
}
