import { Chart, registerables } from 'chart.js'
import { UIComponent } from './UIComponent.js'

Chart.register(...registerables)

export class ComparePanel extends UIComponent {
  constructor() {
    super({ visibleClass: 'compare-panel--visible' })
    document.body.appendChild(this.element)
  }

  createElement() {
    this.element = document.createElement('div')
    this.element.className = 'compare-panel'
    this.element.innerHTML = `
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
  }

  _attachEvents() {
    const closeBtn = this.element.querySelector('.compare-panel__close')
    closeBtn.addEventListener('click', () => {
      this.hide()
      this._triggerClose()
    })

    this._initChart()
  }

  _initChart() {
    const canvas = this.element.querySelector('.compare-panel__chart')
    const ctx = canvas.getContext('2d')

    this.chart = new Chart(ctx, {
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
              pointStyle: 'circle',
            },
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
              label: (context) =>
                ` ${context.dataset.label}: ${context.raw.toLocaleString('zh-CN')}`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#606080',
              font: { family: 'Inter, sans-serif', size: 10 },
            },
            type: 'logarithmic',
          },
          y: {
            grid: { display: false },
            ticks: {
              color: '#a0a0c0',
              font: { family: 'Inter, sans-serif', size: 12 },
            },
          },
        },
      },
    })
  }

  render(bodies) {
    if (!bodies || bodies.length !== 2) return

    const [bodyA, bodyB] = bodies
    const bodyNames = this.element.querySelectorAll('.compare-body__name')
    const bodyDots = this.element.querySelectorAll('.compare-body__dot')

    bodies.forEach((body, i) => {
      bodyNames[i].textContent = body.nameCN
      bodyDots[i].style.backgroundColor = `#${body.color.toString(16).padStart(6, '0')}`
    })

    const labels = [
      '直径 (km)',
      '质量 (地球=1)',
      '公转周期 (天)',
      '自转周期 (天)',
      '表面温度 (开尔文)',
    ]

    const getValueOrFallback = (val, fallback = 1) =>
      val != null && val !== undefined && !isNaN(val) ? val : fallback

    const tempToKelvin = (c) => (c != null ? c + 273 : 288)

    const valuesA = [
      getValueOrFallback(bodyA.diameter),
      getValueOrFallback(bodyA.mass),
      getValueOrFallback(bodyA.orbitalPeriod),
      getValueOrFallback(bodyA.rotationPeriod),
      tempToKelvin(bodyA.surfaceTemp),
    ]

    const valuesB = [
      getValueOrFallback(bodyB.diameter),
      getValueOrFallback(bodyB.mass),
      getValueOrFallback(bodyB.orbitalPeriod),
      getValueOrFallback(bodyB.rotationPeriod),
      tempToKelvin(bodyB.surfaceTemp),
    ]

    const makeDataset = (body, values, _idx) => ({
      label: body.nameCN,
      data: values,
      backgroundColor: `#${body.color.toString(16).padStart(6, '0')}cc`,
      borderColor: `#${body.color.toString(16).padStart(6, '0')}`,
      borderWidth: 1,
      borderRadius: 4,
    })

    this.chart.data = {
      labels,
      datasets: [makeDataset(bodyA, valuesA, 0), makeDataset(bodyB, valuesB, 1)],
    }

    this.chart.update()
  }

  showCompare(bodyA, bodyB) {
    this._data = [bodyA, bodyB]
    this.render(this._data)
    this.show()
  }

  dispose() {
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
    super.dispose()
  }
}
