import { BadgeCheckIcon, ExternalLinkIcon, XIcon } from 'lucide-react'
import { useMemo, useState, type RefObject } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { supporters } from '@/data'
import { CATEGORIES, CATEGORY_STYLES, formatUSD, givingYears, totalGiving } from '@/lib/supporters'
import { cn } from '@/lib/utils'
import type { Supporter } from '@/types'

const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)

const byTotal = [...supporters].sort((a, b) => totalGiving(b) - totalGiving(a))

function Search({
  inputRef,
  onSelect,
}: {
  inputRef: RefObject<HTMLInputElement | null>
  onSelect: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const open = focused && query.trim().length > 0

  const pick = (id: string) => {
    onSelect(id)
    setQuery('')
    inputRef.current?.blur()
  }

  return (
    <div className="relative">
      <Command className="overflow-visible bg-transparent p-0">
        <CommandInput
          ref={inputRef}
          value={query}
          onValueChange={setQuery}
          onFocus={() => setFocused(true)}
          // Let item clicks land before the list unmounts
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          placeholder="Search sponsors and donors…"
        />
        {open && (
          <CommandList className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 rounded-lg border bg-popover shadow-md">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Supporters">
              {supporters.map((s) => (
                <CommandItem key={s.id} value={`${s.name} ${s.category} ${s.relationship}`} onSelect={() => pick(s.id)}>
                  <span className={cn('size-2 shrink-0 rounded-full', CATEGORY_STYLES[s.category].bg)} />
                  <span className="truncate">{s.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{s.category}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        )}
      </Command>
      <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border bg-muted px-1.5 font-sans text-[10px] text-muted-foreground sm:block">
        {isMac ? '⌘K' : 'Ctrl K'}
      </kbd>
    </div>
  )
}

function SourceBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <Badge className="w-fit">
      <BadgeCheckIcon />
      Verified
    </Badge>
  ) : (
    <Badge variant="outline" className="w-fit text-muted-foreground">
      Sample data
    </Badge>
  )
}

function SupporterDetail({ supporter, onClose }: { supporter: Supporter; onClose: () => void }) {
  const total = totalGiving(supporter)
  const contributions = [...supporter.contributions].sort((a, b) => b.year - a.year)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{supporter.name}</CardTitle>
        <CardDescription className="flex items-center gap-1.5">
          <span className={cn('size-2 rounded-full', CATEGORY_STYLES[supporter.category].bg)} />
          {supporter.category} · {supporter.relationship === 'sponsor' ? 'Sponsor' : 'Donor'}
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close details">
            <XIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <SourceBadge verified={supporter.verified} />
        <p className="text-sm leading-relaxed text-muted-foreground">{supporter.description}</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total given</p>
            <p className="text-xl font-semibold tabular-nums tracking-tight">
              {total > 0 ? formatUSD(total) : 'In-kind'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Supporting since</p>
            <p className="text-xl font-semibold tabular-nums tracking-tight">
              {Math.min(...supporter.contributions.map((c) => c.year))}
            </p>
          </div>
        </div>

        <Separator />
        <div>
          <h4 className="mb-2 text-sm font-bold text-foreground">Contributions</h4>
          <ul className="space-y-3">
            {contributions.map((c, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="w-10 shrink-0 tabular-nums text-muted-foreground">{c.year}</span>
                <span className="min-w-0 flex-1">{c.purpose}</span>
                <span className="shrink-0 font-medium tabular-nums">{formatUSD(c.amount)}</span>
              </li>
            ))}
          </ul>
        </div>

        {supporter.sources && supporter.sources.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="mb-1 text-sm font-bold text-foreground">Sources</h4>
              <ul>
                {supporter.sources.map((src) => (
                  <li key={src.url}>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
                    >
                      {src.label}
                      <ExternalLinkIcon className="size-3.5 text-muted-foreground" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function CemeteryOverview({ onSelect }: { onSelect: (id: string) => void }) {
  const total = supporters.reduce((sum, s) => sum + totalGiving(s), 0)
  const verified = supporters.filter((s) => s.verified).length
  const counts = CATEGORIES.map((c) => ({ category: c, count: supporters.filter((s) => s.category === c).length }))

  return (
    <div className="space-y-4">
      <div className="px-1 pt-1">
        <h2 className="text-2xl font-semibold tracking-tight">South-View Cemetery</h2>
        <p className="text-sm text-muted-foreground">Sponsors and donors</p>
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-x-4 gap-y-5">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Supporters</p>
            <p className="text-xl font-semibold tabular-nums tracking-tight">{supporters.length}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Recorded giving</p>
            <p className="text-xl font-semibold tabular-nums tracking-tight">{formatUSD(total)}</p>
          </div>
          <p className="col-span-2 text-xs text-muted-foreground">
            {verified} verified from public sources; the rest are sample data for the demo.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">By type</CardTitle>
        </CardHeader>
        <CardContent className="gap-2">
          {counts.map(({ category, count }) => (
            <div key={category} className="flex items-center gap-2 text-sm">
              <span className={cn('size-2.5 rounded-full', CATEGORY_STYLES[category].bg)} />
              <span>{category}</span>
              <span className="ml-auto tabular-nums text-muted-foreground">{count}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All supporters</CardTitle>
          <CardDescription>Sorted by total given.</CardDescription>
        </CardHeader>
        <CardContent className="gap-0">
          {byTotal.map((s) => (
            <Button
              key={s.id}
              variant="ghost"
              className="h-auto w-full justify-start gap-2 px-2 py-1.5"
              onClick={() => onSelect(s.id)}
            >
              <span className={cn('size-2 shrink-0 rounded-full', CATEGORY_STYLES[s.category].bg)} />
              <span className="truncate text-sm font-medium">{s.name}</span>
              {s.verified && <BadgeCheckIcon className="size-3.5 shrink-0" aria-label="Verified" />}
              <span className="ml-auto shrink-0 pl-2 text-xs font-normal tabular-nums text-muted-foreground">
                {totalGiving(s) > 0 ? formatUSD(totalGiving(s)) : 'In-kind'} · {givingYears(s)}
              </span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default function NetworkPanel({
  selectedId,
  searchRef,
  onSelect,
  onClose,
}: {
  selectedId: string | null
  searchRef: RefObject<HTMLInputElement | null>
  onSelect: (id: string) => void
  onClose: () => void
}) {
  const supporter = useMemo(() => supporters.find((s) => s.id === selectedId) ?? null, [selectedId])

  return (
    <aside className="flex w-96 shrink-0 flex-col border-l bg-background">
      <div className="border-b p-4">
        <Search inputRef={searchRef} onSelect={onSelect} />
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div key={supporter?.id ?? 'overview'} className="animate-in fade-in-0 slide-in-from-right-2 p-4 duration-200">
          {supporter ? (
            <SupporterDetail supporter={supporter} onClose={onClose} />
          ) : (
            <CemeteryOverview onSelect={onSelect} />
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
