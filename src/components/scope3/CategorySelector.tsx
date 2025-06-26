/**
 * CategorySelector 컴포넌트
 *
 * 다양한 Scope 카테고리를 선택할 수 있는 카드 그리드 형태의 UI 컴포넌트입니다.
 * Scope1, Scope2, Scope3의 각 카테고리를 시각적으로 표시하고 선택할 수 있습니다.
 *
 * 주요 기능:
 * - 카테고리별 카드 형태 UI 제공
 * - 각 카테고리별 배출량 데이터 표시
 * - 데이터 유무에 따른 시각적 상태 표시
 * - 애니메이션 효과로 부드러운 사용자 경험
 *
 * @author ESG Project Team
 * @version 1.0
 * @since 2024
 */

import React from 'react'
import {motion} from 'framer-motion'
import {Card, CardHeader, CardTitle} from '@/components/ui/card'
import {SelectorState} from '@/lib/types'

/**
 * =============================================================================
 * 카테고리 목록 정의 (Category Lists Definition)
 * =============================================================================
 * 각 Scope별로 사용되는 카테고리 목록을 정의합니다.
 * 이 목록들은 CategorySelector 컴포넌트에서 동적으로 렌더링됩니다.
 */

// Scope 1 - 고정연소 카테고리 (Stationary Combustion Categories)
export const scope1PotentialCategoryList = {
  list1: '액체 연료', // 경유, 휘발유, 등유 등
  list2: '가스 연료', // LNG, LPG, 도시가스 등
  list3: '고체연료' // 석탄, 코크스, 바이오매스 등
} as const

// Scope 1 - 이동연소 카테고리 (Mobile Combustion Categories)
export const scope1KineticCategoryList = {
  list1: '차량', // 승용차, 트럭, 버스 등
  list2: '항공기', // 비행기, 헬리콥터 등
  list3: '선박' // 화물선, 여객선, 어선 등
} as const

// Scope 2 - 전력 카테고리 (Electricity Categories)
export const scope2ElectricCategoryList = {
  list1: '전력' // 전력 사용량 (일반전력, 재생에너지)
} as const

// Scope 2 - 스팀 카테고리 (Steam Categories)
export const scope2SteamCategoryList = {
  list1: '스팀' // 스팀 사용량 (A타입, B타입, C타입)
} as const

// Scope 3 - 간접배출 카테고리 (Indirect Emissions Categories)
export const scope3CategoryList = {
  list1: '구매한 상품 및 서비스', // 원자재, 부품, 서비스 구매
  list2: '자본재', // 건물, 장비, 인프라 투자
  list3: '연료 및 에너지 관련 활동', // 연료 채굴, 운송, 정제
  list4: '업스트림 운송 및 유통', // 공급업체에서 자사까지 운송
  list5: '폐기물 처리', // 운영 중 발생하는 폐기물
  list6: '사업장 관련 활동', // 출장, 통근 등
  list7: '직원 통근', // 직원 출퇴근 교통수단
  list8: '출장', // 업무 관련 출장
  list9: '다운스트림 및 유통', // 자사에서 고객까지 운송
  list10: '판매 후 처리', // 제품 포장재 처리
  list11: '제품 사용', // 제품 사용 단계 배출
  list12: '제품 폐기', // 제품 폐기 단계 배출
  list13: '임대 자산', // 임대 부동산, 장비
  list14: '프랜차이즈', // 프랜차이즈 운영
  list15: '투자' // 투자 포트폴리오 배출
} as const

/**
 * =============================================================================
 * 타입 정의 (Type Definitions)
 * =============================================================================
 * 각 카테고리 목록의 키 타입을 정의하여 타입 안전성을 보장합니다.
 */

export type Scope1PotentialCategoryKey = keyof typeof scope1PotentialCategoryList
export type Scope1KineticCategoryKey = keyof typeof scope1KineticCategoryList
export type Scope2ElectricCategoryKey = keyof typeof scope2ElectricCategoryList
export type Scope2SteamCategoryKey = keyof typeof scope2SteamCategoryList
export type Scope3CategoryKey = keyof typeof scope3CategoryList

/**
 * CategorySelector 컴포넌트의 Props 인터페이스
 *
 * @template KeyType - 카테고리 키의 타입 (string을 상속)
 */
interface CategorySelectorProps<KeyType extends string> {
  /**
   * 카테고리 목록 객체
   * 키: 카테고리 식별자 (예: 'list1', 'list2')
   * 값: 카테고리 표시명 (예: '액체 연료', '가스 연료')
   */
  categoryList: Record<KeyType, string>

  /**
   * 특정 카테고리의 총 배출량을 계산하는 함수 (선택사항)
   * @param category - 카테고리 키
   * @returns 해당 카테고리의 총 배출량 (kgCO₂ 단위)
   */
  getTotalEmission?: (category: KeyType) => number

  /**
   * 카테고리 선택 시 호출되는 콜백 함수
   * @param category - 선택된 카테고리 키
   */
  onCategorySelect: (category: KeyType) => void

  /**
   * 애니메이션 지연 시간 (초 단위, 선택사항)
   * @default 0
   */
  animationDelay?: number
}

/**
 * CategorySelector 컴포넌트
 *
 * 제네릭 타입을 사용하여 다양한 카테고리 목록에 대응할 수 있는
 * 재사용 가능한 카테고리 선택 컴포넌트입니다.
 *
 * @template KeyType - 카테고리 키의 타입
 * @param props - CategorySelectorProps 타입의 props
 * @returns 카테고리 선택 UI 컴포넌트
 */
export function CategorySelector<KeyType extends string>({
  categoryList,
  getTotalEmission,
  onCategorySelect,
  animationDelay = 0
}: CategorySelectorProps<KeyType>) {
  return (
    <motion.div
      // 컨테이너 초기 애니메이션 설정
      initial={{opacity: 0, y: 20}} // 시작: 투명하고 아래쪽에 위치
      animate={{opacity: 1, y: 0}} // 종료: 불투명하고 원래 위치
      transition={{delay: animationDelay, duration: 0.6}} // 지연시간과 지속시간 설정
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* 카테고리 목록을 순회하며 각 카테고리 카드 렌더링 */}
      {Object.entries(categoryList).map(([key, value], index) => {
        // 현재 카테고리의 배출량 계산 (getTotalEmission 함수가 제공된 경우)
        const emission = getTotalEmission ? getTotalEmission(key as KeyType) : 0

        // 데이터 존재 여부 확인 (배출량이 0보다 큰 경우 데이터 있음으로 판단)
        const hasData = emission > 0

        return (
          <motion.div
            key={key}
            // 각 카드의 개별 애니메이션 설정
            initial={{opacity: 0, scale: 0.9}} // 시작: 투명하고 작게
            animate={{opacity: 1, scale: 1}} // 종료: 불투명하고 원래 크기
            transition={{
              delay: animationDelay + index * 0.05, // 순차적 애니메이션 (50ms 간격)
              duration: 0.4, // 애니메이션 지속시간
              type: 'spring', // 스프링 애니메이션 타입
              stiffness: 100 // 스프링 강성도
            }}>
            {/* 카테고리 카드 */}
            <Card
              className={`cursor-pointer transition-all duration-300 hover:shadow-sm hover:scale-105 ${
                hasData
                  ? // 데이터가 있는 경우: 파란색 그라데이션 배경과 테두리
                    'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm'
                  : // 데이터가 없는 경우: 흰색 배경, 호버 시 파란색 효과
                    'bg-white hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-25 hover:to-blue-50'
              }`}
              onClick={() => onCategorySelect(key as KeyType)}>
              <CardHeader className="p-4">
                {/* 카테고리 정보 컨테이너 */}
                <div className="flex justify-between items-start">
                  {/* 카테고리 메인 정보 */}
                  <div className="flex-1">
                    {/* 카테고리 번호 라벨 */}
                    <div className="mb-2 text-xs font-medium text-gray-500">
                      카테고리 {key.replace('list', '')}
                    </div>

                    {/* 카테고리 제목 */}
                    <CardTitle className="text-sm leading-tight text-gray-800 transition-colors hover:text-blue-700">
                      {String(value)}
                    </CardTitle>
                  </div>
                </div>

                {/* 배출량 표시 섹션 */}
                <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                  {/* 배출량 수치 */}
                  <div
                    className={`text-lg font-bold transition-colors ${
                      hasData ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                    {emission.toFixed(1)}
                  </div>

                  {/* 배출량 단위 */}
                  <div className="text-xs text-gray-500">kgCO₂</div>
                </div>

                {/* 데이터 상태 표시 섹션 */}
                <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                  {/* 데이터 상태 인디케이터 */}
                  <div
                    className={`flex items-center text-xs ${
                      hasData ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                    {/* 상태 표시 점 */}
                    <div
                      className={`mr-2 w-2 h-2 rounded-full ${
                        hasData ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                    {/* 상태 텍스트 */}
                    {hasData ? '데이터 입력됨' : '데이터 없음'}
                  </div>

                  {/* 선택 화살표 */}
                  <div
                    className={`text-xs transition-colors ${
                      hasData ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                    →
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
