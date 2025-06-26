/**
 * Scope 1 배출량 관리 폼 컴포넌트
 *
 * 주요 기능:
 * - 고정연소/이동연소 배출량 데이터 관리
 * - 월별/연도별 데이터 필터링 및 조회
 * - 배출량 통계 현황 대시보드
 * - 데이터 CRUD 작업 (생성, 조회, 수정, 삭제)
 *
 * @author ESG Project Team
 * @version 1.0
 * @since 2024
 */
'use client'

// React 및 애니메이션 라이브러리 임포트
import React, {useState} from 'react'
import {motion} from 'framer-motion'

// UI 아이콘 임포트 (Lucide React)
import {
  Car, // 자동차 아이콘 (이동연소)
  Factory, // 공장 아이콘 (고정연소)
  Plus, // 플러스 아이콘 (데이터 추가)
  TrendingUp, // 상승 트렌드 아이콘 (총 배출량)
  Edit, // 편집 아이콘
  Trash2, // 삭제 아이콘
  CalendarDays, // 달력 아이콘 (날짜 선택)
  ArrowLeft, // 왼쪽 화살표 (뒤로가기)
  Home // 홈 아이콘
} from 'lucide-react'
import Link from 'next/link'

// UI 컴포넌트 임포트 (Shadcn/ui)
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {Badge} from '@/components/ui/badge'

// 커스텀 컴포넌트 임포트
import ScopeModal from '@/components/scope/ScopeModal' // Scope 데이터 입력 모달
import {MonthSelector} from '@/components/scope/MonthSelector' // 월 선택기

// 타입 정의 임포트
import type {
  StationaryCombustion, // 고정연소 배출량 타입
  MobileCombustion, // 이동연소 배출량 타입
  ScopeFormData // Scope 폼 데이터 타입
} from '@/types/scopeType'

// API 서비스 함수 임포트 - 백엔드 통신 제거
// import {
//   fetchStationaryCombustionList, // 고정연소 데이터 조회
//   fetchMobileCombustionList, // 이동연소 데이터 조회
//   deleteStationaryCombustion, // 고정연소 데이터 삭제
//   deleteMobileCombustion // 이동연소 데이터 삭제
// } from '@/services/scopeService' // Scope 관련 API 서비스 함수

// 브레드크럼 네비게이션 컴포넌트 임포트
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import {PageHeader} from '@/components/layout/PageHeader'

/**
 * Scope 1 배출량 관리 메인 컴포넌트
 *
 * 기능:
 * - 연도/월 필터링
 * - 고정연소/이동연소 배출량 데이터 조회 및 관리
 * - 배출량 통계 대시보드 제공
 * - 데이터 추가/편집/삭제 기능
 */
export default function Scope1Form() {
  // ============================================================================
  // 상태 관리 (State Management)
  // ============================================================================

  // 필터 관련 상태
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()) // 선택된 연도
  const currentMonth = new Date().getMonth() + 1 // JavaScript의 월은 0부터 시작하므로 1을 더함
  const [selectedMonth, setSelectedMonth] = useState<number | null>(currentMonth) // 선택된 월 (null이면 전체)

  // 데이터 관련 상태
  const [stationaryData, setStationaryData] = useState<StationaryCombustion[]>([]) // 고정연소 배출량 데이터
  const [mobileData, setMobileData] = useState<MobileCombustion[]>([]) // 이동연소 배출량 데이터

  // UI 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false) // 데이터 입력 모달 표시 여부
  const [searchTerm, setSearchTerm] = useState('') // 검색어 (현재 미사용)
  /**
   * 모달에서 새로운 배출량 데이터가 제출되었을 때 처리합니다.
   * 데이터 저장 후 목록을 새로고침합니다.
   *
   * @param data - 제출된 Scope 폼 데이터
   */
  const handleFormSubmit = (data: ScopeFormData) => {
    console.log('폼 데이터:', data)
    // loadData() // 데이터 새로고침
  }

  // ============================================================================
  // 데이터 필터링 (Data Filtering)
  // ============================================================================

  /**
   * 선택된 월과 검색어에 따라 고정연소 데이터를 필터링합니다.
   * - 월이 선택된 경우: 해당 월의 데이터만 표시
   * - 검색어가 있는 경우: 시설명에 검색어가 포함된 데이터만 표시
   */
  const filteredStationaryData = stationaryData
    .filter(item => (selectedMonth ? item.reportingMonth === selectedMonth : true))
    .filter(item =>
      searchTerm
        ? item.facilityName.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    )

  /**
   * 선택된 월과 검색어에 따라 이동연소 데이터를 필터링합니다.
   * - 월이 선택된 경우: 해당 월의 데이터만 표시
   * - 검색어가 있는 경우: 차량 타입에 검색어가 포함된 데이터만 표시
   */
  const filteredMobileData = mobileData
    .filter(item => (selectedMonth ? item.reportingMonth === selectedMonth : true))
    .filter(item =>
      searchTerm
        ? item.vehicleType.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    )

  // ============================================================================
  // 통계 계산 (Statistics Calculation)
  // ============================================================================

  // 고정연소 총 배출량 계산 (tCO₂eq)
  const totalStationaryEmission = filteredStationaryData.reduce(
    (sum, item) => sum + (item.totalCo2Equivalent || 0),
    0
  )

  // 이동연소 총 배출량 계산 (tCO₂eq)
  const totalMobileEmission = filteredMobileData.reduce(
    (sum, item) => sum + (item.totalCo2Equivalent || 0),
    0
  )

  // Scope 1 총 배출량 계산 (고정연소 + 이동연소)
  const totalScope1Emission = totalStationaryEmission + totalMobileEmission

  // ============================================================================
  // 컴포넌트 렌더링 (Component Rendering)
  // ============================================================================

  return (
    <div className="flex flex-col p-4 w-full">
      {/* ========================================================================
          상단 네비게이션 (Top Navigation)
          - 브레드크럼을 통한 현재 위치 표시
          ======================================================================== */}
      <div className="flex flex-row items-center p-2 px-2 mb-6 text-sm text-gray-500 bg-white rounded-lg shadow-sm">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Home className="mr-1 w-4 h-4" />
              <BreadcrumbLink href="/dashboard">대시보드</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="font-bold text-blue-500">Scope1</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {/* ========================================================================
          헤더 섹션 (Header Section)
          - 뒤로가기 버튼과 페이지 제목/설명
          ======================================================================== */}
      <div className="flex flex-row mb-6 w-full h-24">
        <Link
          href="/dashboard"
          className="flex flex-row items-center p-4 space-x-4 rounded-md transition cursor-pointer hover:bg-gray-200">
          <ArrowLeft className="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
          <PageHeader
            icon={<Factory className="w-6 h-6 text-customG-600" />}
            title="Scope 1 배출량 관리"
            description="직접 배출량 (고정연소, 이동연소) 데이터를 관리하고 추적합니다"
            module="SCOPE"
            submodule="scope1"
          />
        </Link>
      </div>
      {/* 데이터 관리 메인 영역 (Main Data Management Area) - 통계 카드, 데이터 테이블 포함 */}
      <motion.div
        className="space-y-4"
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.7, duration: 0.6}}>
        {/* ========================================================================
          연도 선택 섹션 (Year Selection)
          - 데이터 조회를 위한 필터 조건 설정
          ======================================================================== */}
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.4, delay: 0.1}}>
          <Card className="overflow-hidden mb-4 shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-8 justify-center items-center h-24 md:grid-cols-3">
                {/* 총 Scope 1 배출량 카드 */}
                <Card className="justify-center h-24 bg-gradient-to-br from-blue-50 to-white border-blue-100">
                  <CardContent className="flex items-center p-4">
                    <div className="p-2 mr-3 bg-blue-100 rounded-full">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        총 Scope 1 배출량
                      </p>
                      <h3 className="text-2xl font-bold">
                        {totalScope1Emission.toFixed(2)}
                        <span className="ml-1 text-sm font-normal text-gray-500">
                          tCO₂eq
                        </span>
                      </h3>
                    </div>
                  </CardContent>
                </Card>

                {/* 보고연도 입력 필드 */}
                <div className="space-y-3">
                  <label className="flex gap-2 items-center text-sm font-semibold text-customG-700">
                    <CalendarDays className="w-4 h-4" />
                    보고연도
                  </label>
                  <Input
                    type="number"
                    value={selectedYear}
                    onChange={e => setSelectedYear(parseInt(e.target.value))}
                    min="1900"
                    max="2200"
                    className="px-3 py-2 w-full h-9 text-sm backdrop-blur-sm border-customG-200 focus:border-customG-400 focus:ring-customG-100 bg-white/80"
                  />
                </div>

                {/* 보고월 선택 드롭다운 (선택사항) */}
                <div className="space-y-3">
                  <label className="flex gap-2 items-center text-sm font-semibold text-customG-700">
                    <CalendarDays className="w-4 h-4" />
                    보고월 (선택사항)
                  </label>
                  <MonthSelector
                    className="w-full"
                    selectedMonth={selectedMonth}
                    onSelect={setSelectedMonth}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ==================================================================
              데이터 테이블 섹션 (Data Table Section)
              - 탭으로 구분된 고정연소/이동연소 데이터 표시
              ================================================================== */}
        <Tabs defaultValue="stationary" className="w-full">
          {/* 탭 헤더 - 고정연소/이동연소 전환 */}
          <TabsList className="grid grid-cols-2 p-1 w-full bg-gray-100 rounded-lg">
            <TabsTrigger
              value="stationary"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md font-medium">
              고정연소 ({filteredStationaryData.length})
            </TabsTrigger>
            <TabsTrigger
              value="mobile"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md font-medium">
              이동연소 ({filteredMobileData.length})
            </TabsTrigger>
          </TabsList>

          {/* ================================================================
                고정연소 데이터 탭 (Stationary Combustion Tab)
                - 고정연소 배출량 데이터 목록 및 관리 기능
                ================================================================ */}
          <TabsContent value="stationary" className="mt-4">
            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.5}}>
              <Card className="overflow-hidden shadow-sm">
                {/* 고정연소 섹션 헤더 - 제목과 데이터 추가 버튼 */}
                <CardHeader className="bg-gradient-to-r to-emerald-50 border-b border-customG-100/50 from-customG-50">
                  <CardTitle className="flex justify-between items-center text-customG-800">
                    <div className="flex gap-3 items-center">
                      <div>
                        <h3 className="text-lg font-bold">고정연소 배출량 데이터</h3>
                        <p className="text-sm font-normal text-customG-600">
                          시설 및 설비의 연료 연소로 발생하는 직접 배출량
                        </p>
                      </div>
                    </div>
                    {/* 데이터 추가 버튼 */}
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg transition-colors duration-200 hover:bg-gray-800">
                      <Plus className="mr-2 w-4 h-4" />
                      데이터 추가
                    </Button>
                  </CardTitle>
                </CardHeader>

                {/* 고정연소 데이터 테이블 */}
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      {/* 테이블 헤더 */}
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r to-emerald-50 border-b from-customG-50 border-customG-200/50">
                          <TableHead className="font-semibold text-customG-700">
                            시설명
                          </TableHead>
                          <TableHead className="font-semibold text-customG-700">
                            연소 타입
                          </TableHead>
                          <TableHead className="font-semibold text-customG-700">
                            연료명
                          </TableHead>
                          <TableHead className="font-semibold text-customG-700">
                            사용량
                          </TableHead>
                          <TableHead className="font-semibold text-customG-700">
                            단위
                          </TableHead>
                          <TableHead className="font-semibold text-customG-700">
                            CO₂ 배출량
                          </TableHead>
                          <TableHead className="font-semibold text-customG-700">
                            보고월
                          </TableHead>
                          <TableHead className="font-semibold text-customG-700">
                            작업
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      {/* 테이블 바디 - 고정연소 데이터 목록 */}
                      <TableBody>
                        {/* 데이터가 없을 때 표시되는 빈 상태 */}
                        {filteredStationaryData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="py-16 text-center">
                              <div className="flex flex-col justify-center items-center space-y-4">
                                <div>
                                  <h3 className="mb-2 text-lg font-semibold text-customG-700">
                                    데이터가 없습니다
                                  </h3>
                                  <p className="text-customG-500">
                                    새로운 고정연소 배출량 데이터를 추가해보세요
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ================================================================
                이동연소 데이터 탭 (Mobile Combustion Tab)
                - 이동연소 배출량 데이터 목록 및 관리 기능
                ================================================================ */}
          <TabsContent value="mobile" className="mt-4">
            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.5}}>
              <Card className="overflow-hidden shadow-sm">
                {/* 이동연소 섹션 헤더 */}
                <CardHeader className="bg-gradient-to-r to-emerald-50 border-b border-customG-100/50 from-customG-50">
                  <CardTitle className="flex justify-between items-center text-customG-800">
                    <div className="flex gap-3 items-center">
                      <div>
                        <h3 className="text-lg font-bold">이동연소 배출량 데이터</h3>
                        <p className="text-sm font-normal text-customG-600">
                          차량 및 이동장비의 연료 연소로 발생하는 직접 배출량
                        </p>
                      </div>
                    </div>
                    {/* 데이터 추가 버튼 */}
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg transition-colors duration-200 hover:bg-gray-800">
                      <Plus className="mr-2 w-4 h-4" />
                      데이터 추가
                    </Button>
                  </CardTitle>
                </CardHeader>

                {/* 이동연소 데이터 테이블 */}
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      {/* 테이블 헤더 */}
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r to-emerald-50 border-b from-customG-50 border-customG-200/50">
                          <TableHead className="font-semibold text-customG-700">
                            차량/장비명
                          </TableHead>
                          <TableHead className="font-semibold text-customG-700">
                            교통수단 타입
                          </TableHead>
                          <TableHead className="font-semibold text-customG-700">
                            연료명
                          </TableHead>
                          <TableHead className="font-semibold text-customG-700">
                            사용량
                          </TableHead>
                          <TableHead className="font-semibold text-customG-700">
                            단위
                          </TableHead>
                          <TableHead className="font-semibold text-customG-700">
                            이동거리
                          </TableHead>
                          <TableHead className="font-semibold text-customG-700">
                            CO₂ 배출량
                          </TableHead>
                          <TableHead className="font-semibold text-customG-700">
                            보고월
                          </TableHead>
                          <TableHead className="font-semibold text-customG-700">
                            작업
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      {/* 테이블 바디 - 이동연소 데이터 목록 */}
                      <TableBody>
                        {/* 데이터가 없을 때 표시되는 빈 상태 */}
                        {filteredMobileData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={9} className="py-16 text-center">
                              <div className="flex flex-col justify-center items-center space-y-4">
                                <div>
                                  <h3 className="mb-2 text-lg font-semibold text-customG-700">
                                    데이터가 없습니다
                                  </h3>
                                  <p className="text-customG-500">
                                    새로운 이동연소 배출량 데이터를 추가해보세요
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
      {/* ========================================================================
          Scope 데이터 입력 모달 (Scope Data Input Modal)
          - 새로운 배출량 데이터 추가를 위한 모달 폼
          ======================================================================== */}
      <ScopeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        partnerCompanies={[]}
        defaultYear={selectedYear}
        defaultMonth={selectedMonth || new Date().getMonth() + 1}
        scope="SCOPE1"
      />
    </div>
  )
}
