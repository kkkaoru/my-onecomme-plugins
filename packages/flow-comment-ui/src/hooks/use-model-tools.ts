// Runs with bun.
// WebMCP への登録は1度だけ。渡された口は useSettings 側で最新に保たれる。
import { useEffect } from 'react'

import type { ModelToolWiring } from '../model-tools'
import { buildModelTools, resolveModelContext } from '../model-tools'

export const useModelTools = (wiring: ModelToolWiring): void => {
  const { api, apply, current, setStatus, t } = wiring

  useEffect(() => {
    const context = resolveModelContext()
    if (context === null) {
      console.info('[flow-comment] WebMCP 未対応のため設定ツールは登録しません')
      return
    }
    for (const tool of buildModelTools({ api, apply, current, setStatus, t })) {
      context.registerTool(tool)
    }
    console.info('[flow-comment] WebMCP に設定ツールを登録しました')
  }, [api, apply, current, setStatus, t])
}
