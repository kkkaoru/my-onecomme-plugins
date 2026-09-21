// @vitest-environment happy-dom
// Runs with bun.
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import type { FormatLabel } from '../comment/rules/label'
import { sanitizeConfig } from '../settings/config'
import { createFlow } from './controller'

const CONTAINER_WIDTH = 1000
const CONTAINER_HEIGHT = 300
const ITEM_WIDTH = 200
const DURATION = 1000
const formatLabel: FormatLabel = (label) => label.text ?? label.kind
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

test('snaps to the wall-clock pixel after a hitch', () => {
  expect.hasAssertions()
  const root = createRootElement()
  const flow = createFlow(root, sanitizeConfig({ durationMs: DURATION, lanes: 3 }), {
    formatLabel,
    metrics: false,
  })
  flow.push({ html: 'a', id: '1', name: 'n' })
  pump(0)
  pump(100)
  expect(root.querySelector<HTMLElement>('.fc-run')?.style.transform).toBe('translate(880px, 0)')
})
