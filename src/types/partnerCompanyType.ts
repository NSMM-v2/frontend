// ============================================================================
// 파트너사 관리 및 계층 시스템 통합 타입 정의
// auth-service (계층 관리) + dart-service (파트너사 CRUD) 연동
// ============================================================================

// ============================================================================
// 기본 상태 및 유틸리티 타입
// ============================================================================

/**
 * 파트너사 상태 열거형
 */
export type PartnerCompanyStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING'

/**
 * 사용자 타입 열거형
 */
export type UserType = 'HEADQUARTERS' | 'PARTNER'

/**
 * 법인 구분 열거형 (DART API 기준)
 */
export type CorpClass = 'Y' | 'K' | 'N' | 'E' // Y: 유가증권시장, K: 코스닥, N: 코넥스, E: 기타

// ============================================================================
// DART API 관련 타입 정의
// ============================================================================

/**
 * DART API 회사 개황 정보 (CompanyProfileResponse 매핑)
 */
export interface DartCompanyProfile {
  status: string // API 응답 상태
  message: string // API 응답 메시지
  corpCode: string // DART 고유번호 (8자리)
  corpName: string // 정식 회사명
  corpNameEng?: string // 영문 회사명
  stockName?: string // 종목명
  stockCode?: string // 종목 코드 (6자리)
  ceoName?: string // 대표이사명
  corpClass?: CorpClass // 법인 구분
  corporateRegistrationNumber?: string // 법인등록번호
  businessNumber?: string // 사업자등록번호
  address?: string // 주소
  homepageUrl?: string // 홈페이지 URL
  irUrl?: string // IR URL
  phoneNumber?: string // 전화번호
  faxNumber?: string // 팩스번호
  industryCode?: string // 업종 코드
  establishmentDate?: string // 설립일 (YYYYMMDD)
  accountingMonth?: string // 결산월 (MM)
}

/**
 * DART 기업 코드 정보 (DartCorpCode 엔티티 매핑)
 */
export interface DartCorpInfo {
  corpCode: string // DART 고유번호
  corpName: string // 회사명
  stockCode?: string // 종목 코드
  modifyDate: string // 수정일

  // 서버 호환성 필드
  corp_code?: string
  corp_name?: string
  stock_code?: string
  modify_date?: string
}

/**
 * DART API 응답 구조 (페이지네이션)
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
}

/**
 * DART 기업 검색 파라미터
 */
export interface SearchCorpParams {
  page?: number
  pageSize?: number
  listedOnly?: boolean
  corpNameFilter?: string
}

// ============================================================================
// auth-service 계층 관리 타입 정의
// ============================================================================

/**
 * auth-service 협력사 생성 요청 (PartnerCreateRequest 매핑)
 */
export interface AuthPartnerCreateRequest {
  uuid: string // DART API에서 제공하는 회사 고유 식별자
  contactPerson: string // DART API 대표자명
  companyName: string // DART API 회사명
  address?: string // DART API 회사 주소
  parentUuid?: string // 상위 협력사 UUID (1차 협력사면 null)
  phone?: string // DART API 연락처 (선택적)
}

/**
 * auth-service 협력사 생성 응답 (PartnerCreateResponse 매핑)
 */
export interface AuthPartnerCreateResponse {
  partnerId: number // 협력사 ID
  hqAccountNumber: string // 본사 계정번호
  hierarchicalId: string // 계층적 아이디
  fullAccountNumber: string // 전체 계정번호
  companyName: string // 회사명
  contactPerson: string // 담당자명
  initialPassword: string // 초기 비밀번호
  level: number // 협력사 레벨
  treePath: string // 트리 경로
  createdAt: string // 생성 일시
  message: string // 메시지
}

/**
 * auth-service 협력사 정보 (PartnerResponse 매핑)
 */
export interface AuthPartnerInfo {
  partnerId: number // 협력사 ID
  uuid: string // 프론트엔드 UUID
  hqAccountNumber: string // 본사 계정번호
  hierarchicalId: string // 계층적 아이디
  fullAccountNumber: string // 전체 계정번호
  accountNumber: string // 프론트엔드 호환용
  companyName: string // 회사명
  userType: UserType // 사용자 타입
  email?: string // 이메일
  contactPerson: string // 담당자명
  phone?: string // 연락처
  address?: string // 주소
  level: number // 협력사 레벨
  treePath: string // 트리 경로
  status: string // 상태
  passwordChanged: boolean // 비밀번호 변경 여부
  createdAt: string // 생성 일시
  updatedAt: string // 수정 일시

  // 관계 정보
  parentPartnerId?: number // 상위 협력사 ID
  parentPartnerName?: string // 상위 협력사명
  headquartersId: number // 본사 ID
  headquartersName: string // 본사명
  directChildLevel?: number // 직속 하위 레벨
}

/**
 * auth-service 로그인 요청 (PartnerLoginRequest 매핑)
 */
export interface AuthPartnerLoginRequest {
  hqAccountNumber: string // 본사 계정번호
  partnerCode: string // 협력사 아이디 (계층형 아이디)
  password: string // 비밀번호
}

/**
 * 초기 비밀번호 변경 요청
 */
export interface InitialPasswordChangeRequest {
  newPassword: string // 새 비밀번호
}

// ============================================================================
// dart-service 파트너사 관리 타입 정의
// ============================================================================

/**
 * dart-service 파트너사 생성 요청 (CreatePartnerCompanyDto 매핑)
 */
export interface CreatePartnerCompanyRequest {
  corpCode: string // DART 기업 고유 코드 (8자리)
  contractStartDate: string // 계약 시작일 (YYYY-MM-DD)
}

/**
 * dart-service 파트너사 수정 요청 (UpdatePartnerCompanyDto 매핑)
 */
export interface UpdatePartnerCompanyRequest {
  corpCode?: string // 변경할 DART 기업 고유 코드
  contractStartDate?: string // 변경할 계약 시작일
  status?: PartnerCompanyStatus // 변경할 상태
}

/**
 * dart-service 파트너사 응답 (PartnerCompanyResponseDto 매핑)
 */
export interface DartPartnerCompanyResponse {
  // PartnerCompany 기본 정보
  id: string // 파트너사 고유 ID (UUID)
  corpCode: string // DART 기업 고유 코드
  status: PartnerCompanyStatus // 파트너사 상태
  contractStartDate: string // 계약 시작일
  createdAt: string // 등록 일시
  updatedAt: string // 수정 일시

  // 소유자 정보
  headquartersId?: number // 본사 ID
  partnerId?: number // 협력사 ID
  userType: UserType // 사용자 유형

  // CompanyProfile 회사 정보 (DART API 기반)
  corpName: string // 회사명 (정식 명칭)
  corpNameEng?: string // 영문 회사명
  stockCode?: string // 주식 코드
  stockName?: string // 종목명
  ceoName?: string // 대표이사명
  corpClass?: CorpClass // 법인 구분
  businessNumber?: string // 사업자등록번호
  corporateRegistrationNumber?: string // 법인등록번호
  address?: string // 주소
  homepageUrl?: string // 홈페이지 URL
  irUrl?: string // IR URL
  phoneNumber?: string // 전화번호
  faxNumber?: string // 팩스번호
  industryCode?: string // 업종 코드
  establishmentDate?: string // 설립일
  accountingMonth?: string // 결산월
  companyProfileUpdatedAt?: string // CompanyProfile 수정 일시
}

/**
 * 페이지네이션된 파트너사 응답 (PaginatedPartnerCompanyResponseDto 매핑)
 */
export interface PaginatedPartnerCompanyResponse {
  data: DartPartnerCompanyResponse[] // 파트너사 목록 데이터
  total: number // 전체 개수
  page: number // 현재 페이지 (1부터 시작)
  pageSize: number // 페이지당 항목 수
}

// ============================================================================
// 재무 위험 분석 관련 타입
// ============================================================================

/**
 * 재무 위험 분석 항목
 */
export interface FinancialRiskItem {
  description: string // 항목 설명
  actualValue: string // 실제 값
  threshold: string // 임계값
  notes: string | null // 비고
  itemNumber: number // 항목 번호
  atRisk: boolean // 위험 여부
}

/**
 * 재무 위험 분석 결과
 */
export interface FinancialRiskAssessment {
  partnerCompanyId: string // 파트너사 ID
  partnerCompanyName: string // 파트너사명
  assessmentYear: string // 평가 연도
  reportCode: string // 보고서 코드
  riskItems: FinancialRiskItem[] // 위험 항목 목록
}

// ============================================================================
// 통합 프론트엔드 타입 (기존 호환성 유지)
// ============================================================================

/**
 * 프론트엔드에서 사용하는 통합 파트너사 정보
 * auth-service와 dart-service 정보를 결합
 */
export interface PartnerCompany {
  // 기본 식별 정보
  id?: string // dart-service ID (UUID)
  partnerId?: number // auth-service ID
  uuid?: string // 공통 UUID

  // 상태 정보
  status?: PartnerCompanyStatus
  userType?: UserType

  // 계정 정보 (auth-service 기반)
  hqAccountNumber?: string // 본사 계정번호
  hierarchicalId?: string // 계층적 아이디
  fullAccountNumber?: string // 전체 계정번호
  accountNumber?: string // 프론트엔드 호환용
  level?: number // 레벨
  treePath?: string // 트리 경로
  passwordChanged?: boolean // 비밀번호 변경 여부

  // 회사 정보 (dart-service CompanyProfile 기반)
  corpCode: string // DART 기업 코드
  corpName: string // 회사명
  companyName: string // 호환성 필드
  corpNameEng?: string // 영문 회사명
  stockCode?: string // 종목 코드
  stockName?: string // 종목명
  ceoName?: string // 대표이사명
  corpClass?: CorpClass // 법인 구분
  businessNumber?: string // 사업자등록번호
  corporateRegistrationNumber?: string // 법인등록번호
  address?: string // 주소
  homepageUrl?: string // 홈페이지
  irUrl?: string // IR URL
  phoneNumber?: string // 전화번호
  faxNumber?: string // 팩스번호
  industryCode?: string // 업종 코드
  establishmentDate?: string // 설립일
  accountingMonth?: string // 결산월

  // 계약 정보 (dart-service 기반)
  contractStartDate?: Date | string // 계약 시작일

  // 관계 정보
  headquartersId?: number // 본사 ID
  headquartersName?: string // 본사명
  parentPartnerId?: number // 상위 협력사 ID
  parentPartnerName?: string // 상위 협력사명

  // 시간 정보
  createdAt?: string // 생성 일시
  updatedAt?: string // 수정 일시
  modifyDate?: string // DART 수정일

  // 기타 정보
  contactPerson?: string // 담당자명
  phone?: string // 연락처
  email?: string // 이메일
  isRestored?: boolean // 복원 여부

  // 레거시 호환성 필드
  industry?: string
  country?: string
  corp_code?: string
  corp_name?: string
  stock_code?: string
  contract_start_date?: string
  modify_date?: string
}

/**
 * Spring Data 페이지네이션 응답 구조
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

// ============================================================================
// 중복 검사 관련 타입
// ============================================================================

/**
 * 회사명 중복 검사 결과
 */
export interface CompanyNameDuplicateCheckResult {
  isDuplicate: boolean // 중복 여부
  message: string // 메시지
  companyName: string // 검사한 회사명
}

// ============================================================================
// 계층 관리 확장 타입 (향후 확장성 고려)
// ============================================================================

/**
 * 계층 트리 노드 (계층 구조 시각화용)
 */
export interface HierarchyTreeNode {
  id: number // 노드 ID (partnerId 또는 headquartersId)
  uuid: string // UUID
  name: string // 회사명
  type: UserType // 노드 타입
  level: number // 레벨
  accountNumber: string // 계정번호
  children: HierarchyTreeNode[] // 자식 노드들
  parent?: HierarchyTreeNode // 부모 노드
  isExpanded?: boolean // 확장 상태 (UI용)
  isSelected?: boolean // 선택 상태 (UI용)
}

/**
 * 계층 생성 마법사 단계
 */
export interface HierarchyCreationStep {
  step: number // 단계 번호
  title: string // 단계 제목
  description: string // 단계 설명
  isCompleted: boolean // 완료 여부
  isActive: boolean // 활성 여부
  data?: any // 단계별 데이터
}

/**
 * 계층 생성 마법사 상태
 */
export interface HierarchyCreationWizard {
  currentStep: number // 현재 단계
  steps: HierarchyCreationStep[] // 모든 단계
  selectedCompany?: DartCompanyProfile // 선택된 회사
  parentInfo?: AuthPartnerInfo | null // 상위 계층 정보
  contractInfo?: {
    startDate: string
    endDate?: string
  } // 계약 정보
  accountInfo?: AuthPartnerCreateResponse // 생성된 계정 정보
}

// ============================================================================
// API 요청/응답 확장 타입
// ============================================================================

/**
 * 통합 파트너사 생성 요청 (auth + dart 서비스 연동)
 */
export interface IntegratedPartnerCreationRequest {
  // DART 회사 선택
  corpCode: string // DART 기업 코드

  // 계층 정보
  parentUuid?: string // 상위 계층 UUID
  contactPerson: string // 담당자명

  // 계약 정보
  contractStartDate: string // 계약 시작일

  // 추가 정보
  phone?: string // 연락처
  email?: string // 이메일
}

/**
 * 통합 파트너사 생성 응답
 */
export interface IntegratedPartnerCreationResponse {
  // dart-service 응답
  partnerCompany: DartPartnerCompanyResponse

  // auth-service 응답
  authAccount: AuthPartnerCreateResponse

  // 통합 정보
  success: boolean
  message: string
  errors?: string[]
}

/**
 * 권한별 파트너사 조회 파라미터
 */
export interface PartnerQueryParams {
  // 페이지네이션
  page?: number
  pageSize?: number

  // 필터링
  companyName?: string // 회사명 필터
  status?: PartnerCompanyStatus // 상태 필터
  level?: number // 레벨 필터
  includeInactive?: boolean // 비활성 포함 여부

  // 정렬
  sortBy?: 'companyName' | 'createdAt' | 'level' | 'status'
  sortOrder?: 'asc' | 'desc'

  // 권한 제어
  accessLevel?: 'self' | 'children' | 'all' // 접근 범위
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * dart-service 응답을 프론트엔드 형식으로 변환
 */
export function mapDartPartnerCompanyResponse(
  response: DartPartnerCompanyResponse
): PartnerCompany {
  return {
    // 기본 정보
    id: response.id,
    corpCode: response.corpCode,
    status: response.status,
    userType: response.userType,

    // 회사 정보
    corpName: response.corpName,
    companyName: response.corpName, // 호환성
    corpNameEng: response.corpNameEng,
    stockCode: response.stockCode,
    stockName: response.stockName,
    ceoName: response.ceoName,
    corpClass: response.corpClass,
    businessNumber: response.businessNumber,
    corporateRegistrationNumber: response.corporateRegistrationNumber,
    address: response.address,
    homepageUrl: response.homepageUrl,
    irUrl: response.irUrl,
    phoneNumber: response.phoneNumber,
    faxNumber: response.faxNumber,
    industryCode: response.industryCode,
    establishmentDate: response.establishmentDate,
    accountingMonth: response.accountingMonth,

    // 계약 정보
    contractStartDate: response.contractStartDate
      ? new Date(response.contractStartDate)
      : undefined,

    // 소유자 정보
    headquartersId: response.headquartersId,
    partnerId: response.partnerId,

    // 시간 정보
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,

    // 레거시 호환성
    corp_code: response.corpCode,
    corp_name: response.corpName,
    stock_code: response.stockCode,
    contract_start_date: response.contractStartDate
  }
}

/**
 * 원본 데이터 배열을 프론트엔드 형식으로 변환
 */
export function mapPartnerCompanies(
  responseList: DartPartnerCompanyResponse[]
): PartnerCompany[] {
  if (!Array.isArray(responseList)) {
    console.warn('mapPartnerCompanies: responseList is not an array:', responseList)
    return []
  }

  return responseList.map(mapDartPartnerCompanyResponse)
}

/**
 * DART 기업 정보를 프론트엔드 형식으로 변환
 */
export function mapDartCorpInfo(raw: DartCorpInfo): DartCorpInfo {
  return {
    corpCode: raw.corp_code || raw.corpCode,
    corpName: raw.corp_name || raw.corpName,
    stockCode: raw.stock_code || raw.stockCode,
    modifyDate: raw.modify_date || raw.modifyDate,

    // 원본 필드 유지
    corp_code: raw.corp_code || raw.corpCode,
    corp_name: raw.corp_name || raw.corpName,
    stock_code: raw.stock_code || raw.stockCode,
    modify_date: raw.modify_date || raw.modifyDate
  }
}

/**
 * auth-service 응답을 프론트엔드 형식으로 변환
 */
export function mapAuthPartnerInfo(authInfo: AuthPartnerInfo): Partial<PartnerCompany> {
  return {
    partnerId: authInfo.partnerId,
    uuid: authInfo.uuid,
    hqAccountNumber: authInfo.hqAccountNumber,
    hierarchicalId: authInfo.hierarchicalId,
    fullAccountNumber: authInfo.fullAccountNumber,
    accountNumber: authInfo.accountNumber,
    companyName: authInfo.companyName,
    corpName: authInfo.companyName,
    userType: authInfo.userType,
    email: authInfo.email,
    contactPerson: authInfo.contactPerson,
    phone: authInfo.phone,
    address: authInfo.address,
    level: authInfo.level,
    treePath: authInfo.treePath,
    passwordChanged: authInfo.passwordChanged,
    parentPartnerId: authInfo.parentPartnerId,
    parentPartnerName: authInfo.parentPartnerName,
    headquartersId: authInfo.headquartersId,
    headquartersName: authInfo.headquartersName,
    createdAt: authInfo.createdAt,
    updatedAt: authInfo.updatedAt
  }
}

/**
 * 레거시 타입에서 새로운 타입으로 변환
 * @deprecated 기존 호환성을 위해 유지, 새 코드에서는 mapDartPartnerCompanyResponse 사용
 */
export function mapPartnerCompany(raw: any): PartnerCompany {
  return {
    id: raw.id,
    status: raw.status,
    corpCode: raw.corp_code || raw.corpCode,
    corpName: raw.corp_name || raw.corpName,
    companyName: raw.corp_name || raw.corpName,
    stockCode: raw.stock_code || raw.stockCode,
    contractStartDate:
      raw.contract_start_date || raw.contractStartDate
        ? new Date(raw.contract_start_date || raw.contractStartDate)
        : undefined,
    modifyDate: raw.modify_date || raw.modifyDate,
    isRestored: raw.is_restored || raw.isRestored,

    // 원본 필드 유지 (서버 호환성)
    corp_code: raw.corp_code || raw.corpCode,
    corp_name: raw.corp_name || raw.corpName,
    stock_code: raw.stock_code || raw.stockCode,
    contract_start_date: raw.contract_start_date || raw.contractStartDate,
    modify_date: raw.modify_date || raw.modifyDate
  }
}
