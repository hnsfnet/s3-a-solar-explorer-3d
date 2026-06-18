import './style.css'
import { DataStore } from './core/DataStore.js'
import { SceneManager } from './core/SceneManager.js'
import { PlanetFactory } from './core/PlanetFactory.js'
import { AnimationController } from './core/AnimationController.js'
import { InfoPanel } from './ui/InfoPanel.js'

class SolarSystemApp {
  constructor() {
    this.container = document.getElementById('app')
    this.sceneManager = null
    this.planetFactory = null
    this.animationController = null
    this.infoPanel = null
    this.currentPlanet = null
    this.init()
  }

  init() {
    this.createUI()
    this.sceneManager = new SceneManager(this.container)
    this.planetFactory = new PlanetFactory(this.sceneManager.scene)
    this.animationController = new AnimationController(this.planetFactory, this.sceneManager)
    this.infoPanel = new InfoPanel()

    this.createSolarSystem()
    this.setupEvents()
    this.animationController.start()
  }

  createUI() {
    const hint = document.createElement('div')
    hint.className = 'ui-hint'
    hint.innerHTML = `
      <span><kbd>拖拽</kbd> 旋转视角</span>
      <span><kbd>滚轮</kbd> 缩放</span>
      <span><kbd>点击行星</kbd> 查看详情</span>
      <span><kbd>ESC</kbd> 返回全景</span>
    `
    document.body.appendChild(hint)

    const title = document.createElement('div')
    title.className = 'title'
    title.textContent = 'SOLAR EXPLORER'
    document.body.appendChild(title)

    this.createTimeControl()
  }

  createTimeControl() {
    const timeControl = document.createElement('div')
    timeControl.className = 'time-control'

    timeControl.innerHTML = `
      <button class="time-control__btn time-control__play-btn" aria-label="播放/暂停">
        <svg class="play-icon" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <svg class="pause-icon" viewBox="0 0 24 24" style="display:none">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      </button>
      <div class="time-control__slider-container">
        <span class="time-control__slider-label">时间倍速</span>
        <input type="range" class="time-control__slider" min="0" max="100" value="1" step="0.1">
      </div>
      <span class="time-control__value">1.0x</span>
      <button class="time-control__reset-btn">重置</button>
    `

    document.body.appendChild(timeControl)

    this.playBtn = timeControl.querySelector('.time-control__play-btn')
    this.playIcon = timeControl.querySelector('.play-icon')
    this.pauseIcon = timeControl.querySelector('.pause-icon')
    this.slider = timeControl.querySelector('.time-control__slider')
    this.valueDisplay = timeControl.querySelector('.time-control__value')
    this.resetBtn = timeControl.querySelector('.time-control__reset-btn')

    this.playBtn.addEventListener('click', () => this.togglePlay())
    this.slider.addEventListener('input', (e) => this.updateTimeScale(parseFloat(e.target.value)))
    this.resetBtn.addEventListener('click', () => this.resetView())
  }

  createSolarSystem() {
    const sunData = DataStore.getSun()
    this.planetFactory.createSun(sunData)

    const planets = DataStore.getPlanets()
    planets.forEach(planetData => {
      this.planetFactory.createPlanet(planetData)
    })

    const clickables = this.planetFactory.getClickablePlanets()
    clickables.forEach(obj => {
      this.sceneManager.addClickableObject(obj)
    })
  }

  setupEvents() {
    this.sceneManager.renderer.domElement.addEventListener('click', (e) => {
      this.sceneManager.onMouseClick(e, (planetName, planetObject) => {
        this.handlePlanetClick(planetName, planetObject)
      })
    })

    this.infoPanel.setOnCloseCallback(() => {
      this.currentPlanet = null
      this.sceneManager.flyToDefault()
    })

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.infoPanel.hide()
        this.currentPlanet = null
        this.sceneManager.flyToDefault()
      }
    })

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        this.togglePlay()
      }
    })
  }

  handlePlanetClick(planetName, planetObject) {
    const planetObj = this.planetFactory.getPlanetObject(planetName)
    if (planetObj) {
      this.currentPlanet = planetName
      this.sceneManager.flyToTarget(planetObject, 12)
      this.infoPanel.show(planetObj.data)
    }
  }

  togglePlay() {
    const isPaused = this.animationController.togglePause()
    if (isPaused) {
      this.playIcon.style.display = 'block'
      this.pauseIcon.style.display = 'none'
      this.playBtn.classList.remove('time-control__btn--playing')
    } else {
      this.playIcon.style.display = 'none'
      this.pauseIcon.style.display = 'block'
      this.playBtn.classList.add('time-control__btn--playing')
    }
  }

  updateTimeScale(value) {
    this.animationController.setTimeScale(value)
    this.valueDisplay.textContent = value.toFixed(1) + 'x'
  }

  resetView() {
    this.infoPanel.hide()
    this.currentPlanet = null
    this.sceneManager.flyToDefault()
  }

  dispose() {
    this.animationController.dispose()
    this.sceneManager.dispose()
    this.planetFactory.dispose()
    this.infoPanel.dispose()
  }
}

const app = new SolarSystemApp()

window.addEventListener('beforeunload', () => {
  app.dispose()
})
