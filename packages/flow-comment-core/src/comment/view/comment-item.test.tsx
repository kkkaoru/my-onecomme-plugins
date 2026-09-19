// @vitest-environment happy-dom
// Runs with bun.
import { createRoot } from 'react-dom/client'
import { expect, test } from 'vitest'

import { sanitizeConfig } from '../../settings/config'
import type { FlowComment } from '../model/comment'
import type { FormatLabel } from '../rules/label'
import { CommentItem } from './comment-item'

// Tests use a plain formatter so assertions stay about the DOM.
const formatLabel: FormatLabel = (label) => label.text ?? label.kind
const elementFor = (
  comment: FlowComment,
  overrides: Record<string, unknown> = {},
): HTMLDivElement => {
  const host = document.createElement('div')
  document.body.append(host)
  createRoot(host).render(
    <CommentItem
      comment={comment}
      config={sanitizeConfig(overrides)}
      formatLabel={formatLabel}
      lane={0}
    />,
  )
  const element = host.firstElementChild
  if (!(element instanceof HTMLDivElement)) {
    throw new Error('CommentItem did not render a div')
  }
  return element
}

const comment = (overrides: Partial<FlowComment>): FlowComment => ({
  html: 'a',
  id: '1',
  name: 'n',
  ...overrides,
})

const withAuthor = (overrides: Partial<FlowComment>): FlowComment =>
  comment({ avatarUrl: 'https://x.test/a.png', ...overrides })

test('renders the comment html into the body', () => {
  expect.hasAssertions()
  expect(
    elementFor(comment({ html: '<b>x</b>' })).querySelector('.fc-text')?.innerHTML,
  ).toStrictEqual('<b>x</b>')
})

test('puts the label before the body', () => {
  expect.hasAssertions()
  expect(elementFor(comment({ paidText: '¥500' })).firstElementChild?.className).toBe('fc-paid')
})

test('hides the name unless it is enabled', () => {
  expect.hasAssertions()
  expect(elementFor(withAuthor({})).querySelector('.fc-name')).toBeNull()
  expect(
    elementFor(withAuthor({}), { showName: true }).querySelector('.fc-name')?.textContent,
  ).toStrictEqual('n')
})

test('hides the avatar unless it is enabled', () => {
  expect.hasAssertions()
  expect(elementFor(withAuthor({})).querySelector('.fc-avatar')).toBeNull()
  expect(
    elementFor(withAuthor({}), { showAvatar: true })
      .querySelector('.fc-avatar')
      ?.getAttribute('src'),
  ).toStrictEqual('https://x.test/a.png')
})

test('omits the avatar when the comment has no image', () => {
  expect.hasAssertions()
  expect(elementFor(comment({}), { showAvatar: true }).querySelector('.fc-avatar')).toBeNull()
})

test('renders a text badge without an image', () => {
  expect.hasAssertions()
  expect(
    elementFor(comment({ badges: [{ label: 'メンバー' }] })).querySelector('.fc-badge')
      ?.textContent,
  ).toStrictEqual('メンバー')
})

test('renders an image badge with a url', () => {
  expect.hasAssertions()
  expect(
    elementFor(comment({ badges: [{ label: 'メンバー', url: 'https://x.test/b.png' }] }))
      .querySelector('.fc-badge img')
      ?.getAttribute('src'),
  ).toStrictEqual('https://x.test/b.png')
})

test('hides badges when they are disabled', () => {
  expect.hasAssertions()
  expect(
    elementFor(comment({ badges: [{ label: 'メンバー' }] }), { showBadges: false }).querySelector(
      '.fc-badge',
    ),
  ).toBeNull()
})

test('flags gift and member on the item dataset', () => {
  expect.hasAssertions()
  const item = elementFor(comment({ isGift: true, isMember: true }))
  expect([
    item.dataset.gift,
    item.dataset.member,
    item.dataset.lane,
    item.dataset.id,
  ]).toStrictEqual(['true', 'true', '0', '1'])
})

test('applies the original super chat colours to the item', () => {
  expect.hasAssertions()
  const item = elementFor(
    comment({
      colors: {
        authorNameTextColor: 'rgb(255, 255, 255)',
        bodyBackgroundColor: 'rgb(208, 0, 0)',
        bodyTextColor: 'rgb(255, 255, 255)',
      },
      paidText: '¥10,000',
    }),
    { showName: true },
  )
  expect([
    item.style.background,
    item.style.color,
    item.querySelector<HTMLElement>('.fc-name')?.style.color,
  ]).toStrictEqual(['rgb(208, 0, 0)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)'])
})

test('applies the header colour to the amount badge', () => {
  expect.hasAssertions()
  const badge = elementFor(
    comment({ colors: { headerTextColor: 'rgb(255, 255, 255)' }, paidText: '¥100' }),
  ).querySelector<HTMLElement>('.fc-paid')
  expect(badge?.style.color).toStrictEqual('rgb(255, 255, 255)')
})

test('leaves the look alone without service colours', () => {
  expect.hasAssertions()
  const item = elementFor(comment({}))
  expect([item.style.background, item.style.color]).toStrictEqual(['', '#333333'])
})

test('shows the paid author for a card by default', () => {
  expect.hasAssertions()
  const item = elementFor(withAuthor({ colors: { bodyBackgroundColor: 'rgb(1, 2, 3)' } }))
  expect([
    item.querySelector('.fc-avatar') === null,
    item.querySelector('.fc-name') === null,
  ]).toStrictEqual([false, false])
})
