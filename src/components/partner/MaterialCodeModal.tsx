'use client'

import React, {useState, useCallback} from 'react'
import {
  Package,
  Plus,
  Edit3,
  Loader2,
  AlertTriangle,
  Check,
  X,
  Tag,
  Box,
  Trash2
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

import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Badge} from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import {
  MaterialCodeModalState,
  MaterialCodeCreateRequest,
  MaterialCodeUpdateRequest,
  MaterialCodeBatchCreateRequest,
  MaterialCodeItem
} from '@/types/partnerCompanyType'

// ============================================================================
// 타입 정의
// ============================================================================

interface MaterialCodeModalProps {
  /** 모달 상태 */
  modalState: MaterialCodeModalState
  /** 모달 닫기 함수 */
  onClose: () => void
  /** 자재코드 저장 함수 */
  onSave: (
    data:
      | MaterialCodeCreateRequest
      | MaterialCodeUpdateRequest
      | MaterialCodeBatchCreateRequest
  ) => Promise<void>
  /** 로딩 상태 */
  isSubmitting: boolean
  /** 에러 메시지 */
  error?: string | null
  /** 기존 자재코드 목록 (중복 체크용) */
  existingCodes?: string[]
}

// ============================================================================
// 자재코드 카테고리 상수
// ============================================================================

const MATERIAL_CATEGORIES = [
  {value: 'raw_material', label: '원자재'},
  {value: 'component', label: '부품'},
  {value: 'assembly', label: '조립품'},
  {value: 'finished_goods', label: '완제품'},
  {value: 'packaging', label: '포장재'},
  {value: 'consumables', label: '소모품'},
  {value: 'other', label: '기타'}
]

// ============================================================================
// 자재코드 모달 컴포넌트
// ============================================================================

/**
 * 자재코드 추가/편집 모달 컴포넌트
 *
 * 자재코드 생성, 편집, 할당 기능을 제공합니다.
 * - 단일/다중 자재코드 입력 지원
 * - 동적 목록 관리 (추가/삭제)
 * - 유효성 검증 및 중복 체크
 * - 자재코드, 자재명, 카테고리 입력
 */
export function MaterialCodeModal({
  modalState,
  onClose,
  onSave,
  isSubmitting,
  error,
  existingCodes = []
}: MaterialCodeModalProps) {
  // 고유 ID 생성 함수 (useState보다 먼저 선언)
  const generateId = () => Math.random().toString(36).substring(2, 15)

  // 다중 자재코드 목록 상태
  const [materialCodeList, setMaterialCodeList] = useState<MaterialCodeItem[]>(() => {
    // 편집 모드인 경우 기존 데이터로 초기화
    if (modalState.mode === 'edit' && modalState.materialCode) {
      const {materialCode} = modalState
      return [
        {
          id: '1',
          materialCode: materialCode.materialCode || '',
          materialName: materialCode.materialName || '',
          category: materialCode.category || '',
          errors: {}
        }
      ]
    }

    // 기본적으로 빈 항목 하나로 시작
    return [
      {
        id: generateId(),
        materialCode: '',
        materialName: '',
        category: '',
        errors: {}
      }
    ]
  })

  // 자재코드 항목 추가 함수
  const addMaterialCodeItem = useCallback(() => {
    const newItem: MaterialCodeItem = {
      id: generateId(),
      materialCode: '',
      materialName: '',
      category: '',
      errors: {}
    }
    setMaterialCodeList(prev => [...prev, newItem])
  }, [])

  // 자재코드 항목 삭제 함수
  const removeMaterialCodeItem = useCallback((id: string) => {
    setMaterialCodeList(prev => prev.filter(item => item.id !== id))
  }, [])

  // 자재코드 항목 업데이트 함수
  const updateMaterialCodeItem = useCallback(
    (id: string, field: keyof Omit<MaterialCodeItem, 'id' | 'errors'>, value: string) => {
      setMaterialCodeList(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                [field]: value,
                errors: {...item.errors, [field]: undefined} // 에러 제거
              }
            : item
        )
      )
    },
    []
  )

  // 개별 자재코드 항목 유효성 검증 함수
  const validateMaterialCodeItem = (
    item: MaterialCodeItem
  ): Partial<MaterialCodeItem> => {
    const errors: Partial<MaterialCodeItem> = {}

    // 자재코드 검증
    if (!item.materialCode.trim()) {
      errors.materialCode = '자재코드를 입력해주세요.'
    } else if (!/^[A-Z0-9]{3,10}$/.test(item.materialCode)) {
      errors.materialCode = '자재코드는 3-10자의 영문 대문자와 숫자만 사용 가능합니다.'
    } else if (existingCodes.includes(item.materialCode)) {
      errors.materialCode = '이미 존재하는 자재코드입니다.'
    }

    // 자재명 검증
    if (!item.materialName.trim()) {
      errors.materialName = '자재명을 입력해주세요.'
    } else if (item.materialName.length < 2) {
      errors.materialName = '자재명은 2자 이상 입력해주세요.'
    }

    return errors
  }

  // 전체 폼 유효성 검증 함수
  const validateAllItems = (): boolean => {
    let hasErrors = false
    const allCodes = materialCodeList.map(item => item.materialCode.trim().toUpperCase())

    setMaterialCodeList(prev =>
      prev.map(item => {
        const errors = validateMaterialCodeItem(item)

        // 목록 내 중복 검사
        const duplicateCount = allCodes.filter(
          code => code === item.materialCode.trim().toUpperCase()
        ).length
        if (duplicateCount > 1) {
          errors.materialCode = '목록 내에 중복된 자재코드가 있습니다.'
        }

        if (Object.keys(errors).length > 0) {
          hasErrors = true
        }

        return {...item, errors}
      })
    )

    return !hasErrors
  }

  // 저장 처리 함수
  const handleSave = async () => {
    if (!validateAllItems()) return

    try {
      if (modalState.mode === 'edit') {
        // 편집 모드: 단일 항목만 처리
        const item = materialCodeList[0]
        const requestData: MaterialCodeUpdateRequest = {
          materialName: item.materialName.trim(),
          category: item.category || undefined
        }
        await onSave(requestData)
      } else {
        // 생성 모드: 단일 또는 다중 처리
        if (materialCodeList.length === 1) {
          // 단일 자재코드
          const item = materialCodeList[0]
          const requestData: MaterialCodeCreateRequest = {
            materialCode: item.materialCode.trim().toUpperCase(),
            materialName: item.materialName.trim(),
            category: item.category || undefined
          }
          await onSave(requestData)
        } else {
          // 다중 자재코드
          const requestData: MaterialCodeBatchCreateRequest = {
            materialCodes: materialCodeList.map(item => ({
              materialCode: item.materialCode.trim().toUpperCase(),
              materialName: item.materialName.trim(),
              category: item.category || undefined
            })),
            partnerId: modalState.partnerId,
            assignmentNote: `${materialCodeList.length}개 자재코드 일괄 생성`
          }
          await onSave(requestData)
        }
      }

      onClose()
    } catch (error) {
      console.error('자재코드 저장 실패:', error)
    }
  }

  // 모달 제목 및 아이콘 결정
  const getModalTitle = () => {
    switch (modalState.mode) {
      case 'create':
        return materialCodeList.length > 1 ? '새 자재코드 추가 ' : '새 자재코드 추가'
      case 'edit':
        return '자재코드 수정'
      case 'assign':
        return '자재코드 할당'
      default:
        return '자재코드 관리'
    }
  }

  const getModalIcon = () => {
    switch (modalState.mode) {
      case 'create':
        return <Plus className="w-5 h-5 text-white" />
      case 'edit':
        return <Edit3 className="w-5 h-5 text-white" />
      case 'assign':
        return <Package className="w-5 h-5 text-white" />
      default:
        return <Package className="w-5 h-5 text-white" />
    }
  }

  const isFormValid = materialCodeList.every(
    item =>
      item.materialCode.trim() &&
      item.materialName.trim() &&
      Object.keys(item.errors).length === 0
  )

  return (
    <Dialog open={modalState.isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="bg-white border-0 shadow-2xl rounded-2xl sm:max-w-4xl">
        <DialogHeader className="pb-6 border-b border-slate-100">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              {getModalIcon()}
            </div>
            {getModalTitle()}
          </DialogTitle>
          {modalState.mode === 'assign' && modalState.partnerName && (
            <div className="mt-2 text-sm text-slate-600">
              협력사:{' '}
              <span className="font-medium text-slate-800">{modalState.partnerName}</span>
            </div>
          )}
        </DialogHeader>

        <div className="py-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* 에러 메시지 표시 */}
          {error && (
            <div className="flex items-center gap-3 p-4 border border-red-200 bg-red-50 rounded-xl">
              <AlertTriangle className="flex-shrink-0 w-5 h-5 text-red-500" />
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* 자재코드 입력 섹션 */}
          <div className="space-y-4">
            {/* 자재코드 목록 헤더 */}
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                <Tag className="w-5 h-5 text-blue-600" />
                자재코드 목록 ({materialCodeList.length}개)
              </h4>
              {modalState.mode !== 'edit' && (
                <Button
                  type="button"
                  onClick={addMaterialCodeItem}
                  disabled={isSubmitting}
                  className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600">
                  <Plus className="w-4 h-4 mr-1" />
                  추가
                </Button>
              )}
            </div>

            {/* 자재코드 항목들 */}
            <div className="space-y-4">
              {materialCodeList.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 bg-white border-2 border-slate-200 rounded-xl">
                  {/* 항목 헤더 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
                        <span className="text-xs font-bold text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-600">
                        자재코드 #{index + 1}
                      </span>
                    </div>
                    {materialCodeList.length > 1 && modalState.mode !== 'edit' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMaterialCodeItem(item.id)}
                        disabled={isSubmitting}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* 입력 필드들 */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* 자재코드 */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        자재코드 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={item.materialCode}
                        onChange={e =>
                          updateMaterialCodeItem(
                            item.id,
                            'materialCode',
                            e.target.value.toUpperCase()
                          )
                        }
                        placeholder="예: A001, B100"
                        className={cn(
                          'h-10 font-mono bg-white rounded-lg border-2 transition-all duration-200',
                          item.errors.materialCode
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-slate-200 focus:border-blue-500'
                        )}
                        disabled={modalState.mode === 'edit' || isSubmitting}
                        maxLength={10}
                      />
                      {item.errors.materialCode && (
                        <p className="text-xs text-red-600">{item.errors.materialCode}</p>
                      )}
                    </div>

                    {/* 자재명 */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        자재명 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={item.materialName}
                        onChange={e =>
                          updateMaterialCodeItem(item.id, 'materialName', e.target.value)
                        }
                        placeholder="예: 부품, 철강, 원료"
                        className={cn(
                          'h-10 bg-white rounded-lg border-2 transition-all duration-200',
                          item.errors.materialName
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-slate-200 focus:border-blue-500'
                        )}
                        disabled={isSubmitting}
                      />
                      {item.errors.materialName && (
                        <p className="text-xs text-red-600">{item.errors.materialName}</p>
                      )}
                    </div>
                  </div>

                  {/* 카테고리 */}
                  <div className="mt-4 space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      카테고리
                    </Label>
                    <Select
                      value={item.category}
                      onValueChange={value =>
                        updateMaterialCodeItem(item.id, 'category', value)
                      }>
                      <SelectTrigger className="h-10 bg-white border-2 rounded-lg border-slate-200 focus:border-blue-500">
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {MATERIAL_CATEGORIES.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 개별 미리보기 */}
                  {item.materialCode.trim() && item.materialName.trim() && (
                    <div className="p-3 mt-4 border border-blue-200 rounded-lg bg-blue-50">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className="px-2 py-1 font-mono text-xs font-semibold text-blue-700 bg-blue-100 border-blue-300">
                          {item.materialCode}
                        </Badge>
                        <span className="text-sm font-medium text-blue-800">
                          {item.materialName}
                        </span>
                        {item.category && (
                          <Badge variant="outline" className="text-xs text-blue-600">
                            {
                              MATERIAL_CATEGORIES.find(cat => cat.value === item.category)
                                ?.label
                            }
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 전체 미리보기 */}
          {materialCodeList.length > 1 && (
            <div className="p-4 border border-green-200 bg-green-50 rounded-xl">
              <h4 className="flex items-center gap-2 mb-3 text-sm font-semibold text-green-700">
                <Box className="w-4 h-4" />
                전체 미리보기 ({materialCodeList.length}개)
              </h4>
              <div className="space-y-2">
                {materialCodeList.map(
                  (item, index) =>
                    item.materialCode.trim() &&
                    item.materialName.trim() && (
                      <div key={item.id} className="flex items-center gap-3 text-sm">
                        <span className="w-4 text-xs font-medium text-green-600">
                          {index + 1}.
                        </span>
                        <Badge className="px-2 py-1 font-mono text-xs font-semibold text-green-700 bg-green-100 border-green-300">
                          {item.materialCode}
                        </Badge>
                        <span className="font-medium text-green-800">
                          {item.materialName}
                        </span>
                        {item.category && (
                          <Badge variant="outline" className="text-xs text-green-600">
                            {
                              MATERIAL_CATEGORIES.find(cat => cat.value === item.category)
                                ?.label
                            }
                          </Badge>
                        )}
                      </div>
                    )
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 pt-6 border-t border-slate-100">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 transition-all duration-200 border-2 rounded-lg h-11 border-slate-200 hover:border-slate-300">
              <X className="w-4 h-4 mr-2" />
              취소
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || !isFormValid}
            className="px-8 font-semibold text-white transition-all duration-200 transform rounded-lg shadow-lg h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:transform-none">
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                처리 중...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                {modalState.mode === 'create'
                  ? `자재코드 ${
                      materialCodeList.length > 1 ? `${materialCodeList.length}개 ` : ''
                    }추가`
                  : '변경사항 저장'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
