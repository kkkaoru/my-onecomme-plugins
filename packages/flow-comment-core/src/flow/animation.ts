// Runs with bun.
// Starting the movement. Web Animations runs on the compositor, so nothing here
// runs per frame.

import { horizontalRange, quantizeToDevicePixel } from '../motion/flow'
import { px } from '../units'
import { devicePixelRatioOf } from './geometry'
import { addItem, removeItem } from './items'
import type { FlowItem, FlowState, MountedItem } from './types'

const keyframesOf = (from: number, to: number): Keyframe[] => [
  { transform: `translateX(${px(from)})` },
  { transform: `translateX(${px(to)})` },
]

const animateItem = (state: FlowState, mounted: MountedItem): FlowItem => {
  const { element } = mounted
  const { endX, startX } = horizontalRange(
    state.config.direction,
    element.offsetWidth,
    state.containerWidthPx,
  )
  const ratio = devicePixelRatioOf()
  const from = quantizeToDevicePixel(startX, ratio)
  const to = quantizeToDevicePixel(endX, ratio)
  state.root.append(mounted.host)
  element.style.transform = `translateX(${px(from)})`
  // Promoted to its own layer only while moving, so painting happens once.
  element.style.willChange = 'transform'
  const animation = element.animate(keyframesOf(from, to), {
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
