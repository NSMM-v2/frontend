import {Factory, Car, Zap, Cloud} from 'lucide-react'
import type {
  EmissionActivityType,
  StationaryCombustionType,
  MobileCombustionType,
  SteamType,
  PurposeCategory
} from '@/types/scopeType'

/**
 * 배출 활동 유형별 상수 정의
 * Scope 1 (직접 배출): 고정연소, 이동연소
 * Scope 2 (간접 배출): 전력사용, 스팀사용
 */
export const EMISSION_ACTIVITY_TYPES: Array<{
  value: EmissionActivityType
  label: string
  description: string
  icon: React.ComponentType<any>
  scope: 'SCOPE1' | 'SCOPE2'
}> = [
  {
    value: 'STATIONARY_COMBUSTION',
    label: '고정연소',
    description: '보일러, 발전기 등 고정 설비에서의 연료 연소',
    icon: Factory,
    scope: 'SCOPE1'
  },
  {
    value: 'MOBILE_COMBUSTION',
    label: '이동연소',
    description: '차량, 선박, 항공기 등 이동수단의 연료 연소',
    icon: Car,
    scope: 'SCOPE1'
  },
  {
    value: 'ELECTRICITY',
    label: '전력사용',
    description: '외부에서 구매한 전력 사용',
    icon: Zap,
    scope: 'SCOPE2'
  },
  {
    value: 'STEAM',
    label: '스팀사용',
    description: '외부에서 구매한 스팀 사용',
    icon: Cloud,
    scope: 'SCOPE2'
  }
]

/**
 * 고정연소 유형별 연료 분류
 * subcategoryType과 매핑되어 연료 필터링에 사용
 */
export const STATIONARY_COMBUSTION_TYPES: Array<{
  value: StationaryCombustionType
  label: string
  description: string
}> = [
  {
    value: 'LIQUID',
    label: '액체연료',
    description: '경유, 중유, 등유 등 액체 상태의 연료'
  },
  {
    value: 'GAS',
    label: '가스연료',
    description: 'LNG, LPG, 천연가스 등 가스 상태의 연료'
  },
  {
    value: 'SOLID',
    label: '고체연료',
    description: '석탄, 목재, 바이오매스 등 고체 상태의 연료'
  }
]

/**
 * 이동연소 교통수단 유형
 * 각 유형별로 해당하는 연료가 다름
 */
export const MOBILE_COMBUSTION_TYPES: Array<{
  value: MobileCombustionType
  label: string
  description: string
}> = [
  {
    value: 'ROAD',
    label: '도로 교통',
    description: '승용차, 화물차, 버스 등 도로를 이용하는 차량'
  }
]

/**
 * 스팀 유형별 분류
 * 각 유형별로 다른 배출계수를 가짐
 */
export const STEAM_TYPES: Array<{
  value: SteamType
  label: string
  description: string
  factor: string
}> = [
  {
    value: 'TYPE_A',
    label: '타입 A',
    description: '고압 스팀 (압력 10기압 이상)',
    factor: '0.0851'
  },
  {
    value: 'TYPE_B',
    label: '타입 B',
    description: '중압 스팀 (압력 5-10기압)',
    factor: '0.0851'
  },
  {
    value: 'TYPE_C',
    label: '타입 C',
    description: '저압 스팀 (압력 5기압 미만)',
    factor: '0.0851'
  }
]

/**
 * 용도 구분 카테고리 (고정연소용)
 * 연료 사용 목적에 따른 분류로 배출계수 계산에 영향
 */
export const PURPOSE_CATEGORIES: Array<{
  value: PurposeCategory
  label: string
  description: string
}> = [
  {
    value: 'COMMERCIAL',
    label: '상업용',
    description: '사무실, 상점 등 상업적 목적의 사용'
  },
  {
    value: 'MANUFACTURING',
    label: '제조업용',
    description: '제조업, 공장 등 산업적 목적의 사용'
  },
  {
    value: 'ENERGY',
    label: '에너지용',
    description: '에너지 생산 및 공급 관련 사용'
  },
  {
    value: 'DOMESTIC',
    label: '가정용',
    description: '주택, 가정 등 개인 목적의 사용'
  }
]

/**
 * 이동연소용 용도 구분 카테고리
 * 차량 운행 목적에 따른 분류
 */
export const MOBILE_PURPOSE_CATEGORIES: Array<{
  value: PurposeCategory
  label: string
  description: string
}> = [
  {
    value: 'COMMERCIAL',
    label: '영업용',
    description: '택시, 버스, 화물운송 등 영업 목적의 운행'
  },
  {
    value: 'MANUFACTURING',
    label: '산업용',
    description: '공장 내 운송, 건설장비 등 산업 목적의 운행'
  },
  {
    value: 'DOMESTIC',
    label: '개인용',
    description: '개인 승용차, 개인 오토바이 등 개인 목적의 운행'
  },
  {
    value: 'ENERGY',
    label: '에너지용',
    description: '에너지 생산 및 운송 관련 차량 운행'
  }
]
