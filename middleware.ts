import {NextRequest, NextResponse} from 'next/server'

// 보호되지 않는 경로 (인증 없이 접근 가능)
const publicPaths = [
  '/login',
  '/signup',
  '/' // 랜딩 페이지 (필요시)
]

// 정적 파일 경로 패턴
const staticPaths = [
  '/_next',
  '/favicon.ico',
  '/api',
  '/*.svg',
  '/*.png',
  '/*.jpg',
  '/*.jpeg',
  '/*.gif',
  '/*.css',
  '/*.js'
]

/**
 * 미들웨어 함수
 * JWT 쿠키 존재 여부만 확인하여 빠른 라우트 보호
 * 실제 토큰 유효성 검증은 클라이언트에서 수행
 */
export async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl

  // 정적 파일은 미들웨어 처리하지 않음
  if (staticPaths.some(path => pathname.startsWith(path) || pathname.match(path))) {
    return NextResponse.next()
  }

  // JWT 쿠키 확인 (빠른 체크만)
  const jwtCookie = request.cookies.get('jwt')
  const hasJwtCookie = jwtCookie && jwtCookie.value.trim() !== ''

  // 공개 경로인지 확인
  const isPublicPath = publicPaths.includes(pathname)

  // 인증이 필요한 경로인데 JWT 쿠키가 없는 경우
  if (!isPublicPath && !hasJwtCookie) {
    console.log(`미인증 사용자가 보호된 경로 접근 시도: ${pathname}`)
    const loginUrl = new URL('/login', request.url)

    // 로그인이 필요하다는 메시지와 리다이렉트 경로 추가
    loginUrl.searchParams.set('message', 'auth_required')
    loginUrl.searchParams.set('redirect', pathname)

    return NextResponse.redirect(loginUrl)
  }

  // 이미 JWT 쿠키가 있는 사용자가 로그인/회원가입 페이지 접근 시
  if (hasJwtCookie && (pathname === '/login' || pathname === '/signup')) {
    console.log(`이미 JWT 쿠키가 있는 사용자가 인증 페이지 접근: ${pathname}`)
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 루트 경로 접근 시 대시보드로 리다이렉트 (JWT 쿠키가 있는 경우)
  if (pathname === '/' && hasJwtCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

/**
 * 미들웨어가 실행될 경로 설정
 * 정적 파일과 API 라우트 제외
 */
export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 경로에서 실행:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
