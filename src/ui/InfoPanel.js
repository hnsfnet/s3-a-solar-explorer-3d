import { UIComponent } from './UIComponent.js'

export class InfoPanel extends UIComponent {
  constructor() {
    super({ visibleClass: 'info-panel--visible' })
    document.body.appendChild(this.element)
  }

  createElement() {
    this.element = document.createElement('div')
    this.element.className = 'info-panel'
    this.element.innerHTML = `
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
      <div class="info-panel__tag"></div>
      <div class="info-panel__description"></div>
      <div class="info-panel__stats">
        <div class="stat-item">
          <span class="stat-item__label">直径</span>
          <span class="stat-item__value stat-diameter"></span>
        </div>
        <div class="stat-item">
          <span class="stat-item__label">质量</span>
          <span class="stat-item__value stat-mass"></span>
        </div>
        <div class="stat-item stat-distance-row">
          <span class="stat-item__label">距离</span>
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
          <span class="stat-item__label">表面温度</span>
          <span class="stat-item__value stat-temperature"></span>
        </div>
        <div class="stat-item stat-eccentricity-row">
          <span class="stat-item__label">轨道偏心率</span>
          <span class="stat-item__value stat-eccentricity"></span>
        </div>
      </div>
    `
  }

  _attachEvents() {
    const closeBtn = this.element.querySelector('.info-panel__close')
    closeBtn.addEventListener('click', () => {
      this.hide()
      this._triggerClose()
    })
  }

  render(bodyData) {
    if (!bodyData) return

    const colorHex = `#${bodyData.color.toString(16).padStart(6, '0')}`

    const colorDot = this.element.querySelector('.info-panel__color')
    colorDot.style.backgroundColor = colorHex

    this.element.querySelector('.info-panel__title').textContent = bodyData.nameCN
    this.element.querySelector('.info-panel__subtitle').textContent = bodyData.name

    const tagEl = this.element.querySelector('.info-panel__tag')
    const eccRow = this.element.querySelector('.stat-eccentricity-row')
    const distRow = this.element.querySelector('.stat-distance-row')

    if (bodyData.isMoon) {
      tagEl.className = 'info-panel__tag info-panel__tag--moon'
      tagEl.textContent = `卫星 · 环绕 ${bodyData.parentName}`
      eccRow.style.display = 'none'
      distRow.style.display = 'flex'
    } else if (bodyData.name === 'Sun' || bodyData.type === 'sun') {
      tagEl.className = 'info-panel__tag info-panel__tag--sun'
      tagEl.textContent = '恒星'
      eccRow.style.display = 'none'
      distRow.style.display = 'flex'
    } else {
      tagEl.className = 'info-panel__tag info-panel__tag--planet'
      tagEl.textContent = '行星'
      eccRow.style.display = 'flex'
      distRow.style.display = 'flex'
    }

    this.element.querySelector('.info-panel__description').textContent = bodyData.description

    this.element.querySelector('.stat-diameter').textContent =
      `${this.formatNumber(bodyData.diameter)} km`

    this.element.querySelector('.stat-mass').textContent = this.formatMass(bodyData.mass)

    this.element.querySelector('.stat-temperature').textContent = this.formatTemp(
      bodyData.surfaceTemp,
    )

    if (bodyData.name === 'Sun' || bodyData.type === 'sun') {
      this.element.querySelector('.stat-distance').textContent = '—'
      this.element.querySelector('.stat-orbital').textContent = '—'
      this.element.querySelector('.stat-rotation').textContent = '~27 地球日'
      this.element.querySelector('.stat-eccentricity').textContent = '—'
    } else if (bodyData.isMoon) {
      this.element.querySelector('.stat-distance').textContent =
        `${bodyData.distanceFromParent?.toFixed(3) || '?'} 百万 km (距${bodyData.parentName})`
      this.element.querySelector('.stat-orbital').textContent = this.formatOrbitalPeriod(
        bodyData.orbitalPeriod,
      )
      this.element.querySelector('.stat-rotation').textContent = this.formatRotationPeriod(
        bodyData.rotationPeriod,
      )
      this.element.querySelector('.stat-eccentricity').textContent = '—'
    } else {
      this.element.querySelector('.stat-distance').textContent =
        `${this.formatNumber(bodyData.distance)} 百万 km`
      this.element.querySelector('.stat-orbital').textContent = this.formatOrbitalPeriod(
        bodyData.orbitalPeriod,
      )
      this.element.querySelector('.stat-rotation').textContent = this.formatRotationPeriod(
        bodyData.rotationPeriod,
      )
      this.element.querySelector('.stat-eccentricity').textContent =
        bodyData.eccentricity.toFixed(3)
    }
  }

  formatNumber(num) {
    return num.toLocaleString('zh-CN')
  }

  formatMass(mass) {
    if (mass == null) return '—'
    if (mass >= 1000) {
      return `${(mass / 1000).toFixed(2)} × 10³ M⊕`
    }
    return `${mass.toFixed(3)} M⊕`
  }

  formatTemp(celsius) {
    if (celsius == null) return '—'
    return `${celsius.toFixed(0)} °C`
  }

  formatOrbitalPeriod(days) {
    if (days == null) return '—'
    if (days >= 365) {
      const years = (days / 365).toFixed(2)
      return `${years} 地球年 (${this.formatNumber(days)} 天)`
    }
    return `${this.formatNumber(days)} 地球日`
  }

  formatRotationPeriod(days) {
    if (days == null) return '—'
    if (days < 1) {
      const hours = (days * 24).toFixed(1)
      return `${hours} 小时`
    }
    return `${days.toFixed(2)} 地球日`
  }
}
