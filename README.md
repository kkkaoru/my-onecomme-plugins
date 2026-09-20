# my-onecomme-plugins

わんコメ (OneComme) プラグインの monorepo。bun workspaces で管理する。

エージェントは `AGENTS.md` を先に読む。テストではわんコメは更新されない。

## 必要環境

- bun 1.3+
- Node.js 22.12+ (vitest 5 の要件)

## ディレクトリ

- `packages/*` — 配布するわんコメプラグイン。ビルドして `dist/<plugin>/` を配る。
- `apps/*` — 配布しないもの。設定 UI、CLI、開発用ツールなど。

どちらも oxlint / markuplint / oxfmt / tsc / vitest / coverage の対象に入っている。追加の設定は不要。

## リンタ / フォーマッタの分担

| ツール     | 対象       | 役割                |
| ---------- | ---------- | ------------------- |
| oxlint     | JS / TS    | 静的解析 (検査のみ) |
| markuplint | HTML       | 静的解析 (検査のみ) |
| oxfmt      | 全ファイル | 整形 (唯一の書き手) |

整形を oxfmt だけに任せることで、フォーマッタ同士が互いの出力を書き換え続ける状態を避け
ている。markuplint の `--fix` は使わない。

除外設定は `.markuplintrc` の `excludeFiles`、`.oxfmtrc.json` と `.oxlintrc.json` の
`ignorePatterns` で揃えてある。

## React Compiler

React のコードは Vite の変換時に React Compiler (`babel-plugin-react-compiler`) を通す。
入口はリポジトリ直下の `vite.react.ts` 1 か所だけ。

- `bun run build` — `apps/*/vite.config.mts` が JSX 変換・Fast Refresh と一緒に載せる
- `bun run test` — vitest も最適化後のコードで走る
- `bun run build-storybook` / `bun run storybook` — `.storybook/main.ts` の `viteFinal` で追加

Vite 8 (rolldown) では Babel のパスをプラグインとして渡すため `@rolldown/plugin-babel` を使う。
コンパイラが最適化を諦める書き方は oxlint が止める (`react/purity` / `react/immutability` /
`react/refs` / `react/set-state-in-effect` など。深刻度は eslint-plugin-react-hooks の
recommended-latest に合わせている)。一時的に外したいときはコンポーネントの先頭に
`"use no memo"` を書く。

## コマンド

| コマンド                                                   | 内容                                                              |
| ---------------------------------------------------------- | ----------------------------------------------------------------- |
| `bun install`                                              | 依存関係のインストール                                            |
| `bun run build`                                            | 全パッケージをビルド。flow-comment はわんコメへコピーする         |
| `bun run dev`                                              | flow-comment を監視してビルド・わんコメ配置（開発中はこれを常時） |
| `bun run tsc`                                              | 型チェック（アプリ・パッケージ・リポジトリ直下をまとめて）        |
| `bun run tsc:apps` / `bun run tsc:packages`                | アプリ / パッケージだけを型チェック                               |
| `bun run --filter '@my-onecomme-plugins/flow-comment' tsc` | 1 つのワークスペースだけを型チェック                              |
| `bun run lint`                                             | oxlint + markuplint                                               |
| `bun run lint:fix`                                         | oxlint --fix (HTML の整形は oxfmt の役割)                         |
| `bun run format` / `bun run format:check`                  | oxfmt (JS / TS / HTML)                                            |
| `bun run test`                                             | vitest                                                            |
| `bun run coverage`                                         | カバレッジ (statements/lines/functions/branches すべて 95% 以上)  |

HTML だけ検査したい場合は `bunx markuplint "**/*.html"`。

## 型チェック

設定は 2 段構えで、厳しいオプションは `tsconfig.base.json` にだけ書く。

- `tsconfig.base.json` — 全ワークスペース共通の `compilerOptions`
- `tsconfig.json` / `apps/*/tsconfig.json` / `packages/*/tsconfig.json` —
  それぞれが自分の担当ぶんだけを `include` する

各ワークスペースの `package.json` が `tsc: tsc -p tsconfig.json` を持つので、単位ごとに
判定できる。`bun run tsc` は全部を順に回す（`.githooks/pre-commit` もこれを見る）。

```sh
bun run tsc                                      # 全部
bun run tsc:apps                                 # apps/* だけ
bun run tsc:packages                             # packages/* だけ
bun run --filter '@my-onecomme-plugins/flow-comment-core' tsc   # 1 つだけ
```

厳しさの内訳（`tsconfig.base.json`）:

- `strict` / `noUncheckedIndexedAccess` / `exactOptionalPropertyTypes`
- `noPropertyAccessFromIndexSignature` — index signature は `x['key']` を強制し、綴り違いを止める
- `noImplicitReturns` / `noFallthroughCasesInSwitch` / `allowUnreachableCode: false`
- `erasableSyntaxOnly`（enum や namespace を禁止） / `noUncheckedSideEffectImports`
- `noUnusedLocals` / `noUnusedParameters`

型定義を持たないグローバルは、使う側の `.d.ts` で補う
（`testing/globals.d.ts`、`apps/flow-comment/src/local-fonts.d.ts`）。

## Git フック

`.githooks/pre-commit` がコミット時に oxfmt / oxlint / markuplint / vitest を実行する。
git 標準の `core.hooksPath` を使うため追加の依存はない。

`bun install` の `prepare` スクリプトで `core.hooksPath` が自動設定される。手動で設定
する場合:

```sh
git config core.hooksPath .githooks
```

一時的に無効化する場合は `git commit --no-verify`。フックを手動で実行して確認する場合は
`git hook run pre-commit`。

## プラグインの追加

`packages/example-plugin` をコピーし、`package.json` の `name` と `src/plugin.ts` の `uid`
を書き換える。テストは対象ファイルと同じディレクトリに `*.test.ts` として置く。

## ビルド

わんコメは `module.exports` がプラグイン定義そのものであることを要求する。bun は
`export default` を `exports.default` に変換するため、`--footer` で剥がしている。

```sh
bun build src/plugin.ts --outdir dist/<plugin> --target node --format cjs \
  --footer 'module.exports = module.exports.default'
cp -R static/. dist/<plugin>/   # 設定 UI (index.html など) があれば同梱
```

`dist/<plugin>/` をわんコメのプラグインフォルダに置く。

出力は CommonJS なので、プラグインの `package.json` に `"type": "module"` を書かない
こと (書くと Node が `plugin.js` を ESM として読み込み、プラグインが認識されない)。
