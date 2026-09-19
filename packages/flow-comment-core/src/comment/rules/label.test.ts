// Runs with bun.
import { expect, test } from 'vitest'

import type { FlowComment } from '../model/comment'
import { selectLabel } from './label'

const comment = (overrides: Partial<FlowComment>): FlowComment => ({
  html: 'a',
  id: '1',
  name: 'n',
  ...overrides,
})

test('reports the super chat amount as service text', () => {
  expect.hasAssertions()
  expect(selectLabel(comment({ paidText: '¥1,000' }))).toStrictEqual({
    kind: 'paid',
    text: '¥1,000',
  })
})

test('falls through an empty paid text to the membership label', () => {
  expect.hasAssertions()
  expect(selectLabel(comment({ membership: '新規メンバー', paidText: '' }))).toStrictEqual({
    kind: 'membership',
    text: '新規メンバー',
  })
})

test('falls through an empty paid text to the gift label', () => {
  expect.hasAssertions()
  expect(selectLabel(comment({ giftCount: 1, isGift: true, paidText: '' }))).toStrictEqual({
    count: 1,
    kind: 'gift',
  })
})

test('reports a gift without a count', () => {
  expect.hasAssertions()
  expect(selectLabel(comment({ isGift: true }))).toStrictEqual({
    count: undefined,
    kind: 'gift',
  })
})

test('reports a received gift', () => {
  expect.hasAssertions()
  expect(selectLabel(comment({ isGiftReceiver: true }))).toStrictEqual({ kind: 'giftReceived' })
})

test('prefers the receiver label over the sender label', () => {
  expect.hasAssertions()
  expect(selectLabel(comment({ isGift: true, isGiftReceiver: true }))).toStrictEqual({
    kind: 'giftReceived',
  })
})

test('adds no label for a plain comment', () => {
  expect.hasAssertions()
  expect(selectLabel(comment({}))).toBeUndefined()
})
