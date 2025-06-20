'use client'

import Link from 'next/link'
import {useState, useEffect} from 'react'
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
  Play,
  Sparkles,
  Zap,
  Target
} from 'lucide-react'

// Constants for labels and descriptions
const ASSESSMENT_STATS = [
  {
    label: '평가 항목',
    value: '40개',
    icon: FileText,
    color: 'text-blue-600 bg-blue-50',
    gradient: 'from-blue-500 to-blue-600',
    ariaLabel: '평가 항목 아이콘'
  },
  {
    label: '예상 소요시간',
    value: '15-20분',
    icon: Clock,
    color: 'text-green-600 bg-green-50',
    gradient: 'from-green-500 to-emerald-600',
    ariaLabel: '예상 소요시간 아이콘'
  },
  {
    label: '완료율',
    value: '94%',
    icon: TrendingUp,
    color: 'text-purple-600 bg-purple-50',
    gradient: 'from-purple-500 to-violet-600',
    ariaLabel: '완료율 아이콘'
  },
  {
    label: '인증 등급',
    value: 'A-Grade',
    icon: Award,
    color: 'text-orange-600 bg-orange-50',
    gradient: 'from-orange-500 to-amber-600',
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
    iconColor: 'text-red-600',
    gradient: 'from-red-400 to-pink-500'
  },
  {
    icon: AlertTriangle,
    title: '산업안전·보건',
    description: '작업장 안전, 화학물질, 건강검진, 비상대응',
    items: 6,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-100',
    hoverBorderColor: 'hover:border-yellow-200',
    iconColor: 'text-yellow-600',
    gradient: 'from-yellow-400 to-orange-500'
  },
  {
    icon: Leaf,
    title: '환경경영',
    description: '온실가스, 물·폐기물, 생태계, 환경법 준수',
    items: 8,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-100',
    hoverBorderColor: 'hover:border-green-200',
    iconColor: 'text-green-600',
    gradient: 'from-green-400 to-emerald-500'
  },
  {
    icon: FileText,
    title: '공급망 및 조달',
    description: 'ESG 조항 계약, 강제노동 점검, 제보시스템',
    items: 9,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    hoverBorderColor: 'hover:border-blue-200',
    iconColor: 'text-blue-600',
    gradient: 'from-blue-400 to-indigo-500'
  },
  {
    icon: Shield,
    title: '윤리경영 및 정보보호',
    description: '반부패, 정보보안, 개인정보보호, 책임자 지정',
    items: 8,
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-100',
    hoverBorderColor: 'hover:border-indigo-200',
    iconColor: 'text-indigo-600',
    gradient: 'from-indigo-400 to-purple-500'
  }
]

// Named function for assessment stats mapping
function renderAssessmentStat(stat: (typeof ASSESSMENT_STATS)[number], index: number) {
  const Icon = stat.icon
  return (
    <div
      key={index}
      className={`overflow-hidden relative p-6 rounded-2xl border shadow-xl backdrop-blur-xl transition-all duration-300 bg-white/70 border-white/20 hover:shadow-2xl hover:bg-white/80 hover:scale-105 hover:-translate-y-1 group animate-fade-in-up`}
      style={{animationDelay: `${index * 100}ms`}}>
      {/* Background decoration */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
      />
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br to-transparent rounded-full blur-xl from-white/20" />

      <div className="flex relative justify-between items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-gray-500">{stat.label}</p>
          <p className="mb-1 text-3xl font-bold text-gray-900">{stat.value}</p>
          <div className={`w-8 h-1 bg-gradient-to-r ${stat.gradient} rounded-full`} />
        </div>
        <div
          className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-300`}>
          <Icon className="w-6 h-6 text-white" aria-label={stat.ariaLabel} role="img" />
        </div>
      </div>
    </div>
  )
}

// Component for 진단 절차 section
function DiagnosisProcedure() {
  const steps = [
    {
      number: 1,
      title: '사전 준비',
      description: '공급망 현황, 정책 문서, 계약서 등 관련 자료 검토',
      gradient: 'from-blue-500 to-blue-600',
      icon: Database
    },
    {
      number: 2,
      title: '자가진단 수행',
      description: '5개 영역 40개 항목에 대한 현황 평가 및 증빙 자료 확인',
      gradient: 'from-indigo-500 to-indigo-600',
      icon: Target
    },
    {
      number: 3,
      title: '결과 분석',
      description: '등급 산정, 위험도 평가, 개선계획 수립 및 보고서 생성',
      gradient: 'from-purple-500 to-purple-600',
      icon: Sparkles
    }
  ]

  return (
    <div className="space-y-6">
      {steps.map((step, index) => {
        const Icon = step.icon
        return (
          <div
            key={index}
            className="flex items-start space-x-4 group animate-slide-in-left"
            style={{animationDelay: `${1400 + index * 200}ms`}}>
            <div
              className={`flex items-center justify-center w-12 h-12 text-sm font-bold text-white rounded-2xl shadow-lg bg-gradient-to-r ${step.gradient} group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="mb-2 text-lg font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-600">
                {step.title}
              </p>
              <p className="text-sm leading-relaxed text-gray-600">{step.description}</p>
            </div>
          </div>
        )
      })}
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

  return (
    <div
      key={index}
      className={`relative p-6 bg-white/80 backdrop-blur-xl border-2 rounded-2xl transition-all duration-500 cursor-pointer overflow-hidden group ${area.bgColor} ${area.borderColor} ${area.hoverBorderColor} hover:shadow-2xl hover:-translate-y-2 hover:scale-102 animate-fade-in-up`}
      style={{animationDelay: `${index * 100}ms`}}
      onMouseEnter={() => setHoveredCard(index)}
      onMouseLeave={() => setHoveredCard(null)}>
      {/* Background decoration */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${area.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}
      />
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br to-transparent rounded-full blur-xl from-white/30" />

      <div className="relative">
        <div className="flex justify-between items-center mb-6">
          <div
            className={`p-4 rounded-2xl bg-gradient-to-br ${area.gradient} shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
            <Icon
              className="w-7 h-7 text-white"
              aria-label={`${area.title} 아이콘`}
              role="img"
            />
          </div>
          <span className="px-4 py-2 text-sm font-bold text-gray-600 rounded-full border shadow-sm backdrop-blur-sm bg-white/70 border-white/40">
            {area.items}개 항목
          </span>
        </div>

        <h4 className="mb-3 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-600">
          {area.title}
        </h4>
        <p className="mb-4 text-sm leading-relaxed text-gray-600">{area.description}</p>

        {hoveredCard === index && (
          <div className="pt-4 border-t border-gray-200/50 animate-fade-in">
            <Link
              href="#"
              className="flex items-center text-sm font-bold text-blue-600 transition-colors hover:text-blue-700 group/link"
              aria-label={`${area.title} 상세 항목 보기`}>
              상세 항목 보기
              <ArrowLeft
                className="ml-2 w-4 h-4 transition-transform duration-200 rotate-180 group-hover/link:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

// Component for Compliance Areas Grid
function ComplianceAreasGrid() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  return (
    <div className="mb-8">
      <h3 className="mb-8 text-3xl font-bold text-center text-gray-900 animate-fade-in">
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
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Floating background elements */}
      <div className="overflow-hidden fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse bg-blue-400/10" />
        <div className="absolute right-1/4 bottom-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse bg-purple-400/10 animation-delay-1000" />
        <div className="absolute top-3/4 left-1/3 w-64 h-64 rounded-full blur-3xl animate-pulse bg-green-400/10 animation-delay-2000" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div
          className={`mb-12 text-center transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
          }`}>
          <div className="flex justify-center items-center mb-6">
            <div
              className={`relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl transition-all duration-800 ${
                isVisible ? 'scale-100 rotate-0' : 'scale-0 -rotate-180'
              }`}>
              <Shield
                className="w-10 h-10 text-white"
                aria-label="CSDDD 아이콘"
                role="img"
              />
              <div className="absolute inset-0 rounded-3xl animate-ping bg-white/20" />
            </div>
          </div>
          <h1 className="mb-6 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900">
            CSDDD 자가진단 시스템
          </h1>
          <p className="mx-auto max-w-4xl text-xl leading-relaxed text-gray-600">
            유럽연합 공급망 실사 지침(Corporate Sustainability Due Diligence Directive)
            준수를 위한 종합 평가 시스템
          </p>
        </div>

        {/* Stats Overview */}
        <div
          className={`grid grid-cols-1 gap-6 mb-12 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-600 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}>
          {ASSESSMENT_STATS.map(renderAssessmentStat)}
        </div>

        {/* Main Assessment Card */}
        <div
          className={`mb-12 overflow-hidden shadow-2xl bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
          <div className="overflow-hidden relative px-8 py-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
            {/* Background decoration */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-72 h-72 rounded-full blur-3xl bg-white/10" />
              <div className="absolute right-0 bottom-0 w-96 h-96 rounded-full blur-3xl bg-white/5" />
            </div>

            <div className="flex relative justify-between items-center">
              <div>
                <h2
                  className={`mb-4 text-4xl font-bold text-white transition-all duration-600 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'
                  }`}>
                  종합 실사 진단 시작
                </h2>
                <p
                  className={`text-xl text-blue-100 transition-all duration-600 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'
                  }`}
                  style={{transitionDelay: '200ms'}}>
                  40개 핵심 항목을 통한 ESG 리스크 평가 및 준수율 분석
                </p>
              </div>
              <div className="hidden md:block">
                <div
                  className={`flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm shadow-2xl transition-all duration-800 ${
                    isVisible ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'
                  }`}
                  style={{transitionDelay: '400ms'}}>
                  <BarChart3
                    className="w-12 h-12 text-white"
                    aria-label="바 차트 아이콘"
                    role="img"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div
                className={`transition-all duration-600 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
                style={{transitionDelay: '600ms'}}>
                <h3 className="flex gap-3 items-center mb-6 text-2xl font-bold text-gray-900">
                  <Zap
                    className="w-6 h-6 text-green-600"
                    aria-label="체크 아이콘"
                    role="img"
                  />
                  평가 특징
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      title: '실시간 위험도 분석',
                      description: '중대 위반 항목 자동 감지 및 등급 조정',
                      color: 'green',
                      gradient: 'from-green-400 to-emerald-500'
                    },
                    {
                      title: '가중치 기반 점수',
                      description: '항목별 중요도에 따른 정밀 평가',
                      color: 'blue',
                      gradient: 'from-blue-400 to-indigo-500'
                    },
                    {
                      title: '개선방안 제시',
                      description: '카테고리별 맞춤형 액션플랜 제공',
                      color: 'purple',
                      gradient: 'from-purple-400 to-violet-500'
                    },
                    {
                      title: '결과 다운로드',
                      description: '상세 보고서 및 분석 결과 제공',
                      color: 'orange',
                      gradient: 'from-orange-400 to-amber-500'
                    }
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className={`flex items-start p-4 space-x-4 border border-${feature.color}-100 rounded-xl bg-${feature.color}-50/50 backdrop-blur-sm hover:bg-${feature.color}-50 transition-all duration-300 group animate-slide-in-left`}
                      style={{animationDelay: `${800 + index * 100}ms`}}>
                      <div
                        className={`w-3 h-3 mt-1.5 bg-gradient-to-r ${feature.gradient} rounded-full shadow-lg group-hover:scale-125 transition-transform duration-300`}
                      />
                      <div>
                        <p className="mb-1 font-bold text-gray-900">{feature.title}</p>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={`transition-all duration-600 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                }`}
                style={{transitionDelay: '600ms'}}>
                <h3 className="flex gap-3 items-center mb-6 text-2xl font-bold text-gray-900">
                  <Play
                    className="w-6 h-6 text-blue-600"
                    aria-label="플레이 아이콘"
                    role="img"
                  />
                  진단 절차
                </h3>
                <DiagnosisProcedure />
              </div>
            </div>

            <div
              className={`flex flex-col gap-4 pt-8 mt-8 border-t border-gray-200/50 sm:flex-row transition-all duration-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
              style={{transitionDelay: '1000ms'}}>
              <Link
                href="/CSDDD/self-assessment"
                className="flex justify-center items-center px-8 py-4 font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl transition-all duration-300 transform hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl hover:scale-105"
                aria-label="자가진단 시작하기">
                <Play className="mr-3 w-5 h-5" aria-hidden="true" />
                자가진단 시작하기
              </Link>
              <Link
                href="/CSDDD/evaluation"
                className="flex justify-center items-center px-8 py-4 font-bold text-white bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl shadow-xl transition-all duration-300 transform hover:from-green-700 hover:to-teal-700 hover:shadow-2xl hover:scale-105"
                aria-label="결과 보기">
                <BarChart3 className="mr-3 w-5 h-5" aria-hidden="true" />
                결과 보기
              </Link>
              <button
                className="flex justify-center items-center px-6 py-4 font-bold text-gray-700 rounded-2xl border border-gray-200 shadow-lg backdrop-blur-sm transition-all duration-300 transform bg-white/80 hover:bg-white hover:shadow-xl hover:scale-105"
                aria-label="가이드라인 다운로드"
                type="button">
                <Download className="mr-3 w-5 h-5" aria-hidden="true" />
                가이드라인
              </button>
            </div>
          </div>
        </div>

        <ComplianceAreasGrid />

        {/* Bottom Notice */}
        <div
          className={`relative p-8 border-2 border-blue-200/50 shadow-xl bg-blue-50/70 backdrop-blur-xl rounded-3xl overflow-hidden transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{transitionDelay: '1200ms'}}>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl bg-blue-400/10" />

          <div className="flex relative items-start space-x-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <AlertTriangle
                className="w-8 h-8 text-white"
                aria-label="경고 아이콘"
                role="img"
              />
            </div>
            <div className="flex-1">
              <h4 className="mb-6 text-2xl font-bold text-blue-900">중요 안내사항</h4>
              <div className="grid grid-cols-1 gap-4 text-sm text-blue-800 md:grid-cols-2">
                {[
                  'CSDDD는 2024년부터 단계적으로 적용되며, 2027년부터 본격 시행됩니다.',
                  '자가진단 결과는 법적 구속력이 없으며, 내부 개선 목적으로만 활용됩니다.',
                  '정확한 평가를 위해 관련 부서와의 사전 협의가 필요합니다.',
                  '중대 위반 항목 발견 시 즉시 개선조치를 권장합니다.'
                ].map((notice, index) => (
                  <div
                    key={index}
                    className="flex items-start p-3 space-x-3 rounded-lg border backdrop-blur-sm bg-white/40 border-blue-200/50 animate-slide-in-left"
                    style={{animationDelay: `${1400 + index * 100}ms`}}>
                    <div className="flex-shrink-0 mt-2 w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-sm" />
                    <p className="leading-relaxed">{notice}</p>
                  </div>
                ))}
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
