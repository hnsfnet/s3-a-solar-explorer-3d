import { eventBus } from './EventBus.js'

const STATE_CHANGE_EVENT = 'state:change'

function createReactiveState(target, eventBusInstance, path = '') {
  if (typeof target !== 'object' || target === null || Array.isArray(target)) {
    return target
  }

  return new Proxy(target, {
    get(obj, key) {
      const value = obj[key]
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return createReactiveState(value, eventBusInstance, path ? `${path}.${key}` : key)
      }
      return value
    },

    set(obj, key, value) {
      const oldValue = obj[key]
      if (oldValue === value) return true

      obj[key] = value
      const fullPath = path ? `${path}.${key}` : key

      eventBusInstance.emit(STATE_CHANGE_EVENT, {
        path: fullPath,
        key,
        oldValue,
        newValue: value,
        state: obj
      })

      eventBusInstance.emit(`${STATE_CHANGE_EVENT}:${fullPath}`, {
        path: fullPath,
        key,
        oldValue,
        newValue: value
      })

      return true
    },

    deleteProperty(obj, key) {
      if (!(key in obj)) return true

      const oldValue = obj[key]
      delete obj[key]
      const fullPath = path ? `${path}.${key}` : key

      eventBusInstance.emit(STATE_CHANGE_EVENT, {
        path: fullPath,
        key,
        oldValue,
        newValue: undefined,
        state: obj
      })

      eventBusInstance.emit(`${STATE_CHANGE_EVENT}:${fullPath}`, {
        path: fullPath,
        key,
        oldValue,
        newValue: undefined
      })

      return true
    }
  })
}

const defaultState = {
  selection: {
    selectedBody: null,
    compareTargets: []
  },
  time: {
    timeScale: 1,
    isPaused: false
  },
  camera: {
    targetBody: null,
    isAnimating: false
  },
  ui: {
    infoPanelVisible: false,
    comparePanelVisible: false,
    searchOpen: false,
    searchQuery: ''
  }
}

class AppStateManager {
  constructor() {
    this._state = createReactiveState(JSON.parse(JSON.stringify(defaultState)), eventBus)
    this._eventBus = eventBus
  }

  get state() {
    return this._state
  }

  selectBody(bodyName) {
    this._state.selection.selectedBody = bodyName
    this._state.ui.infoPanelVisible = true
    eventBus.emit('body:selected', bodyName)
  }

  clearSelection() {
    this._state.selection.selectedBody = null
    this._state.ui.infoPanelVisible = false
    eventBus.emit('body:cleared')
  }

  toggleCompareTarget(bodyName) {
    const targets = [...this._state.selection.compareTargets]
    const index = targets.indexOf(bodyName)

    if (index >= 0) {
      targets.splice(index, 1)
    } else {
      targets.push(bodyName)
      if (targets.length > 2) {
        targets.shift()
      }
    }

    this._state.selection.compareTargets = targets

    if (targets.length === 2) {
      this._state.ui.comparePanelVisible = true
      eventBus.emit('compare:ready', targets)
    } else {
      this._state.ui.comparePanelVisible = false
      eventBus.emit('compare:changed', targets)
    }

    return targets
  }

  clearCompare() {
    this._state.selection.compareTargets = []
    this._state.ui.comparePanelVisible = false
    eventBus.emit('compare:cleared')
  }

  setTimeScale(scale) {
    this._state.time.timeScale = scale
    eventBus.emit('time:scale-changed', scale)
  }

  setPaused(paused) {
    this._state.time.isPaused = paused
    eventBus.emit(paused ? 'time:paused' : 'time:resumed')
  }

  togglePaused() {
    const newVal = !this._state.time.isPaused
    this.setPaused(newVal)
    return newVal
  }

  setCameraAnimating(isAnimating) {
    this._state.camera.isAnimating = isAnimating
  }

  setSearchQuery(query) {
    this._state.ui.searchQuery = query
  }

  watch(path, handler) {
    const eventName = path ? `${STATE_CHANGE_EVENT}:${path}` : STATE_CHANGE_EVENT
    return this._eventBus.on(eventName, handler)
  }

  reset() {
    const fresh = JSON.parse(JSON.stringify(defaultState))
    Object.keys(this._state).forEach(key => {
      delete this._state[key]
    })
    Object.assign(this._state, fresh)
  }

  snapshot() {
    return JSON.parse(JSON.stringify(this._state))
  }
}

export const AppState = new AppStateManager()
