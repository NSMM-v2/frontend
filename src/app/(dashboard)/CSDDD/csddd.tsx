'use client'

import Link from 'next/link'
import {useState} from 'react'
import {motion} from 'framer-motion'

import {
  Home,
  Check,
  Shield,
  Leaf,
  Users,
  FileText,
  AlertTriangle,
  ChevronDown,
  X,
  Play
} from 'lucide-react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

import {PageHeader} from '@/components/layout/PageHeader'

const COMPLIANCE_AREAS = [
  {
    icon: Users,
    title: '인권 및 노동',
    description: '아동노동, 강제노동, 차별 금지 등',
    items: 9,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  {
    icon: AlertTriangle,
    title: '산업안전·보건',
    description: '작업장 안전, 화학물질, 건강검진 등',
    items: 6,
    iconColor: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  {
    icon: Leaf,
    title: '환경경영',
    description: '온실가스, 물·폐기물, 생태계 등',
    items: 8,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    icon: FileText,
    title: '공급망 및 조달',
    description: 'ESG 조항 계약, 강제노동 점검 등',
    items: 9,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    icon: Shield,
    title: '윤리경영 및 정보보호',
    description: '반부패, 정보보안, 개인정보보호 등',
    items: 8,
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-100'
  }
]

function DiagnosisProcedure() {
  const steps = [
    {
      number: 1,
      title: '사전 준비',
      description: '공급망 현황, 정책 문서, 계약서 등 관련 자료 검토'
    },
    {
      number: 2,
      title: '자가진단 수행',
      description: '5개 영역 40개 항목에 대한 현황 평가 및 증빙 자료 확인'
    },
    {
      number: 3,
      title: '결과 분석',
      description: '등급 산정, 위험도 평가, 개선계획 수립'
    }
  ]

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start p-4 space-x-4 bg-gray-50 rounded-xl">
          <div className="w-3 h-3 mt-1.5 bg-blue-500 rounded-full" />
          <div>
            <p className="mb-1 font-bold text-gray-900">{step.title}</p>
            <p className="text-sm text-gray-600">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function ComplianceAreaCard({
  area,
  index,
  onClick
}: {
  area: (typeof COMPLIANCE_AREAS)[number]
  index: number
  onClick: (index: number) => void
}) {
  const Icon = area.icon

  return (
    <div
      onClick={() => onClick(index)}
      className="p-4 mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-500 cursor-pointer hover:shadow-sm hover:transform hover:scale-105">
      <div className="flex gap-3 items-center mb-2">
        <div
          className={`w-8 h-8 rounded-2xl flex items-center justify-center ${area.bgColor}`}>
          <Icon className={`w-4 h-4 ${area.iconColor}`} />
        </div>
        <h4 className="text-base font-bold text-gray-900">{area.title}</h4>
      </div>
      <p className="text-sm gray-600">{area.description}</p>
      <div className="flex justify-end mt-2">
        <span className="inline-block w-fit px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded-full text-center">
          {area.items}개 항목
        </span>
      </div>
    </div>
  )
}

function ComplianceAreasGrid({
  handleCardClick
}: {
  handleCardClick: (index: number) => void
}) {
  return (
    <div id="compliance-areas-grid" className="mb-10">
      <motion.div
        whileHover={{scale: 1.1}}
        whileTap={{scale: 0.95}}
        className="flex justify-center mb-6 cursor-pointer"
        onClick={() => {
          const element = document.getElementById('compliance-areas-grid')
          if (element) {
            element.scrollIntoView({behavior: 'smooth'})
          }
        }}>
        <ChevronDown className="w-8 h-20 text-gray-500 animate-bounce" />
      </motion.div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 xl:grid-cols-5">
        {COMPLIANCE_AREAS.map((area, index) => (
          <ComplianceAreaCard
            key={index}
            area={area}
            index={index}
            onClick={handleCardClick}
          />
        ))}
      </div>
    </div>
  )
}

export function CSDDDLayout() {
  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null)
  const handleCardClick = (index: number) => setOpenDialogIndex(index)
  const closeDialog = () => setOpenDialogIndex(null)

  const groupedPreviews: Record<
    string,
    {항목: string; 설명: string; 관련기준: string}[]
  > = {
    '인권 및 노동': [
      {
        항목: '아동노동 금지',
        설명: '18세 미만 아동의 노동을 금지하고, 연령 확인 절차를 운영한다.',
        관련기준: 'ILO 협약 138/182, UNGC 5원칙'
      },
      {
        항목: '강제노동 금지',
        설명: '모든 형태의 강제노동, 인신매매, 노예노동을 금지한다.',
        관련기준: 'ILO 협약 29/105, UNGC 4원칙'
      },
      {
        항목: '차별 금지',
        설명: '고용, 승진, 임금, 복지 등에서 차별을 금지하고 다양성을 존중한다.',
        관련기준: 'ILO 협약 100/111, UNGC 6원칙'
      },
      {
        항목: '결사의 자유 및 단체교섭권 보장',
        설명: '노동자들의 결사의 자유와 단체교섭권을 인정한다.',
        관련기준: 'ILO 협약 87/98, UNGC 3원칙'
      },
      {
        항목: '적정 임금 지급',
        설명: '법정 최저임금 이상을 지급하고, 임금 지급의 투명성을 보장한다.',
        관련기준: 'ILO 협약 131, 국내 근로기준법'
      },
      {
        항목: '근로시간 준수',
        설명: '법정 근로시간, 휴게, 휴일 규정을 준수한다.',
        관련기준: 'ILO 협약 1, 국내 근로기준법'
      },
      {
        항목: '괴롭힘 및 폭력 예방',
        설명: '직장 내 괴롭힘, 성희롱, 폭력을 예방하고 신고 절차를 마련한다.',
        관련기준: 'ILO 협약 190, 국내 근로기준법'
      },
      {
        항목: '인권경영 정책 수립',
        설명: '인권경영 방침을 제정·공개하고, 정기적으로 교육한다.',
        관련기준: 'UNGP, 국내 인권경영 가이드라인'
      },
      {
        항목: '고충처리 및 피해구제 절차',
        설명: '고충처리 창구를 운영하고, 피해자 보호 및 구제 절차를 마련한다.',
        관련기준: 'UNGP, 국내 인권경영 가이드라인'
      }
    ],
    '산업안전·보건': [
      {
        항목: '작업장 안전관리',
        설명: '작업장 위험요소를 파악·개선하고, 안전장비를 제공한다.',
        관련기준: '산업안전보건법, ILO 협약 155'
      },
      {
        항목: '화학물질 및 유해인자 관리',
        설명: '유해화학물질의 안전한 취급 및 저장, 노출 저감 조치를 실시한다.',
        관련기준: '산업안전보건법, REACH'
      },
      {
        항목: '정기적 건강검진',
        설명: '근로자 대상 건강검진을 정기적으로 실시한다.',
        관련기준: '산업안전보건법'
      },
      {
        항목: '비상대응 체계 구축',
        설명: '화재, 재해 등 비상상황에 대비한 대응계획 및 훈련을 실시한다.',
        관련기준: '산업안전보건법'
      },
      {
        항목: '산업재해 보고 및 재발방지',
        설명: '산재 발생 시 신속 보고하고, 재발방지 대책을 수립한다.',
        관련기준: '산업안전보건법'
      },
      {
        항목: '협력업체 안전관리',
        설명: '협력업체 작업장 안전관리 및 교육을 지원한다.',
        관련기준: '산업안전보건법, CSDDD'
      }
    ],
    환경경영: [
      {
        항목: '온실가스 배출 관리',
        설명: '직접·간접 온실가스 배출량을 측정·관리한다.',
        관련기준: 'ISO 14064, EU CSRD'
      },
      {
        항목: '에너지 사용 및 절감',
        설명: '에너지 사용량을 모니터링하고, 절감 노력을 추진한다.',
        관련기준: 'ISO 50001'
      },
      {
        항목: '물 사용 및 오염 관리',
        설명: '물 사용량을 관리하고, 오염물질 배출을 최소화한다.',
        관련기준: 'ISO 14001'
      },
      {
        항목: '폐기물 관리',
        설명: '폐기물의 분리배출, 재활용, 안전한 처리를 실시한다.',
        관련기준: '폐기물관리법, ISO 14001'
      },
      {
        항목: '생태계 및 생물다양성 보호',
        설명: '사업장 주변 생태계 훼손을 방지하고 복원에 기여한다.',
        관련기준: 'ISO 14001, EU CSDDD'
      },
      {
        항목: '환경법규 준수',
        설명: '모든 관련 환경법규를 준수하고, 위반 시 즉시 시정한다.',
        관련기준: '환경관련 국내법, ISO 14001'
      },
      {
        항목: '환경경영 방침 수립',
        설명: '환경경영 방침을 제정·공개하고, 임직원 교육을 실시한다.',
        관련기준: 'ISO 14001'
      },
      {
        항목: '공급망 환경관리',
        설명: '주요 협력사에 환경기준을 요구하고, 이행 여부를 점검한다.',
        관련기준: 'EU CSDDD'
      }
    ],
    '공급망 및 조달': [
      {
        항목: 'ESG 조항 포함 계약',
        설명: '공급계약서에 인권, 환경, 윤리 등 ESG 조항을 포함한다.',
        관련기준: 'EU CSDDD 6조'
      },
      {
        항목: '공급업체 실사',
        설명: '주요 공급업체에 대해 정기적으로 ESG 실사를 실시한다.',
        관련기준: 'EU CSDDD 6조'
      },
      {
        항목: '강제노동·아동노동 점검',
        설명: '공급망 내 강제노동, 아동노동 발생 여부를 점검한다.',
        관련기준: 'ILO 협약, EU CSDDD'
      },
      {
        항목: '공급망 리스크 평가',
        설명: '공급망별 리스크 수준을 평가하고, 개선계획을 수립한다.',
        관련기준: 'EU CSDDD'
      },
      {
        항목: '공급망 고충처리 시스템',
        설명: '공급업체 및 이해관계자를 위한 고충처리 시스템을 운영한다.',
        관련기준: 'EU CSDDD, UNGP'
      },
      {
        항목: '공급망 정보공개',
        설명: '주요 공급망 정보를 외부에 투명하게 공개한다.',
        관련기준: 'EU CSRD'
      },
      {
        항목: '공급업체 교육 및 지원',
        설명: '공급업체 대상 ESG 교육 및 역량강화 지원을 실시한다.',
        관련기준: 'EU CSDDD'
      },
      {
        항목: '공급망 모니터링 체계',
        설명: '공급망 이슈 발생 시 신속히 모니터링하고 대응한다.',
        관련기준: 'EU CSDDD'
      },
      {
        항목: '공급망 실적 평가 및 피드백',
        설명: '공급업체의 ESG 실적을 평가하고 피드백한다.',
        관련기준: 'EU CSDDD'
      }
    ],
    '윤리경영 및 정보보호': [
      {
        항목: '반부패 정책 수립',
        설명: '뇌물, 금품수수, 부정청탁 등 부패행위를 금지한다.',
        관련기준: 'UNGC 10원칙, ISO 37001'
      },
      {
        항목: '임직원 윤리교육',
        설명: '임직원 대상 윤리 및 준법 교육을 정기적으로 실시한다.',
        관련기준: 'ISO 37301'
      },
      {
        항목: '내부고발 및 보호제도',
        설명: '내부고발자 보호제도를 마련하고, 익명신고를 허용한다.',
        관련기준: 'ISO 37002'
      },
      {
        항목: '정보보호 정책 수립',
        설명: '정보보호 방침을 수립·공개하고, 보안 교육을 실시한다.',
        관련기준: 'ISO 27001'
      },
      {
        항목: '개인정보 보호',
        설명: '개인정보 수집·이용·파기에 대한 내부 규정을 마련한다.',
        관련기준: '개인정보보호법, GDPR'
      },
      {
        항목: '정보보안 시스템 운영',
        설명: '정보보안 시스템을 구축·운영하고, 접근권한을 관리한다.',
        관련기준: 'ISO 27001'
      },
      {
        항목: '윤리경영 전담조직 지정',
        설명: '윤리경영 및 정보보호 책임자를 지정한다.',
        관련기준: 'ISO 37301'
      },
      {
        항목: '협력사 윤리기준 적용',
        설명: '협력사에도 윤리경영, 정보보호 기준을 적용한다.',
        관련기준: 'EU CSDDD'
      }
    ]
  }

  return (
    <div className="flex flex-col p-4 w-full h-full">
      <div className="flex flex-row items-center p-2 px-2 mb-4 text-sm text-gray-500 bg-white rounded-lg shadow-sm">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Home className="mr-1 w-4 h-4" />
              <BreadcrumbLink href="/dashboard">대시보드</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="font-bold text-blue-600">CSDDD</span>{' '}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-row mb-4 w-full h-24">
        <div className="flex flex-row items-center p-4 space-x-4 rounded-md transition">
          <PageHeader
            icon={<Shield className="w-6 h-6 text-blue-600" />}
            title="CSDDD 자가진단 시스템"
            description="유럽연합 공급망 실사 지침 준수를 위한 종합 평가 시스템"
            module="CSDDD"
            submodule="assessment"
          />
        </div>
      </div>

      <motion.div
        initial={{opacity: 0, scale: 0.95}}
        animate={{opacity: 1, scale: 1}}
        transition={{delay: 0.6, duration: 0.5}}
        className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-blue-900">
                  CSDDD 자가진단 시스템
                </h2>
                <p className="text-sm text-blue-700">
                  40개 핵심 항목을 통한 ESG 리스크 평가 및 준수율 분석
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div>
                <h3 className="flex gap-3 items-center mb-6 text-2xl font-bold text-gray-900">
                  <Check className="w-6 h-6 text-green-600" />
                  평가 특징
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      title: '실시간 위험도 분석',
                      description: '중대 위반 항목 자동 감지 및 등급 조정'
                    },
                    {
                      title: '가중치 기반 점수',
                      description: '항목별 중요도에 따른 정밀 평가'
                    },

                    {
                      title: '결과 다운로드',
                      description: '상세 보고서 및 분석 결과 제공'
                    }
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start p-4 space-x-4 bg-gray-50 rounded-xl">
                      <div className="w-3 h-3 mt-1.5 bg-blue-500 rounded-full" />
                      <div>
                        <p className="mb-1 font-bold text-gray-900">{feature.title}</p>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="flex gap-3 items-center mb-6 text-2xl font-bold text-gray-900">
                  <Play className="w-6 h-6 text-blue-600" />
                  진단 절차
                </h3>

                <DiagnosisProcedure />
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-8 mt-8 border-t border-gray-200 sm:flex-row">
              <Link
                href="/CSDDD/self-assessment"
                className="flex justify-center items-center px-8 py-4 text-lg font-semibold text-white bg-green-500 rounded-xl shadow-sm transition-all duration-300 transform hover:bg-green-700 hover:scale-105 hover:shadow-sm">
                자가진단 시작하기
              </Link>

              <Link
                href="/CSDDD/evaluation"
                className="flex justify-center items-center px-8 py-4 text-lg font-semibold text-white bg-blue-500 rounded-xl shadow-sm transition-all duration-300 transform hover:bg-blue-700 hover:scale-105 hover:shadow-sm">
                결과 보기
              </Link>

              <Link
                href="/CSDDD/partnerEvaluation"
                className="flex justify-center items-center px-8 py-4 text-lg font-semibold text-white bg-indigo-500 rounded-xl shadow-sm transition-all duration-300 transform hover:bg-indigo-700 hover:scale-105 hover:shadow-sm">
                협력사 자가진단 확인
              </Link>
            </div>
          </div>
        </div>

        <ComplianceAreasGrid handleCardClick={handleCardClick} />

        <div className="p-8 bg-blue-50 rounded-2xl border border-blue-100">
          <div className="flex items-start space-x-6">
            <div className="flex justify-center items-center w-16 h-16 bg-blue-500 rounded-2xl">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>

            <div className="flex-1">
              <h4 className="mb-6 text-2xl font-bold text-blue-900">중요 안내사항</h4>

              <div className="grid grid-cols-1 gap-2 text-sm text-blue-800 md:grid-cols-2">
                {[
                  'CSDDD는 2024년부터 단계적으로 적용되며, 2027년부터 본격 시행됩니다.',
                  '자가진단 결과는 법적 구속력이 없으며, 내부 개선 목적으로만 활용됩니다.',
                  '정확한 평가를 위해 관련 부서와의 사전 협의가 필요합니다.',
                  '중대 위반 항목 발견 시 즉시 개선조치를 권장합니다.'
                ].map((notice, index) => (
                  <div
                    key={index}
                    className="flex items-start p-2 space-x-2 bg-white rounded-md border border-blue-200">
                    <p className="text-sm leading-snug text-blue-800">{notice}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {openDialogIndex !== null && (
          <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/30">
            <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200">
              <div className="flex gap-4 justify-between items-start px-8 py-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {COMPLIANCE_AREAS[openDialogIndex].title} - 평가 항목
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {COMPLIANCE_AREAS[openDialogIndex].description}
                  </p>
                </div>
                <button
                  onClick={() => setOpenDialogIndex(null)}
                  className="p-2 text-gray-500 rounded-lg transition-colors hover:text-gray-700 hover:bg-gray-100"
                  aria-label="닫기">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-auto max-h-[75vh] px-8 py-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-3 pr-6 w-[30%] text-sm font-semibold text-gray-900">
                        평가 항목
                      </th>
                      <th className="pb-3 pr-6 w-[40%] text-sm font-semibold text-gray-900">
                        세부 내용
                      </th>
                      <th className="pb-3 w-[30%] text-sm font-semibold text-gray-900">
                        관련 기준
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {groupedPreviews[COMPLIANCE_AREAS[openDialogIndex].title].map(
                      (item, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-100 transition-colors hover:bg-gray-50/50">
                          <td className="py-4 pr-6 font-medium text-gray-900 align-top">
                            {item.항목}
                          </td>
                          <td className="py-4 pr-6 leading-relaxed text-gray-700 align-top">
                            {item.설명}
                          </td>
                          <td className="py-4 text-gray-600 align-top">
                            {item.관련기준}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function CSDDD() {
  return <CSDDDLayout />
}
