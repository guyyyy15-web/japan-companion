import { describe, expect, it } from 'vitest'
import { dayOf, newExpense, sanitize, totals } from '../lib/wallet'

const at = (iso: string) => new Date(iso)

describe('trip wallet', () => {
  it('creates tidy entries', () => {
    const e = newExpense(1234.6, 'food', 'cash', '  ramen  ', at('2026-10-10T12:00:00'))
    expect(e).toMatchObject({ yen: 1235, cat: 'food', method: 'cash', note: 'ramen' })
    expect(newExpense(500, 'other', 'card', '   ').note).toBeUndefined()
  })

  it('adds up by category, day and payment method', () => {
    const list = [
      newExpense(1000, 'food', 'cash', '', at('2026-10-10T12:00:00')),
      newExpense(3000, 'shopping', 'card', '', at('2026-10-10T18:00:00')),
      newExpense(500, 'food', 'card', '', at('2026-10-11T09:00:00')),
    ]
    const s = totals(list)
    expect(s.total).toBe(4500)
    expect(s.cash).toBe(1000)
    expect(s.card).toBe(3500)
    expect(s.byCat).toEqual([
      { cat: 'shopping', yen: 3000 },
      { cat: 'food', yen: 1500 },
    ])
    expect(s.byDay.map((d) => [d.day, d.yen])).toEqual([
      ['2026-10-11', 500],
      ['2026-10-10', 4000],
    ])
    // Newest first within a day.
    expect(s.byDay[1].items[0].cat).toBe('shopping')
  })

  it('uses the local day', () => {
    expect(dayOf({ at: new Date(2026, 9, 10, 23, 30).toISOString() })).toBe('2026-10-10')
  })

  it('drops damaged saved data', () => {
    const good = newExpense(800, 'transport', 'card')
    expect(sanitize([good, null, { ...good, yen: -5 }, { ...good, cat: 'x' }, { ...good, at: 'nope' }, 'junk'])).toEqual([good])
    expect(sanitize({})).toEqual([])
  })
})
