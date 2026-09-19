// Runs with bun.
// パッケージの設定 API。実装は defaults / sanitize / read に分かれているが、
// 呼び出し側（テンプレートも設定画面もプラグイン本体も）はここだけ見ればよい。
export { DEFAULT_CONFIG } from './defaults'
export type {
  FieldValue,
  FlowConfig,
  FlowDirection,
  VariableBinding,
  VariableLookup,
} from './defaults'
export { createVariableLookup, readFlowConfig } from './read'
export { sanitizeConfig } from './sanitize'
