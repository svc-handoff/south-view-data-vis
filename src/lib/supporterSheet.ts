import type { Contribution, Supporter, SupporterCategory } from '@/types'

/**
 * Supporters come from the Google Form responses sheet. Anyone can type anything into a form,
 * so every reader here returns null/blank for a value it can't make sense of instead of throwing.
 */

const SHEET_ID = '1oXBhhiR3Xd5nyfTZGSRRu-n3zuQfZpoJCu4ReQtxz0k'
/** Raw cell text. gviz guesses a type per column and blanks cells that don't fit, so it's only a fallback. */
export const SHEET_CSV_URLS = [
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`,
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`,
]

const CATEGORY_NAMES: SupporterCategory[] = [
  'Government',
  'Nonprofit',
  'Foundation',
  'Corporate',
  'Faith community',
  'Individual',
]

type Field =
  | 'timestamp'
  | 'name'
  | 'category'
  | 'type'
  | 'description'
  | 'year'
  | 'purpose'
  | 'amount'

/** Header text (lowercased, letters only) for each field, and its column in the form as built */
const FIELDS: { field: Field; header: (h: string) => boolean; fallback: number }[] = [
  { field: 'timestamp', header: (h) => h.includes('timestamp'), fallback: 0 },
  { field: 'name', header: (h) => h.includes('donor') && h.includes('name'), fallback: 1 },
  { field: 'category', header: (h) => h.includes('category'), fallback: 2 },
  { field: 'type', header: (h) => h === 'type' || h.startsWith('type'), fallback: 3 },
  { field: 'description', header: (h) => h.includes('donor') && h.includes('description'), fallback: 4 },
  { field: 'year', header: (h) => h.includes('year'), fallback: 5 },
  { field: 'purpose', header: (h) => h.includes('donation') && h.includes('description'), fallback: 6 },
  { field: 'amount', header: (h) => h.includes('amount'), fallback: 7 },
]

/** RFC 4180 CSV: quoted fields, doubled quotes, newlines inside quotes, CRLF or LF. Never throws. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  const src = typeof text === 'string' ? text.replace(/^﻿/, '') : ''

  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"'
          i++
        } else quoted = false
      } else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += ch
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

function clean(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

const letters = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, ' ').trim()

/** Name as a lookup key, so "  jason  BRYANT " and "Jason Bryant" are the same donor */
export function donorKey(name: string): string {
  return clean(name).toLowerCase()
}

export function readCategory(value: string): SupporterCategory | null {
  const v = letters(value)
  if (!v) return null
  for (const c of CATEGORY_NAMES) if (v === letters(c)) return c
  // "Government agency", "Non-profit", "Faith-based", "Corporation", "Individual donor"…
  const squashed = v.replace(/ /g, '')
  if (squashed.includes('nonprofit') || squashed.includes('notforprofit')) return 'Nonprofit'
  if (squashed.includes('govern')) return 'Government'
  if (squashed.includes('foundation')) return 'Foundation'
  if (squashed.includes('corporat') || squashed.includes('business') || squashed.includes('company')) return 'Corporate'
  if (squashed.includes('faith') || squashed.includes('church') || squashed.includes('religio')) return 'Faith community'
  if (squashed.includes('individual') || squashed.includes('person')) return 'Individual'
  return null
}

export function readRelationship(value: string): Supporter['relationship'] {
  const v = letters(value)
  if (v.includes('sponsor')) return 'sponsor'
  if (v.includes('donor') || v.includes('donat')) return 'donor'
  return null
}

/** First plausible four-digit year in the text ("2025", "Spring 2025", "FY2025") */
export function readYear(value: string): number | null {
  const match = clean(value).match(/(?:^|\D)(1[89]\d\d|2\d\d\d)(?!\d)/)
  return match ? Number(match[1]) : null
}

/**
 * Dollar figure from free text: "$1,000", "1000.00", "USD 250", "$1,000 (check)".
 * Takes the first number and ignores everything else. Blank → in-kind; unreadable → null amount.
 */
export function readAmount(value: string): Pick<Contribution, 'amount' | 'inKind'> {
  const v = clean(value)
  if (!v) return { amount: null, inKind: true }
  const match = v.match(/\d[\d,]*(?:\.\d+)?|\.\d+/)
  if (!match) return { amount: null, inKind: false }
  const amount = Number(match[0].replace(/,/g, ''))
  return { amount: Number.isFinite(amount) ? amount : null, inKind: false }
}

/** Form timestamps look like "11/17/2026 23:26:31"; anything else falls back to Date.parse */
export function readTimestamp(value: string): number | null {
  const v = clean(value)
  if (!v) return null
  const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/)
  if (m) {
    const t = new Date(+m[3], +m[1] - 1, +m[2], +(m[4] ?? 0), +(m[5] ?? 0), +(m[6] ?? 0)).getTime()
    return Number.isFinite(t) ? t : null
  }
  const t = Date.parse(v)
  return Number.isFinite(t) ? t : null
}

function slug(name: string) {
  return (
    name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'supporter'
  )
}

interface Row {
  index: number
  time: number | null
  cells: Record<Field, string>
}

function columnMap(header: string[]): Record<Field, number> {
  const normalized = header.map((h) => letters(clean(h)))
  const taken = new Set<number>()
  const map = {} as Record<Field, number>
  // Most specific headers first, so "Donation Description" isn't claimed by the donor description
  const order: Field[] = ['timestamp', 'name', 'description', 'purpose', 'amount', 'year', 'category', 'type']
  for (const field of order) {
    const spec = FIELDS.find((f) => f.field === field)!
    const found = normalized.findIndex((h, i) => !taken.has(i) && spec.header(h))
    map[field] = found >= 0 ? found : spec.fallback
    if (found >= 0) taken.add(found)
  }
  return map
}

/**
 * Turns the sheet's CSV into supporters, one per donor name:
 * - name, category, type and description come from that donor's most recent submission
 * - "supporting since" is the donation year on their earliest submission
 * - every submission becomes a contribution
 */
export function supportersFromCsv(text: string): Supporter[] {
  const table = parseCsv(text)
  if (table.length < 2) return []
  const cols = columnMap(table[0] ?? [])

  const byDonor = new Map<string, Row[]>()
  table.slice(1).forEach((raw, index) => {
    const cells = {} as Record<Field, string>
    for (const { field } of FIELDS) cells[field] = clean(raw?.[cols[field]])
    const key = donorKey(cells.name)
    if (!key) return // no name, nothing to key it by
    const row: Row = { index, time: readTimestamp(cells.timestamp), cells }
    const rows = byDonor.get(key)
    if (rows) rows.push(row)
    else byDonor.set(key, [row])
  })

  const usedIds = new Set<string>()
  const supporters: Supporter[] = []
  for (const rows of byDonor.values()) {
    // Oldest first. Trust timestamps only when every row has one; otherwise sheet order.
    const timed = rows.every((r) => r.time !== null)
    rows.sort((a, b) => (timed ? a.time! - b.time! : 0) || a.index - b.index)
    const first = rows[0]
    const latest = rows[rows.length - 1]

    const name = latest.cells.name
    let id = `sup-${slug(name)}`
    for (let n = 2; usedIds.has(id); n++) id = `sup-${slug(name)}-${n}`
    usedIds.add(id)

    supporters.push({
      id,
      name,
      category: readCategory(latest.cells.category),
      relationship: readRelationship(latest.cells.type),
      description: latest.cells.description,
      supportingSince: readYear(first.cells.year),
      contributions: rows.map((r) => ({
        year: readYear(r.cells.year),
        ...readAmount(r.cells.amount),
        purpose: r.cells.purpose,
      })),
      verified: false,
    })
  }
  return supporters
}
