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

'use client'

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
  calculateCategoryScore: (category: string) => number // 카테고리 점수 계산 함수
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
const PDFReportGenerator: React.FC<PDFReportGeneratorProps> = ({
  answers,
  questions,
  categories,
  finalGrade,
  gradeInfo,
  baseScore,
  criticalViolations,
  calculateCategoryScore,
  className,
  children
}) => {
  // ========================================================================
  // 상태 관리 (State Management)
  // ========================================================================

  /**
   * PDF 생성 중 로딩 상태
   */
  const [isGenerating, setIsGenerating] = useState(false)

  /**
   * PDF 템플릿 참조
   * html2canvas에서 캡처할 DOM 요소 참조 (Button 컴포넌트 제외)
   */
  const templateRef = useRef<HTMLDivElement>(null)

  /**
   * PDF 생성 중 템플릿 렌더링 상태
   * PDF 생성 시에만 템플릿을 정상적으로 렌더링하기 위한 상태
   */
  const [showForPDF, setShowForPDF] = useState(false)

  // ========================================================================
  // PDF 생성 함수 (PDF Generation Functions)
  // ========================================================================

  /**
   * PDF 보고서 생성 및 다운로드
   *
   * html2canvas로 HTML 템플릿을 고화질 이미지로 변환 후
   * jsPDF를 사용해 A4 용지에 맞춰 PDF 생성
   * OKLCH 색상 문제 해결을 위해 Button 컴포넌트는 캡처에서 제외
   */
  const generatePDF = async () => {
    console.log('PDF 생성 시작')

    if (!templateRef.current) {
      console.error('템플릿 참조가 null입니다')
      alert('PDF 템플릿을 찾을 수 없습니다. 다시 시도해주세요.')
      return
    }

    try {
      setIsGenerating(true)
      setShowForPDF(true) // PDF 생성을 위해 템플릿 렌더링
      console.log('PDF 생성 중 상태 설정 완료')

      // HTML 렌더링 대기 시간을 늘림 (DOM 업데이트 완료 보장)
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('DOM 렌더링 대기 완료')

      // 템플릿 요소 크기 확인
      const templateElement = templateRef.current
      console.log('템플릿 크기:', {
        width: templateElement.offsetWidth,
        height: templateElement.offsetHeight,
        scrollWidth: templateElement.scrollWidth,
        scrollHeight: templateElement.scrollHeight
      })

      if (templateElement.offsetWidth === 0 || templateElement.offsetHeight === 0) {
        throw new Error('템플릿이 제대로 렌더링되지 않았습니다')
      }

      // ====================================================================
      // HTML을 Canvas로 변환 (HTML to Canvas Conversion)
      // OKLCH 색상 호환성 문제 해결 설정 추가
      // ====================================================================
      console.log('html2canvas 변환 시작 (OKLCH 호환성 모드)')

      const canvas = await html2canvas(templateElement, {
        scale: 2, // 고화질을 위한 스케일 설정
        useCORS: true, // CORS 이슈 방지
        allowTaint: true, // 외부 리소스 허용
        backgroundColor: '#ffffff', // 배경색 설정
        width: templateElement.scrollWidth || 794, // 실제 콘텐츠 너비 사용
        height: templateElement.scrollHeight || 1123, // 실제 콘텐츠 높이 사용
        scrollX: 0,
        scrollY: 0,
        logging: false, // html2canvas 디버그 로그 비활성화 (OKLCH 에러 방지)
        foreignObjectRendering: false, // SVG foreignObject 렌더링 비활성화
        removeContainer: true, // 컨테이너 제거로 CSS 충돌 방지
        onclone: clonedDoc => {
          console.log('DOM 복제 완료 - OKLCH 색상 변환 시작')

          // 복제된 문서에서 OKLCH 색상을 HEX로 강제 변환
          const clonedElement = clonedDoc.body.querySelector('div')
          if (clonedElement) {
            // 폰트 강제 적용
            clonedElement.style.fontFamily =
              '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'

            // 모든 요소에서 OKLCH 색상 제거 및 대체
            const allElements = clonedDoc.querySelectorAll('*')
            allElements.forEach(element => {
              const computedStyle = window.getComputedStyle(element as Element)

              // backgroundColor가 oklch인 경우 대체
              if (computedStyle.backgroundColor?.includes('oklch')) {
                ;(element as HTMLElement).style.backgroundColor = '#ffffff'
              }

              // color가 oklch인 경우 대체
              if (computedStyle.color?.includes('oklch')) {
                ;(element as HTMLElement).style.color = '#000000'
              }

              // borderColor가 oklch인 경우 대체
              if (computedStyle.borderColor?.includes('oklch')) {
                ;(element as HTMLElement).style.borderColor = '#e5e7eb'
              }
            })
          }

          console.log('OKLCH 색상 변환 완료')
        }
      })

      console.log('Canvas 생성 완료:', {
        width: canvas.width,
        height: canvas.height
      })

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas 크기가 0입니다')
      }

      // ====================================================================
      // Canvas를 이미지로 변환 (Canvas to Image Conversion)
      // ====================================================================
      console.log('이미지 변환 시작')
      const imgData = canvas.toDataURL('image/png', 1.0) // 최고 품질로 PNG 변환

      if (!imgData || imgData === 'data:,') {
        throw new Error('이미지 데이터 생성에 실패했습니다')
      }

      console.log('이미지 데이터 생성 완료, 크기:', imgData.length)

      // ====================================================================
      // PDF 문서 생성 (PDF Document Creation)
      // ====================================================================
      console.log('PDF 문서 생성 시작')

      const pdf = new jsPDF({
        orientation: 'portrait', // 세로 방향
        unit: 'pt', // 포인트 단위
        format: 'a4' // A4 용지
      })

      // PDF 페이지 크기 계산
      const pdfWidth = pdf.internal.pageSize.getWidth() // 595pt
      const pdfHeight = pdf.internal.pageSize.getHeight() // 842pt

      console.log('PDF 페이지 크기:', {pdfWidth, pdfHeight})

      // 이미지 크기를 PDF 페이지에 맞게 조정
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * pdfWidth) / canvas.width

      console.log('이미지 크기 조정:', {imgWidth, imgHeight})

      // ====================================================================
      // 페이지 분할 처리 (Multi-page Handling)
      // ====================================================================
      let heightLeft = imgHeight
      let position = 0

      console.log('첫 번째 페이지 추가')
      // 첫 번째 페이지에 이미지 추가
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST')
      heightLeft -= pdfHeight

      // 추가 페이지가 필요한 경우 페이지 분할
      let pageCount = 1
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pageCount++
        console.log(`${pageCount}번째 페이지 추가`)
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST')
        heightLeft -= pdfHeight
      }

      // ====================================================================
      // PDF 파일 다운로드 (PDF File Download)
      // ====================================================================
      const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '_')
      const fileName = `CSDDD_자가진단보고서_${currentDate}.pdf`

      console.log('PDF 다운로드 시작:', fileName)
      pdf.save(fileName)
      console.log('PDF 다운로드 완료')
    } catch (error) {
      console.error('PDF 생성 중 상세 오류:', error)

      // 더 구체적인 에러 메시지 제공
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
      setIsGenerating(false)
      setShowForPDF(false) // PDF 생성 완료 후 템플릿 숨김
      console.log('PDF 생성 프로세스 종료')
    }
  }

  // ========================================================================
  // 렌더링 (Rendering)
  // ========================================================================

  return (
    <>
      {/* ======================================================================
          PDF 다운로드 버튼 (PDF Download Button)
          UI 버튼 영역 - html2canvas 캡처 범위에서 제외
          ====================================================================== */}
      <Button
        onClick={generatePDF}
        disabled={isGenerating}
        variant="outline"
        className={`flex gap-2 items-center transition-all duration-300 ${
          isGenerating
            ? 'opacity-70 cursor-not-allowed'
            : 'hover:bg-blue-50 hover:border-blue-300'
        } ${className || ''}`}>
        {/* 로딩 중일 때 스피너, 아닐 때 다운로드 아이콘 */}
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}

        {/* 버튼 텍스트 */}
        {children || (isGenerating ? 'PDF 생성 중...' : 'PDF 다운로드')}
      </Button>

      {/* ======================================================================
          PDF 템플릿 (html2canvas 캡처 전용) (PDF Template - For Capture Only)
          OKLCH 색상을 사용하지 않는 순수 HTML/CSS 템플릿
          ====================================================================== */}
      <div
        ref={templateRef}
        style={{
          // 항상 화면 밖에 위치하여 사용자에게 보이지 않도록 함
          // html2canvas는 정상적으로 캡처 가능
          position: 'absolute',
          top: '-9999px',
          left: '0', // html2canvas 캡처를 위해 left는 0으로 유지
          zIndex: '-1',
          opacity: showForPDF ? 1 : 0, // 캡처 시에만 불투명하게
          visibility: showForPDF ? 'visible' : 'hidden', // 가시성 제어
          pointerEvents: 'none' // 항상 상호작용 차단
        }}>
        <PDFReportTemplate
          answers={answers}
          questions={questions}
          categories={categories}
          finalGrade={finalGrade}
          gradeInfo={gradeInfo}
          baseScore={baseScore}
          criticalViolations={criticalViolations}
          calculateCategoryScore={calculateCategoryScore}
          isVisible={showForPDF} // PDF 생성 시에만 표시
        />
      </div>
    </>
  )
}

// ============================================================================
// 기본 내보내기 (Default Export)
// ============================================================================

export default PDFReportGenerator
