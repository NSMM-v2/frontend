'use client'

import Link from 'next/link'
import InputWithIcon from '@/components/inputWithIcon'
import {Mail, Lock, Building, ArrowRight, Shield} from 'lucide-react'
import {useState, useEffect} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import authService from '@/services/authService'
import {showSuccess, showError, showWarning, showInfo} from '@/util/toast'

/**
 * 로그인 컴포넌트
 *
 * 기능: 본사 및 협력사 로그인, 사용자 타입별 폼 분기
 * 인증: JWT 토큰 기반 로그인 후 대시보드 리다이렉트
 */
export default function LoginComponent() {
  const [isVisible, setIsVisible] = useState(false)
  const [userType, setUserType] = useState<'HEADQUARTERS' | 'PARTNER'>('HEADQUARTERS')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // 본사 로그인 폼 상태
  const [headquartersForm, setHeadquartersForm] = useState({
    email: '',
    password: ''
  })

  // 협력사 로그인 폼 상태
  const [partnerForm, setPartnerForm] = useState({
    hqAccountNumber: '',
    partnerCode: '',
    password: ''
  })

  useEffect(() => {
    setIsVisible(true)

    // URL 파라미터에서 메시지 확인 및 토스트 표시
    const message = searchParams.get('message')
    const redirect = searchParams.get('redirect')

    if (message === 'auth_required') {
      showWarning('로그인이 필요합니다')
    } else if (redirect && redirect !== '/dashboard') {
      showInfo(`로그인 후 ${redirect} 페이지로 이동됩니다`)
    }
  }, [searchParams])

  // 본사 로그인 처리
  const handleHeadquartersLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!headquartersForm.email || !headquartersForm.password) {
      showError('이메일과 비밀번호를 모두 입력해주세요')
      return
    }

    setIsLoading(true)

    try {
      const response = await authService.loginHeadquarters({
        email: headquartersForm.email,
        password: headquartersForm.password
      })

      if (response.success) {
        const userData = response.data
        showSuccess(`${userData.companyName} 본사 로그인 성공!`)

        // 로그인 성공 후 약간의 지연 후 대시보드로 이동
        const redirectPath = searchParams.get('redirect') || '/dashboard'

        // 토스트 메시지 표시 시간 확보를 위한 지연
        setTimeout(() => {
          router.push(redirectPath)
        }, 800)
      }
    } catch (error: unknown) {
      console.error('본사 로그인 실패:', error)

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {status?: number; data?: {message?: string}}
        }

        if (axiosError.response?.status === 401) {
          showError('이메일 또는 비밀번호가 올바르지 않습니다')
        } else if (axiosError.response?.status === 404) {
          showError('존재하지 않는 계정입니다')
        } else {
          const errorMessage =
            axiosError.response?.data?.message || '로그인에 실패했습니다'
          showError(errorMessage)
        }
      } else {
        showError('로그인에 실패했습니다')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 협력사 로그인 처리
  const handlePartnerLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !partnerForm.hqAccountNumber ||
      !partnerForm.partnerCode ||
      !partnerForm.password
    ) {
      showError('모든 필드를 입력해주세요')
      return
    }

    setIsLoading(true)

    try {
      const response = await authService.loginPartner({
        hqAccountNumber: partnerForm.hqAccountNumber,
        partnerCode: partnerForm.partnerCode,
        password: partnerForm.password
      })

      if (response.success) {
        const userData = response.data
        showSuccess(`${userData.companyName} 협력사 로그인 성공!`)

        // 초기 비밀번호 변경 여부 확인
        if (userData.userType === 'PARTNER' && userData.passwordChanged === false) {
          // 초기 비밀번호 변경 여부 확인 다이얼로그 표시
          const shouldChangePassword = confirm(
            '보안을 위해 초기 비밀번호를 변경하시겠습니까?\n\n' +
              '지금 변경: 비밀번호 변경 페이지로 이동\n' +
              '나중에 변경: 대시보드로 이동 (다음 로그인 시 다시 요청)'
          )

          if (shouldChangePassword) {
            // 비밀번호 변경 페이지로 이동 (사용자 정보 포함)
            router.push(
              `/change-password?accountNumber=${encodeURIComponent(
                userData.accountNumber
              )}&companyName=${encodeURIComponent(userData.companyName)}`
            )
          } else {
            // 나중에 변경하고 대시보드로 이동
            const redirectPath = searchParams.get('redirect') || '/dashboard'
            router.push(redirectPath)
          }
        } else {
          // 일반 대시보드로 이동
          const redirectPath = searchParams.get('redirect') || '/dashboard'

          // 토스트 메시지 표시 시간 확보를 위한 지연
          setTimeout(() => {
            router.push(redirectPath)
          }, 800)
        }
      }
    } catch (error: unknown) {
      console.error('협력사 로그인 실패:', error)

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {status?: number; data?: {message?: string}}
        }

        if (axiosError.response?.status === 401) {
          showError('계정번호, 이메일 또는 비밀번호가 올바르지 않습니다')
        } else if (axiosError.response?.status === 404) {
          showError('존재하지 않는 협력사 계정입니다')
        } else {
          const errorMessage =
            axiosError.response?.data?.message || '로그인에 실패했습니다'
          showError(errorMessage)
        }
      } else {
        showError('로그인에 실패했습니다')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 bg-white">
      {/* 네비게이션 */}
      <nav className="relative z-10 px-6 py-6 bg-white">
        <div className="flex justify-between items-center mx-auto max-w-6xl">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex justify-center items-center w-8 h-8 bg-blue-500 rounded-lg">
              <span className="text-sm font-bold text-white">N</span>
            </div>
            <span className="text-xl font-bold text-gray-900">NSMM</span>
          </Link>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="flex relative flex-grow justify-center items-center px-6 py-12 bg-white">
        {/* 플로팅 장식 요소들 */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-blue-100 rounded-2xl opacity-40 transform rotate-12"></div>
        <div className="absolute right-24 top-32 w-12 h-12 bg-green-100 rounded-xl opacity-30 transform -rotate-6"></div>
        <div className="absolute bottom-24 left-32 w-20 h-20 bg-purple-100 rounded-lg transform rotate-45 opacity-35"></div>

        <div className="mx-auto w-full max-w-md">
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
            {/* 헤더 섹션 */}
            <div className="mb-8 text-center">
              <h1 className="mb-3 text-4xl font-bold text-gray-900">로그인</h1>
              <p className="text-lg text-gray-600">
                ESG 관리 플랫폼에 오신 것을 환영합니다
              </p>
              <div className="flex justify-center items-center mt-4 text-sm text-gray-500">
                <Shield className="mr-2 w-4 h-4 text-blue-500" />
                <span>안전하고 신뢰할 수 있는 플랫폼</span>
              </div>
            </div>

            {/* 사용자 타입 선택 */}
            <div className="mb-8">
              <div className="grid grid-cols-2 p-1 w-full bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUserType('HEADQUARTERS')}
                  className={`rounded-lg py-3 text-sm font-medium transition-all duration-300 ${
                    userType === 'HEADQUARTERS'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}>
                  본사
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('PARTNER')}
                  className={`rounded-lg py-3 text-sm font-medium transition-all duration-300 ${
                    userType === 'PARTNER'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}>
                  협력사
                </button>
              </div>
            </div>

            {/* 로그인 폼 */}
            {userType === 'HEADQUARTERS' ? (
              <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="mb-8 text-center">
                  <h2 className="mb-2 text-2xl font-bold text-gray-900">본사 로그인</h2>
                  <p className="text-gray-600">본사 계정으로 로그인하세요</p>
                </div>

                <form onSubmit={handleHeadquartersLogin} className="space-y-6">
                  <div>
                    <InputWithIcon
                      header="이메일"
                      placeholder="이메일을 입력하세요"
                      icon={<Mail className="w-4 h-4 text-gray-400" />}
                      value={headquartersForm.email}
                      onChange={e =>
                        setHeadquartersForm(prev => ({...prev, email: e.target.value}))
                      }
                      disabled={isLoading}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <InputWithIcon
                      header="비밀번호"
                      placeholder="비밀번호를 입력하세요"
                      icon={<Lock className="w-4 h-4 text-gray-400" />}
                      type="password"
                      value={headquartersForm.password}
                      onChange={e =>
                        setHeadquartersForm(prev => ({...prev, password: e.target.value}))
                      }
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex gap-2 justify-center items-center px-8 py-2 w-full text-lg font-semibold text-white bg-blue-500 rounded-xl shadow-sm transition-all duration-300 transform hover:bg-blue-600 hover:scale-105 hover:shadow-sm-sm disabled:opacity-50 disabled:transform-none">
                    {isLoading ? '로그인 중...' : '로그인'}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center">
                    <span className="text-gray-500">계정이 없으신가요? </span>
                    <Link
                      href="/signup"
                      className="font-medium text-blue-500 transition-colors duration-200 hover:text-blue-600">
                      계정 생성
                    </Link>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield className="mr-2 w-4 h-4 text-blue-500" />
                      <span>본사 계정으로 전체 시스템을 관리할 수 있습니다</span>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="mb-8 text-center">
                  <h2 className="mb-2 text-2xl font-bold text-gray-900">협력사 로그인</h2>
                  <p className="text-gray-600">협력사 계정으로 로그인하세요</p>
                </div>

                <form onSubmit={handlePartnerLogin} className="space-y-6">
                  <div>
                    <InputWithIcon
                      header="본사 계정번호"
                      placeholder="본사 계정번호를 입력하세요 (예: 2500101700)"
                      icon={<Building className="w-4 h-4 text-gray-400" />}
                      value={partnerForm.hqAccountNumber}
                      onChange={e =>
                        setPartnerForm(prev => ({
                          ...prev,
                          hqAccountNumber: e.target.value
                        }))
                      }
                      disabled={isLoading}
                      required
                      autoComplete="username"
                    />
                  </div>

                  <div>
                    <InputWithIcon
                      header="협력사 아이디"
                      placeholder="협력사 아이디를 입력하세요 (예: L1-001)"
                      icon={<Mail className="w-4 h-4 text-gray-400" />}
                      value={partnerForm.partnerCode}
                      onChange={e =>
                        setPartnerForm(prev => ({...prev, partnerCode: e.target.value}))
                      }
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div>
                    <InputWithIcon
                      header="비밀번호"
                      placeholder="비밀번호를 입력하세요"
                      icon={<Lock className="w-4 h-4 text-gray-400" />}
                      type="password"
                      value={partnerForm.password}
                      onChange={e =>
                        setPartnerForm(prev => ({...prev, password: e.target.value}))
                      }
                      disabled={isLoading}
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex gap-2 justify-center items-center px-8 py-2 w-full text-lg font-semibold text-white bg-blue-500 rounded-xl shadow-sm transition-all duration-300 transform hover:bg-blue-600 hover:scale-105 hover:shadow-sm disabled:opacity-50 disabled:transform-none">
                    {isLoading ? '로그인 중...' : '로그인'}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield className="mr-2 w-4 h-4 text-amber-500" />
                      <span>협력사 계정은 본사에서 생성됩니다</span>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="px-6 py-8 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between items-center md:flex-row">
            <div className="flex items-center mb-4 space-x-2 md:mb-0">
              <div className="flex justify-center items-center w-6 h-6 bg-blue-500 rounded-lg">
                <span className="text-xs font-bold text-white">N</span>
              </div>
              <span className="text-lg font-bold text-gray-900">NSMM</span>
            </div>
            <p className="text-sm text-gray-500">© 2024 NSMM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
