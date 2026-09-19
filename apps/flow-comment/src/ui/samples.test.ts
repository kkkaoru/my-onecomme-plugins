// Runs with bun.
import { expect, test } from 'vitest'

import { PREVIEW_SAMPLES, SUPER_CHAT_TIERS } from './samples'

test('covers every super chat tier', () => {
  expect.hasAssertions()
  expect(SUPER_CHAT_TIERS.map((tier) => tier.amount)).toStrictEqual([
    '¥100',
    '¥200',
    '¥500',
    '¥1,000',
    '¥2,000',
    '¥5,000',
    '¥10,000',
  ])
})

test('gives every tier its own background', () => {
  expect.hasAssertions()
  const backgrounds = SUPER_CHAT_TIERS.map((tier) => tier.background)
  expect(new Set(backgrounds).size).toBe(SUPER_CHAT_TIERS.length)
})

test('gives every sample a unique id', () => {
  expect.hasAssertions()
  const ids = PREVIEW_SAMPLES.map((sample) => sample.comment.id)
  expect(new Set(ids).size).toBe(PREVIEW_SAMPLES.length)
})

test('gives every sample a label and a body', () => {
  expect.hasAssertions()
  expect(PREVIEW_SAMPLES.filter((sample) => sample.label === '')).toStrictEqual([])
  expect(PREVIEW_SAMPLES.filter((sample) => sample.comment.html === '')).toStrictEqual([])
})

test('keeps every avatar offline as a data url', () => {
  expect.hasAssertions()
  const avatars = PREVIEW_SAMPLES.map((sample) => sample.comment.avatarUrl).filter(
    (url) => url !== undefined,
  )
  expect(avatars.filter((url) => !url.startsWith('data:image/svg+xml'))).toStrictEqual([])
})

test('includes a plain sample and the membership kinds', () => {
  expect.hasAssertions()
  const labels = PREVIEW_SAMPLES.map((sample) => sample.label)
  expect(labels).toContain('通常')
  expect(labels).toContain('メンシ加入')
  expect(labels).toContain('メンシギフト')
})

test('includes the gift kinds', () => {
  expect.hasAssertions()
  const labels = PREVIEW_SAMPLES.map((sample) => sample.label)
  expect(labels).toContain('メンバー')
  expect(labels).toContain('ギフト')
  expect(labels).toContain('ギフト受領')
})
