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

## In-app lists for the quick searches (v0.11)
Google Maps shows only about 20 results around the map centre, which looks empty in a city with
thousands of pharmacies. So the quick searches now have their own data:

- `scripts/fetch-places.mjs` downloads named places for all of Japan from OpenStreetMap as CSV
  (one Overpass query per region, split into quarters on timeout). `RULES` maps OSM tags **and names**
  to each quick search, e.g. ramen = `cuisine=ramen` or a name with ラーメン/らーめん/中華そば; ATMs =
  `amenity=atm` + post offices + every 7-Eleven (Seven Bank) from the konbini data.
- `EXTRA=1` runs a second set (supermarkets, tourist info, taxi stands, cafés, bakeries, parks,
  museums, zoos/aquariums, bike rental, drinking water) and merges it into `index.json`.
- **Coverage check** before a category ships: ≥ 20 places in Japan, and either ≥ 3 within 3 km in 4 of
  5 test points (Tokyo Station, Shinjuku, Namba, Kyoto Station, Sapporo Station) or ≥ 1 within 20 km in
  4 of 5 (for chains like Pokémon Center). Categories that fail stay as Google Maps links.
- Output: `public/data/places/<id>.json` (`[lat×1e4, lon×1e4, name?, englishName?]`) and `index.json`
  with the counts. The service worker does **not** precache them (≈21 MB raw, 7 MB compressed); each loads when first
  opened and is then cached (StaleWhileRevalidate). "Save all places for offline" fetches them all.
- In the app: tiles with a 📍 open the nearest 10 (up to 50 within 50 km), named in Japanese and
  English when known, with distance, arrow, walking directions, all of them on a map, and the Google
  Maps search as a fallback.

## Freshness
`.github/workflows/refresh-facilities.yml` runs monthly (and on demand). It re-downloads
the data, commits it to `main` if it changed, and redeploys through `deploy.yml`
(`workflow_call`).

Data © OpenStreetMap contributors, ODbL.
