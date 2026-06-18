import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EventBus } from '../src/core/EventBus.js'

describe('EventBus', () => {
  let eventBus

  beforeEach(() => {
    eventBus = new EventBus()
  })

  it('should emit event to registered handler', () => {
    const handler = vi.fn()
    eventBus.on('test-event', handler)
    eventBus.emit('test-event', 'data')
    expect(handler).toHaveBeenCalledWith('data')
  })

  it('should handle multiple handlers for same event', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    eventBus.on('test-event', handler1)
    eventBus.on('test-event', handler2)
    eventBus.emit('test-event', 'data')
    expect(handler1).toHaveBeenCalledWith('data')
    expect(handler2).toHaveBeenCalledWith('data')
  })

  it('should not call handler after off', () => {
    const handler = vi.fn()
    eventBus.on('test-event', handler)
    eventBus.off('test-event', handler)
    eventBus.emit('test-event', 'data')
    expect(handler).not.toHaveBeenCalled()
  })

  it('should call once handler only once', () => {
    const handler = vi.fn()
    eventBus.once('test-event', handler)
    eventBus.emit('test-event', 'data1')
    eventBus.emit('test-event', 'data2')
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('data1')
  })

  it('should return unbind function from on', () => {
    const handler = vi.fn()
    const unbind = eventBus.on('test-event', handler)
    unbind()
    eventBus.emit('test-event', 'data')
    expect(handler).not.toHaveBeenCalled()
  })

  it('should haveListeners returns true when handlers exist', () => {
    expect(eventBus.hasListeners('test-event')).toBe(false)
    eventBus.on('test-event', vi.fn())
    expect(eventBus.hasListeners('test-event')).toBe(true)
  })

  it('should clear all handlers for an event', () => {
    eventBus.on('test-event', vi.fn())
    eventBus.on('test-event', vi.fn())
    eventBus.clear('test-event')
    expect(eventBus.hasListeners('test-event')).toBe(false)
  })

  it('should pass multiple arguments to handler', () => {
    const handler = vi.fn()
    eventBus.on('test-event', handler)
    eventBus.emit('test-event', 'arg1', 'arg2', 'arg3')
    expect(handler).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
  })
})
