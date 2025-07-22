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
  DialogClose,
  DialogDescription
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
  MaterialCodeItem,
  MaterialAssignmentResponse,
  DeleteConfirmationDialogState
} from '@/types/partnerCompanyType'
import toast from '@/util/toast'
import {materialAssignmentService} from '@/services/materialAssignmentService'

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
  /** 기존 자재코드 할당 목록 (편집/삭제용) */
  existingAssignments?: MaterialAssignmentResponse[]
  /** 삭제 함수 */
  onDelete?: (assignmentId: number) => Promise<void>
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
  existingCodes = [],
  existingAssignments = [],
  onDelete
}: MaterialCodeModalProps) {
  // generateId 메서드 - 고유 ID 생성 함수 (useState보다 먼저 선언)
  const generateId = () => Math.random().toString(36).substring(2, 15)

  // 삭제 확인 다이얼로그 상태 관리
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmationDialogState>({
      isOpen: false,
      canDelete: false
    })

  // 다중 자재코드 목록 상태 관리 - 모델 모드에 따라 초기화
  const [materialCodeList, setMaterialCodeList] = useState<MaterialCodeItem[]>(() => {
    // 편집 모드인 경우 기존 데이터로 초기화
    if (modalState.mode === 'edit' && modalState.materialCode) {
      const {materialCode} = modalState
      return [
        {
          id: '1',
          materialCode: materialCode.materialCode || '',
          materialName: materialCode.materialName || '',
          materialDescription: materialCode.description || '', // 레거시 호환성
          materialCategory: materialCode.category || '', // 레거시 호환성
          errors: {},
          // 레거시 호환성 필드 유지
          description: materialCode.description || '',
          category: materialCode.category || ''
        }
      ]
    }

    // 할당 모드인 경우 기존 할당 목록으로 초기화
    if (modalState.mode === 'assign' && existingAssignments.length > 0) {
      return existingAssignments.map((assignment, index) => ({
        id: `existing-${index}`,
        materialCode: assignment.materialCode,
        materialName: assignment.materialName,
        materialDescription: assignment.materialDescription || '', // 백엔드 필드명 사용
        materialCategory: assignment.materialCategory || '', // 백엔드 필드명 사용
        errors: {},
        assignmentId: assignment.id, // 할당 ID 추가
        isMapped: assignment.isMapped || false, // 매핑 여부 추가
        // 레거시 호환성 필드 유지
        description: assignment.materialDescription || '',
        category: assignment.materialCategory || ''
      }))
    }

    // 기본적으로 빈 항목 하나로 시작
    return [
      {
        id: generateId(),
        materialCode: '',
        materialName: '',
        materialDescription: '',
        materialCategory: '',
        errors: {},
        // 레거시 호환성 필드 유지
        description: '',
        category: ''
      }
    ]
  })

  // useEffect 메서드 - 모달이 열릴 때마다 데이터 동기화
  React.useEffect(() => {
    if (modalState.isOpen) {
      if (modalState.mode === 'edit' && modalState.materialCode) {
        // 편집 모드인 경우 기존 데이터로 초기화
        const {materialCode} = modalState
        setMaterialCodeList([
          {
            id: '1',
            materialCode: materialCode.materialCode || '',
            materialName: materialCode.materialName || '',
            materialDescription: materialCode.description || '', // 레거시 호환성
            materialCategory: materialCode.category || '', // 레거시 호환성
            errors: {},
            // 레거시 호환성 필드 유지
            description: materialCode.description || '',
            category: materialCode.category || ''
          }
        ])
      } else if (modalState.mode === 'assign' && existingAssignments.length > 0) {
        // 할당 모드인 경우 기존 할당 목록으로 초기화
        setMaterialCodeList(
          existingAssignments.map((assignment, index) => ({
            id: `existing-${index}`,
            materialCode: assignment.materialCode,
            materialName: assignment.materialName,
            materialDescription: assignment.materialDescription || '', // 백엔드 필드명 사용
            materialCategory: assignment.materialCategory || '', // 백엔드 필드명 사용
            errors: {},
            assignmentId: assignment.id, // 할당 ID 추가
            isMapped: assignment.isMapped || false, // 매핑 여부 추가
            // 레거시 호환성 필드 유지
            description: assignment.materialDescription || '',
            category: assignment.materialCategory || ''
          }))
        )
      } else {
        // 기본 모드인 경우 빈 항목으로 초기화
        setMaterialCodeList([
          {
            id: generateId(),
            materialCode: '',
            materialName: '',
            materialDescription: '',
            materialCategory: '',
            errors: {},
            // 레거시 호환성 필드 유지
            description: '',
            category: ''
          }
        ])
      }
    }
  }, [modalState.isOpen, modalState.mode, modalState.materialCode, existingAssignments])

  // addMaterialCodeItem 메서드 - 자재코드 항목 추가 함수
  const addMaterialCodeItem = useCallback(() => {
    const lastItem = materialCodeList[materialCodeList.length - 1]
    if (
      lastItem &&
      (!lastItem.materialCode.trim() ||
        !lastItem.materialName.trim() ||
        !lastItem.materialCategory)
    ) {
      toast.error(
        '새 자재코드를 추가하기 전에 현재 항목의 필수 필드(자재코드, 자재명, 카테고리)를 모두 입력해주세요.'
      )
      return
    }

    const newItem: MaterialCodeItem = {
      id: generateId(),
      materialCode: '',
      materialName: '',
      materialDescription: '',
      materialCategory: '',
      errors: {}
    }
    setMaterialCodeList(prev => [...prev, newItem])
  }, [materialCodeList])

  // removeMaterialCodeItem 메서드 - 자재코드 항목 삭제 함수
  const removeMaterialCodeItem = useCallback((id: string) => {
    setMaterialCodeList(prev => prev.filter(item => item.id !== id))
  }, [])

  // handleDeleteAssignment 메서드 - 할당된 자재코드 삭제 함수
  const handleDeleteAssignment = useCallback(
    async (item: MaterialCodeItem) => {
      if (!item.assignmentId) return

      try {
        // 기존 할당 데이터에서 isMapped 정보 확인
        const existingAssignment = existingAssignments?.find(
          a => a.id === item.assignmentId
        )
        const isMapped = existingAssignment?.isMapped || false

        // 삭제 가능 여부를 서버에서 확인 (fallback 포함)
        const deleteCheck = await materialAssignmentService.canDeleteAssignment(
          item.assignmentId
        )

        // 삭제 가능 여부 확인을 위한 디버깅용 로그
        console.log('삭제 확인 정보:', {
          assignmentId: item.assignmentId,
          isMapped: isMapped,
          deleteCheckCanDelete: deleteCheck.canDelete,
          existingAssignment: existingAssignment
        })

        // isMapped가 true이면 삭제 불가능 (다른 코드와 매핑되어 있음)
        const canDelete = !isMapped && deleteCheck.canDelete

        setDeleteConfirmation({
          isOpen: true,
          materialCode: item.materialCode,
          materialName: item.materialName,
          assignmentId: item.assignmentId,
          canDelete: canDelete,
          mappedCodes: deleteCheck.mappedCodes || [],
          onConfirm: async () => {
            if (onDelete && item.assignmentId) {
              try {
                await onDelete(item.assignmentId)
                // 성공하면 목록에서 제거
                setMaterialCodeList(prev => prev.filter(i => i.id !== item.id))
                setDeleteConfirmation({isOpen: false, canDelete: false})
                toast.success(
                  `${item.materialCode} 자재코드가 성공적으로 삭제되었습니다.`
                )
              } catch (error) {
                console.error('자재코드 삭제 오류:', error)
                toast.error(
                  error instanceof Error
                    ? error.message
                    : '자재코드 삭제 중 오류가 발생했습니다.'
                )
              }
            }
          },
          onCancel: () => {
            setDeleteConfirmation({isOpen: false, canDelete: false})
          }
        })
      } catch (error) {
        console.error('삭제 가능 여부 확인 오류:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : '삭제 가능 여부 확인 중 오류가 발생했습니다.'
        )
      }
    },
    [onDelete, existingAssignments]
  )

  // updateMaterialCodeItem 메서드 - 자재코드 항목 업데이트 함수
  const updateMaterialCodeItem = useCallback(
    (id: string, field: keyof Omit<MaterialCodeItem, 'id' | 'errors'>, value: string) => {
      setMaterialCodeList(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                [field]: value,
                // 레거시 호환성을 위한 동기화
                ...(field === 'materialDescription' && {description: value}),
                ...(field === 'materialCategory' && {category: value}),
                ...(field === 'description' && {materialDescription: value}),
                ...(field === 'category' && {materialCategory: value}),
                errors: {...item.errors, [field]: undefined} // 에러 제거
              }
            : item
        )
      )
    },
    []
  )

  // validateMaterialCodeItem 메서드 - 개별 자재코드 항목 유효성 검증 함수
  const validateMaterialCodeItem = (
    item: MaterialCodeItem
  ): Partial<MaterialCodeItem> => {
    const errors: Partial<MaterialCodeItem> = {}

    // 자재코드 유효성 검증 - 필수값, 형식, 중복 체크
    if (!item.materialCode.trim()) {
      errors.materialCode = '자재코드를 입력해주세요.'
    } else if (!/^[A-Z0-9]{3,10}$/.test(item.materialCode)) {
      errors.materialCode = '자재코드는 3-10자의 영문 대문자와 숫자만 사용 가능합니다.'
    } else {
      // 중복 자재코드 체크: 기존 할당된 자재코드는 수정 모드에서 제외
      const isDuplicateExistingCode = existingCodes.includes(item.materialCode)
      const isEditingExistingCode = item.assignmentId && modalState.mode === 'assign'

      if (isDuplicateExistingCode && !isEditingExistingCode) {
        errors.materialCode = '이미 존재하는 자재코드입니다.'
      }
    }

    // 자재명 유효성 검증 - 필수값, 최소 길이 체크
    if (!item.materialName.trim()) {
      errors.materialName = '자재명을 입력해주세요.'
    } else if (item.materialName.length < 2) {
      errors.materialName = '자재명은 2자 이상 입력해주세요.'
    }

    return errors
  }

  // validateAllItems 메서드 - 전체 폼 유효성 검증 함수
  const validateAllItems = (): boolean => {
    let hasErrors = false
    const allCodes = materialCodeList.map(item => item.materialCode.trim().toUpperCase())

    setMaterialCodeList(prev =>
      prev.map(item => {
        const errors = validateMaterialCodeItem(item)

        // 목록 내 중복 검사 - 같은 자재코드가 여러 개 입력되었는지 확인
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

  // handleSave 메서드 - 저장 처리 함수
  const handleSave = async () => {
    console.log('=== MaterialCodeModal handleSave 시작 ===')
    console.log('modalState:', modalState)
    console.log('materialCodeList:', materialCodeList)
    // 필수 필드 검증 - 자재코드, 자재명, 카테고리 누락 확인
    const missingFields: string[] = []

    materialCodeList.forEach((item, index) => {
      const itemNumber = index + 1
      if (!item.materialCode.trim()) {
        missingFields.push(`${itemNumber}번째 항목의 자재코드`)
      }
      if (!item.materialName.trim()) {
        missingFields.push(`${itemNumber}번째 항목의 자재명`)
      }
      if (!item.materialCategory) {
        missingFields.push(`${itemNumber}번째 항목의 카테고리`)
      }
    })

    if (missingFields.length > 0) {
      toast.error(`다음 필드를 입력해주세요: ${missingFields.join(', ')}`)
      return
    }

    if (!validateAllItems()) {
      toast.error('자재코드 형식이나 중복된 항목이 있는지 확인해주세요.')
      return
    }

    // 모달 모드에 따른 저장 처리 분기
    try {
      console.log('저장 처리 시작 - 모드:', modalState.mode)
      if (modalState.mode === 'edit') {
        // 편집 모드: 단일 항목만 처리
        const item = materialCodeList[0]
        const requestData: MaterialCodeUpdateRequest = {
          materialName: item.materialName.trim(),
          materialDescription: item.materialDescription?.trim() || undefined,
          materialCategory: item.materialCategory || undefined
        }
        await onSave(requestData)
      } else if (modalState.mode === 'assign') {
        // 할당 모드: 기존 자재코드와 새 자재코드 분리 처리
        const existingItems = materialCodeList.filter(item => item.assignmentId)
        const newItems = materialCodeList.filter(item => !item.assignmentId)

        // 기존 자재코드 수정 처리
        for (const item of existingItems) {
          if (!item.assignmentId) continue

          // 매핑된 자재코드는 수정 불가
          if (item.isMapped) {
            toast.error(`매핑된 자재코드 ${item.materialCode}는 수정할 수 없습니다.`)
            continue
          }

          try {
            const updateRequest: MaterialCodeUpdateRequest = {
              materialCode: item.materialCode.trim().toUpperCase(),
              materialName: item.materialName.trim(),
              materialDescription: item.materialDescription?.trim() || undefined,
              materialCategory: item.materialCategory || undefined
            }

            // updateAssignment API 호출 (PartnerTable에서 별도 처리 필요)
            await materialAssignmentService.updateAssignment(item.assignmentId, {
              materialInfo: {
                materialCode: updateRequest.materialCode || item.materialCode,
                materialName: updateRequest.materialName || item.materialName,
                materialCategory: updateRequest.materialCategory,
                materialDescription: updateRequest.materialDescription
              },
              toPartnerId: modalState.partnerId || ''
            })

            console.log(`기존 자재코드 수정 완료: ${item.materialCode}`)
          } catch (error) {
            console.error(`기존 자재코드 수정 실패 (${item.materialCode}):`, error)
            const errorMessage =
              error instanceof Error ? error.message : '수정 중 오류가 발생했습니다.'
            toast.error(`${item.materialCode} 수정 실패: ${errorMessage}`)
          }
        }

        // 새 자재코드 생성 처리
        if (newItems.length > 0) {
          if (newItems.length === 1) {
            // 단일 자재코드 생성 - MaterialCodeCreateRequest 구조 사용
            const item = newItems[0]
            const requestData: MaterialCodeCreateRequest = {
              materialCode: item.materialCode.trim().toUpperCase(),
              materialName: item.materialName.trim(),
              materialCategory: item.materialCategory || undefined,
              materialDescription: item.materialDescription?.trim() || undefined
            }
            console.log('할당 모드 - 단일 자재코드 생성 요청:', requestData)
            console.log('toPartnerId 값:', modalState.partnerId)
            await onSave(requestData)
          } else {
            // 다중 자재코드 일괄 생성
            const requestData: MaterialCodeBatchCreateRequest = {
              materialCodes: newItems.map(item => ({
                materialCode: item.materialCode.trim().toUpperCase(),
                materialName: item.materialName.trim(),
                materialDescription: item.materialDescription?.trim() || undefined,
                materialCategory: item.materialCategory || undefined
              })),
              toPartnerId: modalState.partnerId,
              assignmentNote: `${newItems.length}개 자재코드 일괄 생성`
            }
            await onSave(requestData)
          }
        }

        // 기존 항목만 있고 새 항목이 없는 경우
        if (existingItems.length > 0 && newItems.length === 0) {
          toast.info('기존 자재코드 수정이 완료되었습니다.')
        }
      } else {
        // 생성 모드: 단일 또는 다중 처리
        if (materialCodeList.length === 1) {
          // 단일 자재코드 생성 - MaterialCodeCreateRequest 구조 사용
          const item = materialCodeList[0]
          const requestData: MaterialCodeCreateRequest = {
            materialCode: item.materialCode.trim().toUpperCase(),
            materialName: item.materialName.trim(),
            materialCategory: item.materialCategory || undefined,
            materialDescription: item.materialDescription?.trim() || undefined
          }
          console.log('=== 단일 자재코드 생성 디버깅 ===')
          console.log(
            '일반 모드 - 단일 자재코드 생성 요청:',
            JSON.stringify(requestData, null, 2)
          )
          console.log('toPartnerId 값:', modalState.partnerId)
          console.log('toPartnerId 타입:', typeof modalState.partnerId)
          console.log('toPartnerId 길이:', modalState.partnerId?.length)
          console.log('materialInfo 검증:', {
            materialCode: requestData.materialCode,
            materialName: requestData.materialName,
            materialCodeEmpty: !requestData.materialCode,
            materialNameEmpty: !requestData.materialName
          })
          await onSave(requestData)
        } else {
          // 다중 자재코드 일괄 생성
          const requestData: MaterialCodeBatchCreateRequest = {
            materialCodes: materialCodeList.map(item => ({
              materialCode: item.materialCode.trim().toUpperCase(),
              materialName: item.materialName.trim(),
              materialDescription: item.materialDescription?.trim() || undefined,
              materialCategory: item.materialCategory || undefined
            })),
            toPartnerId: modalState.partnerId,
            assignmentNote: `${materialCodeList.length}개 자재코드 일괄 생성`
          }
          await onSave(requestData)
        }
      }

      console.log('저장 성공 - 모달 닫는 중...')
      onClose()
    } catch (error) {
      console.error('=== 자재코드 저장 실패 ===')
      console.error('에러 상세 정보:', error)
      console.error(
        '에러 메시지:',
        error instanceof Error ? error.message : '알 수 없는 에러'
      )

      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any
        console.error('백엔드 에러 응답:', axiosError.response?.data)
        console.error('상태 코드:', axiosError.response?.status)
      }
    }
  }

  // getModalTitle 메서드 - 모달 제목 결정
  const getModalTitle = () => {
    switch (modalState.mode) {
      case 'create':
        return materialCodeList.length > 1 ? '새 자재코드 추가 ' : '새 자재코드 추가'
      case 'edit':
        return '자재코드 수정'
      case 'assign':
        return existingAssignments.length > 0 ? '자재코드 관리' : '자재코드 할당'
      default:
        return '자재코드 관리'
    }
  }

  // getModalIcon 메서드 - 모달 아이콘 결정
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

  // 폼 유효성 검증 - 모달 모드에 따라 검증 대상 결정
  const isFormValid = (() => {
    // 할당 모드인 경우, 새 자재코드만 검증
    if (modalState.mode === 'assign') {
      const newItems = materialCodeList.filter(item => !item.assignmentId)
      return (
        newItems.length === 0 ||
        newItems.every(
          item =>
            item.materialCode.trim() && item.materialName.trim() && item.materialCategory
        )
      )
    }

    // 일반 모드인 경우 모든 항목 검증
    return materialCodeList.every(
      item =>
        item.materialCode.trim() && item.materialName.trim() && item.materialCategory
    )
  })()

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
                  {modalState.mode === 'assign' ? '새 자재코드 추가' : '추가'}
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
                        {item.assignmentId ? '할당된 자재코드' : `자재코드 #${index + 1}`}
                      </span>
                      {item.assignmentId && (
                        <Badge
                          variant="outline"
                          className="text-xs text-blue-600 border-blue-200 bg-blue-50">
                          기존 할당
                        </Badge>
                      )}
                    </div>
                    {/* 삭제 버튼 조건부 렌더링 - 모달 모드에 따라 삭제 버튼 표시 여부 결정 */}
                    {(() => {
                      // 편집 모드에서는 삭제 버튼 표시 안함
                      if (modalState.mode === 'edit') return null

                      // 할당 모드에서 기존 할당 항목인 경우 삭제 버튼 표시
                      if (modalState.mode === 'assign' && item.assignmentId) {
                        const isDeleteDisabled = item.isMapped || isSubmitting
                        return (
                          <div className="flex items-center gap-2">
                            {item.isMapped && (
                              <Badge variant="destructive" className="text-xs">
                                매핑됨
                              </Badge>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (item.isMapped) {
                                  toast.error('매핑된 자재코드는 삭제할 수 없습니다.')
                                  return
                                }
                                handleDeleteAssignment(item)
                              }}
                              disabled={isDeleteDisabled}
                              className={cn(
                                'hover:bg-red-50',
                                item.isMapped
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-red-500 hover:text-red-700'
                              )}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )
                      }

                      // 일반 생성 모드에서는 여러 항목일 때만 삭제 버튼 표시
                      if (materialCodeList.length > 1 && !item.assignmentId) {
                        return (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMaterialCodeItem(item.id)}
                            disabled={isSubmitting}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )
                      }

                      return null
                    })()}
                  </div>

                  {/* 입력 필드들 */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                        disabled={
                          modalState.mode === 'edit' ||
                          (modalState.mode === 'assign' &&
                            !!item.assignmentId &&
                            item.isMapped) ||
                          isSubmitting
                        }
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

                    {/* 카테고리 */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        카테고리
                      </Label>
                      <Select
                        value={item.materialCategory || ''}
                        onValueChange={value =>
                          updateMaterialCodeItem(item.id, 'materialCategory', value)
                        }
                        disabled={isSubmitting}>
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
                  </div>

                  {/* 자재코드 설명 */}
                  <div className="mt-6 space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      자재코드 설명
                    </Label>
                    <div className="relative">
                      <Input
                        value={item.materialDescription || ''}
                        onChange={e =>
                          updateMaterialCodeItem(
                            item.id,
                            'materialDescription',
                            e.target.value
                          )
                        }
                        placeholder="이 자재코드에 대한 상세한 설명을 입력해주세요... (예: 용도, 규격, 특징 등)"
                        className="h-12 transition-all duration-300 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl focus:border-blue-500 focus:from-blue-100 focus:to-indigo-100 placeholder:text-slate-400"
                        disabled={isSubmitting}
                        maxLength={500}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                        선택사항
                      </span>
                      <span
                        className={cn(
                          'font-medium transition-colors',
                          (item.materialDescription?.length || 0) > 400
                            ? 'text-orange-500'
                            : 'text-slate-500'
                        )}>
                        {item.materialDescription?.length || 0}/500자
                      </span>
                    </div>
                  </div>

                  {/* 개별 미리보기 */}
                  {item.materialCode.trim() && item.materialName.trim() && (
                    <div className="p-3 mt-4 border border-blue-200 rounded-lg bg-blue-50">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <Badge className="px-2 py-1 font-mono text-xs font-semibold text-blue-700 bg-blue-100 border-blue-300">
                          {item.materialCode}
                        </Badge>
                        <span className="text-sm font-medium text-blue-800">
                          {item.materialName}
                        </span>
                        {item.materialCategory && (
                          <Badge variant="outline" className="text-xs text-blue-600">
                            {
                              MATERIAL_CATEGORIES.find(
                                cat => cat.value === item.materialCategory
                              )?.label
                            }
                          </Badge>
                        )}
                      </div>
                      {item.materialDescription?.trim() && (
                        <div className="text-xs text-blue-700 bg-blue-50">
                          {item.materialDescription}
                        </div>
                      )}
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
                      <div key={item.id} className="space-y-1">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="w-4 text-xs font-medium text-green-600">
                            {index + 1}.
                          </span>
                          <Badge className="px-2 py-1 font-mono text-xs font-semibold text-green-700 bg-green-100 border-green-300">
                            {item.materialCode}
                          </Badge>
                          <span className="font-medium text-green-800">
                            {item.materialName}
                          </span>
                          {item.materialCategory && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              {
                                MATERIAL_CATEGORIES.find(
                                  cat => cat.value === item.materialCategory
                                )?.label
                              }
                            </Badge>
                          )}
                        </div>
                        {item.materialDescription?.trim() && (
                          <div className="text-xs text-green-700 ml-7">
                            {item.materialDescription}
                          </div>
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
                {/* 모달 모드에 따른 버튼 텍스트 결정 */}
                {(() => {
                  if (modalState.mode === 'create') {
                    return `자재코드 ${
                      materialCodeList.length > 1 ? `${materialCodeList.length}개 ` : ''
                    }추가`
                  } else if (modalState.mode === 'assign') {
                    const newItems = materialCodeList.filter(item => !item.assignmentId)
                    return newItems.length > 0
                      ? `새 자재코드 ${newItems.length}개 추가`
                      : '변경사항 저장'
                  } else {
                    return '변경사항 저장'
                  }
                })()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteConfirmation.isOpen}
        onOpenChange={() => deleteConfirmation.onCancel?.()}>
        <DialogContent className="bg-white border-0 shadow-2xl rounded-2xl sm:max-w-lg">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              자재코드 삭제 확인
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              자재코드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* 삭제할 자재코드 정보 */}
            <div className="p-4 border-2 border-red-200 bg-red-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Package className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <div className="font-semibold text-red-800">
                    {deleteConfirmation.materialCode}
                  </div>
                  <div className="text-sm text-red-600">
                    {deleteConfirmation.materialName}
                  </div>
                </div>
              </div>
            </div>

            {/* 삭제 불가능한 경우 경고 메시지 - 매핑 여부에 따른 삭제 제한 안내 */}
            {!deleteConfirmation.canDelete && (
              <div className="p-4 border-2 border-orange-200 bg-orange-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="mb-1 font-semibold text-orange-800">
                      삭제할 수 없는 자재코드
                    </div>
                    <div className="text-sm text-orange-700">
                      {(() => {
                        const existingAssignment = existingAssignments?.find(
                          a => a.id === deleteConfirmation.assignmentId
                        )
                        const isMapped = existingAssignment?.isMapped || false

                        if (isMapped) {
                          return '이 자재코드는 Scope 계산기에서 사용 중이어서 삭제할 수 없습니다.'
                        } else {
                          return '서버에서 삭제를 거부했습니다. 관리자에게 문의하세요.'
                        }
                      })()}
                    </div>
                    {deleteConfirmation.mappedCodes &&
                      deleteConfirmation.mappedCodes.length > 0 && (
                        <div className="mt-2">
                          <div className="mb-1 text-xs text-orange-600">매핑된 코드:</div>
                          <div className="flex flex-wrap gap-1">
                            {deleteConfirmation.mappedCodes.map((code, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs text-orange-700 bg-orange-100 border-orange-300">
                                {code}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}

            {/* 삭제 가능한 경우 확인 메시지 */}
            {deleteConfirmation.canDelete && (
              <div className="p-4 border-2 border-yellow-200 bg-yellow-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="mb-1 font-semibold text-yellow-800">삭제 확인</div>
                    <div className="text-sm text-yellow-700">
                      이 자재코드를 삭제하면 관련된 모든 정보가 함께 삭제됩니다. 삭제
                      후에는 복구할 수 없습니다.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={deleteConfirmation.onCancel}
              className="px-6 transition-all duration-200 border-2 rounded-lg h-11 border-slate-200 hover:border-slate-300">
              <X className="w-4 h-4 mr-2" />
              취소
            </Button>
            {deleteConfirmation.canDelete && (
              <Button
                type="button"
                onClick={deleteConfirmation.onConfirm}
                className="px-6 font-semibold text-white transition-all duration-200 transform rounded-lg shadow-lg h-11 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:scale-105">
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
