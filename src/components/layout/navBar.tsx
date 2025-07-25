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
        // 서버에서 사용자 정보 조회 (에러 발생하지 않음)
        const response = await authService.getCurrentUserByType()
        if (response && response.success && response.data) {
          setUser(response.data)
          setIsAuthenticated(true)
        } else {
          // 인증되지 않은 상태 (정상적인 경우)
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        // 예상치 못한 네트워크 오류 등만 여기서 처리
        console.warn('사용자 정보 조회 중 네트워크 오류:', error)
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
    <div className="fixed top-0 left-0 z-50 w-full h-20 p-4 bg-white shadow-sm">
      <div className="flex flex-row items-center justify-between w-full h-full">
        <Link href="/" className="flex flex-row items-center w-full gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg">
            <span className="text-sm font-bold text-white">N</span>
          </div>
          <span className="text-xl font-bold text-gray-900">NSMM</span>
        </Link>

        <div className="flex flex-row items-center flex-shrink-0 gap-4">
          {isAuthenticated && user ? (
            <>
              {/* 사용자 정보 표시 */}
              <div className="flex flex-col justify-center px-3 py-1 transition-all duration-200 border border-blue-100 rounded-lg shadow-sm bg-gradient-to-br from-blue-50 to-white hover:shadow-md hover:bg-gradient-to-br hover:from-blue-100 hover:to-blue-50">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <User className="flex-shrink-0 w-4 h-4 text-blue-600" />
                  </div>
                  <span
                    className="font-semibold text-blue-900 truncate"
                    title={user.companyName}>
                    {user.companyName}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                    {user.userType === 'HEADQUARTERS' ? '본사' : '협력사'}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {user.accountNumber}
                  </span>
                </div>
              </div>

              {/* 로그아웃 버튼 */}
              <button
                onClick={handleLogout}
                className="flex items-center flex-shrink-0 gap-2 px-4 py-3 text-sm font-medium text-red-700 bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg shadow-sm transition-all duration-200 whitespace-nowrap hover:shadow-md hover:bg-gradient-to-br hover:from-red-100 hover:to-orange-100 hover:-translate-y-0.5 hover:text-red-800"
                title="로그아웃">
                <div className="flex items-center justify-center w-5 h-5 bg-red-100 rounded-full">
                  <LogOut className="flex-shrink-0 w-3 h-3 text-red-600" />
                </div>
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
