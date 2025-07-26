'use client'

import {useState, useEffect} from 'react'
import {useRouter} from 'next/navigation'
import Link from 'next/link'
import authService from '@/services/authService'
import {ScopeEmissionsChart, SupplierEmissionsChart, CSDDDRiskChart} from './ESGCharts'

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

  // 스크롤 네비게이션 핸들러
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="min-h-screen text-gray-800 bg-gray-50">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <nav className="flex items-center justify-between px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <Link href="/" className="flex flex-row items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg">
              <span className="text-sm font-bold text-white">N</span>
            </div>
            <span className="text-xl font-bold text-gray-900">NSMM</span>
          </Link>
          <div className="hidden space-x-8 md:flex">
            <a
              href="#challenge"
              onClick={e => {
                e.preventDefault()
                scrollToSection('challenge')
              }}
              className="text-gray-600 hover:text-[#2D5BFF] font-medium cursor-pointer">
              문제점
            </a>
            <a
              href="#solution"
              onClick={e => {
                e.preventDefault()
                scrollToSection('solution')
              }}
              className="text-gray-600 hover:text-[#2D5BFF] font-medium cursor-pointer">
              해결책
            </a>
            <a
              href="#workflow"
              onClick={e => {
                e.preventDefault()
                scrollToSection('workflow')
              }}
              className="text-gray-600 hover:text-[#2D5BFF] font-medium cursor-pointer">
              동작방식
            </a>
            <a
              href="#dashboards"
              onClick={e => {
                e.preventDefault()
                scrollToSection('dashboards')
              }}
              className="text-gray-600 hover:text-[#2D5BFF] font-medium cursor-pointer">
              데이터 시각화
            </a>
            <a
              href="#benefits"
              onClick={e => {
                e.preventDefault()
                scrollToSection('benefits')
              }}
              className="text-gray-600 hover:text-[#2D5BFF] font-medium cursor-pointer">
              기대효과
            </a>
          </div>
          <div className="flex space-x-3">
            {isLoggedIn ? (
              <button
                onClick={handleLoginClick}
                disabled={isCheckingAuth}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#2D5BFF] rounded-lg transition-all duration-200 hover:bg-blue-600 disabled:opacity-50">
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
                  className="px-5 py-2.5 text-sm font-medium text-white bg-[#2D5BFF] rounded-lg transition-all duration-200 hover:bg-blue-600 disabled:opacity-50">
                  회원가입
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2D5BFF] to-[#2AD1E2] text-white text-center py-20 px-4">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
          <h2 className="mb-4 text-4xl font-extrabold md:text-5xl">
            공급망 리스크, 투명하게 해결하다
          </h2>
          <p className="max-w-3xl mx-auto mb-8 text-xl font-light md:text-2xl">
            NSMM의 통합 ESG 공급망 관리 플랫폼으로 복잡한 규제와 데이터를 명확하게
            관리하고 지속가능한 미래를 만드세요.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isLoggedIn ? (
              <button
                onClick={handleLoginClick}
                disabled={isCheckingAuth}
                className="px-8 py-4 text-lg font-semibold text-[#2D5BFF] bg-white transition-all duration-300 transform shadow-lg rounded-xl hover:bg-gray-50 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none">
                대시보드로 이동
              </button>
            ) : (
              <>
                <button
                  onClick={handleSignupClick}
                  disabled={isCheckingAuth}
                  className="px-8 py-4 text-lg font-semibold text-[#2D5BFF] bg-white transition-all duration-300 transform shadow-lg rounded-xl hover:bg-gray-50 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none">
                  무료로 시작하기
                </button>
                <button
                  onClick={handleLoginClick}
                  disabled={isCheckingAuth}
                  className="px-8 py-4 text-lg font-semibold text-white transition-all duration-300 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 disabled:opacity-50">
                  기존 계정으로 로그인
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Challenge & Solution Section */}
      <section id="challenge" className="px-4 py-16 bg-white sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h3 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              보이지 않는 리스크, 관리의 한계
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              1차 협력사를 넘어선 공급망의 복잡성은 데이터 신뢰도를 저하시키고, 잠재적
              리스크를 증폭시킵니다.
            </p>
          </div>
          <div className="grid items-center grid-cols-1 gap-8 md:grid-cols-2">
            <div className="p-8 bg-white border border-gray-200 shadow-lg rounded-xl">
              <h4 className="text-2xl font-bold text-center mb-6 text-[#FF5757]">
                문제점: 불투명한 공급망
              </h4>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start">
                  <span className="text-2xl mr-4 text-[#FF5757]">⚠️</span>
                  <div>
                    <h5 className="font-semibold">제한된 가시성</h5>
                    <p>
                      2, 3차 하위 협력사로 갈수록 관리 권한이 약화되어 공급망 전체의
                      투명성이 부족합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-4 text-[#FF5757]">⚠️</span>
                  <div>
                    <h5 className="font-semibold">신뢰도 낮은 데이터</h5>
                    <p>
                      특히 Scope 3(간접 배출) 영역은 데이터 수집이 어려워 정확한 탄소
                      배출량 확보가 곤란합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8 bg-white border border-gray-200 shadow-lg rounded-xl">
              <h4 className="text-2xl font-bold text-center mb-6 text-[#2AD1E2]">
                NSMM의 해결책: 통합된 가시성
              </h4>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start">
                  <span className="text-2xl mr-4 text-[#2AD1E2]">🔗</span>
                  <div>
                    <h5 className="font-semibold">전체 공급망 구조화</h5>
                    <p>
                      다차 계층 협력사 등록을 통해 공급망 전체 구조를 시각화하고 통합 관리
                      체계를 수립합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-4 text-[#2AD1E2]">📊</span>
                  <div>
                    <h5 className="font-semibold">정확한 데이터 확보</h5>
                    <p>
                      표준화된 양식으로 Scope 1, 2, 3 배출량 데이터를 수집하여 신뢰도 높은
                      ESG 데이터를 확보합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="px-4 py-16 bg-white sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h3 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              하나의 플랫폼, 모든 ESG 솔루션
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              NSMM은 공급망 관리부터 규제 대응까지, ESG 경영에 필요한 모든 기능을 통합
              제공합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-8 text-center transition-shadow duration-300 shadow-lg rounded-xl bg-gray-50 hover:shadow-2xl">
              <div className="mb-4 text-5xl">⛓️</div>
              <h4 className="mb-2 text-xl font-bold">공급망 가시화</h4>
              <p className="text-gray-600">
                1-3차 협력사를 아우르는 공급망 구조를 시각화하고 통합 관리합니다.
              </p>
            </div>
            <div className="p-8 text-center transition-shadow duration-300 shadow-lg rounded-xl bg-gray-50 hover:shadow-2xl">
              <div className="mb-4 text-5xl">🌿</div>
              <h4 className="mb-2 text-xl font-bold">탄소 배출량 정량화</h4>
              <p className="text-gray-600">
                Scope 1, 2, 3 기반의 정밀한 배출량 산정 및 모니터링을 지원합니다.
              </p>
            </div>
            <div className="p-8 text-center transition-shadow duration-300 shadow-lg rounded-xl bg-gray-50 hover:shadow-2xl">
              <div className="mb-4 text-5xl">💰</div>
              <h4 className="mb-2 text-xl font-bold">재무 리스크 진단</h4>
              <p className="text-gray-600">
                협력사의 재무 건전성을 자동 분석하여 공급망 안정성을 진단합니다.
              </p>
            </div>
            <div className="p-8 text-center transition-shadow duration-300 shadow-lg rounded-xl bg-gray-50 hover:shadow-2xl">
              <div className="mb-4 text-5xl">✅</div>
              <h4 className="mb-2 text-xl font-bold">EU CSDDD 대응</h4>
              <p className="text-gray-600">
                기업 실사 지침 기반 자가진단 기능으로 주요 ESG 리스크를 사전 점검합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="px-4 py-16 bg-white sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h3 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              플랫폼 동작 방식
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              간단한 3단계 프로세스로 공급망 ESG 관리를 시작하세요.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center lg:flex-row gap-y-16 lg:gap-y-0 lg:gap-x-16">
            <div className="relative w-64 text-center">
              <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 text-4xl text-blue-500 bg-white border-4 border-blue-200 rounded-full shadow-lg">
                1
              </div>
              <h4 className="text-xl font-bold">협력사 등록</h4>
              <p className="mt-2 text-gray-600">
                다차 계층 구조로 협력사를 등록하여 공급망 전체를 구성합니다.
              </p>
              {/* Arrow for desktop */}
              <div className="absolute hidden text-4xl text-gray-300 lg:block top-12 -right-8">
                →
              </div>
              {/* Arrow for mobile */}
              <div className="absolute text-4xl text-gray-300 transform -translate-x-1/2 lg:hidden -bottom-8 left-1/2">
                ↓
              </div>
            </div>
            <div className="relative w-64 text-center">
              <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 text-4xl text-green-500 bg-white border-4 border-green-200 rounded-full shadow-lg">
                2
              </div>
              <h4 className="text-xl font-bold">데이터 입력 및 수집</h4>
              <p className="mt-2 text-gray-600">
                탄소 배출량, 재무 정보, CSDDD 자가진단 결과를 입력 및 자동 수집합니다.
              </p>
              {/* Arrow for desktop */}
              <div className="absolute hidden text-4xl text-gray-300 lg:block top-12 -right-8">
                →
              </div>
              {/* Arrow for mobile */}
              <div className="absolute text-4xl text-gray-300 transform -translate-x-1/2 lg:hidden -bottom-8 left-1/2">
                ↓
              </div>
            </div>
            <div className="w-64 text-center">
              <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 text-4xl text-purple-500 bg-white border-4 border-purple-200 rounded-full shadow-lg">
                3
              </div>
              <h4 className="text-xl font-bold">통합 모니터링</h4>
              <p className="mt-2 text-gray-600">
                통합 대시보드에서 모든 ESG 데이터를 실시간으로 시각화하고 분석합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Visualization Section */}
      <section id="dashboards" className="px-4 py-16 bg-white sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h3 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              데이터 기반 의사결정: 통합 대시보드
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              직관적인 데이터 시각화를 통해 ESG 현황을 한눈에 파악하고 전략적인 결정을
              내릴 수 있습니다.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <ScopeEmissionsChart />
            <SupplierEmissionsChart />
            <CSDDDRiskChart />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="px-4 py-16 bg-white sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h3 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              플랫폼 도입을 통한 기대효과
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              데이터 기반의 투명한 공급망 관리는 기업의 경쟁력을 한 단계 끌어올립니다.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="p-8 bg-white border border-gray-200 shadow-lg rounded-xl">
              <div className="text-4xl mb-4 text-[#2D5BFF]">📈</div>
              <h4 className="mb-2 text-xl font-bold">공급망 가시성 향상</h4>
              <p className="text-gray-600">
                다차 협력사까지 실시간 추적 가능한 관리 체계를 구축하여 잠재 리스크를
                사전에 파악합니다.
              </p>
            </div>
            <div className="p-8 bg-white border border-gray-200 shadow-lg rounded-xl">
              <div className="text-4xl mb-4 text-[#2AD1E2]">🌍</div>
              <h4 className="mb-2 text-xl font-bold">ESG 규제 대응 역량 강화</h4>
              <p className="text-gray-600">
                EU CSDDD 등 글로벌 규제에 선제적으로 대응하고, 지속가능경영보고서(ESRS)
                작성에 활용합니다.
              </p>
            </div>
            <div className="p-8 bg-white border border-gray-200 shadow-lg rounded-xl">
              <div className="text-4xl mb-4 text-[#FFC02D]">🤝</div>
              <h4 className="mb-2 text-xl font-bold">지속가능한 협력 기반 구축</h4>
              <p className="text-gray-600">
                협력사의 자발적 참여를 유도하여 ESG 경영을 공급망 전체로 확산시키는 상생
                모델을 실현합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

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
                  className="px-8 py-4 text-lg font-semibold text-white transition-all duration-300 transform bg-[#2D5BFF] shadow-lg rounded-xl hover:bg-blue-600 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none">
                  대시보드로 이동
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSignupClick}
                    disabled={isCheckingAuth}
                    className="px-8 py-4 text-lg font-semibold text-white transition-all duration-300 transform bg-[#2D5BFF] shadow-lg rounded-xl hover:bg-blue-600 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none">
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
      <footer className="px-4 py-8 text-white bg-gray-800">
        <div className="mx-auto text-center max-w-7xl">
          <p className="font-bold">NSMM - ESG Supply Chain Platform</p>
          <p className="mt-2 text-sm text-gray-400">
            &copy; 2025 Samjong KPMG Fullstack Project Team. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
