// 연료 데이터 상수 정의 (scope.md 완전 준수 버전)
import {FuelType, EmissionFactorByPurpose} from '@/types/scopeType'

// 지구온난화지수 (Global Warming Potential) - scope.md 기준
export const GWP = {
  CH4: 21, // 메탄
  N2O: 310 // 아산화질소
} as const

// 이동연소 배출계수 (CO2/CH4/N2O)
export interface MobileEmissionFactors {
  co2: number
  ch4: number
  n2o: number
}

// scope.md 완전 준수 연료 데이터
export const FUEL_DATA: Record<string, FuelType> = {
  // === 액체연료 (Liquid Fuels) - scope.md 표 기준 ===

  CRUDE_OIL: {
    id: 'CRUDE_OIL',
    name: '원유',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    gcv: 44.9,
    ncv: 42.2,
    co2Factor: 73300,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    }
  },

  ORIMULSION: {
    id: 'ORIMULSION',
    name: '오리멀전',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    ncv: 27.5,
    co2Factor: 77000,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    }
  },

  NGL: {
    id: 'NGL',
    name: '천연가스액',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    ncv: 44.2,
    co2Factor: 64200,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    }
  },

  GASOLINE: {
    id: 'GASOLINE',
    name: '휘발유',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'MOBILE_COMBUSTION',
    subcategoryType: 'LIQUID',
    gcv: 32.6,
    ncv: 30.3,
    co2Factor: 69300,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    },
    mobileEmissionFactors: {
      co2: 69300,
      ch4: 25,
      n2o: 8.0
    }
  },

  AVIATION_GASOLINE: {
    id: 'AVIATION_GASOLINE',
    name: '항공유',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    gcv: 36.5,
    ncv: 34.1,
    co2Factor: 70000,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    }
  },

  JET_FUEL_GASOLINE: {
    id: 'JET_FUEL_GASOLINE',
    name: '제트용 가솔린(IP-8)',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    ncv: 44.3,
    co2Factor: 70000,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    }
  },

  JET_FUEL_KEROSENE: {
    id: 'JET_FUEL_KEROSENE',
    name: '제트용 등유(JET A-1)',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    ncv: 44.1,
    co2Factor: 71500,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    }
  },

  KEROSENE: {
    id: 'KEROSENE',
    name: '실내등유',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'MOBILE_COMBUSTION',
    subcategoryType: 'LIQUID',
    gcv: 36.8,
    ncv: 34.3,
    co2Factor: 71900,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    },
    mobileEmissionFactors: {
      co2: 71900,
      ch4: 0,
      n2o: 0
    }
  },

  SHALE_OIL: {
    id: 'SHALE_OIL',
    name: '혈암유',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    ncv: 38.1,
    co2Factor: 73300,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    }
  },

  DIESEL: {
    id: 'DIESEL',
    name: '가스/디젤 오일(경유)',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'MOBILE_COMBUSTION',
    subcategoryType: 'LIQUID',
    gcv: 37.7,
    ncv: 35.3,
    co2Factor: 74100,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    },
    mobileEmissionFactors: {
      co2: 74100,
      ch4: 3.9,
      n2o: 3.9
    }
  },

  BOILER_KEROSENE: {
    id: 'BOILER_KEROSENE',
    name: '보일러 등유',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'MOBILE_COMBUSTION',
    subcategoryType: 'LIQUID',
    gcv: 36.8,
    ncv: 34.3,
    co2Factor: 71900,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    },
    mobileEmissionFactors: {
      co2: 71900,
      ch4: 0,
      n2o: 0
    }
  },

  ETHANE: {
    id: 'ETHANE',
    name: '에탄',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    ncv: 46.4,
    co2Factor: 61600,
    ch4Factor: {
      energy: 1,
      manufacturing: 1,
      commercial: 5,
      domestic: 5
    },
    n2oFactor: {
      energy: 0.1,
      manufacturing: 0.1,
      commercial: 0.1,
      domestic: 0.1
    }
  },

  NAPHTHA: {
    id: 'NAPHTHA',
    name: '나프타(납사)',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    gcv: 32.3,
    ncv: 30.3,
    co2Factor: 73300,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    }
  },

  BITUMEN: {
    id: 'BITUMEN',
    name: '역청(아스팔트)',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    gcv: 41.5,
    ncv: 39.2,
    co2Factor: 80700,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    }
  },

  LUBRICANTS: {
    id: 'LUBRICANTS',
    name: '윤활유',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'MOBILE_COMBUSTION',
    subcategoryType: 'LIQUID',
    gcv: 39.8,
    ncv: 37.0,
    co2Factor: 73300,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    },
    mobileEmissionFactors: {
      co2: 73300,
      ch4: 0,
      n2o: 0
    }
  },

  REFINERY_FEEDSTOCK: {
    id: 'REFINERY_FEEDSTOCK',
    name: '정유공장 원료(정제연료)',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    ncv: 43.0,
    co2Factor: 73300,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    }
  },

  REFINERY_GAS: {
    id: 'REFINERY_GAS',
    name: '정유가스(정제가스)',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    ncv: 49.5,
    co2Factor: 57600,
    ch4Factor: {
      energy: 1,
      manufacturing: 1,
      commercial: 5,
      domestic: 5
    },
    n2oFactor: {
      energy: 0.1,
      manufacturing: 0.1,
      commercial: 0.1,
      domestic: 0.1
    }
  },

  PARAFFIN_WAXES: {
    id: 'PARAFFIN_WAXES',
    name: '접착제(파라핀왁스)',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    ncv: 40.2,
    co2Factor: 73300,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    }
  },

  WHITE_SPIRIT: {
    id: 'WHITE_SPIRIT',
    name: '백유(용제)',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    gcv: 33.3,
    ncv: 31.0,
    co2Factor: 73300,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    }
  },

  B_A_OIL: {
    id: 'B_A_OIL',
    name: 'B-A유',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    gcv: 38.9,
    ncv: 36.4,
    co2Factor: 74100,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    }
  },

  B_B_OIL: {
    id: 'B_B_OIL',
    name: 'B-B유',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    gcv: 40.5,
    ncv: 38.0,
    co2Factor: 77400,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    }
  },

  B_C_OIL: {
    id: 'B_C_OIL',
    name: 'B-C유',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    gcv: 41.6,
    ncv: 39.2,
    co2Factor: 77400,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    }
  },

  OTHER_PETROLEUM_PRODUCTS: {
    id: 'OTHER_PETROLEUM_PRODUCTS',
    name: '기타석유제품(기타)',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    ncv: 40.2,
    co2Factor: 73300,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    }
  },

  OTHER_LIQUID_FUEL: {
    id: 'OTHER_LIQUID_FUEL',
    name: '기타액체연료',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    ncv: 0, // 데이터 미제공
    co2Factor: 0,
    ch4Factor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    },
    n2oFactor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    }
  },

  BY_PRODUCT_FUEL_1: {
    id: 'BY_PRODUCT_FUEL_1',
    name: '부생연료 1호',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    gcv: 36.9,
    ncv: 34.3,
    co2Factor: 72000,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    }
  },

  BY_PRODUCT_FUEL_2: {
    id: 'BY_PRODUCT_FUEL_2',
    name: '부생연료 2호',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    gcv: 40.0,
    ncv: 37.9,
    co2Factor: 77000,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    }
  },

  BIOETHANOL: {
    id: 'BIOETHANOL',
    name: '바이오에탄올',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    ncv: 27.0,
    co2Factor: 70800,
    ch4Factor: {
      energy: 1,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    }
  },

  BIODIESEL: {
    id: 'BIODIESEL',
    name: '바이오디젤',
    category: 'LIQUID_PETROLEUM',
    unit: 'kL',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'LIQUID',
    gcv: 38.53,
    ncv: 27.0,
    co2Factor: 70800,
    ch4Factor: {
      energy: 1,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    }
  },

  // === 고체연료 (Solid Fuels) - scope.md 표 기준 ===

  PETROLEUM_COKE: {
    id: 'PETROLEUM_COKE',
    name: '석유 코크스(석유코크)',
    category: 'SOLID_PETROLEUM',
    unit: '톤',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'SOLID',
    gcv: 33.5,
    ncv: 31.6,
    co2Factor: 97500,
    ch4Factor: {
      energy: 3,
      manufacturing: 3,
      commercial: 10,
      domestic: 10
    },
    n2oFactor: {
      energy: 0.6,
      manufacturing: 0.6,
      commercial: 0.6,
      domestic: 0.6
    }
  },

  PROPANE: {
    id: 'PROPANE',
    name: '프로판',
    category: 'SOLID_PETROLEUM',
    unit: '톤',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'SOLID',
    gcv: 50.4,
    ncv: 46.3,
    co2Factor: 63100,
    ch4Factor: {
      energy: 1,
      manufacturing: 1,
      commercial: 5,
      domestic: 5
    },
    n2oFactor: {
      energy: 0.1,
      manufacturing: 0.1,
      commercial: 0.1,
      domestic: 0.1
    }
  },

  BUTANE: {
    id: 'BUTANE',
    name: '부탄',
    category: 'SOLID_PETROLEUM',
    unit: '톤',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'SOLID',
    gcv: 49.6,
    ncv: 45.6,
    co2Factor: 63100,
    ch4Factor: {
      energy: 1,
      manufacturing: 1,
      commercial: 5,
      domestic: 5
    },
    n2oFactor: {
      energy: 0.1,
      manufacturing: 0.1,
      commercial: 0.1,
      domestic: 0.1
    }
  },

  DOMESTIC_ANTHRACITE: {
    id: 'DOMESTIC_ANTHRACITE',
    name: '국내무연탄',
    category: 'SOLID_PETROLEUM',
    unit: '톤',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'SOLID',
    gcv: 18.9,
    ncv: 18.6,
    co2Factor: 98300,
    ch4Factor: {
      energy: 1,
      manufacturing: 10,
      commercial: 10,
      domestic: 300
    },
    n2oFactor: {
      energy: 1.5,
      manufacturing: 1.5,
      commercial: 1.5,
      domestic: 1.5
    }
  },

  IMPORTED_ANTHRACITE: {
    id: 'IMPORTED_ANTHRACITE',
    name: '수입무연탄',
    category: 'SOLID_PETROLEUM',
    unit: '톤',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'SOLID',
    gcv: 24.7,
    ncv: 24.4,
    co2Factor: 98300,
    ch4Factor: {
      energy: 1,
      manufacturing: 10,
      commercial: 10,
      domestic: 300
    },
    n2oFactor: {
      energy: 1.5,
      manufacturing: 1.5,
      commercial: 1.5,
      domestic: 1.5
    }
  },

  COKING_COAL: {
    id: 'COKING_COAL',
    name: '원료용 유연탄',
    category: 'SOLID_PETROLEUM',
    unit: '톤',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'SOLID',
    gcv: 29.3,
    ncv: 28.2,
    co2Factor: 94600,
    ch4Factor: {
      energy: 1,
      manufacturing: 10,
      commercial: 10,
      domestic: 300
    },
    n2oFactor: {
      energy: 1.5,
      manufacturing: 1.5,
      commercial: 1.5,
      domestic: 1.5
    }
  },

  STEAM_COAL: {
    id: 'STEAM_COAL',
    name: '연료용 유연탄',
    category: 'SOLID_PETROLEUM',
    unit: '톤',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'SOLID',
    gcv: 25.8,
    ncv: 24.7,
    co2Factor: 94600,
    ch4Factor: {
      energy: 1,
      manufacturing: 10,
      commercial: 10,
      domestic: 300
    },
    n2oFactor: {
      energy: 1.5,
      manufacturing: 1.5,
      commercial: 1.5,
      domestic: 1.5
    }
  },

  SUB_BITUMINOUS_COAL: {
    id: 'SUB_BITUMINOUS_COAL',
    name: '하위 역청탄(아역청탄)',
    category: 'SOLID_PETROLEUM',
    unit: '톤',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'SOLID',
    gcv: 22.7,
    ncv: 21.4,
    co2Factor: 96100,
    ch4Factor: {
      energy: 1,
      manufacturing: 10,
      commercial: 10,
      domestic: 300
    },
    n2oFactor: {
      energy: 1.5,
      manufacturing: 1.5,
      commercial: 1.5,
      domestic: 1.5
    }
  },

  LIGNITE: {
    id: 'LIGNITE',
    name: '갈탄',
    category: 'SOLID_PETROLEUM',
    unit: '톤',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'SOLID',
    ncv: 11.9,
    co2Factor: 101000,
    ch4Factor: {
      energy: 1,
      manufacturing: 10,
      commercial: 10,
      domestic: 300
    },
    n2oFactor: {
      energy: 1.5,
      manufacturing: 1.5,
      commercial: 1.5,
      domestic: 1.5
    }
  },

  COKE: {
    id: 'COKE',
    name: '코크스',
    category: 'SOLID_PETROLEUM',
    unit: '톤',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'SOLID',
    gcv: 29.1,
    ncv: 28.9,
    co2Factor: 107000,
    ch4Factor: {
      energy: 1,
      manufacturing: 10,
      commercial: 10,
      domestic: 300
    },
    n2oFactor: {
      energy: 1.5,
      manufacturing: 1.5,
      commercial: 1.5,
      domestic: 1.5
    }
  },

  OTHER_SOLID_FUEL: {
    id: 'OTHER_SOLID_FUEL',
    name: '기타 고체연료',
    category: 'SOLID_PETROLEUM',
    unit: '톤',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'SOLID',
    ncv: 0, // 데이터 미제공
    co2Factor: 0,
    ch4Factor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    },
    n2oFactor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    }
  },

  LPG_VEHICLE: {
    id: 'LPG_VEHICLE',
    name: 'LPG (차량용)',
    category: 'SOLID_PETROLEUM',
    unit: '톤',
    emissionActivityType: 'STATIONARY_COMBUSTION', // scope.md에서 이동연소 데이터 없음
    subcategoryType: 'SOLID',
    gcv: 63.6,
    ncv: 58.4,
    co2Factor: 0, // 데이터 미제공
    ch4Factor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    },
    n2oFactor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    }
  },

  LNG_SOLID: {
    id: 'LNG_SOLID',
    name: '천연가스(LNG)',
    category: 'SOLID_PETROLEUM',
    unit: '톤',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'SOLID',
    gcv: 54.6,
    ncv: 49.3,
    co2Factor: 56100,
    ch4Factor: {
      energy: 1,
      manufacturing: 1,
      commercial: 5,
      domestic: 5
    },
    n2oFactor: {
      energy: 0.1,
      manufacturing: 0.1,
      commercial: 0.1,
      domestic: 0.1
    }
  },

  // 바이오매스 관련 고체연료
  WASTE_WOOD: {
    id: 'WASTE_WOOD',
    name: '폐목재',
    category: 'SOLID_PETROLEUM',
    unit: '톤',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'SOLID',
    ncv: 15.6,
    co2Factor: 112000,
    ch4Factor: {
      energy: 30,
      manufacturing: 30,
      commercial: 300,
      domestic: 300
    },
    n2oFactor: {
      energy: 4,
      manufacturing: 4,
      commercial: 4,
      domestic: 4
    }
  },

  BIOGAS: {
    id: 'BIOGAS',
    name: '바이오가스',
    category: 'SOLID_PETROLEUM',
    unit: '톤',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'SOLID',
    ncv: 50.4,
    co2Factor: 54600,
    ch4Factor: {
      energy: 1,
      manufacturing: 1,
      commercial: 5,
      domestic: 5
    },
    n2oFactor: {
      energy: 0.1,
      manufacturing: 0.1,
      commercial: 0.1,
      domestic: 0.1
    }
  },

  FIREWOOD: {
    id: 'FIREWOOD',
    name: '땔감',
    category: 'SOLID_PETROLEUM',
    unit: '톤',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'SOLID',
    ncv: 15.6,
    co2Factor: 0, // 바이오매스 - 배출계수 0
    ch4Factor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    },
    n2oFactor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    }
  },

  WOOD_CHIPS: {
    id: 'WOOD_CHIPS',
    name: '우드칩',
    category: 'SOLID_PETROLEUM',
    unit: '톤',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'SOLID',
    ncv: 15.6,
    co2Factor: 0, // 바이오매스 - 배출계수 0
    ch4Factor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    },
    n2oFactor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    }
  },

  CHARCOAL: {
    id: 'CHARCOAL',
    name: '목탄',
    category: 'SOLID_PETROLEUM',
    unit: '톤',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'SOLID',
    ncv: 29.5,
    co2Factor: 112000,
    ch4Factor: {
      energy: 3,
      manufacturing: 200,
      commercial: 200,
      domestic: 200
    },
    n2oFactor: {
      energy: 4,
      manufacturing: 1,
      commercial: 1,
      domestic: 1
    }
  },

  RDF: {
    id: 'RDF',
    name: 'RDF',
    category: 'SOLID_PETROLEUM',
    unit: '톤',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'SOLID',
    ncv: 11.6,
    co2Factor: 0, // 바이오매스 - 배출계수 0
    ch4Factor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    },
    n2oFactor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    }
  },

  RPF: {
    id: 'RPF',
    name: 'RPF',
    category: 'SOLID_PETROLEUM',
    unit: '톤',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'SOLID',
    ncv: 11.6,
    co2Factor: 0, // 바이오매스 - 배출계수 0
    ch4Factor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    },
    n2oFactor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    }
  },

  // === 기체연료 (Gas Fuels) - scope.md 표 기준 ===

  LPG: {
    id: 'LPG',
    name: '액화석유가스(LPG)',
    category: 'GASEOUS_PETROLEUM',
    unit: '천㎥',
    emissionActivityType: 'MOBILE_COMBUSTION',
    subcategoryType: 'GAS',
    gcv: 62.8,
    ncv: 57.7,
    co2Factor: 63100,
    ch4Factor: {
      energy: 1,
      manufacturing: 1,
      commercial: 5,
      domestic: 5
    },
    n2oFactor: {
      energy: 0.1,
      manufacturing: 0.1,
      commercial: 0.1,
      domestic: 0.1
    },
    mobileEmissionFactors: {
      co2: 63100,
      ch4: 62,
      n2o: 0.2
    }
  },

  LNG_VEHICLE: {
    id: 'LNG_VEHICLE',
    name: 'LNG (차량용)',
    category: 'GASEOUS_PETROLEUM',
    unit: '천㎥',
    emissionActivityType: 'MOBILE_COMBUSTION',
    subcategoryType: 'GAS',
    gcv: 43.6,
    ncv: 39.4,
    co2Factor: 0, // 고정연소 데이터 없음
    ch4Factor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    },
    n2oFactor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    },
    mobileEmissionFactors: {
      co2: 56100,
      ch4: 92,
      n2o: 3.0
    }
  },

  CNG_VEHICLE: {
    id: 'CNG_VEHICLE',
    name: 'CNG (차량용)',
    category: 'GASEOUS_PETROLEUM',
    unit: '천㎥',
    emissionActivityType: 'MOBILE_COMBUSTION',
    subcategoryType: 'GAS',
    gcv: 43.6,
    ncv: 39.4,
    co2Factor: 0, // 고정연소 데이터 없음
    ch4Factor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    },
    n2oFactor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    },
    mobileEmissionFactors: {
      co2: 56100,
      ch4: 92,
      n2o: 3.0
    }
  },

  NATURAL_GAS: {
    id: 'NATURAL_GAS',
    name: '천연가스(LNG)',
    category: 'GASEOUS_PETROLEUM',
    unit: '천㎥',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'GAS',
    gcv: 54.6,
    ncv: 49.3,
    co2Factor: 56100,
    ch4Factor: {
      energy: 1,
      manufacturing: 1,
      commercial: 5,
      domestic: 5
    },
    n2oFactor: {
      energy: 0.1,
      manufacturing: 0.1,
      commercial: 0.1,
      domestic: 0.1
    }
  },

  COKE_OVEN_GAS: {
    id: 'COKE_OVEN_GAS',
    name: '코크스가스',
    category: 'GASEOUS_PETROLEUM',
    unit: '천㎥',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'GAS',
    ncv: 37.8,
    co2Factor: 44400,
    ch4Factor: {
      energy: 1,
      manufacturing: 1,
      commercial: 5,
      domestic: 5
    },
    n2oFactor: {
      energy: 0.1,
      manufacturing: 0.1,
      commercial: 0.1,
      domestic: 0.1
    }
  },

  BLAST_FURNACE_GAS: {
    id: 'BLAST_FURNACE_GAS',
    name: '고로가스',
    category: 'GASEOUS_PETROLEUM',
    unit: '천㎥',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'GAS',
    ncv: 2.47,
    co2Factor: 260000,
    ch4Factor: {
      energy: 1,
      manufacturing: 1,
      commercial: 5,
      domestic: 5
    },
    n2oFactor: {
      energy: 0.1,
      manufacturing: 0.1,
      commercial: 0.1,
      domestic: 0.1
    }
  },

  CONVERTER_GAS: {
    id: 'CONVERTER_GAS',
    name: '전로가스',
    category: 'GASEOUS_PETROLEUM',
    unit: '천㎥',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'GAS',
    ncv: 7.06,
    co2Factor: 0, // 데이터 미제공
    ch4Factor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    },
    n2oFactor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    }
  },

  CITY_GAS_LNG: {
    id: 'CITY_GAS_LNG',
    name: '도시가스(LNG)',
    category: 'GASEOUS_PETROLEUM',
    unit: '천㎥',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'GAS',
    gcv: 43.6,
    ncv: 39.4,
    co2Factor: 56100,
    ch4Factor: {
      energy: 1,
      manufacturing: 1,
      commercial: 5,
      domestic: 5
    },
    n2oFactor: {
      energy: 0.1,
      manufacturing: 0.1,
      commercial: 0.1,
      domestic: 0.1
    }
  },

  CITY_GAS_LPG: {
    id: 'CITY_GAS_LPG',
    name: '도시가스(LPG)',
    category: 'GASEOUS_PETROLEUM',
    unit: '천㎥',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'GAS',
    gcv: 62.8,
    ncv: 57.7,
    co2Factor: 63100,
    ch4Factor: {
      energy: 1,
      manufacturing: 1,
      commercial: 5,
      domestic: 5
    },
    n2oFactor: {
      energy: 0.1,
      manufacturing: 0.1,
      commercial: 0.1,
      domestic: 0.1
    }
  },

  OTHER_GAS_FUEL: {
    id: 'OTHER_GAS_FUEL',
    name: '기타 기체연료',
    category: 'GASEOUS_PETROLEUM',
    unit: '천㎥',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'GAS',
    ncv: 0, // 데이터 미제공
    co2Factor: 0,
    ch4Factor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    },
    n2oFactor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    }
  },

  LANDFILL_GAS: {
    id: 'LANDFILL_GAS',
    name: '매립지가스(LFG)',
    category: 'GASEOUS_PETROLEUM',
    unit: '천㎥',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'GAS',
    ncv: 50.4,
    co2Factor: 54600,
    ch4Factor: {
      energy: 30,
      manufacturing: 1,
      commercial: 5,
      domestic: 5
    },
    n2oFactor: {
      energy: 0.1,
      manufacturing: 0.1,
      commercial: 0.1,
      domestic: 0.1
    }
  },

  WASTE_GASIFICATION: {
    id: 'WASTE_GASIFICATION',
    name: '폐기물 유화/가스화 등',
    category: 'GASEOUS_PETROLEUM',
    unit: '천㎥',
    emissionActivityType: 'STATIONARY_COMBUSTION',
    subcategoryType: 'GAS',
    ncv: 11.6,
    co2Factor: 0, // 바이오매스 - 배출계수 0
    ch4Factor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    },
    n2oFactor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    }
  },

  // === 전력 및 스팀 ===

  ELECTRICITY: {
    id: 'ELECTRICITY',
    name: '전기',
    category: 'ENERGY',
    unit: 'kWh',
    emissionActivityType: 'ELECTRICITY',
    subcategoryType: 'ELECTRICITY',
    ncv: 9.6,
    co2Factor: 0.4653,
    ch4Factor: {
      energy: 0.0000054,
      manufacturing: 0.0000054,
      commercial: 0.0000054,
      domestic: 0.0000054
    },
    n2oFactor: {
      energy: 0.0000027,
      manufacturing: 0.0000027,
      commercial: 0.0000027,
      domestic: 0.0000027
    }
  },

  STEAM_A: {
    id: 'STEAM_A',
    name: '스팀 A타입',
    category: 'ENERGY',
    unit: 'GJ',
    emissionActivityType: 'STEAM',
    subcategoryType: 'STEAM',
    ncv: 1,
    co2Factor: 56.452,
    ch4Factor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    },
    n2oFactor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    }
  },

  STEAM_B: {
    id: 'STEAM_B',
    name: '스팀 B타입',
    category: 'ENERGY',
    unit: 'GJ',
    emissionActivityType: 'STEAM',
    subcategoryType: 'STEAM',
    ncv: 1,
    co2Factor: 60.974,
    ch4Factor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    },
    n2oFactor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    }
  },

  STEAM_C: {
    id: 'STEAM_C',
    name: '스팀 C타입',
    category: 'ENERGY',
    unit: 'GJ',
    emissionActivityType: 'STEAM',
    subcategoryType: 'STEAM',
    ncv: 1,
    co2Factor: 59.685,
    ch4Factor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    },
    n2oFactor: {
      energy: 0,
      manufacturing: 0,
      commercial: 0,
      domestic: 0
    }
  }
}

// 활동 유형별 연료 그룹핑 (scope.md 기준 정확한 분류)
export const FUELS_BY_ACTIVITY_TYPE = {
  STATIONARY_COMBUSTION: {
    LIQUID: [
      'CRUDE_OIL',
      'ORIMULSION',
      'NGL',
      'AVIATION_GASOLINE',
      'JET_FUEL_GASOLINE',
      'JET_FUEL_KEROSENE',
      'SHALE_OIL',
      'ETHANE',
      'NAPHTHA',
      'BITUMEN',
      'REFINERY_FEEDSTOCK',
      'REFINERY_GAS',
      'PARAFFIN_WAXES',
      'WHITE_SPIRIT',
      'B_A_OIL',
      'B_B_OIL',
      'B_C_OIL',
      'OTHER_PETROLEUM_PRODUCTS',
      'OTHER_LIQUID_FUEL',
      'BY_PRODUCT_FUEL_1',
      'BY_PRODUCT_FUEL_2',
      'BIOETHANOL',
      'BIODIESEL'
    ],
    SOLID: [
      'PETROLEUM_COKE',
      'PROPANE',
      'BUTANE',
      'DOMESTIC_ANTHRACITE',
      'IMPORTED_ANTHRACITE',
      'COKING_COAL',
      'STEAM_COAL',
      'SUB_BITUMINOUS_COAL',
      'LIGNITE',
      'COKE',
      'OTHER_SOLID_FUEL',
      'LPG_VEHICLE',
      'LNG_SOLID',
      'WASTE_WOOD',
      'BIOGAS',
      'FIREWOOD',
      'WOOD_CHIPS',
      'CHARCOAL',
      'RDF',
      'RPF'
    ],
    GAS: [
      'NATURAL_GAS',
      'COKE_OVEN_GAS',
      'BLAST_FURNACE_GAS',
      'CONVERTER_GAS',
      'CITY_GAS_LNG',
      'CITY_GAS_LPG',
      'OTHER_GAS_FUEL',
      'LANDFILL_GAS',
      'WASTE_GASIFICATION'
    ]
  },
  MOBILE_COMBUSTION: {
    ROAD: [
      'GASOLINE',
      'KEROSENE',
      'DIESEL',
      'BOILER_KEROSENE',
      'LUBRICANTS',
      'LPG',
      'LNG_VEHICLE',
      'CNG_VEHICLE'
    ]
  },
  ELECTRICITY: ['ELECTRICITY'],
  STEAM: ['STEAM_A', 'STEAM_B', 'STEAM_C']
} as const

// 용도 구분 매핑 (고정연소 CH4/N2O에만 적용)
export const PURPOSE_CATEGORIES = {
  ENERGY: 'energy',
  MANUFACTURING: 'manufacturing',
  COMMERCIAL: 'commercial',
  DOMESTIC: 'domestic'
} as const

// 이동연소 타입 (scope.md 분석 결과 ROAD만 해당)
export const MOBILE_COMBUSTION_TYPES = {
  ROAD: 'ROAD'
} as const

// 스팀 타입
export const STEAM_TYPES = {
  A: 'A',
  B: 'B',
  C: 'C'
} as const

// 연료별 이동연소 배출계수 매핑 (scope.md에서 이동연소 컬럼에 데이터가 있는 연료만)
export const MOBILE_EMISSION_FACTORS: Record<string, MobileEmissionFactors> = {
  GASOLINE: {co2: 69300, ch4: 25, n2o: 8.0},
  KEROSENE: {co2: 71900, ch4: 0, n2o: 0},
  DIESEL: {co2: 74100, ch4: 3.9, n2o: 3.9},
  BOILER_KEROSENE: {co2: 71900, ch4: 0, n2o: 0},
  LUBRICANTS: {co2: 73300, ch4: 0, n2o: 0},
  LPG: {co2: 63100, ch4: 62, n2o: 0.2},
  LNG_VEHICLE: {co2: 56100, ch4: 92, n2o: 3.0},
  CNG_VEHICLE: {co2: 56100, ch4: 92, n2o: 3.0}
} as const

// =============================================================================
// 헬퍼 함수 (Helper Functions)
// =============================================================================

/**
 * 모든 연료 목록을 배열로 반환합니다
 */
export const getAllFuels = (): FuelType[] => {
  return Object.values(FUEL_DATA)
}

/**
 * 연료 ID로 연료 정보를 조회합니다
 */
export const getFuelById = (fuelId: string): FuelType | null => {
  return FUEL_DATA[fuelId] || null
}

/**
 * 배출활동 타입별 연료 목록을 반환합니다
 */
export const getFuelsByActivityType = (
  activityType: string,
  subType?: string
): FuelType[] => {
  return Object.values(FUEL_DATA).filter(fuel => {
    if (fuel.emissionActivityType !== activityType) {
      return false
    }

    if (subType && fuel.subcategoryType !== subType) {
      return false
    }

    return true
  })
}

/**
 * 용도별 배출계수를 가져옵니다 (고정연소 CH4/N2O용)
 */
export const getEmissionFactorByPurpose = (
  factorObj: EmissionFactorByPurpose | number | undefined,
  purposeCategory?: string
): number => {
  if (typeof factorObj === 'number') {
    return factorObj
  }

  if (!factorObj || !purposeCategory) {
    return 0
  }

  switch (purposeCategory) {
    case 'energy':
    case 'ENERGY':
      return factorObj.energy || 0
    case 'manufacturing':
    case 'MANUFACTURING':
      return factorObj.manufacturing || 0
    case 'commercial':
    case 'COMMERCIAL':
      return factorObj.commercial || 0
    case 'domestic':
    case 'DOMESTIC':
      return factorObj.domestic || 0
    default:
      return factorObj.energy || 0 // 기본값
  }
}

export default FUEL_DATA
