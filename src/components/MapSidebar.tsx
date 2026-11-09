import { UserIcon } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import BottomSheet, { type SheetSnap } from '@/components/BottomSheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { individuals } from '@/data'
import memorials from '@/data/memorials.json'
import { useIsMobile } from '@/hooks/useIsMobile'
import type { Individual, MapSnapshot } from '@/types'

// Flip to true once individuals.json contains real, sourced people
const SHOW_NOTABLE_FIGURES = false

const memorialCounts = memorials.counts as Record<string, { count: number; scope: string }>

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

function FigureDialog({ person, onClose }: { person: Individual | null; onClose: () => void }) {
  return (
    <Dialog open={person !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-lg:max-h-[85dvh] max-lg:overflow-y-auto">
        {person && (
          <>
            <DialogHeader>
              <DialogTitle>{person.name}</DialogTitle>
              <DialogDescription>
                {person.birth}–{person.death} · {person.demographics.occupation}
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm leading-relaxed text-muted-foreground">{person.bio}</p>
            <p className="text-xs text-muted-foreground">
              Section {person.section}, Plot {person.plot}
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
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
  const [selected, setSelected] = useState<Individual | null>(null)
  const [snap, setSnap] = useState<SheetSnap>('peek')
  const isMobile = useIsMobile()

  const notables = useMemo(
    () =>
      snapshot.notable_figures
        .map((id) => individuals.find((p) => p.id === id))
        .filter((p): p is Individual => p !== undefined && p.death <= snapshot.year),
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
            <p className="text-sm leading-relaxed text-muted-foreground">{historical_context}</p>
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

        {SHOW_NOTABLE_FIGURES ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Notable figures</CardTitle>
              <CardDescription>Select a name to read their story.</CardDescription>
            </CardHeader>
            <CardContent className="gap-1">
              {notables.map((person) => (
                <Button
                  key={person.id}
                  variant="ghost"
                  className="h-auto w-full justify-start gap-3 px-2 py-2 text-left"
                  onClick={() => setSelected(person)}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <UserIcon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{person.name}</span>
                    <span className="block truncate text-xs font-normal text-muted-foreground">
                      {person.birth}–{person.death} · {person.demographics.occupation}
                    </span>
                  </span>
                </Button>
              ))}
              {notables.length === 0 && (
                <Badge variant="secondary" className="w-fit">None yet in this period</Badge>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Notable figures</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Biographies are being compiled with the Foundation and will appear here once they are
                verified.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  )
  const dialog = <FigureDialog person={selected} onClose={() => setSelected(null)} />

  if (isMobile) {
    return (
      <>
        <BottomSheet label="Cemetery snapshot" pinned={pinned} snap={snap} onSnapChange={setSnap}>
          {details}
        </BottomSheet>
        {dialog}
      </>
    )
  }

  return (
    <aside className="flex w-96 shrink-0 flex-col border-l bg-background">
      <ScrollArea className="min-h-0 flex-1">{details}</ScrollArea>
      {dialog}
    </aside>
  )
}
