// Runs with bun.
import { expect, test } from 'vitest'

import { createTranslator } from '../i18n'
import { createLabelFormatter } from './label-format'

const ja = createLabelFormatter(createTranslator('ja').t)
const en = createLabelFormatter(createTranslator('en').t)

test('passes service text through untouched', () => {
  expect.hasAssertions()
  expect(ja({ kind: 'paid', text: '¥1,000' })).toBe('¥1,000')
  expect(ja({ kind: 'membership', text: '新規メンバー' })).toBe('新規メンバー')
})

test('falls back to an empty label when the service sends no text', () => {
  expect.hasAssertions()
  expect(ja({ kind: 'membership' })).toBe('')
  expect(ja({ kind: 'paid' })).toBe('')
})

test('localises the gift label', () => {
  expect.hasAssertions()
  expect(ja({ kind: 'gift' })).toBe('ギフト')
  expect(en({ kind: 'gift' })).toBe('Gift')
})

test('formats the gift count per locale', () => {
  expect.hasAssertions()
  expect(ja({ count: 3, kind: 'gift' })).toBe('ギフト ×3')
  expect(en({ count: 3, kind: 'gift' })).toBe('Gift ×3')
})

test('localises the received gift label', () => {
  expect.hasAssertions()
  expect(ja({ kind: 'giftReceived' })).toBe('ギフト受付')
  expect(en({ kind: 'giftReceived' })).toBe('Gift received')
})

// 金額や会員名はサービス側で翻訳済みだが、空で届くこともある。
test('falls back to no text when the service sends none', () => {
  expect.hasAssertions()
  expect(ja({ kind: 'paid' })).toBe('')
  expect(ja({ kind: 'membership' })).toBe('')
})
