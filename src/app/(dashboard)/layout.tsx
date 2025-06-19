'use client'

import NavigationBar from '@/components/layout/navBar'
import SideBar from '@/components/layout/sideBar'
import {useRouter} from 'next/navigation'
import {useEffect, useState} from 'react'
import authService from '@/services/authService'

interface UserInfo {
  accountNumber: string
  companyName: string
  userType: 'HEADQUARTERS' | 'PARTNER'
  level?: number
  name?: string
  email?: string
  department?: string
  position?: string
}

// layout.tsx
export default function Layout({children}: {children: React.ReactNode}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const router = useRouter()

  useEffect(() => {
    // 컴포넌트 마운트 시 인증 상태 확인
    const verifyAuth = async () => {
      try {
        console.log('🔍 대시보드 레이아웃: 인증 상태 확인 시작')

        // 1. JWT 쿠키 존재 여부 빠른 확인
        if (!authService.hasJwtCookie()) {
          console.log('❌ JWT 쿠키 없음 - 로그인 페이지로 이동')
          router.push('/login?message=auth_required')
          return
        }

        console.log('✅ JWT 쿠키 발견 - 서버 검증 시작')

        // 2. 서버에 인증 상태 및 사용자 정보 확인
        const userResponse = await authService.getCurrentUserByType()

        if (userResponse.success && userResponse.data) {
          console.log(
            '✅ 인증 성공:',
            userResponse.data.companyName,
            userResponse.data.userType
          )
          setUserInfo(userResponse.data)
          setIsAuthenticated(true)
        } else {
          console.log('❌ 서버 응답 실패')
          router.push('/login?message=auth_required')
        }
      } catch (error: unknown) {
        console.error('❌ 인증 확인 실패:', error)

        // 인증 실패 시 쿠키 정리 후 로그인 페이지로
        document.cookie =
          'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; HttpOnly; Secure; SameSite=Strict'
        router.push('/login?message=session_expired')
      } finally {
        setIsLoading(false)
      }
    }

    verifyAuth()
  }, [router])

  // 로딩 중이거나 인증되지 않은 경우 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="mx-auto mb-4 w-8 h-8 rounded-full border-4 border-blue-600 animate-spin border-t-transparent"></div>
          <p className="text-gray-600">인증 확인 중...</p>
          {userInfo && (
            <p className="mt-2 text-sm text-gray-500">
              {userInfo.companyName} (
              {userInfo.userType === 'HEADQUARTERS' ? '본사' : '협력사'})
            </p>
          )}
        </div>
      </div>
    )
  }

  // 인증되지 않은 경우 아무것도 렌더링하지 않음 (리다이렉트 처리 중)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationBar />
      <SideBar />
      <div className="flex flex-1 mt-20 w-full max-w-screen-lg">{children}</div>
    </div>
  )
}
