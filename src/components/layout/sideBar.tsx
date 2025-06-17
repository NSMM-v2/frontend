'use client'

import {useState, useEffect} from 'react'
import {Home, FileText, Users, ChevronRight} from 'lucide-react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {motion} from 'framer-motion'
import {cn} from '@/lib/utils'

/**
 * MenuItem 컴포넌트에 필요한 props 타입 정의
 */
interface MenuItemProps {
  /** 메뉴 링크 경로 */
  href: string
  /** 메뉴 아이콘 컴포넌트 */
  icon: React.ElementType
  /** 메뉴 텍스트 */
  text: string
  /** 현재 활성화 여부 */
  isActive: boolean
  /** 하위 메뉴 포함 여부 */
  hasSubmenu?: boolean
  /** 클릭 이벤트 핸들러 */
  onClick?: () => void
  /** 하위 메뉴 열림 상태 */
  isSubmenuOpen?: boolean
}

/**
 * SubMenuItem 컴포넌트에 필요한 props 타입 정의
 */
interface SubMenuItemProps {
  /** 메뉴 링크 경로 */
  href: string
  /** 메뉴 텍스트 */
  text: string
  /** 현재 활성화 여부 */
  isActive: boolean
}

/**
 * 사이드바 컴포넌트
 * - 호버 시 확장되는 반응형 사이드바
 * - 계층적 메뉴 구조 지원
 * - 현재 활성화된 메뉴 자동 하이라이트
 * - 녹색 테마 적용 (ESG 컨셉에 맞춤)
 */
export default function SideBar() {
  // 메뉴 상태 관리
  const [openParent, setOpenParent] = useState(false)
  const [openScopeChild, setOpenScopeChild] = useState(false)
  const [openPartnerChild, setOpenPartnerChild] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()

  /**
   * 현재 경로에 따라 관련 메뉴를 자동으로 열어주는 효과
   * 컴포넌트가 마운트될 때 한 번만 실행됨
   */
  useEffect(() => {
    // 초기에 현재 경로에 맞는 메뉴 자동 오픈
    if (!isMounted) {
      if (
        pathname.startsWith('/scope1') ||
        pathname.startsWith('/scope2') ||
        pathname.startsWith('/scope3')
      ) {
        setOpenParent(true)
        setOpenScopeChild(true)
      } else if (
        pathname.startsWith('/CSDDD') ||
        pathname.startsWith('/financialRisk') ||
        pathname.startsWith('/managePartner')
      ) {
        setOpenPartnerChild(true)
      }
      setIsMounted(true)
    }
  }, [isMounted, pathname])

  // 활성화된 메뉴 상태 계산
  const isHomeActive = pathname === '/home'
  const isScopeActive =
    pathname.startsWith('/scope1') ||
    pathname.startsWith('/scope2') ||
    pathname.startsWith('/scope3')
  const isPartnerActive =
    pathname.startsWith('/financialRisk') ||
    pathname.startsWith('/managePartner') ||
    pathname.startsWith('/CSDDD')

  /**
   * 사이드바에 마우스가 들어왔을 때 실행되는 이벤트 핸들러
   * 사이드바를 확장 상태로 변경
   */
  const handleMouseEnter = () => setHovered(true)

  /**
   * 사이드바에서 마우스가 떠났을 때 실행되는 이벤트 핸들러
   * 사이드바를 축소 상태로 변경하고, 활성화되지 않은 메뉴는 닫음
   */
  const handleMouseLeave = () => {
    setHovered(false)
    if (!isScopeActive) setOpenScopeChild(false)
    if (!isPartnerActive) setOpenPartnerChild(false)

    // 활성화된 메뉴를 제외하고 모두 닫기
    if (!isScopeActive && !isPartnerActive) {
      setOpenParent(false)
    }
  }

  /**
   * 메뉴 열고 닫힐 때의 애니메이션 설정
   * height와 opacity 변화를 통한 자연스러운 전환
   */
  //   const menuVariants = {
  //     hidden: {
  //       height: 0,
  //       opacity: 0,
  //       transition: {
  //         duration: 0.2
  //       }
  //     },
  //     visible: {
  //       height: 'auto',
  //       opacity: 1,
  //       transition: {
  //         duration: 0.2
  //       }
  //     }
  //   }

  /**
   * 메인 메뉴 아이템 컴포넌트
   * 아이콘, 텍스트, 하위 메뉴 표시기를 포함
   * 녹색 테마로 스타일 변경
   * 접혀있을 때 한글이 세로로 표시되는 버그 수정
   */
  const MenuItem = ({
    href,
    icon: Icon,
    text,
    isActive,
    hasSubmenu = false,
    onClick,
    isSubmenuOpen = false
  }: MenuItemProps) => (
    <Link
      href={href || '#'}
      className={cn(
        'flex items-center py-2.5 px-4 rounded-lg group transition-all duration-200 relative',
        isActive ? 'bg-customGLight text-customGDark' : 'text-gray-600 hover:bg-gray-100',
        hovered ? 'justify-start' : 'justify-center'
      )}
      onClick={
        hasSubmenu
          ? e => {
              e.preventDefault()
              onClick?.()
            }
          : undefined
      }>
      <div className="flex items-center gap-3">
        {/* 메뉴 아이콘 */}
        <div
          className={cn(
            'flex items-center justify-center h-7 w-7',
            isActive ? 'text-customG' : 'text-gray-500'
          )}>
          <Icon size={20} />
        </div>

        {/* 메뉴 텍스트 - 사이드바 확장시에만 표시 */}
        {hovered && (
          <motion.span
            initial={{opacity: 0, width: 0}}
            animate={{opacity: 1, width: 'auto'}}
            exit={{opacity: 0, width: 0}}
            className="font-medium whitespace-nowrap">
            {text}
          </motion.span>
        )}
      </div>

      {/* 하위 메뉴가 있는 경우 화살표 아이콘 표시 */}
      {hasSubmenu && hovered && (
        <motion.div
          initial={{opacity: 0, rotate: 0}}
          animate={{
            opacity: 1,
            rotate: isSubmenuOpen ? 90 : 0
          }}
          className="ml-auto text-gray-400">
          <ChevronRight size={16} />
        </motion.div>
      )}

      {/* 활성화된 메뉴 표시를 위한 왼쪽 세로 바 */}
      {isActive && (
        <div className="absolute left-0 w-1 h-6 transform -translate-y-1/2 rounded-r-full bg-customG top-1/2" />
      )}
    </Link>
  )

  /**
   * 하위 메뉴 아이템 컴포넌트
   * 메인 메뉴보다 들여쓰기 되어 있고, 활성화 시 밑줄 표시
   * 녹색 테마로 스타일 변경
   */
  const SubMenuItem = ({href, text, isActive}: SubMenuItemProps) => (
    <Link
      href={href}
      className={cn(
        'flex items-center py-2 px-4 rounded-md group transition-colors duration-200 ml-10',
        isActive
          ? 'text-customGDark bg-customGLight font-medium'
          : 'text-gray-500 hover:text-customGDark hover:bg-customGLight'
      )}>
      <span className="relative text-sm">
        {text}
        {/* 활성화된 하위 메뉴 표시를 위한 밑줄 */}
        {isActive && (
          <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-customG rounded-full" />
        )}
      </span>
    </Link>
  )

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'fixed left-0 z-40 w-20 h-full bg-white shadow-sm top-20 border-r border-gray-200 transition-all duration-300',
        hovered ? 'w-60' : 'w-[65px]'
      )}>
      <div className="flex flex-col h-full">
        {/* 로고 영역: 항상 표시되는 아이콘과 확장 시 표시되는 텍스트 로고 */}
        {/* <div
          className={cn(
            'flex items-center h-16 border-b border-gray-200 transition-all',
            hovered ? 'justify-start px-4' : 'justify-center'
          )}>
          <div className="flex items-center gap-2"> */}
        {/* 로고 아이콘 - 녹색으로 변경 */}
        {/* <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-md bg-customG">
              <Leaf size={18} className="text-white" />
            </div> */}

        {/* 로고 텍스트 - 사이드바 확장시에만 표시 */}
        {/* <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{opacity: 0, width: 0}}
                  animate={{opacity: 1, width: 'auto'}}
                  exit={{opacity: 0, width: 0}}
                  className="overflow-hidden">
                  <span className="font-semibold text-customGTextLight">ESG</span>
                  <span className="font-medium text-customG">Dashboard</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div> */}

        {/* 메인 네비게이션 영역 */}
        <nav className="flex-grow py-4 space-y-1 overflow-y-auto">
          {/* 대시보드 메뉴 항목 */}
          <MenuItem
            href="/dashboard"
            icon={Home}
            text="대시보드"
            isActive={isHomeActive}
          />

          {/* ESG 관리 섹션 */}
          <div className="mt-2 mb-2">
            {/* 섹션 제목 - 사이드바 확장시에만 표시 */}
            {/* {hovered && (
              <div className="px-4 py-1 mb-1">
                <span className="text-xs font-medium text-gray-400">ESG 관리</span>
              </div>
            )} */}

            {/* ESG 공시 메뉴 - 하위메뉴 포함 */}
            <MenuItem
              href="#"
              icon={FileText}
              text="SCOPE"
              isActive={isScopeActive}
              hasSubmenu={true}
              isSubmenuOpen={openParent}
              onClick={() => setOpenParent(!openParent)}
            />

            {/* ESG 공시 하위 메뉴 컨테이너 수정 */}
            {openParent && hovered ? (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                //  variants={menuVariants}
                className="overflow-hidden">
                <div className="mt-1 space-y-1">
                  <SubMenuItem
                    href="/scope1"
                    text="Scope 1"
                    isActive={pathname === '/scope1'}
                  />
                  <SubMenuItem
                    href="/scope2"
                    text="Scope 2"
                    isActive={pathname === '/scope2'}
                  />
                  <SubMenuItem
                    href="/scope3"
                    text="Scope 3"
                    isActive={pathname === '/scope3'}
                  />
                </div>
              </motion.div>
            ) : (
              // 축소 상태에서는 활성화된 하위 메뉴만 작은 점으로 표시
              openParent && (
                <div className="flex flex-col items-center py-1 mt-1 space-y-2">
                  {pathname === '/scope1' ||
                    pathname === '/scope2' ||
                    (pathname === '/scope3' && (
                      <div className="w-2 h-2 rounded-full bg-customG" />
                    ))}
                </div>
              )
            )}
          </div>

          {/* 협력사 관리 메뉴 */}
          <MenuItem
            href="#"
            icon={Users}
            text="공급망 관리"
            isActive={isPartnerActive}
            hasSubmenu={true}
            isSubmenuOpen={openPartnerChild}
            onClick={() => setOpenPartnerChild(!openPartnerChild)}
          />

          {/* 협력사 관리 하위 메뉴도 같은 방식으로 수정 */}
          {openPartnerChild && hovered ? (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              //   variants={menuVariants}
              className="overflow-hidden">
              <div className="mt-1 space-y-1">
                <SubMenuItem
                  href="/CSDDD"
                  text="공급망 실사"
                  isActive={pathname === '/CSDDD'}
                />
                <SubMenuItem
                  href="/managePartner"
                  text="파트너사 관리"
                  isActive={pathname === '/managePartner'}
                />
                <SubMenuItem
                  href="/financialRisk"
                  text="재무제표 리스크 관리"
                  isActive={pathname === '/financialRisk'}
                />
              </div>
            </motion.div>
          ) : (
            // 축소 상태에서는 활성화된 하위 메뉴만 작은 점으로 표시
            openPartnerChild && (
              <div className="flex flex-col items-center py-1 mt-1 space-y-1">
                {pathname === '/CSDDD' && (
                  <div className="w-2 h-2 rounded-full bg-customG" />
                )}
                {pathname === '/financialRisk' && (
                  <div className="w-2 h-2 rounded-full bg-customG" />
                )}
                {pathname === '/managePartner' && (
                  <div className="w-2 h-2 rounded-full bg-customG" />
                )}
              </div>
            )
          )}
        </nav>
      </div>
    </aside>
  )
}
