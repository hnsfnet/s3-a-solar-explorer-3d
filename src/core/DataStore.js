const PLANETS_DATA = [
  {
    name: 'Mercury',
    nameCN: '水星',
    diameter: 4879,
    distance: 57.9,
    orbitalPeriod: 88,
    rotationPeriod: 58.6,
    color: 0xb5b5b5,
    hasRings: false,
    eccentricity: 0.206,
    description: '太阳系中最小的行星，也是距离太阳最近的行星。'
  },
  {
    name: 'Venus',
    nameCN: '金星',
    diameter: 12104,
    distance: 108.2,
    orbitalPeriod: 225,
    rotationPeriod: 243,
    color: 0xffc649,
    hasRings: false,
    eccentricity: 0.007,
    description: '太阳系中最热的行星，表面温度可达 465°C。'
  },
  {
    name: 'Earth',
    nameCN: '地球',
    diameter: 12742,
    distance: 149.6,
    orbitalPeriod: 365,
    rotationPeriod: 1,
    color: 0x6b93d6,
    hasRings: false,
    eccentricity: 0.017,
    description: '我们的家园，目前已知唯一存在生命的星球。'
  },
  {
    name: 'Mars',
    nameCN: '火星',
    diameter: 6779,
    distance: 227.9,
    orbitalPeriod: 687,
    rotationPeriod: 1.03,
    color: 0xc1440e,
    hasRings: false,
    eccentricity: 0.093,
    description: '红色星球，人类探索的下一个目标。'
  },
  {
    name: 'Jupiter',
    nameCN: '木星',
    diameter: 139820,
    distance: 778.5,
    orbitalPeriod: 4333,
    rotationPeriod: 0.41,
    color: 0xd8ca9d,
    hasRings: false,
    eccentricity: 0.049,
    description: '太阳系最大的行星，质量是其他行星总和的 2.5 倍。'
  },
  {
    name: 'Saturn',
    nameCN: '土星',
    diameter: 116460,
    distance: 1434,
    orbitalPeriod: 10759,
    rotationPeriod: 0.44,
    color: 0xf4d59e,
    hasRings: true,
    eccentricity: 0.057,
    description: '以其壮观的光环系统而闻名，密度比水还小。'
  },
  {
    name: 'Uranus',
    nameCN: '天王星',
    diameter: 50724,
    distance: 2871,
    orbitalPeriod: 30687,
    rotationPeriod: 0.72,
    color: 0xd1e7e7,
    hasRings: false,
    eccentricity: 0.046,
    description: '自转轴倾斜 98 度，几乎是"躺着"公转的行星。'
  },
  {
    name: 'Neptune',
    nameCN: '海王星',
    diameter: 49244,
    distance: 4495,
    orbitalPeriod: 60190,
    rotationPeriod: 0.67,
    color: 0x5b5ddf,
    hasRings: false,
    eccentricity: 0.011,
    description: '太阳系最远的行星，风速可达 2100 km/h。'
  }
]

const SUN_DATA = {
  name: 'Sun',
  nameCN: '太阳',
  diameter: 1392700,
  color: 0xffdd00,
  description: '太阳系的中心恒星，占太阳系总质量的 99.86%。'
}

const SCALE_FACTORS = {
  SIZE_SCALE: 0.00005,
  DISTANCE_SCALE: 0.008,
  TIME_SCALE: 0.001,
  SIZE_MULTIPLIER: 8
}

export const DataStore = {
  getPlanets() {
    return PLANETS_DATA.map(planet => ({
      ...planet,
      scaledSize: Math.max(planet.diameter * SCALE_FACTORS.SIZE_SCALE * SCALE_FACTORS.SIZE_MULTIPLIER, 0.3),
      scaledDistance: planet.distance * SCALE_FACTORS.DISTANCE_SCALE + 5,
      scaledOrbitalSpeed: (2 * Math.PI) / (planet.orbitalPeriod * SCALE_FACTORS.TIME_SCALE * 60),
      scaledRotationSpeed: (2 * Math.PI) / (planet.rotationPeriod * SCALE_FACTORS.TIME_SCALE * 60 * 10)
    }))
  },

  getSun() {
    return {
      ...SUN_DATA,
      scaledSize: SUN_DATA.diameter * SCALE_FACTORS.SIZE_SCALE * SCALE_FACTORS.SIZE_MULTIPLIER * 0.8
    }
  },

  getPlanetByName(name) {
    return this.getPlanets().find(p => p.name === name)
  },

  getScaleFactors() {
    return SCALE_FACTORS
  }
}
