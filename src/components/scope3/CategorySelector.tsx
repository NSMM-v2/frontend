import React from 'react'
import {motion} from 'framer-motion'
import {Card, CardHeader, CardTitle} from '@/components/ui/card'
import {SelectorState} from '@/lib/types'

export const scope1PotentialCategoryList = {
  list1: '액체 연료',
  list2: '가스 연료',
  list3: '고체연료'
} as const

export const scope1KineticCategoryList = {
  list1: '차량',
  list2: '항공기',
  list3: '선박'
} as const

export const scope2ElectricCategoryList = {
  list1: '전력'
} as const

export const scope2SteamCategoryList = {
  list1: '스팀'
} as const

export const scope3CategoryList = {
  list1: '구매한 상품 및 서비스',
  list2: '자본재',
  list3: '연료 및 에너지 관련 활동',
  list4: '업스트림 운송 및 유통',
  list5: '폐기물 처리',
  list6: '사업장 관련 활동',
  list7: '직원 통근',
  list8: '출장',
  list9: '다운스트림 및 유통',
  list10: '판매 후 처리',
  list11: '제품 사용',
  list12: '제품 폐기',
  list13: '임대 자산',
  list14: '프랜차이즈',
  list15: '투자'
} as const

export type Scope1PotentialCategoryKey = keyof typeof scope1PotentialCategoryList
export type Scope1KineticCategoryKey = keyof typeof scope1KineticCategoryList
export type Scope2ElectricCategoryKey = keyof typeof scope2ElectricCategoryList
export type Scope2SteamCategoryKey = keyof typeof scope2SteamCategoryList
export type Scope3CategoryKey = keyof typeof scope3CategoryList

interface CategorySelectorProps<KeyType extends string> {
  categoryList: Record<KeyType, string>
  getTotalEmission?: (category: KeyType) => number
  onCategorySelect: (category: KeyType) => void
  animationDelay?: number
}

export function CategorySelector<KeyType extends string>({
  categoryList,
  getTotalEmission,
  onCategorySelect,
  animationDelay = 0
}: CategorySelectorProps<KeyType>) {
  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      transition={{delay: animationDelay, duration: 0.6}}
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {(Object.entries(categoryList) as [KeyType, string][]).map(
        ([key, value], index) => {
          const categoryKey = key as KeyType
          const emission = getTotalEmission?.(categoryKey) ?? 0
          const hasData = emission > 0

          return (
            <motion.div
              key={categoryKey}
              initial={{opacity: 0, scale: 0.9}}
              animate={{opacity: 1, scale: 1}}
              transition={{
                delay: animationDelay + index * 0.05,
                duration: 0.4,
                type: 'spring',
                stiffness: 100
              }}>
              <Card
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                  hasData
                    ? 'bg-gradient-to-br from-blue-50 to-emerald-50 border-blue-200 shadow-md'
                    : 'bg-white hover:border-customG-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-25'
                }`}
                onClick={() => onCategorySelect(categoryKey)}>
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 text-xs font-medium text-customG-500">
                        카테고리 {categoryKey.replace('list', '')}
                      </div>
                      <CardTitle className="text-sm leading-tight transition-colors text-customG-800 hover:text-blue-700">
                        {value}
                      </CardTitle>
                    </div>
                    <div className="ml-3 text-right">
                      <div
                        className={`text-lg font-bold transition-colors ${
                          hasData ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                        {emission.toFixed(1)}
                      </div>
                      <div className="text-xs text-customG-500">kgCO₂</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200">
                    <div
                      className={`flex items-center text-xs ${
                        hasData ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                      <div
                        className={`mr-2 w-2 h-2 rounded-full ${
                          hasData ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      />
                      {hasData ? '데이터 입력됨' : '데이터 없음'}
                    </div>
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
        }
      )}
    </motion.div>
  )
}
