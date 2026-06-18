import './style.css'
import { DataStore } from './core/DataStore.js'
import { SceneManager } from './core/SceneManager.js'
import { PlanetBuilder } from './core/PlanetBuilder.js'
import { AnimationController } from './core/AnimationController.js'
import { InfoPanel } from './ui/InfoPanel.js'
import { ComparePanel } from './ui/ComparePanel.js'
import { eventBus } from './core/EventBus.js'
import { AppState } from './core/AppState.js'

class SolarSystemApp {
  constructor() {
    this.container = document.getElementById('app')
    this.sceneManager = null
    this.planetBuilder = null
    this.animationController = null
    this.infoPanel = null
    this.comparePanel = null

    this.searchInput = null
    this.searchClearBtn = null
    this.searchDropdown = null
    this._searchDebounceTimer = null
    this._isComposing = false

    this.playBtn = null
    this.playIcon = null
    this.pauseIcon = null
    this.slider = null
    this.valueDisplay = null
    this.resetBtn = null

    this._renderRafId = null

    this.init()
  }

  init() {
    this.createUI()

    this.sceneManager = new SceneManager(this.container)
    this.planetBuilder = new PlanetBuilder(this.sceneManager.scene)
    this.animationController = new AnimationController()
    this.infoPanel = new InfoPanel()
    this.comparePanel = new ComparePanel()

    this.createSolarSystem()
    this.setupEventBindings()
    this.startRenderLoop()

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
    AppState.setSearchQuery(q)

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
    const bodyObj = this.planetBuilder.getPlanetObject(name)
    if (!bodyObj) return

    const bodyData = DataStore.getBodyByName(name)
    let distance = name === 'Sun' ? 18 : 12

    if (bodyObj.data && bodyObj.data.isMoon) {
      const scaledSize = bodyObj.group.userData.scaledSize || 1
      distance = Math.max(3, scaledSize * 12)
    } else if (bodyData) {
      const scaledSize = bodyObj.group.userData.scaledSize || 1
      distance = Math.max(6, scaledSize * 10)
    }

    AppState.selectBody(name)
    eventBus.emit('camera:fly-to', { targetObject: bodyObj.group, distance })
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
    this.slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value)
      AppState.setTimeScale(val)
    })
    this.resetBtn.addEventListener('click', () => this.resetView())
  }

  createSolarSystem() {
    const sunData = DataStore.getSun()
    const sunResult = this.planetBuilder.buildSun()

    const planets = DataStore.getPlanets()
    planets.forEach(planetData => {
      const planetResult = this.planetBuilder.buildPlanet(planetData.name)
      if (planetResult) {
        const moonResults = this.planetBuilder.buildMoonsForPlanet(
          planetData.name,
          planetResult.group,
          planetResult.data.scaledSize
        )
      }
    })

    const clickables = this.planetBuilder.getAllClickableObjects()
    this.sceneManager.addClickableObjects(clickables)

    this.animationController.setSun(sunResult.group, sunData.rotationPeriod || 25)

    this.planetBuilder.getAllPlanetObjects().forEach((obj, name) => {
      this.animationController.addPlanet(name, obj.group)
    })

    this.planetBuilder.getAllMoonObjects().forEach((obj, name) => {
      const data = DataStore.getBodyByName(name)
      const parentName = data ? data.parentName : null
      if (parentName) {
        this.animationController.addMoon(name, obj.group, parentName)
      }
    })
  }

  setupEventBindings() {
    eventBus.on('body:clicked', ({ name, event }) => {
      const isCtrl = event.ctrlKey || event.metaKey
      if (isCtrl) {
        AppState.toggleCompareTarget(name)
      } else {
        this.handleBodySelect(name)
      }
    })

    eventBus.on('body:selected', (name) => {
      const bodyData = DataStore.getBodyByName(name)
      if (bodyData) {
        this.infoPanel.update(bodyData)
        this.infoPanel.show()
      }
    })

    eventBus.on('body:cleared', () => {
      this.infoPanel.hide()
    })

    eventBus.on('compare:ready', (targets) => {
      const bodies = targets.map(name => DataStore.getBodyByName(name)).filter(Boolean)
      if (bodies.length === 2) {
        this.comparePanel.showCompare(bodies[0], bodies[1])
      }
    })

    eventBus.on('compare:changed', (targets) => {
      if (targets.length < 2) {
        this.comparePanel.hide()
      }
    })

    eventBus.on('compare:cleared', () => {
      this.comparePanel.hide()
    })

    eventBus.on('time:scale-changed', (scale) => {
      this.valueDisplay.textContent = scale.toFixed(1) + 'x'
      this.slider.value = scale
    })

    eventBus.on('time:paused', () => {
      this.playIcon.style.display = 'block'
      this.pauseIcon.style.display = 'none'
      this.playBtn.classList.remove('time-control__btn--playing')
    })

    eventBus.on('time:resumed', () => {
      this.playIcon.style.display = 'none'
      this.pauseIcon.style.display = 'block'
      this.playBtn.classList.add('time-control__btn--playing')
    })

    this.infoPanel.onClose(() => {
      AppState.clearSelection()
      eventBus.emit('camera:fly-default')
    })

    this.comparePanel.onClose(() => {
      AppState.clearCompare()
    })

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        AppState.clearSelection()
        AppState.clearCompare()
        eventBus.emit('camera:fly-default')
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

  handleBodySelect(name) {
    const bodyObj = this.planetBuilder.getPlanetObject(name)
    if (!bodyObj) return

    const bodyData = DataStore.getBodyByName(name)
    let distance = name === 'Sun' ? 18 : 12

    const scaledSize = bodyObj.group.userData.scaledSize || 1
    if (bodyData && bodyData.isMoon) {
      distance = Math.max(3, scaledSize * 15)
    } else {
      distance = Math.max(8, scaledSize * 10)
    }

    AppState.selectBody(name)
    eventBus.emit('camera:fly-to', { targetObject: bodyObj.group, distance })
  }

  togglePlay() {
    AppState.togglePaused()
  }

  resetView() {
    AppState.clearSelection()
    AppState.clearCompare()
    eventBus.emit('camera:fly-default')
    eventBus.emit('time:reset')
  }

  startRenderLoop() {
    const render = () => {
      this.sceneManager.render()
      this._renderRafId = requestAnimationFrame(render)
    }
    this._renderRafId = requestAnimationFrame(render)
  }

  stopRenderLoop() {
    if (this._renderRafId) {
      cancelAnimationFrame(this._renderRafId)
      this._renderRafId = null
    }
  }

  dispose() {
    this.stopRenderLoop()
    this.animationController.dispose()
    this.sceneManager.dispose()
    this.planetBuilder.dispose()
    this.infoPanel.dispose()
    this.comparePanel.dispose()
  }
}

const app = new SolarSystemApp()

window.__solarApp = app

window.addEventListener('beforeunload', () => {
  app.dispose()
})
