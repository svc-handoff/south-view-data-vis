import type { MapSnapshot } from '@/types'

export function snapshotLabel(snapshot: MapSnapshot, isLast: boolean) {
  return isLast ? `${snapshot.year}–Present` : String(snapshot.year)
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "1940-02-21" → "Feb 21, 1940"; "1931-10" → "Oct 1931"; "1826" → "1826" */
export function formatPartialDate(iso: string) {
  const [year, month, day] = iso.split('-')
  if (!month) return year
  const m = MONTHS[Number(month) - 1]
  return day ? `${m} ${Number(day)}, ${year}` : `${m} ${year}`
}
