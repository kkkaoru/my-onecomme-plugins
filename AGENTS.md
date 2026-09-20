# Agent notes

このリポジトリのエージェント向け手順。人間向けの説明は `README.md` と `apps/flow-comment/README.md`。

## 品質ゲート

変更したら毎回:

```sh
bun run format
bun run tsc
bun run lint
bun run test
```

カバレッジを触る作業では `bun run coverage`（statements / branches / functions / lines すべて 95% 以上）。

テストが緑でもわんコメは古いまま。次の「実機反映」を省略しない。

## 実機反映（必須）

わんコメは `apps/flow-comment/dist/` ではなく
`~/Library/Application Support/OneComme/` を読む。

| コマンド        | いつ                                              |
| --------------- | ------------------------------------------------- |
| `bun run build` | 一回の作業の終わり。flow-comment は自動コピーする |
| `bun run dev`   | 開発中は常時。落ちていたら立て直す                |

設定画面:

```
http://localhost:11180/plugins/com.example.my-onecomme-plugins.flow-comment/
```

コピー後は **ハード再読込**（通常の再読込では古い `script.js` が残ることがある）。

| 成果物                                         | 反映                                                      |
| ---------------------------------------------- | --------------------------------------------------------- |
| 設定 UI (`script.js` / `style.css`)            | コピー + タブのハード再読込                               |
| テンプレート (`templates/custom/flow-comment`) | コピー + 配信画面の再読込                                 |
| `plugin.js`                                    | コピー **かつ** プラグイン無効→有効、またはわんコメ再起動 |

保存済み設定は新しい既定値を上書きする。既定を見るなら設定画面の「初期値に戻す」。

コピー先:

- `~/Library/Application Support/OneComme/plugins/flow-comment/`
- `~/Library/Application Support/OneComme/templates/custom/flow-comment/`

確認例:

```sh
rg 'preview-sample' "$HOME/Library/Application Support/OneComme/plugins/flow-comment/script.js"
```

ヒットしなければコピーできていない。mtime がソース変更より古ければ同じ。

## やってはいけない

- テスト緑だけで「反映した」と報告する
- `script.js?v=123` のようなクエリ付き URL（11180 は 404 で設定画面が真っ白になる）
- 保存済み `state.json` を確認なしに消す
- 新しい依存関係を、標準ライブラリや既存パッケージで足りるのに足す

## 置き場所

- `packages/flow-comment-core` — 設定・コメント・流れ
- `packages/flow-comment-ui` — 設定画面
- `apps/flow-comment` — プラグイン入口・テンプレート・わんコメへのコピー
- 設定項目の並びは `packages/flow-comment-core/src/settings/fields.ts` の `FIELD_SPECS`

TypeScript は bun。`any` / `as` / `as const` / `let` は使わない。非テストファイルはおおむね 150 行・関数 50 行。
