'use client'

// ============================================================================
// 외부 라이브러리 임포트 (External Library Imports)
// ============================================================================

import Link from 'next/link'
import {useState} from 'react'
import {Dialog, DialogContent} from '@/components/ui/dialog'
import {DialogTitle} from '@/components/ui/dialog'
import {VisuallyHidden} from '@radix-ui/react-visually-hidden'
import {motion} from 'framer-motion'
// ============================================================================
// 아이콘 라이브러리 임포트 (Icon Library Imports)
// ============================================================================

import {
  Home,
  ArrowLeft,
  Check,
  Database,
  Shield,
  Leaf,
  Users,
  FileText,
  AlertTriangle,
  BarChart3,
  Play,
  Target
} from 'lucide-react'

// ============================================================================
// UI 컴포넌트 임포트 (UI Components Imports)
// ============================================================================

// 브레드크럼 네비게이션 컴포넌트들
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
    icon: Users, // 사람들 아이콘 - 인권 및 노동 표현
    title: '인권 및 노동',
    description: '아동노동, 강제노동, 차별 금지, 결사의 자유', // ILO 핵심 협약 기반
    items: 9, // 해당 영역 평가 항목 수
    iconColor: 'text-red-600', // 빨간색 - 인권의 중요성 강조
    bgColor: 'bg-red-100' // 연한 빨간색 배경
  },
  {
    icon: AlertTriangle, // 경고 삼각형 - 안전 주의 표현
    title: '산업안전·보건',
    description: '작업장 안전, 화학물질, 건강검진, 비상대응', // 산업안전보건법 기반
    items: 6, // 해당 영역 평가 항목 수
    iconColor: 'text-yellow-600', // 노란색 - 주의/경고 의미
    bgColor: 'bg-yellow-100' // 연한 노란색 배경
  },
  {
    icon: Leaf, // 나뭇잎 - 환경 친화적 의미
    title: '환경경영',
    description: '온실가스, 물·폐기물, 생태계, 환경법 준수', // ISO 14001 기반
    items: 8, // 해당 영역 평가 항목 수
    iconColor: 'text-green-600', // 초록색 - 환경 보호 의미
    bgColor: 'bg-green-100' // 연한 초록색 배경
  },
  {
    icon: FileText, // 문서 아이콘 - 계약 및 문서 관리
    title: '공급망 및 조달',
    description: 'ESG 조항 계약, 강제노동 점검, 제보시스템', // 공급망 실사 핵심
    items: 9, // 해당 영역 평가 항목 수
    iconColor: 'text-blue-600', // 파란색 - 신뢰성 의미
    bgColor: 'bg-blue-100' // 연한 파란색 배경
  },
  {
    icon: Shield, // 방패 아이콘 - 보안 및 보호
    title: '윤리경영 및 정보보호',
    description: '반부패, 정보보안, 개인정보보호, 책임자 지정', // 내부통제 시스템
    items: 8, // 해당 영역 평가 항목 수
    iconColor: 'text-indigo-600', // 남색 - 신뢰성과 안정성
    bgColor: 'bg-indigo-100' // 연한 남색 배경
  }
]

// ============================================================================
// 하위 컴포넌트 정의 (Sub-component Definitions)
// ============================================================================

/**
 * 평가 통계 카드 렌더링 함수
 *
 * scope2Form.tsx의 "총 Scope 2 배출량" 카드와 동일한 디자인 패턴 적용
 * - Card 컴포넌트 기반 구조
 * - 그라데이션 배경 (from-blue-50 to-white)
 * - 아이콘 + 텍스트 수평 배치
 * - 24px 고정 높이 (h-24)
 *
 * @param stat - ASSESSMENT_STATS 배열의 개별 통계 객체
 * @param index - 배열 인덱스 (key prop 용)
 * @returns JSX.Element - 렌더링된 통계 카드

/**
 * 진단 절차 단계별 안내 컴포넌트
 *
 * CSDDD 자가진단 프로세스를 3단계로 나누어 시각적으로 설명
 * - 사전 준비: 관련 문서 및 자료 검토
 * - 자가진단 수행: 실제 40개 항목 평가
 * - 결과 분석: 등급 산정 및 개선계획 수립
 *
 * 각 단계는 아이콘 + 제목 + 설명으로 구성되며
 * 세로 방향으로 배치되어 프로세스 플로우를 표현
 *
 * @returns JSX.Element - 진단 절차 안내 컴포넌트
 */
function DiagnosisProcedure() {
  /**
   * 진단 절차 3단계 정보
   * 각 단계별 상세 설명과 대표 아이콘 포함
   */
  const steps = [
    {
      number: 1, // 단계 번호
      title: '사전 준비', // 단계명
      description: '공급망 현황, 정책 문서, 계약서 등 관련 자료 검토', // 단계 설명
      icon: Database // 데이터베이스 아이콘 - 자료 수집 의미
    },
    {
      number: 2,
      title: '자가진단 수행',
      description: '5개 영역 40개 항목에 대한 현황 평가 및 증빙 자료 확인',
      icon: Target // 타겟 아이콘 - 목표 달성 의미
    },
    {
      number: 3,
      title: '결과 분석',
      description: '등급 산정, 위험도 평가, 개선계획 수립',
      icon: BarChart3 // 차트 아이콘 - 분석 결과 의미
    }
  ]

  return (
    <div className="space-y-6">
      {' '}
      {/* 각 단계 간 일정한 간격 */}
      {steps.map((step, index) => {
        const Icon = step.icon // 동적 아이콘 컴포넌트 할당

        return (
          <div key={index} className="flex items-start space-x-4">
            {' '}
            {/* 수평 배치 */}
            {/* 단계 아이콘 - 원형 배경 */}
            <div className="flex items-center justify-center w-12 h-12 text-sm font-bold text-white bg-blue-500 rounded-2xl">
              <Icon className="w-5 h-5" />
            </div>
            {/* 단계 설명 텍스트 */}
            <div className="flex-1">
              <p className="mb-2 text-lg font-bold text-gray-900">{step.title}</p>
              <p className="text-sm leading-relaxed text-gray-600">{step.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * 개별 평가 영역 카드 컴포넌트
 *
 * CSDDD 5개 평가 영역 각각을 카드 형태로 표시
 * - 영역별 고유 아이콘과 색상
 * - 평가 항목 수 표시
 * - 호버 효과 (확대 + 그림자 증가)
 * - 일관된 카드 디자인 (Toss 스타일)
 *
 * @param area - COMPLIANCE_AREAS 배열의 개별 영역 객체
 * @param index - 배열 인덱스 (key prop 용)
 * @returns JSX.Element - 렌더링된 평가 영역 카드
 */
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
      className="p-8 transition-all duration-500 bg-white border border-gray-100 shadow-sm cursor-pointer rounded-2xl hover:shadow-lg hover:transform hover:scale-105">
      <div className="flex items-center justify-between mb-6">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${area.bgColor}`}>
          <Icon className={`w-7 h-7 ${area.iconColor}`} />
        </div>
        <span className="px-3 py-1 text-sm font-medium text-gray-500 bg-gray-100 rounded-full">
          {area.items}개 항목
        </span>
      </div>
      <h4 className="mb-3 text-xl font-bold text-gray-900">{area.title}</h4>
      <p className="mb-4 text-sm leading-relaxed text-gray-600">{area.description}</p>
    </div>
  )
}

/**
 * 평가 영역 그리드 컴포넌트
 *
 * 5개 CSDDD 평가 영역을 그리드 레이아웃으로 배치
 * - 반응형 그리드: 모바일(1열) → 태블릿(2열) → 데스크탑(3열)
 * - 각 영역마다 ComplianceAreaCard 컴포넌트 사용
 * - 중앙 정렬된 섹션 제목
 *
 * @returns JSX.Element - 평가 영역 그리드 컴포넌트
 */
function ComplianceAreasGrid({
  handleCardClick
}: {
  handleCardClick: (index: number) => void
}) {
  return (
    <div className="mb-16">
      {/* 하단 여백 */}
      {/* 섹션 제목 */}
      <h3 className="mb-8 text-3xl font-bold text-center text-gray-900">
        주요 평가 영역
      </h3>
      {/* 반응형 그리드 레이아웃 */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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

// ============================================================================
// 메인 CSDDD 레이아웃 컴포넌트 (Main CSDDD Layout Component)
// ============================================================================

/**
 * CSDDD 자가진단 시스템 메인 레이아웃 컴포넌트
 *
 * scope3Form.tsx와 동일한 구조적 패턴 적용:
 * - 상단 브레드크럼 네비게이션
 * - 뒤로가기 버튼 + PageHeader
 * - Framer Motion 애니메이션 효과
 * - space-y-6 간격의 컴포넌트 배치
 *
 * 주요 섹션 구성:
 * 1. 네비게이션 (브레드크럼 + 헤더)
 * 2. 통계 개요 (4개 카드)
 * 3. 메인 진단 카드 (진단 시작 버튼 포함)
 * 4. 평가 영역 그리드 (5개 영역)
 * 5. 중요 안내사항 (하단 공지)
 *
 * @returns JSX.Element - 완성된 CSDDD 페이지 레이아웃
 */
export function CSDDDLayout() {
  // ========================================================================
  // 상태 관리 (State Management)
  // ========================================================================
  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null)
  const handleCardClick = (index: number) => setOpenDialogIndex(index)
  const closeDialog = () => setOpenDialogIndex(null)

  // ========================================================================
  // 평가 항목 미리보기 데이터 (엑셀 기반 실제 데이터)
  // ========================================================================
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

  // ========================================================================
  // 렌더링 (Rendering)
  // ========================================================================

  return (
    <div className="flex flex-col w-full h-full p-4">
      {' '}
      {/* scope3과 동일한 컨테이너 구조 */}
      {/* ========================================================================
          상단 네비게이션 섹션 (Top Navigation Section)
          - 사용자 현재 위치 표시 (브레드크럼)
          - 대시보드로 돌아가기 링크 제공
          ======================================================================== */}
      <div className="flex flex-row items-center p-2 px-2 mb-6 text-sm text-gray-500 bg-white rounded-lg shadow-sm">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Home className="w-4 h-4 mr-1" /> {/* 홈 아이콘 */}
              <BreadcrumbLink href="/dashboard">대시보드</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator /> {/* 구분자 (>) */}
            <BreadcrumbItem>
              <span className="font-bold text-blue-600">CSDDD</span>{' '}
              {/* 현재 페이지 - 클릭 불가 */}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {/* ========================================================================
          헤더 섹션 (Header Section)
          - 뒤로가기 버튼 (대시보드로 이동)
          - 페이지 제목 및 설명 (PageHeader 컴포넌트)
          - 호버 효과 포함 (배경색 변경)
          ======================================================================== */}
      <div className="flex flex-row w-full h-24 mb-6">
        <Link
          href="/dashboard" // 대시보드로 이동
          className="flex flex-row items-center p-4 space-x-4 transition rounded-md cursor-pointer hover:bg-gray-200">
          {/* 뒤로가기 화살표 아이콘 */}
          <ArrowLeft className="w-6 h-6 text-gray-500 group-hover:text-blue-600" />

          {/* 페이지 헤더 컴포넌트 */}
          <PageHeader
            icon={<Shield className="w-6 h-6 text-blue-600" />} // CSDDD 대표 아이콘
            title="CSDDD 자가진단 시스템" // 페이지 제목
            description="유럽연합 공급망 실사 지침 준수를 위한 종합 평가 시스템" // 페이지 설명
            module="CSDDD" // 모듈명 (스타일링용)
            submodule="assessment" // 서브모듈명 (스타일링용)
          />
        </Link>
      </div>
      {/* ========================================================================
          메인 콘텐츠 영역 (Main Content Area)
          - Framer Motion 애니메이션 효과 적용
          - scope3Form.tsx와 동일한 애니메이션 패턴
          - space-y-6으로 모든 섹션 간 일정한 간격 유지
          ======================================================================== */}
      <motion.div
        initial={{opacity: 0, scale: 0.95}} // 초기 상태: 투명 + 약간 축소
        animate={{opacity: 1, scale: 1}} // 최종 상태: 불투명 + 정상 크기
        transition={{delay: 0.6, duration: 0.5}} // 0.6초 지연 후 0.5초간 애니메이션
        className="space-y-6">
        {' '}
        {/* ====================================================================
            메인 진단 카드 섹션 (Main Assessment Card Section)
            - CSDDD 자가진단 시작을 위한 핵심 카드
            - 블루 그라데이션 헤더 + 화이트 콘텐츠 영역
            - 좌측: 평가 특징 설명, 우측: 진단 절차 안내
            - 하단: 3개 액션 버튼 (시작, 결과보기, 가이드라인)
            ==================================================================== */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl">
          {/* 카드 헤더 - 블루 배경 영역 */}
          <div className="px-8 py-12 bg-blue-400 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                {/* 메인 제목 */}
                <h2 className="mb-4 text-4xl font-bold text-white">
                  종합 실사 진단 시작
                </h2>
                {/* 서브 제목 */}
                <p className="text-xl text-blue-100">
                  40개 핵심 항목을 통한 ESG 리스크 평가 및 준수율 분석
                </p>
              </div>

              {/* 우측 장식 아이콘 (데스크탑에서만 표시) */}
              <div className="hidden md:block">
                <div className="flex items-center justify-center w-24 h-24 bg-white rounded-full bg-opacity-20">
                  <BarChart3 className="w-12 h-12 text-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {/* 카드 콘텐츠 - 화이트 배경 영역 */}
          <div className="p-8">
            {/* 2열 그리드 레이아웃 (데스크탑) */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* 좌측 컬럼: 평가 특징 */}
              <div>
                <h3 className="flex items-center gap-3 mb-6 text-2xl font-bold text-gray-900">
                  <Check className="w-6 h-6 text-green-600" /> {/* 체크 아이콘 */}
                  평가 특징
                </h3>

                {/* 특징 목록 */}
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
                      {/* 불릿 포인트 */}
                      <div className="w-3 h-3 mt-1.5 bg-blue-500 rounded-full" />
                      <div>
                        <p className="mb-1 font-bold text-gray-900">{feature.title}</p>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 우측 컬럼: 진단 절차 */}
              <div>
                <h3 className="flex items-center gap-3 mb-6 text-2xl font-bold text-gray-900">
                  <Play className="w-6 h-6 text-blue-600" /> {/* 재생 아이콘 */}
                  진단 절차
                </h3>

                {/* 진단 절차 3단계 컴포넌트 */}
                <DiagnosisProcedure />
              </div>
            </div>

            {/* 액션 버튼 영역 */}
            <div className="flex flex-col gap-4 pt-8 mt-8 border-t border-gray-200 sm:flex-row">
              {/* 자가진단 시작 버튼 (Primary) */}
              <Link
                href="/CSDDD/self-assessment" // 자가진단 페이지로 이동
                className="flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-300 transform bg-blue-500 shadow-lg rounded-xl hover:bg-blue-600 hover:scale-105 hover:shadow-xl">
                <Play className="w-5 h-5 mr-3" />
                자가진단 시작하기
              </Link>

              {/* 결과 보기 버튼 (Secondary) */}
              <Link
                href="/CSDDD/evaluation" // 평가 결과 페이지로 이동
                className="flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-300 transform bg-green-500 shadow-lg rounded-xl hover:bg-green-600 hover:scale-105 hover:shadow-xl">
                <BarChart3 className="w-5 h-5 mr-3" />
                결과 보기
              </Link>

              {/* 협력사 자가진단 확인 버튼 */}
              <Link
                href="/CSDDD/partnerEvaluation"
                className="flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-300 transform bg-purple-500 shadow-lg rounded-xl hover:bg-purple-600 hover:scale-105 hover:shadow-xl">
                <Users className="w-5 h-5 mr-3" />
                협력사 자가진단 확인
              </Link>
            </div>
          </div>
        </div>
        {/* ====================================================================
            평가 영역 그리드 섹션 (Compliance Areas Grid Section)
            - 5개 CSDDD 평가 영역 카드 표시
            - 각 영역별 고유 아이콘과 색상으로 구분
            - 반응형 그리드 레이아웃
            ==================================================================== */}
        <ComplianceAreasGrid handleCardClick={handleCardClick} />
        {/* ====================================================================
            중요 안내사항 섹션 (Important Notice Section)
            - CSDDD 관련 필수 공지사항 및 주의사항
            - 블루 배경의 강조 영역
            - 경고 아이콘과 함께 4개 주요 안내사항 표시
            ==================================================================== */}
        <div className="p-8 border border-blue-100 bg-blue-50 rounded-2xl">
          <div className="flex items-start space-x-6">
            {/* 경고 아이콘 */}
            <div className="flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>

            {/* 안내사항 콘텐츠 */}
            <div className="flex-1">
              <h4 className="mb-6 text-2xl font-bold text-blue-900">중요 안내사항</h4>

              {/* 안내사항 그리드 (2열) */}
              <div className="grid grid-cols-1 gap-4 text-sm text-blue-800 md:grid-cols-2">
                {[
                  'CSDDD는 2024년부터 단계적으로 적용되며, 2027년부터 본격 시행됩니다.', // 시행 일정
                  '자가진단 결과는 법적 구속력이 없으며, 내부 개선 목적으로만 활용됩니다.', // 법적 효력
                  '정확한 평가를 위해 관련 부서와의 사전 협의가 필요합니다.', // 사전 준비
                  '중대 위반 항목 발견 시 즉시 개선조치를 권장합니다.' // 사후 조치
                ].map((notice, index) => (
                  <div
                    key={index}
                    className="flex items-start p-3 space-x-3 bg-white border border-blue-200 rounded-lg">
                    {/* 불릿 포인트 */}
                    <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full" />
                    <p className="leading-relaxed">{notice}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Dialog for ComplianceAreaCard */}
        <Dialog open={openDialogIndex !== null} onOpenChange={closeDialog}>
          <DialogContent className="w-full max-w-[90vw] p-6">
            {/* Visually hidden dialog title for accessibility */}
            <VisuallyHidden>
              <DialogTitle>평가 항목 상세 정보</DialogTitle>
            </VisuallyHidden>
            {openDialogIndex !== null && (
              <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl">
                <div className="overflow-x-auto max-h-[75vh] px-1">
                  <table className="w-full border-separate table-auto border-spacing-y-1">
                    <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50/80 backdrop-blur-sm">
                      <tr>
                        <th className="w-[240px] px-6 py-4 text-sm font-semibold text-left text-gray-900">
                          항목
                        </th>
                        <th className="w-[60%] px-6 py-4 text-sm font-semibold text-left text-gray-900">
                          설명
                        </th>
                        <th className="w-[25%] px-6 py-4 text-sm font-semibold text-left text-gray-900">
                          관련 기준
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {groupedPreviews[COMPLIANCE_AREAS[openDialogIndex].title].map(
                        (
                          item: {항목: string; 설명: string; 관련기준: string},
                          idx: number
                        ) => (
                          <tr
                            key={idx}
                            className="transition-colors duration-150 hover:bg-gray-50/50">
                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-pre-line align-top break-keep">
                              {item.항목}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-pre-line align-top break-keep">
                              {item.설명}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-pre-line align-top break-keep">
                              {item.관련기준}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}

// ============================================================================
// 메인 컴포넌트 익스포트 (Main Component Export)
// ============================================================================

/**
 * CSDDD 페이지 메인 컴포넌트
 *
 * Next.js 페이지 컴포넌트로 사용되며,
 * CSDDDLayout 컴포넌트를 래핑하여 반환
 *
 * @returns JSX.Element - CSDDD 자가진단 시스템 페이지
 */
export default function CSDDD() {
  return <CSDDDLayout />
}
