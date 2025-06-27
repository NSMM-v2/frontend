/**
 * 개별 계산기 아이템 컴포넌트
 *
 * 주요 기능:
 * - 계산기 번호 표시 및 삭제 버튼 제공
 * - ExcelCascadingSelector 컴포넌트를 래핑
 * - 계산기별 상태 관리 및 이벤트 처리
 * - NSMM 통일된 블루 디자인 적용
 *
 * 디자인 특징:
 * - 통일된 블루 색상 체계
 * - 부드러운 그림자 효과
 * - 직관적인 아이콘과 레이아웃
 * - 반응형 디자인
 * - 모드별 제목 구분 (중복 방지)
 *
 * @author ESG Project Team
 * @version 3.0
 * @since 2024
 * @lastModified 2024-12-20
 */

import React, {useState} from 'react'
import {motion} from 'framer-motion'
import {Button} from '@/components/ui/button'
import {Trash2, Database, Sparkles, AlertTriangle} from 'lucide-react'
import {ExcelCascadingSelector} from './ExcelCascadingSelector'
import {Switch} from '@/components/ui/switch'
import {SelfInputCalculator} from './SelfInputCaculator'
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
import type {SelectorState} from '@/lib/types'
import {showSuccess} from '@/util/toast'

/**
 * CalculatorItem 컴포넌트 Props 타입
 */
interface CalculatorItemProps {
  /** 계산기 고유 ID */
  id: number
  /** 계산기 순서 번호 (1부터 시작) */
  index: number
  /** 현재 입력 상태 */
  state: SelectorState
  /** 총 계산기 개수 */
  totalCount: number
  /** 상태 변경 핸들러 */
  onChangeState: (id: number, newState: SelectorState) => void
  /** 배출량 변경 핸들러 */
  onChangeTotal: (id: number, emission: number) => void
  /** 계산기 삭제 핸들러 */
  onRemove: (id: number) => void
  /** 애니메이션 지연 시간 (초) */
  animationDelay?: number
  /** 수동 입력 모드 여부 */
  mode: boolean
  /** 모드 변경 핸들러 */
  onModeChange: (checked: boolean) => void
}

/**
 * CalculatorItem 컴포넌트
 * 개별 계산기를 관리하는 래퍼 컴포넌트
 */
export function CalculatorItem({
  id,
  index,
  state,
  totalCount,
  onChangeState,
  onChangeTotal,
  onRemove,
  animationDelay = 0,
  mode,
  onModeChange
}: CalculatorItemProps) {
  // ========================================================================
  // 상태 관리 (State Management)
  // ========================================================================

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  /**
   * 삭제 확인 핸들러
   * AlertDialog를 통한 세련된 삭제 확인
   */
  const handleDeleteConfirm = () => {
    onRemove(id)
    setShowDeleteDialog(false)
    showSuccess(`${mode ? '수동 입력' : '배출계수 선택'} ${index}이(가) 삭제되었습니다.`)
  }

  /**
   * 상태 변경 핸들러 래퍼
   */
  const handleStateChange = (newState: SelectorState) => {
    onChangeState(id, newState)
  }

  // 모드별 제목 및 설명 설정
  const title = mode ? `수동 입력 ${index}` : `배출계수 선택 ${index}`
  const description = mode
    ? '직접 값을 입력하여 배출량을 계산하세요'
    : '배출계수를 단계별로 선택하여 자동 계산하세요'
  const IconComponent = mode ? Sparkles : Database

  /**
   * 입력된 데이터가 있는지 확인하는 함수
   * 어떤 필드라도 값이 입력되어 있으면 true 반환
   */
  const hasInputData = () => {
    return (
      (state.category && state.category.trim() !== '') ||
      (state.separate && state.separate.trim() !== '') ||
      (state.rawMaterial && state.rawMaterial.trim() !== '') ||
      (state.quantity && state.quantity.trim() !== '') ||
      (state.unit && state.unit.trim() !== '') ||
      (state.kgCO2eq && state.kgCO2eq.trim() !== '')
    )
  }

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: -20}}
      transition={{
        delay: animationDelay,
        duration: 0.4,
        type: 'spring',
        stiffness: 100
      }}
      className="relative w-[80%] mb-8">
      {/* ============================================================================
          메인 카드 컨테이너 (Main Card Container)
          ============================================================================ */}
      <motion.div
        whileHover={{
          scale: 1.01,
          transition: {duration: 0.2}
        }}
        className="overflow-hidden relative bg-white rounded-3xl border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
        {/* ========================================================================
            계산기 헤더 (Calculator Header)
            ======================================================================== */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex relative items-center">
            {/* 계산기 번호 배지 */}
            <motion.div
              initial={{scale: 0}}
              animate={{scale: 1}}
              transition={{
                delay: animationDelay + 0.1,
                duration: 0.3
              }}
              className="flex justify-center items-center mr-5 w-14 h-14 bg-blue-500 rounded-2xl shadow-md">
              <span className="text-lg font-bold text-white">{index}</span>
            </motion.div>

            {/* 계산기 제목 및 설명 */}
            <div className="flex-1">
              <motion.div
                initial={{opacity: 0, x: -20}}
                animate={{opacity: 1, x: 0}}
                transition={{delay: animationDelay + 0.2, duration: 0.4}}>
                <div className="flex items-center mb-1 space-x-2">
                  <IconComponent className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                </div>
                <p className="text-sm text-gray-600">{description}</p>
              </motion.div>
            </div>

            {/* 오른쪽 컨트롤 영역 */}
            <div className="flex items-center space-x-4">
              {/* 수동 입력 모드 토글 */}
              <motion.div
                initial={{opacity: 0, scale: 0.8}}
                animate={{opacity: 1, scale: 1}}
                transition={{delay: animationDelay + 0.3, duration: 0.3}}
                className="flex items-center px-4 py-2 space-x-3 bg-white rounded-xl border border-blue-200 shadow-sm transition-all hover:bg-blue-50">
                {/* 토글 스위치 */}
                <Switch
                  checked={mode}
                  onCheckedChange={onModeChange}
                  className="data-[state=checked]:bg-blue-500"
                />

                {/* 라벨 */}
                <span
                  className={`text-sm font-medium transition-colors ${
                    mode ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                  수동입력
                </span>
              </motion.div>

              {/* 삭제 버튼 - 입력된 데이터가 있으면 상시 표시 */}
              {hasInputData() && (
                <motion.div
                  initial={{opacity: 0, scale: 0.8}}
                  animate={{opacity: 1, scale: 1}}
                  transition={{delay: animationDelay + 0.4, duration: 0.3}}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="px-4 py-2 text-red-500 bg-red-50 rounded-xl border border-red-200 transition-all duration-200 hover:text-red-700 hover:bg-red-100 hover:border-red-300 hover:scale-105">
                    <Trash2 className="mr-2 w-4 h-4" />
                    <span className="font-medium">삭제</span>
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================
            계산기 컴포넌트 영역 (Calculator Component Area)
            ======================================================================== */}
        <motion.div
          initial={{opacity: 0, y: 10}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: animationDelay + 0.6, duration: 0.4}}
          className="p-6">
          {mode ? (
            <SelfInputCalculator
              id={id}
              state={{
                category: state.category ?? '',
                separate: state.separate ?? '',
                rawMaterial: state.rawMaterial ?? '',
                quantity: state.quantity ?? '',
                unit: state.unit ?? '',
                kgCO2eq: state.kgCO2eq ?? ''
              }}
              onChangeState={handleStateChange}
              onChangeTotal={onChangeTotal}
            />
          ) : (
            <ExcelCascadingSelector
              id={id}
              state={state}
              onChangeState={handleStateChange}
              onChangeTotal={onChangeTotal}
            />
          )}
        </motion.div>
      </motion.div>

      {/* ============================================================================
          계산기 간 구분선 (Inter-Calculator Divider)
          ============================================================================ */}
      {index < totalCount && (
        <motion.div
          initial={{scaleX: 0}}
          animate={{scaleX: 1}}
          transition={{delay: animationDelay + 0.7, duration: 0.3}}
          className="relative mt-6 mb-2">
          {/* 심플한 구분선 */}
          <div className="h-px bg-blue-200" />

          {/* 중앙 포인트 */}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2" />
        </motion.div>
      )}

      {/* ============================================================================
          삭제 확인 다이얼로그 (Delete Confirmation Dialog)
          ============================================================================ */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center mb-2 space-x-3">
              <div className="flex justify-center items-center w-12 h-12 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                  계산기 삭제 확인
                </AlertDialogTitle>
              </div>
            </div>
          </AlertDialogHeader>

          <AlertDialogDescription className="space-y-3 leading-relaxed text-gray-600">
            <span className="block">
              <span className="font-medium text-gray-900">
                {mode ? '수동 입력' : '배출계수 선택'} {index}
              </span>
              을(를) 삭제하시겠습니까?
            </span>
            <span className="block text-sm text-red-600">
              입력된 모든 데이터가 완전히 삭제되며, 이 작업은 되돌릴 수 없습니다.
            </span>
          </AlertDialogDescription>

          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg border-0 transition-all hover:bg-gray-200">
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="px-6 py-2 text-white bg-red-600 rounded-lg border-0 transition-all hover:bg-red-700">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
