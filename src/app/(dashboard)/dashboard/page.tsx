'use client'
import {useState, useEffect} from 'react'
import DotIndicator from '@/components/tools/dotIndicator'
import ScopeDashboard from './scopeDashboard'
import CSDDDDashboard from './CSDDDDashboard'

export default function Dashboard() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scopeSection = document.getElementById('scope-section')
      const csdddSection = document.getElementById('csddd-section')

      if (!scopeSection || !csdddSection) return

      const scrollY = window.scrollY
      const csdddTop = csdddSection.getBoundingClientRect().top + scrollY
      const windowHeight = window.innerHeight

      // CSDDD 섹션이 화면 중앙에 왔을 때 인덱스 변경
      if (scrollY + windowHeight / 2 >= csdddTop) {
        setCurrentIndex(1)
      } else {
        setCurrentIndex(0)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // 초기 상태 설정

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative flex flex-col flex-1">
      <DotIndicator
        total={2}
        currentIndex={currentIndex}
        onDotClick={index => {
          if (index === 0) {
            window.scrollTo({top: 0, behavior: 'smooth'})
          } else {
            const target = document.getElementById('csddd-section')
            if (target) {
              const top = target.getBoundingClientRect().top + window.scrollY
              window.scrollTo({top, behavior: 'smooth'})
            }
          }
        }}
      />
      <div id="scope-section">
        <ScopeDashboard />
      </div>
      <div id="csddd-section">
        <CSDDDDashboard />
      </div>
    </div>
  )
}
