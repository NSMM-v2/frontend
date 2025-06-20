'use client'

import React from 'react'
import {Building2, Loader2, Edit3} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'

interface EditPartnerModalProps {
  /** 모달 열림 상태 */
  isOpen: boolean
  /** 모달 닫기 함수 */
  onClose: () => void
  /** 파트너사 수정 함수 */
  onSubmit: () => Promise<void>

  /** 로딩 상태들 */
  isSubmitting: boolean

  /** 폼 데이터 */
  formData: {
    companyName: string
    corpCode: string
    contractStartDate: string
  }
  onFormDataChange: (
    data: Partial<{
      contractStartDate: string
    }>
  ) => void
}

export function EditPartnerModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  formData,
  onFormDataChange
}: EditPartnerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="bg-white border-0 shadow-2xl sm:max-w-2xl rounded-2xl">
        <DialogHeader className="pb-6 border-b border-slate-100">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
            <div className="p-2 rounded-lg bg-gradient-to-br from-customG to-emerald-600">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            파트너사 정보 수정
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* 파트너사 상세 정보 수정 섹션 */}
          <div className="p-6 space-y-6 border bg-slate-50 rounded-xl border-slate-200">
            <h4 className="mb-4 text-lg font-semibold text-slate-800">파트너사 정보</h4>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* 회사명 (읽기 전용) */}
              <div className="space-y-2">
                <Label
                  htmlFor="companyName"
                  className="text-sm font-semibold text-slate-700">
                  회사명
                </Label>
                <Input
                  id="companyName"
                  value={formData.companyName || ''}
                  className="text-gray-600 bg-gray-100 border-gray-200 cursor-not-allowed"
                  disabled
                  readOnly
                />
                <p className="text-xs text-slate-500">회사명은 수정할 수 없습니다.</p>
              </div>

              {/* DART 코드 (읽기 전용) */}
              <div className="space-y-2">
                <Label
                  htmlFor="corpCode"
                  className="text-sm font-semibold text-slate-700">
                  DART 코드
                </Label>
                <Input
                  id="corpCode"
                  value={formData.corpCode || ''}
                  className="font-mono text-gray-800 bg-gray-100 border-gray-200 cursor-not-allowed"
                  disabled
                  readOnly
                />
                <p className="text-xs text-slate-500">DART 코드는 수정할 수 없습니다.</p>
              </div>
            </div>

            {/* 계약 시작일 (수정 가능) */}
            <div className="space-y-2">
              <Label
                htmlFor="contractStartDate"
                className="text-sm font-semibold text-slate-700">
                계약 시작일 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contractStartDate"
                type="date"
                value={formData.contractStartDate || ''}
                onChange={e => onFormDataChange({contractStartDate: e.target.value})}
                className="transition-all duration-200 bg-white border-2 rounded-lg h-11 border-slate-200 focus:border-customG focus:ring-customG/20"
                disabled={isSubmitting}
              />
              <p className="text-xs text-slate-500">계약 시작일을 선택해주세요.</p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-6 border-t border-slate-100">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 transition-all duration-200 border-2 rounded-lg h-11 border-slate-200 hover:border-slate-300">
              취소
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || !formData.contractStartDate}
            className="px-8 font-semibold text-white transition-all duration-200 transform rounded-lg shadow-lg h-11 bg-gradient-to-r from-customG to-emerald-600 hover:from-customGDark hover:to-emerald-700 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:transform-none">
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> 처리 중...
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 mr-2" />
                정보 저장
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
