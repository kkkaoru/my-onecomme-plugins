import { FIELD_LABEL_KEYS } from '@my-onecomme-plugins/flow-comment-core/fields'
import { SAMPLE_LABEL_KEYS } from '@my-onecomme-plugins/flow-comment-core/samples'
import { UI_MESSAGE_KEYS } from '@my-onecomme-plugins/flow-comment-ui/messages'
// @vitest-environment happy-dom
// Runs with bun.
import { afterEach, expect, test } from 'vitest'

import { DEFAULT_LOCALE, MESSAGES, createTranslator } from './i18n'
import { EN_MESSAGES } from './i18n/en'
import { JA_MESSAGES } from './i18n/ja'

const originalLanguage = globalThis.navigator.language

const setBrowserLanguage = (value: string): void => {
  Object.defineProperty(globalThis.navigator, 'language', { configurable: true, value })
}

afterEach(() => {
  setBrowserLanguage(originalLanguage)
})

test('uses the stored locale when it is known', () => {
  expect.hasAssertions()
  expect(createTranslator('en').locale).toBe('en')
})

test('ignores a stored locale that is not supported', () => {
  expect.hasAssertions()
  setBrowserLanguage('fr-FR')
  expect(createTranslator('de').locale).toBe(DEFAULT_LOCALE)
})

test('falls back to the browser language', () => {
  expect.hasAssertions()
  setBrowserLanguage('en-GB')
  expect(createTranslator(null).locale).toBe('en')
})

test('defaults to Japanese when the browser language is unsupported', () => {
  expect.hasAssertions()
  setBrowserLanguage('fr-FR')
  expect(createTranslator(null).locale).toBe(DEFAULT_LOCALE)
})

test('returns the message for the locale', () => {
  expect.hasAssertions()
  expect(createTranslator('ja').t('saveSuccess')).toBe('保存しました。')
  expect(createTranslator('en').t('saveSuccess')).toBe('Saved.')
})

test('interpolates named parameters', () => {
  expect.hasAssertions()
  expect(createTranslator('ja').t('presetSaved', { name: '夜' })).toBe('「夜」を保存しました。')
})

test('keeps the placeholder when a parameter is missing', () => {
  expect.hasAssertions()
  expect(createTranslator('en').t('presetSaved')).toBe('Saved "{name}".')
})

test('has the same keys in every locale', () => {
  expect.hasAssertions()
  expect(Object.keys(MESSAGES.ja).toSorted()).toStrictEqual(Object.keys(MESSAGES.en).toSorted())
})

// 画面が使うキーを辞書がすべて持っているか。抜けは英語側で起きやすい。
test('covers every key the ui package asks for', () => {
  expect.hasAssertions()
  const asked = [...FIELD_LABEL_KEYS, ...SAMPLE_LABEL_KEYS, ...UI_MESSAGE_KEYS]
  expect(asked.filter((key) => !(key in JA_MESSAGES))).toStrictEqual([])
  expect(asked.filter((key) => !(key in EN_MESSAGES))).toStrictEqual([])
})
