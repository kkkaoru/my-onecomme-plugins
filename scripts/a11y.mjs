/* eslint-disable vitest/require-hook -- これはテストではなく単体のスクリプト */
// 設定画面のアクセシビリティを機械的に判定する。使い方: bun run a11y [URL]
// 既定は わんコメ が配信している設定画面。開いていないときは dist を一時配信して調べる。
import { once } from 'node:events'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'

import { AxeBuilder } from '@axe-core/playwright'
import { chromium } from 'playwright'

const UID = 'com.example.my-onecomme-plugins.flow-comment'
const LIVE_URL = `http://localhost:11180/plugins/${UID}/`
const DIST = 'apps/flow-comment/dist/flow-comment-plugin'
const REACH_TIMEOUT_MS = 2000
const SETTLE_MS = 200
const HTTP_OK = 200
const HTTP_NOT_FOUND = 404
const RANDOM_PORT = 0
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const CONTENT_TYPES = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

const canReach = async (url) => {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(REACH_TIMEOUT_MS) })
    return response.ok
  } catch {
    return false
  }
}

// 実機が無いときは、ビルド済みの設定画面をその場で配信する。
// 設定 API が無くても既定値で描画されるので、判定には十分。
const serveDist = async () => {
  const server = createServer((request, response) => {
    const requested = (request.url ?? '/').split('?')[0] ?? '/'
    const name = requested === '/' ? 'index.html' : requested.replace(/^\/+/u, '')
    const file = path.join(DIST, path.normalize(name))
    try {
      const body = readFileSync(file)
      const type = CONTENT_TYPES[path.extname(file)] ?? 'application/octet-stream'
      response.writeHead(HTTP_OK, { 'content-type': type })
      response.end(body)
    } catch {
      response.writeHead(HTTP_NOT_FOUND)
      response.end('not found')
    }
  })
  // ポートは任せる（0）。空きが出るまで待ってから返す。
  server.listen(RANDOM_PORT, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  const port = typeof address === 'object' && address !== null ? address.port : 0
  return { close: () => server.close(), url: `http://127.0.0.1:${String(port)}/` }
}

const live = process.argv[2] ?? ((await canReach(LIVE_URL)) ? LIVE_URL : undefined)
const local = live === undefined ? await serveDist() : undefined
const url = live ?? local?.url ?? LIVE_URL

const browser = await chromium.launch()
// axe は context 経由で作った page を必要とする。
const context = await browser.newContext({ viewport: { height: 1000, width: 1400 } })
const page = await context.newPage()
await page.goto(url, { waitUntil: 'load', timeout: 20_000 })
await page.waitForTimeout(SETTLE_MS)

// 畳まれている JSON パネルも開いて、隠れた中身まで見る。
const details = page.locator('details.fc-collapsible')
if ((await details.count()) > 0) {
  await details.first().evaluate((node) => {
    node.open = true
  })
  await page.waitForTimeout(SETTLE_MS)
}

const results = await new AxeBuilder({ page }).withTags(TAGS).analyze()
await browser.close()
await local?.close()

const lines = results.violations.map(
  (violation) =>
    `- [${violation.impact ?? 'unknown'}] ${violation.id}: ${violation.help}\n` +
    violation.nodes
      .slice(0, 3)
      .map(
        (node) =>
          `    ${node.target.join(' ')}\n      ${node.failureSummary?.split('\n')[0] ?? ''}`,
      )
      .join('\n'),
)

console.log(`a11y: ${url}`)
console.log(`violations: ${results.violations.length} / passes: ${results.passes.length}`)
if (lines.length > 0) {
  console.log(lines.join('\n'))
}

process.exit(results.violations.length === 0 ? 0 : 1)
