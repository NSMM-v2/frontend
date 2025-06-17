import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import React from "react"
const options = [
    "test1",
    "test2",
    "test3",
]

export function ScopeInput({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
    const [userinput, setUserInput] = React.useState<string>("")
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
            
          <SelectValue><Input value={userinput}></Input></SelectValue>
        </SelectTrigger>
        <SelectContent>
            {options.map((option) => (
                <SelectItem
                key={option}
                value={option}
                onClick={() => {
                    setUserInput(option)
                    onChange(option)
                }}
                >
                {option}
                </SelectItem>
            ))}
            <SelectItem
                value="custom"
                onClick={() => {
                setUserInput("")
                onChange("")
                }}
            >
                Custom
            </SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="text"
        placeholder="Custom scope"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}