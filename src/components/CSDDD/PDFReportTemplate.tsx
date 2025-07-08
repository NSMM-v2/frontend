// PDFReportTemplate.tsx 수정 버전
'use client'

import React from 'react'

// 기존 인터페이스들은 그대로 유지...
interface Answer {
  questionId: string
  answer: boolean
  hasCriticalViolation?: boolean
  penaltyInfo?: string
  legalBasis?: string
  categoryName?: string
  questionText?: string
}

interface Question {
  id: string
  category: string
  text: string
  weight: number
  criticalViolation?: {
    grade: 'D' | 'C' | 'B'
    reason: string
  }
}

interface CriticalViolation {
  question: Question
  violation: {
    grade: 'D' | 'C' | 'B'
    reason: string
  }
  penaltyInfo?: string
  legalBasis?: string
}

interface PDFReportTemplateProps {
  answers: Answer[]
  questions: Question[]
  categories: string[]
  finalGrade: string
  baseScore: number
  criticalViolations: CriticalViolation[]
  companyName: string
  isVisible?: boolean
  noAnswerCount: number
  score: number
  actualScore: number
  totalPossibleScore: number
  criticalViolationCount: number
  completedAt?: string
}

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
      padding: '15px 8px', // 패딩 증가
      textAlign: 'center' as const,
      fontWeight: 'bold',
      fontSize: '12px',
      color: '#2d3748',
      border: '1px solid #e2e8f0',
      whiteSpace: 'nowrap' as const,
      // 단순한 방식으로 세로정렬
      lineHeight: '1.2',
      backgroundColor: '#edf2f7',
      borderBottom: '2px solid #cbd5e0'
    },

    // 수정된 테이블 셀 스타일 - 세로 정렬 강화
    tableCell: {
      padding: '12px 8px',
      border: '1px solid #e2e8f0',
      fontSize: '11px',
      color: '#4a5568',
      textAlign: 'center' as const,
      lineHeight: '1.4',
      wordBreak: 'break-word' as const,
      // 고정 높이 제거하고 최소 높이만 설정
      minHeight: '45px',
      // 단순한 세로정렬
      verticalAlign: 'middle' as const
    },

    // 왼쪽 정렬 셀 (질문 내용용)
    tableCellLeft: {
      padding: '12px 8px',
      border: '1px solid #e2e8f0',
      fontSize: '11px',
      color: '#4a5568',
      textAlign: 'left' as const,
      lineHeight: '1.4',
      wordBreak: 'break-word' as const,
      minHeight: '45px',
      verticalAlign: 'middle' as const
    },

    // 기본 정보 테이블 셀 - 세로 정렬 강화
    basicInfoCell: {
      padding: '15px 12px', // 패딩 증가
      border: '1px solid #e2e8f0',
      fontSize: '12px',
      color: '#4a5568',
      textAlign: 'center' as const,
      lineHeight: '1.3',
      minHeight: '50px',
      verticalAlign: 'middle' as const
    },

    basicInfoLabelCell: {
      padding: '15px 12px', // 패딩 증가
      border: '1px solid #e2e8f0',
      fontSize: '12px',
      color: '#4a5568',
      textAlign: 'center' as const,
      fontWeight: 'bold',
      backgroundColor: '#f7fafc',
      lineHeight: '1.3',
      minHeight: '50px',
      verticalAlign: 'middle' as const
    },

    // 테이블 행 수정
    tableRow: {
      borderBottom: '1px solid #e2e8f0',
      pageBreakInside: 'avoid' as const,
      // 고정 높이 제거
      minHeight: '45px'
    },
    tableBody: {
      pageBreakInside: 'auto' as const
    },

    grid4: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: '12px',
      marginBottom: '12px'
    },

    infoBox: {
      padding: '10px',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      textAlign: 'center' as const,
      minHeight: '60px',
      // 세로 정렬 추가
      display: 'flex' as const,
      flexDirection: 'column' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const
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

    gradeBox: {
      padding: '12px',
      backgroundColor: '#ffffff',
      border: '2px solid #2d3748',
      textAlign: 'center' as const,
      minHeight: '60px',
      // 세로 정렬 추가
      display: 'flex' as const,
      flexDirection: 'column' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const
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

    categoryContainer: {
      marginBottom: '15px',
      pageBreakAfter: 'avoid' as const
    },

    categoryTitle: {
      fontSize: '13px',
      fontWeight: 'bold',
      color: '#2d3748',
      marginBottom: '8px',
      paddingBottom: '3px',
      borderBottom: '1px solid #e2e8f0',
      pageBreakAfter: 'avoid' as const
    },

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

    footer: {
      marginTop: '20px',
      paddingTop: '12px',
      borderTop: '1px solid #e2e8f0',
      textAlign: 'center' as const,
      fontSize: '9px',
      color: '#a0aec0',
      pageBreakInside: 'avoid' as const
    },

    pageBreak: {
      pageBreakBefore: 'always' as const,
      height: '0px',
      margin: '0px'
    }
  }

  // 유틸리티 함수들은 그대로 유지...
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

  const chunkTableRows = (rows: any[], maxRowsPerPage: number) => {
    const chunks = []
    for (let i = 0; i < rows.length; i += maxRowsPerPage) {
      chunks.push(rows.slice(i, i + maxRowsPerPage))
    }
    return chunks
  }

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

  const violationsByCategory = groupViolationsByCategory()
  const hasViolations = Object.keys(violationsByCategory).length > 0
  const criticalViolationChunks = chunkCriticalViolations(criticalViolations, 8)

  return (
    <div style={styles.container}>
      {/* 첫 번째 페이지 */}
      <div style={styles.pageContainer}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>공급망 실사 자가진단 보고서</h1>
          <p style={styles.headerSubtitle}>
            Supply Chain Due Diligence Self-Assessment Report
          </p>
          <p style={styles.headerDate}>발행일: {getCurrentDate()}</p>
        </div>

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
                        <td style={styles.tableCellLeft}>{cv.question.text}</td>
                        <td style={styles.tableCell}>{cv.violation.grade}등급</td>
                        <td style={styles.tableCellLeft}>{cv.violation.reason}</td>
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
              const chunks = chunkTableRows(violations, 10)

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
                            <td style={styles.tableCellLeft}>{violation.questionText}</td>
                            <td style={styles.tableCellLeft}>{violation.penaltyInfo}</td>
                            <td style={styles.tableCellLeft}>{violation.legalBasis}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

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

export default PDFReportTemplate
