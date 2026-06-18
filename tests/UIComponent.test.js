import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { UIComponent } from '../src/ui/UIComponent.js'

class TestComponent extends UIComponent {
  createElement() {
    this.element = document.createElement('div')
    this.element.className = 'test-component'
  }
}

describe('UIComponent', () => {
  let component
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    component = new TestComponent()
    container.appendChild(component.element)
  })

  afterEach(() => {
    if (component) {
      component.dispose()
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  it('should create element on init', () => {
    expect(component.element).toBeDefined()
    expect(component.element.className).toBe('test-component')
  })

  it('should show and hide correctly', () => {
    expect(component.isVisible).toBe(false)
    component.show()
    expect(component.isVisible).toBe(true)
    expect(component.element.classList.contains('ui-visible')).toBe(true)
    component.hide()
    expect(component.isVisible).toBe(false)
    expect(component.element.classList.contains('ui-visible')).toBe(false)
  })

  it('should toggle visibility', () => {
    component.toggle()
    expect(component.isVisible).toBe(true)
    component.toggle()
    expect(component.isVisible).toBe(false)
  })

  it('should pass data to show and update', () => {
    const testData = { name: 'Test', value: 42 }
    const renderSpy = vi.spyOn(component, 'render')
    component.show(testData)
    expect(renderSpy).toHaveBeenCalledWith(testData)
    expect(component.getData()).toEqual(testData)

    const updateData = { value: 100 }
    component.update(updateData)
    expect(component.getData()).toEqual({ name: 'Test', value: 100 })
    expect(renderSpy).toHaveBeenCalledTimes(2)
  })

  it('should trigger onShow callback', () => {
    const callback = vi.fn()
    component.onShow(callback)
    const testData = { foo: 'bar' }
    component.show(testData)
    expect(callback).toHaveBeenCalledWith(testData)
  })

  it('should trigger onHide callback', () => {
    const callback = vi.fn()
    component.onHide(callback)
    component.show()
    component.hide()
    expect(callback).toHaveBeenCalled()
  })

  it('should trigger onClose callback when _triggerClose is called', () => {
    const callback = vi.fn()
    component.onClose(callback)
    component._triggerClose()
    expect(callback).toHaveBeenCalled()
  })

  it('should allow unregistering callbacks', () => {
    const callback = vi.fn()
    const unregister = component.onShow(callback)
    unregister()
    component.show()
    expect(callback).not.toHaveBeenCalled()
  })

  it('should remove element on dispose', () => {
    expect(container.contains(component.element)).toBe(true)
    component.dispose()
    expect(container.contains(component.element)).toBe(false)
    expect(component.element).toBeNull()
  })

  it('should use custom visible class from options', () => {
    class CustomComponent extends UIComponent {
      constructor() {
        super({ visibleClass: 'custom--visible' })
      }

      createElement() {
        this.element = document.createElement('div')
      }
    }

    const custom = new CustomComponent()
    custom.show()
    expect(custom.element.classList.contains('custom--visible')).toBe(true)
    custom.dispose()
  })
})
