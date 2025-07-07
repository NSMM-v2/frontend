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
      padding: '40px',
      backgroundColor: '#ffffff',
      color: '#2d3748',
      fontFamily: '"Malgun Gothic", "맑은고딕", "Noto Sans KR", sans-serif',
      fontSize: '13px',
      lineHeight: '1.6',
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
      marginBottom: '50px',
      textAlign: 'center' as const,
      paddingBottom: '30px',
      borderBottom: '3px solid #2d3748'
    },
    headerTitle: {
      marginBottom: '15px',
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#2d3748',
      letterSpacing: '-0.5px'
    },
    headerSubtitle: {
      marginBottom: '20px',
      fontSize: '16px',
      color: '#718096',
      fontWeight: 'normal'
    },
    headerDate: {
      fontSize: '13px',
      color: '#a0aec0',
      marginTop: '10px'
    },

    // 섹션 스타일
    section: {
      marginBottom: '35px',
      pageBreakInside: 'avoid' as const
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#2d3748',
      marginBottom: '20px',
      paddingBottom: '8px',
      borderBottom: '2px solid #e2e8f0'
    },
    sectionContent: {
      padding: '20px',
      backgroundColor: '#f7fafc',
      border: '1px solid #e2e8f0'
    },

    // 테이블 스타일
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginBottom: '20px',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      pageBreakInside: 'auto' as const,
      pageBreakBefore: 'auto' as const,
      pageBreakAfter: 'auto' as const
    },
    tableHeader: {
      backgroundColor: '#edf2f7',
      borderBottom: '2px solid #cbd5e0'
    },
    tableHeaderCell: {
      padding: '12px 15px',
      textAlign: 'center' as const, // 가로 중앙정렬
      verticalAlign: 'middle' as const, // 세로 중앙정렬
      fontWeight: 'bold',
      fontSize: '13px',
      color: '#2d3748',
      border: '1px solid #e2e8f0',
      whiteSpace: 'nowrap' as const
    },
    tableCell: {
      padding: '10px 15px',
      border: '1px solid #e2e8f0',
      fontSize: '12px',
      color: '#4a5568',
      textAlign: 'center' as const, // 가로 중앙정렬
      verticalAlign: 'middle' as const // 세로 중앙정렬
    },
    // 기본 정보 테이블 셀 (왼쪽 정렬)
    basicInfoCell: {
      padding: '10px 15px',
      border: '1px solid #e2e8f0',
      fontSize: '12px',
      color: '#4a5568',
      textAlign: 'center' as const, // 가로 중앙정렬
      verticalAlign: 'middle' as const, // 세로 중앙정렬
      lineHeight: 'normal',
      height: '48px'
    },
    basicInfoLabelCell: {
      padding: '10px 15px',
      border: '1px solid #e2e8f0',
      fontSize: '12px',
      color: '#4a5568',
      textAlign: 'center' as const, // 가로 중앙정렬
      verticalAlign: 'middle' as const, // 세로 중앙정렬
      fontWeight: 'bold',
      backgroundColor: '#f7fafc',
      lineHeight: 'normal',
      height: '48px'
    },
    tableRow: {
      borderBottom: '1px solid #e2e8f0',
      pageBreakInside: 'avoid' as const,
      pageBreakAfter: 'auto' as const
    },
    tableBody: {
      pageBreakInside: 'auto' as const
    },

    // 그리드 스타일
    grid2: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginBottom: '20px'
    },
    grid4: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: '20px',
      marginBottom: '20px'
    },

    // 정보 박스 스타일
    infoBox: {
      padding: '15px',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      textAlign: 'center' as const
    },
    infoValue: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#2d3748',
      marginBottom: '8px'
    },
    infoLabel: {
      fontSize: '14px',
      color: '#718096',
      fontWeight: 'normal'
    },

    // 등급 스타일
    gradeBox: {
      padding: '20px',
      backgroundColor: '#ffffff',
      border: '2px solid #2d3748',
      textAlign: 'center' as const
    },
    gradeValue: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#2d3748',
      marginBottom: '8px'
    },
    gradeLabel: {
      fontSize: '14px',
      color: '#718096',
      fontWeight: 'normal'
    },

    // 리스트 스타일
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    listItem: {
      padding: '10px 0',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    },
    listItemContent: {
      flex: 1,
      marginRight: '20px'
    },
    listItemTitle: {
      fontWeight: 'bold',
      color: '#2d3748',
      marginBottom: '5px'
    },
    listItemDetail: {
      fontSize: '12px',
      color: '#718096',
      lineHeight: '1.5'
    },

    // 경고 박스 스타일
    warningBox: {
      padding: '20px',
      backgroundColor: '#fffbf0',
      border: '1px solid #f6e05e',
      borderLeft: '4px solid #f6e05e',
      marginBottom: '20px'
    },
    warningTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#2d3748',
      marginBottom: '10px'
    },
    warningContent: {
      fontSize: '13px',
      color: '#4a5568',
      lineHeight: '1.6'
    },

    // 카테고리 컨테이너 스타일 (페이지 넘김 방지)
    categoryContainer: {
      marginBottom: '40px',
      pageBreakInside: 'avoid' as const,
      pageBreakAfter: 'auto' as const
    },

    // 카테고리 제목 스타일
    categoryTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#2d3748',
      marginBottom: '15px',
      paddingBottom: '5px',
      borderBottom: '1px solid #e2e8f0',
      pageBreakAfter: 'avoid' as const
    },

    // 푸터 스타일
    footer: {
      marginTop: '50px',
      paddingTop: '20px',
      borderTop: '1px solid #e2e8f0',
      textAlign: 'center' as const,
      fontSize: '11px',
      color: '#a0aec0'
    }
  }

  // ========================================================================
  // 유틸리티 함수들 (Utility Functions)
  // ========================================================================

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

  // ========================================================================
  // 렌더링 (Rendering)
  // ========================================================================

  return (
    <div style={styles.container}>
      {/* 보고서 헤더 */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>공급망 실사 자가진단 보고서</h1>
        <p style={styles.headerSubtitle}>
          Supply Chain Due Diligence Self-Assessment Report
        </p>
        <p style={styles.headerDate}>발행일: {getCurrentDate()}</p>
      </div>

      {/* 평가 기본 정보 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>1. 평가 기본 정보</h2>
        <div style={styles.sectionContent}>
          <table style={styles.table}>
            <tbody style={styles.tableBody}>
              <tr style={styles.tableRow}>
                <td style={styles.basicInfoLabelCell}>평가 대상</td>
                <td style={styles.basicInfoCell}>{companyName}</td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={styles.basicInfoLabelCell}>평가 일시</td>
                <td style={styles.basicInfoCell}>{getCurrentDate()}</td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={styles.basicInfoLabelCell}>평가 유형</td>
                <td style={styles.basicInfoCell}>CSDDD 자가진단</td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={styles.basicInfoLabelCell}>평가 기준</td>
                <td style={styles.basicInfoCell}>
                  유럽연합 기업 지속가능성 실사 지침(CSDDD)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 종합 평가 결과 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>2. 종합 평가 결과</h2>
        <div style={styles.sectionContent}>
          <div style={styles.grid4}>
            <div style={styles.gradeBox}>
              <div style={styles.gradeValue}>{finalGrade}</div>
              <div style={styles.gradeLabel}>최종 등급</div>
            </div>
            <div style={styles.infoBox}>
              <div style={styles.infoValue}>{noAnswerCount}</div>
              <div style={styles.infoLabel}>총 위반 건수</div>
            </div>
            <div style={styles.infoBox}>
              <div style={styles.infoValue}>{criticalViolationCount}</div>
              <div style={styles.infoLabel}>중대 위반 건수</div>
            </div>
            <div style={styles.infoBox}>
              <div style={styles.infoValue}>{actualScore.toFixed(1)}</div>
              <div style={styles.infoLabel}>종합 점수</div>
            </div>
          </div>
        </div>
      </div>

      {/* 위반 항목 상세 정보 */}
      {Object.keys(groupViolationsByCategory()).length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>3. 위반 항목 상세 정보</h2>
          <div style={styles.sectionContent}>
            {Object.entries(groupViolationsByCategory()).map(
              ([categoryId, violations]) => (
                <div key={categoryId} style={styles.categoryContainer}>
                  <h3 style={styles.categoryTitle}>
                    {getCategoryName(categoryId)} ({violations.length}건)
                  </h3>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={{...styles.tableHeaderCell, width: '8%'}}>항목번호</th>
                        <th style={{...styles.tableHeaderCell, width: '40%'}}>
                          질문내용
                        </th>
                        <th style={{...styles.tableHeaderCell, width: '26%'}}>
                          벌칙정보
                        </th>
                        <th style={{...styles.tableHeaderCell, width: '26%'}}>
                          법적근거
                        </th>
                      </tr>
                    </thead>
                    <tbody style={styles.tableBody}>
                      {violations.map((violation, index) => (
                        <tr key={index} style={styles.tableRow}>
                          <td style={styles.tableCell}>{violation.questionId}</td>
                          <td style={styles.tableCell}>{violation.questionText}</td>
                          <td style={styles.tableCell}>{violation.penaltyInfo}</td>
                          <td style={styles.tableCell}>{violation.legalBasis}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* 중대위반 항목 */}
      {criticalViolations.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>4. 중대 위반 항목</h2>
          <div style={styles.warningBox}>
            <div style={styles.warningTitle}>
              중대 위반 항목이 {criticalViolations.length}건 발견되었습니다.
            </div>
            <div style={styles.warningContent}>
              다음 항목들은 등급에 직접적인 영향을 미치는 중대 위반사항입니다.
            </div>
          </div>
          <div style={styles.sectionContent}>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={{...styles.tableHeaderCell, width: '8%'}}>항목번호</th>
                  <th style={{...styles.tableHeaderCell, width: '40%'}}>질문내용</th>
                  <th style={{...styles.tableHeaderCell, width: '26%'}}>위반등급</th>
                  <th style={{...styles.tableHeaderCell, width: '26%'}}>위반사유</th>
                </tr>
              </thead>
              <tbody style={styles.tableBody}>
                {criticalViolations.map((cv, index) => (
                  <tr key={cv.question.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{cv.question.id}</td>
                    <td style={styles.tableCell}>{cv.question.text}</td>
                    <td style={styles.tableCell}>{cv.violation.grade}등급</td>
                    <td style={styles.tableCell}>{cv.violation.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 보고서 푸터 */}
      <div style={styles.footer}>
        <p>본 보고서는 CSDDD 자가진단 시스템에 의해 자동 생성되었습니다.</p>
        <p>문의사항은 담당부서로 연락하시기 바랍니다.</p>
      </div>
    </div>
  )
}

// ============================================================================
// 기본 내보내기 (Default Export)
// ============================================================================

export default PDFReportTemplate
