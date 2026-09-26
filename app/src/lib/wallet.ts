// Trip wallet: what you spent, in yen, kept on this phone. Totals in ₪ use the current rate at display time.

export const CATEGORIES = ['food', 'shopping', 'transport', 'sights', 'stay', 'other'] as const
export type Category = (typeof CATEGORIES)[number]
export type Method = 'cash' | 'card'

export const CATEGORY_ICON: Record<Category, string> = {
  food: '🍜',
  shopping: '🛍️',
  transport: '🚆',
  sights: '🎟️',
  stay: '🏨',
  other: '✨',
}

export interface Expense {
  id: string
  yen: number
  cat: Category
  method: Method
  note?: string
  /** ISO timestamp of when it was logged. */
  at: string
}

export const WALLET_KEY = 'jc.wallet'

export function newExpense(yen: number, cat: Category, method: Method, note = '', now = new Date()): Expense {
  const trimmed = note.trim()
  return {
    id: `${now.getTime().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    yen: Math.round(yen),
    cat,
    method,
    ...(trimmed ? { note: trimmed } : {}),
    at: now.toISOString(),
  }
}

/** Local calendar day (YYYY-MM-DD) of an expense, so a late dinner counts on the day you ate it. */
export function dayOf(e: Pick<Expense, 'at'>): string {
  const d = new Date(e.at)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export interface Totals {
  total: number
  cash: number
  card: number
  byCat: { cat: Category; yen: number }[]
  byDay: { day: string; yen: number; items: Expense[] }[]
}

export function totals(list: Expense[]): Totals {
  const byCat = new Map<Category, number>()
  const byDay = new Map<string, Expense[]>()
  let total = 0
  let cash = 0
  for (const e of list) {
    total += e.yen
    if (e.method === 'cash') cash += e.yen
    byCat.set(e.cat, (byCat.get(e.cat) ?? 0) + e.yen)
    const day = dayOf(e)
    byDay.set(day, [...(byDay.get(day) ?? []), e])
  }
  return {
    total,
    cash,
    card: total - cash,
    byCat: CATEGORIES.filter((c) => byCat.has(c))
      .map((cat) => ({ cat, yen: byCat.get(cat)! }))
      .sort((a, b) => b.yen - a.yen),
    byDay: [...byDay.entries()]
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([day, items]) => ({
        day,
        yen: items.reduce((s, e) => s + e.yen, 0),
        items: [...items].sort((a, b) => (a.at < b.at ? 1 : -1)),
      })),
  }
}

/** Keeps only well-formed entries, so a damaged save can't break the Money tab. */
export function sanitize(raw: unknown): Expense[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (e): e is Expense =>
      !!e &&
      typeof e === 'object' &&
      typeof e.id === 'string' &&
      Number.isFinite(e.yen) &&
      e.yen > 0 &&
      (CATEGORIES as readonly string[]).includes(e.cat) &&
      (e.method === 'cash' || e.method === 'card') &&
      typeof e.at === 'string' &&
      !Number.isNaN(Date.parse(e.at)),
  )
}
