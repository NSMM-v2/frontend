"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const fuelOptions = [
  { name: "휘발유", factor: 2.322 },
  { name: "경유", factor: 2.53 },
  { name: "천연가스", factor: 2.75 },
  { name: "프로판", factor: 1.51 },
  { name: "부탄", factor: 1.56 },
  { name: "기타", factor: 2.0 },
]

type Scope1CalculatorProps = {
  id: number
  onChangeTotal: (id: number, emission: number) => void
}

function Scope1Calculator({ id, onChangeTotal }: Scope1CalculatorProps) {
  const [selectedFuel, setSelectedFuel] = useState("")
  const [inputFuel, setInputFuel] = useState("")
  const [amount, setAmount] = useState("")

  const fuel = fuelOptions.find(
    (f) => f.name === selectedFuel || f.name === inputFuel
  )

  const emission = fuel && amount
    ? parseFloat(amount) * fuel.factor
    : 0

  useEffect(() => {
    onChangeTotal(id, emission)
  }, [emission])

  return (
    <div className="flex flex-col gap-2 w-full max-w-md border p-4 rounded-xl shadow">
      <div className="flex items-center gap-2">
        <Input
          value={inputFuel}
          onChange={(e) => setInputFuel(e.target.value)}
          placeholder="연료명 입력"
        />
        <Select
          value={selectedFuel}
          onValueChange={(val) => {
            setSelectedFuel(val)
            setInputFuel(val)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="연료 선택" />
          </SelectTrigger>
          <SelectContent>
            {fuelOptions.map((fuel) => (
              <SelectItem key={fuel.name} value={fuel.name}>
                {fuel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="사용량 (L)"
      />
      <div className="text-sm text-muted-foreground">
        이산화탄소 배출량: {emission.toFixed(2)} kgCO₂
      </div>
    </div>
  )
}

export default Scope1Calculator
