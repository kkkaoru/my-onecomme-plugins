// Runs with bun.
// 設定の解決順: CSS 変数 > プラグイン設定 > 既定値。
// CSS 変数が勝つので、OBS のブラウザソース単位の微調整は設定画面を触らずに済む。
import { DEFAULT_CONFIG } from './defaults'
import type { FlowConfig, VariableLookup } from './defaults'
import { sanitizeConfig } from './sanitize'
import { FLOW_VARIABLES } from './variables'

export const createVariableLookup = (
  readVariable: (name: string) => string,
  settings: FlowConfig | null,
): VariableLookup => {
  const overrides = new Map<string, string>()
  for (const binding of FLOW_VARIABLES) {
    if (settings !== null) {
      overrides.set(binding.name, String(settings[binding.field]))
    }
  }
  return (name, fallback) => {
    const variable = readVariable(name).trim()
    if (variable !== '') {
      return variable
    }
    return overrides.get(name) ?? fallback
  }
}

// 対応表を一度だけ引いて素の値にし、検証は sanitizeConfig に任せる。
// 項目ごとの読み取り関数を並べないので、設定を増やしてもここは伸びない。
export const readFlowConfig = (lookup: VariableLookup): FlowConfig =>
  sanitizeConfig(
    Object.fromEntries(
      FLOW_VARIABLES.map((binding) => [
        binding.field,
        lookup(binding.name, String(DEFAULT_CONFIG[binding.field])),
      ]),
    ),
  )
