import { describe, it, expect, beforeEach } from 'vitest'
import { OrbitCalculator } from '../src/core/OrbitCalculator.js'

describe('OrbitCalculator', () => {
  let orbitCalc

  beforeEach(() => {
    orbitCalc = new OrbitCalculator()
  })

  it('should get planet orbit params', () => {
    const params = orbitCalc.getPlanetOrbitParams('Earth')
    expect(params).toBeDefined()
    expect(params.name).toBe('Earth')
    expect(typeof params.scaledSize).toBe('number')
    expect(typeof params.scaledDistance).toBe('number')
    expect(typeof params.semiMajorAxis).toBe('number')
    expect(typeof params.semiMinorAxis).toBe('number')
    expect(typeof params.focalDistance).toBe('number')
    expect(typeof params.scaledOrbitalSpeed).toBe('number')
    expect(typeof params.scaledRotationSpeed).toBe('number')
  })

  it('should cache planet orbit params', () => {
    const params1 = orbitCalc.getPlanetOrbitParams('Earth')
    const params2 = orbitCalc.getPlanetOrbitParams('Earth')
    expect(params1).toBe(params2)
  })

  it('should return null for unknown planet', () => {
    const params = orbitCalc.getPlanetOrbitParams('UnknownPlanet')
    expect(params).toBeNull()
  })

  it('should get moon orbit params', () => {
    const params = orbitCalc.getMoonOrbitParams('Moon', 5)
    expect(params).toBeDefined()
    expect(params.name).toBe('Moon')
    expect(params.isMoon).toBe(true)
    expect(typeof params.scaledSize).toBe('number')
    expect(typeof params.scaledDistance).toBe('number')
  })

  it('should get sun params', () => {
    const params = orbitCalc.getSunParams()
    expect(params).toBeDefined()
    expect(params.name).toBe('Sun')
    expect(typeof params.scaledSize).toBe('number')
    expect(params.scaledSize).toBeGreaterThan(0)
  })

  it('should calculate position at angle', () => {
    const params = orbitCalc.getPlanetOrbitParams('Earth')
    const pos0 = orbitCalc.getPositionAtAngle(params, 0)
    expect(typeof pos0.x).toBe('number')
    expect(pos0.y).toBe(0)
    expect(typeof pos0.z).toBe('number')

    const posPI = orbitCalc.getPositionAtAngle(params, Math.PI)
    expect(posPI.x).not.toBe(pos0.x)
  })

  it('should get orbit line points without NaN values', () => {
    const params = orbitCalc.getPlanetOrbitParams('Earth')
    const points = orbitCalc.getOrbitLinePoints(params, 64)
    expect(points instanceof Float32Array).toBe(true)
    expect(points.length).toBe((64 + 1) * 3)

    for (let i = 0; i < points.length; i++) {
      expect(Number.isNaN(points[i])).toBe(false)
    }
  })

  it('should step angle correctly', () => {
    const params = orbitCalc.getPlanetOrbitParams('Earth')
    const initialAngle = 0
    const newAngle = orbitCalc.stepAngle(params, initialAngle, 1)
    expect(newAngle).toBeGreaterThan(initialAngle)
    expect(typeof newAngle).toBe('number')
  })

  it('should calculate all planet orbit params', () => {
    const allParams = orbitCalc.getAllPlanetOrbitParams()
    expect(Array.isArray(allParams)).toBe(true)
    expect(allParams.length).toBe(8)
  })

  it('should dispose and clear caches', () => {
    orbitCalc.getPlanetOrbitParams('Earth')
    orbitCalc.getMoonOrbitParams('Moon', 5)
    expect(orbitCalc._cachedPlanetParams.size).toBeGreaterThan(0)
    expect(orbitCalc._cachedMoonParams.size).toBeGreaterThan(0)

    orbitCalc.dispose()
    expect(orbitCalc._cachedPlanetParams.size).toBe(0)
    expect(orbitCalc._cachedMoonParams.size).toBe(0)
  })
})
