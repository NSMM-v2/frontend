/**
 * 삭제 확인 다이얼로그 컴포넌트
 */

import React from 'react'
import {AlertCircle, Loader2} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {PartnerCompany} from '@/types/IFRS/partnerCompany'

interface PartnerDeleteDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedPartner: PartnerCompany | null
  onConfirmDelete: () => void
  isSubmitting: boolean
  onClearSelection: () => void
}

export function PartnerDeleteDialog({
  isOpen,
  onOpenChange,
  selectedPartner,
  onConfirmDelete,
  isSubmitting,
  onClearSelection
}: PartnerDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            파트너사 삭제 확인
          </AlertDialogTitle>
          <AlertDialogDescription>
            정말로{' '}
            <span className="font-semibold text-slate-800">
              {selectedPartner?.corpName || selectedPartner?.companyName}
            </span>{' '}
            파트너사를 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 관련 데이터가
            영구적으로 삭제됩니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClearSelection} disabled={isSubmitting}>
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                삭제 중...
              </>
            ) : (
              '삭제'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
