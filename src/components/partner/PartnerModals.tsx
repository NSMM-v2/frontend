/**
 * 파트너사 관리 모달 컴포넌트들
 *
 * 이 파일은 파트너사 관리와 관련된 모든 모달/다이얼로그 컴포넌트들을 포함합니다:
 * - 파트너사 추가 모달 (PartnerCompanyModal)
 * - 파트너사 수정 모달 (EditPartnerModal)
 * - 파트너사 삭제 확인 다이얼로그 (PartnerDeleteDialog)
 *
 * 주요 기능:
 * - DART API를 통한 기업 정보 검색 및 등록
 * - 파트너사 정보 수정 (계약 시작일만 수정 가능)
 * - 파트너사 삭제 확인 및 실행
 * - 실시간 유효성 검증 및 중복 검사
 *
 * @author ESG Project Team
 * @version 1.0
 * @since 2024
 * @lastModified 2024-12-20
 */

'use client'

import React from 'react'
import {
  Building2,
  Search,
  Loader2,
  AlertTriangle,
  Plus,
  Check,
  Edit3,
  AlertCircle
} from 'lucide-react'
import {cn} from '@/lib/utils'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'

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

import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'

import {DartCorpInfo, PartnerCompany} from '@/types/partnerCompanyType'

// ============================================================================
// 타입 정의 (Type Definitions)
// ============================================================================

interface AddPartnerModalProps {
  /** 모달 열림 상태 */
  isOpen: boolean
  /** 모달 닫기 함수 */
  onClose: () => void
  /** 파트너사 저장 함수 */
  onSubmit: () => Promise<void>

  /** 로딩 상태들 */
  isLoading: boolean
  isSubmitting: boolean

  /** 검색 관련 */
  companySearchQuery: string
  onCompanySearchQueryChange: (value: string) => void
  dartSearchResults: DartCorpInfo[]
  selectedDartCompany: DartCorpInfo | null
  onSelectDartCompany: (company: DartCorpInfo) => void

  /** 에러 메시지 */
  dialogError: string | null

  /** 회사명 중복 검사 결과 */
  duplicateCheckResult: {
    isDuplicate: boolean
    message: string
  } | null
}

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

interface PartnerDeleteDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedPartner: PartnerCompany | null
  onConfirmDelete: () => void
  isSubmitting: boolean
  onClearSelection: () => void
}

// ============================================================================
// 파트너사 추가 모달 (Partner Company Add Modal)
// ============================================================================

/**
 * 파트너사 추가 모달 컴포넌트
 *
 * DART API를 통한 기업 검색 및 파트너사 등록 기능을 제공합니다.
 * - 실시간 기업 검색 (디바운스 적용)
 * - 회사명 중복 검사
 * - 선택된 기업 정보 미리보기
 * - 유효성 검증 및 에러 메시지 표시
 */
export function PartnerCompanyModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  isSubmitting,
  companySearchQuery,
  onCompanySearchQueryChange,
  dartSearchResults,
  selectedDartCompany,
  onSelectDartCompany,
  dialogError,
  duplicateCheckResult
}: AddPartnerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="bg-white rounded-lg border border-gray-100 shadow-lg sm:max-w-2xl">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="flex gap-2 items-center text-xl font-semibold text-gray-900">
            <div className="flex justify-center items-center w-8 h-8 bg-blue-50 rounded-full">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            새 파트너사 등록
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="space-y-3">
            <Label
              htmlFor="companySearch"
              className="flex gap-2 items-center text-sm font-medium text-gray-700">
              <Search className="w-4 h-4" />
              회사 검색 (DART 데이터베이스)
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
              <Input
                id="companySearch"
                placeholder="검색할 회사명을 입력하세요"
                value={companySearchQuery || ''}
                onChange={e => onCompanySearchQueryChange(e.target.value)}
                className="pl-9 h-9 text-sm bg-white rounded-md border border-gray-100 focus:border-gray-200 focus:ring-gray-100"
                disabled={isSubmitting}
              />
              {isLoading && companySearchQuery && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                </div>
              )}
            </div>

            {dartSearchResults.length > 0 && (
              <div className="overflow-hidden mt-4 rounded-md border border-gray-100">
                <div className="overflow-y-auto max-h-64">
                  {dartSearchResults.map((company, index) => (
                    <button
                      key={`dart-${company.corpCode || company.corp_code}-${index}`}
                      type="button"
                      className={cn(
                        'w-full p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center text-left transition-all duration-200 border-b border-gray-100 last:border-b-0',
                        (selectedDartCompany?.corpCode ||
                          selectedDartCompany?.corp_code) ===
                          (company.corpCode || company.corp_code)
                          ? 'bg-blue-50'
                          : ''
                      )}
                      onClick={() => onSelectDartCompany(company)}
                      disabled={isSubmitting}>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {company.corpName || company.corp_name}
                        </p>
                        <div className="flex items-center mt-1 space-x-3">
                          <div className="flex items-center space-x-1">
                            <span className="text-xs font-medium text-gray-500">
                              DART:
                            </span>
                            <span className="font-mono text-xs text-blue-600">
                              {company.corpCode || company.corp_code}
                            </span>
                          </div>
                          {(company.stockCode || company.stock_code) && (
                            <>
                              <span className="text-gray-300">|</span>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs font-medium text-gray-500">
                                  종목코드:
                                </span>
                                <span className="font-mono text-xs text-blue-600">
                                  {company.stockCode || company.stock_code}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      {(selectedDartCompany?.corpCode ||
                        selectedDartCompany?.corp_code) ===
                        (company.corpCode || company.corp_code) && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {dialogError &&
              dartSearchResults.length === 0 &&
              companySearchQuery &&
              !isLoading && (
                <div className="flex gap-3 items-center p-4 mt-4 bg-red-50 rounded-xl border border-red-200">
                  <AlertTriangle className="flex-shrink-0 w-5 h-5 text-red-500" />
                  <p className="text-sm font-medium text-red-700">{dialogError}</p>
                </div>
              )}
          </div>

          {/* 회사 선택 안내 메시지 */}
          {!selectedDartCompany && companySearchQuery && dartSearchResults.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm font-medium text-blue-700">
                위 목록에서 등록할 파트너사를 선택해주세요.
              </p>
            </div>
          )}

          {selectedDartCompany && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="mb-2 text-sm font-semibold text-blue-700">
                선택된 파트너사
              </h4>
              <p className="font-semibold text-blue-800">
                {selectedDartCompany.corpName || selectedDartCompany.corp_name}
              </p>
              <p className="text-sm text-blue-600">
                DART: {selectedDartCompany.corpCode || selectedDartCompany.corp_code}
                {(selectedDartCompany.stockCode || selectedDartCompany.stock_code) &&
                  ` | 주식코드: ${
                    selectedDartCompany.stockCode || selectedDartCompany.stock_code
                  }`}
              </p>
            </div>
          )}

          {dialogError && !companySearchQuery && (
            <div className="flex gap-3 items-center p-4 bg-red-50 rounded-xl border border-red-200">
              <AlertTriangle className="flex-shrink-0 w-5 h-5 text-red-500" />
              <p className="text-sm font-medium text-red-700">{dialogError}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-4 border-t border-gray-100">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 h-9 text-sm border border-gray-100 hover:bg-gray-50 hover:border-gray-200">
              취소
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={
              isSubmitting || !selectedDartCompany || duplicateCheckResult?.isDuplicate
            }
            className={cn(
              'px-4 h-9 text-sm font-medium text-white',
              'bg-blue-500 transition-colors hover:bg-blue-600',
              'disabled:opacity-50'
            )}>
            {isSubmitting ? (
              <div className="flex gap-2 items-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>처리 중...</span>
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <Plus className="w-4 h-4" />
                <span>파트너사 등록</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// 파트너사 수정 모달 (Partner Company Edit Modal)
// ============================================================================

/**
 * 파트너사 수정 모달 컴포넌트
 *
 * 기존 파트너사의 정보를 수정하는 기능을 제공합니다.
 * - 회사명 및 DART 코드는 읽기 전용 (수정 불가)
 * - 계약 시작일만 수정 가능
 * - 유효성 검증 및 폼 상태 관리
 */
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
      <DialogContent className="bg-white rounded-2xl border-0 shadow-2xl sm:max-w-2xl">
        <DialogHeader className="pb-6 border-b border-slate-100">
          <DialogTitle className="flex gap-3 items-center text-2xl font-bold text-slate-800">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            파트너사 정보 수정
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* 파트너사 상세 정보 수정 섹션 */}
          <div className="p-6 space-y-6 rounded-xl border bg-slate-50 border-slate-200">
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
                className="h-11 bg-white rounded-lg border-2 transition-all duration-200 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
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
              className="px-6 h-11 rounded-lg border-2 transition-all duration-200 border-slate-200 hover:border-slate-300">
              취소
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || !formData.contractStartDate}
            className="px-8 h-11 font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg transition-all duration-200 transform hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:transform-none">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" /> 처리 중...
              </>
            ) : (
              <>
                <Edit3 className="mr-2 w-4 h-4" />
                정보 저장
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// 파트너사 삭제 확인 다이얼로그 (Partner Company Delete Dialog)
// ============================================================================

/**
 * 파트너사 삭제 확인 다이얼로그 컴포넌트
 *
 * 파트너사 삭제 전 사용자 확인을 받는 다이얼로그입니다.
 * - 삭제할 파트너사 정보 표시
 * - 영구 삭제 경고 메시지
 * - 확인/취소 액션 제공
 */
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
            <AlertCircle className="mr-2 w-5 h-5" />
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
                <Loader2 className="mr-1 w-4 h-4 animate-spin" />
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
