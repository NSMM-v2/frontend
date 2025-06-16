import {ReactNode} from 'react'

interface InputWithIconProps {
  header: string
  placeholder?: string
  icon: ReactNode
}

export default function InputWithIcon({header, placeholder, icon}: InputWithIconProps) {
  return (
    <div className="flex flex-col w-full gap-1">
      <div className="flex flex-row w-full gap-1 items-center">
        {icon}
        <span>{header}</span>
      </div>
      <input
        className="w-full h-10 border rounded-lg pl-2"
        placeholder={placeholder || header}
      />
    </div>
  )
}
