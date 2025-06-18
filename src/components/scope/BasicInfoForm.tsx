'use client'

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {Building2, AlertCircle} from 'lucide-react'
import type {PartnerCompany} from '@/types/scopeType'

interface BasicInfoFormProps {
  /** 선택된 협력사 정보 */
  selectedPartner: PartnerCompany | undefined
}

/**
 * 협력사 기본 정보를 표시하는 컴포넌트
 *
 * 주요 기능:
 * - 선택된 협력사 정보 표시 (회사명, 사업자번호)
 * - 협력사가 선택되지 않은 경우 경고 메시지 표시
 * - 시각적으로 구분되는 카드 UI 제공
 */
export default function BasicInfoForm({selectedPartner}: BasicInfoFormProps) {
  return (
    <Card className="mb-6">
      <CardContent className="space-y-4">
        {/* 협력사가 선택된 경우 정보 표시 */}
        {selectedPartner && (
          <div className="p-4 border rounded-lg border-customG bg-customGLight">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-white bg-customGDark">
                선택된 협력사
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-gray-900">
                {selectedPartner.companyName}
              </div>
              <div className="flex flex-row w-full space-x-1">
                <div className="text-sm text-gray-600">
                  DART CODE: {selectedPartner.corpCode} /
                </div>
                <div className="text-sm text-gray-600">
                  주식 코드: {selectedPartner.stockCode}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 협력사가 선택되지 않은 경우 경고 메시지 */}
        {!selectedPartner && (
          <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                협력사가 선택되지 않았습니다. 먼저 협력사를 선택해주세요.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
