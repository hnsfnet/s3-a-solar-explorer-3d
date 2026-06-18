export class AnimationController {
  constructor(planetFactory, sceneManager) {
    this.planetFactory = planetFactory
    this.sceneManager = sceneManager
    this.timeScale = 1
    this.isPaused = false
    this.clock = null
    this.animationId = null
    this.onFrameCallback = null
  }

  start() {
    this.clock = this.clock || new (class {
      constructor() {
        this.startTime = performance.now()
        this.oldTime = this.startTime
      }
      getDelta() {
        const now = performance.now()
        const delta = (now - this.oldTime) / 1000
        this.oldTime = now
        return delta
      }
    })()

    const animate = () => {
      this.animationId = requestAnimationFrame(animate)
      this.update()
      this.sceneManager.render()
      if (this.onFrameCallback) this.onFrameCallback()
    }

    animate()
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  update() {
    if (this.isPaused) return

    const delta = this.clock.getDelta() * this.timeScale

    const planetObjects = this.planetFactory.getPlanetObjects()
    const moonObjects = this.planetFactory.getMoonObjects()

    planetObjects.forEach((obj, name) => {
      if (name === 'Sun') {
        obj.mesh.rotation.y += delta * 0.1
        return
      }

      obj.angle += obj.data.scaledOrbitalSpeed * delta
      obj.group.position.x = obj.semiMajorAxis * Math.cos(obj.angle)
      obj.group.position.z = obj.semiMinorAxis * Math.sin(obj.angle)

      obj.mesh.rotation.y += obj.data.scaledRotationSpeed * delta

      if (obj.data.name === 'Earth' && obj.group.children.length > 1) {
        const clouds = obj.group.children[1]
        clouds.rotation.y += obj.data.scaledRotationSpeed * delta * 1.2
      }
    })

    moonObjects.forEach((obj) => {
      obj.angle += obj.data.scaledOrbitalSpeed * delta
      obj.group.position.x = obj.semiMajorAxis * Math.cos(obj.angle)
      obj.group.position.z = obj.semiMinorAxis * Math.sin(obj.angle)

      obj.mesh.rotation.y += obj.data.scaledRotationSpeed * delta
    })
  }

  setTimeScale(scale) {
    this.timeScale = Math.max(0, Math.min(100, scale))
  }

  getTimeScale() {
    return this.timeScale
  }

  togglePause() {
    this.isPaused = !this.isPaused
    return this.isPaused
  }

  pause() {
    this.isPaused = true
  }

  play() {
    this.isPaused = false
  }

  getIsPaused() {
    return this.isPaused
  }

  setOnFrameCallback(callback) {
    this.onFrameCallback = callback
  }

  dispose() {
    this.stop()
    this.onFrameCallback = null
  }
}
