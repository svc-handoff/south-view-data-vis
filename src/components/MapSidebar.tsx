import { ExternalLinkIcon, UserIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { individuals } from '@/data'
import type { Individual, MapSnapshot } from '@/types'

function lifespan(person: Individual) {
  return person.birth === null ? `d. ${person.death}` : `${person.birth}–${person.death}`
}

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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        {person && (
          <>
            <DialogHeader>
              <DialogTitle>{person.name}</DialogTitle>
              <DialogDescription>
                {lifespan(person)} · {person.demographics.occupation}
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm leading-relaxed text-muted-foreground">{person.bio}</p>
            {person.section && person.plot && (
              <p className="text-xs text-muted-foreground">
                Section {person.section}, Plot {person.plot}
              </p>
            )}
            {person.sources.length > 0 && (
              <div>
                <h4 className="mb-1 text-xs font-medium text-muted-foreground">Sources</h4>
                <ul className="space-y-1">
                  {person.sources.map((src) => (
                    <li key={src.label}>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline text-xs underline-offset-4 hover:underline"
                      >
                        {src.label}
                        <ExternalLinkIcon className="ml-1 inline size-3 text-muted-foreground" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function MapSidebar({
  snapshot,
  label,
  present,
}: {
  snapshot: MapSnapshot
  label: string
  /** The last snapshot stands for today, so it lists everyone buried since */
  present: boolean
}) {
  const [selected, setSelected] = useState<Individual | null>(null)

  // Only show notables who are already buried by this snapshot year
  const notables = useMemo(
    () =>
      snapshot.notable_figures
        .map((id) => individuals.find((p) => p.id === id))
        .filter((p): p is Individual => p !== undefined && (present || p.burial_year <= snapshot.year)),
    [snapshot, present],
  )

  const { gender, avg_age_at_death, cemetery_acreage, historical_context } = snapshot.demographics
  const total = gender.Male + gender.Female
  const malePct = Math.round((gender.Male / total) * 100)

  return (
    <aside className="flex w-96 shrink-0 flex-col border-l bg-background">
      <ScrollArea className="min-h-0 flex-1">
        <div
          key={snapshot.year}
          className="animate-in fade-in-0 slide-in-from-right-2 space-y-4 p-4 duration-300"
        >
          <div className="px-1 pt-1">
            <h2 className="text-3xl font-semibold tabular-nums tracking-tight">{label}</h2>
            <p className="text-sm text-muted-foreground">Cemetery snapshot</p>
          </div>

          <Card>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-5">
              <div className="col-span-2">
                <Stat label="Total burials" value={snapshot.total_burials.toLocaleString()} />
              </div>
              <Stat label="Avg. age at death" value={avg_age_at_death} suffix="yrs" />
              <Stat label="Cemetery size" value={cemetery_acreage} suffix="acres" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Gender</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="flex h-2.5 overflow-hidden rounded-full bg-muted"
                role="img"
                aria-label={`${malePct}% male, ${100 - malePct}% female`}
              >
                <div className="bg-chart-1 transition-all duration-500" style={{ width: `${malePct}%` }} />
                <div className="flex-1 bg-chart-3 transition-all duration-500" />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-chart-1" />
                  Male {malePct}%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-chart-3" />
                  Female {100 - malePct}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Historical context</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{historical_context}</p>
            </CardContent>
          </Card>

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
                      {lifespan(person)} · {person.demographics.occupation}
                    </span>
                  </span>
                </Button>
              ))}
              {notables.length === 0 && (
                <Badge variant="secondary" className="w-fit">None yet in this period</Badge>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
      <FigureDialog person={selected} onClose={() => setSelected(null)} />
    </aside>
  )
}
