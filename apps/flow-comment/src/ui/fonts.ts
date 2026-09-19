// Runs with bun.
// Font candidates for the family field. Local Font Access is optional, so the
// list starts from the common families and only grows when the user asks.
export const FONT_OPTIONS_ID = 'fc-font-options'
export const FONT_LOAD_ID = 'fc-font-load'
const FONT_QUOTES = /["']/gu

export const BASE_FONT_FAMILIES: readonly string[] = [
  'Noto Sans JP Variable',
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

// ---- フォント候補 ----
const fontNames = new Set<string>(BASE_FONT_FAMILIES)

const collectLoadedFonts = (): void => {
  for (const face of document.fonts) {
    fontNames.add(face.family.replace(FONT_QUOTES, ''))
  }
}

// queryLocalFonts() はユーザー操作と secure context が要るため、ボタン操作で呼ぶ。
const loadLocalFonts = async (): Promise<number> => {
  if (typeof queryLocalFonts !== 'function') {
    return 0
  }
  const before = fontNames.size
  for (const font of await queryLocalFonts()) {
    fontNames.add(font.family)
  }
  return fontNames.size - before
}

const sortedFontNames = (filter: string): readonly string[] => {
  const needle = filter.trim().toLowerCase()
  return [...fontNames]
    .filter((name) => needle === '' || name.toLowerCase().includes(needle))
    .toSorted((left, right) => left.localeCompare(right, 'ja'))
}

export const renderFontOptions = (filter: string): void => {
  const container = document.querySelector<HTMLElement>(`#${FONT_OPTIONS_ID}`)
  if (container === null) {
    return
  }
  container.replaceChildren(
    ...sortedFontNames(filter).map((name) => {
      const option = document.createElement('button')
      option.type = 'button'
      option.className = 'font-option'
      option.textContent = name
      option.addEventListener('click', () => {
        const input = document.querySelector<HTMLInputElement>('#field-fontFamily')
        if (input !== null) {
          input.value = name
          input.dispatchEvent(new Event('input'))
        }
      })
      return option
    }),
  )
}

export const wireFontList = (): void => {
  collectLoadedFonts()
  renderFontOptions('')
  const input = document.querySelector<HTMLInputElement>('#field-fontFamily')
  const loadButton = document.querySelector<HTMLElement>(`#${FONT_LOAD_ID}`)
  input?.addEventListener('input', () => {
    renderFontOptions(input.value)
  })
  loadButton?.addEventListener('click', () => {
    void (async (): Promise<void> => {
      try {
        const added = await loadLocalFonts()
        renderFontOptions(input?.value ?? '')
        console.info(`[flow-comment] loaded ${added} local fonts`)
      } catch (error) {
        console.info('[flow-comment] local font access denied', error)
      }
    })()
  })
}
