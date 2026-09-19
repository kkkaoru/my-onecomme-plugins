// Runs with bun.
import type { OneSdkComment, OneSdkCommentData } from '@my-onecomme-plugins/onesdk-types'
import { expect, test } from 'vitest'

import { toFlowComment } from './comment-map'

const onesdk = (data: Partial<OneSdkCommentData>): OneSdkComment => ({
  data: { comment: 'こんばんは', id: '1', name: 'みなと', ...data },
})

test('carries the body, id and name across', () => {
  expect.hasAssertions()
  const comment = toFlowComment(onesdk({ id: 'abc', profileImage: 'https://example.test/a.png' }))
  expect(comment.html).toBe('こんばんは')
  expect(comment.id).toBe('abc')
  expect(comment.name).toBe('みなと')
  expect(comment.avatarUrl).toBe('https://example.test/a.png')
})

test('prefers the display name when the service sends one', () => {
  expect.hasAssertions()
  expect(toFlowComment(onesdk({ displayName: 'みなと（表示名）' })).name).toBe('みなと（表示名）')
})

test('joins the membership tier into one line', () => {
  expect.hasAssertions()
  const member = toFlowComment(
    onesdk({ isMember: true, membership: { primary: 'プラチナ', sub: 'メンバー' } }),
  )
  expect(member.membership).toBe('メンバー プラチナ')
  expect(member.isMember).toBe(true)
})

test('drops the separator when the service sends no detail', () => {
  expect.hasAssertions()
  expect(toFlowComment(onesdk({ membership: { primary: '', sub: 'メンバー' } })).membership).toBe(
    'メンバー',
  )
})

test('has no membership for a plain comment', () => {
  expect.hasAssertions()
  const comment = toFlowComment(onesdk({}))
  expect(comment.membership).toBeUndefined()
  expect(comment.isMember).toBe(false)
  expect(comment.giftCount).toBeUndefined()
})

test('counts a gift by its price', () => {
  expect.hasAssertions()
  const gift = toFlowComment(
    onesdk({ giftReceivers: [{ label: 'a' }, { label: 'b' }], hasGift: true, price: 5 }),
  )
  expect(gift.giftCount).toBe(5)
  expect(gift.isGift).toBe(true)
})

test('falls back to the receiver count when no price is sent', () => {
  expect.hasAssertions()
  const gift = toFlowComment(onesdk({ giftReceivers: [{ label: 'a' }, { label: 'b' }] }))
  expect(gift.giftCount).toBe(2)
})

test('flags only an explicit gift receiver', () => {
  expect.hasAssertions()
  expect(toFlowComment(onesdk({ isSponsorshipGiftReceiver: true })).isGiftReceiver).toBe(true)
  expect(toFlowComment(onesdk({})).isGiftReceiver).toBe(false)
})

test('passes badges, colors and paid text through', () => {
  expect.hasAssertions()
  const comment = toFlowComment(
    onesdk({
      badges: [{ label: 'メンバー' }],
      colors: { bodyBackgroundColor: 'rgb(1, 2, 3)' },
      paidText: '¥1,000',
    }),
  )
  expect(comment.badges).toStrictEqual([{ label: 'メンバー' }])
  expect(comment.colors?.bodyBackgroundColor).toBe('rgb(1, 2, 3)')
  expect(comment.paidText).toBe('¥1,000')
})
