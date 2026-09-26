// Downloads named places across Japan from OpenStreetMap (Overpass API) for the Nearby quick searches and
// writes one compact file per category: public/data/places/<id>.json, plus index.json with the counts.
//
//   node scripts/fetch-places.mjs            # all of Japan
//   BOX=35.6,139.65,35.75,139.85 node scripts/fetch-places.mjs   # a test area
//   EXTRA=1 node scripts/fetch-places.mjs    # only the second set (supermarkets, cafés, parks…), merged into index.json
//
// Each region is one CSV query (small and fast); regions that time out are split into four and retried.
// A category is only published when it passes the coverage check at the bottom (see COVERAGE).
// Data © OpenStreetMap contributors, ODbL.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]
const OUT = new URL('../public/data/places/', import.meta.url)
const FACILITIES = new URL('../public/data/facilities.json', import.meta.url)
const PAUSE_MS = 6000
const MIN_SPAN = 0.25
const SCALE = 1e4 // ~10 m, plenty for walking directions
// Finished boxes are kept here so a re-run after a failure resumes instead of starting over.
const CACHE = process.env.CACHE ?? join(tmpdir(), 'jc-places-cache')

const REGIONS = process.env.BOX
  ? [process.env.BOX.split(',').map(Number)]
  : [
      [41.3, 139.3, 45.6, 146.0], // Hokkaido
      [36.8, 139.0, 41.6, 142.2], // Tohoku
      [34.8, 138.4, 37.2, 141.0], // Kanto
      [34.4, 135.8, 38.6, 138.4], // Chubu
      [33.4, 134.2, 36.0, 135.8], // Kansai
      [32.6, 130.8, 36.0, 134.2], // Chugoku & Shikoku
      [30.9, 128.9, 34.9, 130.8], // Kyushu (west)
      [30.9, 130.8, 32.6, 132.2], // Kyushu (south-east)
      [24.0, 122.9, 30.9, 131.4], // Okinawa & islands
    ]

const COLUMNS = ['name', 'name:en', 'amenity', 'shop', 'leisure', 'tourism', 'cuisine', 'religion', 'railway', 'bath:type', 'sport', 'second_hand', 'brand', 'access', 'information']
const EXTRA = !!process.env.EXTRA

const SHOP_NAMES =
  'ドン・キホーテ|ドン･キホーテ|MEGAドン|ハードオフ|HARD ?OFF|オフハウス|ホビーオフ|ブックオフ|BOOK ?OFF|ポケモンセンター|ポケモンストア|古着|アニメイト|まんだらけ|らしんばん|駿河屋|ガチャ|ガシャポン|着物レンタル|レンタル着物'

function query([s, w, n, e]) {
  const bb = `${s},${w},${n},${e}`
  const cols = ['::type', '::id', '::lat', '::lon', ...COLUMNS.map((c) => `"${c}"`)].join(',')
  if (EXTRA)
    return `[out:csv(${cols};true;"\\t")][timeout:300];
(
  nw[shop~"^(supermarket|bakery)$"](${bb});
  nw[amenity~"^(cafe|taxi|bicycle_rental|drinking_water)$"](${bb});
  nw[tourism=information][information=office](${bb});
  nw[tourism~"^(museum|gallery|zoo|aquarium)$"](${bb});
  nw[leisure=park][name](${bb});
);
out center;`
  return `[out:csv(${cols};true;"\\t")][timeout:300];
(
  nw[amenity~"^(pharmacy|atm|bureau_de_change|police|hospital|clinic|doctors|post_office|restaurant|fast_food|cafe|karaoke_box|public_bath|place_of_worship|smoking_area|sauna|bar|pub)$"](${bb});
  nw[shop~"^(chemist|laundry|department_store|confectionery|second_hand|variety_store|video_games|electronics|photo|camera|anime|cosmetics|perfumery|stationery|knives|ceramics)$"](${bb});
  nw[shop][name~"${SHOP_NAMES}",i](${bb});
  nw[shop=clothes][second_hand](${bb});
  nw[leisure~"^(amusement_arcade|fitness_centre|sauna|garden|sports_centre)$"](${bb});
  nw[leisure=swimming_pool][name](${bb});
  nw[tourism=viewpoint](${bb});
  node[railway=station](${bb});
);
out center;`
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function parse(tsv) {
  const lines = tsv.split('\n').filter(Boolean)
  const head = lines.shift()?.split('\t') ?? []
  if (head[0] !== '@type') return null
  return lines.map((l) => {
    const cells = l.split('\t')
    return Object.fromEntries(head.map((h, i) => [h.replace(/^@/, ''), cells[i] ?? '']))
  })
}

/** Mirrors that failed to connect are skipped for the rest of the run instead of timing out every time. */
const dead = new Set()

async function fetchBox(box) {
  for (const ep of ENDPOINTS) {
    if (dead.has(ep)) continue
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'japan-companion (personal travel PWA)', Accept: '*/*' },
        body: 'data=' + encodeURIComponent(query(box)),
        signal: AbortSignal.timeout(330_000),
      })
      if (res.ok) {
        const text = await res.text()
        // Overpass reports timeouts inside a 200 response; a truncated CSV has no remark we can see, so
        // treat "runtime error" text and missing headers as failures.
        const rows = !text.includes('runtime error') && parse(text)
        if (rows) return rows
      }
    } catch (e) {
      // A connection failure (not a slow query) means the mirror is down.
      if (e?.name !== 'TimeoutError' && ep !== ENDPOINTS[0]) dead.add(ep)
    }
    await sleep(PAUSE_MS)
  }
  return null
}

async function collect(box, depth = 0) {
  const pad = '  '.repeat(depth)
  const file = join(CACHE, `${EXTRA ? 'extra-' : ''}${box.join('_')}.json`)
  try {
    const cached = JSON.parse(await readFile(file, 'utf8'))
    console.log(`${pad}✓ ${box.join(',')}: ${cached.length} (cached)`)
    return cached
  } catch {
    // not fetched yet
  }
  const rows = await fetchBox(box)
  await sleep(PAUSE_MS)
  if (rows) {
    console.log(`${pad}✓ ${box.join(',')}: ${rows.length}`)
    await writeFile(file, JSON.stringify(rows))
    return rows
  }
  const [s, w, n, e] = box
  if (n - s < MIN_SPAN) throw new Error(`gave up on ${box.join(',')}`)
  console.log(`${pad}↳ splitting ${box.join(',')}`)
  const ms = (s + n) / 2
  const mw = (w + e) / 2
  let out = []
  for (const p of [[s, w, ms, mw], [s, mw, ms, e], [ms, w, n, mw], [ms, mw, n, e]]) out = out.concat(await collect(p, depth + 1))
  return out
}

// ---- Classification: which quick search each place answers ----

const has = (value, re) => !!value && re.test(value)
const cuisine = (r, re) => r.cuisine.split(';').some((c) => re.test(c.trim()))
const eatery = (r) => /^(restaurant|fast_food|cafe|bar|pub)$/.test(r.amenity)
const nm = (r) => `${r.name} ${r['name:en']} ${r.brand}`

/** Second set (EXTRA=1): everyday places added after the first download. */
const EXTRA_RULES = {
  supermarket: (r) => r.shop === 'supermarket',
  info: (r) => r.tourism === 'information' && r.information === 'office',
  taxi: (r) => r.amenity === 'taxi',
  water: (r) => r.amenity === 'drinking_water',
  cafe: (r) => r.amenity === 'cafe',
  bakery: (r) => r.shop === 'bakery',
  park: (r) => r.leisure === 'park' && !!r.name,
  museum: (r) => r.tourism === 'museum' || r.tourism === 'gallery',
  zoo: (r) => r.tourism === 'zoo' || r.tourism === 'aquarium',
  bike: (r) => r.amenity === 'bicycle_rental',
}

/** id → test. Ids match SEARCH_CATEGORIES items in src/content/nearby.ts. */
const MAIN_RULES = {
  // Essentials
  station: (r) => r.railway === 'station' && r.type === 'node',
  atm: (r) => r.amenity === 'atm' || r.amenity === 'post_office',
  exchange: (r) => r.amenity === 'bureau_de_change',
  drugstore: (r) => r.amenity === 'pharmacy' || r.shop === 'chemist',
  laundry: (r) => r.shop === 'laundry',
  koban: (r) => r.amenity === 'police',
  clinic: (r) => /^(hospital|clinic|doctors)$/.test(r.amenity),
  post: (r) => r.amenity === 'post_office',
  smoking: (r) => r.amenity === 'smoking_area',
  // Food
  ramen: (r) => eatery(r) && (cuisine(r, /^ramen$/) || has(nm(r), /ラーメン|らーめん|拉麺|中華そば|つけ麺|麺屋|ramen/i)),
  kaiten: (r) => eatery(r) && has(nm(r), /回転|スシロー|くら寿司|はま寿司|かっぱ寿司|元気寿司|魚べい|がってん寿司|トリトン|根室花まる|sushiro|kura sushi|hama sushi/i),
  izakaya: (r) => eatery(r) && (cuisine(r, /izakaya/) || has(nm(r), /居酒屋|酒場|鳥貴族|和民|笑笑|白木屋|磯丸|串カツ田中|魚民|山内農場|izakaya/i)),
  yakiniku: (r) => eatery(r) && (cuisine(r, /^(yakiniku|barbecue)$/) || has(nm(r), /焼肉|焼き肉|牛角|叙々苑|安楽亭|焼肉きんぐ/)),
  teishoku: (r) => eatery(r) && (cuisine(r, /teishoku/) || has(nm(r), /定食|やよい軒|大戸屋|食堂/)),
  gyudon: (r) => eatery(r) && (cuisine(r, /beef_bowl/) || has(nm(r), /すき家|吉野家|松屋|なか卯|牛丼|sukiya|yoshinoya|matsuya/i)),
  soba: (r) => eatery(r) && (cuisine(r, /^(soba|udon)$/) || has(nm(r), /そば|蕎麦|うどん|饂飩|丸亀製麺|富士そば|小諸そば|はなまる/)),
  okonomiyaki: (r) => eatery(r) && (cuisine(r, /okonomiyaki|monjayaki/) || has(nm(r), /お好み焼|もんじゃ|okonomiyaki/i)),
  takoyaki: (r) => eatery(r) && (cuisine(r, /takoyaki/) || has(nm(r), /たこ焼|たこやき|銀だこ|takoyaki/i)),
  unagi: (r) => eatery(r) && (cuisine(r, /unagi|eel/) || has(nm(r), /うなぎ|鰻|unagi/i)),
  depachika: (r) => r.shop === 'department_store',
  kissaten: (r) => r.amenity === 'cafe' && has(nm(r), /喫茶|珈琲|ルノアール|コメダ|星乃|椿屋|宮越屋|談話室|純喫茶|kissa/i),
  matcha: (r) => eatery(r) && (cuisine(r, /japanese_sweets|wagashi|kakigori|matcha|tea/) || has(nm(r), /甘味|茶房|抹茶|あんみつ|だんご|団子|茶寮|matcha/i)),
  buffet: (r) => eatery(r) && (cuisine(r, /buffet/) || has(nm(r), /食べ放題|バイキング|ビュッフェ|buffet/i)),
  // Fun
  arcade: (r) => r.leisure === 'amusement_arcade' || has(nm(r), /ゲームセンター|GiGO|タイトーステーション|ラウンドワン|Round ?1|namco/i),
  karaoke: (r) => r.amenity === 'karaoke_box' || (!!r.amenity && has(nm(r), /カラオケ|ビッグエコー|まねきねこ|ジャンカラ|karaoke/i)),
  gacha: (r) => !!r.shop && has(nm(r), /ガチャ|ガシャポン|gashapon|gacha/i),
  onsen: (r) => r.amenity === 'public_bath' && (r['bath:type'] === 'onsen' || has(r.name, /温泉|onsen/i)),
  sento: (r) => r.amenity === 'public_bath' && r['bath:type'] !== 'onsen' && !has(r.name, /温泉|足湯/),
  ashiyu: (r) => r.amenity === 'public_bath' && (r['bath:type'] === 'foot_bath' || has(r.name, /足湯/)),
  sauna: (r) => r.leisure === 'sauna' || r.amenity === 'sauna' || (r.amenity === 'public_bath' && has(r.name, /サウナ|sauna/i)),
  gym: (r) => r.leisure === 'fitness_centre',
  pool: (r) => (r.leisure === 'swimming_pool' && r.access !== 'private') || (r.leisure === 'sports_centre' && has(r.sport, /swimming/)),
  'cat-cafe': (r) => eatery(r) && has(nm(r), /猫カフェ|ねこカフェ|ネコカフェ|cat ?caf/i),
  'animal-cafe': (r) => eatery(r) && has(nm(r), /ふくろう|フクロウ|ハリネズミ|うさぎ|豆しば|カワウソ|アニマルカフェ|動物カフェ|owl|hedgehog/i),
  view: (r) => r.tourism === 'viewpoint',
  shrine: (r) => r.amenity === 'place_of_worship' && r.religion === 'shinto',
  temple: (r) => r.amenity === 'place_of_worship' && r.religion === 'buddhist',
  garden: (r) => r.leisure === 'garden' && has(r.name, /庭園|日本庭園|園$|garden/i),
  kimono: (r) => !!r.shop && has(nm(r), /着物レンタル|レンタル着物|kimono/i),
  // Shopping
  vintage: (r) => (r.shop === 'second_hand' || (r.shop === 'clothes' && !!r.second_hand)) || (!!r.shop && has(nm(r), /古着/)),
  donki: (r) => !!r.shop && has(nm(r), /ドン・キホーテ|ドン･キホーテ|MEGAドン|Don Quijote|Donki/i),
  '100yen': (r) => r.shop === 'variety_store' || (!!r.shop && has(nm(r), /ダイソー|DAISO|セリア|Seria|キャンドゥ|Can ?Do|100円/i)),
  'retro-games': (r) => r.shop === 'video_games',
  hardoff: (r) => !!r.shop && has(nm(r), /ハードオフ|HARD ?OFF|オフハウス|ホビーオフ/i),
  bookoff: (r) => !!r.shop && has(nm(r), /ブックオフ|BOOK ?OFF/i),
  electronics: (r) => r.shop === 'electronics',
  camera: (r) => r.shop === 'camera' || r.shop === 'photo',
  anime: (r) => r.shop === 'anime' || (!!r.shop && has(nm(r), /アニメイト|まんだらけ|らしんばん|駿河屋|animate|mandarake/i)),
  pokemon: (r) => !!r.shop && has(nm(r), /ポケモンセンター|ポケモンストア|Pok[eé]mon ?Center/i),
  cosmetics: (r) => r.shop === 'cosmetics' || r.shop === 'perfumery',
  stationery: (r) => r.shop === 'stationery',
  knives: (r) => r.shop === 'knives',
  pottery: (r) => r.shop === 'ceramics',
  wagashi: (r) => r.shop === 'confectionery',
}

/** Coverage check: a category ships only if people will actually find one near them. */
const CITIES = {
  'Tokyo Station': [35.6812, 139.7671],
  Shinjuku: [35.6896, 139.7006],
  'Osaka Namba': [34.6661, 135.5006],
  'Kyoto Station': [34.9858, 135.7588],
  'Sapporo Station': [43.0687, 141.3508],
}
const R = 6371000
const rad = (d) => (d * Math.PI) / 180
function dist([a, b], [c, d]) {
  const h = Math.sin(rad(c - a) / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(rad(d - b) / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
/** Dense categories need ≥ 3 within 3 km in at least 4 of the 5 cities; chains need ≥ 1 within 20 km in 4 of 5. */
function coverage(points) {
  const near = (km, min) => Object.values(CITIES).filter((c) => points.filter((p) => dist(c, p) <= km * 1000).length >= min).length
  const dense = near(3, 3)
  const sparse = near(20, 1)
  return { dense, sparse, ok: points.length >= 20 && (dense >= 4 || sparse >= 4) }
}

const RULES = EXTRA ? EXTRA_RULES : MAIN_RULES

// ---- Run ----

await mkdir(CACHE, { recursive: true })
let rows = []
// concat, not push(...rows): a region can have 200,000 rows, more than the call stack takes as arguments.
for (const r of REGIONS) rows = rows.concat(await collect(r))

const seen = new Set()
const buckets = Object.fromEntries(Object.keys(RULES).map((k) => [k, []]))
for (const r of rows) {
  const key = `${r.type}/${r.id}`
  if (seen.has(key)) continue
  seen.add(key)
  const lat = parseFloat(r.lat)
  const lon = parseFloat(r.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue
  for (const [id, test] of Object.entries(RULES)) {
    if (!test(r)) continue
    const name = r.name.slice(0, 40)
    const en = r['name:en'] && r['name:en'] !== r.name ? r['name:en'].slice(0, 40) : ''
    const pt = [Math.round(lat * SCALE), Math.round(lon * SCALE)]
    if (name || en) pt.push(name)
    if (en) pt.push(en)
    buckets[id].push(pt)
  }
}

// Every 7-Eleven has a Seven Bank ATM that takes foreign cards; add them from the konbini data.
if (!EXTRA) try {
  const fac = JSON.parse(await readFile(FACILITIES, 'utf8'))
  for (const [la, lo, brand] of fac.konbini ?? []) {
    if (brand === 1) buckets.atm.push([Math.round((la / fac.scale) * SCALE), Math.round((lo / fac.scale) * SCALE), 'セブン銀行ATM', '7-Eleven (Seven Bank ATM)'])
  }
} catch {
  console.warn('facilities.json not found: ATMs without 7-Eleven')
}

await mkdir(OUT, { recursive: true })
const updated = new Date().toISOString().slice(0, 10)
const index = { source: 'OpenStreetMap contributors (ODbL)', updated, scale: SCALE, categories: {} }
// The second set adds to what the first run published.
if (EXTRA) {
  try {
    index.categories = JSON.parse(await readFile(new URL('index.json', OUT), 'utf8')).categories
  } catch {
    // no first run yet
  }
}
const report = []
for (const [id, pts] of Object.entries(buckets)) {
  const cov = coverage(pts.map(([la, lo]) => [la / SCALE, lo / SCALE]))
  report.push(`${cov.ok ? '✓' : '✗'} ${id.padEnd(12)} ${String(pts.length).padStart(7)}  dense ${cov.dense}/5  within-20km ${cov.sparse}/5`)
  if (!cov.ok || process.env.BOX) continue
  index.categories[id] = pts.length
  await writeFile(new URL(`${id}.json`, OUT), JSON.stringify({ id, updated, scale: SCALE, pts }))
}
if (!process.env.BOX) await writeFile(new URL('index.json', OUT), JSON.stringify(index))
console.log(report.join('\n'))
console.log(`${Object.keys(index.categories).length} categories published → ${OUT.pathname}`)
