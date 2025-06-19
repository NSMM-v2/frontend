import api from '@/lib/axios'

// ESG 데이터 관련 타입 정의
export interface Scope1EmissionData {
  companyUuid: string
  referenceYear: number
  fuelType: string
  activityAmount: number
  unit: string
  emissionFactor: number
  co2Equivalent: number
  notes?: string
}

export interface Scope2EmissionData {
  companyUuid: string
  referenceYear: number
  energyType: 'ELECTRICITY' | 'HEATING' | 'COOLING'
  activityAmount: number
  unit: string
  emissionFactor: number
  co2Equivalent: number
  notes?: string
}

export interface Scope3EmissionData {
  companyUuid: string
  referenceYear: number
  category: string
  activityType: string
  activityAmount: number
  unit: string
  emissionFactor: number
  co2Equivalent: number
  notes?: string
}

export interface EmissionSummary {
  companyUuid: string
  companyName: string
  accountNumber: string
  referenceYear: number
  scope1Total: number
  scope2Total: number
  scope3Total: number
  totalEmissions: number
  lastUpdated: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errorCode?: string
}

// ESG 데이터 서비스 클래스
class ESGDataService {
  // ===== Scope 1 관련 =====

  /**
   * Scope 1 데이터 입력
   */
  async createScope1Data(
    data: Scope1EmissionData
  ): Promise<ApiResponse<Scope1EmissionData>> {
    const response = await api.post('/api/v1/esg-data/scope1', data)
    return response.data
  }

  /**
   * Scope 1 데이터 목록 조회
   */
  async getScope1DataList(params?: {
    companyUuid?: string
    referenceYear?: number
    page?: number
    size?: number
  }): Promise<
    ApiResponse<{
      content: Scope1EmissionData[]
      totalElements: number
      totalPages: number
      currentPage: number
    }>
  > {
    const response = await api.get('/api/v1/esg-data/scope1', {params})
    return response.data
  }

  /**
   * Scope 1 데이터 수정
   */
  async updateScope1Data(
    dataId: number,
    data: Partial<Scope1EmissionData>
  ): Promise<ApiResponse<Scope1EmissionData>> {
    const response = await api.put(`/api/v1/esg-data/scope1/${dataId}`, data)
    return response.data
  }

  /**
   * Scope 1 데이터 삭제
   */
  async deleteScope1Data(dataId: number): Promise<ApiResponse<any>> {
    const response = await api.delete(`/api/v1/esg-data/scope1/${dataId}`)
    return response.data
  }

  // ===== Scope 2 관련 =====

  /**
   * Scope 2 데이터 입력
   */
  async createScope2Data(
    data: Scope2EmissionData
  ): Promise<ApiResponse<Scope2EmissionData>> {
    const response = await api.post('/api/v1/esg-data/scope2', data)
    return response.data
  }

  /**
   * Scope 2 데이터 목록 조회
   */
  async getScope2DataList(params?: {
    companyUuid?: string
    referenceYear?: number
    energyType?: 'ELECTRICITY' | 'HEATING' | 'COOLING'
    page?: number
    size?: number
  }): Promise<
    ApiResponse<{
      content: Scope2EmissionData[]
      totalElements: number
      totalPages: number
      currentPage: number
    }>
  > {
    const response = await api.get('/api/v1/esg-data/scope2', {params})
    return response.data
  }

  /**
   * Scope 2 데이터 수정
   */
  async updateScope2Data(
    dataId: number,
    data: Partial<Scope2EmissionData>
  ): Promise<ApiResponse<Scope2EmissionData>> {
    const response = await api.put(`/api/v1/esg-data/scope2/${dataId}`, data)
    return response.data
  }

  /**
   * Scope 2 데이터 삭제
   */
  async deleteScope2Data(dataId: number): Promise<ApiResponse<any>> {
    const response = await api.delete(`/api/v1/esg-data/scope2/${dataId}`)
    return response.data
  }

  // ===== Scope 3 관련 =====

  /**
   * Scope 3 데이터 입력
   */
  async createScope3Data(
    data: Scope3EmissionData
  ): Promise<ApiResponse<Scope3EmissionData>> {
    const response = await api.post('/api/v1/esg-data/scope3', data)
    return response.data
  }

  /**
   * Scope 3 데이터 목록 조회
   */
  async getScope3DataList(params?: {
    companyUuid?: string
    referenceYear?: number
    category?: string
    page?: number
    size?: number
  }): Promise<
    ApiResponse<{
      content: Scope3EmissionData[]
      totalElements: number
      totalPages: number
      currentPage: number
    }>
  > {
    const response = await api.get('/api/v1/esg-data/scope3', {params})
    return response.data
  }

  /**
   * Scope 3 데이터 수정
   */
  async updateScope3Data(
    dataId: number,
    data: Partial<Scope3EmissionData>
  ): Promise<ApiResponse<Scope3EmissionData>> {
    const response = await api.put(`/api/v1/esg-data/scope3/${dataId}`, data)
    return response.data
  }

  /**
   * Scope 3 데이터 삭제
   */
  async deleteScope3Data(dataId: number): Promise<ApiResponse<any>> {
    const response = await api.delete(`/api/v1/esg-data/scope3/${dataId}`)
    return response.data
  }

  // ===== 통합 조회 및 통계 =====

  /**
   * 배출량 요약 정보 조회
   */
  async getEmissionSummary(params?: {
    companyUuid?: string
    referenceYear?: number
    includeSubCompanies?: boolean
  }): Promise<ApiResponse<EmissionSummary[]>> {
    const response = await api.get('/api/v1/esg-data/summary', {params})
    return response.data
  }

  /**
   * 연도별 배출량 추이 조회
   */
  async getEmissionTrend(params: {
    companyUuid?: string
    startYear: number
    endYear: number
    includeSubCompanies?: boolean
  }): Promise<
    ApiResponse<{
      years: number[]
      scope1Trend: number[]
      scope2Trend: number[]
      scope3Trend: number[]
      totalTrend: number[]
    }>
  > {
    const response = await api.get('/api/v1/esg-data/trend', {params})
    return response.data
  }

  /**
   * 배출량 상세 보고서 조회
   */
  async getDetailedReport(params: {
    companyUuid?: string
    referenceYear: number
    includeSubCompanies?: boolean
  }): Promise<
    ApiResponse<{
      summary: EmissionSummary
      scope1Details: Scope1EmissionData[]
      scope2Details: Scope2EmissionData[]
      scope3Details: Scope3EmissionData[]
    }>
  > {
    const response = await api.get('/api/v1/esg-data/detailed-report', {params})
    return response.data
  }

  // ===== 배출계수 관리 =====

  /**
   * 배출계수 목록 조회
   */
  async getEmissionFactors(params?: {
    scope?: '1' | '2' | '3'
    category?: string
    searchKeyword?: string
  }): Promise<
    ApiResponse<{
      factors: Array<{
        factorId: number
        scope: string
        category: string
        subcategory: string
        unit: string
        factor: number
        source: string
        year: number
      }>
    }>
  > {
    const response = await api.get('/api/v1/esg-data/emission-factors', {params})
    return response.data
  }

  /**
   * 배출량 계산 (실시간 계산)
   */
  async calculateEmission(params: {
    scope: '1' | '2' | '3'
    category: string
    activityAmount: number
    unit: string
  }): Promise<
    ApiResponse<{
      activityAmount: number
      emissionFactor: number
      co2Equivalent: number
      unit: string
      calculation: string
    }>
  > {
    const response = await api.get('/api/v1/esg-data/calculate', {params})
    return response.data
  }

  // ===== 파일 업로드/다운로드 =====

  /**
   * Excel 템플릿 다운로드
   */
  async downloadExcelTemplate(scope: '1' | '2' | '3'): Promise<Blob> {
    const response = await api.get(`/api/v1/esg-data/template/excel/scope${scope}`, {
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * Excel 파일을 통한 대량 데이터 업로드
   */
  async uploadExcelData(
    scope: '1' | '2' | '3',
    file: File
  ): Promise<
    ApiResponse<{
      successCount: number
      failureCount: number
      failures: Array<{
        row: number
        reason: string
      }>
    }>
  > {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post(`/api/v1/esg-data/upload/scope${scope}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * 배출량 보고서 PDF 다운로드
   */
  async downloadReport(params: {
    companyUuid?: string
    referenceYear: number
    includeSubCompanies?: boolean
    format: 'PDF' | 'EXCEL'
  }): Promise<Blob> {
    const response = await api.get('/api/v1/esg-data/report/download', {
      params,
      responseType: 'blob'
    })
    return response.data
  }

  // ===== 데이터 검증 =====

  /**
   * 데이터 유효성 검증
   */
  async validateData(params: {companyUuid?: string; referenceYear: number}): Promise<
    ApiResponse<{
      isValid: boolean
      errors: Array<{
        scope: string
        field: string
        message: string
        severity: 'ERROR' | 'WARNING'
      }>
      warnings: Array<{
        scope: string
        field: string
        message: string
      }>
    }>
  > {
    const response = await api.get('/api/v1/esg-data/validate', {params})
    return response.data
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const esgDataService = new ESGDataService()
export default esgDataService

// 개별 함수들도 내보내기
export const {
  createScope1Data,
  getScope1DataList,
  updateScope1Data,
  deleteScope1Data,
  createScope2Data,
  getScope2DataList,
  updateScope2Data,
  deleteScope2Data,
  createScope3Data,
  getScope3DataList,
  updateScope3Data,
  deleteScope3Data,
  getEmissionSummary,
  getEmissionTrend,
  getDetailedReport,
  getEmissionFactors,
  calculateEmission,
  downloadExcelTemplate,
  uploadExcelData,
  downloadReport,
  validateData
} = esgDataService
