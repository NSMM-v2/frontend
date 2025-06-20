'use client'
import {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {Card} from '@/components/ui/card'
import {
  Check,
  AlertCircle,
  Info,
  BarChart3,
  Download,
  AlertTriangle,
  Shield
} from 'lucide-react'

interface Question {
  id: string
  category: string
  text: string
  weight: number
  criticalViolation?: {
    grade: 'D' | 'C' | 'B' | 'B/C'
    reason: string
  }
}

const categories = [
  '인권 및 노동',
  '산업안전·보건',
  '환경경영',
  '공급망 및 조달',
  '윤리경영 및 정보보호'
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

// 총 가중치 계산 (모든 질문의 가중치 합)
const TOTAL_WEIGHT = questions.reduce((sum, q) => sum + q.weight, 0) // 52.5

// 등급 기준 (100점 만점 기준)
const gradeThresholds = {
  A: 90, // ≥ 90%
  B: 75, // 75-89.9%
  C: 60, // 60-74.9%
  D: 0 // < 60%
}

export default function SelfAssessmentForm() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState('인권 및 노동')
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    // 모든 질문을 'yes'로 초기화
    const initial: Record<string, string> = {}
    questions.forEach(q => {
      initial[q.id] = 'yes'
    })
    setAnswers(initial)
  }, [])

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const calculateScore = () => {
    let totalScore = 0
    questions.forEach(q => {
      if (answers[q.id] === 'yes') {
        totalScore += q.weight
      }
    })
    return Math.round((totalScore / TOTAL_WEIGHT) * 100)
  }

  const calculateCategoryScore = (category: string) => {
    const categoryQuestions = questions.filter(q => q.category === category)
    let totalScore = 0
    let maxScore = 0

    categoryQuestions.forEach(q => {
      if (answers[q.id] === 'yes') {
        totalScore += q.weight
      }
      maxScore += q.weight
    })

    return maxScore ? Math.round((totalScore / maxScore) * 100) : 0
  }

  const getFinalGrade = () => {
    const baseScore = calculateScore()

    // 중대 위반 항목 검사
    const criticalViolations = questions
      .filter(q => q.criticalViolation && answers[q.id] === 'no')
      .map(q => q.criticalViolation!)

    if (criticalViolations.length === 0) {
      // 일반 등급 계산
      if (baseScore >= gradeThresholds.A) return 'A'
      if (baseScore >= gradeThresholds.B) return 'B'
      if (baseScore >= gradeThresholds.C) return 'C'
      return 'D'
    }

    // 중대 위반이 있는 경우 최저 등급으로 강등
    const worstGrade = criticalViolations.reduce((worst, violation) => {
      const grades = ['A', 'B', 'C', 'D']
      const currentWorst = grades.indexOf(worst)
      const violationGrade = violation.grade === 'B/C' ? 'C' : violation.grade
      const violationWorst = grades.indexOf(violationGrade)
      return violationWorst > currentWorst ? violationGrade : worst
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

  const exportResults = () => {
    const finalGrade = getFinalGrade()
    const baseScore = calculateScore()
    const criticalViolations = getCriticalViolations()

    const results = {
      timestamp: new Date().toISOString(),
      finalGrade: finalGrade,
      baseScore: baseScore,
      totalPossibleScore: TOTAL_WEIGHT,
      actualScore: questions.reduce(
        (sum, q) => sum + (answers[q.id] === 'yes' ? q.weight : 0),
        0
      ),
      criticalViolations: criticalViolations.map(cv => ({
        questionId: cv.question.id,
        questionText: cv.question.text,
        violationGrade: cv.violation.grade,
        violationReason: cv.violation.reason
      })),
      categoryScores: categories.map(cat => ({
        category: cat,
        score: calculateCategoryScore(cat)
      })),
      answers: answers,
      gradeInfo: getGradeInfo(finalGrade)
    }

    const blob = new Blob([JSON.stringify(results, null, 2)], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `supply-chain-assessment-${finalGrade}-grade-${
      new Date().toISOString().split('T')[0]
    }.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const finalGrade = getFinalGrade()
  const gradeInfo = getGradeInfo(finalGrade)
  const baseScore = calculateScore()
  const criticalViolations = getCriticalViolations()

  return (
    <div className="w-full min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">공급망 실사 자가진단</h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            ESG 관점에서 공급망의 리스크를 평가하고 개선점을 파악해보세요
          </p>
        </div>

        {/* Grade Overview */}
        <Card className="p-6 mb-8 shadow-lg bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">종합 평가 결과</h2>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowResults(!showResults)}
                variant="outline"
                className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                {showResults ? '질문 보기' : '결과 보기'}
              </Button>
              <Button
                onClick={exportResults}
                variant="outline"
                className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                결과 다운로드
              </Button>
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
            <div className="p-6 bg-white border rounded-lg shadow-sm">
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-blue-600">{baseScore}점</div>
                <div className="mb-1 text-sm font-medium">기본 점수</div>
                <div className="text-xs text-gray-600">100점 만점 기준</div>
              </div>
            </div>

            {/* Risk Level */}
            <div className="p-6 bg-white border rounded-lg shadow-sm">
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
            <div className="p-4 mb-4 border-2 border-red-200 rounded-lg bg-red-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="flex-shrink-0 w-6 h-6 mt-1 text-red-600" />
                <div className="flex-1">
                  <h3 className="mb-2 font-bold text-red-800">중대 위반 항목 발견</h3>
                  <p className="mb-3 text-sm text-red-700">
                    다음 항목들로 인해 등급이 자동으로 조정되었습니다:
                  </p>
                  <div className="space-y-2">
                    {criticalViolations.map(cv => (
                      <div key={cv.question.id} className="p-3 bg-red-100 rounded">
                        <div className="flex items-start gap-2">
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
                  className="p-4 text-center bg-white border rounded-lg shadow-sm">
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
                  className="p-6 shadow-lg bg-white/80 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
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
                    <div className="p-4 mb-4 border border-red-200 rounded-lg bg-red-50">
                      <h4 className="flex items-center gap-2 mb-2 font-medium text-red-800">
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
                              className="p-2 text-sm border border-yellow-200 rounded bg-yellow-50">
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
            <div className="flex flex-wrap gap-2 p-1 bg-white border rounded-lg shadow-sm">
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
            <Card className="p-6 shadow-lg bg-white/80 backdrop-blur-sm">
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
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 bg-white hover:shadow-sm'
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
                                <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
                                  가중치: {question.weight}
                                </span>
                                {question.criticalViolation && (
                                  <span className="flex items-center gap-1 px-2 py-1 text-xs text-red-700 bg-red-100 rounded-full">
                                    <AlertTriangle className="w-3 h-3" />
                                    중대위반
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Critical Violation Info */}
                            {question.criticalViolation && (
                              <div className="p-3 mb-3 bg-red-100 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-2">
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
                              <label className="flex items-center gap-2 cursor-pointer">
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
                                <span className="flex items-center gap-1 text-sm font-medium text-green-700">
                                  <Check className="w-4 h-4" />예
                                </span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
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
                                <span className="flex items-center gap-1 text-sm font-medium text-red-700">
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
