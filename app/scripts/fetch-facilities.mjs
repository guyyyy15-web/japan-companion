// Downloads every public toilet, trash bin and konbini in Japan from OpenStreetMap (Overpass API) and writes
// a compact offline file for the Nearby tab: public/data/facilities.json.
//
//   node scripts/fetch-facilities.mjs
//
// Regions that time out are split into four and retried, and requests are spaced out to respect the
// public Overpass servers' fair-use limits. Data © OpenStreetMap contributors, ODbL.
import { writeFile, mkdir } from 'node:fs/promises'

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]
const OUT = new URL('../public/data/facilities.json', import.meta.url)
const PAUSE_MS = 8000
const MIN_SPAN = 0.4 // degrees; don't split below this

// [south, west, north, east] boxes covering Japan's land.
const REGIONS = [
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function query([s, w, n, e]) {
  const bb = `${s},${w},${n},${e}`
  return `[out:json][timeout:180];
(
  node[amenity=toilets](${bb});
  way[amenity=toilets](${bb});
  node[amenity=waste_basket](${bb});
  node[amenity=recycling]["recycling:cans"=yes](${bb});
  node[amenity=recycling]["recycling:plastic_bottles"=yes](${bb});
  node[shop=convenience](${bb});
  way[shop=convenience](${bb});
);
out center tags;`
}

async function fetchBox(box) {
  for (const ep of ENDPOINTS) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'japan-companion (personal travel PWA)' },
        body: 'data=' + encodeURIComponent(query(box)),
        signal: AbortSignal.timeout(200_000),
      })
      if (res.ok) {
        const json = await res.json()
        if (!json.remark?.includes('runtime error')) return json.elements
      }
    } catch {
      // try the next endpoint
    }
    await sleep(PAUSE_MS)
  }
  return null
}

async function collect(box, depth = 0) {
  const pad = '  '.repeat(depth)
  const els = await fetchBox(box)
  await sleep(PAUSE_MS)
  if (els) {
    console.log(`${pad}✓ ${box.join(',')}: ${els.length}`)
    return els
  }
  const [s, w, n, e] = box
  if (n - s < MIN_SPAN) throw new Error(`gave up on ${box.join(',')}`)
  console.log(`${pad}↳ splitting ${box.join(',')}`)
  const ms = (s + n) / 2
  const mw = (w + e) / 2
  const parts = [
    [s, w, ms, mw],
    [s, mw, ms, e],
    [ms, w, n, mw],
    [ms, mw, n, e],
  ]
  const out = []
  for (const p of parts) out.push(...(await collect(p, depth + 1)))
  return out
}

// Konbini brand codes (third number in each point): the big three have ATMs and toilets you can ask for.
const BRANDS = [
  [1, /セブン|7-eleven|seven/i],
  [2, /ローソン|lawson/i],
  [3, /ファミリーマート|ファミマ|familymart/i],
]

function brandCode(t) {
  const text = [t.brand, t['brand:en'], t.name, t['name:en']].filter(Boolean).join(' ')
  return BRANDS.find(([, re]) => re.test(text))?.[0] ?? 0
}

/** Keep public, free-to-enter places; round to ~1 m; one entry per OSM object. */
export function compact(elements) {
  const seen = new Set()
  const toilets = []
  const bins = []
  const konbini = []
  for (const el of elements) {
    const key = `${el.type}/${el.id}`
    if (seen.has(key)) continue
    seen.add(key)
    const t = el.tags ?? {}
    const isShop = t.shop === 'convenience'
    if (!isShop && ['private', 'no', 'customers'].includes(t.access)) continue
    const lat = el.lat ?? el.center?.lat
    const lon = el.lon ?? el.center?.lon
    if (typeof lat !== 'number' || typeof lon !== 'number') continue
    const pt = [Math.round(lat * 1e5), Math.round(lon * 1e5)]
    if (isShop) {
      const b = brandCode(t)
      if (b) pt.push(b)
      konbini.push(pt)
    } else if (t.amenity === 'toilets') {
      if (t.fee === 'yes') pt.push(1) // flag: paid toilet
      toilets.push(pt)
    } else bins.push(pt)
  }
  return { toilets, bins, konbini }
}

const all = []
for (const r of REGIONS) all.push(...(await collect(r)))
const { toilets, bins, konbini } = compact(all)
const data = {
  source: 'OpenStreetMap contributors (ODbL)',
  updated: new Date().toISOString().slice(0, 10),
  scale: 1e5,
  toilets,
  bins,
  konbini,
}
await mkdir(new URL('.', OUT), { recursive: true })
await writeFile(OUT, JSON.stringify(data))
console.log(`toilets ${toilets.length}, bins ${bins.length}, konbini ${konbini.length} → ${OUT.pathname}`)
