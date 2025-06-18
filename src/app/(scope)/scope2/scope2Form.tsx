/**
 * Scope 2 배출량 관리 폼 컴포넌트
 *
 * 주요 기능:
 * - 협력사별 전력/스팀 사용량 데이터 관리
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
  Zap, // 전력 아이콘
  Wind, // 스팀 아이콘
  Plus, // 플러스 아이콘 (데이터 추가)
  TrendingUp, // 상승 트렌드 아이콘 (총 배출량)
  Edit, // 편집 아이콘
  Trash2, // 삭제 아이콘
  BarChart, // 차트 아이콘 (통계)
  CalendarDays, // 달력 아이콘 (날짜 선택)
  ArrowLeft, // 왼쪽 화살표 (뒤로가기)
  Home, // 홈 아이콘
  Factory
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

// 브레드크럼 네비게이션 컴포넌트 임포트
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

// 커스텀 컴포넌트 임포트
import ScopeModal from '@/components/scope/ScopeModal'

// 타입 정의 및 API 서비스 임포트
import {ElectricityUsage, SteamUsage} from '@/types/scopeType'
import {
  submitScopeData,
  fetchElectricityUsageByPartnerAndYear,
  fetchSteamUsageByPartnerAndYear
} from '@/services/scopeService'
import {fetchPartnerCompaniesForScope} from '@/services/partnerCompany' // 실제 협력사 API 추가
import {PartnerSelector} from '@/components/scope/PartnerSelector'
import {DirectionButton} from '@/components/layout/direction'
import {PageHeader} from '@/components/layout/PageHeader'
import {MonthSelector} from '@/components/scope/MonthSelector'

/**
 * Scope2Form 컴포넌트
 * - 협력사별 전력/스팀 사용량 데이터 관리
 * - 탭을 통한 전력/스팀 데이터 분리 표시
 * - scope1Form.tsx와 동일한 디자인 패턴 적용
 */
export default function Scope2Form() {
  // ============================================================================
  // 상태 관리 (State Management)
  // ============================================================================

  // 필터 관련 상태
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null) // 선택된 협력사 ID (UUID)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()) // 선택된 연도
  const currentMonth = new Date().getMonth() + 1 // JavaScript의 월은 0부터 시작하므로 1을 더함
  const [selectedMonth, setSelectedMonth] = useState<number | null>(currentMonth) // 선택된 월 (null이면 전체)

  // 데이터 관련 상태
  const [electricityData, setElectricityData] = useState<ElectricityUsage[]>([]) // 전력 사용량 데이터
  const [steamData, setSteamData] = useState<SteamUsage[]>([]) // 스팀 사용량 데이터
  const [realPartnerCompanies, setRealPartnerCompanies] = useState<any[]>([]) // 실제 협력사 데이터

  // UI 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false) // 데이터 입력 모달 표시 여부
  const [searchTerm, setSearchTerm] = useState('') // 검색어 (현재 미사용)
  const [loading, setLoading] = useState(false) // 로딩 상태

  // 편집 관련 상태
  const [editingItem, setEditingItem] = useState<ElectricityUsage | SteamUsage | null>(
    null
  )
  const [editingType, setEditingType] = useState<'ELECTRICITY' | 'STEAM'>('ELECTRICITY')

  // ============================================================================
  // 실제 협력사 데이터 로딩 (Real Partner Data Loading)
  // ============================================================================

  /**
   * 실제 API에서 협력사 목록을 가져옵니다
   */
  const loadPartnerCompanies = async () => {
    try {
      const response = await fetchPartnerCompaniesForScope()

      setRealPartnerCompanies(response.content || [])
    } catch (error) {
      console.error('❌ 협력사 목록 로딩 실패:', error)
      setRealPartnerCompanies([])
    }
  }

  // ============================================================================
  // 데이터 로딩 및 처리 (Data Loading & Processing)
  // ============================================================================

  /**
   * 선택된 협력사와 연도에 따른 배출량 데이터를 로딩합니다
   */
  const loadData = async () => {
    if (!selectedPartnerId) return

    setLoading(true)
    try {
      console.log('🔄 배출량 데이터 로딩 시작:', {selectedPartnerId, selectedYear})

      const [electricity, steam] = await Promise.all([
        fetchElectricityUsageByPartnerAndYear(selectedPartnerId, selectedYear),
        fetchSteamUsageByPartnerAndYear(selectedPartnerId, selectedYear)
      ])

      console.log('✅ 배출량 데이터 로딩 성공:', {electricity, steam})

      setElectricityData(electricity)
      setSteamData(steam)
    } catch (error) {
      console.error('❌ 배출량 데이터 로딩 실패:', error)
      setElectricityData([])
      setSteamData([])
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // 폼 제출 핸들러 (Form Submit Handler)
  // ============================================================================

  /**
   * ScopeModal에서 제출된 데이터를 처리합니다
   */
  const handleFormSubmit = async (data: any) => {
    try {
      console.log('💾 폼 데이터 제출:', data)

      // 데이터 저장 후 목록 새로고침
      await loadData()
    } catch (error) {
      console.error('❌ 폼 제출 실패:', error)
    }
  }

  // ============================================================================
  // useEffect 훅들 (useEffect Hooks)
  // ============================================================================

  // 컴포넌트 마운트 시 협력사 목록 로딩
  useEffect(() => {
    loadPartnerCompanies()
  }, [])

  // 협력사 또는 연도 변경 시 데이터 로딩
  useEffect(() => {
    if (selectedPartnerId) {
      loadData()
    }
  }, [selectedPartnerId, selectedYear])

  // ============================================================================
  // 데이터 필터링 (Data Filtering)
  // ============================================================================

  // 전력 데이터 필터링
  const filteredElectricityData = electricityData.filter(item => {
    const matchesMonth = selectedMonth === null || item.reportingMonth === selectedMonth
    const matchesSearch =
      !searchTerm || item.facilityName?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesMonth && matchesSearch
  })

  // 스팀 데이터 필터링
  const filteredSteamData = steamData.filter(item => {
    const matchesMonth = selectedMonth === null || item.reportingMonth === selectedMonth
    const matchesSearch =
      !searchTerm || item.facilityName?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesMonth && matchesSearch
  })

  // ============================================================================
  // 통계 계산 (Statistics Calculation)
  // ============================================================================

  // 전력 통계
  const electricityStats = {
    totalUsage: filteredElectricityData.reduce(
      (sum, item) => sum + (item.electricityUsage || 0),
      0
    ),
    totalEmissions: filteredElectricityData.reduce(
      (sum, item) => sum + ((item.electricityUsage || 0) * 0.459) / 1000,
      0
    ),
    renewableCount: filteredElectricityData.filter(item => item.isRenewable).length,
    totalCount: filteredElectricityData.length
  }

  // 스팀 통계
  const steamStats = {
    totalUsage: filteredSteamData.reduce((sum, item) => sum + (item.steamUsage || 0), 0),
    totalEmissions: filteredSteamData.reduce(
      (sum, item) => sum + (item.steamUsage || 0) * 0.07,
      0
    ),
    totalCount: filteredSteamData.length
  }

  // 전체 통계
  const totalEmissions = electricityStats.totalEmissions + steamStats.totalEmissions
  const totalDataCount = electricityStats.totalCount + steamStats.totalCount

  // ============================================================================
  // 이벤트 핸들러 (Event Handlers)
  // ============================================================================

  // 데이터 편집
  const handleEditElectricity = (item: ElectricityUsage) => {
    setEditingItem(item)
    setEditingType('ELECTRICITY')
    setIsModalOpen(true)
  }

  const handleEditSteam = (item: SteamUsage) => {
    setEditingItem(item)
    setEditingType('STEAM')
    setIsModalOpen(true)
  }

  // 전력 데이터 삭제
  const handleDeleteElectricity = async (id: number) => {
    if (!confirm('정말로 이 데이터를 삭제하시겠습니까?')) return

    try {
      // TODO: 실제 삭제 API 호출 구현 필요
      setElectricityData(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      console.error('삭제 실패:', error)
    }
  }

  // 스팀 데이터 삭제
  const handleDeleteSteam = async (id: number) => {
    if (!confirm('정말로 이 데이터를 삭제하시겠습니까?')) return

    try {
      // TODO: 실제 삭제 API 호출 구현 필요
      setSteamData(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      console.error('삭제 실패:', error)
    }
  }

  // ============================================================================
  // 렌더링 (Rendering)
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
              <span className="font-bold text-customG">Scope2</span>
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
            title="Scope 2 배출량 관리"
            description="간접 배출량 (전력, 스팀) 데이터를 관리하고 추적합니다"
            module="SCOPE"
            submodule="scope2"
          />
        </Link>
      </div>

      {/* ========================================================================
          협력사 미선택 시 안내 메시지 (Partner Not Selected Message)
          - 협력사 선택을 유도하는 UI
          ======================================================================== */}
      {!selectedPartnerId ? (
        <motion.div
          initial={{opacity: 0, scale: 0.95}}
          animate={{opacity: 1, scale: 1}}
          transition={{delay: 0.6, duration: 0.5}}>
          <Card className="mb-4 overflow-hidden shadow-sm">
            <CardContent className="px-4 pt-8 pb-6">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* 협력사 선택 드롭다운 */}
                <motion.div className="space-y-3">
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
                </motion.div>

                {/* 연도 선택 */}
                <motion.div className="space-y-3">
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
                </motion.div>
                {/* 보고월 선택 드롭다운 (선택사항) */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-customG-700">
                    <CalendarDays className="w-4 h-4" />
                    보고월 (선택사항)
                  </label>
                  <MonthSelector
                    selectedMonth={selectedMonth}
                    onSelect={setSelectedMonth}
                    placeholder={`${currentMonth}월`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

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
            {/* 총 Scope 2 배출량 카드 */}
            <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="flex items-center p-4">
                <div className="p-2 mr-3 bg-blue-100 rounded-full">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">총 Scope 2 배출량</p>
                  <h3 className="text-2xl font-bold">
                    {totalEmissions.toFixed(2)}
                    <span className="ml-1 text-sm font-normal text-gray-500">tCO₂eq</span>
                  </h3>
                </div>
              </CardContent>
            </Card>

            {/* 전력 사용량 카드 */}
            <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
              <CardContent className="flex items-center p-4">
                <div className="p-2 mr-3 rounded-full bg-emerald-100">
                  <Zap className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">전력 배출량</p>
                  <h3 className="text-2xl font-bold">
                    {electricityStats.totalEmissions.toFixed(2)}
                    <span className="ml-1 text-sm font-normal text-gray-500">tCO₂eq</span>
                  </h3>
                </div>
              </CardContent>
            </Card>

            {/* 스팀 사용량 카드 */}
            <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="flex items-center p-4">
                <div className="p-2 mr-3 rounded-full bg-amber-100">
                  <Wind className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">스팀 배출량</p>
                  <h3 className="text-2xl font-bold">
                    {steamStats.totalEmissions.toFixed(2)}
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
                    {totalDataCount}
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
              <CardContent className="px-4 pt-8 pb-6">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                  {/* 협력사 선택 드롭다운 */}
                  <motion.div className="space-y-3">
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
                  </motion.div>

                  {/* 연도 선택 */}
                  <motion.div className="space-y-3">
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
                  </motion.div>
                  {/* 보고월 선택 드롭다운 (선택사항) */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-customG-700">
                      <CalendarDays className="w-4 h-4" />
                      보고월 (선택사항)
                    </label>
                    <MonthSelector
                      selectedMonth={selectedMonth}
                      onSelect={setSelectedMonth}
                      placeholder={`${currentMonth}월`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ==================================================================
              데이터 테이블 섹션 (Data Table Section)
              - 탭으로 구분된 전력/스팀 데이터 표시
              ================================================================== */}
          <Tabs defaultValue="electricity" className="w-full">
            {/* 탭 헤더 - 전력/스팀 전환 */}
            <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 rounded-lg">
              <TabsTrigger
                value="electricity"
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md font-medium">
                {/* 아이콘 삭제 */}
                전력 ({filteredElectricityData.length})
              </TabsTrigger>
              <TabsTrigger
                value="steam"
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md font-medium">
                {/* 아이콘 삭제 */}
                스팀 ({filteredSteamData.length})
              </TabsTrigger>
            </TabsList>

            {/* ================================================================
                전력 사용량 탭 (Electricity Usage Tab)
                ================================================================ */}
            <TabsContent value="electricity" className="mt-4">
              <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}>
                <Card className="overflow-hidden shadow-sm">
                  {/* 전력 섹션 헤더 */}
                  <CardHeader className="border-b border-customG-100/50 bg-gradient-to-r from-customG-50 to-emerald-50">
                    <CardTitle className="flex items-center justify-between text-customG-800">
                      <div className="flex items-center gap-3">
                        {/* 아이콘 삭제 */}
                        <div>
                          <h3 className="text-lg font-bold">전력 사용량 데이터</h3>
                          <p className="text-sm font-normal text-customG-600">
                            시설별 전력 소비량 및 배출량 관리
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setEditingItem(null)
                          setEditingType('ELECTRICITY')
                          setIsModalOpen(true)
                        }}
                        className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 rounded-lg bg-customG hover:bg-customGDark">
                        <Plus className="w-4 h-4 mr-2" />
                        데이터 추가
                      </Button>
                    </CardTitle>
                  </CardHeader>

                  {/* 전력 데이터 테이블 */}
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
                              보고월
                            </TableHead>
                            <TableHead className="font-semibold text-customG-700">
                              사용량
                            </TableHead>
                            <TableHead className="font-semibold text-customG-700">
                              단위
                            </TableHead>
                            <TableHead className="font-semibold text-customG-700">
                              재생에너지
                            </TableHead>
                            <TableHead className="font-semibold text-customG-700">
                              배출량
                            </TableHead>
                            <TableHead className="font-semibold text-customG-700">
                              작업
                            </TableHead>
                          </TableRow>
                        </TableHeader>

                        {/* 테이블 바디 - 전력 데이터 목록 */}
                        <TableBody>
                          {filteredElectricityData.map((item, index) => (
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
                              {/* 보고월 */}
                              <TableCell className="text-customG-700">
                                {item.reportingMonth}월
                              </TableCell>
                              {/* 전력 사용량 */}
                              <TableCell className="font-medium text-customG-700">
                                {item.electricityUsage?.toLocaleString()}
                              </TableCell>
                              {/* 사용량 단위 */}
                              <TableCell className="text-customG-600">
                                {item.unit}
                              </TableCell>
                              {/* 재생에너지 배지 */}
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`border-customG-300 font-medium ${
                                    item.isRenewable
                                      ? 'bg-green-50 text-green-700 border-green-300'
                                      : 'bg-gray-50 text-gray-700 border-gray-300'
                                  }`}>
                                  {item.isRenewable ? '재생에너지' : '일반전력'}
                                </Badge>
                              </TableCell>
                              {/* CO₂ 배출량 */}
                              <TableCell className="font-bold text-customG-800">
                                {(((item.electricityUsage || 0) * 0.459) / 1000).toFixed(
                                  3
                                )}{' '}
                                tCO₂eq
                              </TableCell>
                              {/* 작업 버튼 (편집/삭제) */}
                              <TableCell>
                                <div className="flex space-x-1">
                                  {/* 편집 버튼 */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditElectricity(item)}
                                    className="hover:bg-customG-100 text-customG-600 hover:text-customG-800">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  {/* 삭제 버튼 */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      item.id && handleDeleteElectricity(item.id)
                                    }
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                          {/* 데이터가 없을 때 표시되는 빈 상태 */}
                          {filteredElectricityData.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={7} className="py-16 text-center">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                  {/* 아이콘 삭제 */}
                                  <div>
                                    <h3 className="mb-2 text-lg font-semibold text-customG-700">
                                      데이터가 없습니다
                                    </h3>
                                    <p className="text-customG-500">
                                      새로운 전력 사용량 데이터를 추가해보세요
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
                스팀 사용량 탭 (Steam Usage Tab)
                ================================================================ */}
            <TabsContent value="steam" className="mt-4">
              <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}>
                <Card className="overflow-hidden shadow-sm">
                  {/* 스팀 섹션 헤더 */}
                  <CardHeader className="border-b border-customG-100/50 bg-gradient-to-r ">
                    <CardTitle className="flex items-center justify-between text-customG-800">
                      <div className="flex items-center gap-3">
                        {/* 아이콘 삭제 */}
                        <div>
                          <h3 className="text-lg font-bold">스팀 사용량 데이터</h3>
                          <p className="text-sm font-normal text-customG-600">
                            시설별 스팀 소비량 및 배출량 관리
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setEditingItem(null)
                          setEditingType('STEAM')
                          setIsModalOpen(true)
                        }}
                        className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 rounded-lg bg-customG hover:bg-customGDark">
                        <Plus className="w-4 h-4 mr-2" />
                        데이터 추가
                      </Button>
                    </CardTitle>
                  </CardHeader>

                  {/* 스팀 데이터 테이블 */}
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        {/* 테이블 헤더 */}
                        <TableHeader>
                          <TableRow className="border-b bg-gradient-to-r border-customG-200/50">
                            <TableHead className="font-semibold text-customG-700">
                              시설명
                            </TableHead>
                            <TableHead className="font-semibold text-customG-700">
                              보고월
                            </TableHead>
                            <TableHead className="font-semibold text-customG-700">
                              사용량
                            </TableHead>
                            <TableHead className="font-semibold text-customG-700">
                              단위
                            </TableHead>
                            <TableHead className="font-semibold text-customG-700">
                              배출량
                            </TableHead>
                            <TableHead className="font-semibold text-customG-700">
                              작업
                            </TableHead>
                          </TableRow>
                        </TableHeader>

                        {/* 테이블 바디 - 스팀 데이터 목록 */}
                        <TableBody>
                          {filteredSteamData.map((item, index) => (
                            <motion.tr
                              key={item.id}
                              initial={{opacity: 0, x: -20}}
                              animate={{opacity: 1, x: 0}}
                              transition={{delay: index * 0.1, duration: 0.3}}
                              className="transition-all duration-200 border-b border-customG-100/50 hover:bg-gradient-to-r hover:from-amber-25 hover:to-orange-25">
                              {/* 시설명 */}
                              <TableCell className="font-medium text-customG-800">
                                {item.facilityName}
                              </TableCell>
                              {/* 보고월 */}
                              <TableCell className="text-customG-700">
                                {item.reportingMonth}월
                              </TableCell>
                              {/* 스팀 사용량 */}
                              <TableCell className="font-medium text-customG-700">
                                {item.steamUsage?.toLocaleString()}
                              </TableCell>
                              {/* 사용량 단위 */}
                              <TableCell className="text-customG-600">
                                {item.unit}
                              </TableCell>
                              {/* CO₂ 배출량 */}
                              <TableCell className="font-bold text-customG-800">
                                {((item.steamUsage || 0) * 0.07).toFixed(3)} tCO₂eq
                              </TableCell>
                              {/* 작업 버튼 (편집/삭제) */}
                              <TableCell>
                                <div className="flex space-x-1">
                                  {/* 편집 버튼 */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditSteam(item)}
                                    className="hover:bg-customG-100 text-customG-600 hover:text-customG-800">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  {/* 삭제 버튼 */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => item.id && handleDeleteSteam(item.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                          {/* 데이터가 없을 때 표시되는 빈 상태 */}
                          {filteredSteamData.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="py-16 text-center">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                  {/* 아이콘 삭제 */}
                                  <div>
                                    <h3 className="mb-2 text-lg font-semibold text-customG-700">
                                      데이터가 없습니다
                                    </h3>
                                    <p className="text-customG-500">
                                      새로운 스팀 사용량 데이터를 추가해보세요
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
        scope="SCOPE2"
      />

      <DirectionButton
        direction="left"
        tooltip="scope1으로 이동"
        href="/scope1"
        fixed
        position="middle-left"
        size={48}
      />
    </div>
  )
}
