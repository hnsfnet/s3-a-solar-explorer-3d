import { DataStore } from './DataStore.js'

const PLANET_TIME_BASE = 60
const MOON_TIME_BASE = 30
const MOON_ROTATION_DIVISOR = 5

export class OrbitCalculator {
  constructor() {
    this.scaleFactors = DataStore.getScaleFactors()
    this._cachedPlanetParams = new Map()
    this._cachedMoonParams = new Map()
  }

  getPlanetOrbitParams(planetName) {
    if (this._cachedPlanetParams.has(planetName)) {
      return this._cachedPlanetParams.get(planetName)
    }

    const planet = DataStore.getPlanetByName(planetName)
    if (!planet) return null

    const params = this._calculatePlanetParams(planet)
    this._cachedPlanetParams.set(planetName, params)
    return params
  }

  getMoonOrbitParams(moonName, parentScaledSize) {
    const cacheKey = `${moonName}_${parentScaledSize.toFixed(4)}`
    if (this._cachedMoonParams.has(cacheKey)) {
      return this._cachedMoonParams.get(cacheKey)
    }

    const moon = DataStore.getMoonByName(moonName)
    if (!moon) return null

    const params = this._calculateMoonParams(moon, parentScaledSize)
    this._cachedMoonParams.set(cacheKey, params)
    return params
  }

  getAllPlanetOrbitParams() {
    const planets = DataStore.getPlanets()
    return planets.map((p) => this.getPlanetOrbitParams(p.name))
  }

  getMoonsOrbitParamsForParent(parentName, parentScaledSize) {
    const moons = DataStore.getMoonsByParent(parentName)
    return moons.map((m) => this.getMoonOrbitParams(m.name, parentScaledSize))
  }

  _calculatePlanetParams(planet) {
    const { SIZE_SCALE, DISTANCE_SCALE, TIME_SCALE, SIZE_MULTIPLIER } = this.scaleFactors

    const scaledSize = Math.max(planet.diameter * SIZE_SCALE * SIZE_MULTIPLIER, 0.3)
    const scaledDistance = planet.distance * DISTANCE_SCALE + 5
    const semiMajorAxis = scaledDistance
    const semiMinorAxis = scaledDistance * Math.sqrt(1 - planet.eccentricity * planet.eccentricity)
    const focalDistance = scaledDistance * planet.eccentricity
    const scaledOrbitalSpeed =
      (2 * Math.PI) / (planet.orbitalPeriod * TIME_SCALE * PLANET_TIME_BASE)
    const scaledRotationSpeed =
      (2 * Math.PI) / (planet.rotationPeriod * TIME_SCALE * PLANET_TIME_BASE * 10)

    return {
      ...planet,
      scaledSize,
      scaledDistance,
      semiMajorAxis,
      semiMinorAxis,
      focalDistance,
      scaledOrbitalSpeed,
      scaledRotationSpeed,
    }
  }

  _calculateMoonParams(moon, parentScaledSize) {
    const { SIZE_SCALE, TIME_SCALE, MOON_SIZE_MULTIPLIER, MOON_DISTANCE_SCALE } = this.scaleFactors

    const scaledSize = Math.max(moon.diameter * SIZE_SCALE * MOON_SIZE_MULTIPLIER, 0.1)
    const scaledDistance = parentScaledSize * 1.8 + moon.distanceFromParent * MOON_DISTANCE_SCALE
    const semiMajorAxis = scaledDistance
    const semiMinorAxis = scaledDistance * Math.sqrt(1 - moon.eccentricity * moon.eccentricity)
    const focalDistance = scaledDistance * moon.eccentricity
    const scaledOrbitalSpeed = (2 * Math.PI) / (moon.orbitalPeriod * TIME_SCALE * MOON_TIME_BASE)
    const scaledRotationSpeed =
      (2 * Math.PI) / (moon.rotationPeriod * TIME_SCALE * MOON_TIME_BASE * MOON_ROTATION_DIVISOR)

    return {
      ...moon,
      scaledSize,
      scaledDistance,
      semiMajorAxis,
      semiMinorAxis,
      focalDistance,
      scaledOrbitalSpeed,
      scaledRotationSpeed,
    }
  }

  getSunParams() {
    const sun = DataStore.getSun()
    const { SIZE_SCALE, SIZE_MULTIPLIER, SUN_SIZE_RATIO } = this.scaleFactors
    return {
      ...sun,
      scaledSize: sun.diameter * SIZE_SCALE * SIZE_MULTIPLIER * SUN_SIZE_RATIO,
    }
  }

  getPositionAtAngle(params, angle) {
    return {
      x: params.semiMajorAxis * Math.cos(angle) + params.focalDistance,
      y: 0,
      z: params.semiMinorAxis * Math.sin(angle),
    }
  }

  getOrbitLinePoints(params, segments = 256) {
    const points = new Float32Array((segments + 1) * 3)
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const pos = this.getPositionAtAngle(params, angle)
      points[i * 3] = pos.x
      points[i * 3 + 1] = pos.y
      points[i * 3 + 2] = pos.z
    }
    return points
  }

  stepAngle(params, currentAngle, deltaTime) {
    return currentAngle + params.scaledOrbitalSpeed * deltaTime
  }

  dispose() {
    this._cachedPlanetParams.clear()
    this._cachedMoonParams.clear()
  }
}
