// Runs with bun.
// 同梱フォント（woff2 と @font-face）を両成果物へ配置する。
// node_modules はリポジトリ直下に hoist されるため 2 階層上を見る。
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'

const SOURCE = '../../node_modules/@fontsource-variable/noto-sans-jp'
const TARGETS = ['dist/flow-comment-plugin', 'dist/flow-comment-template']

const copyTo = async (target, css) => {
  await mkdir(`${target}/fonts`, { recursive: true })
  await cp(`${SOURCE}/files`, `${target}/fonts`, { recursive: true })
  await writeFile(`${target}/fonts.css`, css)
  console.info(`fonts copied to ${target}`)
}

const css = await readFile(`${SOURCE}/index.css`, 'utf8')
const rewritten = css.replaceAll('./files/', './fonts/')

// 2つの出力先は独立しているので並行して書く。
await Promise.all(TARGETS.map((target) => copyTo(target, rewritten)))
