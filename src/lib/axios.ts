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

export default api
