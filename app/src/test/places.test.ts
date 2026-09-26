import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { SEARCH_CATEGORIES } from '../content/nearby'
import { nearest } from '../lib/geo'
import { decodePlaces, type PlacesFile, type PlacesIndex } from '../lib/places'

const dir = new URL('../../public/data/places/', import.meta.url)
const read = <T,>(name: string) => JSON.parse(readFileSync(new URL(name, dir), 'utf8')) as T
const index = read<PlacesIndex>('index.json')
const ids = SEARCH_CATEGORIES.flatMap((c) => c.items.map((i) => i.id))

describe('places decoding', () => {
  it('reads names and English names when present', () => {
    const f: PlacesFile = { id: 'x', updated: '2026-09-26', scale: 1e4, pts: [[356812, 1397671, '東京駅', 'Tokyo Station'], [346661, 1355006]] }
    expect(decodePlaces(f)).toEqual([
      { lat: 35.6812, lon: 139.7671, name: '東京駅', en: 'Tokyo Station' },
      { lat: 34.6661, lon: 135.5006 },
    ])
  })
})

describe('downloaded places', () => {
  it('only lists categories that exist as quick searches, each with its file', () => {
    expect(Object.keys(index.categories).length).toBeGreaterThan(25)
    for (const id of Object.keys(index.categories)) {
      expect(ids, id).toContain(id)
      expect(existsSync(new URL(`${id}.json`, dir)), id).toBe(true)
    }
  })

  it('finds essentials near every city on the route', () => {
    const cities = {
      Tokyo: { lat: 35.6812, lon: 139.7671 },
      Osaka: { lat: 34.6661, lon: 135.5006 },
      Kyoto: { lat: 34.9858, lon: 135.7588 },
      Sapporo: { lat: 43.0687, lon: 141.3508 },
    }
    for (const id of ['drugstore', 'atm', 'ramen', 'station']) {
      const places = decodePlaces(read<PlacesFile>(`${id}.json`))
      for (const [city, here] of Object.entries(cities)) {
        expect(nearest(here, places, 10, 2000).length, `${id} near ${city}`).toBeGreaterThanOrEqual(3)
      }
    }
  })
})
