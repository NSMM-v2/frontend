/**
 * Scope 2 배출량 관리 폼 컴포넌트
 *
 * 주요 기능:
 * - 전력/스팀 사용량 데이터 관리
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
  Zap, // 전력 아이콘
  Wind, // 스팀 아이콘
  Plus, // 플러스 아이콘 (데이터 추가)
  TrendingUp, // 상승 트렌드 아이콘 (총 배출량)
  Edit, // 편집 아이콘
  Trash2, // 삭제 아이콘
  CalendarDays, // 달력 아이콘 (날짜 선택)
  ArrowLeft, // 왼쪽 화살표 (뒤로가기)
  Home, // 홈 아이콘
  Factory
} from 'lucide-react'
import Link from 'next/link'

// UI 컴포넌트 임포트 (Shadcn/ui)
import {Card, CardContent} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

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
  fetchElectricityUsageList,
  fetchSteamUsageList
} from '@/services/scopeService'
import {DirectionButton} from '@/components/layout/direction'
import {PageHeader} from '@/components/layout/PageHeader'
import {MonthSelector} from '@/components/scope/MonthSelector'
import {
  CategorySelector,
  scope2SteamCategoryList,
  scope2ElectricCategoryList
} from '@/components/scope3/CategorySelector'
import {
  Scope2SteamCategoryKey,
  Scope2ElectricCategoryKey
} from '@/components/scope3/CategorySelector'
import {Scope3EmissionResponse, SelectorState} from '@/lib/types'

interface CalculatorData {
  id: number
  state: SelectorState
  emissionId?: number // 백엔드에서 받은 배출량 데이터 ID (수정/삭제용)
  savedData?: Scope3EmissionResponse // 백엔드에서 받은 전체 데이터
}

/**
 * Scope2Form 컴포넌트
 * - 전력/스팀 사용량 데이터 관리
 * - 탭을 통한 전력/스팀 데이터 분리 표시
 * - scope1Form.tsx와 동일한 디자인 패턴 적용
 */
export default function Scope2Form() {
  // ============================================================================
  // 상태 관리 (State Management)
  // ============================================================================

  // 필터 관련 상태
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()) // 선택된 연도
  const currentMonth = new Date().getMonth() + 1 // JavaScript의 월은 0부터 시작하므로 1을 더함
  const [selectedMonth, setSelectedMonth] = useState<number | null>(currentMonth) // 선택된 월 (null이면 전체)

  // 데이터 관련 상태
  const [electricityData, setElectricityData] = useState<ElectricityUsage[]>([]) // 전력 사용량 데이터
  const [steamData, setSteamData] = useState<SteamUsage[]>([]) // 스팀 사용량 데이터

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
  // 데이터 로딩 및 처리 (Data Loading & Processing)
  // ============================================================================

  /**
   * 선택된 연도에 따른 배출량 데이터를 로딩합니다
   */
  const loadData = async () => {
    setLoading(true)
    try {
      console.log('🔄 배출량 데이터 로딩 시작:', {selectedYear})

      const [electricity, steam] = await Promise.all([
        fetchElectricityUsageList(),
        fetchSteamUsageList()
      ])

      console.log('배출량 데이터 로딩 성공:', {electricity, steam})

      setElectricityData(electricity)
      setSteamData(steam)
    } catch (error) {
      console.error('배출량 데이터 로딩 실패:', error)
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
      console.error('폼 제출 실패:', error)
    }
  }

  // ============================================================================
  // useEffect 훅들 (useEffect Hooks)
  // ============================================================================

  // 연도가 변경될 때마다 데이터 다시 로드
  useEffect(() => {
    loadData()
  }, [selectedYear])

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

  const [activeCategory, setActiveCategory] = useState<Scope2SteamCategoryKey | null>(
    null
  ) // 현재 선택된 스팀 카테고리

  // 전력 카테고리 관련 상태
  const [activeElectricCategory, setActiveElectricCategory] =
    useState<Scope2ElectricCategoryKey | null>(null) // 현재 선택된 전력 카테고리

  // 카테고리별 배출량 총계 관리
  const [categoryTotals, setCategoryTotals] = useState<{
    [key in Scope2SteamCategoryKey]?: {id: number; emission: number}[]
  }>({})

  // 전력 카테고리별 배출량 총계 관리
  const [electricCategoryTotals, setElectricCategoryTotals] = useState<{
    [key in Scope2ElectricCategoryKey]?: {id: number; emission: number}[]
  }>({})

  // 카테고리별 계산기 목록 관리
  const [categoryCalculators, setCategoryCalculators] = useState<{
    [key in Scope2SteamCategoryKey]?: CalculatorData[]
  }>({})

  // 전력 카테고리별 계산기 목록 관리
  const [electricCategoryCalculators, setElectricCategoryCalculators] = useState<{
    [key in Scope2ElectricCategoryKey]?: CalculatorData[]
  }>({})

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

  const getTotalEmission = (category: Scope2SteamCategoryKey): number =>
    (categoryTotals[category] || []).reduce((sum, t) => sum + t.emission, 0)

  // 전력 카테고리별 총 배출량 계산 함수
  const getElectricTotalEmission = (category: Scope2ElectricCategoryKey): number =>
    (electricCategoryTotals[category] || []).reduce((sum, t) => sum + t.emission, 0)

  const handleCategorySelect = (category: Scope2SteamCategoryKey) => {
    setActiveCategory(category)

    // 해당 카테고리에 계산기가 없으면 기본 계산기 1개 생성
    if (!categoryCalculators[category] || categoryCalculators[category]!.length === 0) {
      setCategoryCalculators(prev => ({
        ...prev,
        [category]: [
          {id: 1, state: {category: '', separate: '', rawMaterial: '', quantity: ''}}
        ]
      }))
    }
  }

  // 전력 카테고리 선택 핸들러
  const handleElectricCategorySelect = (category: Scope2ElectricCategoryKey) => {
    setActiveElectricCategory(category)

    // 해당 카테고리에 계산기가 없으면 기본 계산기 1개 생성
    if (
      !electricCategoryCalculators[category] ||
      electricCategoryCalculators[category]!.length === 0
    ) {
      setElectricCategoryCalculators(prev => ({
        ...prev,
        [category]: [
          {id: 1, state: {category: '', separate: '', rawMaterial: '', quantity: ''}}
        ]
      }))
    }
  }

  // ============================================================================
  // 렌더링 (Rendering)
  // ============================================================================

  return (
    <div className="flex flex-col w-full h-full p-4">
      {/* ========================================================================
          상단 네비게이션 (Top Navigation)
          - 브레드크럼을 통한 현재 위치 표시
          ======================================================================== */}
      <div className="flex flex-row items-center p-2 px-2 mb-4 text-sm text-gray-500 bg-white rounded-lg shadow-sm">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Home className="w-4 h-4 mr-1" />
              <BreadcrumbLink href="/dashboard">대시보드</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="font-bold text-blue-600">Scope2</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ========================================================================
          헤더 섹션 (Header Section)
          - 뒤로가기 버튼과 페이지 제목/설명
          ======================================================================== */}
      <div className="flex flex-row w-full h-24 mb-4">
        <div className="flex flex-row items-center p-4">
          <PageHeader
            icon={<Factory className="w-6 h-6 text-customG-600" />}
            title="Scope 2 배출량 관리"
            description="간접 배출량 (전력, 스팀) 데이터를 관리하고 추적합니다"
            module="SCOPE"
            submodule="scope2"
          />
        </div>
      </div>

      {/* ========================================================================
          협력사 미선택 시 안내 메시지 (Partner Not Selected Message)
          - 협력사 선택을 유도하는 UI
          ======================================================================== */}
      <motion.div
        className="space-y-4"
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.7, duration: 0.6}}>
        {/* ==================================================================
              통계 카드들 (Statistics Cards)
              - 배출량 현황을 한눈에 볼 수 있는 대시보드
              ================================================================== */}

        {/* ========================================================================
          협력사 및 연도 선택 섹션 (Partner & Year Selection)
          - 데이터 조회를 위한 필터 조건 설정
          ======================================================================== */}
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.4, delay: 0.1}}>
          <Card className="mb-4 overflow-hidden shadow-sm">
            <CardContent className="p-4">
              <div className="grid items-center justify-center h-24 grid-cols-1 gap-8 md:grid-cols-3">
                {/* 총 Scope 1 배출량 카드 */}
                <Card className="justify-center h-24 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                  <CardContent className="flex items-center p-4">
                    <div className="p-2 mr-3 bg-blue-100 rounded-full">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        총 Scope 2 배출량
                      </p>
                      <h3 className="text-2xl font-bold">
                        {totalEmissions.toFixed(2)}
                        <span className="ml-1 text-sm font-normal text-gray-500">
                          tCO₂eq
                        </span>
                      </h3>
                    </div>
                  </CardContent>
                </Card>

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
                    className="w-full px-3 py-2 text-sm h-9 backdrop-blur-sm border-customG-200 focus:border-customG-400 focus:ring-customG-100 bg-white/80"
                  />
                </div>

                {/* 보고월 선택 드롭다운 (선택사항) */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-customG-700">
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
              데이터 카테고리 섹션 (Data Category Section)
              - 전력과 스팀 카테고리를 함께 표시
              ================================================================== */}
        <div className="space-y-8">
          {/* ================================================================
                전력 카테고리 섹션 (Electricity Category Section)
                ================================================================ */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5, delay: 0.2}}>
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-bold text-customG-800">전력 사용량</h2>
              <p className="text-sm text-customG-600">
                시설별 전력 소비량 및 배출량 관리
              </p>
            </div>
            {/* 전력 카테고리 선택 그리드 */}
            <CategorySelector
              categoryList={scope2ElectricCategoryList}
              getTotalEmission={getElectricTotalEmission}
              onCategorySelect={handleElectricCategorySelect}
              animationDelay={0.1}
            />
          </motion.div>

          {/* ================================================================
                스팀 카테고리 섹션 (Steam Category Section)
                ================================================================ */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5, delay: 0.4}}>
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-bold text-customG-800">스팀 사용량</h2>
              <p className="text-sm text-customG-600">
                시설별 스팀 소비량 및 배출량 관리
              </p>
            </div>
            {/* 스팀 카테고리 선택 그리드 */}
            <CategorySelector
              categoryList={scope2SteamCategoryList}
              getTotalEmission={getTotalEmission}
              onCategorySelect={handleCategorySelect}
              animationDelay={0.2}
            />
          </motion.div>
        </div>
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
        scope="SCOPE2"
      />
    </div>
  )
}
