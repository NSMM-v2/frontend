import {Metadata} from 'next'
import LandingPage from '@/components/landing/LandingPage'

export const metadata: Metadata = {
  title: 'ESG Manager - 지속가능한 미래를 위한 ESG 관리 플랫폼',
  description:
    '본사와 협력사의 환경, 사회, 거버넌스 데이터를 통합 관리하고 분석하는 전문 플랫폼',
  keywords: 'ESG, 환경경영, 지속가능경영, 탄소배출, CSDDD, 협력사관리',
  openGraph: {
    title: 'ESG Manager - 지속가능한 미래를 위한 ESG 관리 플랫폼',
    description:
      '본사와 협력사의 환경, 사회, 거버넌스 데이터를 통합 관리하고 분석하는 전문 플랫폼',
    type: 'website'
  }
}

export default function Home() {
  return <LandingPage />
}
