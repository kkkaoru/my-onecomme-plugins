// @vitest-environment happy-dom
// Runs with bun.
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import type { FormatLabel } from '../comment/rules/label'
import { sanitizeConfig } from '../settings/config'
import type { FlowConfig } from '../settings/config'
import { createFlow } from './controller'
import { devicePixelRatioOf } from './geometry'
import type { FlowController } from './types'

const CONTAINER_WIDTH = 1000
const CONTAINER_HEIGHT = 300
const ITEM_WIDTH = 200
const DURATION = 1000
const frames: FrameRequestCallback[] = []

const createRootElement = (): HTMLElement => {
  const root = document.createElement('div')
  Object.defineProperty(root, 'clientWidth', {
    configurable: true,
    get: (): number => CONTAINER_WIDTH,
  })
  Object.defineProperty(root, 'clientHeight', {
    configurable: true,
    get: (): number => CONTAINER_HEIGHT,
  })
  document.body.append(root)
  return root
}

const formatLabel: FormatLabel = (label) => label.text ?? label.kind

const createTestFlow = (root: HTMLElement, settings: FlowConfig): FlowController =>
  createFlow(root, settings, { formatLabel, metrics: false })

const config = (): FlowConfig => sanitizeConfig({ durationMs: DURATION, lanes: 3 })

const pump = (now: number): void => {
  const callback = frames.shift()
  callback?.(now)
}

beforeEach(() => {
  frames.length = 0
  document.body.innerHTML = ''
  vi.spyOn(Math, 'random').mockReturnValue(0)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.push(callback)
    return frames.length
  })
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get(): number {
      return this.isConnected ? ITEM_WIDTH : 0
    },
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

test('falls back to one without a device pixel ratio', () => {
  expect.hasAssertions()
  const original = globalThis.devicePixelRatio
  Object.defineProperty(globalThis, 'devicePixelRatio', {
    configurable: true,
    value: 0,
    writable: true,
  })
  expect(devicePixelRatioOf()).toBe(1)
  globalThis.devicePixelRatio = original
})

test('mounts a metrics overlay when asked', () => {
  expect.hasAssertions()
  const root = createRootElement()
  createFlow(root, config(), { formatLabel, metrics: true })
  expect(root.querySelector('.fc-metrics')).not.toBeNull()
})

test('appends an item per comment', () => {
  expect.hasAssertions()
  const root = createRootElement()
  const flow = createTestFlow(root, config())
  flow.push({ html: 'a', id: '1', name: 'n' })
  flow.push({ html: 'b', id: '2', name: 'n' })
  expect(root.querySelectorAll('.fc-item').length).toBe(2)
})

test('writes the lane index onto each item', () => {
  expect.hasAssertions()
  const root = createRootElement()
  const flow = createTestFlow(root, config())
  flow.push({ html: 'a', id: '1', name: 'n' })
  flow.push({ html: 'b', id: '2', name: 'n' })
  flow.push({ html: 'c', id: '3', name: 'n' })
  flow.push({ html: 'd', id: '4', name: 'n' })
  expect(
    [...root.querySelectorAll('.fc-item')].map((element) => element.getAttribute('data-lane')),
  ).toStrictEqual(['0', '1', '2'])
  expect(root.querySelectorAll('.fc-item').length).toBe(3)
})

test('applies the font family to the run', () => {
  expect.hasAssertions()
  const root = createRootElement()
  const flow = createTestFlow(
    root,
    sanitizeConfig({ durationMs: DURATION, fontFamily: 'Impact', lanes: 3 }),
  )
  flow.push({ html: 'a', id: '1', name: 'n' })
  expect(root.querySelector<HTMLElement>('.fc-run')?.style.fontFamily).toBe('Impact')
  flow.applyConfig(sanitizeConfig({ durationMs: DURATION, fontFamily: 'serif', lanes: 3 }))
  expect(root.querySelector<HTMLElement>('.fc-run')?.style.fontFamily).toBe('serif')
})

test('starts at the right edge', () => {
  expect.hasAssertions()
  const root = createRootElement()
  const flow = createTestFlow(root, config())
  flow.push({ html: 'a', id: '1', name: 'n' })
  expect(root.querySelector<HTMLElement>('.fc-run')?.style.transform).toBe('translate(1000px, 0)')
})

test('starts off the left edge when flowing ltr', () => {
  expect.hasAssertions()
  const root = createRootElement()
  const flow = createTestFlow(root, sanitizeConfig({ direction: 'ltr', durationMs: DURATION }))
  flow.push({ html: 'a', id: '1', name: 'n' })
  expect(root.querySelector<HTMLElement>('.fc-run')?.style.transform).toBe('translate(-200px, 0)')
})

test('places the item in the lane it was assigned', () => {
  expect.hasAssertions()
  const root = createRootElement()
  const flow = createTestFlow(
    root,
    sanitizeConfig({ durationMs: DURATION, laneGapPx: 0, lanes: 3 }),
  )
  flow.push({ html: 'a', id: '1', name: 'n' })
  flow.push({ html: 'b', id: '2', name: 'n' })
  const tops = [...root.querySelectorAll<HTMLElement>('.fc-run')].map(
    (element) => element.style.top,
  )
  expect(tops).toStrictEqual(['0px', '100px'])
})

test('starts a waiting comment when a lane frees', () => {
  expect.hasAssertions()
  const root = createRootElement()
  const flow = createTestFlow(root, config())
  flow.push({ html: 'a', id: '1', name: 'n' })
  flow.push({ html: 'b', id: '2', name: 'n' })
  flow.push({ html: 'c', id: '3', name: 'n' })
  flow.push({ html: 'd', id: '4', name: 'n' })
  pump(0)
  pump(DURATION)
  expect(
    [...root.querySelectorAll('.fc-item')].map((element) => element.getAttribute('data-id')),
  ).toStrictEqual(['4'])
})

test('removes the item once the run finishes', () => {
  expect.hasAssertions()
  const root = createRootElement()
  const flow = createTestFlow(root, config())
  flow.push({ html: 'a', id: '1', name: 'n' })
  pump(0)
  pump(DURATION)
  expect(root.querySelectorAll('.fc-item').length).toBe(0)
})

test('drops the oldest item beyond the cap', () => {
  expect.hasAssertions()
  const root = createRootElement()
  const flow = createTestFlow(root, sanitizeConfig({ maxItems: 2 }))
  flow.push({ html: 'a', id: '1', name: 'n' })
  flow.push({ html: 'b', id: '2', name: 'n' })
  flow.push({ html: 'c', id: '3', name: 'n' })
  expect(
    [...root.querySelectorAll('.fc-item')].map((element) => element.getAttribute('data-id')),
  ).toStrictEqual(['2', '3'])
})

test('clears every item', () => {
  expect.hasAssertions()
  const root = createRootElement()
  const flow = createTestFlow(root, config())
  flow.push({ html: 'a', id: '1', name: 'n' })
  flow.clear()
  expect(root.querySelectorAll('.fc-item').length).toBe(0)
})

test('keeps flying items when the config changes', () => {
  expect.hasAssertions()
  const root = createRootElement()
  const flow = createTestFlow(root, config())
  flow.push({ html: 'a', id: '1', name: 'n' })
  flow.applyConfig(sanitizeConfig({ durationMs: DURATION, fontSizePx: 40, lanes: 2 }))
  expect(root.querySelectorAll('.fc-item').length).toBe(1)
  expect(root.querySelector<HTMLElement>('.fc-item')?.style.fontSize).toBe('40px')
})

test('restarts lane assignment when the config changes', () => {
  expect.hasAssertions()
  const root = createRootElement()
  const flow = createTestFlow(root, config())
  flow.push({ html: 'a', id: '1', name: 'n' })
  flow.applyConfig(sanitizeConfig({ durationMs: DURATION, lanes: 2 }))
  flow.push({ html: 'b', id: '2', name: 'n' })
  expect(root.querySelector('.fc-item')?.getAttribute('data-lane')).toStrictEqual('0')
})

test('ignores pushes after destroy', () => {
  expect.hasAssertions()
  const root = createRootElement()
  const flow = createTestFlow(root, config())
  flow.destroy()
  flow.push({ html: 'a', id: '1', name: 'n' })
  expect(root.querySelectorAll('.fc-item').length).toBe(0)
})
