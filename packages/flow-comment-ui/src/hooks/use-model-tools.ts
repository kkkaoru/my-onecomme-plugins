// Runs with bun.
// Register WebMCP tools once. Callbacks stay current via useSettings.
import { useState } from 'react'

import type { ModelToolWiring } from '../model-tools'
import { buildModelTools, resolveModelContext } from '../model-tools'

const registerTools = (wiring: ModelToolWiring): void => {
  const context = resolveModelContext()
  if (context === null) {
    console.info('[flow-comment] WebMCP 未対応のため設定ツールは登録しません')
    return
  }
  for (const tool of buildModelTools(wiring)) {
    context.registerTool(tool)
  }
  console.info('[flow-comment] WebMCP に設定ツールを登録しました')
}

export const useModelTools = (wiring: ModelToolWiring): void => {
  const [done, setDone] = useState(false)
  if (done) {
    return
  }
  setDone(true)
  registerTools(wiring)
}
