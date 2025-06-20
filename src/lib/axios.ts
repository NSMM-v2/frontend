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
  withCredentials: true, // JWT 쿠키 자동 전송
  timeout: 10000, // 10초 타임아웃
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 요청 인터셉터 - 로깅 및 디버깅
 */
api.interceptors.request.use(
  config => {
    const baseUrl = config.baseURL || ''
    const url = config.url || ''
    console.log(`API 요청: ${config.method?.toUpperCase()} ${baseUrl}${url}`)
    return config
  },
  error => {
    console.error('API 요청 오류:', error)
    return Promise.reject(error)
  }
)

/**
 * 응답 인터셉터 - 에러 처리 및 로깅
 */
api.interceptors.response.use(
  response => {
    console.log(
      `API 응답 성공: ${response.config.method?.toUpperCase()} ${response.config.url}`
    )
    return response
  },
  error => {
    const status = error.response?.status
    const url = error.config?.url

    // 인증 관련 에러(401/403)는 로그 최소화
    if (status === 401 || status === 403) {
      console.log(`인증 필요: ${status} ${url}`)
    } else {
      // 서버 오류나 기타 에러만 상세 로그
      console.error(`API 응답 실패: ${status} ${url}`, error.response?.data)
    }

    return Promise.reject(error)
  }
)

export default api
