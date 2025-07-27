'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

// 색상 팔레트 정의
const palette = {
  blue: '#2D5BFF',
  cyan: '#2AD1E2', 
  yellow: '#FFC02D',
  red: '#FF5757',
  purple: '#7542E2',
  orange: '#FF764A'
}

// 공통 차트 옵션
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#374151',
        font: {
          size: 14,
          family: "'Noto Sans KR', sans-serif"
        }
      }
    },
    tooltip: {
      bodyFont: {
        family: "'Noto Sans KR', sans-serif"
      },
      titleFont: {
        family: "'Noto Sans KR', sans-serif"
      }
    }
  }
}

// Scope별 탄소 배출량 차트 컴포넌트
export function ScopeEmissionsChart() {
  const data = {
    labels: ['Scope 1: 직접 배출', 'Scope 2: 간접 에너지', 'Scope 3: 기타 간접'],
    datasets: [{
      label: '탄소 배출량',
      data: [15, 25, 60],
      backgroundColor: [palette.yellow, palette.orange, palette.red],
      borderColor: '#f9fafb',
      borderWidth: 4,
      hoverOffset: 8
    }]
  }

  const options = {
    ...commonOptions,
    cutout: '60%',
    plugins: {
      ...commonOptions.plugins,
      legend: {
        ...commonOptions.plugins?.legend,
        position: 'bottom' as const,
      }
    }
  }

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-200">
      <h4 className="text-xl font-bold mb-4 text-center">전체 탄소 배출량 구성 (Scope별)</h4>
      <p className="text-center text-gray-600 mb-4">공급망 전체에서 발생하는 탄소 배출량 중, 간접 배출(Scope 3)이 가장 큰 비중을 차지하여 관리가 시급함을 보여줍니다.</p>
      <div className="relative w-full max-w-md mx-auto h-80">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  )
}

// 협력사별 탄소 배출량 차트 컴포넌트
export function SupplierEmissionsChart() {
  const data = {
    labels: ['협력사 A', '협력사 B', '협력사 C', '협력사 D', '협력사 E'],
    datasets: [{
      label: '탄소 배출량 (tCO2e)',
      data: [850, 1200, 700, 950, 1500],
      backgroundColor: [palette.blue, palette.cyan, palette.blue, palette.cyan, palette.red],
      borderRadius: 6
    }]
  }

  const options = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#e5e7eb' },
        ticks: { 
          color: '#4b5563',
          font: {
            family: "'Noto Sans KR', sans-serif"
          }
        }
      },
      x: {
        grid: { display: false },
        ticks: { 
          color: '#4b5563',
          font: {
            family: "'Noto Sans KR', sans-serif"
          }
        }
      }
    }
  }

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-200">
      <h4 className="text-xl font-bold mb-4 text-center">주요 협력사별 탄소 배출량 비교</h4>
      <p className="text-center text-gray-600 mb-4">협력사별 배출량을 비교 분석하여, 탄소 감축 노력이 필요한 파트너를 식별하고 집중 관리할 수 있습니다.</p>
      <div className="relative w-full h-80">
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}

// CSDDD 자가진단 위반 리스크 차트 컴포넌트  
export function CSDDDRiskChart() {
  // 긴 라벨을 여러 줄로 나누는 함수
  const wrapLabel = (label: string, maxLength: number = 20): string[] => {
    if (label.length <= maxLength) {
      return [label]
    }
    const words = label.split(' ')
    const lines: string[] = []
    let currentLine = ''
    
    for (const word of words) {
      if ((currentLine + ' ' + word).length > maxLength && currentLine.length > 0) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = currentLine ? currentLine + ' ' + word : word
      }
    }
    if (currentLine) {
      lines.push(currentLine)
    }
    return lines
  }

  const csdddLabels = [
    '강제 노동 및 아동 노동 리스크', 
    '산업 안전 및 보건에 관한 리스크', 
    '수질 및 대기 오염 관련 리스크', 
    '뇌물 및 부패 방지 정책 미비', 
    '공급망 실사 관련 거버넌스 부재'
  ].map(label => wrapLabel(label, 20))

  const data = {
    labels: csdddLabels,
    datasets: [{
      label: '중대 위반 건수',
      data: [28, 45, 33, 15, 52],
      backgroundColor: [palette.red, palette.orange, palette.yellow, palette.purple, palette.red],
      borderColor: '#ffffff',
      borderWidth: 2,
      borderRadius: 4
    }]
  }

  const options = {
    ...commonOptions,
    indexAxis: 'y' as const,
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: '#e5e7eb' },
        ticks: { 
          color: '#4b5563',
          font: {
            family: "'Noto Sans KR', sans-serif"
          }
        }
      },
      y: {
        grid: { display: false },
        ticks: { 
          color: '#374151',
          font: { 
            size: 12,
            family: "'Noto Sans KR', sans-serif"
          }
        }
      }
    },
    plugins: {
      ...commonOptions.plugins,
      tooltip: {
        ...commonOptions.plugins?.tooltip,
        callbacks: {
          title: function(tooltipItems: any) {
            const item = tooltipItems[0]
            let label = item.chart.data.labels[item.dataIndex]
            return Array.isArray(label) ? label.join(' ') : label
          }
        }
      }
    }
  }

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-200 lg:col-span-2">
      <h4 className="text-xl font-bold mb-4 text-center">CSDDD 자가진단 위반 리스크 현황</h4>
      <p className="text-center text-gray-600 mb-4 max-w-3xl mx-auto">EU 실사 지침의 주요 항목별 위반 현황을 파악하여, 인권 및 환경 분야의 잠재적 리스크에 선제적으로 대응할 수 있습니다.</p>
      <div className="relative w-full h-96 md:h-[450px] max-h-[500px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}