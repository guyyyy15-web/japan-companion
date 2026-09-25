import { describe, expect, it } from 'vitest'
import { normalize, suggest } from '../lib/suggest'

const top = (q: string, lang: 'he' | 'en' = 'en', n = 3) => suggest(q, lang).slice(0, n).map((s) => `${s.pattern.id}+${s.word.id}`)

describe('type-ahead', () => {
  it('finds the obvious sentence for one word, in either language or Japanese', () => {
    expect(top('toilet')).toContain('where+toilet')
    expect(top('שירותים', 'he')).toContain('where+toilet')
    expect(top('トイレ')).toContain('where+toilet')
    expect(top('toire')).toContain('where+toilet')
  })

  it('combines a frame word with a noun', () => {
    expect(top('rent bike', 'en', 2)).toEqual(expect.arrayContaining(['rent-price+bicycle', 'rent-where+bicycle']))
    expect(top('לשכור אופניים', 'he', 2)).toContain('rent-price+bicycle')
    expect(top('how much that', 'en', 2)).toContain('how-much+that')
    expect(top('allergic peanuts', 'en', 1)).toEqual(['allergy+peanuts'])
  })

  it('finds requests by their verb', () => {
    expect(top('heat')).toContain('do-for-me+do-heat')
    expect(top('לחמם', 'he')).toContain('do-for-me+do-heat')
    expect(top('photo')).toEqual(expect.arrayContaining([expect.stringMatching(/photo/)]))
  })

  it('varies the results instead of repeating one frame', () => {
    const frames = suggest('bicycle', 'en').map((s) => s.pattern.id)
    for (const f of new Set(frames)) expect(frames.filter((x) => x === f).length).toBeLessThanOrEqual(3)
    expect(suggest('bicycle', 'en').length).toBeGreaterThan(1)
  })

  it('returns nothing for empty or junk input, without throwing', () => {
    expect(suggest('', 'en')).toEqual([])
    expect(suggest('   ?!', 'he')).toEqual([])
    expect(suggest('zzzzqqq', 'en')).toEqual([])
  })

  it('normalizes punctuation and geresh', () => {
    expect(normalize("צ'ק-אין?")).toBe('צק אין')
  })
})
