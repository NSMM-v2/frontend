import {ReactNode} from 'react'

interface InputWithIconProps {
  header: string
  placeholder?: string
  icon: ReactNode
  type?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  required?: boolean
  autoComplete?: string
}

export default function InputWithIcon({
  header,
  placeholder,
  icon,
  type = 'text',
  value,
  onChange,
  disabled = false,
  required = false,
  autoComplete
}: InputWithIconProps) {
  return (
    <div className="flex flex-col w-full gap-1">
      <div className="flex flex-row w-full gap-1 items-center">
        {icon}
        <span
          className={required ? "after:content-['*'] after:text-red-500 after:ml-1" : ''}>
          {header}
        </span>
      </div>
      <input
        type={type}
        className="w-full h-10 border rounded-lg pl-2 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        placeholder={placeholder || header}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  )
}
