import path from 'node:path'

import { chromium } from 'playwright'

const DIR = import.meta.dir
const shots = [
  ['mixed', '01-thumb.png'],
  ['superchat', '02-superchat.png'],
  ['gift', '03-gift.png'],
  ['normal', '04-normal.png'],
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
for (const [scene, file] of shots) {
  await page.goto(`file://${DIR}/capture.html?scene=${scene}`)
  await page.waitForTimeout(200)
  await page.screenshot({ path: path.join(DIR, file), type: 'png' })
}
await browser.close()
