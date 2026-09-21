// Runs with bun.
// フォント候補の定義と絞り込み。端末フォントの取得（Local Font Access）は
// ブラウザ側の責務なのでここには入れず、候補の計算だけを持つ。
const FONT_QUOTES = /["']/gu

// 既定のフォント（DEFAULT_CONFIG.fontFamily）は候補に出さない。入力欄と
// 「デフォルトに戻す」で足りるため。
export const BASE_FONT_FAMILIES: readonly string[] = [
  'Noto Sans JP',
  'Noto Serif JP',
  'M PLUS 1p',
  'M PLUS Rounded 1c',
  'BIZ UDGothic',
  'BIZ UDMincho',
  'Hiragino Kaku Gothic ProN',
  'Hiragino Kaku Gothic Pro',
  'Hiragino Sans',
  'Hiragino Mincho ProN',
  'Yu Gothic',
  'Yu Gothic UI',
  'Yu Mincho',
  'Meiryo',
  'Meiryo UI',
  'MS PGothic',
  'MS PMincho',
  'TakaoGothic',
  'IPAexGothic',
  'Rounded Mplus 1c',
  'Source Han Sans JP',
  'Roboto',
  'Arial',
  'Helvetica',
  'Verdana',
  'Impact',
  'sans-serif',
  'serif',
  'monospace',
  'system-ui',
]

// document.fonts / queryLocalFonts が返す family 名の引用符を外す。
export const familyOf = (raw: string): string => raw.replace(FONT_QUOTES, '')

export const cssFontFamily = (raw: string): string => {
  const family = familyOf(raw).trim()
  return family === '' ? 'sans-serif' : family
}

// 入力に含まれる候補だけを、日本語の並び順で返す。
export const matchingFonts = (names: Iterable<string>, filter: string): readonly string[] => {
  const needle = filter.trim().toLowerCase()
  return [...names]
    .filter((name) => needle === '' || name.toLowerCase().includes(needle))
    .toSorted((left, right) => left.localeCompare(right, 'ja'))
}
