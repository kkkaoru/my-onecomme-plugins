// Runs with bun.
// レーンの割当・行の高さ・移動範囲の計算だけを持つ純粋な層。
// 実際の移動は Web Animations API が行うため、ここには毎フレーム呼ばれる関数はない。

const MIN_LANES = 1

interface LaneAllocator {
  readonly next: () => number
}

interface LaneGeometryInput {
  readonly containerHeightPx: number
  readonly laneGapPx: number
  readonly laneHeightPx: number
  readonly lanes: number
}

interface LaneGeometry {
  readonly laneHeightPx: number
  readonly topOf: (lane: number) => number
}

interface HorizontalRange {
  readonly endX: number
  readonly startX: number
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

const floorLanes = (laneCount: number): number => Math.max(MIN_LANES, Math.floor(laneCount))

export const createLaneAllocator = (laneCount: number): LaneAllocator => {
  const lanes = floorLanes(laneCount)
  let cursor = 0
  return {
    next: () => {
      const lane = cursor
      cursor = (cursor + 1) % lanes
      return lane
    },
  }
}

export const createLaneGeometry = ({
  containerHeightPx,
  laneGapPx,
  laneHeightPx,
  lanes,
}: LaneGeometryInput): LaneGeometry => {
  const laneCount = floorLanes(lanes)
  const gap = Math.max(laneGapPx, 0)
  const available = Math.max(containerHeightPx - gap * (laneCount - 1), 0)
  const height = laneHeightPx > 0 ? laneHeightPx : available / laneCount
  return {
    laneHeightPx: height,
    topOf: (lane: number) => clamp(lane, 0, laneCount - 1) * (height + gap),
  }
}

// 移動の開始位置と終了位置。右から左なら右端から左端の外側へ抜ける。
export const horizontalRange = (
  direction: 'ltr' | 'rtl',
  itemWidth: number,
  containerWidth: number,
): HorizontalRange =>
  direction === 'rtl'
    ? { endX: -itemWidth, startX: containerWidth }
    : { endX: containerWidth, startX: -itemWidth }

// 開始位置と終了位置をデバイスピクセルに載せる。端で文字がぼけるのを避ける。
export const quantizeToDevicePixel = (value: number, ratio: number): number =>
  ratio > 0 ? Math.round(value * ratio) / ratio : Math.round(value)

export type { HorizontalRange, LaneAllocator, LaneGeometry, LaneGeometryInput }
