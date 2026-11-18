import type { Contribution, Supporter, SupporterCategory } from '@/types'

export const CEMETERY_ID = 'south-view'

// Full class strings so Tailwind can see them. Colors come from the theme's chart tokens.
export const CATEGORY_STYLES: Record<SupporterCategory, { fill: string; bg: string }> = {
  Government: { fill: 'fill-chart-1', bg: 'bg-chart-1' },
  Nonprofit: { fill: 'fill-chart-4', bg: 'bg-chart-4' },
  Foundation: { fill: 'fill-chart-6', bg: 'bg-chart-6' },
  Corporate: { fill: 'fill-chart-2', bg: 'bg-chart-2' },
  'Faith community': { fill: 'fill-chart-5', bg: 'bg-chart-5' },
  Individual: { fill: 'fill-chart-3', bg: 'bg-chart-3' },
}

export const CATEGORIES = Object.keys(CATEGORY_STYLES) as SupporterCategory[]

/** Shown for supporters whose category was blank or unrecognised on the form */
export const UNCATEGORIZED = 'Uncategorized'
// Mid grey in both themes, so it doesn't read as the (near-black) cemetery hub
const UNCATEGORIZED_STYLE = { fill: 'fill-ring', bg: 'bg-ring' }

export function categoryStyle(category: SupporterCategory | null) {
  return (category && CATEGORY_STYLES[category]) || UNCATEGORIZED_STYLE
}

/** Sort position for a category, unknown ones last */
export function categoryOrder(category: SupporterCategory | null) {
  const i = category ? CATEGORIES.indexOf(category) : -1
  return i === -1 ? CATEGORIES.length : i
}

export function relationshipLabel(s: Supporter) {
  return s.relationship === 'sponsor' ? 'Sponsor' : s.relationship === 'donor' ? 'Donor' : null
}

export function totalGiving(s: Supporter) {
  return s.contributions.reduce((sum, c) => sum + (c.amount ?? 0), 0)
}

export function givingYears(s: Supporter) {
  const years = s.contributions.map((c) => c.year).filter((y): y is number => y !== null)
  if (years.length === 0) return ''
  const first = Math.min(...years)
  const last = Math.max(...years)
  return first === last ? String(first) : `${first}–${last}`
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function formatUSD(amount: number | null) {
  return amount === null ? 'In-kind' : usd.format(amount)
}

/** One contribution's amount: dollars, "In-kind" if left blank, or a dash if unreadable */
export function formatContribution(c: Contribution) {
  if (c.amount !== null) return usd.format(c.amount)
  return c.inKind ? 'In-kind' : '—'
}

/** A supporter's total; "In-kind" when every amount was left blank, a dash when none could be read */
export function formatTotal(s: Supporter) {
  if (s.contributions.some((c) => c.amount !== null)) return usd.format(totalGiving(s))
  return s.contributions.length > 0 && s.contributions.every((c) => c.inKind) ? 'In-kind' : '—'
}
