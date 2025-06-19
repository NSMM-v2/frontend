'use client'

import Link from 'next/link'
import {Lock, Mail, Building, ArrowRight, Sparkles, Shield} from 'lucide-react'
import InputWithIcon from '@/components/inputWithIcon'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {useState, useEffect} from 'react'

export default function Login() {
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
          className={`transition-all duration-1000 w-full max-w-md ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
          {/* 헤더 섹션 */}
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-sm">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700">
              ESG Manager
            </h1>
            <p className="font-medium text-gray-600">
              지속가능한 미래를 위한 ESG 관리 플랫폼
            </p>
            <div className="flex justify-center items-center mt-3 text-sm text-gray-500">
              <Shield className="mr-2 w-4 h-4" />
              <span>안전하고 신뢰할 수 있는 플랫폼</span>
            </div>
          </div>

          <Tabs defaultValue="headQuarters" className="w-full">
            {/* Tab 선택 버튼을 최상단에 배치 */}
            <div className="mb-6">
              <TabsList className="grid grid-cols-2 p-1 w-full h-12 rounded-xl border shadow-sm backdrop-blur-sm bg-white/60 border-white/20">
                <TabsTrigger
                  value="headQuarters"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg py-2.5 text-sm font-medium transition-all duration-300 h-10 flex items-center justify-center hover:bg-white/50">
                  본사
                </TabsTrigger>
                <TabsTrigger
                  value="partner"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg py-2.5 text-sm font-medium transition-all duration-300 h-10 flex items-center justify-center hover:bg-white/50">
                  협력사
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="headQuarters" className="mt-0">
              <div className="p-8 rounded-2xl border shadow-sm backdrop-blur-md bg-white/80 border-white/20">
                <div className="mb-8 text-center">
                  <h2 className="mb-2 text-2xl font-bold text-gray-900">본사 로그인</h2>
                  <p className="text-sm text-gray-600">본사 계정으로 로그인하세요</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1">
                    <InputWithIcon
                      header="이메일"
                      placeholder="이메일을 입력하세요"
                      icon={<Mail className="w-4 h-4 text-gray-400" />}
                    />
                  </div>

                  <div className="space-y-1">
                    <InputWithIcon
                      header="비밀번호"
                      placeholder="비밀번호를 입력하세요"
                      icon={<Lock className="w-4 h-4 text-gray-400" />}
                      type="password"
                    />
                  </div>

                  <div className="pt-2">
                    <Link href="/dashboard" className="block">
                      <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-sm">
                        로그인
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>

                  <div className="pt-4 text-center">
                    <div className="flex justify-center items-center space-x-2 text-sm">
                      <span className="text-gray-500">계정이 없으신가요?</span>
                      <Link href="/signup">
                        <span className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700 hover:underline">
                          계정 생성
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="partner" className="mt-0">
              <div className="p-8 rounded-2xl border shadow-sm backdrop-blur-md bg-white/80 border-white/20">
                <div className="mb-8 text-center">
                  <h2 className="mb-2 text-2xl font-bold text-gray-900">협력사 로그인</h2>
                  <p className="text-sm text-gray-600">협력사 계정으로 로그인하세요</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1">
                    <InputWithIcon
                      header="계정 번호"
                      placeholder="계정 번호를 입력하세요 (예: HQ001-L1-001)"
                      icon={<Building className="w-4 h-4 text-gray-400" />}
                    />
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
                      header="비밀번호"
                      placeholder="비밀번호를 입력하세요"
                      icon={<Lock className="w-4 h-4 text-gray-400" />}
                      type="password"
                    />
                  </div>

                  <div className="pt-2">
                    <Link href="/dashboard" className="block">
                      <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-sm">
                        로그인
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>

                  <div className="pt-4 text-center">
                    <div className="p-3 text-sm text-gray-600 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex justify-center items-center">
                        <Shield className="mr-2 w-4 h-4 text-amber-600" />
                        <span>협력사 계정은 본사에서 생성됩니다</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
