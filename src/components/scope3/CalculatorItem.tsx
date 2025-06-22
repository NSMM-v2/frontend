/**
 * 개별 계산기 아이템 컴포넌트
 *
 * 주요 기능:
 * - 계산기 번호 표시 및 삭제 버튼 제공
 * - ExcelCascadingSelector 컴포넌트를 래핑
 * - 계산기별 상태 관리 및 이벤트 처리
 *
 * @author ESG Project Team
 * @version 1.0
 * @since 2024
 */

import React from 'react'
import {motion} from 'framer-motion'
import {Button} from '@/components/ui/button'
import {Trash2} from 'lucide-react'
import {ExcelCascadingSelector, SelectorState} from './ExcelCascadingSelector'

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
  animationDelay = 0
}: CalculatorItemProps) {
  /**
   * 계산기 삭제 핸들러
   * 확인 대화상자를 통해 삭제 여부 확인
   */
  const handleRemove = () => {
    const confirmed = window.confirm(
      `입력 항목 ${index}을(를) 삭제하시겠습니까?\n입력된 데이터가 모두 삭제됩니다.`
    )

    if (confirmed) {
      onRemove(id)
    }
  }

  /**
   * 상태 변경 핸들러 래퍼
   */
  const handleStateChange = (newState: SelectorState) => {
    onChangeState(id, newState)
  }

  return (
    <motion.div
      initial={{opacity: 0, y: 20, scale: 0.95}}
      animate={{opacity: 1, y: 0, scale: 1}}
      exit={{opacity: 0, y: -20, scale: 0.95}}
      transition={{
        delay: animationDelay,
        duration: 0.4,
        type: 'spring',
        stiffness: 100
      }}
      className="relative">
      {/* ========================================================================
          계산기 헤더 (Calculator Header)
          - 계산기 번호 표시 및 삭제 버튼
          ======================================================================== */}
      <div className="flex items-center mb-4">
        {/* 계산기 번호 원형 배지 */}
        <motion.div
          initial={{scale: 0}}
          animate={{scale: 1}}
          transition={{delay: animationDelay + 0.1, duration: 0.3}}
          className="flex justify-center items-center mr-4 w-12 h-12 text-lg font-bold text-white bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-md">
          {index}
        </motion.div>

        {/* 계산기 제목 */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-customG-800">입력 항목 {index}</h3>
          <p className="text-sm text-customG-600">
            배출계수를 선택하고 수량을 입력하세요
          </p>
        </div>

        {/* 삭제 버튼 (계산기가 2개 이상일 때만 표시) */}
        {totalCount > 1 && (
          <motion.div
            initial={{opacity: 0, scale: 0.8}}
            animate={{opacity: 1, scale: 1}}
            transition={{delay: animationDelay + 0.2, duration: 0.3}}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="ml-4 text-red-500 transition-all duration-200 hover:text-red-700 hover:bg-red-50 hover:scale-105">
              <Trash2 className="mr-2 w-4 h-4" />
              삭제
            </Button>
          </motion.div>
        )}
      </div>

      {/* ========================================================================
          계산기 컴포넌트 (Calculator Component)
          - ExcelCascadingSelector 컴포넌트 렌더링
          ======================================================================== */}
      <motion.div
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{delay: animationDelay + 0.3, duration: 0.4}}>
        <ExcelCascadingSelector
          id={id}
          state={state}
          onChangeState={handleStateChange}
          onChangeTotal={onChangeTotal}
        />
      </motion.div>

      {/* ========================================================================
          구분선 (Divider)
          - 마지막 계산기가 아닐 때만 표시
          ======================================================================== */}
      {index < totalCount && (
        <motion.div
          initial={{scaleX: 0}}
          animate={{scaleX: 1}}
          transition={{delay: animationDelay + 0.4, duration: 0.3}}
          className="mt-8 mb-2 h-px bg-gradient-to-r from-transparent to-transparent via-customG-200"
        />
      )}
    </motion.div>
  )
}
