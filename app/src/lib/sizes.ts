// Clothing and shoe sizes for shopping in Japan.

/** Japanese shoes are labelled by foot length in cm. EU size ≈ 1.5 × (foot length + 1.5 cm); rounded to the half sizes shops use. */
export function euToJpShoe(eu: number): number {
  return Math.round((eu / 1.5 - 1.5) * 2) / 2
}

export const EU_SHOE_SIZES = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46]

/** Women's clothes: Japanese number sizes (号) next to letters and EU sizes. */
export const WOMEN_SIZES = [
  { jp: '5号', letter: 'XS', eu: '34' },
  { jp: '7号', letter: 'S', eu: '36' },
  { jp: '9号', letter: 'M', eu: '38' },
  { jp: '11号', letter: 'L', eu: '40' },
  { jp: '13号', letter: 'LL', eu: '42' },
  { jp: '15号', letter: '3L', eu: '44' },
]

/** Men's clothes run about one size smaller than in Israel, Europe or the US. */
export const MEN_SIZES = [
  { jp: 'M', yours: 'S' },
  { jp: 'L', yours: 'M' },
  { jp: 'LL / XL', yours: 'L' },
  { jp: '3L', yours: 'XL' },
]
