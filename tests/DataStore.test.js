import { describe, it, expect } from 'vitest'
import { DataStore } from '../src/core/DataStore.js'

describe('DataStore', () => {
  it('should get all planets', () => {
    const planets = DataStore.getPlanets()
    expect(Array.isArray(planets)).toBe(true)
    expect(planets.length).toBe(8)
    expect(planets[0].name).toBe('Mercury')
    expect(planets[planets.length - 1].name).toBe('Neptune')
  })

  it('should get sun data', () => {
    const sun = DataStore.getSun()
    expect(sun).toBeDefined()
    expect(sun.name).toBe('Sun')
    expect(sun.nameCN).toBe('太阳')
    expect(sun.diameter).toBe(1392700)
  })

  it('should get all moons', () => {
    const moons = DataStore.getMoons()
    expect(Array.isArray(moons)).toBe(true)
    expect(moons.length).toBe(6)
    moons.forEach((moon) => {
      expect(moon.isMoon).toBe(true)
    })
  })

  it('should get moons by parent name', () => {
    const earthMoons = DataStore.getMoonsByParent('Earth')
    expect(earthMoons.length).toBe(1)
    expect(earthMoons[0].name).toBe('Moon')

    const jupiterMoons = DataStore.getMoonsByParent('Jupiter')
    expect(jupiterMoons.length).toBe(4)
  })

  it('should get planet by name', () => {
    const earth = DataStore.getPlanetByName('Earth')
    expect(earth).toBeDefined()
    expect(earth.name).toBe('Earth')
    expect(earth.nameCN).toBe('地球')

    const earthCN = DataStore.getPlanetByName('地球')
    expect(earthCN).toBeDefined()
    expect(earthCN.name).toBe('Earth')
  })

  it('should get moon by name', () => {
    const moon = DataStore.getMoonByName('Moon')
    expect(moon).toBeDefined()
    expect(moon.name).toBe('Moon')
    expect(moon.isMoon).toBe(true)

    const titan = DataStore.getMoonByName('泰坦')
    expect(titan).toBeDefined()
    expect(titan.name).toBe('Titan')
  })

  it('should get body by name (planet, moon, or sun)', () => {
    const earth = DataStore.getBodyByName('Earth')
    expect(earth.name).toBe('Earth')

    const moon = DataStore.getBodyByName('Moon')
    expect(moon.name).toBe('Moon')
    expect(moon.isMoon).toBe(true)

    const sun = DataStore.getBodyByName('Sun')
    expect(sun.name).toBe('Sun')
  })

  it('should search bodies by query', () => {
    const earthResults = DataStore.searchBodies('earth')
    expect(earthResults.length).toBeGreaterThan(0)
    expect(earthResults[0].name).toBe('Earth')

    const moonResults = DataStore.searchBodies('moon')
    expect(moonResults.length).toBeGreaterThan(0)

    const cnResults = DataStore.searchBodies('木')
    expect(cnResults.length).toBeGreaterThan(0)

    const emptyResults = DataStore.searchBodies('')
    expect(emptyResults.length).toBe(0)
  })

  it('should get scale factors', () => {
    const scales = DataStore.getScaleFactors()
    expect(scales).toBeDefined()
    expect(typeof scales.SIZE_SCALE).toBe('number')
    expect(typeof scales.DISTANCE_SCALE).toBe('number')
    expect(typeof scales.TIME_SCALE).toBe('number')
  })

  it('should return copies of data, not references', () => {
    const planets1 = DataStore.getPlanets()
    const planets2 = DataStore.getPlanets()
    planets1[0].name = 'Modified'
    expect(planets2[0].name).toBe('Mercury')
  })
})
