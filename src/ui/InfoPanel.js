export class InfoPanel {
  constructor() {
    this.panel = null
    this.isVisible = false
    this.onCloseCallback = null
    this.init()
  }

  init() {
    this.panel = document.createElement('div')
    this.panel.className = 'info-panel'
    this.panel.innerHTML = `
      <button class="info-panel__close" aria-label="关闭">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div class="info-panel__header">
        <div class="info-panel__color"></div>
        <div>
          <h2 class="info-panel__title"></h2>
          <p class="info-panel__subtitle"></p>
        </div>
      </div>
      <div class="info-panel__description"></div>
      <div class="info-panel__stats">
        <div class="stat-item">
          <span class="stat-item__label">直径</span>
          <span class="stat-item__value stat-diameter"></span>
        </div>
        <div class="stat-item">
          <span class="stat-item__label">与太阳距离</span>
          <span class="stat-item__value stat-distance"></span>
        </div>
        <div class="stat-item">
          <span class="stat-item__label">公转周期</span>
          <span class="stat-item__value stat-orbital"></span>
        </div>
        <div class="stat-item">
          <span class="stat-item__label">自转周期</span>
          <span class="stat-item__value stat-rotation"></span>
        </div>
        <div class="stat-item">
          <span class="stat-item__label">轨道偏心率</span>
          <span class="stat-item__value stat-eccentricity"></span>
        </div>
      </div>
    `

    document.body.appendChild(this.panel)

    const closeBtn = this.panel.querySelector('.info-panel__close')
    closeBtn.addEventListener('click', () => this.hide())
  }

  show(planetData) {
    if (!planetData) return

    const colorDot = this.panel.querySelector('.info-panel__color')
    colorDot.style.backgroundColor = '#' + planetData.color.toString(16).padStart(6, '0')

    this.panel.querySelector('.info-panel__title').textContent = planetData.nameCN
    this.panel.querySelector('.info-panel__subtitle').textContent = planetData.name
    this.panel.querySelector('.info-panel__description').textContent = planetData.description

    if (planetData.name === 'Sun') {
      this.panel.querySelector('.stat-diameter').textContent = this.formatNumber(planetData.diameter) + ' km'
      this.panel.querySelector('.stat-distance').textContent = '—'
      this.panel.querySelector('.stat-orbital').textContent = '—'
      this.panel.querySelector('.stat-rotation').textContent = '~27 地球日'
      this.panel.querySelector('.stat-eccentricity').textContent = '—'
    } else {
      this.panel.querySelector('.stat-diameter').textContent = this.formatNumber(planetData.diameter) + ' km'
      this.panel.querySelector('.stat-distance').textContent = this.formatNumber(planetData.distance) + ' 百万 km'
      this.panel.querySelector('.stat-orbital').textContent = this.formatOrbitalPeriod(planetData.orbitalPeriod)
      this.panel.querySelector('.stat-rotation').textContent = this.formatRotationPeriod(planetData.rotationPeriod)
      this.panel.querySelector('.stat-eccentricity').textContent = planetData.eccentricity.toFixed(3)
    }

    this.panel.classList.add('info-panel--visible')
    this.isVisible = true
  }

  hide() {
    this.panel.classList.remove('info-panel--visible')
    this.isVisible = false
    if (this.onCloseCallback) {
      this.onCloseCallback()
    }
  }

  toggle(planetData) {
    if (this.isVisible) {
      this.hide()
    } else {
      this.show(planetData)
    }
  }

  setOnCloseCallback(callback) {
    this.onCloseCallback = callback
  }

  formatNumber(num) {
    return num.toLocaleString('zh-CN')
  }

  formatOrbitalPeriod(days) {
    if (days >= 365) {
      const years = (days / 365).toFixed(2)
      return `${years} 地球年 (${this.formatNumber(days)} 天)`
    }
    return `${this.formatNumber(days)} 地球日`
  }

  formatRotationPeriod(days) {
    if (days < 1) {
      const hours = (days * 24).toFixed(1)
      return `${hours} 小时`
    } else if (Math.abs(days - 1) < 0.1) {
      return `${days.toFixed(2)} 地球日`
    } else {
      return `${days.toFixed(2)} 地球日`
    }
  }

  dispose() {
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel)
    }
  }
}
