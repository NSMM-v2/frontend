'use client'

import {useState} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {AlertCircle, CheckCircle, Lock, Shield, Key} from 'lucide-react'
import authService from '@/services/authService'

/**
 * 협력사 초기 비밀번호 변경 페이지
 *
 * 기능:
 * - 초기 비밀번호를 새로운 비밀번호로 변경
 * - 비밀번호 정책 검증
 * - 변경 후 대시보드로 이동
 */
export default function ChangePasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // authService는 이미 인스턴스로 import됨

  // URL 파라미터에서 사용자 정보 추출
  const accountNumber = searchParams.get('accountNumber') || ''
  const companyName = searchParams.get('companyName') || ''

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 비밀번호 정책 검증
  const validatePassword = (password: string): string[] => {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('최소 8자 이상이어야 합니다')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('대문자를 포함해야 합니다')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('소문자를 포함해야 합니다')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('숫자를 포함해야 합니다')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('특수문자를 포함해야 합니다')
    }

    return errors
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target
    setFormData(prev => ({...prev, [name]: value}))

    // 에러 메시지 초기화
    if (error) setError('')
    if (success) setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // 새 비밀번호 검증
      const passwordErrors = validatePassword(formData.newPassword)
      if (passwordErrors.length > 0) {
        setError(`비밀번호 정책 위반: ${passwordErrors.join(', ')}`)
        return
      }

      // 비밀번호 확인
      if (formData.newPassword !== formData.confirmPassword) {
        setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다')
        return
      }

      // 비밀번호 변경 API 호출
      const response = await authService.changePartnerInitialPassword(
        accountNumber,
        '', // 이메일은 JWT에서 확인
        formData.currentPassword,
        formData.newPassword
      )

      if (response.success) {
        setSuccess('비밀번호가 성공적으로 변경되었습니다')

        // 3초 후 대시보드로 이동
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        setError(response.message || '비밀번호 변경에 실패했습니다')
      }
    } catch (error: any) {
      console.error('비밀번호 변경 오류:', error)
      setError(error.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    // 나중에 변경하고 대시보드로 이동
    router.push('/dashboard')
  }

  return (
    <div className="flex overflow-hidden relative flex-col p-4 w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 배경 장식 요소들 */}
      <div className="overflow-hidden absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br rounded-full blur-3xl from-blue-400/20 to-purple-400/20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr rounded-full blur-3xl from-indigo-400/20 to-cyan-400/20"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 from-purple-400/10 to-pink-400/10"></div>
      </div>

      {/* 중앙 정렬을 위한 컨테이너 */}
      <div className="flex relative z-10 flex-1 justify-center items-center min-h-screen">
        <Card className="w-full max-w-md shadow-sm backdrop-blur-sm bg-white/90 border-white/20">
          <CardHeader className="pt-8 space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-sm">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              비밀번호 변경
            </CardTitle>
            <p className="text-sm text-center text-gray-600">
              보안을 위해 초기 비밀번호를 변경해주세요
            </p>
            <div className="p-3 text-center bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm font-medium text-blue-700">{companyName}</p>
              <p className="text-xs text-blue-500">{accountNumber}</p>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 text-green-800 border-green-200">
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>
                  {success} 잠시 후 대시보드로 이동합니다...
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="currentPassword"
                  className="flex gap-2 items-center text-sm font-medium text-gray-700">
                  <Lock className="w-4 h-4 text-gray-500" />
                  현재 비밀번호
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="현재 비밀번호를 입력하세요"
                    className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="newPassword"
                  className="flex gap-2 items-center text-sm font-medium text-gray-700">
                  <Key className="w-4 h-4 text-gray-500" />새 비밀번호
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="새 비밀번호를 입력하세요"
                    className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                    required
                  />
                  <Key className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                </div>
                <div className="p-2 bg-gray-50 rounded-md">
                  <p className="text-xs text-gray-600">
                    • 8자 이상 • 대소문자 • 숫자 • 특수문자 포함
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="flex gap-2 items-center text-sm font-medium text-gray-700">
                  <Shield className="w-4 h-4 text-gray-500" />새 비밀번호 확인
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="새 비밀번호를 다시 입력하세요"
                    className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                    required
                  />
                  <Shield className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                </div>
              </div>

              <div className="flex pt-2 space-x-3">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-sm"
                  disabled={isLoading || success !== ''}>
                  {isLoading ? (
                    <div className="flex gap-2 items-center">
                      <div className="w-4 h-4 rounded-full border-2 animate-spin border-white/30 border-t-white"></div>
                      변경 중...
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <Key className="w-4 h-4" />
                      비밀번호 변경
                    </div>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isLoading || success !== ''}
                  className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
                  나중에 변경
                </Button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-xs font-medium text-amber-700">
                  💡 비밀번호를 변경하지 않으면 다음 로그인 시 다시 요청됩니다
                </p>
              </div>
            </div>
            <CardContent className="pb-8"></CardContent>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
