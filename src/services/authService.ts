import api from '@/lib/axios'

// 인증 관련 타입 정의
export interface LoginRequest {
  email: string
  password: string
}

export interface PartnerLoginRequest {
  accountNumber: string
  email: string
  password: string
}

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

export interface UserInfo {
  accountNumber: string
  companyName: string
  userType: 'HEADQUARTERS' | 'PARTNER'
  level?: number
  name?: string
  email?: string
  department?: string
  position?: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errorCode?: string
}

// 인증 서비스 클래스
class AuthService {
  /**
   * 본사 회원가입
   */
  async registerHeadquarters(signupData: SignupRequest): Promise<ApiResponse<any>> {
    const response = await api.post('/api/v1/headquarters/register', signupData)
    return response.data
  }

  /**
   * 본사 로그인
   */
  async loginHeadquarters(loginData: LoginRequest): Promise<ApiResponse<UserInfo>> {
    const response = await api.post('/api/v1/headquarters/login', loginData)
    return response.data
  }

  /**
   * 협력사 로그인
   */
  async loginPartner(loginData: PartnerLoginRequest): Promise<ApiResponse<UserInfo>> {
    const response = await api.post('/api/v1/partners/login', loginData)
    return response.data
  }

  /**
   * 로그아웃 (본사/협력사 공통)
   */
  async logout(): Promise<ApiResponse<any>> {
    const response = await api.post('/api/v1/headquarters/logout')
    return response.data
  }

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUser(): Promise<ApiResponse<UserInfo>> {
    const response = await api.get('/api/v1/headquarters/me')
    return response.data
  }

  /**
   * 현재 사용자 정보 조회 (사용자 타입별 자동 분기)
   * JWT Claims에서 userType을 확인하여 적절한 API 호출
   */
  async getCurrentUserByType(): Promise<ApiResponse<UserInfo>> {
    try {
      // 먼저 본사 API 시도
      const response = await api.get('/api/v1/headquarters/me')
      return response.data
    } catch (error: any) {
      // 본사 API 실패시 협력사 API 시도
      if (error.response?.status === 403 || error.response?.status === 401) {
        try {
          const response = await api.get('/api/v1/partners/me')
          return response.data
        } catch (partnerError) {
          throw partnerError
        }
      }
      throw error
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
    const response = await api.get('/api/v1/headquarters/check-email', {
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
    const response = await api.put('/api/v1/headquarters/password', {
      currentPassword,
      newPassword
    })
    return response.data
  }

  /**
   * 협력사 계정 생성 (본사만 가능)
   */
  async createPartner(partnerData: {
    companyName: string
    email: string
    name: string
    department?: string
    position?: string
    phone?: string
    address?: string
    parentAccountNumber?: string
  }): Promise<ApiResponse<any>> {
    const response = await api.post('/api/v1/partners/create', partnerData)
    return response.data
  }

  /**
   * 협력사 목록 조회
   */
  async getPartners(): Promise<ApiResponse<any[]>> {
    const response = await api.get('/api/v1/partners')
    return response.data
  }

  /**
   * 특정 협력사 정보 조회
   */
  async getPartner(partnerUuid: string): Promise<ApiResponse<any>> {
    const response = await api.get(`/api/v1/partners/${partnerUuid}`)
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
    const response = await api.put(`/api/v1/partners/${partnerUuid}`, updateData)
    return response.data
  }

  /**
   * 협력사 삭제
   */
  async deletePartner(partnerUuid: string): Promise<ApiResponse<any>> {
    const response = await api.delete(`/api/v1/partners/${partnerUuid}`)
    return response.data
  }

  /**
   * 협력사 비밀번호 초기화
   */
  async resetPartnerPassword(
    partnerUuid: string
  ): Promise<ApiResponse<{temporaryPassword: string}>> {
    const response = await api.post(`/api/v1/partners/${partnerUuid}/reset-password`)
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
    const response = await api.put('/api/v1/partners/initial-password', {
      accountNumber,
      email,
      temporaryPassword,
      newPassword
    })
    return response.data
  }

  /**
   * JWT 쿠키 존재 여부 확인 (클라이언트 사이드) - 상세 디버깅 포함
   */
  hasJwtCookie(): boolean {
    if (typeof window === 'undefined') {
      console.log('🔍 hasJwtCookie: 서버사이드 환경 - false 반환')
      return false
    }

    const allCookies = document.cookie
    console.log('🔍 hasJwtCookie: 모든 쿠키:', allCookies)

    if (!allCookies) {
      console.log('🔍 hasJwtCookie: 쿠키가 전혀 없음')
      return false
    }

    const jwtCookie = allCookies
      .split(';')
      .find(cookie => cookie.trim().startsWith('jwt='))

    console.log('🔍 hasJwtCookie: JWT 쿠키 검색 결과:', jwtCookie)

    if (!jwtCookie) {
      console.log('❌ hasJwtCookie: JWT 쿠키 없음')
      return false
    }

    const jwtValue = jwtCookie.split('=')[1]
    console.log(
      '✅ hasJwtCookie: JWT 값 존재:',
      jwtValue ? jwtValue.substring(0, 20) + '...' : 'null'
    )

    return !!jwtValue && jwtValue.trim() !== ''
  }

  /**
   * 인증 상태 확인 (서버에 실제 요청)
   */
  async verifyAuth(): Promise<boolean> {
    try {
      await this.getCurrentUserByType()
      return true
    } catch (error) {
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
  getCurrentUser,
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
