import { useSyncExternalStore } from 'react'
import { SHEET_CSV_URLS, supportersFromCsv } from '@/lib/supporterSheet'
import type { Supporter } from '@/types'

/**
 * Live supporters from the Google Form responses sheet. Polls while something is subscribed and
 * refetches when the tab regains focus. A failed fetch or parse keeps the last good data.
 */

const POLL_MS = 60_000
const TIMEOUT_MS = 15_000
const CACHE_KEY = 'south-view:supporters:v1'

export interface SupportersState {
  supporters: Supporter[]
  /** loading: nothing to show yet · ready: data is current · error: last refresh failed */
  status: 'loading' | 'ready' | 'error'
}

const isNumOrNull = (v: unknown) => v === null || (typeof v === 'number' && Number.isFinite(v))

function looksLikeSupporter(s: unknown): boolean {
  if (!s || typeof s !== 'object') return false
  const o = s as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    typeof o.description === 'string' &&
    isNumOrNull(o.supportingSince) &&
    Array.isArray(o.contributions) &&
    o.contributions.every((c: unknown) => {
      const r = c as Record<string, unknown> | null
      return !!r && isNumOrNull(r.year) && isNumOrNull(r.amount) && typeof r.purpose === 'string'
    })
  )
}

function readCache(): Supporter[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) && parsed.every(looksLikeSupporter) ? (parsed as Supporter[]) : null
  } catch {
    return null
  }
}

function writeCache(supporters: Supporter[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(supporters))
  } catch {
    // Storage full or blocked; the live data still works
  }
}

const cached = readCache()
let state: SupportersState = { supporters: cached ?? [], status: 'loading' }
let lastJson = cached ? JSON.stringify(cached) : ''
const listeners = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | null = null
let inFlight = false

function setState(next: SupportersState) {
  if (next.status === state.status && next.supporters === state.supporters) return
  state = next
  for (const l of listeners) {
    try {
      l()
    } catch {
      // A listener's problem shouldn't stop the others
    }
  }
}

async function fetchCsv(url: string): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    // A sign-in or error page instead of CSV (e.g. the sheet stopped being public)
    if (/^\s*</.test(text)) throw new Error('Not CSV')
    return text
  } finally {
    clearTimeout(timeout)
  }
}

async function refresh() {
  if (inFlight) return
  inFlight = true
  try {
    let supporters: Supporter[] | null = null
    for (const url of SHEET_CSV_URLS) {
      try {
        supporters = supportersFromCsv(await fetchCsv(url))
        break
      } catch {
        // Try the next source
      }
    }
    if (!supporters) {
      setState({ supporters: state.supporters, status: 'error' })
      return
    }
    // Keep the same array when nothing changed, so the graph doesn't rebuild its layout
    const json = JSON.stringify(supporters)
    if (json !== lastJson) {
      lastJson = json
      writeCache(supporters)
      setState({ supporters, status: 'ready' })
    } else setState({ supporters: state.supporters, status: 'ready' })
  } catch {
    setState({ supporters: state.supporters, status: 'error' })
  } finally {
    inFlight = false
  }
}

function onVisible() {
  if (document.visibilityState === 'visible') void refresh()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) {
    void refresh()
    timer = setInterval(() => {
      if (document.visibilityState !== 'hidden') void refresh()
    }, POLL_MS)
    document.addEventListener('visibilitychange', onVisible)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      if (timer) clearInterval(timer)
      timer = null
      document.removeEventListener('visibilitychange', onVisible)
    }
  }
}

const getSnapshot = () => state

export function useSupporters(): SupportersState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
