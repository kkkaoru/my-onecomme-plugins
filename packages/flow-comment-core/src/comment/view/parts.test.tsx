// @vitest-environment happy-dom
// Runs with bun.
import { exercise, mount, mountWithUpdate } from '@testing/react'
import { expect, test } from 'vitest'

import { AuthorName, Avatar, Badge, CommentBody, PaidLabel } from './parts'

test('shows the avatar only when it is wanted', () => {
  expect.hasAssertions()
  const { container, update } = mountWithUpdate(<Avatar alt="みなと" url="a.png" visible />)
  expect(container.querySelector('.fc-avatar')?.getAttribute('src')).toBe('a.png')
  update(<Avatar alt="みなと" url="a.png" visible={false} />)
  expect(container.querySelector('.fc-avatar')).toBeNull()
  update(<Avatar alt="みなと" url="b.png" visible />)
  expect(container.querySelector('.fc-avatar')?.getAttribute('src')).toBe('b.png')
})

test('writes a badge with and without an image', () => {
  expect.hasAssertions()
  const { container, update } = mountWithUpdate(<Badge badge={{ label: 'メンバー' }} />)
  expect(container.querySelector('.fc-badge')?.textContent).toBe('メンバー')
  update(<Badge badge={{ label: 'ギフト', url: 'gift.png' }} />)
  expect(container.querySelector('.fc-badge img')?.getAttribute('src')).toBe('gift.png')
  expect(container.querySelector('.fc-badge')?.getAttribute('title')).toBe('ギフト')
})

test('drops the amount label when the service sent none', () => {
  expect.hasAssertions()
  const { container, update } = mountWithUpdate(<PaidLabel colors={undefined} label={undefined} />)
  expect(container.querySelector('.fc-paid')).toBeNull()
  update(<PaidLabel colors={undefined} label="¥1,000" />)
  expect(container.querySelector('.fc-paid')?.textContent).toBe('¥1,000')
  expect(container.querySelector<HTMLElement>('.fc-paid')?.style.color).toBe('')
  update(<PaidLabel colors={{ headerTextColor: 'rgb(255, 255, 255)' }} label="¥1,000" />)
  expect(container.querySelector<HTMLElement>('.fc-paid')?.style.color).toBe('rgb(255, 255, 255)')
})

test('shows the author name only when it is wanted', () => {
  expect.hasAssertions()
  const { container, update } = mountWithUpdate(
    <AuthorName color="#ffd400" name="みなと" visible />,
  )
  expect(container.querySelector('.fc-name')?.textContent).toBe('みなと')
  expect(container.querySelector<HTMLElement>('.fc-name')?.style.color).toBe('#ffd400')
  update(<AuthorName color="#ffd400" name="みなと" visible={false} />)
  expect(container.querySelector('.fc-name')).toBeNull()
  update(<AuthorName color="#ffffff" name="そらまめ" visible />)
  expect(container.querySelector('.fc-name')?.textContent).toBe('そらまめ')
})

test('renders the ready-made body as it arrived', () => {
  expect.hasAssertions()
  const { container, update } = mountWithUpdate(<CommentBody color="#333333" html="<b>a</b>" />)
  const body = container.querySelector<HTMLElement>('.fc-text')
  expect(body?.innerHTML).toBe('<b>a</b>')
  expect(body?.style.color).toBe('#333333')
  update(<CommentBody color="#eeeeee" html="<i>b</i>" />)
  expect(container.querySelector('.fc-text')?.innerHTML).toBe('<i>b</i>')
})

test('keeps the same output for the same props', () => {
  expect.hasAssertions()
  const container = mount(<Badge badge={{ label: 'メンバー', url: 'x.png' }} />)
  expect(container.querySelector('.fc-badge img')).not.toBeNull()
})

// React Compiler は props ごとに結果を覚える。同じ props と変えた props の両方を通す。
test('keeps every part through unchanged and changed props', () => {
  expect.hasAssertions()
  const avatar = { alt: 'みなと', url: 'a.png', visible: true }
  expect(
    exercise(<Avatar {...avatar} />, <Avatar {...avatar} url="b.png" />).querySelector(
      '.fc-avatar',
    ),
  ).not.toBeNull()

  const badge = { label: 'メンバー' }
  expect(
    exercise(
      <Badge badge={badge} />,
      <Badge badge={{ label: 'メンバー', url: 'x.png' }} />,
    ).querySelector('.fc-badge'),
  ).not.toBeNull()

  expect(
    exercise(
      <PaidLabel colors={undefined} label="¥100" />,
      <PaidLabel colors={{ headerTextColor: 'rgb(255, 255, 255)' }} label="¥100" />,
    ).querySelector('.fc-paid'),
  ).not.toBeNull()

  const author = { color: '#ffd400', name: 'みなと', visible: true }
  expect(
    exercise(<AuthorName {...author} />, <AuthorName {...author} name="そらまめ" />).querySelector(
      '.fc-name',
    ),
  ).not.toBeNull()

  const body = { color: '#333333', html: 'a' }
  expect(
    exercise(<CommentBody {...body} />, <CommentBody {...body} html="b" />).querySelector(
      '.fc-text',
    ),
  ).not.toBeNull()
})
