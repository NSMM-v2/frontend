"use client"

import { useState } from "react"
import ExcelCascadingSelector from "./scope3Form"
import { Button } from "@/components/ui/button"

const scope3CategoryList = {
  list1: "구매한 상품 및 서비스",
  list2: "자본재",
  list3: "연료 및 에너지 관련 활동",
  list4: "업스트림 운송 및 유통",
  list5: "폐기물 처리",
  list6: "사업장 관련 활동",
  list7: "직원 통근",
  list8: "출장",
  list9: "다운스트림 및 유통",
  list10: "판매 후 처리",
  list11: "제품 사용",
  list12: "제품 폐기",
  list13: "임대 자산",
  list14: "프랜차이즈",
  list15: "투자",
} as const

type Scope3CategoryKey = keyof typeof scope3CategoryList

// 입력 상태 타입 정의
type SelectorState = {
  category: string
  separate: string
  rawMaterial: string
  quantity: string
}

export default function Scope3Page() {
  const [activeCategory, setActiveCategory] = useState<Scope3CategoryKey | null>(null)
  const [categoryCalculators, setCategoryCalculators] = useState<{
    [key in Scope3CategoryKey]?: { id: number; state: SelectorState }[]
  }>({})
  const [categoryTotals, setCategoryTotals] = useState<{
    [key in Scope3CategoryKey]?: { id: number; emission: number }[]
  }>({})

  // 현재 활성 카테고리의 계산기 목록 반환
  const getCurrentCalculators = () =>
    activeCategory ? categoryCalculators[activeCategory] || [{ id: 1, state: { category: "", separate: "", rawMaterial: "", quantity: "" } }] : [{ id: 1, state: { category: "", separate: "", rawMaterial: "", quantity: "" } }]

  const updateTotal = (id: number, emission: number) => {
    if (!activeCategory) return

    setCategoryTotals((prev) => {
      const old = prev[activeCategory] || []
      const updated = old.some((t) => t.id === id)
        ? old.map((t) => (t.id === id ? { id, emission } : t))
        : [...old, { id, emission }]
      return { ...prev, [activeCategory]: updated }
    })
  }

  const addCalculator = () => {
    if (!activeCategory) return
    const current = categoryCalculators[activeCategory] || []
    const newId = current.length > 0 ? current[current.length - 1].id + 1 : 1
    setCategoryCalculators((prev) => ({
      ...prev,
      [activeCategory]: [...current, { id: newId, state: { category: "", separate: "", rawMaterial: "", quantity: "" } }],
    }))
  }

  const removeCalculator = (id: number) => {
    if (!activeCategory) return
    setCategoryCalculators((prev) => ({
      ...prev,
      [activeCategory]: (prev[activeCategory] || []).filter((c) => c.id !== id),
    }))
    setCategoryTotals((prev) => ({
      ...prev,
      [activeCategory]: (prev[activeCategory] || []).filter((t) => t.id !== id),
    }))
  }

  // 입력 상태 업데이트 함수
  const updateCalculatorState = (id: number, newState: SelectorState) => {
    if (!activeCategory) return
    setCategoryCalculators((prev) => ({
      ...prev,
      [activeCategory]: (prev[activeCategory] || []).map((c) =>
        c.id === id ? { ...c, state: newState } : c
      ),
    }))
  }

  const totalEmission = (category: Scope3CategoryKey) =>
    (categoryTotals[category] || []).reduce((sum, t) => sum + t.emission, 0)

  const handleComplete = () => {
    setActiveCategory(null)
  }

  return (
    <div className="flex flex-col items-center justify-center w-full p-4">
      {activeCategory === null ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Scope 3 카테고리 선택</h1>
          <div className="grid grid-cols-2 gap-2 w-full max-w-xl">
            {Object.entries(scope3CategoryList).map(([key, value]) => (
              <Button
                key={key}
                variant="outline"
                className="flex justify-between items-center"
                onClick={() => setActiveCategory(key as Scope3CategoryKey)}
              >
                <span>{value}</span>
                <span className="text-sm text-gray-500">
                  {totalEmission(key as Scope3CategoryKey).toFixed(2)} kgCO₂
                </span>
              </Button>
            ))}
          </div>

          <div className="mt-6 font-bold text-xl">
            전체 총 배출량:{" "}
            {Object.keys(scope3CategoryList)
              .reduce(
                (sum, key) =>
                  sum + totalEmission(key as Scope3CategoryKey),
                0
              )
              .toFixed(2)}{" "}
            kgCO₂
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4 w-full items-center">
          <h2 className="text-xl font-semibold mb-2">
            {scope3CategoryList[activeCategory]} - 입력 중
          </h2>
          {getCurrentCalculators().map((calc) => (
            <div key={calc.id} className="w-full max-w-md relative">
              <ExcelCascadingSelector
                id={calc.id}
                state={calc.state}
                onChangeState={(newState) => updateCalculatorState(calc.id, newState)}
                onChangeTotal={updateTotal}
              />
              <button
                onClick={() => removeCalculator(calc.id)}
                className="absolute top-0 right-0 text-red-500 px-2"
              >
                ❌
              </button>
            </div>
          ))}
          <Button onClick={addCalculator}>입력 항목 추가</Button>
          <div className="text-lg font-bold mt-2">
            소계: {totalEmission(activeCategory).toFixed(2)} kgCO₂
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveCategory(null)}>
              취소
            </Button>
            <Button onClick={handleComplete}>입력 완료</Button>
          </div>
        </div>
      )}
    </div>
  )
}
