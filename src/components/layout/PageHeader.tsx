'use client'

import {motion} from 'framer-motion'
import {ReactNode} from 'react'
import {cn} from '@/lib/utils'

type PageHeaderProps = {
  icon?: ReactNode
  title: string
  description?: string
  gradient?: string
  iconColor?: string
  module?: 'GRI' | 'CSDDD' | 'TCFD' | 'SCOPE' | 'PARTNERCOMPANY' | string
  submodule?:
    | 'governance'
    | 'strategy'
    | 'goal'
    | 'eudd'
    | 'hrdd'
    | 'edd'
    | 'managePartner'
    | 'financialRisk'
    | 'scope1'
    | 'scope2'
    | 'euddResult'
    | 'hrddResult'
    | 'eddResult'
    | string
  children?: ReactNode
}

export function PageHeader({
  title,
  description,
  icon,
  module,
  submodule,
  gradient
}: PageHeaderProps) {
  const moduleColors = {
    CSDDD: {base: 'from-blue-600/10 border-blue-600/20'},
    PARTNERCOMPANY: {base: 'from-blue-600/10 border-blue-600/20'},
    SCOPE: {base: 'from-blue-600/10 border-blue-600/20'}
  }

  const subModuleColors: Record<string, string> = {
    eudd: 'from-blue-600/10 border-blue-600/20',
    hrdd: 'from-blue-600/10 border-blue-600/20',
    edd: 'from-blue-600/10 border-blue-600/20',
    managePartner: 'from-blue-600/10 border-blue-600/20',
    financialRisk: 'from-blue-600/10 border-blue-600/20',
    scope1: 'from-blue-600/10 border-blue-600/20',
    scope2: 'from-blue-600/10 border-blue-600/20',
    euddResult: 'from-blue-600/10 border-blue-600/20',
    hrddResult: 'from-blue-600/10 border-blue-600/20',
    eddResult: 'from-blue-600/10 border-blue-600/20'
  }

  const getModuleStyle = () => {
    if (gradient) return gradient
    if (submodule && subModuleColors[submodule]) return subModuleColors[submodule]
    return (
      moduleColors[module as keyof typeof moduleColors]?.base ||
      moduleColors.PARTNERCOMPANY.base
    )
  }

  return (
    <motion.div
      initial={{opacity: 0, y: -10}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.3}}>
      <div className="flex items-center">
        <div
          className={cn(
            'relative flex items-center justify-center w-11 h-11',
            'border-[1.5px] rounded-xl',
            getModuleStyle()
          )}>
          <div className="text-blue-600">{icon}</div>
        </div>
        <div className="ml-4">
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
          {description && <p className="text-sm text-slate-600">{description}</p>}
        </div>
      </div>
    </motion.div>
  )
}
