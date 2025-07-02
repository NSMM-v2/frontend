import axios from 'axios'

/**
 * API URL 동적 결정 함수
 * 환경변수 우선, 없으면 현재 호스트 기반으로 URL 생성
 */
const getApiBaseUrl = () => {
  // 환경변수 확인
  const configuredUrl = process.env.NEXT_PUBLIC_SPRING_API_URL

  // 환경변수가 없거나 미치환 변수가 있는 경우
  if (!configuredUrl || configuredUrl.includes('${') || configuredUrl === 'undefined') {
    // 브라우저 환경인 경우 현재 호스트 기반으로 URL 생성
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const protocol = window.location.protocol
      const port = hostname === 'localhost' ? ':8080' : '' // 개발환경에서는 Gateway 포트 사용
      return `${protocol}//${hostname}${port}`
    }
    // 서버사이드 렌더링 환경 - Kubernetes 내부 서비스 이름 사용
    return 'http://gateway-service:8080'
  }

  return configuredUrl
}

/**
 * Axios 인스턴스 생성 및 설정
 * JWT 쿠키 자동 전송, 타임아웃, 기본 헤더 설정
 */
const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // JWT 쿠키 자동 전송 (인증의 핵심)
  timeout: 10000, // 10초 타임아웃
  headers: {
    'Content-Type': 'application/json'
  }
})

console.log('🔧 [Axios] API 인스턴스 초기화:', {
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: '10초',
  headers: {'Content-Type': 'application/json'}
})

/**
 * 요청 인터셉터 - 로깅 및 디버깅
 */
api.interceptors.request.use(
  config => {
    const baseUrl = config.baseURL || ''
    const url = config.url || ''
    const method = config.method?.toUpperCase() || 'UNKNOWN'

    console.log(`🌐 [Axios Request] ${method} ${baseUrl}${url}`, {
      params: config.params,
      dataSize: config.data ? JSON.stringify(config.data).length : 0,
      hasData: !!config.data,
      withCredentials: config.withCredentials,
      timeout: config.timeout
    })

    // 쿠키 정보 로깅 (브라우저 환경에서만)
    if (typeof window !== 'undefined' && document.cookie) {
      const hasJwtCookie = document.cookie.includes('jwt=')
      console.log(`🍪 [Axios Request] 쿠키 상태:`, {
        hasJwtCookie,
        cookieCount: document.cookie.split(';').length
      })
    }

    return config
  },
  error => {
    console.error('❌ [Axios Request] 요청 설정 오류:', error)
    return Promise.reject(error)
  }
)

/**
 * 응답 인터셉터 - 에러 처리 및 로깅
 */
api.interceptors.response.use(
  response => {
    const method = response.config.method?.toUpperCase() || 'UNKNOWN'
    const url = response.config.url || ''
    const status = response.status

    console.log(`✅ [Axios Response] ${method} ${url} - ${status}`, {
      status,
      statusText: response.statusText,
      dataSize: JSON.stringify(response.data).length,
      responseTime: response.headers['x-response-time'] || 'unknown',
      hasData: !!response.data,
      success: response.data?.success
    })

    // API 응답 구조 확인
    if (response.data) {
      console.log(`📦 [Axios Response] 데이터 구조:`, {
        hasSuccess: 'success' in response.data,
        hasMessage: 'message' in response.data,
        hasData: 'data' in response.data,
        hasErrors: 'errors' in response.data
      })
    }

    return response
  },
  error => {
    const status = error.response?.status || 'NETWORK_ERROR'
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN'
    const url = error.config?.url || 'unknown'

    console.log(`🚨 [Axios Response] ${method} ${url} - 오류 발생`, {
      status,
      statusText: error.response?.statusText || 'Network Error',
      errorCode: error.response?.data?.errorCode || 'UNKNOWN',
      message: error.response?.data?.message || error.message,
      hasErrorData: !!error.response?.data
    })

    // 클라이언트 에러(4xx)는 간단한 로그만
    if (status >= 400 && status < 500) {
      console.log(`⚠️ [Axios Response] 클라이언트 요청 오류: ${status} ${url}`, {
        possibleCause:
          status === 401
            ? 'JWT 토큰 만료 또는 미인증'
            : status === 403
            ? '권한 없음'
            : status === 404
            ? '리소스 없음'
            : '잘못된 요청'
      })
    } else if (status >= 500) {
      // 서버 오류(5xx)만 상세 로그
      console.error(`💥 [Axios Response] 서버 오류: ${status} ${url}`, {
        errorData: error.response?.data,
        stack: error.stack
      })
    } else {
      // 네트워크 오류 등
      console.log(`🌐 [Axios Response] 네트워크 요청 실패: ${url}`, {
        errorType: 'NETWORK_ERROR',
        message: error.message,
        code: error.code
      })
    }

    return Promise.reject(error)
  }
)

export default api
