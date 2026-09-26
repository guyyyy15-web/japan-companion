# 6. Nearby: toilets, trash cans, konbini, searches and local apps

## Why two layers
- **Google Maps links** know toilets well but barely list bins, and need internet.
  Searches run around the phone's position (`/maps/search/?api=1&query=…`
  with no location). Japanese queries (公衆トイレ, ゴミ箱) find far more.
- **OpenStreetMap** has good public-toilet coverage (Tokyo ≈ 3,500) but few bins.
  Public bins really are rare in Japan (removed after the 1995 sarin attack).
  So the app bundles an OSM snapshot and falls back to the realistic advice:
  konbini, stations, and vending-machine bins (bottles and cans).

## Offline list
- `scripts/fetch-facilities.mjs` downloads `amenity=toilets` (nodes and ways),
  `amenity=waste_basket`, and recycling points taking cans or bottles. It works
  region by region, splits any box that times out, and skips `access=private|no|customers`.
- Output: `app/public/data/facilities.json`, `[lat×1e5, lon×1e5, paid?]`, about 620 KB
  (225 KB compressed). The service worker precaches it (limit raised to 6 MB).
- `lib/geo.ts`: distance, bearing, `nearest()` (window filter, then exact distance),
  distance formatting, compass words, and Google Maps URLs.
- The list shows the nearest 8 within 3 km. Arrows are north-up until you tap
  "compass" (iOS asks for motion permission once), then they rotate with the phone.
- The map (Leaflet + OSM tiles) is lazy-loaded and only offered online.

## Konbini (v0.8)
- Also in the offline file: `shop=convenience` nodes and ways, with a brand code as the third number
  (1 = 7-Eleven, 2 = Lawson, 3 = FamilyMart, missing = other). A konbini is the practical answer to
  "toilet, ATM, bin, food or water", so it gets its own offline list.

## Searches and apps
- `content/nearby.ts` → `SEARCH_CATEGORIES`: four groups of Google Maps searches, with the
  Japanese query shown under each label (it doubles as vocabulary). The search box filters them by
  Hebrew, English or Japanese, and can also send the typed text to Google Maps as is.
- `LOCAL_APPS`: apps and sites Japanese people use (Tabelog, Hot Pepper, Yahoo! 乗換案内, GO,
  ecbo cloak, tenki.jp and its autumn-leaves forecast…). Every URL was checked to return 200 when added.
  Sites that block bots (Uniqlo, Yodobashi…) were left out rather than linked blind.

## Freshness
`.github/workflows/refresh-facilities.yml` runs monthly (and on demand). It re-downloads
the data, commits it to `main` if it changed, and redeploys through `deploy.yml`
(`workflow_call`).

Data © OpenStreetMap contributors, ODbL.
