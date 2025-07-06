import api from '@/lib/axios'

// 로그인 요청 인터페이스
export interface LoginRequest {
  email: string
  password: string
}

// 협력사 로그인 요청 인터페이스
export interface PartnerLoginRequest {
  hqAccountNumber: string // 본사 계정번호 (HQ001)
  partnerCode: string // 협력사 아이디/계층형 아이디 (L1-001)
  password: string
}

// 회원가입 요청 인터페이스
export interface SignupRequest {
  name: string
  position: string
  email: string
  companyName: string
  phone: string
  department: string
  address: string
  password: string
}

// 사용자 정보 인터페이스
export interface UserInfo {
  accountNumber: string
  companyName: string
  userType: 'HEADQUARTERS' | 'PARTNER'
  uuid?: string // 협력사의 경우 UUID 정보
  level?: number
  name?: string
  email?: string
  department?: string
  position?: string
  passwordChanged?: boolean // 협력사 초기 비밀번호 변경 여부
  headquarters?: {
    id: string
  }
  partnerId?: string
  headquartersId?: string
  treePath?: string

  tree_path?: string
  treePathValue?: string
}

// API 응답 인터페이스
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errorCode?: string
}

/**
 * 인증 서비스 클래스
 *
 * 기능: 본사/협력사 로그인, 회원가입, 사용자 정보 관리
 * 인증: JWT 토큰 기반 인증 시스템
 */
class AuthService {
  /**
   * 본사 회원가입
   */
  async registerHeadquarters(signupData: SignupRequest): Promise<ApiResponse<any>> {
    const response = await api.post('/api/v1/auth/headquarters/register', signupData)
    return response.data
  }

  /**
   * 본사 로그인
   */
  async loginHeadquarters(loginData: LoginRequest): Promise<ApiResponse<UserInfo>> {
    const response = await api.post('/api/v1/auth/headquarters/login', loginData)
    return response.data
  }

  /**
   * 협력사 로그인
   */
  async loginPartner(loginData: PartnerLoginRequest): Promise<ApiResponse<UserInfo>> {
    const response = await api.post('/api/v1/auth/partners/login', loginData)
    return response.data
  }

  /**
   * 로그아웃 (쿠키 삭제)
   */
  async logout(): Promise<ApiResponse<any>> {
    const response = await api.post('/api/v1/auth/headquarters/logout')
    return response.data
  }

  /**
   * 현재 사용자 정보 조회 (폴백 방식)
   * JWT 쿠키가 HttpOnly로 설정되어 클라이언트에서 파싱 불가
   * 협력사 API → 본사 API 순으로 시도하여 사용자 타입 자동 판별
   */
  async getCurrentUserByType(): Promise<ApiResponse<UserInfo> | null> {
    try {
      // 1. 협력사 API 시도 (500 에러도 허용하여 에러 발생 안함)
      try {
        console.log('[AuthService] 협력사 API 시도')
        const partnerResponse = await api.get('/api/v1/auth/partners/me', {
          validateStatus: status => true // 모든 상태 코드 허용 (500 에러도 에러로 처리 안함)
        })

        if (partnerResponse.status === 200) {
          console.log('[AuthService] 협력사 API 성공')
          return partnerResponse.data
        }
      } catch (error: any) {
        console.log('[AuthService] 협력사 API 실패')
      }

      // 2. 본사 API 시도 (500 에러도 허용하여 에러 발생 안함)
      try {
        console.log('[AuthService] 본사 API 시도')
        const headquartersResponse = await api.get('/api/v1/auth/headquarters/me', {
          validateStatus: status => true // 모든 상태 코드 허용 (500 에러도 에러로 처리 안함)
        })

        if (headquartersResponse.status === 200) {
          console.log('[AuthService] 본사 API 성공')
          return headquartersResponse.data
        }
      } catch (error: any) {
        console.log('[AuthService] 본사 API 실패')
      }

      // 모든 시도 실패 - 인증되지 않은 상태
      console.log('[AuthService] 모든 API 호출 실패 - 인증되지 않은 상태')
      return null
    } catch (error: any) {
      console.warn('[AuthService] 예상치 못한 오류:', error)
      return null
    }
  }

  /**
   * 이메일 중복 확인
   */
  async checkEmailExists(email: string): Promise<ApiResponse<boolean>> {
    const response = await api.get('/api/v1/auth/headquarters/check-email', {
      params: {email}
    })
    return response.data
  }

  /**
   * 비밀번호 변경 (본사)
   */
  async changeHeadquartersPassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<any>> {
    const response = await api.put('/api/v1/auth/headquarters/password', {
      currentPassword,
      newPassword
    })
    return response.data
  }

  /**
   * 협력사 계정 생성 (본사만 가능) - DART API 기반
   */
  async createPartner(partnerData: {
    uuid: string // DART API에서 제공하는 회사 고유 식별자 (id 필드)
    contactPerson: string // DART API 대표자명 (ceoName 필드)
    companyName: string // DART API 회사명 (corpName 필드)
    address?: string // DART API 회사 주소 (address 필드)
    phone?: string // DART API 연락처 (phoneNumber 필드)
    parentUuid?: string // 상위 협력사 UUID (1차 협력사면 null)
  }): Promise<ApiResponse<any>> {
    const response = await api.post('/api/v1/auth/partners/create-by-uuid', partnerData)
    return response.data
  }

  /**
   * 협력사 목록 조회
   */
  async getPartners(): Promise<ApiResponse<any[]>> {
    const response = await api.get('/api/v1/auth/partners')
    return response.data
  }

  // 접근 가능한 협력사만 조회
  async getAccessiblePartners(): Promise<ApiResponse<any[]>> {
    const response = await api.get('/api/v1/auth/partners/accessible')
    return response.data
  }
  /**
   * 특정 협력사 정보 조회
   */
  async getPartner(partnerUuid: string): Promise<ApiResponse<any>> {
    const response = await api.get(`/api/v1/auth/partners/${partnerUuid}`)
    return response.data
  }

  /**
   * 협력사 정보 수정
   */
  async updatePartner(
    partnerUuid: string,
    updateData: {
      companyName?: string
      name?: string
      department?: string
      position?: string
      phone?: string
      address?: string
    }
  ): Promise<ApiResponse<any>> {
    const response = await api.put(`/api/v1/auth/partners/${partnerUuid}`, updateData)
    return response.data
  }

  /**
   * 협력사 삭제
   */
  async deletePartner(partnerUuid: string): Promise<ApiResponse<any>> {
    const response = await api.delete(`/api/v1/auth/partners/${partnerUuid}`)
    return response.data
  }

  /**
   * 협력사 비밀번호 초기화
   */
  async resetPartnerPassword(
    partnerUuid: string
  ): Promise<ApiResponse<{temporaryPassword: string}>> {
    const response = await api.post(`/api/v1/auth/partners/${partnerUuid}/reset-password`)
    return response.data
  }

  /**
   * 협력사 초기 비밀번호 변경
   */
  async changePartnerInitialPassword(
    accountNumber: string,
    email: string,
    temporaryPassword: string,
    newPassword: string
  ): Promise<ApiResponse<any>> {
    const response = await api.patch('/api/v1/auth/partners/initial-password', {
      accountNumber,
      email,
      temporaryPassword,
      newPassword
    })
    return response.data
  }

  /**
   * JWT 쿠키 존재 여부 확인 (클라이언트 사이드)
   * 주의: 참조용으로만 사용, 실제 인증은 서버에서 검증 필요
   */
  hasJwtCookie(): boolean {
    if (typeof window === 'undefined') {
      return false
    }

    const allCookies = document.cookie

    if (!allCookies) {
      return false
    }

    const jwtCookie = allCookies
      .split(';')
      .find(cookie => cookie.trim().startsWith('jwt='))

    if (!jwtCookie) {
      return false
    }

    const jwtValue = jwtCookie.split('=')[1]
    return !!jwtValue && jwtValue.trim() !== ''
  }

  /**
   * 인증 상태 확인 (서버에 실제 요청)
   * 서버에서 JWT 토큰 검증 후 인증 상태 반환
   */
  async verifyAuth(): Promise<boolean> {
    try {
      const response = await this.getCurrentUserByType()
      return response ? response.success && !!response.data : false
    } catch (error) {
      console.warn('인증 확인 실패:', error)
      return false
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const authService = new AuthService()
export default authService

// 개별 함수들도 내보내기 (기존 코드 호환성을 위해)
export const {
  registerHeadquarters,
  loginHeadquarters,
  loginPartner,
  logout,
  getCurrentUserByType,
  checkEmailExists,
  changeHeadquartersPassword,
  createPartner,
  getPartners,
  getPartner,
  updatePartner,
  deletePartner,
  resetPartnerPassword,
  changePartnerInitialPassword,
  hasJwtCookie,
  verifyAuth
} = authService
