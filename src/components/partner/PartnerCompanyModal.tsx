'use client'

import React from 'react'
import {Building2, Search, Loader2, AlertTriangle, Plus, Check} from 'lucide-react'
import cn from 'classnames'

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

import {DartCorpInfo} from '@/types/IFRS/partnerCompany'

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
      <DialogContent className="bg-white border border-gray-100 rounded-lg shadow-lg sm:max-w-2xl">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50">
              <Building2 className="w-5 h-5 text-customG" />
            </div>
            새 파트너사 등록
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="space-y-3">
            <Label
              htmlFor="companySearch"
              className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Search className="w-4 h-4" />
              회사 검색 (DART 데이터베이스)
            </Label>
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <Input
                id="companySearch"
                placeholder="검색할 회사명을 입력하세요"
                value={companySearchQuery || ''}
                onChange={e => onCompanySearchQueryChange(e.target.value)}
                className="text-sm bg-white border border-gray-100 rounded-md h-9 pl-9 focus:border-gray-200 focus:ring-gray-100"
                disabled={isSubmitting}
              />
              {isLoading && companySearchQuery && (
                <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-customG" />
                </div>
              )}
            </div>

            {dartSearchResults.length > 0 && (
              <div className="mt-4 overflow-hidden border border-gray-100 rounded-md">
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
                          ? 'bg-green-50'
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
                            <span className="font-mono text-xs text-customG">
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
                                <span className="font-mono text-xs text-customG">
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
                        <Check className="w-4 h-4 text-customG" />
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
                <div className="flex items-center gap-3 p-4 mt-4 border border-red-200 bg-red-50 rounded-xl">
                  <AlertTriangle className="flex-shrink-0 w-5 h-5 text-red-500" />
                  <p className="text-sm font-medium text-red-700">{dialogError}</p>
                </div>
              )}
          </div>

          {/* 회사 선택 안내 메시지 */}
          {!selectedDartCompany && companySearchQuery && dartSearchResults.length > 0 && (
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-xl">
              <p className="text-sm font-medium text-blue-700">
                위 목록에서 등록할 파트너사를 선택해주세요.
              </p>
            </div>
          )}

          {selectedDartCompany && (
            <div className="p-4 border border-green-200 bg-green-50 rounded-xl">
              <h4 className="mb-2 text-sm font-semibold text-green-700">
                선택된 파트너사
              </h4>
              <p className="font-semibold text-green-800">
                {selectedDartCompany.corpName || selectedDartCompany.corp_name}
              </p>
              <p className="text-sm text-green-600">
                DART: {selectedDartCompany.corpCode || selectedDartCompany.corp_code}
                {(selectedDartCompany.stockCode || selectedDartCompany.stock_code) &&
                  ` | 주식코드: ${
                    selectedDartCompany.stockCode || selectedDartCompany.stock_code
                  }`}
              </p>
            </div>
          )}

          {dialogError && !companySearchQuery && (
            <div className="flex items-center gap-3 p-4 border border-red-200 bg-red-50 rounded-xl">
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
              className="px-4 text-sm border border-gray-100 h-9 hover:bg-gray-50 hover:border-gray-200">
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
              'bg-customG hover:bg-customG/90 transition-colors',
              'disabled:opacity-50'
            )}>
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>처리 중...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
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
