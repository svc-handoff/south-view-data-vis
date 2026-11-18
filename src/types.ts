export interface Demographics {
  gender: string
  race: string
  occupation: string
}

export interface Relation {
  target: string
  type: 'spouse' | 'parent' | 'child' | 'sibling' | 'friend' | 'colleague'
}

export interface EventLink {
  event_id: string
  role: string
}

export interface Individual {
  id: string
  name: string
  birth: number
  death: number
  burial_year: number
  section: string
  plot: string
  bio: string
  notable: boolean
  demographics: Demographics
  relations: Relation[]
  events: EventLink[]
}

/** A person featured on the Foundation's "History in the Neighborhood" page */
export interface NotableFigure {
  id: string
  name: string
  role: string
  /** ISO date, possibly partial: "YYYY", "YYYY-MM" or "YYYY-MM-DD" (partial when sources disagree or lack detail) */
  birth: string
  death: string
  /** Interment at South-View, same format; the funeral date where no separate interment date is recorded */
  burial: string
  /** true when no burial or funeral date was found and `burial` is the year of death */
  burial_estimated: boolean
  note?: string
  bio_url: string
  sources: string[]
}

export interface CemeteryEvent {
  id: string
  name: string
  year_range: [number, number]
  description: string
  type: string
}

export interface SnapshotDemographics {
  gender: { Male: number; Female: number }
  avg_age_at_death: number
  cemetery_acreage: number
  historical_context: string
}

export interface MapSnapshot {
  year: number
  known_memorials: { count: number; scope: string }
  total_burials: number
  notable_figures: string[]
  demographics: SnapshotDemographics
  /** Developed extent of the cemetery at this date, as [lat, lng] vertices (ring not closed) */
  footprint: [number, number][]
}

export type SupporterCategory =
  | 'Government'
  | 'Nonprofit'
  | 'Foundation'
  | 'Corporate'
  | 'Faith community'
  | 'Individual'

export interface Contribution {
  /** null when the form's year was blank or unreadable */
  year: number | null
  /** USD; null when no dollar figure could be read */
  amount: number | null
  /** true when the amount was left blank on purpose (in-kind support) */
  inKind: boolean
  purpose: string
}

export interface Source {
  label: string
  url: string
}

export interface Supporter {
  id: string
  name: string
  /** null when the form's category was blank or not one we recognise */
  category: SupporterCategory | null
  /** null when the form's type was blank or not recognised */
  relationship: 'donor' | 'sponsor' | null
  description: string
  /** Donation year of the supporter's earliest submission */
  supportingSince: number | null
  contributions: Contribution[]
  /** true only when the support is confirmed by a public source listed in `sources` */
  verified: boolean
  sources?: Source[]
}
