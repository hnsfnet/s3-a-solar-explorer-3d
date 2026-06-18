import * as THREE from 'three'
import { DataStore } from './DataStore.js'
import { OrbitCalculator } from './OrbitCalculator.js'

export class PlanetBuilder {
  constructor(scene) {
    this.scene = scene
    this.orbitCalc = new OrbitCalculator()
    this.sunGroup = null
    this.planetGroups = new Map()
    this.moonGroups = new Map()
    this.orbitLines = []
    this.moonOrbitLines = []
  }

  buildSun() {
    const sunParams = this.orbitCalc.getSunParams()
    const sunGroup = new THREE.Group()
    sunGroup.userData.planetName = sunParams.name
    sunGroup.userData.scaledSize = sunParams.scaledSize

    const coreGeom = new THREE.SphereGeometry(sunParams.scaledSize, 48, 48)
    const coreMat = new THREE.MeshBasicMaterial({ color: sunParams.color })
    const coreMesh = new THREE.Mesh(coreGeom, coreMat)
    sunGroup.add(coreMesh)

    const glowGeom = new THREE.SphereGeometry(sunParams.scaledSize * 1.2, 48, 48)
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide,
    })
    const glowMesh = new THREE.Mesh(glowGeom, glowMat)
    sunGroup.add(glowMesh)

    const coronaGeom = new THREE.SphereGeometry(sunParams.scaledSize * 1.6, 48, 48)
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xffcc00,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    })
    const coronaMesh = new THREE.Mesh(coronaGeom, coronaMat)
    sunGroup.add(coronaMesh)

    this.scene.add(sunGroup)
    this.sunGroup = sunGroup

    return { group: sunGroup, mesh: coreMesh, data: sunParams }
  }

  buildPlanet(planetName) {
    const params = this.orbitCalc.getPlanetOrbitParams(planetName)
    if (!params) return null

    const planetGroup = new THREE.Group()
    planetGroup.userData.planetName = params.name
    planetGroup.userData.scaledSize = params.scaledSize

    const geometry = new THREE.SphereGeometry(params.scaledSize, 48, 48)
    const material = new THREE.MeshStandardMaterial({
      color: params.color,
      roughness: 0.85,
      metalness: 0.05,
    })
    const planetMesh = new THREE.Mesh(geometry, material)
    planetGroup.add(planetMesh)

    if (params.name === 'Earth') {
      const cloudsGeom = new THREE.SphereGeometry(params.scaledSize * 1.02, 48, 48)
      const cloudsMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
        roughness: 1,
        metalness: 0,
      })
      const cloudsMesh = new THREE.Mesh(cloudsGeom, cloudsMat)
      planetGroup.add(cloudsMesh)
    }

    if (params.hasRings) {
      const rings = this._buildSaturnRings(params.scaledSize)
      planetGroup.add(rings)
    }

    const orbitLine = this._buildOrbitLine(params, 0x444466, 0.4)
    this.scene.add(orbitLine)
    this.orbitLines.push(orbitLine)

    this.scene.add(planetGroup)
    this.planetGroups.set(params.name, {
      group: planetGroup,
      mesh: planetMesh,
      data: params,
    })

    return { group: planetGroup, mesh: planetMesh, data: params }
  }

  buildMoon(moonName, parentPlanetGroup, parentScaledSize) {
    const params = this.orbitCalc.getMoonOrbitParams(moonName, parentScaledSize)
    if (!params) return null

    const moonGroup = new THREE.Group()
    moonGroup.userData.planetName = params.name
    moonGroup.userData.scaledSize = params.scaledSize
    moonGroup.userData.isMoon = true

    const geometry = new THREE.SphereGeometry(params.scaledSize, 32, 32)
    const material = new THREE.MeshStandardMaterial({
      color: params.color,
      roughness: 0.95,
      metalness: 0.02,
    })
    const moonMesh = new THREE.Mesh(geometry, material)
    moonGroup.add(moonMesh)

    const orbitLine = this._buildOrbitLine(params, 0x666688, 0.3, 128)
    parentPlanetGroup.add(orbitLine)
    this.moonOrbitLines.push({ line: orbitLine, parent: parentPlanetGroup })

    parentPlanetGroup.add(moonGroup)
    this.moonGroups.set(params.name, {
      group: moonGroup,
      mesh: moonMesh,
      data: params,
      parentGroup: parentPlanetGroup,
    })

    return { group: moonGroup, mesh: moonMesh, data: params }
  }

  buildMoonsForPlanet(parentName, parentPlanetGroup, parentScaledSize) {
    const moons = DataStore.getMoonsByParent(parentName)
    const results = []
    moons.forEach((moon) => {
      const result = this.buildMoon(moon.name, parentPlanetGroup, parentScaledSize)
      if (result) results.push(result)
    })
    return results
  }

  buildAllPlanets() {
    const planets = DataStore.getPlanets()
    planets.forEach((p) => this.buildPlanet(p.name))
  }

  _buildSaturnRings(planetSize) {
    const ringGroup = new THREE.Group()

    const innerRingGeom = new THREE.RingGeometry(planetSize * 1.3, planetSize * 1.6, 64)
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0xd4c4a8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
      roughness: 0.9,
    })
    const innerRing = new THREE.Mesh(innerRingGeom, innerRingMat)
    innerRing.rotation.x = -Math.PI / 2.5
    ringGroup.add(innerRing)

    const mainRingGeom = new THREE.RingGeometry(planetSize * 1.6, planetSize * 2.1, 64)
    const mainRingMat = new THREE.MeshStandardMaterial({
      color: 0xe8dcb8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
      roughness: 0.85,
    })
    const mainRing = new THREE.Mesh(mainRingGeom, mainRingMat)
    mainRing.rotation.x = -Math.PI / 2.5
    ringGroup.add(mainRing)

    const outerRingGeom = new THREE.RingGeometry(planetSize * 2.1, planetSize * 2.5, 64)
    const outerRingMat = new THREE.MeshStandardMaterial({
      color: 0xd4c4a8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
      roughness: 0.95,
    })
    const outerRing = new THREE.Mesh(outerRingGeom, outerRingMat)
    outerRing.rotation.x = -Math.PI / 2.5
    ringGroup.add(outerRing)

    return ringGroup
  }

  _buildOrbitLine(params, color = 0x444466, opacity = 0.4, segments = 256) {
    const positions = this.orbitCalc.getOrbitLinePoints(params, segments)
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
    })

    return new THREE.Line(geometry, material)
  }

  getPlanetObject(name) {
    return this.planetGroups.get(name) || this.moonGroups.get(name) || null
  }

  getAllPlanetObjects() {
    const all = new Map()
    this.planetGroups.forEach((v, k) => all.set(k, v))
    return all
  }

  getAllMoonObjects() {
    return this.moonGroups
  }

  getAllClickableObjects() {
    const clickables = []
    if (this.sunGroup) clickables.push(this.sunGroup)
    this.planetGroups.forEach((obj) => clickables.push(obj.group))
    this.moonGroups.forEach((obj) => clickables.push(obj.group))
    return clickables
  }

  dispose() {
    const disposeMesh = (obj) => {
      obj.traverse?.((child) => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
    }

    if (this.sunGroup) {
      disposeMesh(this.sunGroup)
      this.scene.remove(this.sunGroup)
    }

    this.planetGroups.forEach((obj) => {
      disposeMesh(obj.group)
      this.scene.remove(obj.group)
    })
    this.planetGroups.clear()

    this.moonGroups.forEach((obj) => {
      disposeMesh(obj.group)
      if (obj.parentGroup) obj.parentGroup.remove(obj.group)
    })
    this.moonGroups.clear()

    this.orbitLines.forEach((line) => {
      line.geometry.dispose()
      line.material.dispose()
      this.scene.remove(line)
    })
    this.orbitLines = []

    this.moonOrbitLines.forEach(({ line, parent }) => {
      line.geometry.dispose()
      line.material.dispose()
      if (parent) parent.remove(line)
    })
    this.moonOrbitLines = []

    this.orbitCalc.dispose()
  }
}
