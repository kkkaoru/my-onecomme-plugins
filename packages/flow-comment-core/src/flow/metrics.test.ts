// @vitest-environment happy-dom
// Runs with bun.
import { expect, test } from 'vitest'

import { countSubpixel, createSampler, startMetricsLoop } from './metrics'

test('counts a long frame as jank', () => {
  expect.hasAssertions()
  const sampler = createSampler()
  sampler.frame(1000)
  sampler.frame(1030)
  expect(sampler.read().jank).toBe(1)
  expect(sampler.read().frameMs).toBe(30)
})

test('keeps fps at zero on the first frame', () => {
  expect.hasAssertions()
  const sampler = createSampler()
  sampler.frame(1000)
  expect(sampler.read().fps).toBe(0)
  expect(sampler.read().frameMs).toBe(0)
})

test('resets jank when the sampling window rolls', () => {
  expect.hasAssertions()
  const sampler = createSampler()
  sampler.frame(1000)
  sampler.frame(1999)
  sampler.frame(2015)
  expect(sampler.read().jank).toBe(0)
})

test('counts a 16ms frame as smooth', () => {
  expect.hasAssertions()
  const sampler = createSampler()
  sampler.frame(1000)
  sampler.frame(1016)
  expect(sampler.read().jank).toBe(0)
  expect(sampler.read().frameMs).toBe(16)
})

test('counts a fractional translate as subpixel', () => {
  expect.hasAssertions()
  const host = document.createElement('div')
  document.body.append(host)
  host.style.transform = 'matrix(1, 0, 0, 1, 10.4, 0)'
  expect(countSubpixel([host])).toBe(1)
  host.style.transform = 'matrix(1, 0, 0, 1, 10, 0)'
  expect(countSubpixel([host])).toBe(0)
})

test('reads a translate() value as well as a matrix', () => {
  expect.hasAssertions()
  const host = document.createElement('div')
  document.body.append(host)
  host.style.transform = 'translate(10.4px, 0)'
  expect(countSubpixel([host])).toBe(1)
  host.style.transform = 'translate3d(10.4px, 0, 0)'
  expect(countSubpixel([host])).toBe(1)
})

test('treats an empty transform as whole pixels', () => {
  expect.hasAssertions()
  const host = document.createElement('div')
  document.body.append(host)
  expect(countSubpixel([host])).toBe(0)
})

test('counts a 100ms hitch as a stall', () => {
  expect.hasAssertions()
  const sampler = createSampler()
  sampler.frame(1000)
  sampler.frame(1100)
  expect(sampler.read().stall).toBe(1)
  expect(sampler.read().jank).toBe(1)
  expect(sampler.read().frameMs).toBe(100)
})

test('does not count a 16ms frame as a stall', () => {
  expect.hasAssertions()
  const sampler = createSampler()
  sampler.frame(1000)
  sampler.frame(1016)
  expect(sampler.read().stall).toBe(0)
})

test('stops sampling when the flow is gone', () => {
  expect.hasAssertions()
  const root = document.createElement('div')
  document.body.append(root)
  startMetricsLoop({
    hostsOf: () => [],
    isAlive: () => false,
    onTick: (now) => now,
    root,
  })
  expect(root.querySelector('.fc-metrics')).not.toBeNull()
})
