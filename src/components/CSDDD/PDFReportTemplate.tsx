/**
 * CSDDD PDF 보고서 HTML 템플릿 컴포넌트 - 한글 지원 PDF 생성용
 *
 * html2canvas를 사용하여 HTML을 이미지로 변환한 후 PDF에 삽입하기 위한
 * 전용 템플릿 컴포넌트. 브라우저 폰트를 사용하므로 한글이 완벽히 지원됨
 *
 * 주요 기능:
 * - 한글 완벽 지원 (브라우저 폰트 사용)
 * - 토스 스타일 디자인 적용
 * - A4 용지 비율에 맞춘 레이아웃
 * - 등급별 색상 구분
 * - 중대위반 항목 강조 표시
 *
 * 사용된 기술:
 * - React 18 컴포넌트
 * - Tailwind CSS (스타일링)
 * - TypeScript 타입 안전성
 *
 * @author ESG Project Team
 * @version 1.0
 */

'use client'

// ============================================================================
// 외부 라이브러리 임포트 (External Library Imports)
// ============================================================================

import React from 'react' // React 라이브러리

// ============================================================================
// 타입 정의 (Type Definitions)
// ============================================================================

/**
 * 자가진단 질문 인터페이스
 */
interface Question {
  id: string // 질문 고유 식별자
  category: string // 질문 카테고리
  text: string // 질문 내용
  weight: number // 가중치
  criticalViolation?: {
    grade: 'D' | 'C' | 'B' | 'B/C' // 위반 시 등급
    reason: string // 위반 사유
  }
}

/**
 * 중대위반 정보 인터페이스
 */
interface CriticalViolation {
  question: Question // 위반 질문
  violation: {
    grade: 'D' | 'C' | 'B' | 'B/C'
    reason: string
  }
}

/**
 * 등급 정보 인터페이스
 */
interface GradeInfo {
  color: string // CSS 클래스명
  description: string // 위험 수준 설명
  action: string // 권장 조치사항
}

/**
 * PDF 보고서 템플릿 Props 인터페이스
 */
interface PDFReportTemplateProps {
  answers: Record<string, string> // 사용자 응답 데이터
  questions: Question[] // 전체 질문 목록
  categories: string[] // 카테고리 목록
  finalGrade: string // 최종 등급
  gradeInfo: GradeInfo // 등급 정보
  baseScore: number // 기본 점수
  criticalViolations: CriticalViolation[] // 중대위반 목록
  calculateCategoryScore: (category: string) => number // 카테고리 점수 계산 함수
  isVisible?: boolean // 화면 표시 여부 (기본값: false)
}

// ============================================================================
// PDF 보고서 HTML 템플릿 컴포넌트 (PDF Report HTML Template Component)
// ============================================================================

/**
 * CSDDD PDF 보고서 HTML 템플릿 컴포넌트
 *
 * html2canvas로 변환되어 PDF에 삽입될 HTML 구조를 렌더링
 * A4 용지 비율에 맞춘 레이아웃과 한글 폰트 지원
 */
export const PDFReportTemplate: React.FC<PDFReportTemplateProps> = ({
  answers,
  questions,
  categories,
  finalGrade,
  gradeInfo,
  baseScore,
  criticalViolations,
  calculateCategoryScore,
  isVisible = false
}) => {
  // ========================================================================
  // 인라인 스타일 정의 (Inline Styles Definitions)
  // html2canvas oklch 색상 문제 방지를 위해 모든 스타일을 hex/rgb로 정의
  // ========================================================================

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
      borderRadius: '8px'
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

    // 등급 스타일
    gradeA: {
      display: 'inline-block',
      padding: '32px',
      borderRadius: '12px',
      backgroundColor: '#22c55e',
      color: '#ffffff'
    },
    gradeB: {
      display: 'inline-block',
      padding: '32px',
      borderRadius: '12px',
      backgroundColor: '#3b82f6',
      color: '#ffffff'
    },
    gradeC: {
      display: 'inline-block',
      padding: '32px',
      borderRadius: '12px',
      backgroundColor: '#f97316',
      color: '#ffffff'
    },
    gradeD: {
      display: 'inline-block',
      padding: '32px',
      borderRadius: '12px',
      backgroundColor: '#ef4444',
      color: '#ffffff'
    },
    gradeDefault: {
      display: 'inline-block',
      padding: '32px',
      borderRadius: '12px',
      backgroundColor: '#6b7280',
      color: '#ffffff'
    },
    gradeText: {
      fontSize: '32px',
      fontWeight: 'bold'
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

    // 테이블 스타일
    table: {
      overflow: 'hidden',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    tableHeader: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      padding: '12px 16px',
      fontWeight: 'bold',
      color: '#111827',
      backgroundColor: '#f3f4f6'
    },
    tableRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      padding: '12px 16px',
      fontSize: '14px',
      borderTop: '1px solid #f3f4f6'
    },
    tableRowEven: {
      backgroundColor: '#ffffff'
    },
    tableRowOdd: {
      backgroundColor: '#f9fafb'
    },
    tableCellCenter: {
      textAlign: 'center' as const,
      fontWeight: 'bold',
      color: '#2563eb'
    },

    // 경고 스타일
    alertCritical: {
      padding: '24px',
      marginBottom: '32px',
      backgroundColor: '#fef2f2',
      borderRadius: '8px',
      border: '2px solid #fca5a5'
    },
    alertTitle: {
      marginBottom: '16px',
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#b91c1c'
    },
    alertText: {
      marginBottom: '16px',
      fontSize: '14px',
      color: '#dc2626'
    },
    alertItem: {
      padding: '12px',
      backgroundColor: '#fee2e2',
      borderRadius: '4px',
      border: '1px solid #fca5a5',
      marginBottom: '8px'
    },
    alertItemTitle: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#7f1d1d'
    },
    alertItemDetail: {
      marginTop: '4px',
      fontSize: '12px',
      color: '#dc2626'
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
    return new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * 개선 권장사항 목록 생성
   */
  const getImprovementItems = () => {
    return categories
      .map(category => {
        const categoryQuestions = questions.filter(q => q.category === category)
        const noAnswers = categoryQuestions.filter(q => answers[q.id] === 'no')
        return {
          category,
          count: noAnswers.filter(q => !q.criticalViolation).length
        }
      })
      .filter(item => item.count > 0)
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
            <span style={{marginLeft: '8px'}}>[회사명]</span>
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

        <div style={styles.grid3}>
          {/* 최종 등급 */}
          <div style={styles.scoreContainer}>
            <div style={getGradeStyle(finalGrade)}>
              <div style={styles.gradeText}>{finalGrade}</div>
            </div>
            <h3 style={styles.scoreLabel}>최종 등급</h3>
            <p style={styles.scoreDescription}>{gradeInfo.description}</p>
          </div>

          {/* 기본 점수 */}
          <div style={styles.scoreContainer}>
            <div style={{...styles.scoreValue, fontSize: '32px'}}>{baseScore}</div>
            <h3 style={styles.scoreLabel}>기본 점수</h3>
            <p style={styles.scoreDescription}>100점 만점 기준</p>
          </div>

          {/* 권장 조치 */}
          <div style={styles.scoreContainer}>
            <div style={{fontSize: '18px', fontWeight: 'bold', color: '#374151'}}>
              {gradeInfo.action}
            </div>
            <h3 style={styles.scoreLabel}>권장 조치</h3>
            <p style={styles.scoreDescription}>등급 기반 대응</p>
          </div>
        </div>
      </div>

      {/* ======================================================================
          카테고리별 점수 (Category Scores)
          ====================================================================== */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>카테고리별 점수</h2>

        <div style={styles.table}>
          {/* 테이블 헤더 */}
          <div style={styles.tableHeader}>
            <div>평가 카테고리</div>
            <div style={{textAlign: 'center'}}>점수</div>
          </div>

          {/* 테이블 내용 */}
          {categories.map((category, index) => {
            const score = calculateCategoryScore(category)
            return (
              <div
                key={category}
                style={{
                  ...styles.tableRow,
                  ...(index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd)
                }}>
                <div style={{color: '#111827'}}>{category}</div>
                <div style={styles.tableCellCenter}>{score}점</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ======================================================================
          중대위반 항목 (Critical Violations)
          ====================================================================== */}
      {criticalViolations.length > 0 && (
        <div style={styles.alertCritical}>
          <h2 style={styles.alertTitle}>중대 위반 항목 발견</h2>
          <p style={styles.alertText}>
            다음 중대 위반 항목들로 인해 등급이 조정되었습니다:
          </p>

          <div style={{marginTop: '12px'}}>
            {criticalViolations.slice(0, 6).map(cv => (
              <div key={cv.question.id} style={styles.alertItem}>
                <div style={styles.alertItemTitle}>
                  {cv.question.id}: {cv.question.text}
                </div>
                <div style={styles.alertItemDetail}>
                  <span style={{fontWeight: 'bold'}}>
                    위반 시 등급: {cv.violation.grade}
                  </span>
                  <span style={{marginLeft: '16px'}}>사유: {cv.violation.reason}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================================
          개선 권장사항 (Improvement Recommendations)
          ====================================================================== */}
      {getImprovementItems().length > 0 && (
        <div style={styles.improvement}>
          <h2 style={styles.cardTitle}>개선 권장사항</h2>
          <div style={styles.improvementBox}>
            {getImprovementItems().map(item => (
              <div key={item.category} style={styles.improvementItem}>
                <span style={{fontWeight: 'bold'}}>• {item.category}:</span>
                <span style={{marginLeft: '4px'}}>{item.count}개 항목 개선 필요</span>
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
          <div>{getCurrentDate()} NSMM ESG 플랫폼에서 생성</div>
          <div>© 2024 NSMM. All rights reserved.</div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 기본 내보내기 (Default Export)
// ============================================================================

export default PDFReportTemplate
