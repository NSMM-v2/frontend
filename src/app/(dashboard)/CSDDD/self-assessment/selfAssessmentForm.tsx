/**
 * CSDDD 자가진단 폼 컴포넌트 - 공급망 실사 자가진단 시스템
 *
 * 기업의 지속가능성 실사 지침(CSDDD) 기준에 따른 자가진단을 수행하는 컴포넌트
 * 5개 주요 카테고리(인권/노동, 산업안전/보건, 환경경영, 공급망/조달, 윤리경영/정보보호)에
 * 걸쳐 총 26개 질문을 통해 ESG 리스크를 평가하고 등급을 산출
 *
 * 주요 기능:
 * - 카테고리별 질문 응답 및 실시간 점수 계산
 * - 중대위반 항목 자동 감지 및 등급 조정
 * - 결과 요약 및 개선 권장사항 제시
 * - PDF 보고서 다운로드 기능 (별도 컴포넌트)
 *
 * 사용된 기술:
 * - Next.js 14 App Router
 * - React 18 상태 관리
 * - Tailwind CSS (스타일링)
 * - Lucide React (아이콘)
 * - Shadcn/ui 컴포넌트 시스템
 *
 * @author ESG Project Team
 * @version 1.0
 * @since 2024
 * @lastModified 2024-12-21
 */

'use client'

// ============================================================================
// 외부 라이브러리 임포트 (External Library Imports)
// ============================================================================

import {useEffect, useState} from 'react' // React 상태 관리 및 생명주기 훅
import {Button} from '@/components/ui/button' // 커스텀 버튼 컴포넌트
import {Card} from '@/components/ui/card' // 카드 레이아웃 컴포넌트
import Link from 'next/link' // Next.js 내부 링크 컴포넌트
import PDFReportGenerator from '@/components/CSDDD/PDFReportGenerator' // PDF 보고서 생성 컴포넌트

// ============================================================================
// 아이콘 라이브러리 임포트 (Icon Library Imports)
// ============================================================================

import {
  Check, // 체크 아이콘 - 긍정적 답변 표시
  AlertCircle, // 경고 원형 아이콘 - 부정적 답변 표시
  Info, // 정보 아이콘 - 중대위반 정보 표시
  BarChart3, // 막대그래프 아이콘 - 결과 보기 버튼
  AlertTriangle, // 삼각형 경고 아이콘 - 중대위반 항목 강조
  Shield, // 방패 아이콘 - 보안/안전 관련 표시
  Home, // 홈 아이콘 - 브레드크럼 홈 링크
  ArrowLeft // 왼쪽 화살표 - 뒤로가기 버튼
} from 'lucide-react'

// ============================================================================
// 내부 컴포넌트 임포트 (Internal Component Imports)
// ============================================================================

import {
  Breadcrumb, // 브레드크럼 컨테이너
  BreadcrumbItem, // 브레드크럼 개별 항목
  BreadcrumbLink, // 브레드크럼 링크
  BreadcrumbList, // 브레드크럼 리스트
  BreadcrumbSeparator // 브레드크럼 구분자 (>)
} from '@/components/ui/breadcrumb'
import {PageHeader} from '@/components/layout/PageHeader' // 페이지 헤더 컴포넌트

// ============================================================================
// 타입 정의 (Type Definitions)
// ============================================================================

/**
 * 자가진단 질문 인터페이스
 *
 * CSDDD(기업 지속가능성 실사 지침) 자가진단을 위한 개별 질문 구조
 * 각 질문은 고유 ID, 카테고리, 가중치를 가지며 중대위반 여부를 포함할 수 있음
 */
interface Question {
  id: string // 질문 고유 식별자 (예: "1.1", "2.3")
  category: string // 질문이 속한 카테고리 (5개 주요 영역 중 하나)
  text: string // 질문 내용 (한국어)
  weight: number // 질문의 가중치 (점수 계산 시 사용)
  criticalViolation?: {
    // 선택적 중대위반 정보
    grade: 'D' | 'C' | 'B' | 'B/C' // 위반 시 강제 등급
    reason: string // 위반 사유 설명
  }
}

// ============================================================================
// 평가 카테고리 정의 (Assessment Categories)
// ============================================================================

/**
 * CSDDD 자가진단 5개 주요 평가 카테고리
 *
 * 유럽연합 CSDDD 지침에 따른 핵심 평가 영역들:
 * 1. 인권 및 노동 - ILO 핵심 협약 기반 (9개 질문)
 * 2. 산업안전·보건 - 산업안전보건법 기반 (6개 질문)
 * 3. 환경경영 - ISO 14001 기반 (8개 질문)
 * 4. 공급망 및 조달 - 공급망 실사 핵심 (9개 질문)
 * 5. 윤리경영 및 정보보호 - 내부통제 시스템 (8개 질문)
 */
const categories = [
  '인권 및 노동', // Human Rights & Labor
  '산업안전·보건', // Occupational Health & Safety
  '환경경영', // Environmental Management
  '공급망 및 조달', // Supply Chain & Procurement
  '윤리경영 및 정보보호' // Ethics & Information Security
]

const questions: Question[] = [
  // 인권 및 노동 카테고리
  {
    id: '1.1',
    category: '인권 및 노동',
    text: '18세 미만의 아동노동을 금지하고 있습니까?',
    weight: 2.0,
    criticalViolation: {
      grade: 'D',
      reason: '형사처벌 + ILO 기준 위반 + CSDDD Art.6'
    }
  },
  {
    id: '1.2',
    category: '인권 및 노동',
    text: '강제노동 및 담보노동, 구속노동을 금지하고 있습니까?',
    weight: 2.0
  },
  {
    id: '1.3',
    category: '인권 및 노동',
    text: '성별·인종·국적 등에 의한 차별 금지 정책을 갖추고 있습니까?',
    weight: 1.5
  },
  {
    id: '1.4',
    category: '인권 및 노동',
    text: '직장 내 괴롭힘 및 폭력을 방지하기 위한 정책을 마련하고 있습니까?',
    weight: 1.0,
    criticalViolation: {
      grade: 'C',
      reason: '사회적 평판 리스크 + 반복 시 B → C'
    }
  },
  {
    id: '1.5',
    category: '인권 및 노동',
    text: '근로계약서를 사전에 제공하고 동의를 받고 있습니까?',
    weight: 1.0
  },
  {
    id: '1.6',
    category: '인권 및 노동',
    text: '법정 근로시간 준수, 휴식시간 보장, 초과근무 수당 지급 등을 준수하고 있습니까?',
    weight: 1.5,
    criticalViolation: {
      grade: 'C',
      reason: '반복 위반 시 + 현장점검 필요'
    }
  },
  {
    id: '1.7',
    category: '인권 및 노동',
    text: '결사의 자유 및 단체교섭권을 보장하고 있습니까?',
    weight: 1.0,
    criticalViolation: {
      grade: 'C',
      reason: '노동 기본권 위반으로 C'
    }
  },
  {
    id: '1.8',
    category: '인권 및 노동',
    text: '인권 영향평가를 정기적으로 수행하고 있습니까?',
    weight: 1.5,
    criticalViolation: {
      grade: 'C',
      reason: 'EU 규정 위반, 사업 영향도 중'
    }
  },
  {
    id: '1.9',
    category: '인권 및 노동',
    text: '근로자 고충처리 메커니즘을 갖추고 있습니까?',
    weight: 1.0,
    criticalViolation: {
      grade: 'B/C',
      reason: '시스템 미비 → B, 고의 누락 → C'
    }
  },

  // 산업안전보건
  {
    id: '2.1',
    category: '산업안전·보건',
    text: '정기적인 안전보건 교육을 실시하고 있습니까?',
    weight: 1.5
  },
  {
    id: '2.2',
    category: '산업안전·보건',
    text: '작업장 내 기계·장비의 안전장치 설치 여부를 확인하고 있습니까?',
    weight: 1.5
  },
  {
    id: '2.3',
    category: '산업안전·보건',
    text: '화재·재난 등 비상 상황 대응 체계 구비 여부를 확인하고 있습니까?',
    weight: 1.5
  },
  {
    id: '2.4',
    category: '산업안전·보건',
    text: '청소년·임산부 등 보호 대상자에 대한 작업 제한 조치를 취하고 있습니까?',
    weight: 1.0,
    criticalViolation: {
      grade: 'C',
      reason: '근기법 위반 및 행정벌 대상'
    }
  },
  {
    id: '2.5',
    category: '산업안전·보건',
    text: '화학물질을 분류·표시하고 적절히 관리하고 있습니까?',
    weight: 1.5,
    criticalViolation: {
      grade: 'C',
      reason: '사고 발생 시 D 전환 가능'
    }
  },
  {
    id: '2.6',
    category: '산업안전·보건',
    text: '근로자 건강검진 실시 및 사후조치 이행 여부를 확인하고 있습니까?',
    weight: 1.5
  },

  // 환경경영
  {
    id: '3.1',
    category: '환경경영',
    text: 'ISO 14001 등 환경경영시스템을 보유하고 있습니까?',
    weight: 2.0
  },
  {
    id: '3.2',
    category: '환경경영',
    text: '온실가스 배출량을 관리하고 감축 계획을 수립하고 있습니까?',
    weight: 1.5,
    criticalViolation: {
      grade: 'B',
      reason: '공시 목적 미달로 B'
    }
  },
  {
    id: '3.3',
    category: '환경경영',
    text: '물 사용량을 절감하거나 재활용하고 있습니까?',
    weight: 1.5
  },
  {
    id: '3.4',
    category: '환경경영',
    text: '대기오염물질 배출을 관리하기 위한 체계를 갖추고 있습니까?',
    weight: 1.0
  },
  {
    id: '3.5',
    category: '환경경영',
    text: '폐기물을 분리 배출하고 감축을 위해 노력하고 있습니까?',
    weight: 1.0
  },
  {
    id: '3.6',
    category: '환경경영',
    text: '공장 운영으로 인해 주변 생태계를 훼손하지 않고 있습니까?',
    weight: 1.0
  },
  {
    id: '3.7',
    category: '환경경영',
    text: '최근 환경 관련 법 위반 이력이 없습니까?',
    weight: 1.5,
    criticalViolation: {
      grade: 'C',
      reason: '이력 존재 시 B, 반복시 C'
    }
  },
  {
    id: '3.8',
    category: '환경경영',
    text: '환경 리스크를 평가하고 그에 대한 대응 계획을 수립하고 있습니까?',
    weight: 1.0
  },

  // 공급망 및 조달
  {
    id: '4.1',
    category: '공급망 및 조달',
    text: '하도급사를 포함한 공급망에 대해 실사를 수행하고 있습니까?',
    weight: 2.0,
    criticalViolation: {
      grade: 'C',
      reason: '공급망 전이 리스크 있음'
    }
  },
  {
    id: '4.2',
    category: '공급망 및 조달',
    text: '공급 계약서에 ESG 관련 조항을 포함하고 있습니까?',
    weight: 1.5
  },
  {
    id: '4.3',
    category: '공급망 및 조달',
    text: '공급망의 추적 가능성을 확보하고 있습니까?',
    weight: 1.5,
    criticalViolation: {
      grade: 'B/C',
      reason: 'OECD Due Diligence 위반'
    }
  },
  {
    id: '4.4',
    category: '공급망 및 조달',
    text: '분쟁광물이나 고위험 자재의 사용 여부를 점검하고 있습니까?',
    weight: 1.0,
    criticalViolation: {
      grade: 'D',
      reason: 'EU 직접 규제 항목, 수입 금지 가능'
    }
  },
  {
    id: '4.5',
    category: '공급망 및 조달',
    text: '공급망 내 강제노동 리스크에 대한 평가를 이행하고 있습니까?',
    weight: 1.5,
    criticalViolation: {
      grade: 'D',
      reason: 'UFLPA 등 글로벌 수입금지 규정 위반'
    }
  },
  {
    id: '4.6',
    category: '공급망 및 조달',
    text: 'ISO, RBA 등 제3자 인증을 보유하고 있습니까?',
    weight: 1.0
  },
  {
    id: '4.7',
    category: '공급망 및 조달',
    text: '내부 및 외부 제보 시스템을 운영하고 있습니까?',
    weight: 1.5,
    criticalViolation: {
      grade: 'C',
      reason: '내부통제 미비로 C 등급'
    }
  },
  {
    id: '4.8',
    category: '공급망 및 조달',
    text: '공급망 실사 결과에 대한 보고서를 작성하고 있습니까?',
    weight: 1.5,
    criticalViolation: {
      grade: 'C',
      reason: '공시 누락 시 제재 가능'
    }
  },
  {
    id: '4.9',
    category: '공급망 및 조달',
    text: '협력사에 행동강령 및 윤리 기준을 전달하고 있습니까?',
    weight: 1.5
  },

  // 윤리경영 및 정보보호
  {
    id: '5.1',
    category: '윤리경영 및 정보보호',
    text: '사내에 반부패 정책을 수립하고 실행하고 있습니까?',
    weight: 1.5,
    criticalViolation: {
      grade: 'D',
      reason: '형사처벌 대상, 글로벌 리스크 큼'
    }
  },
  {
    id: '5.2',
    category: '윤리경영 및 정보보호',
    text: '이해상충 상황에 대한 사전신고 제도를 운영하고 있습니까?',
    weight: 1.0,
    criticalViolation: {
      grade: 'C',
      reason: '정책 미비로 투명성 저해'
    }
  },
  {
    id: '5.3',
    category: '윤리경영 및 정보보호',
    text: '윤리경영과 관련된 사내 교육을 정기적으로 운영하고 있습니까?',
    weight: 1.0
  },
  {
    id: '5.4',
    category: '윤리경영 및 정보보호',
    text: '기술 및 지식재산권 보호를 위한 정책이 마련되어 있습니까?',
    weight: 1.0
  },
  {
    id: '5.5',
    category: '윤리경영 및 정보보호',
    text: '정보보안 관련 정책과 시스템을 보유하고 있습니까?',
    weight: 1.0,
    criticalViolation: {
      grade: 'C',
      reason: 'GDPR 위반 가능성 높음'
    }
  },
  {
    id: '5.6',
    category: '윤리경영 및 정보보호',
    text: '개인정보를 수집·보관·활용할 때 암호화 등 보호조치를 이행하고 있습니까?',
    weight: 1.0,
    criticalViolation: {
      grade: 'D',
      reason: '벌금 + 형사처벌 대상, GDPR 연계'
    }
  },
  {
    id: '5.7',
    category: '윤리경영 및 정보보호',
    text: '정보 유출 사고 발생 시 대응할 수 있는 프로세스를 수립하고 있습니까?',
    weight: 1.0
  },
  {
    id: '5.8',
    category: '윤리경영 및 정보보호',
    text: 'ESG 전담 인력 또는 책임자를 지정하고 있습니까?',
    weight: 1.0
  }
]

// ============================================================================
// 점수 계산 및 등급 기준 (Scoring and Grading Standards)
// ============================================================================

/**
 * 전체 질문의 총 가중치 합계
 * 모든 질문의 가중치를 합산하여 100점 만점 기준으로 환산하는데 사용
 * 현재 총 가중치: 52.5점 (26개 질문의 가중치 합)
 */
const TOTAL_WEIGHT = questions.reduce((sum, q) => sum + q.weight, 0) // 52.5

/**
 * CSDDD 자가진단 등급 기준 (100점 만점)
 *
 * 등급 체계:
 * - A등급 (90점 이상): 리스크 거의 없음, 계약 가능/실사 면제 가능
 * - B등급 (75-89점): 관리 가능 수준, 개선 개별 수준
 * - C등급 (60-74점): 중위험 구간, 세부 정밀 실사 필요
 * - D등급 (60점 미만): 고위험 구간, 계약 중단/블랙리스트 가능성
 *
 * 중대위반 항목이 있을 경우 해당 위반의 등급으로 자동 강등
 */
const gradeThresholds = {
  A: 90, // 우수 등급 (90점 이상)
  B: 75, // 양호 등급 (75-89점)
  C: 60, // 보통 등급 (60-74점)
  D: 0 // 미흡 등급 (60점 미만)
}

// ============================================================================
// 메인 컴포넌트 정의 (Main Component Definition)
// ============================================================================

/**
 * CSDDD 자가진단 폼 메인 컴포넌트
 *
 * 사용자 인터랙션을 관리하고 질문 응답, 점수 계산, 결과 표시 등의
 * 핵심 기능을 제공하는 메인 컴포넌트
 */
export default function SelfAssessmentForm() {
  // ========================================================================
  // 상태 관리 (State Management)
  // ========================================================================

  /**
   * 사용자 응답 상태 관리
   * 각 질문 ID를 키로 하고 'yes' 또는 'no' 값을 저장
   */
  const [answers, setAnswers] = useState<Record<string, string>>({})

  /**
   * 현재 활성화된 카테고리 탭
   * 기본값은 첫 번째 카테고리인 '인권 및 노동'
   */
  const [activeTab, setActiveTab] = useState('인권 및 노동')

  /**
   * 결과 표시 모드 전환
   * false: 질문 보기 모드, true: 결과 보기 모드
   */
  const [showResults, setShowResults] = useState(false)

  // ========================================================================
  // 초기화 및 생명주기 관리 (Initialization & Lifecycle)
  // ========================================================================

  /**
   * 컴포넌트 마운트 시 모든 질문을 'yes'로 초기화
   * 사용자가 명시적으로 'no'를 선택하지 않은 항목은 준수하는 것으로 간주
   */
  useEffect(() => {
    const initial: Record<string, string> = {}
    questions.forEach(q => {
      initial[q.id] = 'yes' // 기본값을 'yes'로 설정
    })
    setAnswers(initial)
  }, [])

  // ========================================================================
  // 이벤트 핸들러 (Event Handlers)
  // ========================================================================

  /**
   * 질문 응답 변경 핸들러
   * 사용자가 라디오 버튼을 선택했을 때 응답 상태를 업데이트
   *
   * @param questionId 질문 고유 식별자
   * @param value 선택된 값 ('yes' 또는 'no')
   */
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  // ========================================================================
  // 점수 계산 로직 (Score Calculation Logic)
  // ========================================================================

  /**
   * 전체 점수 계산 함수
   *
   * 모든 질문의 응답을 기반으로 100점 만점 기준의 점수를 계산
   * 'yes' 응답인 질문들의 가중치 합계를 총 가중치로 나누어 백분율로 환산
   *
   * @returns 100점 만점 기준 점수 (정수)
   */
  const calculateScore = () => {
    let totalScore = 0
    questions.forEach(q => {
      if (answers[q.id] === 'yes') {
        totalScore += q.weight // 긍정 응답인 질문의 가중치만 합산
      }
    })
    return Math.round((totalScore / TOTAL_WEIGHT) * 100) // 백분율로 환산 후 반올림
  }

  /**
   * 카테고리별 점수 계산 함수
   *
   * 특정 카테고리에 속한 질문들만을 대상으로 점수를 계산
   * 해당 카테고리 내에서의 상대적 성과를 백분율로 표시
   *
   * @param category 점수를 계산할 카테고리명
   * @returns 해당 카테고리의 100점 만점 기준 점수 (정수)
   */
  const calculateCategoryScore = (category: string) => {
    const categoryQuestions = questions.filter(q => q.category === category)
    let totalScore = 0 // 실제 획득 점수
    let maxScore = 0 // 해당 카테고리 최대 점수

    categoryQuestions.forEach(q => {
      if (answers[q.id] === 'yes') {
        totalScore += q.weight
      }
      maxScore += q.weight // 카테고리 내 모든 질문의 가중치 합
    })

    return maxScore ? Math.round((totalScore / maxScore) * 100) : 0
  }

  // ========================================================================
  // 등급 계산 및 평가 로직 (Grade Calculation & Assessment Logic)
  // ========================================================================

  /**
   * 최종 등급 계산 함수
   *
   * 기본 점수와 중대위반 항목을 종합적으로 고려하여 최종 등급을 결정
   * 중대위반이 있는 경우 해당 위반의 등급으로 자동 강등
   *
   * 계산 과정:
   * 1. 기본 점수 계산 (가중치 기반)
   * 2. 중대위반 항목 검사
   * 3. 중대위반이 없으면 점수 기준 등급 적용
   * 4. 중대위반이 있으면 가장 낮은 위반 등급으로 강등
   *
   * @returns 최종 등급 ('A', 'B', 'C', 'D' 중 하나)
   */
  const getFinalGrade = () => {
    const baseScore = calculateScore() // 기본 점수 계산

    // 중대위반 항목 검사 - 'no' 응답이면서 중대위반 속성이 있는 질문들
    const criticalViolations = questions
      .filter(q => q.criticalViolation && answers[q.id] === 'no')
      .map(q => q.criticalViolation!)

    if (criticalViolations.length === 0) {
      // 중대위반이 없는 경우 일반 등급 기준 적용
      if (baseScore >= gradeThresholds.A) return 'A'
      if (baseScore >= gradeThresholds.B) return 'B'
      if (baseScore >= gradeThresholds.C) return 'C'
      return 'D'
    }

    // 중대위반이 있는 경우 가장 낮은 등급으로 강등
    const worstGrade = criticalViolations.reduce((worst, violation) => {
      const grades = ['A', 'B', 'C', 'D'] // 등급 순서 (좋은 것부터)
      const currentWorst = grades.indexOf(worst)
      const violationGrade = violation.grade === 'B/C' ? 'C' : violation.grade // B/C는 C로 처리
      const violationWorst = grades.indexOf(violationGrade)
      return violationWorst > currentWorst ? violationGrade : worst // 더 나쁜 등급 선택
    }, 'A')

    return worstGrade
  }

  const getGradeInfo = (grade: string) => {
    switch (grade) {
      case 'A':
        return {
          color: 'text-green-700 bg-green-50 border-green-200',
          description: '리스크 거의 없음',
          action: '계약 가능, 실사 면제 가능'
        }
      case 'B':
        return {
          color: 'text-blue-700 bg-blue-50 border-blue-200',
          description: '관리 가능 수준',
          action: '개선 개별 수준'
        }
      case 'C':
        return {
          color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
          description: '중위험 구간',
          action: '세부 정밀 실사'
        }
      case 'D':
        return {
          color: 'text-red-700 bg-red-50 border-red-200',
          description: '고위험 구간',
          action: '계약 중단, 블랙리스트 가능성'
        }
      default:
        return {
          color: 'text-gray-700 bg-gray-50 border-gray-200',
          description: '평가 미완료',
          action: '진단을 완료해주세요'
        }
    }
  }

  const getCriticalViolations = () => {
    return questions
      .filter(q => q.criticalViolation && answers[q.id] === 'no')
      .map(q => ({
        question: q,
        violation: q.criticalViolation!
      }))
  }

  // ========================================================================
  // PDF 보고서 생성 (PDF Report Generation)
  // ========================================================================

  /**
   * PDF 보고서 생성 및 다운로드 함수
   *
   * CSDDD 자가진단 결과를 전문적인 한국어 PDF 보고서로 생성
   * 회사 정보, 평가 결과, 카테고리별 점수, 중대위반 사항, 개선권고를 포함
   *
   * 포함 내용:
   * - 보고서 표지 (제목, 생성일시, 회사정보)
   * - 종합 평가 결과 (최종등급, 기본점수, 권장조치)
   * - 카테고리별 세부 점수표
   * - 중대위반 항목 상세 (발견 시)
   * - 개선 권장사항 목록
   * - 보고서 생성 정보 (날짜, 플랫폼)
   */

  const finalGrade = getFinalGrade()
  const gradeInfo = getGradeInfo(finalGrade)
  const baseScore = calculateScore()
  const criticalViolations = getCriticalViolations()

  return (
    <div className="flex flex-col p-4 w-full h-full">
      {/* ========================================================================
          상단 네비게이션 섹션 (Top Navigation Section)
          ======================================================================== */}
      <div className="flex flex-row items-center p-2 px-2 mb-6 text-sm text-gray-500 bg-white rounded-lg shadow-sm">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Home className="mr-1 w-4 h-4" />
              <BreadcrumbLink href="/dashboard">대시보드</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/CSDDD">CSDDD</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="font-bold text-blue-500">자가진단</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ========================================================================
          헤더 섹션 (Header Section)
          - 뒤로가기 버튼과 페이지 제목/설명
          ======================================================================== */}
      <div className="flex flex-row mb-6 w-full h-24">
        <Link
          href="/CSDDD"
          className="flex flex-row items-center p-4 space-x-4 rounded-md transition cursor-pointer hover:bg-gray-200">
          <ArrowLeft className="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
          <PageHeader
            icon={<Shield className="w-6 h-6 text-blue-500" />}
            title="공급망 실사 자가진단"
            description="ESG 관점에서 공급망의 리스크를 평가하고 개선점을 파악합니다"
            module="CSDDD"
            submodule="self-assessment"
          />
        </Link>
      </div>

      {/* ========================================================================
          메인 콘텐츠 영역 (Main Content Area)
          ======================================================================== */}
      <div className="space-y-8">
        {/* Grade Overview */}
        <Card className="p-6 mb-8 shadow-lg backdrop-blur-sm bg-white/80">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">종합 평가 결과</h2>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowResults(!showResults)}
                variant="outline"
                className="flex gap-2 items-center">
                <BarChart3 className="w-4 h-4" />
                {showResults ? '질문 보기' : '결과 보기'}
              </Button>
              <PDFReportGenerator
                answers={answers}
                questions={questions}
                categories={categories}
                finalGrade={finalGrade}
                gradeInfo={gradeInfo}
                baseScore={baseScore}
                criticalViolations={criticalViolations}
                calculateCategoryScore={calculateCategoryScore}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
            {/* Final Grade */}
            <div className={`p-6 rounded-lg border-2 ${gradeInfo.color}`}>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold">{finalGrade}</div>
                <div className="mb-1 text-sm font-medium">최종 등급</div>
                <div className="text-xs">{gradeInfo.description}</div>
              </div>
            </div>

            {/* Base Score */}
            <div className="p-6 bg-white rounded-lg border shadow-sm">
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-blue-600">{baseScore}점</div>
                <div className="mb-1 text-sm font-medium">기본 점수</div>
                <div className="text-xs text-gray-600">100점 만점 기준</div>
              </div>
            </div>

            {/* Risk Level */}
            <div className="p-6 bg-white rounded-lg border shadow-sm">
              <div className="text-center">
                <div className="mb-2 text-lg font-bold text-gray-800">
                  {gradeInfo.action}
                </div>
                <div className="mb-1 text-sm font-medium">권장 조치</div>
                <div className="text-xs text-gray-600">등급 기반 대응</div>
              </div>
            </div>
          </div>

          {/* Critical Violations Alert */}
          {criticalViolations.length > 0 && (
            <div className="p-4 mb-4 bg-red-50 rounded-lg border-2 border-red-200">
              <div className="flex gap-3 items-start">
                <AlertTriangle className="flex-shrink-0 mt-1 w-6 h-6 text-red-600" />
                <div className="flex-1">
                  <h3 className="mb-2 font-bold text-red-800">중대 위반 항목 발견</h3>
                  <p className="mb-3 text-sm text-red-700">
                    다음 항목들로 인해 등급이 자동으로 조정되었습니다:
                  </p>
                  <div className="space-y-2">
                    {criticalViolations.map(cv => (
                      <div key={cv.question.id} className="p-3 bg-red-100 rounded">
                        <div className="flex gap-2 items-start">
                          <Shield className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-red-800">
                              {cv.question.id}: {cv.question.text}
                            </div>
                            <div className="mt-1 text-xs text-red-700">
                              <span className="font-medium">
                                위반 시 등급: {cv.violation.grade}
                              </span>
                              <span className="ml-2">사유: {cv.violation.reason}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Category Scores */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {categories.map(category => {
              const score = calculateCategoryScore(category)
              return (
                <div
                  key={category}
                  className="p-4 text-center bg-white rounded-lg border shadow-sm">
                  <div className="text-xl font-bold text-blue-600">{score}%</div>
                  <div className="mt-1 text-xs text-gray-600">{category}</div>
                </div>
              )
            })}
          </div>
        </Card>

        {showResults ? (
          /* Results View */
          <div className="space-y-6">
            {categories.map(category => {
              const score = calculateCategoryScore(category)
              const categoryQuestions = questions.filter(q => q.category === category)
              const noAnswers = categoryQuestions.filter(q => answers[q.id] === 'no')
              const criticalInCategory = noAnswers.filter(q => q.criticalViolation)

              return (
                <Card
                  key={category}
                  className="p-6 shadow-lg backdrop-blur-sm bg-white/80">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{category}</h3>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{score}%</div>
                      <div className="text-xs text-gray-500">
                        {categoryQuestions.filter(q => answers[q.id] === 'yes').length}/
                        {categoryQuestions.length} 준수
                      </div>
                    </div>
                  </div>

                  {criticalInCategory.length > 0 && (
                    <div className="p-4 mb-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="flex gap-2 items-center mb-2 font-medium text-red-800">
                        <AlertTriangle className="w-4 h-4" />
                        중대 위반 항목
                      </h4>
                      <ul className="space-y-2">
                        {criticalInCategory.map(q => (
                          <li
                            key={q.id}
                            className="p-2 text-sm text-red-700 bg-red-100 rounded">
                            <div className="font-medium">{q.text}</div>
                            <div className="mt-1 text-xs">
                              등급: {q.criticalViolation!.grade} |{' '}
                              {q.criticalViolation!.reason}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {noAnswers.filter(q => !q.criticalViolation).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="mb-2 font-medium text-gray-700">개선 필요 항목</h4>
                      <ul className="space-y-2">
                        {noAnswers
                          .filter(q => !q.criticalViolation)
                          .map(q => (
                            <li
                              key={q.id}
                              className="p-2 text-sm bg-yellow-50 rounded border border-yellow-200">
                              <div className="font-medium text-yellow-800">
                                {q.id}: {q.text}
                              </div>
                              <div className="mt-1 text-xs text-yellow-700">
                                가중치: {q.weight}점
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        ) : (
          /* Questions View */
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 p-1 bg-white rounded-lg border shadow-sm">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === category
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}>
                  {category}
                  <span className="ml-2 text-xs opacity-70">
                    ({questions.filter(q => q.category === category).length})
                  </span>
                </button>
              ))}
            </div>

            {/* Questions for Active Tab */}
            <Card className="p-6 shadow-lg backdrop-blur-sm bg-white/80">
              <h3 className="mb-6 text-xl font-semibold text-gray-900">{activeTab}</h3>

              <div className="space-y-4">
                {questions
                  .filter(q => q.category === activeTab)
                  .map(question => {
                    const isAnswered = answers[question.id]
                    const isCritical =
                      question.criticalViolation && answers[question.id] === 'no'

                    return (
                      <div
                        key={question.id}
                        className={`p-4 border rounded-lg transition-all ${
                          isCritical
                            ? 'bg-red-50 border-red-300'
                            : 'bg-white border-gray-200 hover:shadow-sm'
                        }`}>
                        <div className="flex gap-4 items-start">
                          <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 bg-blue-100 rounded-full">
                            <span className="text-sm font-medium text-blue-700">
                              {question.id}
                            </span>
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="text-base font-medium leading-relaxed text-gray-900">
                                {question.text}
                              </h4>
                              <div className="flex gap-2 items-center ml-4">
                                <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
                                  가중치: {question.weight}
                                </span>
                                {question.criticalViolation && (
                                  <span className="flex gap-1 items-center px-2 py-1 text-xs text-red-700 bg-red-100 rounded-full">
                                    <AlertTriangle className="w-3 h-3" />
                                    중대위반
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Critical Violation Info */}
                            {question.criticalViolation && (
                              <div className="p-3 mb-3 bg-red-100 rounded-lg border border-red-200">
                                <div className="flex gap-2 items-start">
                                  <Info className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                  <div className="text-sm text-red-800">
                                    <div className="mb-1 font-medium">
                                      위반 시 등급: {question.criticalViolation.grade}
                                    </div>
                                    <div className="text-xs">
                                      {question.criticalViolation.reason}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Answer Options */}
                            <div className="flex gap-3">
                              <label className="flex gap-2 items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name={question.id}
                                  value="yes"
                                  checked={answers[question.id] === 'yes'}
                                  onChange={e =>
                                    handleAnswerChange(question.id, e.target.value)
                                  }
                                  className="w-4 h-4 text-green-600"
                                />
                                <span className="flex gap-1 items-center text-sm font-medium text-green-700">
                                  <Check className="w-4 h-4" />예
                                </span>
                              </label>

                              <label className="flex gap-2 items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name={question.id}
                                  value="no"
                                  checked={answers[question.id] === 'no'}
                                  onChange={e =>
                                    handleAnswerChange(question.id, e.target.value)
                                  }
                                  className="w-4 h-4 text-red-600"
                                />
                                <span className="flex gap-1 items-center text-sm font-medium text-red-700">
                                  <AlertCircle className="w-4 h-4" />
                                  아니오
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
