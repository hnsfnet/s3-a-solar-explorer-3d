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
    this.compareTargets = []
    this.searchDropdown = null
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
      <span><kbd>Ctrl+点击</kbd> 对比模式</span>
      <span><kbd>ESC</kbd> 返回全景</span>
    `
    document.body.appendChild(hint)

    const title = document.createElement('div')
    title.className = 'title'
    title.textContent = 'SOLAR EXPLORER'
    document.body.appendChild(title)

    this.createSearchBox()
    this.createTimeControl()
  }

  createSearchBox() {
    const searchWrapper = document.createElement('div')
    searchWrapper.className = 'search-box'

    searchWrapper.innerHTML = `
      <div class="search-box__input-container">
        <svg class="search-box__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" class="search-box__input" placeholder="搜索行星或卫星..." autocomplete="off">
        <button class="search-box__clear" aria-label="清除" style="display:none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="search-box__dropdown"></div>
    `

    document.body.appendChild(searchWrapper)

    this.searchInput = searchWrapper.querySelector('.search-box__input')
    this.searchClearBtn = searchWrapper.querySelector('.search-box__clear')
    this.searchDropdown = searchWrapper.querySelector('.search-box__dropdown')
    this._searchDebounceTimer = null
    this._isComposing = false

    this.searchInput.addEventListener('input', (e) => {
      if (this._isComposing) return
      this._debounceSearch(e.target.value)
    })
    this.searchInput.addEventListener('compositionstart', () => {
      this._isComposing = true
    })
    this.searchInput.addEventListener('compositionend', (e) => {
      this._isComposing = false
      this._debounceSearch(e.target.value)
    })
    this.searchInput.addEventListener('focus', (e) => this.handleSearchInput(e.target.value, true))
    this.searchInput.addEventListener('keydown', (e) => this.handleSearchKeydown(e))

    this.searchClearBtn.addEventListener('click', () => {
      this.searchInput.value = ''
      this.searchClearBtn.style.display = 'none'
      this.hideSearchDropdown()
      this.searchInput.focus()
    })

    document.addEventListener('click', (e) => {
      if (!searchWrapper.contains(e.target)) {
        this.hideSearchDropdown()
      }
    })
  }

  _debounceSearch(query, forceShow = false) {
    if (this._searchDebounceTimer) {
      clearTimeout(this._searchDebounceTimer)
    }
    this._searchDebounceTimer = setTimeout(() => {
      this.handleSearchInput(query, forceShow)
    }, 200)
  }

  handleSearchInput(query, forceShow = false) {
    const q = query.trim()
    this.searchClearBtn.style.display = q ? 'flex' : 'none'

    if (!q && !forceShow) {
      this.hideSearchDropdown()
      return
    }

    const results = q ? DataStore.searchBodies(q) : DataStore.getAllBodies()

    if (results.length === 0 && !forceShow) {
      this.hideSearchDropdown()
      return
    }

    this.showSearchDropdown(results, q)
  }

  handleSearchKeydown(e) {
    if (!this.searchDropdown.classList.contains('search-box__dropdown--visible')) return

    const items = Array.from(this.searchDropdown.querySelectorAll('.search-dropdown__item'))
    if (items.length === 0) return

    let activeIndex = items.findIndex(item => item.classList.contains('search-dropdown__item--active'))

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      activeIndex = (activeIndex + 1) % items.length
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      activeIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0) {
        items[activeIndex].click()
      } else {
        items[0].click()
      }
      return
    } else if (e.key === 'Escape') {
      this.hideSearchDropdown()
      return
    }

    items.forEach((item, i) => {
      item.classList.toggle('search-dropdown__item--active', i === activeIndex)
    })

    if (activeIndex >= 0) {
      items[activeIndex].scrollIntoView({ block: 'nearest' })
    }
  }

  showSearchDropdown(results, query) {
    this.searchDropdown.innerHTML = ''

    if (results.length === 0) {
      this.searchDropdown.innerHTML = `<div class="search-dropdown__empty">未找到匹配的天体</div>`
    } else {
      const fragment = document.createDocumentFragment()
      results.forEach((body, index) => {
        const item = document.createElement('div')
        item.className = 'search-dropdown__item'
        if (index === 0) item.classList.add('search-dropdown__item--active')

        const typeLabel = body.isMoon ? '卫星' : (body.name === 'Sun' ? '恒星' : '行星')
        const typeClass = body.isMoon ? 'type--moon' : (body.name === 'Sun' ? 'type--sun' : 'type--planet')

        const highlight = (text) => {
          if (!query) return text
          const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
          return text.replace(regex, '<mark>$1</mark>')
        }

        item.innerHTML = `
          <span class="search-dropdown__dot" style="background-color:#${body.color.toString(16).padStart(6, '0')}"></span>
          <div class="search-dropdown__info">
            <div class="search-dropdown__name">${highlight(body.nameCN)} <span class="search-dropdown__en">${highlight(body.name)}</span></div>
            <div class="search-dropdown__meta">
              <span class="search-dropdown__type ${typeClass}">${typeLabel}</span>
              ${body.isMoon ? `<span class="search-dropdown__parent">环绕 ${body.parentName}</span>` : ''}
            </div>
          </div>
        `

        item.addEventListener('click', () => {
          this.focusOnBody(body.name)
          this.searchInput.value = body.nameCN
          this.searchClearBtn.style.display = 'flex'
          this.hideSearchDropdown()
          this.searchInput.blur()
        })

        fragment.appendChild(item)
      })
      this.searchDropdown.appendChild(fragment)
    }

    this.searchDropdown.classList.add('search-box__dropdown--visible')
  }

  hideSearchDropdown() {
    this.searchDropdown.classList.remove('search-box__dropdown--visible')
  }

  focusOnBody(name) {
    const bodyObj = this.planetFactory.getPlanetObject(name)
    if (!bodyObj) return

    const bodyData = DataStore.getBodyByName(name)
    let targetGroup = bodyObj.group
    let distance = name === 'Sun' ? 18 : 12

    if (bodyObj.data.isMoon) {
      distance = Math.max(3, bodyObj.data.scaledSize * 12)
    } else if (bodyData) {
      distance = Math.max(6, bodyData.scaledSize * 10)
    }

    this.currentPlanet = name
    this.sceneManager.flyToTarget(targetGroup, distance)
    if (bodyData) {
      this.infoPanel.show(bodyData)
    }
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
      const planetGroup = this.planetFactory.createPlanet(planetData)

      const moons = DataStore.getMoonsByParent(planetData.name)
      if (moons && moons.length > 0) {
        this.planetFactory.createMoonsForPlanet(moons, planetGroup, planetData)
      }
    })

    const clickables = this.planetFactory.getClickablePlanets()
    clickables.forEach(obj => {
      this.sceneManager.addClickableObject(obj)
    })
  }

  setupEvents() {
    this.sceneManager.renderer.domElement.addEventListener('click', (e) => {
      this.sceneManager.onMouseClick(e, (planetName, planetObject, event) => {
        const isCtrl = event.ctrlKey || event.metaKey
        this.handlePlanetClick(planetName, planetObject, isCtrl)
      })
    })

    this.infoPanel.setOnCloseCallback(() => {
      this.currentPlanet = null
      this.sceneManager.flyToDefault()
    })

    this.infoPanel.setCompareCloseCallback(() => {
      this.compareTargets = []
    })

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.infoPanel.hide()
        this.infoPanel.hideCompare()
        this.currentPlanet = null
        this.compareTargets = []
        this.sceneManager.flyToDefault()
      }
    })

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        this.togglePlay()
      }
    })

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        this.searchInput.focus()
        this.searchInput.select()
        this.handleSearchInput(this.searchInput.value, true)
      }
    })
  }

  handlePlanetClick(planetName, planetObject, isCtrlCompare = false) {
    const planetObj = this.planetFactory.getPlanetObject(planetName)
    if (!planetObj) return

    const bodyData = planetObj.data

    if (isCtrlCompare) {
      const existingIndex = this.compareTargets.findIndex(t => t.name === planetName)
      if (existingIndex >= 0) {
        this.compareTargets.splice(existingIndex, 1)
      } else {
        this.compareTargets.push(bodyData)
        if (this.compareTargets.length > 2) {
          this.compareTargets.shift()
        }
      }

      if (this.compareTargets.length === 2) {
        this.infoPanel.showCompare(this.compareTargets[0], this.compareTargets[1])
      } else if (this.compareTargets.length === 0) {
        this.infoPanel.hideCompare()
      }
      return
    }

    let distance = planetName === 'Sun' ? 18 : 12
    if (bodyData.isMoon) {
      distance = Math.max(3, (bodyData.scaledSize || 1) * 15)
    } else if (bodyData.scaledSize) {
      distance = Math.max(8, bodyData.scaledSize * 10)
    }

    this.currentPlanet = planetName
    this.sceneManager.flyToTarget(planetObject, distance)
    this.infoPanel.show(bodyData)
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
    this.infoPanel.hideCompare()
    this.currentPlanet = null
    this.compareTargets = []
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

window.__solarApp = app

window.addEventListener('beforeunload', () => {
  app.dispose()
})
