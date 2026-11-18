import { BadgeCheckIcon, ExternalLinkIcon, XIcon } from 'lucide-react'
import { useMemo, useState, type RefObject } from 'react'
import BottomSheet, { type SheetSnap } from '@/components/BottomSheet'
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
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  CATEGORIES,
  categoryStyle,
  formatContribution,
  formatTotal,
  formatUSD,
  givingYears,
  relationshipLabel,
  totalGiving,
  UNCATEGORIZED,
} from '@/lib/supporters'
import { cn } from '@/lib/utils'
import type { SupportersState } from '@/hooks/useSupporters'
import type { Supporter } from '@/types'

const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)

function Search({
  supporters,
  inputRef,
  onSelect,
  onFocus,
}: {
  supporters: Supporter[]
  inputRef: RefObject<HTMLInputElement | null>
  onSelect: (id: string) => void
  onFocus?: () => void
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
    // 16px text stops iOS Safari from zooming the page when the field takes focus
    <div className="relative max-lg:**:data-[slot=command-input]:text-base max-lg:**:data-[slot=input-group]:h-11!">
      <Command className="overflow-visible bg-transparent p-0">
        <CommandInput
          ref={inputRef}
          value={query}
          onValueChange={setQuery}
          onFocus={() => {
            setFocused(true)
            onFocus?.()
          }}
          // Let item clicks land before the list unmounts
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          placeholder="Search sponsors and donors…"
        />
        {open && (
          <CommandList className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 rounded-lg border bg-popover shadow-md max-lg:max-h-[40dvh]">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Supporters">
              {supporters.map((s) => (
                <CommandItem
                  key={s.id}
                  value={`${s.name} ${s.category ?? ''} ${s.relationship ?? ''} ${s.id}`}
                  onSelect={() => pick(s.id)}
                >
                  <span className={cn('size-2 shrink-0 rounded-full', categoryStyle(s.category).bg)} />
                  <span className="truncate">{s.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{s.category}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        )}
      </Command>
      <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border bg-muted px-1.5 font-sans text-[10px] text-muted-foreground lg:block">
        {isMac ? '⌘K' : 'Ctrl K'}
      </kbd>
    </div>
  )
}

function VerifiedBadge() {
  return (
    <Badge className="w-fit">
      <BadgeCheckIcon />
      Verified
    </Badge>
  )
}

function SupporterDetail({ supporter, onClose }: { supporter: Supporter; onClose: () => void }) {
  // Newest first; undated contributions last
  const contributions = [...supporter.contributions].sort((a, b) => (b.year ?? -Infinity) - (a.year ?? -Infinity))
  const role = relationshipLabel(supporter)
  const meta = [supporter.category, role].filter(Boolean).join(' · ')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{supporter.name}</CardTitle>
        {meta && (
          <CardDescription className="flex items-center gap-1.5">
            <span className={cn('size-2 rounded-full', categoryStyle(supporter.category).bg)} />
            {meta}
          </CardDescription>
        )}
        <CardAction>
          <Button variant="ghost" size="icon-sm" className="max-lg:size-10" onClick={onClose} aria-label="Close details">
            <XIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {supporter.verified && <VerifiedBadge />}
        {supporter.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{supporter.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total given</p>
            <p className="text-xl font-semibold tabular-nums tracking-tight">
              {formatTotal(supporter)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Supporting since</p>
            <p className="text-xl font-semibold tabular-nums tracking-tight">
              {supporter.supportingSince ?? '—'}
            </p>
          </div>
        </div>

        <Separator />
        <div>
          <h4 className="mb-2 text-sm font-bold text-foreground">Contributions</h4>
          <ul className="space-y-3">
            {contributions.map((c, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="w-10 shrink-0 tabular-nums text-muted-foreground">{c.year ?? '—'}</span>
                <span className="min-w-0 flex-1 break-words">{c.purpose}</span>
                <span className="shrink-0 font-medium tabular-nums">{formatContribution(c)}</span>
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

function CemeteryOverview({ data, onSelect }: { data: SupportersState; onSelect: (id: string) => void }) {
  const { supporters, status } = data
  const total = supporters.reduce((sum, s) => sum + totalGiving(s), 0)
  const verified = supporters.filter((s) => s.verified).length
  const counts = [
    ...CATEGORIES.map((c) => ({
      label: c as string,
      bg: categoryStyle(c).bg,
      count: supporters.filter((s) => s.category === c).length,
    })),
    { label: UNCATEGORIZED, bg: categoryStyle(null).bg, count: supporters.filter((s) => !s.category).length },
  ].filter((c) => c.label !== UNCATEGORIZED || c.count > 0)
  const byTotal = [...supporters].sort((a, b) => totalGiving(b) - totalGiving(a))

  return (
    <div className="space-y-4">
      <div className="px-1 pt-1">
        <h2 className="text-2xl font-semibold tracking-tight">South-View Cemetery</h2>
        <p className="text-sm text-muted-foreground">Sponsors and donors</p>
      </div>

      {status === 'loading' && supporters.length === 0 && (
        <p className="px-1 text-sm text-muted-foreground">Loading supporters…</p>
      )}
      {status === 'error' && (
        <p className="px-1 text-sm text-muted-foreground">
          {supporters.length > 0
            ? 'Couldn’t refresh supporters; showing the last loaded list.'
            : 'Couldn’t load supporters. Retrying shortly.'}
        </p>
      )}

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
          {verified > 0 && (
            <p className="col-span-2 text-xs text-muted-foreground">
              {verified} of {supporters.length} supporters verified.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">By type</CardTitle>
        </CardHeader>
        <CardContent className="gap-2">
          {counts.map(({ label, bg, count }) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              <span className={cn('size-2.5 rounded-full', bg)} />
              <span>{label}</span>
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
              className="h-auto w-full justify-start gap-2 px-2 py-1.5 max-lg:py-3"
              onClick={() => onSelect(s.id)}
            >
              <span className={cn('size-2 shrink-0 rounded-full', categoryStyle(s.category).bg)} />
              <span className="truncate text-sm font-medium">{s.name}</span>
              {s.verified && <BadgeCheckIcon className="size-3.5 shrink-0" aria-label="Verified" />}
              <span className="ml-auto shrink-0 pl-2 text-xs font-normal tabular-nums text-muted-foreground">
                {[formatTotal(s), givingYears(s)].filter(Boolean).join(' · ')}
              </span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default function NetworkPanel({
  data,
  selectedId,
  searchRef,
  onSelect,
  onClose,
}: {
  data: SupportersState
  selectedId: string | null
  searchRef: RefObject<HTMLInputElement | null>
  onSelect: (id: string) => void
  onClose: () => void
}) {
  const supporters = data.supporters
  const supporter = useMemo(() => supporters.find((s) => s.id === selectedId) ?? null, [supporters, selectedId])
  const isMobile = useIsMobile()
  const [snap, setSnap] = useState<SheetSnap>('peek')

  // Picking a supporter brings their details up; clearing it gives the graph back
  const [prevSelectedId, setPrevSelectedId] = useState(selectedId)
  if (selectedId !== prevSelectedId) {
    setPrevSelectedId(selectedId)
    setSnap(selectedId ? 'half' : 'peek')
  }

  if (isMobile) {
    return (
      <BottomSheet
        label="Supporters"
        pinned={
          <div className="mx-auto max-w-2xl px-4 pb-3">
            {/* Full height keeps the field and its results clear of the on-screen keyboard */}
            <Search supporters={supporters} inputRef={searchRef} onSelect={onSelect} onFocus={() => setSnap('full')} />
          </div>
        }
        snap={snap}
        onSnapChange={setSnap}
        scrollKey={supporter?.id ?? 'overview'}
      >
        <div key={supporter?.id ?? 'overview'} className="animate-in fade-in-0 slide-in-from-right-2 mx-auto max-w-2xl p-4 pt-1 duration-200">
          {supporter ? (
            <SupporterDetail supporter={supporter} onClose={onClose} />
          ) : (
            <CemeteryOverview data={data} onSelect={onSelect} />
          )}
        </div>
      </BottomSheet>
    )
  }

  return (
    <aside className="flex w-96 shrink-0 flex-col border-l bg-background">
      <div className="border-b p-4">
        <Search supporters={supporters} inputRef={searchRef} onSelect={onSelect} />
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div key={supporter?.id ?? 'overview'} className="animate-in fade-in-0 slide-in-from-right-2 p-4 duration-200">
          {supporter ? (
            <SupporterDetail supporter={supporter} onClose={onClose} />
          ) : (
            <CemeteryOverview data={data} onSelect={onSelect} />
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
