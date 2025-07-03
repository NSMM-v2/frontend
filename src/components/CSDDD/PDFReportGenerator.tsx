'use client'
import type {SelfAssessmentResponse} from '@/types/csdddType'
import {questions as questionMeta} from '@/app/(dashboard)/CSDDD/self-assessment/selfAssessmentForm'
/**
 * CSDDD PDF 보고서 생성 컴포넌트 - 한글 지원 PDF 생성
 *
 * html2canvas와 jsPDF를 조합하여 한글이 완벽히 지원되는 PDF 보고서를 생성
 * HTML 템플릿을 이미지로 변환한 후 PDF에 삽입하는 방식으로 한글 깨짐 문제 해결
 *
 * 주요 기능:
 * - 한글 완벽 지원 (브라우저 폰트 사용)
 * - 토스 스타일 PDF 버튼
 * - 고화질 PDF 생성
 * - A4 용지 비율 최적화
 * - 로딩 상태 표시
 * - OKLCH 색상 호환성 문제 해결
 *
 * 사용된 기술:
 * - html2canvas (HTML → Canvas 변환)
 * - jsPDF (PDF 생성)
 * - React 18 컴포넌트
 * - TypeScript 타입 안전성
 *
 * @author ESG Project Team
 * @version 2.1
 */

// ============================================================================
// 외부 라이브러리 임포트 (External Library Imports)
// ============================================================================

import React, {useState, useRef} from 'react' // React 라이브러리
import jsPDF from 'jspdf' // PDF 생성 라이브러리
import html2canvas from 'html2canvas' // HTML을 Canvas로 변환하는 라이브러리
import {Button} from '@/components/ui/button' // 토스 스타일 버튼 컴포넌트

// ============================================================================
// 내부 컴포넌트 임포트 (Internal Component Imports)
// ============================================================================

import PDFReportTemplate from './PDFReportTemplate' // PDF 보고서 HTML 템플릿

// ============================================================================
// 아이콘 라이브러리 임포트 (Icon Library Imports)
// ============================================================================

import {
  Download, // 다운로드 아이콘 - PDF 다운로드 버튼
  Loader2 // 로딩 스피너 아이콘 - 생성 중 표시
} from 'lucide-react'

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
  answers: Record<string, string> // 사용자 응답 데이터
  questions: Question[] // 전체 질문 목록
  categories: string[] // 카테고리 목록
  finalGrade: string // 최종 등급
  gradeInfo: GradeInfo // 등급 정보
  baseScore: number // 기본 점수
  criticalViolations: CriticalViolation[] // 중대위반 목록
  className?: string // 추가 CSS 클래스
  children?: React.ReactNode // 커스텀 버튼 콘텐츠
}

// ============================================================================
// PDF 보고서 생성 컴포넌트 (PDF Report Generator Component)
// ============================================================================

/**
 * CSDDD PDF 보고서 생성 컴포넌트
 *
 * html2canvas로 HTML 템플릿을 이미지 변환 후 jsPDF로 PDF 생성
 * 한글 폰트가 완벽히 지원되는 고품질 PDF 보고서 생성
 * OKLCH 색상 호환성 문제 해결을 위해 템플릿과 버튼을 분리
 */
/**
 * PDF 보고서 생성 및 다운로드 함수
 *
 * html2canvas로 HTML 템플릿을 고화질 이미지로 변환 후
 * jsPDF를 사용해 A4 용지에 맞춰 PDF 생성
 * OKLCH 색상 문제 해결을 위해 Button 컴포넌트는 캡처에서 제외
 */
export async function generatePDFReport(props: PDFReportGeneratorProps): Promise<void> {
  // 임시 DOM 생성
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.top = '-9999px'
  container.style.left = '0'
  container.style.zIndex = '-1'
  container.style.opacity = '1'
  container.style.visibility = 'visible'
  container.style.pointerEvents = 'none'
  document.body.appendChild(container)

  // React 18의 createRoot 사용 (SSR 환경에서는 동작하지 않음)
  // @ts-ignore
  const ReactDOM = await import('react-dom/client')
  const root = ReactDOM.createRoot(container)
  await new Promise<void>(resolve => {
    root.render(
      React.createElement(PDFReportTemplate, {
        ...props,
        isVisible: true
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

/**
 * SelfAssessmentResponse를 PDFReportGeneratorProps 형태로 변환
 */
export function transformToPDFProps(result: SelfAssessmentResponse) {
  const answers: Record<string, string> = {}
  result.answers?.forEach(ans => {
    answers[ans.questionId] = ans.answer ? 'yes' : 'no'
  })

  const categories = result.categoryAnalysis?.map(c => c.category) || []

  const gradeMap: Record<string, GradeInfo> = {
    A: {color: 'bg-green-500', description: '매우 우수', action: '유지 및 관리'},
    B: {color: 'bg-blue-500', description: '양호', action: '부분 개선 권장'},
    C: {color: 'bg-orange-500', description: '보통', action: '개선 필요'},
    D: {color: 'bg-red-500', description: '위험 수준', action: '즉각 조치 필요'}
  }

  const gradeInfo = gradeMap[result.finalGrade ?? 'D']

  // 수정된 코드
  const criticalViolations =
    result.answers
      ?.filter(ans => ans.hasCriticalViolation)
      .map(ans => {
        const q = questionMeta.find(q => q.id === ans.questionId)
        return {
          question: {
            id: ans.questionId,
            category: ans.category,
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
          }
        }
      }) ?? []

  return {
    answers,
    questions: questionMeta as Question[], // 타입 캐스팅 추가
    categories,
    finalGrade: result.finalGrade ?? 'D',
    gradeInfo,
    baseScore: result.actualScore,
    criticalViolations
  }
}
