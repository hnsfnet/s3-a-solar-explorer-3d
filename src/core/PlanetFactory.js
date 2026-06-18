import * as THREE from 'three'

export class PlanetFactory {
  constructor(scene) {
    this.scene = scene
    this.planetObjects = new Map()
  }

  createSun(sunData) {
    const sunGroup = new THREE.Group()
    sunGroup.userData.planetName = sunData.name
    sunGroup.userData.scaledSize = sunData.scaledSize

    const sunGeometry = new THREE.SphereGeometry(sunData.scaledSize, 64, 64)
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: sunData.color
    })
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial)
    sunGroup.add(sunMesh)

    const glowGeometry = new THREE.SphereGeometry(sunData.scaledSize * 1.2, 64, 64)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: sunData.color,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    })
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
    sunGroup.add(glowMesh)

    const coronaGeometry = new THREE.SphereGeometry(sunData.scaledSize * 1.5, 64, 64)
    const coronaMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    })
    const coronaMesh = new THREE.Mesh(coronaGeometry, coronaMaterial)
    sunGroup.add(coronaMesh)

    this.scene.add(sunGroup)
    this.planetObjects.set(sunData.name, {
      group: sunGroup,
      mesh: sunMesh,
      data: sunData,
      angle: 0
    })

    return sunGroup
  }

  createPlanet(planetData) {
    const planetGroup = new THREE.Group()
    planetGroup.userData.planetName = planetData.name
    planetGroup.userData.scaledSize = planetData.scaledSize

    const geometry = new THREE.SphereGeometry(planetData.scaledSize, 48, 48)
    const material = new THREE.MeshStandardMaterial({
      color: planetData.color,
      roughness: 0.85,
      metalness: 0.05
    })
    const planetMesh = new THREE.Mesh(geometry, material)
    planetGroup.add(planetMesh)

    if (planetData.name === 'Earth') {
      const cloudsGeometry = new THREE.SphereGeometry(planetData.scaledSize * 1.02, 48, 48)
      const cloudsMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
        roughness: 1,
        metalness: 0
      })
      const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial)
      planetGroup.add(cloudsMesh)
    }

    if (planetData.hasRings) {
      const rings = this.createSaturnRings(planetData.scaledSize)
      planetGroup.add(rings)
    }

    const orbit = this.createOrbit(planetData)
    this.scene.add(orbit)

    const a = planetData.scaledDistance
    const b = a * Math.sqrt(1 - planetData.eccentricity * planetData.eccentricity)
    const initialAngle = Math.random() * Math.PI * 2
    planetGroup.position.x = a * Math.cos(initialAngle)
    planetGroup.position.z = b * Math.sin(initialAngle)

    this.scene.add(planetGroup)
    this.planetObjects.set(planetData.name, {
      group: planetGroup,
      mesh: planetMesh,
      data: planetData,
      angle: initialAngle,
      semiMajorAxis: a,
      semiMinorAxis: b
    })

    return planetGroup
  }

  createSaturnRings(planetSize) {
    const ringGroup = new THREE.Group()

    const innerRadius = planetSize * 1.4
    const outerRadius = planetSize * 2.2

    const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 128)
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xc9b896,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      roughness: 0.9,
      metalness: 0.1
    })
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial)
    ringMesh.rotation.x = -Math.PI / 2.5
    ringGroup.add(ringMesh)

    const innerRingGeometry = new THREE.RingGeometry(planetSize * 1.15, planetSize * 1.35, 128)
    const innerRingMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8d5b0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
      roughness: 0.95
    })
    const innerRingMesh = new THREE.Mesh(innerRingGeometry, innerRingMaterial)
    innerRingMesh.rotation.x = -Math.PI / 2.5
    ringGroup.add(innerRingMesh)

    const outerRingGeometry = new THREE.RingGeometry(planetSize * 2.25, planetSize * 2.5, 128)
    const outerRingMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4c4a8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
      roughness: 0.95
    })
    const outerRingMesh = new THREE.Mesh(outerRingGeometry, outerRingMaterial)
    outerRingMesh.rotation.x = -Math.PI / 2.5
    ringGroup.add(outerRingMesh)

    return ringGroup
  }

  createOrbit(planetData) {
    const a = planetData.scaledDistance
    const b = a * Math.sqrt(1 - planetData.eccentricity * planetData.eccentricity)
    const segments = 256
    const positions = new Float32Array((segments + 1) * 3)

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      positions[i * 3] = a * Math.cos(angle)
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = b * Math.sin(angle)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.LineBasicMaterial({
      color: 0x444466,
      transparent: true,
      opacity: 0.4
    })

    return new THREE.Line(geometry, material)
  }

  getPlanetObjects() {
    return this.planetObjects
  }

  getPlanetObject(name) {
    return this.planetObjects.get(name)
  }

  getClickablePlanets() {
    const clickables = []
    this.planetObjects.forEach((obj) => {
      clickables.push(obj.group)
    })
    return clickables
  }

  dispose() {
    this.planetObjects.forEach((obj) => {
      obj.group.traverse((child) => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
    })
    this.planetObjects.clear()
  }
}
