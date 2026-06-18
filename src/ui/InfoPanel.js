import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

export class InfoPanel {
  constructor() {
    this.panel = null
    this.isVisible = false
    this.onCloseCallback = null

    this.comparePanel = null
    this.compareChart = null
    this.compareVisible = false
    this.compareCloseCallback = null

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

    document.body.appendChild(this.panel)

    const closeBtn = this.panel.querySelector('.info-panel__close')
    closeBtn.addEventListener('click', () => this.hide())

    this.initComparePanel()
  }

  initComparePanel() {
    this.comparePanel = document.createElement('div')
    this.comparePanel.className = 'compare-panel'
    this.comparePanel.innerHTML = `
      <button class="compare-panel__close" aria-label="关闭">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div class="compare-panel__header">
        <h3 class="compare-panel__title">行星对比</h3>
        <div class="compare-panel__bodies">
          <div class="compare-body compare-body--a">
            <span class="compare-body__dot"></span>
            <span class="compare-body__name"></span>
          </div>
          <span class="compare-panel__vs">VS</span>
          <div class="compare-body compare-body--b">
            <span class="compare-body__dot"></span>
            <span class="compare-body__name"></span>
          </div>
        </div>
      </div>
      <div class="compare-panel__chart-container">
        <canvas class="compare-panel__chart"></canvas>
      </div>
      <p class="compare-panel__hint">按住 Ctrl 点击两颗天体开始对比</p>
    `
    document.body.appendChild(this.comparePanel)

    const compareClose = this.comparePanel.querySelector('.compare-panel__close')
    compareClose.addEventListener('click', () => this.hideCompare())

    const canvas = this.comparePanel.querySelector('.compare-panel__chart')
    const ctx = canvas.getContext('2d')
    this.compareChart = new Chart(ctx, {
      type: 'bar',
      data: { labels: [], datasets: [] },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              color: '#a0a0c0',
              font: { family: 'Inter, sans-serif', size: 12 },
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 15, 35, 0.95)',
            borderColor: 'rgba(0, 245, 255, 0.3)',
            borderWidth: 1,
            titleColor: '#ffffff',
            bodyColor: '#a0a0c0',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => ` ${context.dataset.label}: ${context.raw.toLocaleString('zh-CN')}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#606080',
              font: { family: 'Inter, sans-serif', size: 10 }
            },
            type: 'logarithmic'
          },
          y: {
            grid: { display: false },
            ticks: {
              color: '#a0a0c0',
              font: { family: 'Inter, sans-serif', size: 12 }
            }
          }
        }
      }
    })
  }

  show(planetData) {
    if (!planetData) return

    const colorDot = this.panel.querySelector('.info-panel__color')
    colorDot.style.backgroundColor = '#' + planetData.color.toString(16).padStart(6, '0')

    this.panel.querySelector('.info-panel__title').textContent = planetData.nameCN
    this.panel.querySelector('.info-panel__subtitle').textContent = planetData.name

    const tagEl = this.panel.querySelector('.info-panel__tag')
    if (planetData.isMoon) {
      tagEl.className = 'info-panel__tag info-panel__tag--moon'
      tagEl.textContent = `卫星 · 环绕 ${planetData.parentName}`
    } else if (planetData.name === 'Sun') {
      tagEl.className = 'info-panel__tag info-panel__tag--sun'
      tagEl.textContent = '恒星'
    } else {
      tagEl.className = 'info-panel__tag info-panel__tag--planet'
      tagEl.textContent = '行星'
    }

    this.panel.querySelector('.info-panel__description').textContent = planetData.description

    const eccRow = this.panel.querySelector('.stat-eccentricity-row')
    const distRow = this.panel.querySelector('.stat-distance-row')

    if (planetData.name === 'Sun') {
      eccRow.style.display = 'none'
      distRow.style.display = 'flex'
      this.panel.querySelector('.stat-diameter').textContent = this.formatNumber(planetData.diameter) + ' km'
      this.panel.querySelector('.stat-mass').textContent = this.formatMass(planetData.mass)
      this.panel.querySelector('.stat-distance').textContent = '—'
      this.panel.querySelector('.stat-orbital').textContent = '—'
      this.panel.querySelector('.stat-rotation').textContent = '~27 地球日'
      this.panel.querySelector('.stat-temperature').textContent = this.formatTemp(planetData.surfaceTemp)
      this.panel.querySelector('.stat-eccentricity').textContent = '—'
    } else if (planetData.isMoon) {
      eccRow.style.display = 'none'
      distRow.style.display = 'flex'
      this.panel.querySelector('.stat-diameter').textContent = this.formatNumber(planetData.diameter) + ' km'
      this.panel.querySelector('.stat-mass').textContent = this.formatMass(planetData.mass)
      this.panel.querySelector('.stat-distance').textContent = `${planetData.distanceFromParent.toFixed(3)} 百万 km (距${planetData.parentName})`
      this.panel.querySelector('.stat-orbital').textContent = this.formatOrbitalPeriod(planetData.orbitalPeriod)
      this.panel.querySelector('.stat-rotation').textContent = this.formatRotationPeriod(planetData.rotationPeriod)
      this.panel.querySelector('.stat-temperature').textContent = this.formatTemp(planetData.surfaceTemp)
      this.panel.querySelector('.stat-eccentricity').textContent = '—'
    } else {
      eccRow.style.display = 'flex'
      distRow.style.display = 'flex'
      this.panel.querySelector('.stat-diameter').textContent = this.formatNumber(planetData.diameter) + ' km'
      this.panel.querySelector('.stat-mass').textContent = this.formatMass(planetData.mass)
      this.panel.querySelector('.stat-distance').textContent = this.formatNumber(planetData.distance) + ' 百万 km'
      this.panel.querySelector('.stat-orbital').textContent = this.formatOrbitalPeriod(planetData.orbitalPeriod)
      this.panel.querySelector('.stat-rotation').textContent = this.formatRotationPeriod(planetData.rotationPeriod)
      this.panel.querySelector('.stat-temperature').textContent = this.formatTemp(planetData.surfaceTemp)
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

  showCompare(bodyA, bodyB) {
    if (!bodyA || !bodyB) return

    const bodies = [bodyA, bodyB]
    const bodyNames = this.comparePanel.querySelectorAll('.compare-body__name')
    const bodyDots = this.comparePanel.querySelectorAll('.compare-body__dot')

    bodies.forEach((body, i) => {
      bodyNames[i].textContent = body.nameCN
      bodyDots[i].style.backgroundColor = '#' + body.color.toString(16).padStart(6, '0')
    })

    const labels = ['直径 (km)', '质量 (地球=1)', '公转周期 (天)', '自转周期 (天)', '表面温度 (°C)']
    const valuesA = [
      bodyA.diameter,
      bodyA.mass || 1,
      bodyA.orbitalPeriod || 1,
      bodyA.rotationPeriod || 1,
      bodyA.surfaceTemp != null ? bodyA.surfaceTemp + 273 : 288
    ]
    const valuesB = [
      bodyB.diameter,
      bodyB.mass || 1,
      bodyB.orbitalPeriod || 1,
      bodyB.rotationPeriod || 1,
      bodyB.surfaceTemp != null ? bodyB.surfaceTemp + 273 : 288
    ]

    this.compareChart.data = {
      labels,
      datasets: [
        {
          label: bodyA.nameCN,
          data: valuesA,
          backgroundColor: '#' + bodyA.color.toString(16).padStart(6, '0') + 'cc',
          borderColor: '#' + bodyA.color.toString(16).padStart(6, '0'),
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: bodyB.nameCN,
          data: valuesB,
          backgroundColor: '#' + bodyB.color.toString(16).padStart(6, '0') + 'cc',
          borderColor: '#' + bodyB.color.toString(16).padStart(6, '0'),
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    }
    this.compareChart.update()

    this.comparePanel.classList.add('compare-panel--visible')
    this.compareVisible = true
  }

  hideCompare() {
    this.comparePanel.classList.remove('compare-panel--visible')
    this.compareVisible = false
    if (this.compareCloseCallback) {
      this.compareCloseCallback()
    }
  }

  setOnCloseCallback(callback) {
    this.onCloseCallback = callback
  }

  setCompareCloseCallback(callback) {
    this.compareCloseCallback = callback
  }

  formatNumber(num) {
    return num.toLocaleString('zh-CN')
  }

  formatMass(mass) {
    if (mass >= 1000) {
      return (mass / 1000).toFixed(2) + ' × 10³ M⊕'
    }
    return mass.toFixed(3) + ' M⊕'
  }

  formatTemp(celsius) {
    if (celsius >= 0) {
      return `${celsius.toFixed(0)} °C`
    }
    return `${celsius.toFixed(0)} °C`
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
    if (this.compareChart) {
      this.compareChart.destroy()
    }
    if (this.comparePanel && this.comparePanel.parentNode) {
      this.comparePanel.parentNode.removeChild(this.comparePanel)
    }
  }
}
