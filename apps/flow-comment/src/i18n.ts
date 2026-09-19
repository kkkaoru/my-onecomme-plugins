// Runs with bun.
// 設定画面の文言。キーだけを持ち、表示文字列は言語辞書から引く。
import { EN_MESSAGES } from './i18n/en'
import { JA_MESSAGES } from './i18n/ja'

const MESSAGES = { en: EN_MESSAGES, ja: JA_MESSAGES } as const

const DEFAULT_LOCALE = 'ja'
const LANGUAGE_CODE_LENGTH = 2

type Locale = keyof typeof MESSAGES

type MessageKey = keyof typeof JA_MESSAGES

type MessageParams = Readonly<Record<string, string>>

interface Translator {
  readonly locale: Locale
  readonly t: (key: MessageKey, params?: MessageParams) => string
}

const isLocale = (value: string): value is Locale => value in MESSAGES

// 保存された言語 → ブラウザの言語 → 既定 (ja) の順に決める。
const detectLocale = (stored: string | null): Locale => {
  if (stored !== null && isLocale(stored)) {
    return stored
  }
  const preferred = globalThis.navigator.language.slice(0, LANGUAGE_CODE_LENGTH)
  return isLocale(preferred) ? preferred : DEFAULT_LOCALE
}

// replaceAll のコールバックは、名前付きグループでも位置引数として値を渡す。
const interpolate = (template: string, params: MessageParams): string =>
  template.replaceAll(
    /\{(?<key>\w+)\}/gu,
    (match: string, key: string): string => params[key] ?? match,
  )

export const createTranslator = (stored: string | null = null): Translator => {
  const locale = detectLocale(stored)
  return {
    locale,
    t: (key: MessageKey, params: MessageParams = {}): string =>
      interpolate(MESSAGES[locale][key], params),
  }
}

export { DEFAULT_LOCALE, MESSAGES }
export type { Locale, MessageKey, MessageParams, Translator }
