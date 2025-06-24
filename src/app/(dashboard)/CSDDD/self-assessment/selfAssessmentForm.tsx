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

// ============================================================================
// 외부 서비스 함수 임포트 (예: 제출 API)
// ============================================================================
// ============================================================================
// 외부 서비스 함수 임포트 (예: 제출 API)
// ============================================================================
'use client'

import {
  submitSelfAssessmentToBackend,
  fetchSelfAssessmentAnswers
} from '@/services/csdddService'

import type {SelfAssessmentRequest} from '@/types/csdddType'
import {answerConverter} from '@/util/answerConverter'

import authService from '@/services/authService'

// ============================================================================
// 외부 라이브러리 임포트 (External Library Imports)
// ============================================================================

import {useEffect, useState} from 'react' // React 상태 관리 및 생명주기 훅
import {showSuccess, showError} from '@/util/toast'
import {Button} from '@/components/ui/button' // 커스텀 버튼 컴포넌트
import {Card} from '@/components/ui/card' // 카드 레이아웃 컴포넌트
import Link from 'next/link' // Next.js 내부 링크 컴포넌트

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

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@/components/ui/tooltip'

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
  const [submitted, setSubmitted] = useState(false)
  // zustand auth store에서 정보 가져오기

  // ========================================================================
  // 자가진단 제출 핸들러 (Self-Assessment Submission)
  // ========================================================================
  const handleSubmit = async () => {
    try {
      const userInfoResponse = await authService.getCurrentUserByType()
      const userInfo = userInfoResponse?.data

      if (!userInfo) throw new Error('User info not found')

      const accountNumber = userInfo.accountNumber
      const userType = userInfo.userType
      const headquartersId =
        userType === 'PARTNER' ? userInfo.headquartersId?.toString() : undefined // ✅ JSON 속성 이름에 맞춰 수정
      const partnerId = userType === 'PARTNER' ? userInfo.partnerId : undefined

      if (!accountNumber) throw new Error('accountNumber is missing')

      const requestList: SelfAssessmentRequest[] =
        answerConverter.fromStringToEnumCompatible(answers, questions)

      console.log('📌 userInfo:', userInfo)
      console.log('📌 headquartersId:', headquartersId)
      console.log('📌 partnerId:', partnerId)
      console.log('📦 requestList (제출 전):', requestList)

      await submitSelfAssessmentToBackend(
        requestList,
        userType,
        headquartersId, // ✅ '' 보내지 말고 undefined 그대로 넘기기
        accountNumber,
        partnerId
      )

      console.log('✅ 제출 성공')
    } catch (error: any) {
      console.error('❌ 제출 실패:', error)
      if (error.response) {
        console.error('📛 서버 응답 상태:', error.response.status)
        console.error('📩 서버 응답 내용:', error.response.data)
      } else if (error.request) {
        console.error('📡 요청은 전송됐으나 응답 없음:', error.request)
      } else {
        console.error('🚨 설정 중 에러 발생:', error.message)
      }
    }
  }

  /**
   * 현재 활성화된 카테고리 탭
   * 기본값은 첫 번째 카테고리인 '인권 및 노동'
   */
  const [activeTab, setActiveTab] = useState('인권 및 노동')

  // ========================================================================
  // 초기화 및 생명주기 관리 (Initialization & Lifecycle)
  // ========================================================================

  /**
   * 컴포넌트 마운트 시 기존 답변을 불러오고, 없으면 모든 질문을 'yes'로 초기화
   */
  useEffect(() => {
    // 폼 상태에 기존 답변을 넣어주는 함수 (향후 react-hook-form 사용 시 활용)
    const setValueFromFetchedAnswers = (fetched: Record<string, string>) => {
      // 여기에 react-hook-form 사용 시 form.setValue 호출
      // 현재는 상태형이므로 setAnswers만 필요
      // 예시: Object.entries(fetched).forEach(([q, v]) => form.setValue(q, v))
      // 이 부분은 추후 react-hook-form 도입 시 활성화
    }
    async function loadAnswers() {
      try {
        const user = await authService.getCurrentUserByType()
        if (user?.data?.accountNumber) {
          const existingAnswers = await fetchSelfAssessmentAnswers(
            user.data.accountNumber,
            user.data.accountNumber // 본사/협력사 모두 동일 accountNumber 사용
          )
          setAnswers(existingAnswers)
          setValueFromFetchedAnswers(existingAnswers) // 폼 상태에도 반영 (react-hook-form 사용 시)
        }
      } catch (error) {
        console.error('답변 불러오기 실패:', error)
      }
    }
    loadAnswers()
  }, [])

  useEffect(() => {
    async function loadAnswers() {
      try {
        const user = await authService.getCurrentUserByType()
        if (user?.data?.accountNumber) {
          const existingAnswers = await fetchSelfAssessmentAnswers(
            user.data.accountNumber,
            user.data.accountNumber
          )

          // 대문자를 소문자로 변환
          if (existingAnswers) {
            const normalizedAnswers = Object.entries(existingAnswers).reduce(
              (acc, [key, value]) => {
                acc[key] = typeof value === 'string' ? value.toLowerCase() : value
                return acc
              },
              {} as Record<string, string>
            )

            console.log('변환된 답변:', normalizedAnswers)
            setAnswers(normalizedAnswers)
          }
        }
      } catch (error) {
        console.error('답변 불러오기 실패:', error)
      }
    }
    loadAnswers()
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

  const getCriticalViolations = (): SelfAssessmentRequest[] => {
    return questions
      .filter(q => q.criticalViolation && answers[q.id] === 'no')
      .map(q => ({
        questionId: q.id,
        answer: 'no',
        category: q.category,
        weight: q.weight,
        critical: true, // 👈 반드시 true
        criticalGrade: q.criticalViolation?.grade // "B/C", "D" 등
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

  return (
    <div className="flex flex-col w-full h-full p-4">
      {/* ========================================================================
          상단 네비게이션 섹션 (Top Navigation Section)
          ======================================================================== */}
      <div className="flex flex-row items-center p-2 px-2 mb-6 text-sm text-gray-500 bg-white rounded-lg shadow-sm">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Home className="w-4 h-4 mr-1" />
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
          - 뒤로가기 버튼과 페이지 제목/설명 (csddd.tsx와 동일한 구조)
          ======================================================================== */}
      <div className="flex flex-row w-full h-24 mb-6">
        <Link
          href="/CSDDD"
          className="flex flex-row items-center p-4 space-x-4 transition rounded-md cursor-pointer hover:bg-gray-200">
          <ArrowLeft className="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
          <PageHeader
            icon={<Shield className="w-6 h-6 text-blue-600" />}
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
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-3 p-4 border shadow-lg bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200 rounded-2xl backdrop-blur-sm">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`
        group relative h-14 px-6 py-3 rounded-2xl text-sm font-semibold 
        transition-all duration-300 ease-in-out transform hover:scale-105
        border-2 flex items-center justify-center min-w-[120px]
        ${
          activeTab === category
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border-blue-500 shadow-blue-500/25'
            : 'bg-white/80 text-slate-700 hover:text-blue-600 hover:bg-white hover:border-blue-300 border-slate-200 hover:shadow-md'
        }
      `}>
                <span className="flex flex-col items-center justify-center w-full leading-tight">
                  <span className="text-base font-bold tracking-wide">{category}</span>
                  <span
                    className={`
          text-xs mt-1 px-2 py-0.5 rounded-full font-medium
          ${
            activeTab === category
              ? 'bg-white/20 text-white/90'
              : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
          }
        `}>
                    {questions.filter(q => q.category === category).length}개
                  </span>
                </span>
                {activeTab === category && (
                  <div className="absolute w-2 h-2 transform -translate-x-1/2 bg-white rounded-full shadow-lg -bottom-1 left-1/2 animate-pulse"></div>
                )}
                <div className="absolute inset-0 transition-opacity duration-300 opacity-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:opacity-100"></div>
              </button>
            ))}
          </div>
          {/* Questions for Active Tab */}
          <Card className="p-6 bg-white shadow-lg">
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
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full">
                          <span className="text-sm font-medium text-blue-700">
                            {question.id}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-base font-medium leading-relaxed text-gray-900">
                              {question.text}
                            </h4>
                            <div className="flex items-center gap-2 ml-4">
                              {question.criticalViolation && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="group relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-gradient-to-r from-red-100 to-red-50 rounded-full cursor-help border border-red-200 hover:border-red-300 transition-all duration-200 hover:shadow-md hover:shadow-red-200/50 hover:scale-105">
                                        <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                                        <span className="tracking-wide">중대위반</span>
                                        <div className="absolute w-2 h-2 bg-red-500 rounded-full -top-1 -right-1 animate-pulse"></div>
                                        <div className="absolute inset-0 transition-opacity duration-300 rounded-full opacity-0 bg-gradient-to-r from-red-200/0 via-red-200/20 to-red-200/0 group-hover:opacity-100"></div>
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="relative max-w-xs p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-xl">
                                      <div className="px-4 py-3 text-white bg-gradient-to-r from-red-600 to-red-700">
                                        <div className="flex items-center gap-2">
                                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
                                            <AlertTriangle className="w-4 h-4" />
                                          </div>
                                          <span className="text-sm font-bold">
                                            중대위반 항목
                                          </span>
                                        </div>
                                      </div>
                                      <div className="p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-medium text-gray-600">
                                            위반 시 등급
                                          </span>
                                          <span className="px-2 py-1 text-xs font-bold text-red-700 bg-red-100 border border-red-200 rounded-full">
                                            {question.criticalViolation.grade}
                                          </span>
                                        </div>
                                        <div className="h-px bg-gradient-to-r from-transparent via-red-200 to-transparent"></div>
                                        <div className="space-y-1">
                                          <span className="text-xs font-medium text-gray-600">
                                            위반 사유
                                          </span>
                                          <p className="p-2 text-sm leading-relaxed text-gray-800 border border-gray-100 rounded-lg bg-gray-50">
                                            {question.criticalViolation.reason}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200 min-w-[80px]">
                                가중치{' '}
                                <span className="font-bold">{question.weight}</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <label
                              className={`
    flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105
    ${
      answers[question.id] === 'yes'
        ? 'bg-green-100 text-green-800 border-2 border-green-300'
        : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-green-200 hover:bg-green-50'
    }
  `}>
                              <div
                                className={`
      relative w-4 h-4 rounded-full border-2 transition-all duration-200
      ${
        answers[question.id] === 'yes'
          ? 'border-green-500 bg-green-500'
          : 'border-gray-300'
      }
    `}>
                                {answers[question.id] === 'yes' && (
                                  <Check
                                    className="w-2 h-2 text-white absolute top-0.5 left-0.5"
                                    strokeWidth={3}
                                  />
                                )}
                              </div>
                              <input
                                type="radio"
                                value="yes"
                                checked={answers[question.id] === 'yes'}
                                onChange={() => handleAnswerChange(question.id, 'yes')}
                                className="sr-only"
                              />
                              <span className="text-sm font-medium">예</span>
                            </label>
                            <label
                              className={`
    flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105
    ${
      answers[question.id] === 'no'
        ? 'bg-red-100 text-red-800 border-2 border-red-300'
        : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-red-200 hover:bg-red-50'
    }
  `}>
                              <div
                                className={`
      relative w-4 h-4 rounded-full border-2 transition-all duration-200
      ${answers[question.id] === 'no' ? 'border-red-500 bg-red-500' : 'border-gray-300'}
    `}>
                                {answers[question.id] === 'no' && (
                                  <AlertCircle
                                    className="w-2 h-2 text-white absolute top-0.5 left-0.5"
                                    strokeWidth={3}
                                  />
                                )}
                              </div>
                              <input
                                type="radio"
                                value="no"
                                checked={answers[question.id] === 'no'}
                                onChange={() => handleAnswerChange(question.id, 'no')}
                                className="sr-only"
                              />
                              <span className="text-sm font-medium">아니오</span>
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
      </div>
      {/* 제출하기 버튼 (Submit Button) */}
      {!submitted && (
        <div className="flex justify-end mt-8">
          <button
            onClick={handleSubmit}
            className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700">
            자가진단 제출하기
          </button>
        </div>
      )}
    </div>
  )
}
