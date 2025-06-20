import {EarthLock, LogOut, User} from 'lucide-react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {useEffect, useState} from 'react'
import authService, {UserInfo} from '@/services/authService'
import toast from '@/util/toast'

/**
 * 네비게이션 바 컴포넌트
 *
 * 기능: 사용자 정보 표시, 로그인/로그아웃 버튼, 브랜드 로고
 * 인증: 서버에서 사용자 정보를 실시간으로 가져와 표시
 */
export default function NavigationBar() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 컴포넌트 마운트 시 서버에서 사용자 정보 가져오기
    const fetchUserInfo = async () => {
      try {
        // 쿠키 존재 여부 확인 없이 바로 서버에서 사용자 정보 조회
        const response = await authService.getCurrentUserByType()
        if (response && response.success && response.data) {
          setUser(response.data)
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('서버 연결 실패:', error)
        setUser(null)
        setIsAuthenticated(false)
      }
    }

    fetchUserInfo()
  }, [])

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await authService.logout()
      setUser(null)
      setIsAuthenticated(false)
      toast.success('안전하게 로그아웃되었습니다.')
      router.push('/login')
    } catch (error) {
      console.error('로그아웃 실패:', error)
      toast.error('로그아웃 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="fixed top-0 left-0 z-50 p-4 w-full h-20 bg-white shadow-sm">
      <div className="flex flex-row justify-between items-center w-full h-full">
        <Link href="/" className="flex flex-row gap-2 items-center w-full">
          <EarthLock className="w-10 h-10 text-blue-400" />
          <span className="text-2xl font-bold text-blue-400">NSMM</span>
        </Link>

        <div className="flex flex-row flex-shrink-0 gap-4 items-center">
          {isAuthenticated && user ? (
            <>
              {/* 사용자 정보 표시 */}
              <div className="flex flex-col items-end text-sm max-w-[200px]">
                <div className="flex gap-2 items-center">
                  <User className="flex-shrink-0 w-4 h-4 text-gray-500" />
                  <span
                    className="font-medium text-gray-700 truncate"
                    title={user.companyName}>
                    {user.companyName}
                  </span>
                </div>
                <div className="w-full text-xs text-right text-gray-500 truncate">
                  {user.userType === 'HEADQUARTERS' ? '본사' : '협력사'} •{' '}
                  {user.accountNumber}
                </div>
              </div>

              {/* 로그아웃 버튼 */}
              <button
                onClick={handleLogout}
                className="flex flex-shrink-0 gap-2 items-center px-4 py-3 text-sm font-medium text-gray-600 whitespace-nowrap bg-gray-100 rounded-lg transition-colors duration-200 hover:bg-gray-200 hover:text-gray-700"
                title="로그아웃">
                <LogOut className="flex-shrink-0 w-4 h-4" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </>
          ) : (
            <div className="flex flex-row flex-shrink-0 gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-blue-600 whitespace-nowrap bg-blue-50 rounded-lg transition-colors duration-200 hover:bg-blue-100">
                로그인
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium text-white whitespace-nowrap bg-blue-600 rounded-lg transition-colors duration-200 hover:bg-blue-700">
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
