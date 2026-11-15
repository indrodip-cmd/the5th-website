#!/usr/bin/env node
/* Recaptures a page's Open Graph / Twitter card preview image: a real
 * 1200x630 screenshot of the live hero, not a generated card. Run this
 * whenever a hero headline, photo or layout changes, so link previews on
 * Facebook/WhatsApp/iMessage/Slack never show a stale offer.
 *
 * Usage:
 *   npx playwright install chromium   # once, if not already installed
 *   node scripts/capture-og.mjs [url] [outPath]
 *
 * Defaults to capturing http://localhost:3000/10k-roadmap against a running
 * `next start`/`next dev` server, saved to public/og/10k-roadmap-hero.png.
 * After running, redeploy, then use Facebook's Sharing Debugger and
 * WhatsApp's own re-share to force each platform to re-scrape the new image
 * (they cache previews per URL and won't pick up a changed file on their own).
 */
import { chromium } from 'playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const url = process.argv[2] || 'http://localhost:3000/10k-roadmap'
const outPath = process.argv[3] || path.join(__dirname, '..', 'public', 'og', '10k-roadmap-hero.png')

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await page.goto(url, { waitUntil: 'networkidle' })
// Strip the cookie-consent overlay and the Carolina chat launcher so neither
// one bakes itself into the saved preview image.
await page.evaluate(() => {
  document.querySelectorAll('.t5cc-overlay').forEach((e) => e.remove())
  document.querySelectorAll('.cw-launcher, .cw-nametag, .cw-win, .cw-mclose').forEach((e) => e.remove())
})
// Let web fonts and the hero photo finish painting before the shot.
await page.waitForTimeout(1200)
await page.screenshot({ path: outPath })
await browser.close()
console.log('Wrote', outPath)
