import { describe, expect, it } from 'vitest'
import { ATTRACTIONS, CITIES, INTERESTS } from '../content/attractions'

describe('attractions', () => {
  it('are complete and consistent', () => {
    const ids = ATTRACTIONS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const a of ATTRACTIONS) {
      expect(CITIES, a.id).toContain(a.city)
      expect(a.interests.length, a.id).toBeGreaterThan(0)
      for (const i of a.interests) expect(INTERESTS, a.id).toContain(i)
      expect(a.name.he + a.what.he, a.id).toMatch(/[א-ת]/)
      expect(a.name.en + a.what.en, a.id).toMatch(/[a-z]/i)
      expect(a.ja, a.id).toMatch(/[぀-ヿ一-龯]|[A-Z]/)
      if (a.url) expect(a.url, a.id).toMatch(/^https:\/\//)
      // Anything that needs booking says how.
      if (a.booking !== 'none') expect(a.bookNote?.he, a.id).toBeTruthy()
    }
  })

  it('cover every city and interest', () => {
    for (const c of CITIES) expect(ATTRACTIONS.filter((a) => a.city === c).length, c).toBeGreaterThanOrEqual(5)
    for (const i of INTERESTS) expect(ATTRACTIONS.filter((a) => a.interests.includes(i)).length, i).toBeGreaterThanOrEqual(5)
  })
})
