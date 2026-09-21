import path from 'node:path'

import { chromium } from 'playwright'

const DIR = import.meta.dir
const SETTINGS = 'http://localhost:11180/plugins/com.example.my-onecomme-plugins.flow-comment/'
const shots = [
  ['mixed', '01-thumb.png'],
  ['superchat', '02-superchat.png'],
  ['gift', '03-gift.png'],
  ['normal', '04-normal.png'],
]

const browser = await chromium.launch()
const page = await browser.newPage({
  extraHTTPHeaders: { 'Accept-Language': 'ja' },
  locale: 'ja-JP',
  viewport: { height: 720, width: 1280 },
})
for (const [scene, file] of shots) {
  await page.goto(`file://${DIR}/capture.html?scene=${scene}`)
  await page.waitForTimeout(200)
  await page.screenshot({ path: path.join(DIR, file), type: 'png' })
}
await page.goto(SETTINGS)
await page.waitForSelector('h2')
await page.getByRole('heading', { name: '表示設定' }).scrollIntoViewIfNeeded()
await page.waitForTimeout(300)
await page.screenshot({ path: path.join(DIR, '05-settings.png'), type: 'png' })
await page.evaluate(() => {
  globalThis.scrollTo(0, 0)
})
await page.screenshot({
  fullPage: true,
  path: path.join(DIR, '06-settings-full.png'),
  type: 'png',
})
await browser.close()
