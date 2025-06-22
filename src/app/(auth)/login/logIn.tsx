'use client'

import Link from 'next/link'
import InputWithIcon from '@/components/inputWithIcon'
import {Mail, Lock, Building, ArrowRight, Sparkles, Shield} from 'lucide-react'
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
    <div className="flex overflow-hidden relative flex-col p-4 w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 배경 장식 요소들 */}
      <div className="overflow-hidden absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br rounded-full blur-3xl from-blue-400/20 to-purple-400/20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr rounded-full blur-3xl from-indigo-400/20 to-cyan-400/20"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 from-purple-400/10 to-pink-400/10"></div>
      </div>

      {/* 중앙 정렬을 위한 컨테이너 */}
      <div className="flex relative z-10 flex-1 justify-center items-center min-h-screen">
        <div
          className={`transition-all duration-1000 w-full max-w-md ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
          {/* 헤더 섹션 */}
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4"></div>
            <h1 className="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700">
              NSMM
            </h1>
            <p className="font-medium text-gray-600">
              지속가능한 미래를 위한 ESG 관리 플랫폼
            </p>
            <div className="flex justify-center items-center mt-3 text-sm text-gray-500">
              <Shield className="mr-2 w-4 h-4" />
              <span>안전하고 신뢰할 수 있는 플랫폼</span>
            </div>
          </div>

          {/* 사용자 타입 선택 */}
          <div className="mb-6">
            <div className="grid grid-cols-2 p-1 w-full h-12 rounded-xl border shadow-sm backdrop-blur-sm bg-white/60 border-white/20">
              <button
                type="button"
                onClick={() => setUserType('HEADQUARTERS')}
                className={`rounded-lg py-2.5 text-sm font-medium transition-all duration-300 h-10 flex items-center justify-center hover:bg-white/50 ${
                  userType === 'HEADQUARTERS'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm'
                    : 'text-gray-700'
                }`}>
                본사
              </button>
              <button
                type="button"
                onClick={() => setUserType('PARTNER')}
                className={`rounded-lg py-2.5 text-sm font-medium transition-all duration-300 h-10 flex items-center justify-center hover:bg-white/50 ${
                  userType === 'PARTNER'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm'
                    : 'text-gray-700'
                }`}>
                협력사
              </button>
            </div>
          </div>

          {/* 로그인 폼 */}
          {userType === 'HEADQUARTERS' ? (
            <div className="p-8 rounded-2xl border shadow-sm backdrop-blur-md bg-white/80 border-white/20">
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">본사 로그인</h2>
                <p className="text-sm text-gray-600">본사 계정으로 로그인하세요</p>
              </div>

              <form onSubmit={handleHeadquartersLogin} className="space-y-6">
                <div className="space-y-1">
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

                <div className="space-y-1">
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

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-sm disabled:cursor-not-allowed disabled:transform-none">
                    {isLoading ? '로그인 중...' : '로그인'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <div className="flex justify-center items-center space-x-2 text-sm">
                    <span className="text-gray-500">계정이 없으신가요?</span>
                    <Link href="/signup">
                      <span className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700 hover:underline">
                        계정 생성
                      </span>
                    </Link>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="p-3 text-sm text-gray-600 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-center items-center">
                      <Shield className="mr-2 w-4 h-4 text-blue-600" />
                      <span>본사 계정으로 전체 시스템을 관리할 수 있습니다</span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-8 rounded-2xl border shadow-sm backdrop-blur-md bg-white/80 border-white/20">
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">협력사 로그인</h2>
                <p className="text-sm text-gray-600">협력사 계정으로 로그인하세요</p>
              </div>

              <form onSubmit={handlePartnerLogin} className="space-y-6">
                <div className="space-y-1">
                  <InputWithIcon
                    header="본사 계정번호"
                    placeholder="본사 계정번호를 입력하세요 (예: 2500101700)"
                    icon={<Building className="w-4 h-4 text-gray-400" />}
                    value={partnerForm.hqAccountNumber}
                    onChange={e =>
                      setPartnerForm(prev => ({...prev, hqAccountNumber: e.target.value}))
                    }
                    disabled={isLoading}
                    required
                    autoComplete="username"
                  />
                </div>

                <div className="space-y-1">
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

                <div className="space-y-1">
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

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-sm disabled:cursor-not-allowed disabled:transform-none">
                    {isLoading ? '로그인 중...' : '로그인'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-4 text-center">
                  <div className="p-3 text-sm text-gray-600 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex justify-center items-center">
                      <Shield className="mr-2 w-4 h-4 text-amber-600" />
                      <span>협력사 계정은 본사에서 생성됩니다</span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
