// テスト環境のグローバル型。アプリ側の local-fonts.d.ts と同じやり方で、
// 型定義を持たないグローバルをここで補う。
//
// IS_REACT_ACT_ENVIRONMENT は React 19 が act 環境の判定に読むが、
// @types/react は宣言しない。宣言が無いと vitest.setup.ts の代入が
// 「globalThis に index signature が無い」で型エラーになる。
declare var IS_REACT_ACT_ENVIRONMENT: boolean | undefined
