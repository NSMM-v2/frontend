'use client'

import Link from 'next/link'
import {useState, useEffect} from 'react'

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br via-blue-900 to-emerald-900 from-slate-900">
      {/* Hero Section */}
      <div className="overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16" />

        {/* Navigation */}
        <nav className="relative z-10 px-6 py-4">
          <div className="flex justify-between items-center mx-auto max-w-7xl">
            <div className="text-xl font-bold text-white">ESG Manager</div>
            <div className="flex space-x-4">
              <Link
                href="/login"
                className="transition-colors duration-200 text-white/80 hover:text-white">
                로그인
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-white bg-emerald-600 rounded-lg transition-colors duration-200 hover:bg-emerald-700">
                회원가입
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 px-6 py-20">
          <div className="mx-auto max-w-7xl text-center">
            <div
              className={`transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}>
              <h1 className="mb-6 text-5xl font-bold text-white md:text-7xl">
                지속가능한 미래를 위한
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                  ESG 관리 플랫폼
                </span>
              </h1>

              <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed md:text-2xl text-white/80">
                본사와 협력사의 환경, 사회, 거버넌스 데이터를
                <br className="hidden md:block" />
                통합 관리하고 분석하는 전문 플랫폼
              </p>

              <div className="flex flex-col gap-4 justify-center items-center sm:flex-row">
                <Link
                  href="/login"
                  className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-emerald-600 to-blue-600 rounded-xl shadow-lg transition-all duration-300 transform hover:from-emerald-700 hover:to-blue-700 hover:scale-105 hover:shadow-xl">
                  플랫폼 시작하기
                </Link>
                <Link
                  href="/signup"
                  className="px-8 py-4 text-lg font-semibold text-white rounded-xl border-2 backdrop-blur-sm transition-all duration-300 border-white/30 hover:border-white/50 hover:bg-white/10">
                  무료 체험하기
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-20 h-20 rounded-full blur-xl animate-pulse bg-emerald-400/10" />
        <div className="absolute right-20 bottom-20 w-32 h-32 rounded-full blur-xl delay-1000 animate-pulse bg-blue-400/10" />
      </div>

      {/* Features Section */}
      <div className="px-6 py-20 backdrop-blur-sm bg-white/5">
        <div className="mx-auto max-w-7xl">
          <div
            className={`text-center mb-16 transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              ESG 통합 관리 솔루션
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-white/70">
              체계적인 ESG 데이터 관리를 통해 지속가능경영을 실현하세요
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Environment */}
            <div
              className={`bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 transition-all duration-1000 delay-500 hover:bg-white/15 hover:transform hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}>
              <div className="flex justify-center items-center mb-6 w-16 h-16 bg-emerald-500 rounded-2xl">
                <svg
                  className="w-8 h-8 text-white"
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
              <h3 className="mb-4 text-2xl font-bold text-white">Environment</h3>
              <p className="leading-relaxed text-white/70">
                Scope 1, 2, 3 탄소배출량 추적 및 관리
                <br />
                LCA 기반 정확한 배출계수 적용
                <br />
                실시간 환경 데이터 모니터링
              </p>
            </div>

            {/* Social */}
            <div
              className={`bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 transition-all duration-1000 delay-700 hover:bg-white/15 hover:transform hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}>
              <div className="flex justify-center items-center mb-6 w-16 h-16 bg-blue-500 rounded-2xl">
                <svg
                  className="w-8 h-8 text-white"
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
              <h3 className="mb-4 text-2xl font-bold text-white">Social</h3>
              <p className="leading-relaxed text-white/70">
                사회적 책임 이행 현황 평가
                <br />
                공급망 사회적 리스크 관리
                <br />
                이해관계자 만족도 측정
              </p>
            </div>

            {/* Governance */}
            <div
              className={`bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 transition-all duration-1000 delay-900 hover:bg-white/15 hover:transform hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}>
              <div className="flex justify-center items-center mb-6 w-16 h-16 bg-purple-500 rounded-2xl">
                <svg
                  className="w-8 h-8 text-white"
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
              <h3 className="mb-4 text-2xl font-bold text-white">Governance</h3>
              <p className="leading-relaxed text-white/70">
                투명한 거버넌스 체계 구축
                <br />
                CSDDD 공시 기준 준수
                <br />
                리스크 관리 및 컴플라이언스
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 items-center lg:grid-cols-2">
            <div
              className={`transition-all duration-1000 delay-300 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}>
              <h2 className="mb-8 text-4xl font-bold text-white md:text-5xl">
                왜 ESG Manager를
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                  선택해야 할까요?
                </span>
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex flex-shrink-0 justify-center items-center mt-1 w-6 h-6 bg-emerald-500 rounded-full">
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
                    <h3 className="mb-2 text-xl font-semibold text-white">
                      계층적 권한 관리
                    </h3>
                    <p className="text-white/70">
                      본사-협력사 간 체계적인 데이터 접근 권한 제어
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex flex-shrink-0 justify-center items-center mt-1 w-6 h-6 bg-emerald-500 rounded-full">
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
                    <h3 className="mb-2 text-xl font-semibold text-white">
                      실시간 데이터 분석
                    </h3>
                    <p className="text-white/70">
                      AI 기반 ESG 성과 분석 및 개선 방안 제시
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex flex-shrink-0 justify-center items-center mt-1 w-6 h-6 bg-emerald-500 rounded-full">
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
                    <h3 className="mb-2 text-xl font-semibold text-white">
                      규제 준수 지원
                    </h3>
                    <p className="text-white/70">
                      국내외 ESG 공시 기준에 맞는 보고서 자동 생성
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`transition-all duration-1000 delay-500 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}>
              <div className="p-8 rounded-3xl border backdrop-blur-sm bg-white/10 border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="mb-2 text-3xl font-bold text-emerald-400">500+</div>
                    <div className="text-white/70">관리 대상 협력사</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-3xl font-bold text-blue-400">99.9%</div>
                    <div className="text-white/70">시스템 안정성</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-3xl font-bold text-purple-400">24/7</div>
                    <div className="text-white/70">모니터링 지원</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-3xl font-bold text-orange-400">ISO</div>
                    <div className="text-white/70">국제 표준 준수</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 py-20 bg-gradient-to-r backdrop-blur-sm from-emerald-600/20 to-blue-600/20">
        <div className="mx-auto max-w-4xl text-center">
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
            <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
              지금 시작하세요
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-white/80">
              ESG Manager와 함께 지속가능한 미래를 만들어가세요
            </p>
            <div className="flex flex-col gap-4 justify-center sm:flex-row">
              <Link
                href="/signup"
                className="px-8 py-4 text-lg font-semibold text-gray-900 bg-white rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                무료로 시작하기
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 text-lg font-semibold text-white rounded-xl border-2 border-white transition-all duration-300 hover:bg-white hover:text-gray-900">
                로그인
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/10">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-white/60">© 2024 NSMM ESG Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
