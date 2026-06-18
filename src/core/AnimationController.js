export class AnimationController {
  constructor(planetFactory, sceneManager) {
    this.planetFactory = planetFactory
    this.sceneManager = sceneManager
    this.targetTimeScale = 1
    this.currentTimeScale = 1
    this.timeScaleSmoothSpeed = 6
    this.isPaused = false
    this.clock = null
    this.animationId = null
    this.onFrameCallback = null

    this.fixedStep = 1 / 120
    this.maxSubSteps = 240
    this.accumulator = 0
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
        return Math.min(delta, 0.1)
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
    if (this.isPaused) {
      this.clock.getDelta()
      return
    }

    const frameDelta = this.clock.getDelta()

    const smoothFactor = 1 - Math.exp(-this.timeScaleSmoothSpeed * frameDelta)
    this.currentTimeScale += (this.targetTimeScale - this.currentTimeScale) * smoothFactor

    const scaledDelta = frameDelta * this.currentTimeScale
    this.accumulator += scaledDelta

    let subSteps = 0
    while (this.accumulator >= this.fixedStep && subSteps < this.maxSubSteps) {
      this.step(this.fixedStep)
      this.accumulator -= this.fixedStep
      subSteps++
    }

    if (subSteps >= this.maxSubSteps) {
      this.accumulator = 0
    }
  }

  step(dt) {
    const planetObjects = this.planetFactory.getPlanetObjects()
    const moonObjects = this.planetFactory.getMoonObjects()

    planetObjects.forEach((obj, name) => {
      if (name === 'Sun') {
        obj.mesh.rotation.y += dt * 0.1
        return
      }

      obj.angle += obj.data.scaledOrbitalSpeed * dt
      obj.group.position.x = obj.semiMajorAxis * Math.cos(obj.angle) + obj.focalDistance
      obj.group.position.z = obj.semiMinorAxis * Math.sin(obj.angle)

      obj.mesh.rotation.y += obj.data.scaledRotationSpeed * dt

      if (obj.data.name === 'Earth' && obj.group.children.length > 1) {
        const clouds = obj.group.children[1]
        clouds.rotation.y += obj.data.scaledRotationSpeed * dt * 1.2
      }
    })

    moonObjects.forEach((obj) => {
      obj.angle += obj.data.scaledOrbitalSpeed * dt
      obj.group.position.x = obj.semiMajorAxis * Math.cos(obj.angle) + obj.focalDistance
      obj.group.position.z = obj.semiMinorAxis * Math.sin(obj.angle)

      obj.mesh.rotation.y += obj.data.scaledRotationSpeed * dt
    })
  }

  setTimeScale(scale) {
    this.targetTimeScale = Math.max(0, Math.min(100, scale))
  }

  getTimeScale() {
    return this.targetTimeScale
  }

  togglePause() {
    this.isPaused = !this.isPaused
    if (!this.isPaused) {
      this.currentTimeScale = this.targetTimeScale
    }
    return this.isPaused
  }

  pause() {
    this.isPaused = true
  }

  play() {
    this.isPaused = false
    this.currentTimeScale = this.targetTimeScale
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
