export class UIComponent {
  constructor(options = {}) {
    this.element = null
    this.isVisible = false
    this._data = null
    this._onShowCallbacks = []
    this._onHideCallbacks = []
    this._onCloseCallbacks = []
    this._visibleClass = options.visibleClass || 'ui-visible'
    this._autoCreate = options.autoCreate !== false

    if (this._autoCreate) {
      this.createElement()
      this._attachEvents()
    }
  }

  createElement() {
    this.element = document.createElement('div')
  }

  _attachEvents() {
  }

  show(data) {
    if (this.isVisible) return
    if (data !== undefined) {
      this._data = data
      this.render(data)
    }
    this.element.classList.add(this._visibleClass)
    this.isVisible = true
    this._onShowCallbacks.forEach(cb => cb(data || this._data))
  }

  hide() {
    if (!this.isVisible) return
    this.element.classList.remove(this._visibleClass)
    this.isVisible = false
    this._onHideCallbacks.forEach(cb => cb())
  }

  toggle(data) {
    if (this.isVisible) {
      this.hide()
    } else {
      this.show(data)
    }
  }

  update(data) {
    this._data = { ...this._data, ...data }
    this.render(this._data)
  }

  render(data) {
  }

  getData() {
    return this._data
  }

  onShow(callback) {
    this._onShowCallbacks.push(callback)
    return () => {
      const idx = this._onShowCallbacks.indexOf(callback)
      if (idx >= 0) this._onShowCallbacks.splice(idx, 1)
    }
  }

  onHide(callback) {
    this._onHideCallbacks.push(callback)
    return () => {
      const idx = this._onHideCallbacks.indexOf(callback)
      if (idx >= 0) this._onHideCallbacks.splice(idx, 1)
    }
  }

  onClose(callback) {
    this._onCloseCallbacks.push(callback)
    return () => {
      const idx = this._onCloseCallbacks.indexOf(callback)
      if (idx >= 0) this._onCloseCallbacks.splice(idx, 1)
    }
  }

  _triggerClose() {
    this._onCloseCallbacks.forEach(cb => cb())
  }

  dispose() {
    this._onShowCallbacks = []
    this._onHideCallbacks = []
    this._onCloseCallbacks = []
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
    this.element = null
    this._data = null
  }
}
