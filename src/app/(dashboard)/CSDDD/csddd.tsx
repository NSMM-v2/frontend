'use client'

import Link from 'next/link'
import {useState} from 'react'
import {
  Home,
  BookOpen,
  ArrowLeft,
  Check,
  Database,
  Shield,
  Leaf,
  Users,
  FileText,
  AlertTriangle,
  Clock,
  TrendingUp,
  Award,
  BarChart3,
  Download,
  Play
} from 'lucide-react'

// Constants for labels and descriptions
const ASSESSMENT_STATS = [
  {
    label: '평가 항목',
    value: '40개',
    icon: FileText,
    color: 'text-blue-600 bg-blue-50',
    ariaLabel: '평가 항목 아이콘'
  },
  {
    label: '예상 소요시간',
    value: '15-20분',
    icon: Clock,
    color: 'text-green-600 bg-green-50',
    ariaLabel: '예상 소요시간 아이콘'
  },
  {
    label: '완료율',
    value: '94%',
    icon: TrendingUp,
    color: 'text-purple-600 bg-purple-50',
    ariaLabel: '완료율 아이콘'
  },
  {
    label: '인증 등급',
    value: 'A-Grade',
    icon: Award,
    color: 'text-orange-600 bg-orange-50',
    ariaLabel: '인증 등급 아이콘'
  }
]

const COMPLIANCE_AREAS = [
  {
    icon: Users,
    title: '인권 및 노동',
    description: '아동노동, 강제노동, 차별 금지, 결사의 자유',
    items: 9,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-100',
    hoverBorderColor: 'hover:border-red-200',
    iconColor: 'text-red-600'
  },
  {
    icon: AlertTriangle,
    title: '산업안전·보건',
    description: '작업장 안전, 화학물질, 건강검진, 비상대응',
    items: 6,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-100',
    hoverBorderColor: 'hover:border-yellow-200',
    iconColor: 'text-yellow-600'
  },
  {
    icon: Leaf,
    title: '환경경영',
    description: '온실가스, 물·폐기물, 생태계, 환경법 준수',
    items: 8,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-100',
    hoverBorderColor: 'hover:border-green-200',
    iconColor: 'text-green-600'
  },
  {
    icon: FileText,
    title: '공급망 및 조달',
    description: 'ESG 조항 계약, 강제노동 점검, 제보시스템',
    items: 9,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    hoverBorderColor: 'hover:border-blue-200',
    iconColor: 'text-blue-600'
  },
  {
    icon: Shield,
    title: '윤리경영 및 정보보호',
    description: '반부패, 정보보안, 개인정보보호, 책임자 지정',
    items: 8,
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-100',
    hoverBorderColor: 'hover:border-indigo-200',
    iconColor: 'text-indigo-600'
  }
]

// Named function for assessment stats mapping
function renderAssessmentStat(stat: (typeof ASSESSMENT_STATS)[number], index: number) {
  const Icon = stat.icon
  return (
    <div
      key={index}
      className="p-6 transition-all duration-200 bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl hover:scale-105 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{stat.label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
        </div>
        <div className={`p-3 rounded-lg ${stat.color}`}>
          <Icon className="w-6 h-6" aria-label={stat.ariaLabel} role="img" />
        </div>
      </div>
    </div>
  )
}

// Component for 진단 절차 section
function DiagnosisProcedure() {
  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-4">
        <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-white rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-blue-600">
          1
        </div>
        <div className="flex-1">
          <p className="mb-1 font-semibold text-gray-900">사전 준비</p>
          <p className="text-sm text-gray-600">
            공급망 현황, 정책 문서, 계약서 등 관련 자료 검토
          </p>
        </div>
      </div>
      <div className="flex items-start space-x-4">
        <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-white rounded-full shadow-lg bg-gradient-to-r from-indigo-500 to-indigo-600">
          2
        </div>
        <div className="flex-1">
          <p className="mb-1 font-semibold text-gray-900">자가진단 수행</p>
          <p className="text-sm text-gray-600">
            5개 영역 40개 항목에 대한 현황 평가 및 증빙 자료 확인
          </p>
        </div>
      </div>
      <div className="flex items-start space-x-4">
        <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-white rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-purple-600">
          3
        </div>
        <div className="flex-1">
          <p className="mb-1 font-semibold text-gray-900">결과 분석</p>
          <p className="text-sm text-gray-600">
            등급 산정, 위험도 평가, 개선계획 수립 및 보고서 생성
          </p>
        </div>
      </div>
    </div>
  )
}

// Component for Compliance Area Card
function ComplianceAreaCard({
  area,
  index,
  hoveredCard,
  setHoveredCard
}: {
  area: (typeof COMPLIANCE_AREAS)[number]
  index: number
  hoveredCard: number | null
  setHoveredCard: React.Dispatch<React.SetStateAction<number | null>>
}) {
  const Icon = area.icon
  const cardClasses = `p-6 bg-white/80 backdrop-blur-sm border-2 rounded-xl transition-all duration-300 cursor-pointer ${area.bgColor} ${area.borderColor} ${area.hoverBorderColor} hover:scale-105`

  const iconBgClass = area.bgColor.replace('bg-', 'bg-opacity-30') // Slightly transparent background for icon container
  return (
    <div
      key={index}
      className={cardClasses}
      onMouseEnter={() => setHoveredCard(index)}
      onMouseLeave={() => setHoveredCard(null)}>
      <div className="flex items-center justify-between mb-6">
        <div
          className={`p-4 rounded-lg ${area.bgColor} ${area.borderColor} bg-opacity-30`}
          aria-label={`${area.title} 아이콘 배경`}>
          <Icon
            className={`w-7 h-7 ${area.iconColor}`}
            aria-label={`${area.title} 아이콘`}
            role="img"
          />
        </div>
        <span className="px-3 py-1 text-sm font-bold text-gray-600 bg-gray-100 rounded-full shadow-sm">
          {area.items}개 항목
        </span>
      </div>
      <h4 className="mb-3 text-lg font-bold text-gray-900">{area.title}</h4>
      <p className="mb-4 text-sm leading-relaxed text-gray-600">{area.description}</p>
      {hoveredCard === index && (
        <div className="pt-4 duration-200 border-t border-gray-200 animate-in slide-in-from-bottom-2">
          <Link
            href="#"
            className="flex items-center text-sm font-bold text-blue-600 transition-colors hover:text-blue-700"
            aria-label={`${area.title} 상세 항목 보기`}>
            상세 항목 보기
            <ArrowLeft className="w-4 h-4 ml-2 rotate-180" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  )
}

// Component for Compliance Areas Grid
function ComplianceAreasGrid() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  return (
    <div className="mb-8">
      <h3 className="mb-8 text-2xl font-bold text-center text-gray-900">
        주요 평가 영역
      </h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {COMPLIANCE_AREAS.map((area, index) => (
          <ComplianceAreaCard
            key={index}
            area={area}
            index={index}
            hoveredCard={hoveredCard}
            setHoveredCard={setHoveredCard}
          />
        ))}
      </div>
    </div>
  )
}

// Dedicated component for the main CSDDD assessment layout
export function CSDDDLayout() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full shadow-lg">
              <Shield
                className="w-8 h-8 text-blue-600"
                aria-label="CSDDD 아이콘"
                role="img"
              />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900">CSDDD 자가진단 시스템</h1>
          <p className="max-w-4xl mx-auto text-lg text-gray-600">
            유럽연합 공급망 실사 지침(Corporate Sustainability Due Diligence Directive)
            준수를 위한 종합 평가 시스템
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          {ASSESSMENT_STATS.map(renderAssessmentStat)}
        </div>

        {/* Main Assessment Card */}
        <div className="mb-8 overflow-hidden shadow-2xl bg-white/80 backdrop-blur-sm rounded-2xl">
          <div className="px-8 py-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="mb-3 text-3xl font-bold text-white">
                  종합 실사 진단 시작
                </h2>
                <p className="text-lg text-blue-100">
                  40개 핵심 항목을 통한 ESG 리스크 평가 및 준수율 분석
                </p>
              </div>
              <div className="hidden md:block">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm">
                  <BarChart3
                    className="w-10 h-10 text-white"
                    aria-label="바 차트 아이콘"
                    role="img"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div>
                <h3 className="flex items-center gap-2 mb-6 text-xl font-semibold text-gray-900">
                  <Check
                    className="w-5 h-5 text-green-600"
                    aria-label="체크 아이콘"
                    role="img"
                  />
                  평가 특징
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start p-3 space-x-4 border border-green-100 rounded-lg bg-green-50">
                    <div className="w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">실시간 위험도 분석</p>
                      <p className="text-sm text-gray-600">
                        중대 위반 항목 자동 감지 및 등급 조정
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start p-3 space-x-4 border border-blue-100 rounded-lg bg-blue-50">
                    <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">가중치 기반 점수</p>
                      <p className="text-sm text-gray-600">
                        항목별 중요도에 따른 정밀 평가
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start p-3 space-x-4 border border-purple-100 rounded-lg bg-purple-50">
                    <div className="w-2 h-2 mt-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">개선방안 제시</p>
                      <p className="text-sm text-gray-600">
                        카테고리별 맞춤형 액션플랜 제공
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start p-3 space-x-4 border border-orange-100 rounded-lg bg-orange-50">
                    <div className="w-2 h-2 mt-2 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">결과 다운로드</p>
                      <p className="text-sm text-gray-600">
                        상세 보고서 및 분석 결과 제공
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="flex items-center gap-2 mb-6 text-xl font-semibold text-gray-900">
                  <Play
                    className="w-5 h-5 text-blue-600"
                    aria-label="플레이 아이콘"
                    role="img"
                  />
                  진단 절차
                </h3>
                <DiagnosisProcedure />
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-8 mt-8 border-t border-gray-200 sm:flex-row">
              <Link
                href="/CSDDD/self-assessment"
                className="flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 shadow-lg rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-105"
                aria-label="자가진단 시작하기">
                <Play className="w-5 h-5 mr-3" aria-hidden="true" />
                자가진단 시작하기
              </Link>
              <Link
                href="/CSDDD/evaluation"
                className="flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 shadow-lg rounded-xl bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 hover:shadow-xl hover:scale-105"
                aria-label="결과 보기">
                <BarChart3 className="w-5 h-5 mr-3" aria-hidden="true" />
                결과 보기
              </Link>
              <button
                className="flex items-center justify-center px-6 py-4 font-semibold text-gray-700 transition-all duration-200 bg-gray-100 shadow-sm rounded-xl hover:bg-gray-200 hover:shadow-md hover:scale-105"
                aria-label="가이드라인 다운로드"
                type="button">
                <Download className="w-5 h-5 mr-3" aria-hidden="true" />
                가이드라인
              </button>
            </div>
          </div>
        </div>

        <ComplianceAreasGrid />

        {/* Bottom Notice */}
        <div className="p-8 border-2 border-blue-200 shadow-lg bg-blue-50/80 backdrop-blur-sm rounded-2xl">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg shadow-sm">
              <AlertTriangle
                className="w-6 h-6 text-blue-600"
                aria-label="경고 아이콘"
                role="img"
              />
            </div>
            <div className="flex-1">
              <h4 className="mb-4 text-xl font-bold text-blue-900">중요 안내사항</h4>
              <div className="grid grid-cols-1 gap-3 text-sm text-blue-800 md:grid-cols-2">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                  <p>
                    CSDDD는 2024년부터 단계적으로 적용되며, 2027년부터 본격 시행됩니다.
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                  <p>
                    자가진단 결과는 법적 구속력이 없으며, 내부 개선 목적으로만 활용됩니다.
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                  <p>정확한 평가를 위해 관련 부서와의 사전 협의가 필요합니다.</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                  <p>중대 위반 항목 발견 시 즉시 개선조치를 권장합니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CSDDD() {
  return <CSDDDLayout />
}
