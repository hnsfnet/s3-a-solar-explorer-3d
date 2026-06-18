import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { eventBus } from './EventBus.js'

export class SceneManager {
  constructor(container) {
    this.container = container
    this.scene = null
    this.camera = null
    this.renderer = null
    this.controls = null
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.clickableObjects = []
    this.isCameraAnimating = false
    this.stars = null

    this._eventHandlers = []

    this.init()
    this.createStarfield()
    this.setupEventListeners()
    this._bindEventBus()
  }

  init() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0a0a1a)
    this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.0008)

    const fov = Number(import.meta.env.VITE_CAMERA_FOV) || 60
    const near = Number(import.meta.env.VITE_CAMERA_NEAR) || 0.1
    const far = Number(import.meta.env.VITE_CAMERA_FAR) || 5000
    const camX = Number(import.meta.env.VITE_CAMERA_INITIAL_X) || 60
    const camY = Number(import.meta.env.VITE_CAMERA_INITIAL_Y) || 40
    const camZ = Number(import.meta.env.VITE_CAMERA_INITIAL_Z) || 60

    this.camera = new THREE.PerspectiveCamera(
      fov,
      window.innerWidth / window.innerHeight,
      near,
      far,
    )
    this.camera.position.set(camX, camY, camZ)

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2
    this.container.appendChild(this.renderer.domElement)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.minDistance = 5
    this.controls.maxDistance = 300
    this.controls.zoomSpeed = 0.8
    this.controls.rotateSpeed = 0.6
    this.controls.panSpeed = 0.5
    this.controls.maxPolarAngle = Math.PI * 0.95

    this.setupLighting()
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x404060, 0.4)
    this.scene.add(ambientLight)

    this.sunLight = new THREE.PointLight(0xffffff, 2, 1000, 2)
    this.sunLight.position.set(0, 0, 0)
    this.scene.add(this.sunLight)

    const fillLight = new THREE.DirectionalLight(0x6060ff, 0.15)
    fillLight.position.set(50, 30, 50)
    this.scene.add(fillLight)
  }

  createStarfield() {
    const starsGeometry = new THREE.BufferGeometry()
    const starCount = 10000
    const positions = new Float32Array(starCount * 3)
    const colors = new Float32Array(starCount * 3)

    for (let i = 0; i < starCount; i++) {
      const radius = 800 + Math.random() * 1200
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      const brightness = 0.5 + Math.random() * 0.5
      const colorVariation = Math.random()
      if (colorVariation < 0.7) {
        colors[i * 3] = brightness
        colors[i * 3 + 1] = brightness
        colors[i * 3 + 2] = brightness
      } else if (colorVariation < 0.85) {
        colors[i * 3] = brightness
        colors[i * 3 + 1] = brightness * 0.9
        colors[i * 3 + 2] = brightness * 0.7
      } else {
        colors[i * 3] = brightness * 0.8
        colors[i * 3 + 1] = brightness * 0.9
        colors[i * 3 + 2] = brightness
      }
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const starsMaterial = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    })

    this.stars = new THREE.Points(starsGeometry, starsMaterial)
    this.scene.add(this.stars)
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize())
    this.renderer.domElement.addEventListener('click', (e) => this._onCanvasClick(e))
  }

  _bindEventBus() {
    const h1 = eventBus.on('camera:fly-to', ({ targetObject, distance, duration }) => {
      this.flyToTarget(targetObject, distance, duration)
    })
    const h2 = eventBus.on('camera:fly-default', () => {
      this.flyToDefault()
    })
    this._eventHandlers.push(h1, h2)
  }

  _onCanvasClick(event) {
    if (this.isCameraAnimating) return

    const rect = this.renderer.domElement.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects(this.clickableObjects, true)

    if (intersects.length > 0) {
      let target = intersects[0].object
      while (target.parent && !target.userData.planetName) {
        target = target.parent
      }
      if (target.userData.planetName) {
        eventBus.emit('body:clicked', {
          name: target.userData.planetName,
          object: target,
          event,
        })
      }
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  addClickableObject(obj) {
    this.clickableObjects.push(obj)
  }

  addClickableObjects(objs) {
    objs.forEach((obj) => this.clickableObjects.push(obj))
  }

  flyToTarget(targetObject, distance = 10, duration = 1500) {
    if (this.isCameraAnimating) return

    this.isCameraAnimating = true
    this.controls.enabled = false
    eventBus.emit('camera:fly-start')

    const targetPosition = new THREE.Vector3()
    targetObject.getWorldPosition(targetPosition)

    const direction = new THREE.Vector3()
      .subVectors(this.camera.position, targetPosition)
      .normalize()

    const targetSize = targetObject.userData.scaledSize || 1
    const minSafeDistance = targetSize * 4 + 1
    const desiredSurfaceDistance = Math.max(distance, minSafeDistance)
    const centerDistance = desiredSurfaceDistance + targetSize

    const desiredPosition = new THREE.Vector3().addVectors(
      targetPosition,
      direction.multiplyScalar(centerDistance),
    )

    const startPosition = this.camera.position.clone()
    const startQuaternion = this.camera.quaternion.clone()

    const lookAtQuaternion = new THREE.Quaternion()
    const tempCamera = this.camera.clone()
    tempCamera.position.copy(desiredPosition)
    tempCamera.lookAt(targetPosition)
    lookAtQuaternion.copy(tempCamera.quaternion)

    this.controls.minDistance = targetSize * 1.5 + 0.5

    const startTime = performance.now()

    const animate = () => {
      const elapsed = performance.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = this.easeInOutCubic(progress)

      this.camera.position.lerpVectors(startPosition, desiredPosition, easeProgress)
      this.camera.quaternion.slerpQuaternions(startQuaternion, lookAtQuaternion, easeProgress)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        this.controls.target.copy(targetPosition)
        this.controls.enabled = true
        this.isCameraAnimating = false
        eventBus.emit('camera:fly-complete', { target: targetObject })
      }
    }

    animate()
  }

  flyToDefault(callback) {
    if (this.isCameraAnimating) return

    this.isCameraAnimating = true
    this.controls.enabled = false
    eventBus.emit('camera:fly-start')

    const startPosition = this.camera.position.clone()
    const startQuaternion = this.camera.quaternion.clone()
    const desiredPosition = new THREE.Vector3(
      Number(import.meta.env.VITE_CAMERA_INITIAL_X) || 60,
      Number(import.meta.env.VITE_CAMERA_INITIAL_Y) || 40,
      Number(import.meta.env.VITE_CAMERA_INITIAL_Z) || 60,
    )
    const desiredTarget = new THREE.Vector3(0, 0, 0)

    const lookAtQuaternion = new THREE.Quaternion()
    const tempCamera = this.camera.clone()
    tempCamera.position.copy(desiredPosition)
    tempCamera.lookAt(desiredTarget)
    lookAtQuaternion.copy(tempCamera.quaternion)

    const startTime = performance.now()
    const duration = 1500

    const animate = () => {
      const elapsed = performance.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = this.easeInOutCubic(progress)

      this.camera.position.lerpVectors(startPosition, desiredPosition, easeProgress)
      this.camera.quaternion.slerpQuaternions(startQuaternion, lookAtQuaternion, easeProgress)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        this.controls.target.copy(desiredTarget)
        this.controls.minDistance = 5
        this.controls.enabled = true
        this.isCameraAnimating = false
        eventBus.emit('camera:fly-complete', { target: null })
        if (callback) callback()
      }
    }

    animate()
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
  }

  render() {
    this.controls.update()
    if (this.stars) {
      this.stars.rotation.y += 0.00005
    }
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this._eventHandlers.forEach((unbind) => unbind && unbind())
    this._eventHandlers = []
    this.renderer.dispose()
    this.controls.dispose()
    window.removeEventListener('resize', () => this.onWindowResize())
    this.container.removeChild(this.renderer.domElement)
  }
}
