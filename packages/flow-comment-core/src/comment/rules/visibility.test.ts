// Runs with bun.
import { expect, test } from 'vitest'

import { sanitizeConfig } from '../../settings/config'
import type { FlowComment } from '../model/comment'
import { selectVisibility } from './visibility'

const comment = (overrides: Partial<FlowComment>): FlowComment => ({
  html: 'a',
  id: '1',
  name: 'n',
  ...overrides,
})

const colored: FlowComment = comment({
  colors: { bodyBackgroundColor: 'rgb(1, 2, 3)' },
})

test('uses the shared switches for a plain comment', () => {
  expect.hasAssertions()
  const config = sanitizeConfig({ showAvatar: true, showName: true })
  expect(selectVisibility(comment({}), config)).toStrictEqual({
    avatar: true,
    badges: true,
    name: true,
  })
})

test('uses the paid switches for a card', () => {
  expect.hasAssertions()
  const config = sanitizeConfig({ showAvatar: false, showName: false })
  expect(selectVisibility(colored, config)).toStrictEqual({
    avatar: true,
    badges: true,
    name: true,
  })
})

test('turns the paid parts off independently of the shared switches', () => {
  expect.hasAssertions()
  const config = sanitizeConfig({ showPaidAvatar: false, showPaidName: false })
  expect(selectVisibility(colored, config)).toStrictEqual({
    avatar: false,
    badges: true,
    name: false,
  })
})

test('hides badges for every kind of comment', () => {
  expect.hasAssertions()
  const config = sanitizeConfig({ showBadges: false })
  expect(selectVisibility(comment({}), config).badges).toBe(false)
  expect(selectVisibility(colored, config).badges).toBe(false)
})
