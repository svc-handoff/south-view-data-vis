import { ExternalLinkIcon } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import BottomSheet, { type SheetSnap } from '@/components/BottomSheet'
import PeriodHistory from '@/components/PeriodHistory'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { mapSnapshots, notableFigures } from '@/data'
import memorials from '@/data/memorials.json'
import { useIsMobile } from '@/hooks/useIsMobile'
import { formatPartialDate } from '@/lib/format'
import type { MapSnapshot } from '@/types'

const memorialCounts = memorials.counts as Record<string, { count: number; scope: string }>
const LAST_SNAPSHOT = mapSnapshots[mapSnapshots.length - 1]

function Stat({ label, value, suffix }: { label: string; value: string | number; suffix?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold tabular-nums tracking-tight">
        {value}
        {suffix && <span className="ml-1 text-sm font-normal text-muted-foreground">{suffix}</span>}
      </p>
    </div>
  )
}

export default function MapSidebar({
  snapshot,
  label,
  pinned,
}: {
  snapshot: MapSnapshot
  label: string
  /** Stays in view above the details on mobile */
  pinned?: ReactNode
}) {
  const [snap, setSnap] = useState<SheetSnap>('peek')
  const isMobile = useIsMobile()

  // Figures interred by this date; the last snapshot runs to the present, so it shows everyone
  const notables = useMemo(
    () =>
      snapshot === LAST_SNAPSHOT
        ? notableFigures
        : notableFigures.filter((f) => Number(f.burial.slice(0, 4)) <= snapshot.year),
    [snapshot],
  )

  const { cemetery_acreage, historical_context } = snapshot.demographics
  const memorial = memorialCounts[String(snapshot.year)]

  const details = (
    <div key={snapshot.year} className="animate-in fade-in-0 slide-in-from-right-2 space-y-4 p-4 duration-300 max-lg:mx-auto max-lg:max-w-2xl">
      {/* On mobile the pinned timeline already shows the year */}
      <div className="px-1 pt-1 max-lg:hidden">

          <h2 className="text-3xl font-bold tabular-nums tracking-tight">{label}</h2>
          <p className="text-sm text-muted-foreground">Cemetery snapshot</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Historical context</CardTitle>
          </CardHeader>
          <CardContent>
            <PeriodHistory year={snapshot.year} landNote={historical_context} />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stat label="Cemetery size" value={cemetery_acreage} suffix="acres" />
          </CardContent>
        </Card>

        {memorial && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Burial records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Stat
                label={`Memorials on Find a Grave, ${memorial.scope}`}
                value={memorial.count.toLocaleString()}
              />
              <p className="text-xs text-muted-foreground">
                Source:{' '}
                <a
                  href={memorials.source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4"
                >
                  {memorials.source.label}
                </a>
                , accessed {memorials.source.accessed}. Counts online memorials, not official burial totals,
                and may include duplicates or omit records.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Notable figures</CardTitle>
            <CardDescription>Buried here by this date. Select a name to read their story.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-0.5 px-4">
            {notables.map((figure) => (
              <a
                key={figure.id}
                href={figure.bio_url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-2 rounded-md px-2 py-2 transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium group-hover:underline group-hover:underline-offset-4">
                    {figure.name}
                  </span>
                  <span className="block text-xs tabular-nums text-muted-foreground">
                    {formatPartialDate(figure.birth)} – {formatPartialDate(figure.death)}
                  </span>
                  {figure.note && (
                    <span className="block text-xs italic text-muted-foreground">{figure.note}</span>
                  )}
                </span>
                <ExternalLinkIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
              </a>
            ))}
            {notables.length === 0 && (
              <Badge variant="secondary" className="w-fit">None yet in this period</Badge>
            )}
          </CardContent>
        </Card>
    </div>
  )

  if (isMobile) {
    return (
      <BottomSheet label="Cemetery snapshot" pinned={pinned} snap={snap} onSnapChange={setSnap}>
        {details}
      </BottomSheet>
    )
  }

  return (
    <aside className="flex w-96 shrink-0 flex-col border-l bg-background">
      <ScrollArea className="min-h-0 flex-1">{details}</ScrollArea>
    </aside>
  )
}
