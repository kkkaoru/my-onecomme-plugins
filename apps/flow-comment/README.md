# flow-comment

わんコメ (OneComme) でコメントを右から左に流すテンプレートと、その表示を設定画面から
カスタマイズできるようにするプラグイン。

## なぜテンプレートとプラグインの2構成なのか

わんコメは**表示**と**処理**で拡張点が分かれている。

- 表示（コメントの見た目・動き）は**テンプレート**でしか変更できない
- **プラグイン**は `filterComment` / `filterSpeech` / `subscribe` / `request` / `store` を持ち、
  設定の保存と REST API を担う。表示フックは存在しない

そのため「右から左に流す」はテンプレートが、「カスタマイズできる機能」は設定画面と永続化を
プラグインが担当する。

```
src/ + template/ + static/  --ビルド-->  dist/flow-comment-template/  -> templates/custom/ へ
                                         dist/flow-comment-plugin/    -> plugins/ へ
```

## インストール

[Releases](https://github.com/kkkaoru/my-onecomme-plugins/releases) の `all_flow-comment.zip`（まとめ）、`plugin_flow-comment.zip`、`template_flow-comment.zip` を使う。手順はまとめ zip 内の `README.md` と同じ。

開発する場合:

```sh
bun install
bun run build   # dist 作成 + わんコメへコピー
bun run dev     # ソース変更のたびにビルドしてコピー
```

1. わんコメの設定 → テンプレートで `流れるコメント` を選ぶ
2. わんコメの設定 → プラグインで `流れるコメント` を有効化する

テンプレートだけでも動く（既定値で表示される）。設定画面を使うにはプラグインの有効化が必要。

## 設定画面の開き方

わんコメの **歯車 → プラグイン → 流れるコメント** を開くと、設定画面へのリンクボタンが表示される
（プラグインの `url` に設定済み）。ブラウザで直接開くこともできる。

```
http://localhost:11180/plugins/com.example.my-onecomme-plugins.flow-comment/
```

テストが通ってもわんコメは古いまま。`bun run build` か `bun run dev` がコピーする。設定タブはハード再読込。`plugin.js` は無効→有効か再起動。詳細はリポジトリ直下の `AGENTS.md`。

## 反映のタイミング

| 変更したもの               | 反映                                          |
| -------------------------- | --------------------------------------------- |
| 設定画面 (static/ / UI)    | `bun run dev` のあと、設定タブを再読込        |
| テンプレート (template/)   | `bun run dev` のあと、配信画面を再読込        |
| プラグイン本体 (plugin.js) | **プラグインの無効→有効、または再起動が必要** |

`bun run build` / `bun run dev` は `~/Library/Application Support/OneComme/` へコピーする。設定タブは再読込で新しい `script.js` を取る（クエリ付き URL は 11180 が 404 を返す）。`plugin.js` はわんコメがメモリに保持するため、本体の変更は無効→有効まで効かない。

## 設定（全28項目）

| 項目                            | CSS 変数                                      |
| ------------------------------- | --------------------------------------------- |
| 流れる向き                      | `--fc-direction`                              |
| 画面を横切る時間 (ms)           | `--fc-duration`                               |
| レーン数 (行数)                 | `--fc-lanes`                                  |
| 同時に保持する最大数            | `--fc-max-items`                              |
| フォント                        | `--fc-font-family`                            |
| 文字サイズ (px)                 | `--fc-font-size`                              |
| 文字の太さ                      | `--fc-font-weight`                            |
| 文字色                          | `--fc-text-color`                             |
| 縁取りの太さ (px)               | `--fc-outline-width`                          |
| 縁取りの色                      | `--fc-outline-color`                          |
| 影を付ける                      | `--fc-show-shadow`                            |
| 影の横位置 / 縦位置 (px)        | `--fc-shadow-x` / `-y`                        |
| 影のぼかし (px) / 影の色        | `--fc-shadow-blur` / `-color`                 |
| 不透明度                        | `--fc-opacity`                                |
| 余白 上 / 右 / 下 / 左 (px)     | `--fc-padding-top` `-right` `-bottom` `-left` |
| 行の間隔 (px)                   | `--fc-lane-gap`                               |
| 1行の高さ (px, 0 = 自動)        | `--fc-lane-height`                            |
| アイコンを表示                  | `--fc-show-avatar`                            |
| スパチャ/ギフトでアイコンを表示 | `--fc-show-paid-avatar`                       |
| 投稿者名を表示                  | `--fc-show-name`                              |
| スパチャ/ギフトで名前を表示     | `--fc-show-paid-name`                         |
| バッジを表示（メンバー等）      | `--fc-show-badges`                            |
| 投稿者名の色                    | `--fc-name-color`                             |

保存すると プラグインの `store`（ElectronStore）に JSON として永続化される。

### CSS 変数による上書き

OBS のブラウザソースのカスタムCSSに `--fc-*` を書くと、**その配信元だけ**設定画面の値より
優先される。設定は全配信元共通、CSS は個別調整、という使い分けになる。

```css
:root {
  --fc-lanes: 8;
  --fc-duration: 6000;
  --fc-text-color: #ffee00;
}
```

優先順位は `CSS変数 > プラグイン設定 > 既定値`。一覧は
`packages/flow-comment-core/src/settings/variables.ts` にある。

## プリセット

設定画面の「プリセット」で名前を付けて保存し、後から読み込める。保存先はプラグインの `store`
で現在の設定とは別に保持されるため、プリセットを保存しても表示中の設定は変わらない。

## JSON 入出力と外部からの操作

設定画面の「JSON 入出力」で全項目を JSON として書き出し・読み込みできる。破損した JSON は
読み込まず、範囲外の値はクランプされる。

AI エージェント向けには3つの経路がある。

**1. REST API**（UI 操作不要）

```sh
U=http://localhost:11180/api/plugins/com.example.my-onecomme-plugins.flow-comment
curl -s "$U"                                   # 現在の設定
curl -s -X PUT -H 'content-type: application/json' -d '{"durationMs":6000}' "$U"
curl -s "$U?action=presets"                    # プリセット一覧
curl -s -X PUT -d '{"lanes":3}' "$U?action=presets&name=夜"
curl -s -X DELETE "$U?action=presets&name=夜"
curl -s -X DELETE "$U"                         # 既定値に戻す
```

**2. WebMCP** — 対応ブラウザでは設定画面が以下のツールを登録する。未対応なら何もしない。

| ツール                         | 内容                                     |
| ------------------------------ | ---------------------------------------- |
| `get_flow_comment_settings`    | 現在の設定を JSON で返す                 |
| `update_flow_comment_settings` | 部分更新して保存（省略した項目は現在値） |
| `list_flow_comment_presets`    | プリセット名の一覧                       |
| `save_flow_comment_preset`     | 現在の設定を名前付きプリセットとして保存 |

**3. JSON の貼り付け** — 設定画面の textarea に JSON を貼り「貼り付けた内容を読み込む」。

## スパチャ・ギフトの表示

OneComme は YouTube の配色を `comment.data.colors` に入れて渡してくるので、それをそのまま
適用する。階級ごとの色を自前で持たないため、YouTube 側が色を変えても追従する。

| データ                                | 扱い                                          |
| ------------------------------------- | --------------------------------------------- |
| `colors.bodyBackgroundColor`          | カードの背景                                  |
| `colors.bodyTextColor`                | 本文の文字色                                  |
| `colors.authorNameTextColor`          | 名前の色                                      |
| `colors.headerTextColor`              | 金額バッジの文字色                            |
| `paidText` / `membership`             | 金額・メンシ加入のバッジ                      |
| `hasGift` / `price` / `giftReceivers` | ギフトのバッジ                                |
| `isSponsorshipGiftReceiver`           | ギフト受領のバッジ                            |
| `profileImage` / `badges[]`           | アイコンとバッジ                              |
| `comment`                             | 本文（YouTube 生成の HTML。ギフト画像を含む） |

カード系（`colors` を持つコメント）は影を `box-shadow` で背景に付け、**中の文字には付けない**。
通常コメントは読みやすさのため文字に `text-shadow` を付ける。

## フォント

`@fontsource-variable/noto-sans-jp` を同梱し、既定は `Noto Sans JP Variable`。ビルドで
woff2（unicode-range でサブセット分割）と `fonts.css` を両成果物へ配置する。

端末のフォントは設定画面の「端末のフォントを読み込む」ボタンで `queryLocalFonts()` から取得する
（ユーザー操作と secure context が必要）。取得できない場合は組み込みの候補リストを使う。
候補は入力欄の下に並び、入力で絞り込める。

## 特許を回避するための設計

問題となるのは、動画上を水平に移動するコメントの**重なり判定**と、判定に基づく**表示位置制御**
をクレームした特許（特許第4734471号・第4695583号の各発明2、特許第6526304号）。本実装は次
のように構成をずらしている。

| クレームの構成要件                                             | 本実装                                                   |
| -------------------------------------------------------------- | -------------------------------------------------------- |
| 判定部: 新コメントの表示位置が既存コメントと重なるか判定する   | **存在しない**。他コメントの座標を一切参照しない         |
| 表示位置制御部: 重なると判定した場合に重ならない位置へ調整する | **存在しない**。レーンは割当後も変更しない               |
| 第2表示欄（コメント）が第1表示欄（動画）より大きい             | 動画領域を定義しない。コメント帯のみを描画する           |
| 動画と重ねて表示する                                           | 帯として独立して描画する。動画の上に重ねる前提を取らない |

実装上の担保:

- `packages/flow-comment-core/src/motion/flow.ts` の `createLaneAllocator` は**到着順のラウンドロビン**のみ。何番目のレーンに
  入るかは到着順だけで決まり、他のコメントの有無で結果が変わらない
- `commentX` は**自分の経過時間だけ**の純関数。他のコメントの位置を引数に取らない
- レーンは割当後に再計算しない。重なりを検出して動かす経路がコード上に存在しない

この性質は `packages/flow-comment-core/src/flow/controller.test.ts` と
`packages/flow-comment-core/src/motion/flow.test.ts` でテストとして固定してある。

> これは**エンジニアとしての設計判断**であり、法的評価ではない。実配布の前には弁理士の
> 確認を推奨する。

## 開発

```sh
bun run tsc          # 型チェック
bun run lint         # oxlint + markuplint
bun run format       # oxfmt
bun run test         # vitest
bun run coverage     # カバレッジ（95% 以上を維持）
bun run build
```

`template/` と `static/` は素の HTML/CSS/JS。設定画面は CDN に依存せずフレームワークも使わない
（オフラインでも動き、テンプレート側と同期を取る対象が減る）。設定画面の CSS は
`static/style.css` の `--ui-*` 変数に集約してある。
