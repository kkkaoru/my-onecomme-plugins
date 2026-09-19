// @vitest-environment happy-dom
// Runs with bun.
import { afterEach, beforeEach, expect, test } from 'vitest'

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

interface Recorded {
  readonly animation: Animation
  readonly keyframes: readonly Keyframe[]
  readonly options: KeyframeAnimationOptions | undefined
}

const recorded: Recorded[] = []
const originalAnimate = Element.prototype.animate

// 実物の Animation を返しつつ呼び出しを記録する。終了は finish() で再現できる。
const recordAnimate = function recordAnimate(
  this: Element,
  keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
  options?: number | KeyframeAnimationOptions,
): Animation {
  const animation: Animation = originalAnimate.call(this, keyframes, options)
  recorded.push({
    animation,
    keyframes: Array.isArray(keyframes) ? keyframes : [],
    options: typeof options === 'object' ? options : undefined,
  })
  return animation
}

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

// Tests use a plain formatter so assertions stay about the DOM.
const formatLabel: FormatLabel = (label) => label.text ?? label.kind

const createTestFlow = (root: HTMLElement, settings: FlowConfig): FlowController =>
  createFlow(root, settings, { formatLabel })

const config = (): FlowConfig => sanitizeConfig({ durationMs: DURATION, lanes: 3 })

const transformsOf = (index: number): readonly string[] =>
  recorded[index]?.keyframes.map((frame) => String(frame.transform)) ?? []

const settle = async (): Promise<void> => {
  await Promise.resolve()
  await Promise.resolve()
}

beforeEach(() => {
  recorded.length = 0
  document.body.innerHTML = ''
  Element.prototype.animate = recordAnimate
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get: (): number => ITEM_WIDTH,
  })
})

afterEach(() => {
  Element.prototype.animate = originalAnimate
})

// 画素比が無い環境（テスト用の DOM など）でも 1 として扱う。
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
  ).toStrictEqual(['0', '1', '2', '0'])
})

test('animates from the right edge to past the left edge', () => {
  expect.hasAssertions()
  const root = createRootElement()
  const flow = createTestFlow(root, config())
  flow.push({ html: 'a', id: '1', name: 'n' })
  expect(transformsOf(0)).toStrictEqual(['translateX(1000px)', 'translateX(-200px)'])
})

test('uses the configured duration and linear easing', () => {
  expect.hasAssertions()
  const root = createRootElement()
  const flow = createTestFlow(root, config())
  flow.push({ html: 'a', id: '1', name: 'n' })
  expect(recorded[0]?.options).toStrictEqual({
    duration: DURATION,
    easing: 'linear',
    fill: 'forwards',
  })
})

test('animates in the opposite direction when configured', () => {
  expect.hasAssertions()
  const root = createRootElement()
  const flow = createTestFlow(root, sanitizeConfig({ direction: 'ltr', durationMs: DURATION }))
  flow.push({ html: 'a', id: '1', name: 'n' })
  expect(transformsOf(0)).toStrictEqual(['translateX(-200px)', 'translateX(1000px)'])
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
  const tops = [...root.querySelectorAll<HTMLElement>('.fc-item')].map(
    (element) => element.style.top,
  )
  expect(tops).toStrictEqual(['0px', '100px'])
})

test('removes the item once the animation finishes', async () => {
  expect.hasAssertions()
  const root = createRootElement()
  const flow = createTestFlow(root, config())
  flow.push({ html: 'a', id: '1', name: 'n' })
  recorded[0]?.animation.finish()
  await settle()
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

test('promotes the item to its own layer only while moving', () => {
  expect.hasAssertions()
  const root = createRootElement()
  const flow = createTestFlow(root, config())
  flow.push({ html: 'a', id: '1', name: 'n' })
  expect(root.querySelector<HTMLElement>('.fc-item')?.style.willChange).toStrictEqual('transform')
})

test('does not start an animation after destroy', () => {
  expect.hasAssertions()
  const root = createRootElement()
  const flow = createTestFlow(root, config())
  flow.destroy()
  flow.push({ html: 'a', id: '1', name: 'n' })
  expect(recorded.length).toBe(0)
})
