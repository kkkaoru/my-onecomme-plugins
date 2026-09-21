import {
  BASE_FONT_FAMILIES,
  familyOf,
  matchingFonts,
} from '@my-onecomme-plugins/flow-comment-core/fonts'
// Runs with bun.
// フォント候補。端末のフォントは Local Font Access がある環境でのみ増える。
// すでに許可されているときは、ボタンを押させずに読み込む。
import { useCallback, useMemo, useState } from 'react'

// Local Font Access API（ブラウザ標準）は secure context でのみ生える。
// 型は使う側のこのファイルに置き、別の d.ts を読ませない。
interface LocalFontData {
  readonly family: string
}

declare global {
  function queryLocalFonts(): Promise<readonly LocalFontData[]>
}

export type FontLoadResult = 'idle' | 'loaded' | 'unsupported' | 'denied'

export interface FontCandidates {
  /** 端末のフォントを読める環境か。読めないときはボタンを出さない。 */
  readonly canLoad: boolean
  readonly loadLocal: () => Promise<void>
  readonly loadResult: FontLoadResult
  readonly matches: readonly string[]
}

interface PermissionsLike {
  readonly query: (descriptor: { readonly name: string }) => Promise<{ readonly state: string }>
}

const isPermissionsLike = (value: unknown): value is PermissionsLike =>
  typeof value === 'object' && value !== null && typeof Reflect.get(value, 'query') === 'function'

// 端末フォントは数千件になることがある。候補を持ち続けても得がないので上限を設ける。
const MAX_CANDIDATES = 300

const isFontFaceSet = (value: unknown): value is FontFaceSet =>
  typeof value === 'object' &&
  value !== null &&
  typeof Reflect.get(value, Symbol.iterator) === 'function'

const loadedFamilies = (): readonly string[] => {
  const fonts = Reflect.get(document, 'fonts')
  return isFontFaceSet(fonts) ? [...fonts].map((face) => familyOf(face.family)) : []
}

// queryLocalFonts() はユーザー操作と secure context が要るため、ボタン操作で呼ぶ。
const localFamilies = async (): Promise<readonly string[]> => {
  if (typeof queryLocalFonts !== 'function') {
    return []
  }
  const fonts = await queryLocalFonts()
  return fonts.map((font) => font.family)
}

const hasLocalFontAccess = (): boolean => typeof queryLocalFonts === 'function'

const permissionGranted = async (): Promise<boolean> => {
  const permissions = Reflect.get(navigator, 'permissions')
  if (!isPermissionsLike(permissions)) {
    return false
  }
  try {
    const status = await permissions.query({ name: 'local-fonts' })
    return status.state === 'granted'
  } catch {
    // 権限 API が local-fonts を知らない環境では、ボタンから読み込む。
    return false
  }
}

const loadIfGranted = async (loadLocal: () => Promise<void>): Promise<void> => {
  if (!hasLocalFontAccess()) {
    return
  }
  if (await permissionGranted()) {
    await loadLocal()
  }
}

export const useFonts = (filter: string): FontCandidates => {
  const [added, setAdded] = useState<readonly string[]>([])
  // そもそも API が無い環境は、ボタンを押させずに「読めない」と伝える。
  const [loadResult, setLoadResult] = useState<FontLoadResult>(() =>
    hasLocalFontAccess() ? 'idle' : 'unsupported',
  )
  const names = useMemo(
    () =>
      [...new Set([...BASE_FONT_FAMILIES, ...loadedFamilies(), ...added])].slice(0, MAX_CANDIDATES),
    [added],
  )
  const matches = useMemo(() => matchingFonts(names, filter), [filter, names])

  const loadLocal = useCallback(async (): Promise<void> => {
    if (!hasLocalFontAccess()) {
      setLoadResult('unsupported')
      return
    }
    try {
      setAdded(await localFamilies())
      setLoadResult('loaded')
    } catch (error) {
      console.info('[flow-comment] local font access denied', error)
      setLoadResult('denied')
    }
  }, [])
  const [started, setStarted] = useState(false)
  if (!started) {
    setStarted(true)
    void loadIfGranted(loadLocal)
  }

  return { canLoad: hasLocalFontAccess(), loadLocal, loadResult, matches }
}
