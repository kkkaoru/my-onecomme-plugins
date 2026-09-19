import { BASE_FONT_FAMILIES } from '@my-onecomme-plugins/flow-comment-core/fonts'
import { clickAsync, mount, mountWithUpdate, required } from '@testing/react'
// @vitest-environment happy-dom
// Runs with bun.
import type { ReactElement } from 'react'
import { afterEach, expect, test, vi } from 'vitest'

import { useFonts } from './use-fonts'

const Probe = ({ filter }: { readonly filter: string }): ReactElement => {
  const { loadLocal, matches } = useFonts(filter)
  return (
    <div>
      <button
        onClick={() => {
          void loadLocal()
        }}
        type="button"
      >
        load
      </button>
      <ul>
        {matches.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  )
}

const names = (container: HTMLElement): readonly string[] =>
  [...container.querySelectorAll('li')].map((item) => item.textContent ?? '')

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

test('offers the built-in candidates when nothing is typed', () => {
  expect.hasAssertions()
  const container = mount(<Probe filter="" />)
  expect(names(container).length).toBe(BASE_FONT_FAMILIES.length)
})

test('narrows the candidates to what was typed', () => {
  expect.hasAssertions()
  const container = mount(<Probe filter="roboto" />)
  expect(names(container)).toStrictEqual(['Roboto'])
})

test('adds the fonts the document already loaded', () => {
  expect.hasAssertions()
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: [{ family: '"Only In Tests"' }],
  })
  const container = mount(<Probe filter="only in tests" />)
  expect(names(container)).toStrictEqual(['Only In Tests'])
})

test('adds the fonts the machine allows access to', async () => {
  expect.hasAssertions()
  vi.stubGlobal(
    'queryLocalFonts',
    vi.fn(() => Promise.resolve([{ family: 'Machine Font' }])),
  )
  const { container, update } = mountWithUpdate(<Probe filter="machine" />)
  const button = required(container.querySelector('button'), 'button')
  await clickAsync(button)
  update(<Probe filter="machine" />)
  expect(names(container)).toStrictEqual(['Machine Font'])
})

test('keeps the list when the browser cannot list local fonts', async () => {
  expect.hasAssertions()
  const { container } = mountWithUpdate(<Probe filter="roboto" />)
  const button = required(container.querySelector('button'), 'button')
  await clickAsync(button)
  expect(names(container)).toStrictEqual(['Roboto'])
})

test('keeps the list when the user denies access', async () => {
  expect.hasAssertions()
  const info = vi.spyOn(console, 'info').mockReturnValue()
  vi.stubGlobal(
    'queryLocalFonts',
    vi.fn(() => Promise.reject(new Error('denied'))),
  )
  const { container } = mountWithUpdate(<Probe filter="roboto" />)
  const button = required(container.querySelector('button'), 'button')
  await clickAsync(button)
  expect(names(container)).toStrictEqual(['Roboto'])
  expect(info).toHaveBeenCalledWith('[flow-comment] local font access denied', expect.anything())
})

// すでに許可されていれば、ボタンを押させずに読み込む。
test('loads device fonts by itself when permission is already granted', async () => {
  expect.hasAssertions()
  vi.stubGlobal(
    'queryLocalFonts',
    vi.fn<() => Promise<readonly { readonly family: string }[]>>(() =>
      Promise.resolve([{ family: 'Granted Font' }]),
    ),
  )
  Object.defineProperty(navigator, 'permissions', {
    configurable: true,
    value: { query: () => Promise.resolve({ state: 'granted' }) },
  })
  const container = mount(<Probe filter="granted" />)
  await vi.waitFor(() => {
    expect(container.textContent).toContain('Granted Font')
  })
  vi.unstubAllGlobals()
})

// Font Loading API が無い環境でも、組み込みの候補だけで動く。
test('works without the font loading API', () => {
  expect.hasAssertions()
  Object.defineProperty(document, 'fonts', { configurable: true, value: undefined })
  const container = mount(<Probe filter="roboto" />)
  expect(names(container)).toStrictEqual(['Roboto'])
})
