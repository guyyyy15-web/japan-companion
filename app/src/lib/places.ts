import type { LatLon } from './geo'

/** A named place from data/places/<id>.json (written by scripts/fetch-places.mjs). */
export interface Place extends LatLon {
  name?: string
  en?: string
}

export interface PlacesIndex {
  source: string
  updated: string
  scale: number
  /** Category id → number of places in Japan. Only categories that passed the coverage check are listed. */
  categories: Record<string, number>
}

export interface PlacesFile {
  id: string
  updated: string
  scale: number
  /** [lat×scale, lon×scale, name?, englishName?] */
  pts: (number | string)[][]
}

export function decodePlaces(file: PlacesFile): Place[] {
  return file.pts.map(([la, lo, name, en]) => ({
    lat: (la as number) / file.scale,
    lon: (lo as number) / file.scale,
    ...(name ? { name: name as string } : {}),
    ...(en ? { en: en as string } : {}),
  }))
}

const base = () => `${import.meta.env.BASE_URL}data/places/`

let index: Promise<PlacesIndex | null> | null = null
/** Which categories have an in-app list. Resolves to null when it can't be loaded (offline, never opened). */
export function loadPlacesIndex(): Promise<PlacesIndex | null> {
  index ??= fetch(`${base()}index.json`)
    .then((r) => (r.ok ? (r.json() as Promise<PlacesIndex>) : null))
    .catch(() => null)
  index.then((i) => i ?? (index = null))
  return index
}

const files = new Map<string, Promise<Place[]>>()
/** One category's places; the service worker keeps it for offline use after the first load. */
export function loadPlaces(id: string): Promise<Place[]> {
  let p = files.get(id)
  if (!p) {
    p = fetch(`${base()}${id}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json() as Promise<PlacesFile>
      })
      .then(decodePlaces)
    p.catch(() => files.delete(id))
    files.set(id, p)
  }
  return p
}
