import { exercise } from '@testing/react'
// @vitest-environment happy-dom
// Runs with bun.
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, test } from 'vitest'

import { DEFAULT_CONFIG, sanitizeConfig } from '../../settings/config'
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
  // React 19 の createRoot は同期に描画しないので act で流し切る。
  act(() => {
    createRoot(host).render(
      <CommentItem
        comment={comment}
        config={sanitizeConfig(overrides)}
        formatLabel={formatLabel}
        lane={0}
      />,
    )
  })
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

test('paints a member name in YouTube green', () => {
  expect.hasAssertions()
  expect(
    elementFor(comment({ isMember: true, name: 'かえで' }), {
      showName: true,
    }).querySelector<HTMLElement>('.fc-name')?.style.color,
  ).toBe('#2ba640')
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
    item.dataset['gift'],
    item.dataset['member'],
    item.dataset['lane'],
    item.dataset['id'],
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
  expect([
    item.style.background,
    item.querySelector<HTMLElement>('.fc-text')?.style.color,
  ]).toStrictEqual(['', DEFAULT_CONFIG.textColor])
})

test('shows the paid author for a card by default', () => {
  expect.hasAssertions()
  const item = elementFor(withAuthor({ colors: { bodyBackgroundColor: 'rgb(1, 2, 3)' } }))
  expect([
    item.querySelector('.fc-avatar') === null,
    item.querySelector('.fc-name') === null,
  ]).toStrictEqual([false, false])
})

// React Compiler の覚えた値は、同じ props と変えた props の両方で試す。
test('renders through unchanged and changed props', () => {
  expect.hasAssertions()
  const plain = comment({})
  const member = comment({ badges: [{ label: 'メンバー' }], isMember: true, name: 'ゆず' })
  const container = exercise(
    <CommentItem comment={plain} config={sanitizeConfig({})} formatLabel={formatLabel} lane={0} />,
    <CommentItem
      comment={member}
      config={sanitizeConfig({ showName: false })}
      formatLabel={formatLabel}
      lane={1}
    />,
  )
  expect(container.querySelector('.fc-item')).not.toBeNull()
})
