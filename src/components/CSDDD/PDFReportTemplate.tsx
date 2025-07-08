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
  actualScore,
  criticalViolationCount,
  completedAt
}) => {
  const styles = {
    // 컨테이너 스타일
    container: {
      width: '794px',
      backgroundColor: '#ffffff',
      color: '#2d3748',
      fontFamily: '"Malgun Gothic", "맑은고딕", "Noto Sans KR", sans-serif',
      fontSize: '13px',
      lineHeight: '1.4',
      opacity: isVisible ? 1 : 0,
      position: isVisible ? ('static' as const) : ('absolute' as const),
      top: isVisible ? 'auto' : '-9999px',
      left: isVisible ? 'auto' : '-9999px',
      zIndex: isVisible ? 'auto' : '-1',
      pointerEvents: isVisible ? ('auto' as const) : ('none' as const),
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    },

    // 페이지 컨테이너 스타일 (A4 기준)
    pageContainer: {
      width: '794px',
      minHeight: '1123px',
      maxHeight: '1123px',
      padding: '30px',
      pageBreakAfter: 'always' as const,
      pageBreakInside: 'avoid' as const,
      boxSizing: 'border-box' as const,
      overflow: 'hidden' as const
    },

    // 마지막 페이지 컨테이너 스타일
    lastPageContainer: {
      width: '794px',
      minHeight: '1123px',
      maxHeight: '1123px',
      padding: '30px',
      pageBreakAfter: 'avoid' as const,
      pageBreakInside: 'avoid' as const,
      boxSizing: 'border-box' as const,
      overflow: 'hidden' as const
    },

    // 헤더 스타일
    header: {
      marginBottom: '30px',
      textAlign: 'center' as const,
      paddingBottom: '15px',
      borderBottom: '3px solid #2d3748',
      pageBreakAfter: 'avoid' as const
    },
    headerTitle: {
      marginBottom: '8px',
      fontSize: '22px',
      fontWeight: 'bold',
      color: '#2d3748',
      letterSpacing: '-0.5px'
    },
    headerSubtitle: {
      marginBottom: '12px',
      fontSize: '13px',
      color: '#718096',
      fontWeight: 'normal'
    },
    headerDate: {
      fontSize: '11px',
      color: '#a0aec0',
      marginTop: '6px'
    },

    // 섹션 스타일
    section: {
      marginBottom: '20px',
      pageBreakInside: 'avoid' as const
    },
    sectionTitle: {
      fontSize: '15px',
      fontWeight: 'bold',
      color: '#2d3748',
      marginBottom: '12px',
      paddingBottom: '5px',
      borderBottom: '2px solid #e2e8f0',
      pageBreakAfter: 'avoid' as const
    },
    sectionContent: {
      padding: '12px',
      backgroundColor: '#f7fafc',
      border: '1px solid #e2e8f0',
      pageBreakInside: 'auto' as const
    },

    // 테이블 스타일
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginBottom: '10px',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      pageBreakInside: 'auto' as const
    },
    tableHeader: {
      backgroundColor: '#edf2f7',
      borderBottom: '2px solid #cbd5e0',
      pageBreakAfter: 'avoid' as const
    },
    tableHeaderCell: {
      padding: '6px 8px',
      textAlign: 'center' as const,
      verticalAlign: 'middle' as const,
      fontWeight: 'bold',
      fontSize: '11px',
      color: '#2d3748',
      border: '1px solid #e2e8f0',
      whiteSpace: 'nowrap' as const,
      height: '40px',
      display: 'table-cell' as const
    },
    tableCell: {
      padding: '6px 8px',
      border: '1px solid #e2e8f0',
      fontSize: '10px',
      color: '#4a5568',
      textAlign: 'center' as const,
      verticalAlign: 'top' as const,
      lineHeight: '1.2',
      wordBreak: 'break-word' as const,
      minHeight: '35px',
      maxHeight: '50px',
      overflow: 'hidden' as const
    },
    // 기본 정보 테이블 셀
    basicInfoCell: {
      padding: '8px 10px',
      border: '1px solid #e2e8f0',
      fontSize: '11px',
      color: '#4a5568',
      textAlign: 'center' as const,
      verticalAlign: 'middle' as const,
      lineHeight: '1.3',
      height: '35px'
    },
    basicInfoLabelCell: {
      padding: '8px 10px',
      border: '1px solid #e2e8f0',
      fontSize: '11px',
      color: '#4a5568',
      textAlign: 'center' as const,
      verticalAlign: 'middle' as const,
      fontWeight: 'bold',
      backgroundColor: '#f7fafc',
      lineHeight: '1.3',
      height: '35px'
    },
    tableRow: {
      borderBottom: '1px solid #e2e8f0',
      pageBreakInside: 'avoid' as const,
      height: '35px'
    },
    tableBody: {
      pageBreakInside: 'auto' as const
    },

    // 그리드 스타일
    grid4: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: '12px',
      marginBottom: '12px'
    },

    // 정보 박스 스타일
    infoBox: {
      padding: '10px',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      textAlign: 'center' as const,
      minHeight: '60px'
    },
    infoValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#2d3748',
      marginBottom: '4px'
    },
    infoLabel: {
      fontSize: '11px',
      color: '#718096',
      fontWeight: 'normal'
    },

    // 등급 스타일
    gradeBox: {
      padding: '12px',
      backgroundColor: '#ffffff',
      border: '2px solid #2d3748',
      textAlign: 'center' as const,
      minHeight: '60px'
    },
    gradeValue: {
      fontSize: '26px',
      fontWeight: 'bold',
      color: '#2d3748',
      marginBottom: '4px'
    },
    gradeLabel: {
      fontSize: '11px',
      color: '#718096',
      fontWeight: 'normal'
    },

    // 카테고리 컨테이너 스타일
    categoryContainer: {
      marginBottom: '15px',
      pageBreakAfter: 'avoid' as const
    },

    // 카테고리 제목 스타일
    categoryTitle: {
      fontSize: '13px',
      fontWeight: 'bold',
      color: '#2d3748',
      marginBottom: '8px',
      paddingBottom: '3px',
      borderBottom: '1px solid #e2e8f0',
      pageBreakAfter: 'avoid' as const
    },

    // 경고 박스 스타일
    warningBox: {
      padding: '12px',
      backgroundColor: '#fffbf0',
      border: '1px solid #f6e05e',
      borderLeft: '4px solid #f6e05e',
      marginBottom: '12px',
      pageBreakInside: 'avoid' as const
    },
    warningTitle: {
      fontSize: '13px',
      fontWeight: 'bold',
      color: '#2d3748',
      marginBottom: '6px'
    },
    warningContent: {
      fontSize: '11px',
      color: '#4a5568',
      lineHeight: '1.3'
    },

    // 푸터 스타일
    footer: {
      marginTop: '20px',
      paddingTop: '12px',
      borderTop: '1px solid #e2e8f0',
      textAlign: 'center' as const,
      fontSize: '9px',
      color: '#a0aec0',
      pageBreakInside: 'avoid' as const
    },

    // 페이지 분할 유틸리티
    pageBreak: {
      pageBreakBefore: 'always' as const,
      height: '0px',
      margin: '0px'
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

  /**
   * 테이블 행을 페이지별로 분할 - 더 보수적인 분할
   */
  const chunkTableRows = (rows: any[], maxRowsPerPage: number) => {
    const chunks = []
    for (let i = 0; i < rows.length; i += maxRowsPerPage) {
      chunks.push(rows.slice(i, i + maxRowsPerPage))
    }
    return chunks
  }

  /**
   * 중대위반 항목을 페이지별로 분할
   */
  const chunkCriticalViolations = (
    violations: CriticalViolation[],
    maxRowsPerPage: number
  ) => {
    const chunks = []
    for (let i = 0; i < violations.length; i += maxRowsPerPage) {
      chunks.push(violations.slice(i, i + maxRowsPerPage))
    }
    return chunks
  }

  // ========================================================================
  // 렌더링 (Rendering)
  // ========================================================================

  const violationsByCategory = groupViolationsByCategory()
  const hasViolations = Object.keys(violationsByCategory).length > 0

  // 중대위반 테이블을 여러 페이지로 분할 (페이지당 최대 8개 행)
  const criticalViolationChunks = chunkCriticalViolations(criticalViolations, 8)

  return (
    <div style={styles.container}>
      {/* 첫 번째 페이지 - 기본 정보 및 종합 평가 */}
      <div style={styles.pageContainer}>
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

        {/* 중대위반 개요 (첫 페이지) */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>3. 중대 위반 개요</h2>
          {criticalViolations.length > 0 ? (
            <div style={styles.warningBox}>
              <div style={styles.warningTitle}>
                중대 위반 항목이 {criticalViolations.length}건 발견되었습니다.
              </div>
              <div style={styles.warningContent}>
                다음 항목들은 등급에 직접적인 영향을 미치는 중대 위반사항입니다. 상세
                내용은 다음 페이지에서 확인하실 수 있습니다.
              </div>
            </div>
          ) : (
            <div style={styles.warningBox}>
              <div style={styles.warningTitle}>중대 위반 항목이 없습니다.</div>
              <div style={styles.warningContent}>
                본 평가에서 중대 위반 항목은 발견되지 않았습니다.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 중대위반 상세 정보 페이지들 */}
      {criticalViolations.length > 0 && (
        <>
          {criticalViolationChunks.map((chunk, chunkIndex) => (
            <div key={`critical-${chunkIndex}`} style={styles.pageContainer}>
              {chunkIndex === 0 && (
                <div style={styles.section}>
                  <h2 style={styles.sectionTitle}>3. 중대 위반 상세 정보</h2>
                </div>
              )}

              <div style={styles.sectionContent}>
                <table style={styles.table}>
                  <thead style={styles.tableHeader}>
                    <tr>
                      <th style={{...styles.tableHeaderCell, width: '12%'}}>항목번호</th>
                      <th style={{...styles.tableHeaderCell, width: '43%'}}>질문내용</th>
                      <th style={{...styles.tableHeaderCell, width: '15%'}}>위반등급</th>
                      <th style={{...styles.tableHeaderCell, width: '30%'}}>위반사유</th>
                    </tr>
                  </thead>
                  <tbody style={styles.tableBody}>
                    {chunk.map((cv, index) => (
                      <tr key={cv.question.id} style={styles.tableRow}>
                        <td style={styles.tableCell}>{cv.question.id}</td>
                        <td style={{...styles.tableCell, textAlign: 'left'}}>
                          {cv.question.text}
                        </td>
                        <td style={styles.tableCell}>{cv.violation.grade}등급</td>
                        <td style={{...styles.tableCell, textAlign: 'left'}}>
                          {cv.violation.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}

      {/* 위반 항목 상세 정보 페이지들 */}
      {hasViolations && (
        <>
          {Object.entries(violationsByCategory).map(
            ([categoryId, violations], categoryIndex) => {
              const chunks = chunkTableRows(violations, 10) // 페이지당 최대 10개 행으로 조정

              return chunks.map((chunk, chunkIndex) => (
                <div
                  key={`${categoryId}-${chunkIndex}`}
                  style={
                    categoryIndex === Object.keys(violationsByCategory).length - 1 &&
                    chunkIndex === chunks.length - 1
                      ? styles.lastPageContainer
                      : styles.pageContainer
                  }>
                  {chunkIndex === 0 && (
                    <>
                      {categoryIndex === 0 && (
                        <div style={styles.section}>
                          <h2 style={styles.sectionTitle}>4. 위반 항목 상세 정보</h2>
                        </div>
                      )}
                      <div style={styles.categoryContainer}>
                        <h3 style={styles.categoryTitle}>
                          {getCategoryName(categoryId)} ({violations.length}건)
                        </h3>
                      </div>
                    </>
                  )}

                  <div style={styles.sectionContent}>
                    <table style={styles.table}>
                      <thead style={styles.tableHeader}>
                        <tr>
                          <th style={{...styles.tableHeaderCell, width: '10%'}}>
                            항목번호
                          </th>
                          <th style={{...styles.tableHeaderCell, width: '33%'}}>
                            질문내용
                          </th>
                          <th style={{...styles.tableHeaderCell, width: '28%'}}>
                            벌칙정보
                          </th>
                          <th style={{...styles.tableHeaderCell, width: '29%'}}>
                            법적근거
                          </th>
                        </tr>
                      </thead>
                      <tbody style={styles.tableBody}>
                        {chunk.map((violation, index) => (
                          <tr key={index} style={styles.tableRow}>
                            <td style={styles.tableCell}>{violation.questionId}</td>
                            <td style={{...styles.tableCell, textAlign: 'left'}}>
                              {violation.questionText}
                            </td>
                            <td style={{...styles.tableCell, textAlign: 'left'}}>
                              {violation.penaltyInfo}
                            </td>
                            <td style={{...styles.tableCell, textAlign: 'left'}}>
                              {violation.legalBasis}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 마지막 페이지에 푸터 추가 */}
                  {categoryIndex === Object.keys(violationsByCategory).length - 1 &&
                    chunkIndex === chunks.length - 1 && (
                      <div style={styles.footer}>
                        <p>
                          본 보고서는 CSDDD 자가진단 시스템에 의해 자동 생성되었습니다.
                        </p>
                        <p>문의사항은 담당부서로 연락하시기 바랍니다.</p>
                      </div>
                    )}
                </div>
              ))
            }
          )}
        </>
      )}

      {/* 위반 항목이 없는 경우 푸터 */}
      {!hasViolations && (
        <div style={styles.pageContainer}>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>3. 위반 항목</h2>
            <div style={styles.sectionContent}>
              <p
                style={{
                  textAlign: 'center',
                  padding: '20px',
                  fontSize: '14px',
                  color: '#718096'
                }}>
                위반 항목이 없습니다.
              </p>
            </div>
          </div>

          <div style={styles.footer}>
            <p>본 보고서는 CSDDD 자가진단 시스템에 의해 자동 생성되었습니다.</p>
            <p>문의사항은 담당부서로 연락하시기 바랍니다.</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// 기본 내보내기 (Default Export)
// ============================================================================

export default PDFReportTemplate
