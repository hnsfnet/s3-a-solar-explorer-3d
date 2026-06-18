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
    mass: 0.055,
    surfaceTemp: 167,
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
    mass: 0.815,
    surfaceTemp: 464,
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
    mass: 1,
    surfaceTemp: 15,
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
    mass: 0.107,
    surfaceTemp: -65,
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
    mass: 317.8,
    surfaceTemp: -110,
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
    mass: 95.2,
    surfaceTemp: -140,
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
    mass: 14.5,
    surfaceTemp: -195,
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
    mass: 17.1,
    surfaceTemp: -200,
    description: '太阳系最远的行星，风速可达 2100 km/h。'
  }
]

const SUN_DATA = {
  name: 'Sun',
  nameCN: '太阳',
  diameter: 1392700,
  color: 0xffdd00,
  mass: 333000,
  surfaceTemp: 5500,
  description: '太阳系的中心恒星，占太阳系总质量的 99.86%。'
}

const MOONS_DATA = [
  {
    name: 'Moon',
    nameCN: '月球',
    parentName: 'Earth',
    diameter: 3474,
    distanceFromParent: 0.384,
    orbitalPeriod: 27.3,
    rotationPeriod: 27.3,
    color: 0xcccccc,
    eccentricity: 0.055,
    mass: 0.0123,
    surfaceTemp: -20,
    description: '地球唯一的天然卫星，是人类探索的第一个地外天体。'
  },
  {
    name: 'Io',
    nameCN: '木卫一',
    parentName: 'Jupiter',
    diameter: 3643,
    distanceFromParent: 0.422,
    orbitalPeriod: 1.77,
    rotationPeriod: 1.77,
    color: 0xffe066,
    eccentricity: 0.004,
    mass: 0.015,
    surfaceTemp: -143,
    description: '木星的四颗伽利略卫星之一，太阳系中火山活动最活跃的天体。'
  },
  {
    name: 'Europa',
    nameCN: '木卫二',
    parentName: 'Jupiter',
    diameter: 3122,
    distanceFromParent: 0.671,
    orbitalPeriod: 3.55,
    rotationPeriod: 3.55,
    color: 0xe0d5a0,
    eccentricity: 0.009,
    mass: 0.008,
    surfaceTemp: -170,
    description: '木星的四颗伽利略卫星之一，冰层下可能存在液态水海洋。'
  },
  {
    name: 'Ganymede',
    nameCN: '木卫三',
    parentName: 'Jupiter',
    diameter: 5268,
    distanceFromParent: 1.07,
    orbitalPeriod: 7.15,
    rotationPeriod: 7.15,
    color: 0xa8a090,
    eccentricity: 0.001,
    mass: 0.025,
    surfaceTemp: -160,
    description: '木星的四颗伽利略卫星之一，太阳系中最大的卫星。'
  },
  {
    name: 'Callisto',
    nameCN: '木卫四',
    parentName: 'Jupiter',
    diameter: 4820,
    distanceFromParent: 1.88,
    orbitalPeriod: 16.69,
    rotationPeriod: 16.69,
    color: 0x807868,
    eccentricity: 0.007,
    mass: 0.018,
    surfaceTemp: -139,
    description: '木星的四颗伽利略卫星之一，表面布满撞击坑，是太阳系中最古老的表面之一。'
  },
  {
    name: 'Titan',
    nameCN: '泰坦',
    parentName: 'Saturn',
    diameter: 5150,
    distanceFromParent: 1.22,
    orbitalPeriod: 15.95,
    rotationPeriod: 15.95,
    color: 0xd4a066,
    eccentricity: 0.029,
    mass: 0.0225,
    surfaceTemp: -180,
    description: '土星最大的卫星，太阳系中唯一拥有浓厚大气层的卫星，表面存在液态甲烷湖泊。'
  }
]

const SCALE_FACTORS = {
  SIZE_SCALE: 0.00005,
  DISTANCE_SCALE: 0.008,
  TIME_SCALE: 0.001,
  SIZE_MULTIPLIER: 8,
  MOON_SIZE_MULTIPLIER: 15,
  MOON_DISTANCE_SCALE: 2.5
}

export const DataStore = {
  getPlanets() {
    return PLANETS_DATA.map(p => ({ ...p }))
  },

  getSun() {
    return { ...SUN_DATA }
  },

  getMoons() {
    return MOONS_DATA.map(m => ({ ...m, isMoon: true }))
  },

  getMoonsByParent(parentName) {
    return this.getMoons().filter(m => m.parentName === parentName)
  },

  getPlanetByName(name) {
    const raw = PLANETS_DATA.find(p => p.name === name || p.nameCN === name)
    return raw ? { ...raw } : null
  },

  getMoonByName(name) {
    const raw = MOONS_DATA.find(m => m.name === name || m.nameCN === name)
    return raw ? { ...raw, isMoon: true } : null
  },

  getBodyByName(name) {
    return (
      this.getPlanetByName(name) ||
      this.getMoonByName(name) ||
      (name === 'Sun' || name === '太阳' ? this.getSun() : null)
    )
  },

  getAllBodies() {
    const bodies = []
    bodies.push({ ...this.getSun(), type: 'sun' })
    this.getPlanets().forEach(p => bodies.push({ ...p, type: 'planet' }))
    this.getMoons().forEach(m => bodies.push({ ...m, type: 'moon' }))
    return bodies
  },

  searchBodies(query) {
    if (!query || query.trim() === '') return []
    const q = query.toLowerCase().trim()
    return this.getAllBodies().filter(body =>
      body.name.toLowerCase().includes(q) ||
      body.nameCN.includes(q) ||
      (body.parentName && (
        body.parentName.toLowerCase().includes(q) ||
        PLANETS_DATA.find(p => p.name === body.parentName)?.nameCN.includes(q)
      ))
    )
  },

  getScaleFactors() {
    return { ...SCALE_FACTORS }
  }
}
