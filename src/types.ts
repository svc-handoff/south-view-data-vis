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
  /** null when no source gives a birth year */
  birth: number | null
  death: number
  burial_year: number
  /** Only set when a source gives the burial location */
  section?: string
  plot?: string
  bio: string
  notable: boolean
  demographics: Demographics
  relations: Relation[]
  events: EventLink[]
  /** At least three credible sources for the bio (Henderson first) */
  sources: Source[]
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
  year: number
  /** USD; null for in-kind or unreported support */
  amount: number | null
  purpose: string
}

export interface Source {
  label: string
  url: string
}

export interface Supporter {
  id: string
  name: string
  category: SupporterCategory
  relationship: 'donor' | 'sponsor'
  description: string
  contributions: Contribution[]
  /** true only when the support is confirmed by a public source listed in `sources` */
  verified: boolean
  sources?: Source[]
}
