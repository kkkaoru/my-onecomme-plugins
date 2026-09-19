// Local Font Access API（ブラウザ標準）の最小定義。
// secure context でのみ提供されるため、呼び出し側は必ず
// `typeof queryLocalFonts === 'function'` で判定すること。
interface LocalFontData {
  readonly family: string
}

declare function queryLocalFonts(): Promise<readonly LocalFontData[]>
