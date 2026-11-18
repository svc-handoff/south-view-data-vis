import type { MapSnapshot } from '@/types'

export function snapshotLabel(snapshot: MapSnapshot, isLast: boolean) {
  return isLast ? `${snapshot.year}–Present` : String(snapshot.year)
}

