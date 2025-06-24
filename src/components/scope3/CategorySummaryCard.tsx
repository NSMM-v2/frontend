import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface CategorySummaryCardProps {
  totalEmission: number
  animationDelay?: number
}

export function CategorySummaryCard({
  totalEmission,
  animationDelay = 0
}: CategorySummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: animationDelay, duration: 0.5 }}
      className="max-w-md"
    >
      <Card className="justify-center h-24 bg-gradient-to-br from-blue-50 to-white border-blue-100">
        <CardContent className="flex items-center p-4">
          <div className="p-2 mr-3 bg-blue-100 rounded-full">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">전체 Scope 3 배출량</p>
            <h3 className="text-2xl font-bold">
              {totalEmission.toLocaleString(undefined, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
              })}
              <span className="ml-1 text-sm font-normal text-gray-500">kgCO₂eq</span>
            </h3>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
