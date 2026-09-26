export interface LatLon {
  lat: number
  lon: number
}

/** Konbini brand codes written by scripts/fetch-facilities.mjs. */
export type Brand = 1 | 2 | 3
export const BRAND_NAMES: Record<Brand, string> = { 1: '7-Eleven', 2: 'Lawson', 3: 'FamilyMart' }

export interface Facility extends LatLon {
  paid?: boolean
  brand?: Brand
}

export interface Facilities {
  source: string
  updated: string
  toilets: Facility[]
  bins: Facility[]
  konbini: Facility[]
}

/** The compact file written by scripts/fetch-facilities.mjs: [lat×1e5, lon×1e5, flag?] (paid toilet, or konbini brand). */
export interface FacilitiesFile {
  source: string
  updated: string
  scale: number
  toilets: number[][]
  bins: number[][]
  konbini?: number[][]
}

export function decode(file: FacilitiesFile): Facilities {
  const at = ([la, lo]: number[]): Facility => ({ lat: la / file.scale, lon: lo / file.scale })
  const toilet = (p: number[]): Facility => (p[2] ? { ...at(p), paid: true } : at(p))
  const shop = (p: number[]): Facility => (p[2] ? { ...at(p), brand: p[2] as Brand } : at(p))
  return {
    source: file.source,
    updated: file.updated,
    toilets: file.toilets.map(toilet),
    bins: file.bins.map(at),
    konbini: (file.konbini ?? []).map(shop),
  }
}

const R = 6371000
const rad = (d: number) => (d * Math.PI) / 180

/** Great-circle distance in metres. */
export function distance(a: LatLon, b: LatLon): number {
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Initial compass bearing from a to b, 0–360° (0 = north, 90 = east). */
export function bearing(a: LatLon, b: LatLon): number {
  const y = Math.sin(rad(b.lon - a.lon)) * Math.cos(rad(b.lat))
  const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lon - a.lon))
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

export interface Nearby<T> {
  item: T
  meters: number
  bearing: number
}

/** The `limit` closest items within `maxMeters`. A cheap lat/lon window filters before exact distances. */
export function nearest<T extends LatLon>(from: LatLon, items: T[], limit = 8, maxMeters = 5000): Nearby<T>[] {
  const dLat = maxMeters / 111_000
  const dLon = maxMeters / (111_000 * Math.max(0.2, Math.cos(rad(from.lat))))
  const out: Nearby<T>[] = []
  for (const item of items) {
    if (Math.abs(item.lat - from.lat) > dLat || Math.abs(item.lon - from.lon) > dLon) continue
    const meters = distance(from, item)
    if (meters <= maxMeters) out.push({ item, meters, bearing: 0 })
  }
  out.sort((a, b) => a.meters - b.meters)
  return out.slice(0, limit).map((n) => ({ ...n, bearing: bearing(from, n.item) }))
}

/** "80 m", "450 m", "1.2 km" — rounded the way people read a sign. */
export function formatDistance(meters: number, lang: 'he' | 'en'): string {
  const km = lang === 'he' ? 'ק״מ' : 'km'
  const m = lang === 'he' ? 'מ׳' : 'm'
  if (meters < 1000) return `${Math.max(10, Math.round(meters / 10) * 10)} ${m}`
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} ${km}`
}

const COMPASS = {
  he: ['צפון', 'צפון-מזרח', 'מזרח', 'דרום-מזרח', 'דרום', 'דרום-מערב', 'מערב', 'צפון-מערב'],
  en: ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'],
}

export function compassWord(deg: number, lang: 'he' | 'en'): string {
  return COMPASS[lang][Math.round(deg / 45) % 8]
}

/** Walking directions in Google Maps (opens the app on iPhone if installed). */
export function directionsUrl(to: LatLon): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${to.lat.toFixed(6)},${to.lon.toFixed(6)}&travelmode=walking`
}

/** Directions to a typed address; Google Maps picks the travel mode. */
export function addressDirectionsUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
}

/** A Google Maps search around the phone's current position (no location in the URL). */
export function searchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
