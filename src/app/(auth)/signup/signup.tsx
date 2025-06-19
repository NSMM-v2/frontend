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

export default function SignUp() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

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
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <InputWithIcon
                    header="이름"
                    placeholder="이름을 입력하세요"
                    icon={<User className="w-4 h-4 text-gray-400" />}
                  />
                </div>
                <div className="space-y-1">
                  <InputWithIcon
                    header="직급"
                    placeholder="직급을 입력하세요"
                    icon={<Briefcase className="w-4 h-4 text-gray-400" />}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <InputWithIcon
                  header="이메일"
                  placeholder="이메일을 입력하세요"
                  icon={<Mail className="w-4 h-4 text-gray-400" />}
                />
              </div>

              <div className="space-y-1">
                <InputWithIcon
                  header="회사명"
                  placeholder="회사명을 입력하세요"
                  icon={<Building className="w-4 h-4 text-gray-400" />}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <InputWithIcon
                    header="전화번호"
                    placeholder="전화번호를 입력하세요"
                    icon={<Phone className="w-4 h-4 text-gray-400" />}
                  />
                </div>
                <div className="space-y-1">
                  <InputWithIcon
                    header="부서"
                    placeholder="부서를 입력하세요"
                    icon={<MapPin className="w-4 h-4 text-gray-400" />}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <InputWithIcon
                  header="비밀번호"
                  placeholder="비밀번호를 입력하세요"
                  icon={<Lock className="w-4 h-4 text-gray-400" />}
                  type="password"
                />
              </div>

              <div className="space-y-1">
                <InputWithIcon
                  header="비밀번호 확인"
                  placeholder="비밀번호를 다시 입력하세요"
                  icon={<CheckCircle className="w-4 h-4 text-gray-400" />}
                  type="password"
                />
              </div>

              <div className="pt-2">
                <Link href="/dashboard" className="block">
                  <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-sm">
                    회원가입
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
