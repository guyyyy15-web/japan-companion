// Release smoke test (see .claude/skills/release-check): iPhone viewport, he + en, every tab,
// converter, phrase builder + type-ahead, speech (fake engine), show-card, an iPhone SE layout pass,
// and an offline reload through the service worker. Needs `npm run preview` on :4173.
import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'

const URL_ = process.env.APP_URL ?? 'http://localhost:4173/'
const OUT = new URL('../../screenshots/', import.meta.url).pathname
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' })
const context = await browser.newContext({
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  colorScheme: 'light',
})
// Deterministic rates, no real network.
await context.route('https://open.er-api.com/**', (route) =>
  route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ result: 'success', time_last_update_unix: 1790294400, rates: { ILS: 0.0192, USD: 0.0063 } }),
  }),
)

// A fake speech engine: records what the app asks to speak, with a controllable voice list.
const FAKE_SPEECH = (voices) => {
  window.__spoken = []
  const list = voices.map((v) => ({ ...v, voiceURI: v.name, localService: true, default: false }))
  const synth = {
    getVoices: () => list,
    speak: (u) => window.__spoken.push({ text: u.text, lang: u.lang, rate: u.rate, voice: u.voice?.name ?? null }),
    cancel: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  }
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true })
  window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text } }
}
await context.addInitScript(FAKE_SPEECH, [
  { name: 'Samantha', lang: 'en-US' },
  { name: 'Kyoko', lang: 'ja-JP' },
  { name: 'Kyoko (Enhanced)', lang: 'ja-JP' },
])

const page = await context.newPage()
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(String(e)))

const check = (cond, msg) => {
  if (!cond) throw new Error(`FAIL: ${msg}`)
  console.log(`ok  ${msg}`)
}

await page.goto(URL_)
await page.waitForSelector('.tabbar')

const tabs = [
  ['phrases', { he: 'ביטויים', en: 'Phrases' }],
  ['builder', { he: 'משפטים', en: 'Builder' }],
  ['signs', { he: 'שלטים', en: 'Signs' }],
  ['money', { he: 'כסף', en: 'Money' }],
  ['guide', { he: 'מדריך', en: 'Guide' }],
]

for (const lang of ['he', 'en']) {
  const current = await page.evaluate(() => document.documentElement.lang)
  if (current !== lang) await page.click('.lang')
  const dir = await page.evaluate(() => document.documentElement.dir)
  check(dir === (lang === 'he' ? 'rtl' : 'ltr'), `${lang}: dir=${dir}`)
  for (const [id, label] of tabs) {
    await page.click(`.tab:has-text("${label[lang]}")`)
    await page.waitForTimeout(150)
    await page.screenshot({ path: `${OUT}${lang}-${id}.png` })
  }
}

// Converter: ¥5,000 shows ₪ and $.
await page.click('.lang') // back to Hebrew
await page.click('.tab:has-text("כסף")')
for (const k of ['5', '000']) await page.click(`.key:text-is("${k}")`)
const outs = await page.$$eval('.display-out', (els) => els.map((e) => e.textContent))
check(outs.some((t) => t.includes('₪')) && outs.some((t) => t.includes('$')), `converter ¥5,000 → ${outs.join(' / ')}`)
check((await page.textContent('.rate-line')).includes('שער עדכני'), 'live rate picked up')
await page.screenshot({ path: `${OUT}he-money-5000.png`, fullPage: true })

// Builder: group tabs → frame → word, for each group.
const resultJa = () => page.textContent('.builder-result .result-ja')
// Picking a frame folds the grid into a bar; "change" opens it again.
const pickFrame = async (group, frame) => {
  if (await page.isVisible('.frame-bar')) await page.click('.frame-bar .link')
  await page.click(`.group-tab:has-text("${group}")`)
  await page.click(`.frame:has-text("${frame}")`)
  check(await page.isVisible('.frame-bar'), `builder: frame grid folds after picking "${frame}"`)
}
await page.click('.tab:has-text("משפטים")')
await pickFrame('התמצאות', 'איפה …?')
await page.click('.word:has-text("שירותים")')
check((await resultJa()) === 'トイレはどこですか', 'builder: where + toilet')
await page.screenshot({ path: `${OUT}he-builder.png` })

await pickFrame('הזמנות', '× כמות')
await page.click('.word:has-text("כרטיס") >> nth=0')
await page.click('.stepper button:has-text("+")')
const tickets = await resultJa()
check(tickets === '切符を二枚お願いします', `builder: tickets × 2 → ${tickets}`)
await page.screenshot({ path: `${OUT}he-builder-count.png` })

await pickFrame('בקשות', 'תוכלו …?')
await page.click('.word:has-text("לחמם את זה")')
const heat = await resultJa()
check(heat === '温めてもらえますか', `builder: could you heat it up → ${heat}`)

// Speech: 🔊 must use a Japanese voice (the best one) and the kanji text; 🐢 must be slower.
await page.click('.builder-result button[aria-label="השמעת הגייה"]')
await page.click('.builder-result button[aria-label="לאט"]')
const spoken = await page.evaluate(() => window.__spoken)
check(spoken.length === 2 && spoken[0].text === '温めてもらえますか' && spoken[0].lang === 'ja-JP', `speech: kanji text in ja-JP → ${JSON.stringify(spoken[0])}`)
check(spoken[0].voice === 'Kyoko (Enhanced)', `speech: best Japanese voice chosen → ${spoken[0].voice}`)
check(spoken[1].rate < spoken[0].rate, `speech: 🐢 is slower (${spoken[1].rate} < ${spoken[0].rate})`)
await page.screenshot({ path: `${OUT}he-builder-request.png` })

// Type-ahead: free text → ready sentence.
await page.fill('.smart .search', 'לשכור אופניים')
await page.waitForSelector('.suggest-item')
await page.screenshot({ path: `${OUT}he-builder-suggest.png` })
await page.click('.suggest-item >> nth=0')
const rented = await resultJa()
check(rented.startsWith('自転車'), `type-ahead: "לשכור אופניים" → ${rented}`)

// Show-card.
await page.click('.tab:has-text("ביטויים")')
await page.click('.chip:has-text("מסעדה")')
await page.click('.phrase-main >> nth=0')
check(await page.isVisible('.showcard-ja'), 'show-card opens with Japanese text')
await page.screenshot({ path: `${OUT}he-showcard.png` })
await page.click('.showcard-actions .primary')

// Offline reload.
await page.evaluate(() => navigator.serviceWorker.ready)
await page.reload()
await page.waitForFunction(() => !!navigator.serviceWorker.controller)
await context.setOffline(true)
await page.reload()
check(await page.isVisible('.tabbar'), 'app renders offline')
await context.setOffline(false)

check(errors.length === 0, `no console errors${errors.length ? ': ' + errors.join(' | ') : ''}`)

// iPhone SE (375×667), no Japanese voice installed: nothing may stick out sideways, every frame
// button must be fully on screen, and 🔊 must warn instead of reading Japanese in a wrong accent.
const se = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await se.addInitScript(FAKE_SPEECH, [{ name: 'Samantha', lang: 'en-US' }])
const sp = await se.newPage()
await sp.goto(URL_)
await sp.waitForSelector('.tabbar')
for (const tab of ['ביטויים', 'משפטים', 'שלטים', 'כסף', 'מדריך']) {
  await sp.click(`.tab:has-text("${tab}")`)
  await sp.waitForTimeout(100)
  const { sw, iw } = await sp.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }))
  check(sw <= iw, `SE: ${tab} has no sideways scroll (${sw} ≤ ${iw})`)
}
await sp.click('.tab:has-text("משפטים")')
for (const g of ['התמצאות', 'הזמנות', 'בקשות', 'בעיות']) {
  await sp.click(`.group-tab:has-text("${g}")`)
  const off = await sp.$$eval('.frame-grid .frame', (els) =>
    els.filter((e) => { const r = e.getBoundingClientRect(); return r.left < 0 || r.right > innerWidth }).length)
  check(off === 0, `SE: every "${g}" frame is fully visible`)
}
await sp.click('.group-tab:has-text("התמצאות")')
await sp.screenshot({ path: `${OUT}se-builder.png` })
await sp.click('.word >> nth=0')
await sp.click('.builder-result button[aria-label="השמעת הגייה"]')
check(await sp.isVisible('.toast'), 'SE: missing Japanese voice shows a warning instead of a wrong accent')
await sp.screenshot({ path: `${OUT}se-builder-result.png` })
await se.close()

await browser.close()
