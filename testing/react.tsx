// Runs with bun.
// テスト用の React ヘルパー。React 19 の createRoot は同期に描画しないので、
// 描画と操作はすべて act で流し切る。
import { act } from 'react'
import type { ReactElement } from 'react'
import { createRoot } from 'react-dom/client'
import { vi } from 'vitest'

// テスト中で「あるはず」の値を取り出す。条件分岐をテスト本文に書かないため。
// テストでは訳さずキーをそのまま返す。文言そのものはアプリの辞書が持つ。
export const translate = (key: string): string => key

export const required = <T,>(value: T | null | undefined, what = 'value'): T => {
  if (value === null || value === undefined) {
    throw new Error(`missing ${what}`)
  }
  return value
}

export const mount = (element: ReactElement): HTMLElement => {
  const container = document.createElement('div')
  document.body.append(container)
  act(() => {
    createRoot(container).render(element)
  })
  return container
}

// 同じ要素を描き直したい場合（設定の変更など）に使う。
export const mountWithUpdate = (
  element: ReactElement,
): { readonly container: HTMLElement; readonly update: (next: ReactElement) => void } => {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  act(() => {
    root.render(element)
  })
  return {
    container,
    update: (next) => {
      act(() => {
        root.render(next)
      })
    },
  }
}

// React Compiler は値を props ごとに覚えるので、描画の分岐は「変わったとき」と
// 「変わらないとき」の両方を通る必要がある。同じ要素で描き直してから、変えた
// 要素でもう一度描く。
export const exercise = (element: ReactElement, changed: ReactElement): HTMLElement => {
  const { container, update } = mountWithUpdate(element)
  update(element)
  update(changed)
  update(element)
  return container
}

export const click = (target: Element): void => {
  act(() => {
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

// 非同期のハンドラを持つボタン用。マイクロタスクまで流し切る。
export const clickAsync = async (target: Element): Promise<void> => {
  await act(async () => {
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    await Promise.resolve()
  })
}

// React は入力値を追跡しているので、直接 .value を書くと change が届かない。
// ネイティブの setter を通してから input を送る。
const nativeValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set

export const typeInto = (target: Element, value: string): void => {
  if (!(target instanceof HTMLInputElement)) {
    throw new Error('typeInto needs an input')
  }
  act(() => {
    if (nativeValueSetter === undefined) {
      target.value = value
    } else {
      nativeValueSetter.call(target, value)
    }
    target.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

export const typeIntoTextArea = (target: Element, value: string): void => {
  if (!(target instanceof HTMLTextAreaElement)) {
    throw new Error('typeIntoTextArea needs a textarea')
  }
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set
  act(() => {
    if (setter === undefined) {
      target.value = value
    } else {
      setter.call(target, value)
    }
    target.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

export const advance = (milliseconds: number): void => {
  act(() => {
    vi.advanceTimersByTime(milliseconds)
  })
}
