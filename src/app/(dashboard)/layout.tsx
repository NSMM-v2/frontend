'use client'

import NavigationBar from '@/components/layout/navBar'
import SideBar from '@/components/layout/sideBar'
import {useRouter} from 'next/navigation'
import {useEffect, useState} from 'react'
import authService from '@/services/authService'
import toast from '@/util/toast'

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

/**
 * 대시보드 레이아웃 컴포넌트
 *
 * 기능: 인증된 사용자만 접근 가능한 대시보드 영역 레이아웃
 * 권한: 본사 또는 협력사 로그인 필요
 */
export default function Layout({children}: {children: React.ReactNode}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const router = useRouter()

  // 개발 용으로 주석 처리 실제 사용시에는 주석 해제 필요
  // 주석 처리 이유: 로그인을 안하면 대시보드로 못가기 떄문에 프론트 개발자의 편의를 위함

  // useEffect(() => {
  //   // 컴포넌트 마운트 시 서버 인증 상태 확인
  //   const verifyAuth = async () => {
  //     try {
  //       console.log('대시보드 레이아웃: 서버 인증 확인 시작')

  //       // 서버에 직접 인증 상태 및 사용자 정보 확인
  //       // 쿠키 존재 여부 확인 없이 바로 서버 검증 진행
  //       const userResponse = await authService.getCurrentUserByType()

  //       if (userResponse && userResponse.success && userResponse.data) {
  //         console.log(
  //           '서버 인증 성공:',
  //           userResponse.data.companyName,
  //           userResponse.data.userType
  //         )
  //         setUserInfo(userResponse.data)
  //         setIsAuthenticated(true)
  //       } else {
  //         console.log('인증 실패 - 로그인 페이지로 이동')

  //         // 토스트 메시지 표시
  //         toast.info('로그인이 필요합니다.')

  //         // 인증 실패 시 로그인 페이지로 이동
  //        router.push('  /login?message=session_expired')
  //       }
  //     } catch (error: unknown) {
  //       console.error('서버 연결 실패:', error)

  //       // 토스트 메시지 표시
  //       toast.error('서버 연결에 실패했습니다.')

  //       // 서버 오류 시 로그인 페이지로 이동
  //       router.push('/login?message=server_error')
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }

  //   verifyAuth()
  // }, [router])

  // 로딩 중인 경우 로딩 화면 표시
  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
  //       <div className="text-center">
  //         <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
  //         <p className="text-gray-600">인증 확인 중...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // // 인증되지 않은 경우 아무것도 렌더링하지 않음 (리다이렉트 처리 중)
  // if (!isAuthenticated || !userInfo) {
  //   return null
  // }

  return (
    <div className="flex flex-col items-center w-full min-h-screen">
      <NavigationBar />
      <SideBar />
      <div className="flex flex-1 w-full max-w-screen-sm pl-12 mt-20 md:max-w-screen-xl md:pl-0">
        {children}
      </div>
    </div>
  )
}
