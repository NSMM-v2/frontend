/**
 * 로딩 상태 컴포넌트
 */

import React from 'react'
import {Loader2} from 'lucide-react'

export function PartnerLoadingState() {
  return (
    <div className="flex items-center justify-center p-16">
      <div className="text-center">
        <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-customG" />
        <p className="text-lg font-medium text-slate-700">
          파트너사 목록을 불러오는 중...
        </p>
        <p className="mt-1 text-sm text-slate-500">잠시만 기다려주세요</p>
      </div>
    </div>
  )
}

export function PageLoadingState() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-12 h-12 animate-spin text-customG" />
    </div>
  )
}
