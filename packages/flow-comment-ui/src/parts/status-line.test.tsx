import { mount } from '@testing/react'
// @vitest-environment happy-dom
// Runs with bun.
import { expect, test } from 'vitest'

import { StatusLine } from './status-line'

test('shows the message to the reader as well as the eye', () => {
  expect.hasAssertions()
  const container = mount(<StatusLine message="saveSuccess" />)
  const line = container.querySelector('[role="status"]')
  expect(line?.textContent).toBe('saveSuccess')
})

test('carries an empty message without dropping the live region', () => {
  expect.hasAssertions()
  const container = mount(<StatusLine message="" />)
  expect(container.querySelector('[role="status"]')).not.toBeNull()
})
