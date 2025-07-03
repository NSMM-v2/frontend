import {Metadata} from 'next'
import PartnerEvaluationForm from './partnerEvaluationForm'

export const metadata: Metadata = {
  title: '공급망 실사 자가진단 협력사 결과',
  description: 'NSMM - 공급망 실사 협력사 자가진단 결과 확인 페이지'
}

export default function PartnerEvaluationFormPage() {
  return (
    <div className="flex items-center justify-center flex-1">
      <PartnerEvaluationForm />
    </div>
  )
}
