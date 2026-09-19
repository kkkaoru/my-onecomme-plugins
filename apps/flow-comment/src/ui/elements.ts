// Runs with bun.
// The page elements the screen depends on, looked up once at start.
export const setStatus = (element: HTMLElement, message: string): void => {
  element.textContent = message
}

export interface UiElements {
  readonly fields: HTMLElement
  readonly form: HTMLFormElement
  readonly preview: HTMLElement
  readonly reset: HTMLElement
  readonly status: HTMLElement
}

export const findElements = (): UiElements | null => {
  const fields = document.querySelector<HTMLElement>('#fields')
  const form = document.querySelector<HTMLFormElement>('#form')
  const preview = document.querySelector<HTMLElement>('#preview')
  const reset = document.querySelector<HTMLElement>('#reset')
  const status = document.querySelector<HTMLElement>('#status')
  if (fields === null || form === null || preview === null || reset === null || status === null) {
    return null
  }
  return { fields, form, preview, reset, status }
}
