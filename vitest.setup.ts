// Runs with bun.
// React 19 のテストでは act 環境であることを明示する。createRoot は同期に
// 描画しないため、テストは act(...) で流し切る必要がある。
// このグローバルの型は testing/globals.d.ts が持っている。
globalThis.IS_REACT_ACT_ENVIRONMENT = true
