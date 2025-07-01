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
   * 현재 사용자 정보 조회 (사용자 타입별 자동 분기)
   * JWT Claims에서 userType을 확인하여 적절한 API 호출
   * 인증 실패 시 에러를 throw하지 않고 null 반환
   */
  async getCurrentUserByType(): Promise<ApiResponse<UserInfo> | null> {
    try {
      // JWT에서 사용자 타입 먼저 확인
      const userType = this.getUserTypeFromJWT()

      if (userType === 'PARTNER') {
        // 협력사 사용자인 경우 협력사 API 먼저 시도
        try {
          const partnerResponse = await api.get('/api/v1/auth/partners/me', {
            validateStatus: status => status < 500
          })

          if (partnerResponse.status === 200) {
            return partnerResponse.data
          }
        } catch (error: any) {
          console.warn('협력사 API 호출 실패:', error.response?.status)
        }
      } else if (userType === 'HEADQUARTERS') {
        // 본사 사용자인 경우 본사 API 먼저 시도
        try {
          const headquartersResponse = await api.get('/api/v1/auth/headquarters/me', {
            validateStatus: status => status < 500
          })

          if (headquartersResponse.status === 200) {
            return headquartersResponse.data
          }
        } catch (error: any) {
          console.warn('본사 API 호출 실패:', error.response?.status)
        }
      }

      // JWT 타입이 없거나 첫 번째 시도가 실패한 경우 폴백 시도
      if (userType !== 'HEADQUARTERS') {
        // 본사 API 시도
        try {
          const headquartersResponse = await api.get('/api/v1/auth/headquarters/me', {
            validateStatus: status => status < 500
          })

          if (headquartersResponse.status === 200) {
            return headquartersResponse.data
          }
        } catch (error: any) {
          // 조용히 실패 처리
        }
      }

      if (userType !== 'PARTNER') {
        // 협력사 API 시도
        try {
          const partnerResponse = await api.get('/api/v1/auth/partners/me', {
            validateStatus: status => status < 500
          })

          if (partnerResponse.status === 200) {
            return partnerResponse.data
          }
        } catch (error: any) {
          // 조용히 실패 처리
        }
      }

      // 모든 시도 실패 - 인증되지 않은 상태
      return null
    } catch (error: any) {
      // 예상치 못한 에러는 로그만 출력하고 null 반환 (에러 throw 안함)
      console.warn('사용자 정보 조회 중 예상치 못한 오류:', error)
      return null
    }
  }

  /**
   * JWT Claims에서 사용자 타입 추출 (클라이언트 사이드용)
   * 주의: 보안상 서버 검증이 필요하므로 참조용으로만 사용
   */
  getUserTypeFromJWT(): 'HEADQUARTERS' | 'PARTNER' | null {
    if (typeof window === 'undefined') return null

    const jwtCookie = document.cookie
      .split(';')
      .find(cookie => cookie.trim().startsWith('jwt='))

    if (!jwtCookie) return null

    try {
      const token = jwtCookie.split('=')[1]
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.userType || null
    } catch (error) {
      console.warn('JWT 파싱 실패:', error)
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
    const response = await api.get('/api/v1/partners/accessible')
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
    const response = await api.put('/api/v1/auth/partners/initial-password', {
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
  getUserTypeFromJWT,
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
