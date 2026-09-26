// Flashcard practice: a shuffled queue where "again" cards come back a few cards later.

export const AGAIN_GAP = 3

export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Removes the current card; if you didn't know it, it returns AGAIN_GAP cards later (or last). */
export function answer<T>(queue: T[], knew: boolean): T[] {
  const [head, ...rest] = queue
  if (head === undefined || knew) return rest
  const at = Math.min(AGAIN_GAP, rest.length)
  return [...rest.slice(0, at), head, ...rest.slice(at)]
}
