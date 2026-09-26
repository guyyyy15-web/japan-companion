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
  // A fixed GPS position (Tokyo Station) for the Nearby tab.
  geolocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 20 },
  permissions: ['geolocation'],
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

// What's new: shown once, each line jumps to its tab.
check(await page.isVisible('.whatsnew'), "what's new card shows after an update")
await page.screenshot({ path: `${OUT}he-whatsnew.png` })
await page.click('.whatsnew-item:has-text("קעקועים")')
check(await page.isVisible('.tattoo-toggle'), "what's new: the tattoo line opens the Nearby tab")
await page.reload()
await page.waitForSelector('.tabbar')
check(!(await page.isVisible('.whatsnew')), "what's new: not shown again")

const tabs = [
  ['phrases', { he: 'ביטויים', en: 'Phrases' }],
  ['builder', { he: 'משפטים', en: 'Builder' }],
  ['nearby', { he: 'בסביבה', en: 'Nearby' }],
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

// Trip wallet: log the ¥5,000 as shopping, paid in cash.
await page.click('.cat-btn:has-text("קניות")')
await page.click('.wallet-add .seg-btn:has-text("מזומן")')
await page.fill('.wallet-add input', 'Tamagotchi')
await page.click('.wallet-add .primary-btn')
const walletTotal = await page.textContent('.wallet-total')
const walletItems = await page.$$eval('.wallet-items li', (els) => els.map((e) => e.textContent))
check(walletTotal.includes('5,000') && walletTotal.includes('₪') && walletItems.length === 1 && walletItems[0].includes('Tamagotchi'), `wallet: logged ¥5,000 → ${walletTotal}`)
check(!(await page.isVisible('.wallet-add')), 'wallet: the converter clears after adding')
await page.screenshot({ path: `${OUT}he-wallet.png`, fullPage: true })
await page.reload()
await page.click('.tab:has-text("כסף")')
check((await page.$$eval('.wallet-items li', (els) => els.length)) === 1, 'wallet: entries survive a reload')

// Sizes in the guide.
await page.click('.tab:has-text("מדריך")')
await page.click('#sizes summary')
check((await page.textContent('.size-big')).includes('24 cm'), 'sizes: EU 38 → 24 cm')

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
// Long word groups start folded; "+N more" opens them.
const before = await page.$$eval('.word:not(.more)', (els) => els.length)
await page.click('.word.more >> nth=0')
const after = await page.$$eval('.word:not(.more)', (els) => els.length)
check(after > before, `builder: "+N more" expands a word group (${before} → ${after})`)

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

// Practice: reveal, "again" keeps the card in the deck, "knew it" removes it.
await page.click('.chip:has-text("תרגול")')
await page.selectOption('.practice select', 'restaurant')
const progress = () => page.textContent('.practice-progress')
const practiceBefore = await progress()
await page.click('.practice .primary-btn')
check(await page.isVisible('.practice-answer .practice-ja'), 'practice: the answer shows Japanese')
await page.click('.practice-btn.again')
check((await progress()) === practiceBefore, `practice: "again" keeps the card (${practiceBefore})`)
await page.click('.practice .primary-btn')
await page.click('.practice-btn.knew')
check((await progress()) !== practiceBefore, `practice: "knew it" counts (${await progress()})`)
await page.screenshot({ path: `${OUT}he-practice.png` })

// Nearby: nearest toilets and bins from the bundled OpenStreetMap data, with walking links.
await page.click('.tab:has-text("בסביבה")')
await page.click('.primary-btn')
await page.waitForSelector('.nearby-list li', { timeout: 15000 })
const toilets = await page.$$eval('.nearby-list li', (els) => els.length)
const firstHref = await page.getAttribute('.nearby-go >> nth=0', 'href')
check(toilets > 0 && firstHref.startsWith('https://www.google.com/maps/dir/?api=1&destination='), `nearby: ${toilets} toilets near Tokyo Station, with walking links`)
await page.screenshot({ path: `${OUT}he-nearby.png`, fullPage: true })
await page.click('.seg-btn:has-text("פחי אשפה")')
await page.waitForTimeout(200)
const binsOrNote = await page.$$eval('.nearby-panel', (els) => els[0].textContent)
check(binsOrNote.includes('מ׳') || binsOrNote.includes('ק״מ') || binsOrNote.includes('קונביני'), 'nearby: bins list (or the konbini hint) shows')
const quick = await page.getAttribute('.quick >> nth=0', 'href')
check(quick === 'https://www.google.com/maps/search/?api=1&query=%E5%85%AC%E8%A1%86%E3%83%88%E3%82%A4%E3%83%AC', 'nearby: Google Maps quick search for 公衆トイレ')
await page.click('.seg-btn:has-text("קונביני")')
await page.waitForSelector('.nearby-list li .tag.brand', { timeout: 5000 })
check(true, 'nearby: nearest konbini show their chain (7-Eleven / Lawson / FamilyMart)')
await page.click('.nearby-search .group-tab:has-text("בילוי")')
const funQueries = await page.$$eval('.nearby-search .quick-ja', (els) => els.map((e) => e.textContent))
check(funQueries.includes('ゲームセンター') && funQueries.includes('日帰り温泉'), 'nearby: "fun" category searches arcades and onsen')
await page.fill('.nearby-search input', 'ראמן')
const typed = await page.$$eval('.nearby-search .quick', (els) => els.map((e) => e.getAttribute('href')))
check(typed[0].endsWith(encodeURIComponent('ראמן')) && typed.includes('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('ラーメン')), 'nearby: typing "ראמן" offers the Japanese ラーメン search')
await page.fill('.nearby-search input', '')

// In-app lists: a quick search with downloaded places shows the nearest ones, named, with a map and Google Maps.
await page.click('.nearby-search .group-tab:has-text("אוכל")')
await page.click('.quick.listed:has-text("ראמן")')
await page.waitForSelector('.place-results .nearby-list li', { timeout: 15000 })
const ramen = await page.$$eval('.place-results .nearby-list li', (els) => els.map((e) => e.textContent))
check(ramen.length === 10 && ramen.filter((r) => /[ぁ-んァ-ン一-龯a-zA-Z]/.test(r)).length >= 8, `lists: 10 nearest ramen places near Tokyo Station, named (${ramen[0].slice(0, 30)}…)`)
await page.click('.place-results .link:has-text("להציג עוד")')
check((await page.$$eval('.place-results .nearby-list li', (els) => els.length)) === 20, 'lists: "show more" adds 10')
const essentialsListed = await page.$$eval('.nearby-search .group-tab', (els) => els.length)
check(essentialsListed === 4, 'lists: category tabs still there')
await page.screenshot({ path: `${OUT}he-list-ramen.png`, fullPage: true })
await page.click('.nearby-search .group-tab:has-text("בסיסי")')
await page.click('.quick.listed:has-text("בית מרקחת")')
await page.waitForSelector('.place-results .nearby-list li', { timeout: 15000 })
const firstPharmacy = await page.textContent('.place-results .nearby-list li')
check(/מ׳/.test(firstPharmacy), `lists: nearest drugstore ${firstPharmacy.slice(0, 40)}…`)
await page.click('.place-results .wallet-del')

// Tattoo-friendly filter: onsen, sento, gym… searches become "タトゥーOK …", with tips and phrases.
await page.click('.tattoo-toggle')
const tattooHrefs = await page.$$eval('.nearby-search .quick', (els) => els.map((e) => decodeURIComponent(e.getAttribute('href'))))
check(tattooHrefs.some((h) => h.endsWith('タトゥーOK 温泉')) && tattooHrefs.some((h) => h.endsWith('タトゥーOK ジム')) && tattooHrefs.some((h) => h.endsWith('貸切風呂')), `tattoo filter: ${tattooHrefs.length} tattoo-friendly searches`)
check(await page.isVisible('.tattoo-panel .app-link'), 'tattoo filter: tips, phrases and the Tattoo Friendly database show')
await page.fill('.nearby-search input', 'onsen')
const typedTattoo = decodeURIComponent(await page.getAttribute('.nearby-search .quick.typed', 'href'))
check(typedTattoo.endsWith('タトゥーOK onsen'), `tattoo filter: typed searches are limited too (${typedTattoo.split('query=')[1]})`)
await page.fill('.nearby-search input', '')
await page.screenshot({ path: `${OUT}he-tattoo.png`, fullPage: true })
await page.click('.tattoo-toggle')
await page.click('.nearby-apps summary')
const apps = await page.$$eval('.app-link', (els) => els.map((e) => e.getAttribute('href')))
check(apps.includes('https://tabelog.com/en/') && apps.length >= 15, `nearby: ${apps.length} local apps linked`)
await page.screenshot({ path: `${OUT}he-nearby-search.png`, fullPage: true })

// Saved places: a hotel address becomes a taxi card.
await page.click('.places .link:has-text("הוספת מקום")')
await page.fill('.place-form input', 'המלון בקיוטו')
await page.fill('.place-form textarea', '京都府京都市下京区東塩小路町901')
await page.click('.place-form .primary-btn')
await page.click('.place-list button:has-text("כרטיס למונית")')
const lead = await page.textContent('.showcard-lead')
const addr = await page.textContent('.showcard-ja')
check(lead === 'この住所までお願いします' && addr.includes('京都府'), 'places: hotel address opens as a taxi card')
await page.screenshot({ path: `${OUT}he-taxi-card.png` })
await page.click('.showcard-actions .primary')

// Offline reload.
await page.evaluate(() => navigator.serviceWorker.ready)
await page.reload()
await page.waitForFunction(() => !!navigator.serviceWorker.controller)
await context.setOffline(true)
await page.reload()
check(await page.isVisible('.tabbar'), 'app renders offline')
await page.click('.tab:has-text("בסביבה")')
await page.click('.primary-btn')
await page.waitForSelector('.nearby-list li', { timeout: 15000 })
check(true, 'nearby: nearest toilets work offline (data precached)')
await page.click('.nearby-search .group-tab:has-text("בסיסי")')
await page.click('.quick.listed:has-text("בית מרקחת")')
await page.waitForSelector('.place-results .nearby-list li', { timeout: 15000 })
check(true, 'lists: a list opened before works offline (cached)')
await context.setOffline(false)

check(errors.length === 0, `no console errors${errors.length ? ': ' + errors.join(' | ') : ''}`)

// iPhone SE (375×667), no Japanese voice installed: nothing may stick out sideways, every frame
// button must be fully on screen, and 🔊 must warn instead of reading Japanese in a wrong accent.
const se = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await se.addInitScript(FAKE_SPEECH, [{ name: 'Samantha', lang: 'en-US' }])
const sp = await se.newPage()
await sp.goto(URL_)
await sp.waitForSelector('.tabbar')
for (const tab of ['ביטויים', 'משפטים', 'בסביבה', 'שלטים', 'כסף', 'מדריך']) {
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
