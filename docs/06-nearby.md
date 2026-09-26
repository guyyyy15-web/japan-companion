# 6. Nearby: toilets and trash cans

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

## Freshness
`.github/workflows/refresh-facilities.yml` runs monthly (and on demand). It re-downloads
the data, commits it to `main` if it changed, and redeploys through `deploy.yml`
(`workflow_call`).

Data © OpenStreetMap contributors, ODbL.
