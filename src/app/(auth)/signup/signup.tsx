'use client'

import Link from 'next/link'
import InputWithIcon from '@/components/inputWithIcon'
import {
  Mail,
  User,
  Phone,
  Building,
  Building2,
  Briefcase,
  Lock,
  CheckCircle,
  ArrowRight,
  Shield,
  MapPin
} from 'lucide-react'
import {useState, useEffect} from 'react'
import {useRouter} from 'next/navigation'
import api from '@/lib/axios'
import {showSuccess, showError} from '@/util/toast'
import authService from '@/services/authService'

export default function SignUp() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // 회원가입 폼 상태
  const [signupForm, setSignupForm] = useState({
    name: '',
    position: '',
    email: '',
    companyName: '',
    phone: '',
    department: '',
    address: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // 입력값 변경 핸들러
  const handleInputChange =
    (field: keyof typeof signupForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setSignupForm(prev => ({...prev, [field]: e.target.value}))
    }

  // 이메일 유효성 검사
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  // 전화번호 유효성 검사
  const validatePhone = (phone: string): boolean => {
    // 한국 전화번호 패턴: 010-1234-5678, 02-123-4567, 031-123-4567 등
    const phoneRegex =
      /^(010|011|016|017|018|019)-?\d{3,4}-?\d{4}$|^(02|031|032|033|041|042|043|044|051|052|053|054|055|061|062|063|064)-?\d{3,4}-?\d{4}$/
    const cleanPhone = phone.replace(/[^0-9]/g, '') // 숫자만 추출

    // 휴대폰 번호 (11자리) 또는 일반 전화번호 (9-11자리)
    if (cleanPhone.length === 11 && cleanPhone.startsWith('010')) return true
    if (cleanPhone.length >= 9 && cleanPhone.length <= 11) return true

    return phoneRegex.test(phone)
  }

  // 비밀번호 강도 검사
  const validatePassword = (password: string): {isValid: boolean; message: string} => {
    if (password.length < 8) {
      return {isValid: false, message: '비밀번호는 최소 8자 이상이어야 합니다.'}
    }

    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    const criteriaMet = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(
      Boolean
    ).length

    if (criteriaMet < 3) {
      return {
        isValid: false,
        message:
          '비밀번호는 대문자, 소문자, 숫자, 특수문자 중 최소 3가지를 포함해야 합니다.'
      }
    }

    return {isValid: true, message: ''}
  }

  // 폼 유효성 검사
  const validateForm = () => {
    const {
      name,
      position,
      email,
      companyName,
      phone,
      department,
      address,
      password,
      confirmPassword
    } = signupForm

    // 모든 필드 필수 검사
    if (!name.trim()) {
      showError('이름을 입력해주세요.')
      return false
    }

    if (!position.trim()) {
      showError('직급을 입력해주세요.')
      return false
    }

    if (!email.trim()) {
      showError('이메일을 입력해주세요.')
      return false
    }

    if (!validateEmail(email)) {
      showError('올바른 이메일 형식을 입력해주세요. (예: user@company.com)')
      return false
    }

    if (!companyName.trim()) {
      showError('회사명을 입력해주세요.')
      return false
    }

    if (!phone.trim()) {
      showError('전화번호를 입력해주세요.')
      return false
    }

    if (!validatePhone(phone)) {
      showError('올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)')
      return false
    }

    if (!department.trim()) {
      showError('부서를 입력해주세요.')
      return false
    }

    if (!address.trim()) {
      showError('주소를 입력해주세요.')
      return false
    }

    if (!password) {
      showError('비밀번호를 입력해주세요.')
      return false
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      showError(passwordValidation.message)
      return false
    }

    if (!confirmPassword) {
      showError('비밀번호 확인을 입력해주세요.')
      return false
    }

    if (password !== confirmPassword) {
      showError('비밀번호가 일치하지 않습니다.')
      return false
    }

    return true
  }

  // 회원가입 처리
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await authService.registerHeadquarters({
        name: signupForm.name.trim(),
        position: signupForm.position.trim(),
        email: signupForm.email.trim().toLowerCase(),
        companyName: signupForm.companyName.trim(),
        phone: signupForm.phone.trim(),
        department: signupForm.department.trim(),
        address: signupForm.address.trim(),
        password: signupForm.password
      })

      if (response.success) {
        showSuccess('회원가입이 성공적으로 완료되었습니다!')
        router.push('/login')
      }
    } catch (error: any) {
      console.error('회원가입 실패:', error)
      const errorMessage = error.response?.data?.message || '회원가입에 실패했습니다.'
      showError(errorMessage)
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
        <div className="absolute right-40 top-60 w-8 h-8 bg-orange-100 rounded-lg opacity-25 transform rotate-12"></div>
        <div className="absolute right-20 bottom-40 w-14 h-14 bg-green-100 rounded-xl opacity-30 transform -rotate-12"></div>

        <div className="mx-auto w-full max-w-2xl">
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
            {/* 헤더 섹션 */}
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">회원가입</h1>
              <p className="text-lg text-gray-600">NSMM과 함께 ESG 관리를 시작하세요</p>
              <div className="flex justify-center items-center mt-4 text-sm text-gray-500">
                <Shield className="mr-2 w-4 h-4 text-blue-500" />
                <span>안전하고 신뢰할 수 있는 플랫폼</span>
              </div>
            </div>

            {/* 회원가입 폼 */}
            <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <form onSubmit={handleSignup} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <InputWithIcon
                      header="이름"
                      placeholder="이름을 입력하세요"
                      icon={<User className="w-4 h-4 text-gray-400" />}
                      value={signupForm.name}
                      onChange={handleInputChange('name')}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <InputWithIcon
                      header="직급"
                      placeholder="직급을 입력하세요"
                      icon={<Briefcase className="w-4 h-4 text-gray-400" />}
                      value={signupForm.position}
                      onChange={handleInputChange('position')}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <InputWithIcon
                    header="이메일"
                    placeholder="이메일을 입력하세요"
                    icon={<Mail className="w-4 h-4 text-gray-400" />}
                    value={signupForm.email}
                    onChange={handleInputChange('email')}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <InputWithIcon
                    header="회사명"
                    placeholder="회사명을 입력하세요"
                    icon={<Building className="w-4 h-4 text-gray-400" />}
                    value={signupForm.companyName}
                    onChange={handleInputChange('companyName')}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <InputWithIcon
                      header="전화번호"
                      placeholder="전화번호를 입력하세요"
                      icon={<Phone className="w-4 h-4 text-gray-400" />}
                      value={signupForm.phone}
                      onChange={handleInputChange('phone')}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <InputWithIcon
                      header="부서"
                      placeholder="부서를 입력하세요"
                      icon={<Building2 className="w-4 h-4 text-gray-400" />}
                      value={signupForm.department}
                      onChange={handleInputChange('department')}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <InputWithIcon
                    header="주소"
                    placeholder="주소를 입력하세요"
                    icon={<MapPin className="w-4 h-4 text-gray-400" />}
                    value={signupForm.address}
                    onChange={handleInputChange('address')}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <InputWithIcon
                    header="비밀번호"
                    placeholder="비밀번호를 입력하세요 (최소 8자, 대소문자+숫자+특수문자 조합)"
                    icon={<Lock className="w-4 h-4 text-gray-400" />}
                    type="password"
                    value={signupForm.password}
                    onChange={handleInputChange('password')}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <InputWithIcon
                    header="비밀번호 확인"
                    placeholder="비밀번호를 다시 입력하세요"
                    icon={<CheckCircle className="w-4 h-4 text-gray-400" />}
                    type="password"
                    value={signupForm.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex gap-2 justify-center items-center px-8 py-4 w-full text-lg font-semibold text-white bg-blue-500 rounded-xl shadow-lg transition-all duration-300 transform hover:bg-blue-600 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed">
                    {isLoading ? '회원가입 중...' : '회원가입'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-4 text-center">
                  <div className="flex justify-center items-center space-x-2 text-sm">
                    <span className="text-gray-500">이미 계정이 있으신가요?</span>
                    <Link href="/login">
                      <span className="font-medium text-blue-500 transition-colors duration-200 hover:text-blue-600 hover:underline">
                        로그인
                      </span>
                    </Link>
                  </div>
                </div>
              </form>
            </div>
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
