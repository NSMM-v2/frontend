/**
 * Scope 1 배출량 관리 폼 컴포넌트
 *
 * 주요 기능:
 * - 협력사별 고정연소/이동연소 배출량 데이터 관리
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
import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'

// UI 아이콘 임포트 (Lucide React)
import {
  Building, // 건물 아이콘 (협력사)
  Car, // 자동차 아이콘 (이동연소)
  Factory, // 공장 아이콘 (고정연소)
  Plus, // 플러스 아이콘 (데이터 추가)
  TrendingUp, // 상승 트렌드 아이콘 (총 배출량)
  Edit, // 편집 아이콘
  Trash2, // 삭제 아이콘
  BarChart, // 차트 아이콘 (통계)
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
import {PartnerSelector} from '@/components/scope/PartnerSelector' // Scope용 협력사 선택기 (UUID 지원)

// 타입 정의 임포트
import type {
  PartnerCompanyForScope, // 협력사 정보 타입 (Scope용)
  StationaryCombustion, // 고정연소 배출량 타입
  MobileCombustion, // 이동연소 배출량 타입
  ScopeFormData // Scope 폼 데이터 타입
} from '@/types/scopeType'

// API 서비스 함수 임포트
import {
  fetchStationaryCombustionByPartnerAndYear, // 고정연소 데이터 조회
  fetchMobileCombustionByPartnerAndYear, // 이동연소 데이터 조회
  deleteStationaryCombustion, // 고정연소 데이터 삭제
  deleteMobileCombustion // 이동연소 데이터 삭제
} from '@/services/scopeService' // Scope 관련 API 서비스 함수
import {fetchPartnerCompaniesForScope} from '@/services/partnerCompany' // 실제 협력사 API 추가

// 브레드크럼 네비게이션 컴포넌트 임포트
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import {DirectionButton} from '@/components/layout/direction'
import {PageHeader} from '@/components/layout/PageHeader'

/**
 * Scope 1 배출량 관리 메인 컴포넌트
 *
 * 기능:
 * - 협력사 선택 및 연도/월 필터링
 * - 고정연소/이동연소 배출량 데이터 조회 및 관리
 * - 배출량 통계 대시보드 제공
 * - 데이터 추가/편집/삭제 기능
 */
export default function Scope1Form() {
  // ============================================================================
  // 상태 관리 (State Management)
  // ============================================================================

  // 필터 관련 상태
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null) // 선택된 협력사 ID (UUID)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()) // 선택된 연도
  const currentMonth = new Date().getMonth() + 1 // JavaScript의 월은 0부터 시작하므로 1을 더함
  const [selectedMonth, setSelectedMonth] = useState<number | null>(currentMonth) // 선택된 월 (null이면 전체)

  // 데이터 관련 상태
  const [stationaryData, setStationaryData] = useState<StationaryCombustion[]>([]) // 고정연소 배출량 데이터
  const [mobileData, setMobileData] = useState<MobileCombustion[]>([]) // 이동연소 배출량 데이터
  const [realPartnerCompanies, setRealPartnerCompanies] = useState<any[]>([]) // 실제 협력사 데이터

  // UI 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false) // 데이터 입력 모달 표시 여부
  const [searchTerm, setSearchTerm] = useState('') // 검색어 (현재 미사용)

  // ============================================================================
  // 실제 협력사 데이터 로딩 (Real Partner Data Loading)
  // ============================================================================

  /**
   * 실제 API에서 협력사 목록을 가져옵니다
   */
  const loadPartnerCompanies = async () => {
    try {
      const response = await fetchPartnerCompaniesForScope(1, 100, '', false)
      const partners = response.data || response.content || []
      setRealPartnerCompanies(partners)
    } catch (error) {
      console.error('❌ 협력사 데이터 로딩 실패:', error)
      setRealPartnerCompanies([])
    }
  }

  // 컴포넌트 마운트 시 협력사 데이터 로드
  useEffect(() => {
    loadPartnerCompanies()
  }, [])

  // ============================================================================
  // 데이터 로딩 함수 (Data Loading Functions)
  // ============================================================================

  /**
   * 선택된 협력사와 연도에 따른 배출량 데이터를 로드합니다.
   * 고정연소와 이동연소 데이터를 병렬로 조회하여 상태를 업데이트합니다.
   */
  const loadData = async () => {
    // 협력사가 선택되지 않은 경우 데이터 로딩 중단
    if (!selectedPartnerId) return

    try {
      // 고정연소와 이동연소 데이터를 병렬로 조회
      const [stationaryResponse, mobileResponse] = await Promise.all([
        fetchStationaryCombustionByPartnerAndYear(selectedPartnerId, selectedYear),
        fetchMobileCombustionByPartnerAndYear(selectedPartnerId, selectedYear)
      ])

      // 조회된 데이터를 상태에 저장
      setStationaryData(stationaryResponse)
      setMobileData(mobileResponse)
    } catch (error) {
      console.error('데이터 로딩 실패:', error)
    }
  }

  // 협력사 또는 연도가 변경될 때마다 데이터 다시 로드
  useEffect(() => {
    loadData()
  }, [selectedPartnerId, selectedYear])

  // ============================================================================
  // 데이터 삭제 함수 (Data Deletion Functions)
  // ============================================================================

  /**
   * 고정연소 배출량 데이터를 삭제합니다.
   * 사용자 확인 후 API 호출하여 데이터 삭제 및 목록 새로고침
   *
   * @param id - 삭제할 고정연소 데이터의 ID
   */
  const handleDeleteStationary = async (id: number) => {
    // 사용자에게 삭제 확인 요청
    if (!confirm('정말로 삭제하시겠습니까?')) return

    try {
      // API 호출하여 고정연소 데이터 삭제
      await deleteStationaryCombustion(id)
      // 삭제 후 데이터 목록 새로고침
      loadData()
    } catch (error) {
      console.error('삭제 실패:', error)
    }
  }

  /**
   * 이동연소 배출량 데이터를 삭제합니다.
   * 사용자 확인 후 API 호출하여 데이터 삭제 및 목록 새로고침
   *
   * @param id - 삭제할 이동연소 데이터의 ID
   */
  const handleDeleteMobile = async (id: number) => {
    // 사용자에게 삭제 확인 요청
    if (!confirm('정말로 삭제하시겠습니까?')) return

    try {
      // API 호출하여 이동연소 데이터 삭제
      await deleteMobileCombustion(id)
      // 삭제 후 데이터 목록 새로고침
      loadData()
    } catch (error) {
      console.error('삭제 실패:', error)
    }
  }

  // ============================================================================
  // 폼 제출 처리 함수 (Form Submission Handler)
  // ============================================================================

  /**
   * 모달에서 새로운 배출량 데이터가 제출되었을 때 처리합니다.
   * 데이터 저장 후 목록을 새로고침합니다.
   *
   * @param data - 제출된 Scope 폼 데이터
   */
  const handleFormSubmit = (data: ScopeFormData) => {
    console.log('폼 데이터:', data)
    loadData() // 데이터 새로고침
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
  // Scope 1 총 배출량 계산 (고정연소 + 이동연소)
  const totalScope1Emission = totalStationaryEmission + totalMobileEmission

  // ============================================================================
  // 컴포넌트 렌더링 (Component Rendering)
  // ============================================================================

  return (
    <div className="flex flex-col w-full h-full p-4 pt-24">
      {/* ========================================================================
          상단 네비게이션 (Top Navigation)
          - 브레드크럼을 통한 현재 위치 표시
          ======================================================================== */}
      <div className="flex flex-row items-center p-2 px-2 mb-6 text-sm text-gray-500 bg-white rounded-lg shadow-sm">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Home className="w-4 h-4 mr-1" />
              <BreadcrumbLink href="/home">대시보드</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="font-bold text-customG">Scope1</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ========================================================================
          헤더 섹션 (Header Section)
          - 뒤로가기 버튼과 페이지 제목/설명
          ======================================================================== */}

      <div className="flex flex-row w-full h-full mb-6">
        <Link
          href="/home"
          className="flex flex-row items-center p-4 space-x-4 transition rounded-md cursor-pointer hover:bg-gray-200">
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

      {!selectedPartnerId ? (
        <motion.div
          initial={{opacity: 0, scale: 0.95}}
          animate={{opacity: 1, scale: 1}}
          transition={{delay: 0.6, duration: 0.5}}>
          {/* ========================================================================
          협력사 및 연도 선택 섹션 (Partner & Year Selection)
          - 데이터 조회를 위한 필터 조건 설정
          ======================================================================== */}
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.4, delay: 0.1}}>
            <Card className="mb-6 overflow-hidden shadow-sm">
              <CardContent className="px-4 py-6">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                  {/* 협력사 선택 드롭다운 */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-customG-700">
                      <Building className="w-4 h-4" />
                      협력사 선택
                    </label>
                    <div className="relative">
                      <PartnerSelector
                        selectedPartnerId={selectedPartnerId}
                        onSelect={setSelectedPartnerId}
                      />
                    </div>
                  </div>

                  {/* 보고연도 입력 필드 */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-customG-700">
                      <CalendarDays className="w-4 h-4" />
                      보고연도
                    </label>
                    <Input
                      type="number"
                      value={selectedYear}
                      onChange={e => setSelectedYear(parseInt(e.target.value))}
                      min="1900"
                      max="2200"
                      className="w-full px-3 py-2 text-sm h-9 border-customG-200 focus:border-customG-400 focus:ring-customG-100 bg-white/80 backdrop-blur-sm"
                    />
                  </div>

                  {/* 보고월 선택 드롭다운 (선택사항) */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-customG-700">
                      <CalendarDays className="w-4 h-4" />
                      보고월 (선택사항)
                    </label>
                    <MonthSelector
                      selectedMonth={selectedMonth}
                      onSelect={setSelectedMonth}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Card className="flex items-center justify-center shadow-sm h-80 border-customG-200/50 bg-gradient-to-br from-white via-customG-25 to-emerald-25">
            <CardContent className="py-12 text-center">
              <h3 className="mb-4 text-2xl font-bold text-customG-800">
                협력사를 선택해주세요
              </h3>
              <p className="max-w-md leading-relaxed text-customG-600 whitespace-nowrap">
                먼저 협력사를 선택하여 해당 협력사의 배출량 데이터를 관리하고 추적하세요
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        /* ======================================================================
            데이터 관리 메인 영역 (Main Data Management Area)
            - 통계 카드, 데이터 테이블 포함
            ====================================================================== */
        <motion.div
          className="space-y-4"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.7, duration: 0.6}}>
          {/* ==================================================================
              통계 카드들 (Statistics Cards)
              - 배출량 현황을 한눈에 볼 수 있는 대시보드
              ================================================================== */}
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.4, delay: 0.1}}
            className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2 lg:grid-cols-4">
            {/* 총 Scope 1 배출량 카드 */}
            <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="flex items-center p-4">
                <div className="p-2 mr-3 bg-blue-100 rounded-full">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">총 Scope 1 배출량</p>
                  <h3 className="text-2xl font-bold">
                    {totalScope1Emission.toFixed(2)}
                    <span className="ml-1 text-sm font-normal text-gray-500">tCO₂eq</span>
                  </h3>
                </div>
              </CardContent>
            </Card>

            {/* 고정연소 배출량 카드 */}
            <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
              <CardContent className="flex items-center p-4">
                <div className="p-2 mr-3 rounded-full bg-emerald-100">
                  <Factory className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">고정연소 배출량</p>
                  <h3 className="text-2xl font-bold">
                    {totalStationaryEmission.toFixed(2)}
                    <span className="ml-1 text-sm font-normal text-gray-500">tCO₂eq</span>
                  </h3>
                </div>
              </CardContent>
            </Card>

            {/* 이동연소 배출량 카드 */}
            <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="flex items-center p-4">
                <div className="p-2 mr-3 rounded-full bg-amber-100">
                  <Car className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">이동연소 배출량</p>
                  <h3 className="text-2xl font-bold">
                    {totalMobileEmission.toFixed(2)}
                    <span className="ml-1 text-sm font-normal text-gray-500">tCO₂eq</span>
                  </h3>
                </div>
              </CardContent>
            </Card>

            {/* 총 데이터 건수 카드 */}
            <Card className="border-customG-100 bg-gradient-to-br from-customG-50 to-white">
              <CardContent className="flex items-center p-4">
                <div className="p-2 mr-3 rounded-full bg-customG-100">
                  <BarChart className="w-5 h-5 text-customG-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">총 데이터 건수</p>
                  <h3 className="text-2xl font-bold">
                    {filteredStationaryData.length + filteredMobileData.length}
                    <span className="ml-1 text-sm font-normal text-gray-500">건</span>
                  </h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ========================================================================
          협력사 및 연도 선택 섹션 (Partner & Year Selection)
          - 데이터 조회를 위한 필터 조건 설정
          ======================================================================== */}
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.4, delay: 0.1}}>
            <Card className="mb-4 overflow-hidden shadow-sm">
              <CardContent className="px-4 py-6">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                  {/* 협력사 선택 드롭다운 */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-customG-700">
                      <Building className="w-4 h-4" />
                      협력사 선택
                    </label>
                    <div className="relative">
                      <PartnerSelector
                        selectedPartnerId={selectedPartnerId}
                        onSelect={setSelectedPartnerId}
                      />
                    </div>
                  </div>

                  {/* 보고연도 입력 필드 */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-customG-700">
                      <CalendarDays className="w-4 h-4" />
                      보고연도
                    </label>
                    <Input
                      type="number"
                      value={selectedYear}
                      onChange={e => setSelectedYear(parseInt(e.target.value))}
                      min="1900"
                      max="2200"
                      className="w-full px-3 py-2 text-sm h-9 border-customG-200 focus:border-customG-400 focus:ring-customG-100 bg-white/80 backdrop-blur-sm"
                    />
                  </div>

                  {/* 보고월 선택 드롭다운 (선택사항) */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-customG-700">
                      <CalendarDays className="w-4 h-4" />
                      보고월 (선택사항)
                    </label>
                    <MonthSelector
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
            <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 rounded-lg">
              <TabsTrigger
                value="stationary"
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md font-medium">
                {/* 여기 팩토리 아이콘 삭제 */}
                고정연소 ({filteredStationaryData.length})
              </TabsTrigger>
              <TabsTrigger
                value="mobile"
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md font-medium">
                {/* 여기 자동차 아이콘 삭제 */}
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
                  <CardHeader className="border-b border-customG-100/50 bg-gradient-to-r from-customG-50 to-emerald-50">
                    <CardTitle className="flex items-center justify-between text-customG-800">
                      <div className="flex items-center gap-3">
                        {/* 이부분도 아이콘 삭제 */}
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
                        className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-black rounded-lg hover:bg-gray-800">
                        <Plus className="w-4 h-4 mr-2" />
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
                          <TableRow className="border-b bg-gradient-to-r from-customG-50 to-emerald-50 border-customG-200/50">
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
                          {filteredStationaryData.map((item, index) => (
                            <motion.tr
                              key={item.id}
                              initial={{opacity: 0, x: -20}}
                              animate={{opacity: 1, x: 0}}
                              transition={{delay: index * 0.1, duration: 0.3}}
                              className="transition-all duration-200 border-b border-customG-100/50 hover:bg-gradient-to-r hover:from-customG-25 hover:to-emerald-25">
                              {/* 시설명 */}
                              <TableCell className="font-medium text-customG-800">
                                {item.facilityName}
                              </TableCell>
                              {/* 연소 타입 배지 */}
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`border-customG-300 font-medium ${
                                    item.combustionType === 'LIQUID'
                                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                                      : item.combustionType === 'SOLID'
                                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  }`}>
                                  {item.combustionType === 'LIQUID'
                                    ? '액체연료'
                                    : item.combustionType === 'SOLID'
                                    ? '고체연료'
                                    : '가스연료'}
                                </Badge>
                              </TableCell>
                              {/* 연료명 */}
                              <TableCell className="text-customG-700">
                                {item.fuelName}
                              </TableCell>
                              {/* 연료 사용량 */}
                              <TableCell className="font-medium text-customG-700">
                                {item.fuelUsage.toLocaleString()}
                              </TableCell>
                              {/* 사용량 단위 */}
                              <TableCell className="text-customG-600">
                                {item.unit}
                              </TableCell>
                              {/* CO₂ 배출량 */}
                              <TableCell className="font-bold text-customG-800">
                                {item.totalCo2Equivalent?.toFixed(3)} tCO₂eq
                              </TableCell>
                              {/* 보고월 */}
                              <TableCell className="text-customG-700">
                                {item.reportingMonth}월
                              </TableCell>
                              {/* 작업 버튼 (편집/삭제) */}
                              <TableCell>
                                <div className="flex space-x-1">
                                  {/* 편집 버튼 */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      console.log('편집:', item.id)
                                    }}
                                    className="hover:bg-customG-100 text-customG-600 hover:text-customG-800">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  {/* 삭제 버튼 */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteStationary(item.id!)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                          {/* 데이터가 없을 때 표시되는 빈 상태 */}
                          {filteredStationaryData.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={8} className="py-16 text-center">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                  {/* 여기도 팩토리 아이콘 삭제 */}
                                  <div>
                                    {/* 팩토리 아이콘 삭제 */}
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
                  <CardHeader className="border-b border-customG-100/50 bg-gradient-to-r from-customG-50 to-emerald-50">
                    <CardTitle className="flex items-center justify-between text-customG-800">
                      <div className="flex items-center gap-3">
                        {/* 자동차 아이콘 삭제 */}
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
                        className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-black rounded-lg hover:bg-gray-800">
                        <Plus className="w-4 h-4 mr-2" />
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
                          <TableRow className="border-b bg-gradient-to-r from-customG-50 to-emerald-50 border-customG-200/50">
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
                          {filteredMobileData.map((item, index) => (
                            <motion.tr
                              key={item.id}
                              initial={{opacity: 0, x: -20}}
                              animate={{opacity: 1, x: 0}}
                              transition={{delay: index * 0.1, duration: 0.3}}
                              className="transition-all duration-200 border-b border-customG-100/50 hover:bg-gradient-to-r hover:from-customG-25 hover:to-emerald-25">
                              {/* 차량/장비명 */}
                              <TableCell className="font-medium text-customG-800">
                                {item.vehicleType}
                              </TableCell>
                              {/* 교통수단 타입 배지 */}
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`border-customG-300 font-medium ${
                                    item.transportType === 'ROAD'
                                      ? 'bg-green-50 text-green-700 border-green-300'
                                      : item.transportType === 'AVIATION'
                                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                                      : item.transportType === 'RAILWAY'
                                      ? 'bg-purple-50 text-purple-700 border-purple-300'
                                      : 'bg-cyan-50 text-cyan-700 border-cyan-300'
                                  }`}>
                                  {item.transportType === 'ROAD'
                                    ? '도로교통'
                                    : item.transportType === 'AVIATION'
                                    ? '항공'
                                    : item.transportType === 'RAILWAY'
                                    ? '철도'
                                    : '선박'}
                                </Badge>
                              </TableCell>
                              {/* 연료명 */}
                              <TableCell className="text-customG-700">
                                {item.fuelName}
                              </TableCell>
                              {/* 연료 사용량 */}
                              <TableCell className="font-medium text-customG-700">
                                {item.fuelUsage.toLocaleString()}
                              </TableCell>
                              {/* 사용량 단위 */}
                              <TableCell className="text-customG-600">
                                {item.unit}
                              </TableCell>
                              {/* 이동거리 */}
                              <TableCell className="text-customG-700">
                                {item.distance ? `${item.distance} km` : '-'}
                              </TableCell>
                              {/* CO₂ 배출량 */}
                              <TableCell className="font-bold text-customG-800">
                                {item.totalCo2Equivalent?.toFixed(3)} tCO₂eq
                              </TableCell>
                              {/* 보고월 */}
                              <TableCell className="text-customG-700">
                                {item.reportingMonth}월
                              </TableCell>
                              {/* 작업 버튼 (편집/삭제) */}
                              <TableCell>
                                <div className="flex space-x-1">
                                  {/* 편집 버튼 */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      console.log('편집:', item.id)
                                    }}
                                    className="hover:bg-customG-100 text-customG-600 hover:text-customG-800">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  {/* 삭제 버튼 */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteMobile(item.id!)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                          {/* 데이터가 없을 때 표시되는 빈 상태 */}
                          {filteredMobileData.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={9} className="py-16 text-center">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                  {/* 여기도 아이콘 삭제 */}
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
      )}

      {/* ========================================================================
          Scope 데이터 입력 모달 (Scope Data Input Modal)
          - 새로운 배출량 데이터 추가를 위한 모달 폼
          ======================================================================== */}
      <ScopeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        partnerCompanies={realPartnerCompanies}
        defaultPartnerId={selectedPartnerId || undefined}
        defaultYear={selectedYear}
        defaultMonth={selectedMonth || new Date().getMonth() + 1}
        scope="SCOPE1"
      />

      <DirectionButton
        direction="right"
        tooltip="scope2으로 이동"
        href="/scope2"
        fixed
        position="middle-right"
        size={48}
      />
    </div>
  )
}
