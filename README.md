# my-onecomme-plugins

わんコメ (OneComme) プラグインの monorepo。bun workspaces で管理する。

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

## コマンド

| コマンド                                  | 内容                                                             |
| ----------------------------------------- | ---------------------------------------------------------------- |
| `bun install`                             | 依存関係のインストール                                           |
| `bun run build`                           | 全パッケージをビルド                                             |
| `bun run tsc`                             | 型チェック                                                       |
| `bun run lint`                            | oxlint + markuplint                                              |
| `bun run lint:fix`                        | oxlint --fix (HTML の整形は oxfmt の役割)                        |
| `bun run format` / `bun run format:check` | oxfmt (JS / TS / HTML)                                           |
| `bun run test`                            | vitest                                                           |
| `bun run coverage`                        | カバレッジ (statements/lines/functions/branches すべて 95% 以上) |

HTML だけ検査したい場合は `bunx markuplint "**/*.html"`。

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
