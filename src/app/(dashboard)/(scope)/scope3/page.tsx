'use client'

import Scope3Form from './scope3Form'

/**
 * Scope 3 페이지 컴포넌트
 *
 * Next.js App Router의 라우트 진입점
 * 실제 비즈니스 로직은 Scope3Form 컴포넌트에서 처리
 */
export default function Scope3Page() {
  return (
    <div className="flex flex-1 justify-center">
      <Scope3Form />
    </div>
  )
}
