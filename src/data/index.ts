import type { CemeteryEvent, Individual, MapSnapshot, NotableFigure } from '../types'
import eventsData from './events.json'
import individualsData from './individuals.json'
import mapSnapshotsData from './map_snapshots.json'
import notableFiguresData from './notable_figures.json'

export const individuals: Individual[] = individualsData as Individual[]
export const events: CemeteryEvent[] = eventsData as CemeteryEvent[]
export const mapSnapshots: MapSnapshot[] = mapSnapshotsData as MapSnapshot[]

/** Sorted by burial date */
export const notableFigures: NotableFigure[] = (notableFiguresData as NotableFigure[])
  .slice()
  .sort((a, b) => a.burial.localeCompare(b.burial))
