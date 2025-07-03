'use client'

// ============================================================================
// 외부 라이브러리 임포트 (External Library Imports)
// ============================================================================

import React from 'react' // React 라이브러리

// ============================================================================
// 타입 정의 (Type Definitions)
// ============================================================================

/**
 * 자가진단 답변 인터페이스
 */
interface Answer {
  questionId: string
  answer: boolean
  hasCriticalViolation?: boolean
  penaltyInfo?: string
  legalBasis?: string
  categoryName?: string
  questionText?: string
}

/**
 * 자가진단 질문 인터페이스
 */
interface Question {
  id: string // 질문 고유 식별자
  category: string // 질문 카테고리
  text: string // 질문 내용
  weight: number // 가중치
  criticalViolation?: {
    grade: 'D' | 'C' | 'B' // 위반 시 등급
    reason: string // 위반 사유
  }
}

/**
 * 중대위반 정보 인터페이스
 */
interface CriticalViolation {
  question: Question // 위반 질문
  violation: {
    grade: 'D' | 'C' | 'B'
    reason: string
  }
  penaltyInfo?: string
  legalBasis?: string
}

/**
 * PDF 보고서 템플릿 Props 인터페이스
 */
interface PDFReportTemplateProps {
  answers: Answer[] // 사용자 응답 데이터 (배열로 변경)
  questions: Question[] // 전체 질문 목록
  categories: string[] // 카테고리 목록
  finalGrade: string // 최종 등급
  baseScore: number // 기본 점수
  criticalViolations: CriticalViolation[] // 중대위반 목록
  companyName: string // 회사명
  isVisible?: boolean // 화면 표시 여부 (기본값: false)
  noAnswerCount: number
  score: number
  actualScore: number
  totalPossibleScore: number
  criticalViolationCount: number
  completedAt?: string // 완료 일시
}

// ============================================================================
// PDF 보고서 HTML 템플릿 컴포넌트 (PDF Report HTML Template Component)
// ============================================================================

export const PDFReportTemplate: React.FC<PDFReportTemplateProps> = ({
  answers,
  finalGrade,
  criticalViolations,
  companyName,
  isVisible = false,
  noAnswerCount,
  score,
  actualScore,
  totalPossibleScore,
  criticalViolationCount,
  completedAt
}) => {
  const styles = {
    // 컨테이너 스타일
    container: {
      width: '794px',
      minHeight: '1123px',
      padding: '32px',
      backgroundColor: '#ffffff',
      color: '#111827',
      fontFamily: '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
      fontSize: '14px',
      lineHeight: '1.5',
      opacity: isVisible ? 1 : 0,
      position: isVisible ? ('static' as const) : ('absolute' as const),
      top: isVisible ? 'auto' : '-9999px',
      left: isVisible ? 'auto' : '-9999px',
      zIndex: isVisible ? 'auto' : '-1',
      pointerEvents: isVisible ? ('auto' as const) : ('none' as const),
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    },

    // 헤더 스타일
    header: {
      marginBottom: '32px',
      textAlign: 'center' as const
    },
    headerTitle: {
      marginBottom: '8px',
      fontSize: '30px',
      fontWeight: 'bold',
      color: '#2563eb'
    },
    headerSubtitle: {
      marginBottom: '4px',
      fontSize: '18px',
      color: '#4b5563'
    },
    headerDate: {
      fontSize: '14px',
      color: '#6b7280'
    },

    // 카드 스타일
    card: {
      padding: '24px',
      marginBottom: '32px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    cardTitle: {
      marginBottom: '16px',
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#111827'
    },

    // 그리드 스타일
    grid2: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      fontSize: '14px'
    },
    grid3: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '24px',
      marginBottom: '24px'
    },
    grid5: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
      gap: '16px',
      marginBottom: '24px'
    },

    // 등급 스타일 (등급별 정확한 색상)
    gradeA: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      borderRadius: '12px',
      backgroundColor: '#10b981', // 에메랄드 색상
      color: '#ffffff',
      minHeight: '80px'
    },
    gradeB: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      borderRadius: '12px',
      backgroundColor: '#3b82f6', // 파랑 색상
      color: '#ffffff',
      minHeight: '80px'
    },
    gradeC: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      borderRadius: '12px',
      backgroundColor: '#f59e0b', // 황색 색상
      color: '#ffffff',
      minHeight: '80px'
    },
    gradeD: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      borderRadius: '12px',
      backgroundColor: '#ef4444', // 빨강 색상
      color: '#ffffff',
      minHeight: '80px'
    },
    gradeDefault: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      borderRadius: '12px',
      backgroundColor: '#6b7280',
      color: '#ffffff',
      minHeight: '80px'
    },
    gradeText: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#ffffff'
    },

    // 점수 스타일
    scoreContainer: {
      textAlign: 'center' as const
    },
    scoreValue: {
      marginBottom: '8px',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#2563eb'
    },
    scoreLabel: {
      marginTop: '8px',
      fontWeight: 'bold'
    },
    scoreDescription: {
      marginTop: '4px',
      fontSize: '12px',
      color: '#6b7280'
    },

    // 경고 스타일
    alertCritical: {
      padding: '24px',
      marginBottom: '32px',
      backgroundColor: '#fef2f2',
      borderRadius: '8px',
      border: '2px solid #f87171'
    },
    alertTitle: {
      marginBottom: '16px',
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#dc2626'
    },
    alertText: {
      marginBottom: '16px',
      fontSize: '14px',
      color: '#7f1d1d'
    },
    alertItem: {
      padding: '16px',
      backgroundColor: '#fee2e2',
      borderRadius: '6px',
      border: '1px solid #fca5a5',
      marginBottom: '12px'
    },
    alertItemTitle: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#991b1b',
      marginBottom: '8px'
    },
    alertItemDetail: {
      fontSize: '12px',
      color: '#7f1d1d',
      lineHeight: '1.6'
    },

    // 위반 항목 스타일
    violationSection: {
      padding: '24px',
      marginBottom: '32px',
      backgroundColor: '#fef7f0',
      borderRadius: '8px',
      border: '1px solid #fed7aa'
    },
    violationTitle: {
      marginBottom: '16px',
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#ea580c'
    },
    violationCategory: {
      marginBottom: '16px',
      padding: '12px',
      backgroundColor: '#fff7ed',
      borderRadius: '6px',
      border: '1px solid #fdba74'
    },
    violationCategoryTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#c2410c',
      marginBottom: '8px'
    },
    violationItem: {
      padding: '8px 12px',
      backgroundColor: '#ffffff',
      borderRadius: '4px',
      border: '1px solid #fed7aa',
      fontSize: '12px',
      color: '#9a3412',
      marginBottom: '4px'
    },

    // 개선 권장사항 스타일
    improvement: {
      marginBottom: '32px'
    },
    improvementBox: {
      padding: '24px',
      backgroundColor: '#fefce8',
      borderRadius: '8px',
      border: '1px solid #fde68a'
    },
    improvementItem: {
      fontSize: '14px',
      color: '#a16207',
      marginBottom: '8px'
    },

    // 푸터 스타일
    footer: {
      paddingTop: '24px',
      marginTop: '32px',
      borderTop: '1px solid #e5e7eb'
    },
    footerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '12px',
      color: '#6b7280'
    }
  }

  // ========================================================================
  // 유틸리티 함수들 (Utility Functions)
  // ========================================================================

  /**
   * 등급별 스타일 반환
   */
  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case 'A':
        return styles.gradeA
      case 'B':
        return styles.gradeB
      case 'C':
        return styles.gradeC
      case 'D':
        return styles.gradeD
      default:
        return styles.gradeDefault
    }
  }

  /**
   * 현재 날짜를 한국어 형식으로 반환
   */
  const getCurrentDate = () => {
    if (completedAt) {
      return new Date(completedAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    return new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * 카테고리 이름 매핑
   */
  const getCategoryName = (categoryId: string) => {
    const categoryNames: {[key: string]: string} = {
      '1': '인권 및 노동',
      '2': '산업안전 및 보건',
      '3': '환경 경영',
      '4': '공급망 및 조달',
      '5': '윤리경영 및 정보보호'
    }
    return categoryNames[categoryId] || `카테고리 ${categoryId}`
  }

  /**
   * 위반 항목들을 카테고리별로 그룹화
   */
  const groupViolationsByCategory = () => {
    const violations = answers.filter(a => a.answer === false)
    const grouped: {[key: string]: Answer[]} = {}

    violations.forEach(violation => {
      const category = violation.questionId.split('.')[0]
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(violation)
    })

    return grouped
  }

  /**
   * 개선 권장사항 목록 생성
   */
  const getImprovementItems = () => {
    const violationsByCategory = groupViolationsByCategory()
    return Object.entries(violationsByCategory).map(([categoryId, violations]) => ({
      category: getCategoryName(categoryId),
      count: violations.length,
      items: violations
    }))
  }

  // ========================================================================
  // 렌더링 (Rendering)
  // ========================================================================

  return (
    <div style={styles.container}>
      {/* ======================================================================
          보고서 헤더 (Report Header)
          ====================================================================== */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>공급망 실사 자가진단 보고서</h1>
        <p style={styles.headerSubtitle}>
          Supply Chain Due Diligence Self-Assessment Report
        </p>
        <p style={styles.headerDate}>생성일: {getCurrentDate()}</p>
      </div>
      {/* ======================================================================
          평가 기본 정보 (Basic Assessment Information)
          ====================================================================== */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>평가 기본 정보</h2>
        <div style={styles.grid2}>
          <div>
            <span style={{fontWeight: 'bold', color: '#374151'}}>평가 일시:</span>
            <span style={{marginLeft: '8px'}}>{getCurrentDate()}</span>
          </div>
          <div>
            <span style={{fontWeight: 'bold', color: '#374151'}}>평가 유형:</span>
            <span style={{marginLeft: '8px'}}>CSDDD 자가진단</span>
          </div>
          <div>
            <span style={{fontWeight: 'bold', color: '#374151'}}>평가 대상:</span>
            <span style={{marginLeft: '8px'}}>{companyName}</span>
          </div>
          <div>
            <span style={{fontWeight: 'bold', color: '#374151'}}>평가 기준:</span>
            <span style={{marginLeft: '8px'}}>유럽연합 CSDDD 지침</span>
          </div>
        </div>
      </div>
      {/* ======================================================================
          종합 평가 결과 (Overall Assessment Results)
          ====================================================================== */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>종합 평가 결과</h2>

        {/* 5개 항목 그리드 */}
        <div style={styles.grid5}>
          {/* 최종 등급 */}
          <div style={styles.scoreContainer}>
            <div style={getGradeStyle(finalGrade)}>
              <div style={styles.gradeText}>{finalGrade}</div>
            </div>
            <h3 style={styles.scoreLabel}>최종 등급</h3>
          </div>

          {/* 총 위반 건수 */}
          <div style={styles.scoreContainer}>
            <div style={{...styles.scoreValue, fontSize: '32px', color: '#dc2626'}}>
              {noAnswerCount}
            </div>
            <h3 style={styles.scoreLabel}>총 위반 건수</h3>
            <p style={styles.scoreDescription}>위반 항목 수</p>
          </div>

          {/* 중대 위반 건수 */}
          <div style={styles.scoreContainer}>
            <div style={{...styles.scoreValue, fontSize: '32px', color: '#dc2626'}}>
              {criticalViolationCount}
            </div>
            <h3 style={styles.scoreLabel}>중대 위반 건수</h3>
            <p style={styles.scoreDescription}>등급 영향 항목</p>
          </div>

          {/* 진단 점수 */}
          <div style={styles.scoreContainer}>
            <div style={{...styles.scoreValue, fontSize: '32px'}}>{score}</div>
            <h3 style={styles.scoreLabel}>진단 점수</h3>
            <p style={styles.scoreDescription}>기본 점수</p>
          </div>

          {/* 종합 점수 */}
          <div style={styles.scoreContainer}>
            <div style={{...styles.scoreValue, fontSize: '24px'}}>
              {actualScore.toFixed(1)} / {totalPossibleScore.toFixed(1)}
            </div>
            <h3 style={styles.scoreLabel}>종합 점수</h3>
            <p style={styles.scoreDescription}>최종 계산 점수</p>
          </div>
        </div>
      </div>
      {/* ======================================================================
          중대위반 항목 (Critical Violations)
          ====================================================================== */}

      {criticalViolations.length > 0 && (
        <div style={styles.alertCritical}>
          <h2 style={styles.alertTitle}>⚠️ 중대 위반 항목 발견</h2>
          <p style={styles.alertText}>
            다음 중대 위반 항목들로 인해 등급이 조정되었습니다 (
            {criticalViolations.length}건):
          </p>

          <div style={{marginTop: '16px'}}>
            {criticalViolations.map(cv => {
              // answers 배열에서 해당 질문의 상세 정보 찾기
              const answerDetail = answers.find(a => a.questionId === cv.question.id)

              return (
                <div key={cv.question.id} style={styles.alertItem}>
                  <div style={styles.alertItemTitle}>
                    📋 {cv.question.id}: {cv.question.text}
                  </div>
                  <div style={styles.alertItemDetail}>
                    <div style={{marginBottom: '4px'}}>
                      <strong>위반 시 등급:</strong> {cv.violation.grade}등급
                    </div>
                    <div style={{marginBottom: '4px'}}>
                      <strong>위반 사유:</strong> {cv.violation.reason}
                    </div>
                    <div style={{marginBottom: '4px'}}>
                      <strong>벌금 및 패널티:</strong>{' '}
                      {answerDetail?.penaltyInfo ?? '정보 없음'}
                    </div>
                    <div>
                      <strong>법적 근거:</strong>{' '}
                      {answerDetail?.legalBasis ?? '정보 없음'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {/* ======================================================================
          위반 항목 상세 정보 (Violation Details by Category)
          ====================================================================== */}
      {/* ======================================================================
          위반 항목 상세 정보 (Violation Details by Category)
          ====================================================================== */}
      {Object.keys(groupViolationsByCategory()).length > 0 && (
        <div style={styles.violationSection}>
          <h2 style={styles.violationTitle}>📊 위반 항목 상세 정보</h2>
          <p style={{fontSize: '14px', color: '#9a3412', marginBottom: '20px'}}>
            카테고리별 위반 항목 분석 결과입니다.
          </p>

          {Object.entries(groupViolationsByCategory()).map(([categoryId, violations]) => (
            <div key={categoryId} style={styles.violationCategory}>
              <div style={styles.violationCategoryTitle}>
                {getCategoryName(categoryId)} ({violations.length}건)
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                {violations.map((violation, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.violationItem,
                      padding: '16px',
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #fed7aa',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#c2410c',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                      📋 {violation.questionId}
                      {violation.hasCriticalViolation && (
                        <span style={{color: '#dc2626', marginLeft: '8px'}}>
                          ⚠️ 중대위반
                        </span>
                      )}
                    </div>

                    {violation.questionText && (
                      <div
                        style={{
                          fontSize: '13px',
                          color: '#7c2d12',
                          marginBottom: '8px',
                          padding: '8px',
                          backgroundColor: '#fef7f0',
                          borderRadius: '4px'
                        }}>
                        <strong>질문:</strong> {violation.questionText}
                      </div>
                    )}

                    <div
                      style={{
                        fontSize: '12px',
                        color: '#9a3412',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px'
                      }}>
                      <div>
                        <strong>카테고리:</strong>{' '}
                        {violation.categoryName || getCategoryName(categoryId)}
                      </div>
                      <div>
                        <strong>벌칙 정보:</strong> {violation.penaltyInfo}
                      </div>
                    </div>

                    {violation.legalBasis && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#9a3412',
                          marginTop: '8px',
                          padding: '8px',
                          backgroundColor: '#fef7f0',
                          borderRadius: '4px'
                        }}>
                        <strong>법적 근거:</strong> {violation.legalBasis}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* ======================================================================
          개선 권장사항 (Improvement Recommendations)
          ====================================================================== */}
      {getImprovementItems().length > 0 && (
        <div style={styles.improvement}>
          <h2 style={styles.cardTitle}>💡 개선 권장사항</h2>
          <div style={styles.improvementBox}>
            <p style={{fontSize: '14px', color: '#92400e', marginBottom: '16px'}}>
              다음 영역에서 개선이 필요합니다:
            </p>
            {getImprovementItems().map(item => (
              <div key={item.category} style={styles.improvementItem}>
                <span style={{fontWeight: 'bold'}}>• {item.category}:</span>
                <span style={{marginLeft: '8px'}}>{item.count}개 항목 개선 필요</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* ======================================================================
          보고서 푸터 (Report Footer)
          ====================================================================== */}
      <div style={styles.footer}>
        <div style={styles.footerContent}>
          <div>본 보고서는 CSDDD 자가진단 시스템에 의해 자동 생성되었습니다.</div>
          <div>© 2024 NSMM ESG Platform. All rights reserved.</div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 기본 내보내기 (Default Export)
// ============================================================================

export default PDFReportTemplate
