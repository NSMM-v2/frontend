"use client"

import { useState } from "react"
import ExcelCascadingSelector from "./scope3Form"
import { Button } from "@/components/ui/button"

export default function Scope1Page() {
  const [calculators, setCalculators] = useState([{ id: 1 }])
  const [totals, setTotals] = useState<{ id: number; emission: number }[]>([])

  const addCalculator = () => {
    const newId = calculators.length + 1
    setCalculators([...calculators, { id: newId }])
  }

  const updateTotal = (id: number, emission: number) => {
    setTotals((prev) => {
      const existing = prev.find((t) => t.id === id)
      if (existing) {
        return prev.map((t) => (t.id === id ? { id, emission } : t))
      } else {
        return [...prev, { id, emission }]
      }
    })
  }

  const totalEmission = totals.reduce((sum, t) => sum + t.emission, 0)

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4 p-4">

      {calculators.map((calc) => (
        <ExcelCascadingSelector key={calc.id} id={calc.id} onChangeTotal={updateTotal} />
      ))}

      <Button onClick={addCalculator}>추가</Button>

      <div className="mt-4 text-lg font-bold">
        총 이산화탄소 배출량: {totalEmission.toFixed(2)} kgCO₂
      </div>
    </div>
  )
}