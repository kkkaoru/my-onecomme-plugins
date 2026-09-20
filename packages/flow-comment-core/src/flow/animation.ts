// Runs with bun.
// Starting the movement. Web Animations runs on the compositor, so nothing here
// runs per frame.

import { horizontalRange, quantizeToDevicePixel } from '../motion/flow'
import { px } from '../units'
import { devicePixelRatioOf } from './geometry'
import { addItem, removeItem } from './items'
import type { FlowItem, FlowState, MountedItem } from './types'

// translate3d で合成レイヤーに載せる。位置は transform だけなので、動いている間も
// レイアウトも描き直しも走らない。
const keyframesOf = (from: number, to: number): Keyframe[] => [
  { transform: `translate3d(${px(from)}, 0, 0)` },
  { transform: `translate3d(${px(to)}, 0, 0)` },
]

const animateItem = (state: FlowState, mounted: MountedItem): FlowItem => {
  const { element, host } = mounted
  // Measure after attach: offsetWidth is 0 before that, so the run would end
  // when the leading edge hits the far side instead of the trailing edge.
  state.root.append(host)
  const { endX, startX } = horizontalRange(
    state.config.direction,
    element.offsetWidth,
    state.containerWidthPx,
  )
  const ratio = devicePixelRatioOf()
  const from = quantizeToDevicePixel(startX, ratio)
  const to = quantizeToDevicePixel(endX, ratio)
  // Animate the wrapper, not the painted item. Stroke and shadow on the same
  // node as the transform force a main-thread paint every frame at 1080p.
  host.style.transform = `translate3d(${px(from)}, 0, 0)`
  host.style.willChange = 'transform'
  const animation = host.animate(keyframesOf(from, to), {
    composite: 'replace',
    duration: state.config.durationMs,
    easing: 'linear',
    fill: 'forwards',
  })
  return { ...mounted, animation }
}

// A cancelled animation settles as a rejection, which is expected on clear.
const waitForEnd = async (state: FlowState, item: FlowItem): Promise<void> => {
  try {
    await item.animation.finished
  } catch {
    return
  }
  removeItem(state, item)
}

export const startItem = (state: FlowState, mounted: MountedItem): void => {
  const item = animateItem(state, mounted)
  addItem(state, item)
  void waitForEnd(state, item)
}
