import api from '@/lib/axios'
import {
  DartApiResponse,
  DartCompanyProfile,
  SearchCorpParams,
  CreatePartnerCompanyRequest,
  UpdatePartnerCompanyRequest,
  DartPartnerCompanyResponse,
  PaginatedPartnerCompanyResponse,
  PartnerCompany,
  PartnerCompanyResponse,
  FinancialRiskAssessment,
  CompanyNameDuplicateCheckResult,
  mapDartPartnerCompanyResponse,
  mapPartnerCompanies,
  AvailablePeriod
} from '@/types/partnerCompanyType'

/**
 * DART 기업 코드 목록을 검색합니다.
 * @param params 검색 파라미터
 * @returns DART API 응답
 */
export async function searchCompaniesFromDart(
  params: SearchCorpParams
): Promise<DartApiResponse> {
  try {
    console.log('DART 검색 호출됨:', params)

    // 입력 파라미터 검증
    if (!params || typeof params !== 'object') {
      throw new Error('유효하지 않은 검색 파라미터입니다.')
    }

    // 강화된 페이지 파라미터 검증
    let validPage = 1
    let validPageSize = 10

    // page 검증
    const pageNum = Number(params.page)
    if (!isNaN(pageNum) && isFinite(pageNum) && pageNum >= 1) {
      validPage = Math.floor(pageNum)
    } else {
      console.warn('DART 검색: 잘못된 page 값:', params.page, '-> 1로 설정')
    }

    // pageSize 검증
    const pageSizeNum = Number(params.pageSize)
    if (!isNaN(pageSizeNum) && isFinite(pageSizeNum) && pageSizeNum >= 1) {
      validPageSize = Math.min(100, Math.floor(pageSizeNum))
    } else {
      console.warn('DART 검색: 잘못된 pageSize 값:', params.pageSize, '-> 10으로 설정')
    }

    // Spring Data 인덱스 계산 (0-based) - 음수 절대 방지
    const page = Math.max(0, validPage - 1)
    const size = validPageSize

    const requestParams: Record<string, string | number | boolean> = {
      page,
      size
    }

    // 검색어가 있을 때만 추가
    if (params.corpNameFilter && params.corpNameFilter.trim()) {
      requestParams.corpNameFilter = params.corpNameFilter.trim()
    }

    // 상장사 필터
    if (params.listedOnly !== undefined) {
      requestParams.listedOnly = params.listedOnly
    }

    console.log('DART API 요청 파라미터:', requestParams)

    const response = await api.get<DartApiResponse>('/api/v1/dart/corp-codes', {
      params: requestParams,
      timeout: 30000 // 30초 타임아웃
    })

    console.log('DART API 응답:', response.data)
    return response.data
  } catch (error: unknown) {
    console.error('DART 기업 검색 오류:', error)

    let errorMessage = 'DART 기업 검색에 실패했습니다.'

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {status?: number; data?: any}
      }

      if (axiosError.response?.status === 500) {
        errorMessage = '서버에서 DART API 처리 중 오류가 발생했습니다.'

        // 500 에러의 경우 빈 결과를 반환하여 UI가 깨지지 않도록 함
        return {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: params.pageSize || 10,
          number: 0,
          numberOfElements: 0,
          first: true,
          last: true,
          empty: true
        }
      }
    }

    throw new Error(errorMessage)
  }
}

/**
 * 특정 DART 기업의 상세 정보를 조회합니다.
 * @param corpCode DART 기업 고유 코드
 * @returns 회사 개황 정보
 */
export async function fetchDartCompanyProfile(
  corpCode: string
): Promise<DartCompanyProfile> {
  try {
    console.log('DART 회사 정보 조회:', corpCode)

    const response = await api.get<DartCompanyProfile>(`/api/v1/dart/company/${corpCode}`)

    console.log('DART 회사 정보 응답:', response.data)
    return response.data
  } catch (error: unknown) {
    console.error('DART 회사 정보 조회 오류:', error)

    let errorMessage = 'DART 회사 정보를 조회할 수 없습니다.'

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {status?: number; data?: {message?: string}}
      }

      if (axiosError.response?.status === 404) {
        errorMessage = '해당 기업 정보를 찾을 수 없습니다.'
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message
      }
    }

    throw new Error(errorMessage)
  }
}

/**
 * 새로운 파트너사를 등록합니다.
 * @param partnerInput 등록할 파트너사 정보
 * @returns 등록된 파트너사 정보
 */
export async function createPartnerCompany(
  partnerInput: CreatePartnerCompanyRequest
): Promise<PartnerCompany> {
  try {
    console.log('파트너사 생성 요청 데이터:', partnerInput)

    const response = await api.post<DartPartnerCompanyResponse>(
      '/api/v1/partners/partner-companies',
      partnerInput
    )

    console.log('파트너사 생성 응답:', response.data)

    return mapDartPartnerCompanyResponse(response.data)
  } catch (error: unknown) {
    console.error('파트너사 등록 오류:', error)

    let errorMessage = '파트너사 등록 중 오류가 발생했습니다.'

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {status?: number; data?: any}
      }

      if (axiosError.response?.status === 409) {
        // 409 응답에서 복원된 파트너사인지 확인
        const responseData = axiosError.response.data
        if (responseData && responseData.isRestored === true) {
          // 복원 성공 - 복원된 파트너사 데이터 반환
          console.log('파트너사 복원 성공:', responseData)
          return mapDartPartnerCompanyResponse(responseData)
        } else {
          // 실제 중복 에러
          errorMessage = responseData?.message || '이미 등록된 파트너사입니다.'
        }
      } else if (axiosError.response?.status === 400) {
        errorMessage = '계정이 이미 존재합니다.'
      } else if (axiosError.response?.status === 500) {
        errorMessage = '서버 내부 오류가 발생했습니다.'
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message
      }
    }

    throw new Error(errorMessage)
  }
}

/**
 * 파트너사 목록을 조회합니다. (페이지네이션 지원)
 * @param page 페이지 번호 (기본값: 1)
 * @param pageSize 페이지당 항목 수 (기본값: 10)
 * @param companyNameFilter 회사명 필터 (선택사항)
 * @returns 파트너사 목록 응답
 */
export async function fetchPartnerCompanies(
  page = 1,
  pageSize = 10,
  companyNameFilter?: string
): Promise<PartnerCompanyResponse> {
  try {
    console.log('fetchPartnerCompanies 호출됨:', {page, pageSize, companyNameFilter})

    // 안전한 페이지 값 계산
    let safePage = 1
    let safePageSize = 10

    // page 파라미터 검증
    const pageNum = Number(page)
    if (!isNaN(pageNum) && isFinite(pageNum) && pageNum >= 1) {
      safePage = Math.floor(pageNum)
    } else {
      console.warn('잘못된 page 값:', page, '-> 1로 설정')
    }

    // pageSize 파라미터 검증
    const pageSizeNum = Number(pageSize)
    if (!isNaN(pageSizeNum) && isFinite(pageSizeNum) && pageSizeNum >= 1) {
      safePageSize = Math.min(100, Math.floor(pageSizeNum))
    } else {
      console.warn('잘못된 pageSize 값:', pageSize, '-> 10으로 설정')
    }

    const params: Record<string, string | number> = {
      page: safePage,
      pageSize: safePageSize
    }

    if (companyNameFilter && companyNameFilter.trim()) {
      params.companyName = companyNameFilter.trim()
    }

    console.log('API 요청 파라미터:', params)

    const response = await api.get<PaginatedPartnerCompanyResponse>(
      '/api/v1/partners/partner-companies',
      {
        params
      }
    )

    console.log('API 응답 받음:', response.data)

    // PaginatedPartnerCompanyResponseDto 구조를 PartnerCompanyResponse로 변환
    const paginatedData = response.data

    return {
      content: mapPartnerCompanies(paginatedData.data),
      totalElements: paginatedData.total,
      totalPages: Math.ceil(paginatedData.total / safePageSize),
      size: safePageSize,
      number: safePage - 1, // 0-based로 변환
      numberOfElements: paginatedData.data.length,
      first: safePage === 1,
      last: safePage >= Math.ceil(paginatedData.total / safePageSize),
      empty: paginatedData.data.length === 0,

      // 레거시 호환성
      data: mapPartnerCompanies(paginatedData.data),
      total: paginatedData.total,
      page: safePage,
      pageSize: safePageSize
    }
  } catch (error: unknown) {
    console.error('파트너사 목록 조회 중 오류:', error)

    let errorMessage = '파트너사 목록을 가져오는 중 오류가 발생했습니다.'

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {status?: number; data?: {message?: string}}
      }

      if (axiosError.response?.status === 500) {
        errorMessage = '서버 내부 오류가 발생했습니다.'
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message
      }
    }

    throw new Error(errorMessage)
  }
}

/**
 * 특정 파트너사의 상세 정보를 조회합니다.
 * @param id 파트너사 ID (UUID)
 * @returns 파트너사 정보
 */
export async function fetchPartnerCompanyById(
  id: string
): Promise<PartnerCompany | null> {
  try {
    console.log('파트너사 상세 조회 요청 ID:', id)

    const response = await api.get<DartPartnerCompanyResponse>(
      `/api/v1/partners/partner-companies/${id}`
    )

    console.log('파트너사 상세 조회 응답:', response.data)

    return mapDartPartnerCompanyResponse(response.data)
  } catch (error: unknown) {
    console.error('파트너사 정보 조회 오류:', error)

    // 404 에러인 경우 null 반환
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {status?: number; data?: {message?: string}}
      }

      if (axiosError.response?.status === 404) {
        return null
      }

      let errorMessage = '파트너사 정보를 가져오는데 실패했습니다.'

      if (axiosError.response?.status === 500) {
        errorMessage = '서버 내부 오류가 발생했습니다.'
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message
      }

      throw new Error(errorMessage)
    }

    throw new Error('파트너사 정보를 가져오는데 실패했습니다.')
  }
}

/**
 * 파트너사 정보를 수정합니다.
 * @param id 파트너사 ID (UUID)
 * @param partnerData 수정할 파트너사 데이터
 * @returns 수정된 파트너사 정보
 */
export async function updatePartnerCompany(
  id: string,
  partnerData: UpdatePartnerCompanyRequest
): Promise<PartnerCompany | null> {
  try {
    console.log('파트너사 수정 요청 데이터:', partnerData)
    console.log('파트너사 수정 요청 ID:', id)

    const response = await api.patch<DartPartnerCompanyResponse>(
      `/api/v1/partners/partner-companies/${id}`,
      partnerData
    )

    console.log('파트너사 수정 응답:', response.data)

    return mapDartPartnerCompanyResponse(response.data)
  } catch (error: unknown) {
    console.error('파트너사 수정 오류:', error)

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {status?: number; data?: {message?: string}}
      }

      if (axiosError.response?.status === 404) {
        return null
      }

      let errorMessage = '파트너사 정보 수정에 실패했습니다.'

      if (axiosError.response?.status === 400) {
        errorMessage = '잘못된 요청입니다. 입력 데이터를 확인해주세요.'
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message
      }

      throw new Error(errorMessage)
    }

    throw new Error('파트너사 정보 수정에 실패했습니다.')
  }
}

/**
 * 파트너사를 삭제(비활성화)합니다.
 * @param id 파트너사 ID (UUID)
 */
export async function deletePartnerCompany(id: string): Promise<void> {
  try {
    console.log('파트너사 삭제 요청 ID:', id)

    await api.delete(`/api/v1/partners/partner-companies/${id}`)

    console.log('파트너사 삭제 완료')
  } catch (error: unknown) {
    console.error('파트너사 삭제 오류:', error)

    let errorMessage = '파트너사 삭제에 실패했습니다.'

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {status?: number; data?: {message?: string}}
      }

      if (axiosError.response?.status === 404) {
        errorMessage = '삭제하려는 파트너사를 찾을 수 없습니다.'
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message
      }
    }

    throw new Error(errorMessage)
  }
}

/**
 * 협력사 회사명 중복 검사를 수행합니다.
 * @param companyName 검사할 회사명
 * @param excludeId 제외할 협력사 ID (수정 시 자기 자신 제외용)
 * @returns 중복 검사 결과
 */
export async function checkCompanyNameDuplicate(
  companyName: string,
  excludeId?: string
): Promise<CompanyNameDuplicateCheckResult> {
  try {
    console.log('협력사 회사명 중복 검사:', {companyName, excludeId})

    const params = new URLSearchParams()
    params.append('companyName', companyName)
    if (excludeId) {
      params.append('excludeId', excludeId)
    }

    const response = await api.get<CompanyNameDuplicateCheckResult>(
      `/api/v1/partners/partner-companies/check-duplicate?${params.toString()}`
    )

    console.log('중복 검사 응답:', response.data)
    return response.data
  } catch (error) {
    console.error('협력사 회사명 중복 검사 오류:', error)

    let errorMessage = '중복 검사 중 오류가 발생했습니다.'

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {status?: number; data?: {message?: string}}
      }

      if (axiosError.response?.status === 400) {
        errorMessage = '잘못된 요청입니다.'
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message
      }
    }

    throw new Error(errorMessage)
  }
}

/**
 * 파트너사 재무 위험 분석 정보를 가져옵니다.
 * @param corpCode DART 기업 고유 코드
 * @param partnerName 회사명 (선택사항)
 * @param bsnsYear 분석할 사업연도 (YYYY, 선택사항)
 * @param reprtCode 분석할 보고서 코드 (선택사항)
 * @returns 재무 위험 분석 결과
 */
export async function fetchFinancialRiskAssessment(
  corpCode: string,
  partnerName?: string,
  bsnsYear?: string,
  reprtCode?: string
): Promise<FinancialRiskAssessment> {
  try {
    const params: Record<string, string> = {}

    if (partnerName) {
      params.partnerName = partnerName
    }

    if (bsnsYear) {
      params.bsnsYear = bsnsYear
    }

    if (reprtCode) {
      params.reprtCode = reprtCode
    }

    console.log('재무 위험 정보 요청 파라미터:', {corpCode, ...params})

    const response = await api.get<FinancialRiskAssessment>(
      `/api/v1/partners/partner-companies/${corpCode}/financial-risk`,
      {params}
    )

    console.log('재무 위험 정보 응답:', response.data)

    return response.data
  } catch (error: unknown) {
    console.error('재무 위험 정보 조회 오류:', error)

    let errorMessage = '재무 위험 정보를 가져오는데 실패했습니다.'

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {status?: number; data?: {message?: string}}
      }

      if (axiosError.response?.status === 400) {
        errorMessage = '잘못된 요청 파라미터입니다. 연도와 보고서 코드를 확인해주세요.'
      } else if (axiosError.response?.status === 404) {
        errorMessage = '재무 위험 정보를 찾을 수 없습니다.'
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message
      }
    }

    throw new Error(errorMessage)
  }
}

/**
 * 고유한 파트너사 이름 목록을 가져옵니다.
 * @returns 파트너사 이름 목록
 */
export async function fetchUniquePartnerCompanyNames(): Promise<string[]> {
  try {
    console.log('파트너사 이름 목록 요청')

    const response = await api.get<{companyNames: string[]}>(
      '/api/v1/partners/unique-partner-companies'
    )

    console.log('파트너사 이름 목록 응답:', response.data)

    return response.data.companyNames || []
  } catch (error: unknown) {
    console.error('파트너사 이름 목록을 가져오는 중 오류:', error)

    let errorMessage = '파트너사 이름 목록을 가져오는 중 오류가 발생했습니다.'

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {status?: number; data?: {message?: string}}
      }

      if (axiosError.response?.status === 500) {
        errorMessage = '서버 내부 오류가 발생했습니다.'
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message
      }
    }

    throw new Error(errorMessage)
  }
}

/**
 * 파트너사 상세 정보를 조회합니다.
 * @param partnerId 파트너사 ID
 * @returns 파트너사 상세 정보
 */
export async function fetchPartnerCompanyDetail(
  partnerId: string
): Promise<PartnerCompany> {
  const result = await fetchPartnerCompanyById(partnerId)
  if (!result) {
    throw new Error('파트너사를 찾을 수 없습니다.')
  }
  return result
}

/**
 * 특정 파트너사의 이용 가능한 재무제표 기간 목록을 조회합니다.
 * @param corpCode DART 기업 고유 코드
 * @returns 이용 가능한 기간 목록
 */
export async function fetchAvailablePeriods(
  corpCode: string
): Promise<AvailablePeriod[]> {
  try {
    console.log('이용 가능한 기간 조회 요청:', {corpCode})

    const response = await api.get<AvailablePeriod[]>(
      `/api/v1/partners/partner-companies/${corpCode}/available-periods`
    )

    console.log('이용 가능한 기간 응답:', response.data)

    return response.data
  } catch (error: unknown) {
    console.error('이용 가능한 기간 조회 오류:', error)

    let errorMessage = '이용 가능한 기간 정보를 가져오는데 실패했습니다.'

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {status?: number; data?: {message?: string}}
      }

      if (axiosError.response?.status === 404) {
        errorMessage = '해당 회사의 재무제표 데이터를 찾을 수 없습니다.'
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message
      }
    }

    throw new Error(errorMessage)
  }
}

/**
 * 파트너사의 계정 생성 상태를 true로 업데이트합니다.
 */
export async function updateAccountCreatedStatus(id: string): Promise<void> {
  try {
    await api.patch(`/api/v1/partners/partner-companies/${id}/account-created`)
    console.log('파트너사 계정 생성 상태 업데이트 성공')
  } catch (error) {
    console.error('파트너사 계정 생성 상태 업데이트 실패:', error)
    throw error
  }
}
