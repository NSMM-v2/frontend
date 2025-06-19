'use client'

import Link from 'next/link'
import InputWithIcon from '@/components/inputWithIcon'
import {
  Mail,
  User,
  Phone,
  Building,
  Briefcase,
  Lock,
  CheckCircle,
  ArrowRight,
  Sparkles,
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
          className={`transition-all duration-1000 w-full max-w-lg ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
          {/* 헤더 섹션 */}
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-sm">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700">
              본사 회원가입
            </h1>
            <p className="font-medium text-gray-600">
              ESG Manager에 오신 것을 환영합니다
            </p>
            <div className="flex justify-center items-center mt-3 text-sm text-gray-500">
              <Shield className="mr-2 w-4 h-4" />
              <span>안전하고 신뢰할 수 있는 플랫폼</span>
            </div>
          </div>

          {/* 회원가입 폼 */}
          <div className="p-8 rounded-2xl border shadow-sm backdrop-blur-md bg-white/80 border-white/20">
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
                  placeholder="이메일을 입력하세요 (예: user@company.com)"
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
                    placeholder="전화번호를 입력하세요 (예: 010-1234-5678)"
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
                    icon={<MapPin className="w-4 h-4 text-gray-400" />}
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
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-sm disabled:cursor-not-allowed disabled:transform-none">
                  {isLoading ? '회원가입 중...' : '회원가입'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-4 text-center">
                <div className="flex justify-center items-center space-x-2 text-sm">
                  <span className="text-gray-500">이미 계정이 있으신가요?</span>
                  <Link href="/login">
                    <span className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700 hover:underline">
                      로그인
                    </span>
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
