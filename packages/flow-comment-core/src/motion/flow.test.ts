// Runs with bun.
import { expect, test } from 'vitest'

import {
  createLaneAllocator,
  createLaneGeometry,
  horizontalRange,
  quantizeToDevicePixel,
} from './flow'

const zero = (): number => 0

test('fills empty lanes and refuses a fourth when three are busy', () => {
  expect.hasAssertions()
  const allocator = createLaneAllocator(3, zero)
  expect(allocator.pick([])).toBe(0)
  expect(allocator.pick([0])).toBe(1)
  expect(allocator.pick([0, 1])).toBe(2)
  expect(allocator.pick([0, 1, 2])).toBeNull()
})

test('picks an empty lane at random', () => {
  expect.hasAssertions()
  const allocator = createLaneAllocator(3, () => 0.99)
  expect(allocator.pick([])).toBe(2)
})

test('treats a lane count below one as a single lane', () => {
  expect.hasAssertions()
  const allocator = createLaneAllocator(0, zero)
  expect(allocator.pick([])).toBe(0)
  expect(allocator.pick([0])).toBeNull()
})

test('splits the container evenly between lanes', () => {
  expect.hasAssertions()
  const geometry = createLaneGeometry({
    containerHeightPx: 500,
    laneGapPx: 0,
    laneHeightPx: 0,
    lanes: 5,
  })
  expect([geometry.laneHeightPx, geometry.topOf(0), geometry.topOf(4)]).toStrictEqual([100, 0, 400])
})

test('subtracts the gaps before splitting', () => {
  expect.hasAssertions()
  const geometry = createLaneGeometry({
    containerHeightPx: 500,
    laneGapPx: 25,
    laneHeightPx: 0,
    lanes: 4,
  })
  expect([geometry.laneHeightPx, geometry.topOf(1)]).toStrictEqual([106.25, 131.25])
})

test('honours an explicit lane height', () => {
  expect.hasAssertions()
  const geometry = createLaneGeometry({
    containerHeightPx: 500,
    laneGapPx: 10,
    laneHeightPx: 40,
    lanes: 3,
  })
  expect([geometry.laneHeightPx, geometry.topOf(2)]).toStrictEqual([40, 100])
})

test('clamps a lane index outside the geometry', () => {
  expect.hasAssertions()
  const geometry = createLaneGeometry({
    containerHeightPx: 300,
    laneGapPx: 0,
    laneHeightPx: 0,
    lanes: 3,
  })
  expect([geometry.topOf(-1), geometry.topOf(9)]).toStrictEqual([0, 200])
})

test('starts at the right edge and ends past the left edge when flowing right to left', () => {
  expect.hasAssertions()
  expect(horizontalRange('rtl', 200, 1000)).toStrictEqual({ endX: -200, startX: 1000 })
})

test('starts left of the left edge when flowing left to right', () => {
  expect.hasAssertions()
  expect(horizontalRange('ltr', 200, 1000)).toStrictEqual({ endX: 1000, startX: -200 })
})

test('quantizes a position to the device pixel grid', () => {
  expect.hasAssertions()
  expect(quantizeToDevicePixel(100.4, 2)).toStrictEqual(100.5)
  expect(quantizeToDevicePixel(100.2, 2)).toStrictEqual(100)
  expect(quantizeToDevicePixel(100.4, 1)).toStrictEqual(100)
})

test('falls back to whole pixels without a ratio', () => {
  expect.hasAssertions()
  expect(quantizeToDevicePixel(100.6, 0)).toStrictEqual(101)
})
