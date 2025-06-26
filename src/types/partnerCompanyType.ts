// 파트너사 관리를 위한 타입 정의

// ============================================================================
// 기본 파트너사 타입 정의
// ============================================================================

/**
 * 서버에서 받는 원본 파트너사 데이터 구조
 */
export interface PartnerCompanyRaw {
  id?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  industry?: string
  country?: string
  address?: string
  corp_code: string
  corp_name: string
  stock_code?: string
  contract_start_date?: string
  modify_date?: string
  is_restored?: boolean
}

/**
 * 프론트엔드에서 사용하는 파트너사 데이터 구조
 */
export interface PartnerCompany {
  id?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  industry?: string
  country?: string
  address?: string
  corpCode: string
  corpName: string
  companyName: string
  stockCode?: string
  contractStartDate?: Date | string
  modifyDate?: string
  isRestored?: boolean

  // 서버 호환성을 위한 추가 필드
  corp_code?: string
  corp_name?: string
  stock_code?: string
  contract_start_date?: string
  modify_date?: string
}

// ============================================================================
// API 응답 타입 정의
// ============================================================================

/**
 * Spring Data JPA Pageable 응답 구조 (변환된 데이터)
 */
export interface PartnerCompanyResponse {
  content: PartnerCompany[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean

  // 레거시 호환성 필드
  data?: PartnerCompany[]
  total?: number
  page?: number
  pageSize?: number
}

/**
 * Spring Data JPA Pageable 응답 구조 (원본 데이터)
 */
export interface PartnerCompanyResponseRaw {
  content: PartnerCompanyRaw[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

// ============================================================================
// DART API 관련 타입 정의
// ============================================================================

/**
 * DART 기업정보 데이터 구조
 */
export interface DartCorpInfo {
  corpCode: string
  corpName: string
  stockCode?: string
  modifyDate: string

  // 서버 호환성 필드
  corp_code?: string
  corp_name?: string
  stock_code?: string
  modify_date?: string
}

/**
 * DART API 응답 구조
 */
export interface DartApiResponse {
  content: DartCorpInfo[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean

  // 레거시 호환성 필드
  data?: DartCorpInfo[]
  total?: number
  page?: number
  pageSize?: number
}

/**
 * 기업 검색 파라미터
 */
export interface SearchCorpParams {
  page?: number
  pageSize?: number
  listedOnly?: boolean
  corpNameFilter?: string
}

// ============================================================================
// 재무 위험 분석 관련 타입 정의
// ============================================================================

/**
 * 재무 위험 분석 항목
 */
export interface FinancialRiskItem {
  description: string
  actualValue: string
  threshold: string
  notes: string | null
  itemNumber: number
  atRisk: boolean
}

/**
 * 재무 위험 분석 결과
 */
export interface FinancialRiskAssessment {
  partnerCompanyId: string
  partnerCompanyName: string
  assessmentYear: string
  reportCode: string
  riskItems: FinancialRiskItem[]
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 원본 데이터를 프론트엔드 형식으로 변환
 */
export function mapPartnerCompany(raw: PartnerCompanyRaw): PartnerCompany {
  return {
    id: raw.id,
    status: raw.status,
    industry: raw.industry,
    country: raw.country,
    address: raw.address,
    corpCode: raw.corp_code,
    corpName: raw.corp_name,
    companyName: raw.corp_name,
    stockCode: raw.stock_code,
    contractStartDate: raw.contract_start_date
      ? new Date(raw.contract_start_date)
      : undefined,
    modifyDate: raw.modify_date,
    isRestored: raw.is_restored,

    // 원본 필드 유지 (서버 호환성)
    corp_code: raw.corp_code,
    corp_name: raw.corp_name,
    stock_code: raw.stock_code,
    contract_start_date: raw.contract_start_date,
    modify_date: raw.modify_date
  }
}

/**
 * 원본 데이터 배열을 프론트엔드 형식으로 변환
 */
export function mapPartnerCompanies(rawList: PartnerCompanyRaw[]): PartnerCompany[] {
  if (!Array.isArray(rawList)) {
    console.warn('mapPartnerCompanies: rawList is not an array:', rawList)
    return []
  }

  return rawList.map(mapPartnerCompany)
}
