// Runs with bun.
import { expect, test } from 'vitest'

import { PREVIEW_SAMPLES, SAMPLE_LABEL_KEYS, SUPER_CHAT_TIERS } from './samples'

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
  expect(PREVIEW_SAMPLES.every((sample) => SAMPLE_LABEL_KEYS.includes(sample.labelKey))).toBe(true)
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
  const labels = PREVIEW_SAMPLES.map((sample) => sample.labelKey)
  expect(labels).toContain('samplePlain')
  expect(labels).toContain('sampleMembershipJoin')
  expect(labels).toContain('sampleMembershipGift')
})

test('includes the gift kinds', () => {
  expect.hasAssertions()
  const labels = PREVIEW_SAMPLES.map((sample) => sample.labelKey)
  expect(labels.filter((key) => key === 'sampleMember')).toStrictEqual(['sampleMember'])
  expect(labels.filter((key) => key === 'sampleGift')).toStrictEqual(['sampleGift'])
})

test('puts a gift image in gift samples', () => {
  expect.hasAssertions()
  const gift = PREVIEW_SAMPLES.find((sample) => sample.labelKey === 'sampleGift')
  expect(gift?.comment.isGift).toBe(true)
  expect(gift?.comment.html.slice(0, 4)).toBe('<img')
})

test('gives membership samples a badge image', () => {
  expect.hasAssertions()
  const member = PREVIEW_SAMPLES.find((sample) => sample.labelKey === 'sampleMember')
  expect(member?.comment.badges?.[0]?.url?.slice(0, 14)).toBe('data:image/svg')
})
