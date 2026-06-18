import * as THREE from 'three'
import { OrbitCalculator } from './OrbitCalculator.js'
import { eventBus } from './EventBus.js'

export class AnimationController {
  constructor() {
    this.orbitCalc = new OrbitCalculator()
    this.bodies = new Map()
    this.sunBody = null

    this.isPaused = false
    this.targetTimeScale = 1
    this.currentTimeScale = 1

    this._clock = new THREE.Clock()
    this._fixedStep = 1 / 120
    this._accumulator = 0
    this._maxSubSteps = 240
    this._running = false
    this._eventHandlers = []

    this._bindEventBus()
  }

  _bindEventBus() {
    const h1 = eventBus.on('time:paused', () => {
      this.isPaused = true
    })
    const h2 = eventBus.on('time:resumed', () => {
      this.isPaused = false
    })
    const h3 = eventBus.on('time:scale-changed', (scale) => {
      this.setTimeScale(scale)
    })
    const h4 = eventBus.on('time:reset', () => {
      this.reset()
    })
    this._eventHandlers.push(h1, h2, h3, h4)
  }

  setSun(sunGroup, rotationPeriod) {
    this.sunBody = {
      group: sunGroup,
      rotationPeriod: rotationPeriod || 25,
    }
  }

  addPlanet(name, group) {
    const orbitParams = this.orbitCalc.getPlanetOrbitParams(name)
    if (!orbitParams) return

    const body = {
      name,
      group,
      orbitParams,
      angle: Math.random() * Math.PI * 2,
      isMoon: false,
    }

    const initialPos = this.orbitCalc.getPositionAtAngle(orbitParams, body.angle)
    group.position.set(initialPos.x, 0, initialPos.z)

    this.bodies.set(name, body)
  }

  addMoon(name, group, parentName) {
    const parentBody = this.bodies.get(parentName)
    if (!parentBody) return

    const orbitParams = this.orbitCalc.getMoonOrbitParams(name, parentBody.orbitParams.scaledSize)
    if (!orbitParams) return

    const body = {
      name,
      group,
      orbitParams,
      angle: Math.random() * Math.PI * 2,
      isMoon: true,
      parentName,
    }

    const initialPos = this.orbitCalc.getPositionAtAngle(orbitParams, body.angle)
    group.position.set(initialPos.x, 0, initialPos.z)

    this.bodies.set(name, body)
  }

  setTimeScale(scale) {
    this.targetTimeScale = Math.max(0, scale)
  }

  reset() {
    this.bodies.forEach((body) => {
      body.angle = Math.random() * Math.PI * 2
      const pos = this.orbitCalc.getPositionAtAngle(body.orbitParams, body.angle)
      body.group.position.set(pos.x, 0, pos.z)
    })
    this.targetTimeScale = 1
    this.currentTimeScale = 1
  }

  start() {
    if (this._running) return
    this._running = true
    this._clock.start()
    this._animate()
  }

  stop() {
    this._running = false
  }

  _animate() {
    if (!this._running) return

    const delta = this._clock.getDelta()
    this._accumulator += delta

    let steps = 0
    while (this._accumulator >= this._fixedStep && steps < this._maxSubSteps) {
      if (!this.isPaused) {
        this._step(this._fixedStep)
      }
      this._accumulator -= this._fixedStep
      steps++
    }

    if (steps >= this._maxSubSteps) {
      this._accumulator = 0
    }

    requestAnimationFrame(() => this._animate())
  }

  _step(dt) {
    const smoothFactor = 1 - Math.exp(-5 * dt)
    this.currentTimeScale += (this.targetTimeScale - this.currentTimeScale) * smoothFactor

    const scaledDt = dt * this.currentTimeScale

    if (this.sunBody && this.sunBody.group) {
      const sunRotSpeed = (2 * Math.PI) / (this.sunBody.rotationPeriod * 600)
      this.sunBody.group.rotation.y += sunRotSpeed * scaledDt
    }

    this.bodies.forEach((body) => {
      body.angle = this.orbitCalc.stepAngle(body.orbitParams, body.angle, scaledDt)

      const pos = this.orbitCalc.getPositionAtAngle(body.orbitParams, body.angle)
      body.group.position.set(pos.x, 0, pos.z)

      body.group.children.forEach((child) => {
        if (child.isMesh) {
          child.rotation.y += body.orbitParams.scaledRotationSpeed * scaledDt
        }
      })
    })
  }

  getTimeScale() {
    return this.currentTimeScale
  }

  getTargetTimeScale() {
    return this.targetTimeScale
  }

  dispose() {
    this.stop()
    this._eventHandlers.forEach((unbind) => unbind && unbind())
    this._eventHandlers = []
    this.bodies.clear()
    this.sunBody = null
    this.orbitCalc.dispose()
  }
}
