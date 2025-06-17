import {Metadata} from 'next'
import SelfAssessmentForm from './selfAssessmentForm'

export const metadata: Metadata = {
  title: '공급망 실사 자가진단',
  description: 'NSMM - 공급망 실사 자가진단 페이지'
}

export default function SelfAssessmentPage() {
  return (
    <div className="flex items-center justify-center flex-1">
      <SelfAssessmentForm />
    </div>
  )
}
