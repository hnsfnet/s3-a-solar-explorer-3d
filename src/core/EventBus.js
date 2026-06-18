export class EventBus {
  constructor() {
    this.events = new Map()
    this.onceHandlers = new WeakMap()
  }

  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event).add(handler)
    return () => this.off(event, handler)
  }

  off(event, handler) {
    if (!this.events.has(event)) return
    this.events.get(event).delete(handler)

    if (this.onceHandlers.has(handler)) {
      this.onceHandlers.delete(handler)
    }
  }

  once(event, handler) {
    const onceWrapper = (...args) => {
      this.off(event, onceWrapper)
      handler(...args)
    }
    this.onceHandlers.set(onceWrapper, handler)
    this.on(event, onceWrapper)
    return () => this.off(event, onceWrapper)
  }

  emit(event, ...args) {
    if (!this.events.has(event)) return

    const handlers = Array.from(this.events.get(event))
    handlers.forEach((handler) => {
      try {
        handler(...args)
      } catch (err) {
        console.error(`[EventBus] Error in handler for "${event}":`, err)
      }
    })
  }

  hasListeners(event) {
    return this.events.has(event) && this.events.get(event).size > 0
  }

  clear(event) {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
  }

  dispose() {
    this.events.clear()
  }
}

export const eventBus = new EventBus()
