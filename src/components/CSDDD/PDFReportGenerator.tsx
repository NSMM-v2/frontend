'use client'
import type {SelfAssessmentResponse} from '@/types/csdddType'
import {questions as questionMeta} from '@/app/(dashboard)/CSDDD/self-assessment/selfAssessmentForm'
import {getViolationMeta} from '@/services/csdddService'

// ============================================================================
// 외부 라이브러리 임포트 (External Library Imports)
// ============================================================================

import React from 'react' // React 라이브러리
import jsPDF from 'jspdf' // PDF 생성 라이브러리
import html2canvas from 'html2canvas' // HTML을 Canvas로 변환하는 라이브러리

// ============================================================================
// 내부 컴포넌트 임포트 (Internal Component Imports)
// ============================================================================

import PDFReportTemplate from './PDFReportTemplate' // PDF 보고서 HTML 템플릿

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
    grade: 'D' | 'C' | 'B'
    reason: string
  }
}

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
 * 중대위반 정보 인터페이스
 */
interface CriticalViolation {
  question: Question // 위반 질문
  violation: {
    grade: 'D' | 'C' | 'B'
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
 * PDF 보고서 생성기 Props 인터페이스
 */
export interface PDFReportGeneratorProps {
  answers: Answer[] // Record<string, string> → Answer[]로 변경
  questions: Question[]
  categories: string[]
  finalGrade: string
  gradeInfo: GradeInfo
  baseScore: number
  criticalViolations: CriticalViolation[]
  companyName: string
  noAnswerCount: number
  score: number
  actualScore: number
  totalPossibleScore: number
  criticalViolationCount: number // 추가 필요
  completedAt?: string // 추가 필요
  className?: string
  children?: React.ReactNode
}

// ============================================================================
// PDF 보고서 생성 컴포넌트 (PDF Report Generator Component)
// ============================================================================

export async function generatePDFReport(props: PDFReportGeneratorProps): Promise<void> {
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.top = '-9999px'
  container.style.left = '0'
  container.style.zIndex = '-1'
  container.style.opacity = '1'
  container.style.visibility = 'visible'
  container.style.pointerEvents = 'none'
  document.body.appendChild(container)

  const ReactDOM = await import('react-dom/client')
  const root = ReactDOM.createRoot(container)
  await new Promise<void>(resolve => {
    root.render(
      React.createElement(PDFReportTemplate, {
        ...props,
        isVisible: true,
        companyName: props.companyName,
        noAnswerCount: props.noAnswerCount,
        score: props.score,
        actualScore: props.actualScore,
        totalPossibleScore: props.totalPossibleScore
      })
    )
    resolve()
  })

  // 렌더링 대기
  await new Promise(res => setTimeout(res, 500))

  try {
    const templateElement = container

    if (
      !templateElement ||
      templateElement.offsetWidth === 0 ||
      templateElement.offsetHeight === 0
    ) {
      throw new Error('템플릿이 제대로 렌더링되지 않았습니다')
    }

    // html2canvas 캡처
    const canvas = await html2canvas(templateElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: templateElement.scrollWidth || 794,
      height: templateElement.scrollHeight || 1123,
      scrollX: 0,
      scrollY: 0,
      logging: false,
      foreignObjectRendering: false,
      removeContainer: true,
      onclone: clonedDoc => {
        const clonedElement = clonedDoc.body.querySelector('div')
        if (clonedElement) {
          clonedElement.style.fontFamily =
            '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'
          const allElements = clonedDoc.querySelectorAll('*')
          allElements.forEach(element => {
            const computedStyle = window.getComputedStyle(element as Element)
            if (computedStyle.backgroundColor?.includes('oklch')) {
              ;(element as HTMLElement).style.backgroundColor = '#ffffff'
            }
            if (computedStyle.color?.includes('oklch')) {
              ;(element as HTMLElement).style.color = '#000000'
            }
            if (computedStyle.borderColor?.includes('oklch')) {
              ;(element as HTMLElement).style.borderColor = '#e5e7eb'
            }
          })
        }
      }
    })

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas 크기가 0입니다')
    }
    const imgData = canvas.toDataURL('image/png', 1.0)
    if (!imgData || imgData === 'data:,') {
      throw new Error('이미지 데이터 생성에 실패했습니다')
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pdfWidth
    const imgHeight = (canvas.height * pdfWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST')
    heightLeft -= pdfHeight
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST')
      heightLeft -= pdfHeight
    }
    const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '_')
    const fileName = `CSDDD_자가진단보고서_${currentDate}.pdf`
    pdf.save(fileName)
  } catch (error) {
    let errorMessage = 'PDF 생성 중 오류가 발생했습니다.'
    if (error instanceof Error) {
      if (error.message.includes('oklch') || error.message.includes('color')) {
        errorMessage =
          'CSS 색상 호환성 오류가 발생했습니다. 브라우저를 새로고침하고 다시 시도해주세요.'
      } else if (error.message.includes('html2canvas')) {
        errorMessage =
          'HTML을 이미지로 변환하는 중 오류가 발생했습니다. 브라우저를 새로고침하고 다시 시도해주세요.'
      } else if (error.message.includes('Canvas')) {
        errorMessage =
          '이미지 생성 중 오류가 발생했습니다. 화면 해상도를 확인하고 다시 시도해주세요.'
      } else if (error.message.includes('jsPDF')) {
        errorMessage =
          'PDF 문서 생성 중 오류가 발생했습니다. 브라우저 권한을 확인해주세요.'
      } else {
        errorMessage = `오류 상세: ${error.message}`
      }
    }
    alert(errorMessage)
  } finally {
    // React 18 unmount
    if (root) {
      root.unmount()
    }
    document.body.removeChild(container)
  }
}

// ============================================================================
// 내보내기 (Export)
// ============================================================================

// criticalGrade 값이 'D' | 'C' | 'B' 중 하나인지 확인하는 타입 가드
const isValidCriticalGrade = (grade: string | undefined): grade is 'D' | 'C' | 'B' => {
  return grade === 'D' || grade === 'C' || grade === 'B'
}

export async function transformToPDFProps(result: SelfAssessmentResponse) {
  const answersArray = await Promise.all(
    result.answers?.map(async ans => {
      const meta = await getViolationMeta(ans.questionId)
      return {
        questionId: ans.questionId,
        answer: ans.answer,
        hasCriticalViolation: ans.hasCriticalViolation,
        penaltyInfo: meta.penaltyInfo ?? '',
        legalBasis: meta.legalBasis ?? '',
        categoryName: meta.category ?? '',
        questionText: questionMeta.find(q => q.id === ans.questionId)?.text ?? ''
      }
    }) ?? []
  )

  const categories = result.categoryAnalysis?.map(c => c.category) || []

  const gradeMap: Record<string, GradeInfo> = {
    A: {color: 'bg-green-500', description: '매우 우수', action: '유지 및 관리'},
    B: {color: 'bg-blue-500', description: '양호', action: '부분 개선 권장'},
    C: {color: 'bg-orange-500', description: '보통', action: '개선 필요'},
    D: {color: 'bg-red-500', description: '위험 수준', action: '즉각 조치 필요'}
  }

  const gradeInfo = gradeMap[result.finalGrade ?? 'D']

  const criticalViolations = await Promise.all(
    result.answers
      ?.filter(ans => ans.hasCriticalViolation)
      .map(async ans => {
        const q = questionMeta.find(q => q.id === ans.questionId)
        const meta = await getViolationMeta(ans.questionId)
        return {
          question: {
            id: ans.questionId,
            category: meta.category ?? '',
            text: q?.text ?? '',
            weight: ans.weight,
            criticalViolation: q?.criticalViolation
              ? {
                  grade: isValidCriticalGrade(q.criticalViolation.grade)
                    ? q.criticalViolation.grade
                    : 'D',
                  reason: q.criticalViolation.reason
                }
              : undefined
          },
          violation: {
            grade: isValidCriticalGrade(ans.criticalGrade) ? ans.criticalGrade : 'D',
            reason: '중대 위반 사항'
          },
          penaltyInfo: meta.penaltyInfo ?? '',
          legalBasis: meta.legalBasis ?? ''
        }
      }) ?? []
  )

  return {
    answers: answersArray,
    questions: questionMeta as Question[],
    categories,
    finalGrade: result.finalGrade ?? 'D',
    gradeInfo,
    baseScore: result.actualScore,
    criticalViolations,
    companyName: result.companyName,
    noAnswerCount: result.noAnswerCount ?? 0,
    score: result.score ?? 0,
    actualScore: result.actualScore ?? 0,
    totalPossibleScore: result.totalPossibleScore ?? 132.5,
    criticalViolationCount: criticalViolations.length,
    completedAt: result.completedAt
  }
}
