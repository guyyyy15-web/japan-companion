// Thin line icons (24×24, stroke = currentColor) for a calm, modern look instead of emoji.
const PATHS = {
  phrases: 'M4.5 5.5h15v10h-9l-4.5 3.5v-3.5h-1.5z M8 9.5h8 M8 12.5h5',
  builder: 'M4 4.5h7v7H4z M13 4.5h7v7h-7z M4 13.5h7v7H4z M16.5 13.5v7 M13 17h7',
  signs: 'M5 4.5h14v9.5H5z M12 14v6 M9 20h6 M8.5 8h7 M8.5 10.8h4.5',
  money: 'M6.5 4.5L12 11l5.5-6.5 M12 11v9 M8 12.5h8 M8 15.8h8',
  guide: 'M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 1 0 0-17z M15.3 8.7l-2 4.6-4.6 2 2-4.6z',
  speaker: 'M4.5 9.5h3.5l4.5-4v13l-4.5-4H4.5z M15.5 9.2a3.8 3.8 0 0 1 0 5.6 M18 6.8a7.3 7.3 0 0 1 0 10.4',
  card: 'M3.5 6h17v12h-17z M7 10h10 M7 13.5h6',
  nearby: 'M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z M12 7.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5z',
} as const

export type IconName = keyof typeof PATHS

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
