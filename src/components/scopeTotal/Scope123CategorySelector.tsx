import React from 'react'
import {motion} from 'framer-motion'
import {Card, CardHeader, CardTitle} from '@/components/ui/card'
import {usePathname} from 'next/navigation'

// Scope 1 - 고정연소 카테고리 (Stationary Combustion Categories)
export const scope1PotentialCategoryList = {
  list1: '액체 연료', // 경유, 휘발유, 등유 등
  list2: '가스 연료', // LNG, LPG, 도시가스 등
  list3: '고체연료' // 석탄, 코크스, 바이오매스 등
} as const
// Scope 1 - 이동연소 카테고리 (Mobile Combustion Categories)
export const scope1KineticCategoryList = {
  list4: '차량', // 승용차, 트럭, 버스 등
  list5: '항공기', // 비행기, 헬리콥터 등
  list6: '선박' // 화물선, 여객선, 어선 등
} as const
// Scope 1 - 공정배출 카테고리
export const scope1ProcessCategoryList = {
  list7: '제조 배출', // 화학 공정, 금속 가공 등
  list8: '폐수 처리'
} as const
// Scope 1 - 냉매누출 카테고리
export const scope1LeakCategoryList = {
  list9: '냉동/냉방 설비 냉매', // 냉매, 가스 누출
  list10: '소화기 방출'
} as const

// Scope 2 - 전력 카테고리 (Electricity Categories)================================================================================
export const scope2ElectricCategoryList = {
  list11: '전력' // 전력 사용량 (일반전력, 재생에너지)
} as const
// Scope 2 - 스팀 카테고리 (Steam Categories)
export const scope2SteamCategoryList = {
  list12: '스팀' // 스팀 사용량 (A타입, B타입, C타입)
} as const

// Scope 3 - 간접배출 카테고리 (Indirect Emissions Categories)======================================================================
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

// scope1 ======================================================================
export type Scope1PotentialCategoryKey = keyof typeof scope1PotentialCategoryList
export type Scope1KineticCategoryKey = keyof typeof scope1KineticCategoryList
export type Scope1ProcessCategoryKey = keyof typeof scope1ProcessCategoryList
export type Scope1LeakCategoryKey = keyof typeof scope1LeakCategoryList
// scope2 ======================================================================
export type Scope2ElectricCategoryKey = keyof typeof scope2ElectricCategoryList
export type Scope2SteamCategoryKey = keyof typeof scope2SteamCategoryList
// scope3 ======================================================================
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
  const pathname = usePathname()

  // scope3의 경우, 특정 카테고리만 초록색으로 하이라이팅
  const greenScope3Keys = ['list1', 'list2', 'list4', 'list5'] // 초록색으로 표시할 Scope 3 항목

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      transition={{delay: animationDelay, duration: 0.6}}
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Object.entries(categoryList).map(([key, value], index) => {
        const emission = getTotalEmission ? getTotalEmission(key as KeyType) : 0
        const hasData = emission > 0

        // 현재 카테고리가 초록색 표시 대상인지 확인
        const isHighlightedGreen = pathname === '/scope3' && greenScope3Keys.includes(key)

        return (
          <motion.div
            key={key}
            initial={{opacity: 0, scale: 0.9}}
            animate={{opacity: 1, scale: 1}}
            transition={{
              delay: animationDelay + index * 0.05,
              duration: 0.4,
              type: 'spring',
              stiffness: 100
            }}>
            <Card
              className={`cursor-pointer transition-all duration-300 hover:shadow-sm hover:scale-105 ${
                hasData
                  ? isHighlightedGreen
                    ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm w-full'
                    : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm w-full'
                  : 'bg-white hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-25 hover:to-blue-50 w-full'
              }`}
              onClick={() => onCategorySelect(key as KeyType)}>
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {pathname === '/scope3' && (
                      <div className="mb-2 text-xs font-medium text-gray-500">
                        카테고리 {key.replace('list', '')}
                      </div>
                    )}
                    <CardTitle className="text-sm leading-tight text-gray-800 transition-colors hover:text-blue-700">
                      {String(value)}
                    </CardTitle>
                  </div>
                </div>

                {/* 배출량 표시 */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200">
                  <div
                    className={`text-lg font-bold transition-colors ${
                      hasData
                        ? isHighlightedGreen
                          ? 'text-green-600'
                          : 'text-blue-600'
                        : 'text-gray-400'
                    }`}>
                    {emission.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">kgCO₂</div>
                </div>

                {/* 상태 표시 */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200">
                  <div
                    className={`flex items-center text-xs ${
                      hasData
                        ? isHighlightedGreen
                          ? 'text-green-600'
                          : 'text-blue-600'
                        : 'text-gray-500'
                    }`}>
                    <div
                      className={`mr-2 w-2 h-2 rounded-full ${
                        hasData
                          ? isHighlightedGreen
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                          : 'bg-gray-300'
                      }`}
                    />
                    {hasData ? '데이터 입력됨' : '데이터 없음'}
                  </div>
                  <div
                    className={`text-xs transition-colors ${
                      hasData
                        ? isHighlightedGreen
                          ? 'text-green-500'
                          : 'text-blue-500'
                        : 'text-gray-400'
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
