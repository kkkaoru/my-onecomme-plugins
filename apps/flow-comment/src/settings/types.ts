// Runs with bun.
// OneComme がプラグインに渡す API の最小型。実装から独立させ、
// 保存（store）と HTTP（request）の両方から同じ型を使う。

interface OneCommeStore {
  readonly get: (key: string) => unknown
  readonly set: (key: string, value: unknown) => void
}

interface PluginRequest {
  readonly body?: unknown
  readonly method: string
  readonly params?: Readonly<Record<string, string>>
  readonly url: string
}

interface PluginResponse {
  readonly code: number
  readonly response: unknown
}

export type { OneCommeStore, PluginRequest, PluginResponse }
