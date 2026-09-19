// Runs with bun.
// 設定の状態を画面に伝えるだけの行。読み上げにも乗せる。
import type { ReactElement } from 'react'

export interface StatusLineProps {
  readonly message: string
}

export const StatusLine = ({ message }: StatusLineProps): ReactElement => (
  <p className="fc-status" role="status">
    {message}
  </p>
)
