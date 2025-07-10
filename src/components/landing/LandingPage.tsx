'use client'

import Link from 'next/link'
import {useState, useEffect} from 'react'
import {useRouter} from 'next/navigation'
import authService from '@/services/authService'

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)
    checkAuthStatus()
  }, [])

  // 로그인 상태 확인
  const checkAuthStatus = async () => {
    try {
      const isAuthenticated = await authService.verifyAuth()
      setIsLoggedIn(isAuthenticated)
    } catch (error) {
      console.warn('인증 상태 확인 실패:', error)
      setIsLoggedIn(false)
    } finally {
      setIsCheckingAuth(false)
    }
  }

  // 로그인 버튼 클릭 핸들러
  const handleLoginClick = () => {
    if (isLoggedIn) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }

  // 회원가입 버튼 클릭 핸들러
  const handleSignupClick = () => {
    if (isLoggedIn) {
      router.push('/dashboard')
    } else {
      router.push('/signup')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6 bg-white">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg">
              <span className="text-sm font-bold text-white">N</span>
            </div>
            <span className="text-xl font-bold text-gray-900">NSMM</span>
          </div>
          <div className="flex space-x-3">
            {isLoggedIn ? (
              <button
                onClick={handleLoginClick}
                disabled={isCheckingAuth}
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg transition-all duration-200 hover:bg-blue-600 disabled:opacity-50">
                대시보드
              </button>
            ) : (
              <>
                <button
                  onClick={handleLoginClick}
                  disabled={isCheckingAuth}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-gray-900 disabled:opacity-50">
                  로그인
                </button>
                <button
                  onClick={handleSignupClick}
                  disabled={isCheckingAuth}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg transition-all duration-200 hover:bg-blue-600 disabled:opacity-50">
                  회원가입
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative px-6 py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
            <h1 className="mb-6 text-5xl font-bold leading-tight text-gray-900 md:text-6xl">
              ESG의 모든 것<br />
              <span className="text-blue-500">간편하게</span>
            </h1>

            <p className="max-w-2xl mx-auto mb-12 text-xl leading-relaxed text-gray-600">
              본사와 협력사의 ESG 데이터를 체계적으로 관리하고
              <br />
              지속가능경영을 효율적으로 쉽게 실현하세요.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              {isLoggedIn ? (
                <button
                  onClick={handleLoginClick}
                  disabled={isCheckingAuth}
                  className="px-8 py-4 text-lg font-semibold text-white transition-all duration-300 transform bg-blue-500 shadow-lg rounded-xl hover:bg-blue-600 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none">
                  대시보드로 이동
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSignupClick}
                    disabled={isCheckingAuth}
                    className="px-8 py-4 text-lg font-semibold text-white transition-all duration-300 transform bg-blue-500 shadow-lg rounded-xl hover:bg-blue-600 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none">
                    무료로 시작하기
                  </button>
                  <button
                    onClick={handleLoginClick}
                    disabled={isCheckingAuth}
                    className="px-8 py-4 text-lg font-semibold text-gray-700 transition-all duration-300 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50">
                    기존 계정으로 로그인
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Floating 3D Elements */}
        <div className="absolute w-20 h-20 transform bg-blue-100 left-20 top-32 rounded-2xl opacity-60 rotate-12"></div>
        <div className="absolute w-16 h-16 transform bg-green-100 right-32 top-40 rounded-xl opacity-40 -rotate-6"></div>
        <div className="absolute w-12 h-12 transform rotate-45 bg-purple-100 rounded-lg opacity-50 bottom-32 left-32"></div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div
            className={`text-center mb-16 transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              모든 ESG 관리를 한 번에
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              복잡한 ESG 데이터 관리, 이제 간단하게 해결하세요
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Environment */}
            <div
              className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-100 transition-all duration-500 delay-500 hover:shadow-lg hover:transform hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}>
              <div className="flex items-center justify-center mb-6 bg-green-100 w-14 h-14 rounded-2xl">
                <svg
                  className="text-green-600 w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">Environment</h3>
              <p className="leading-relaxed text-gray-600">
                Scope 1, 2, 3 탄소배출량을 정확하게 추적하고
                <br />
                LCA 기반 배출계수로 신뢰할 수 있는
                <br />
                환경 데이터를 관리하세요
              </p>
            </div>

            {/* Social */}
            <div
              className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-100 transition-all duration-500 delay-700 hover:shadow-lg hover:transform hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}>
              <div className="flex items-center justify-center mb-6 bg-blue-100 w-14 h-14 rounded-2xl">
                <svg
                  className="text-blue-600 w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">Social</h3>
              <p className="leading-relaxed text-gray-600">
                사회적 책임 이행 현황을 체계적으로 평가하고
                <br />
                공급망의 사회적 리스크를 효과적으로
                <br />
                관리할 수 있습니다
              </p>
            </div>

            {/* Governance */}
            <div
              className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-100 transition-all duration-500 delay-900 hover:shadow-lg hover:transform hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}>
              <div className="flex items-center justify-center mb-6 bg-purple-100 w-14 h-14 rounded-2xl">
                <svg
                  className="text-purple-600 w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">Governance</h3>
              <p className="leading-relaxed text-gray-600">
                투명한 거버넌스 체계를 구축하고
                <br />
                CSDDD 공시 기준을 준수하여
                <br />
                리스크를 체계적으로 관리하세요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div
              className={`transition-all duration-1000 delay-300 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}>
              <h2 className="mb-8 text-4xl font-bold leading-tight text-gray-900">
                왜 많은 기업이
                <br />
                <span className="text-blue-500">NSMM를 선택할까요?</span>
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 mt-1 bg-blue-500 rounded-full">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                      스마트한 권한 관리
                    </h3>
                    <p className="text-gray-600">
                      본사와 협력사 간 체계적인 데이터 접근 권한을 자동으로 제어합니다
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 mt-1 bg-blue-500 rounded-full">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                      AI 기반 인사이트
                    </h3>
                    <p className="text-gray-600">
                      실시간 데이터 분석으로 ESG 성과를 개선할 수 있는 방안을 제시합니다
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 mt-1 bg-blue-500 rounded-full">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                      규제 대응 자동화
                    </h3>
                    <p className="text-gray-600">
                      국내외 ESG 공시 기준에 맞는 보고서를 자동으로 생성합니다
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`transition-all duration-1000 delay-500 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}>
              <div className="p-8 bg-gray-50 rounded-3xl">
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="mb-2 text-3xl font-bold text-blue-500">500+</div>
                    <div className="text-sm text-gray-600">관리 대상 협력사</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-3xl font-bold text-green-500">99.9%</div>
                    <div className="text-sm text-gray-600">시스템 안정성</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-3xl font-bold text-purple-500">24/7</div>
                    <div className="text-sm text-gray-600">모니터링 지원</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-3xl font-bold text-orange-500">ISO</div>
                    <div className="text-sm text-gray-600">국제 표준 준수</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
            <h2 className="mb-6 text-4xl font-bold text-gray-900">
              지금 바로 시작하세요
            </h2>
            <p className="max-w-2xl mx-auto mb-8 text-xl text-gray-600">
              5분이면 충분합니다. 복잡한 ESG 관리를 간단하게 만들어보세요
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              {isLoggedIn ? (
                <button
                  onClick={handleLoginClick}
                  disabled={isCheckingAuth}
                  className="px-8 py-4 text-lg font-semibold text-white transition-all duration-300 transform bg-blue-500 shadow-lg rounded-xl hover:bg-blue-600 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none">
                  대시보드로 이동
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSignupClick}
                    disabled={isCheckingAuth}
                    className="px-8 py-4 text-lg font-semibold text-white transition-all duration-300 transform bg-blue-500 shadow-lg rounded-xl hover:bg-blue-600 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none">
                    무료로 시작하기
                  </button>
                  <button
                    onClick={handleLoginClick}
                    disabled={isCheckingAuth}
                    className="px-8 py-4 text-lg font-semibold text-gray-700 transition-all duration-300 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50">
                    기존 계정으로 로그인
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-700 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="flex items-center mb-4 space-x-2 md:mb-0">
              <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-lg">
                <span className="text-xs font-bold text-white">N</span>
              </div>
              <span className="text-lg font-bold text-white">NSMM</span>
            </div>
            <p className="text-sm text-white">© 2024 NSMM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
