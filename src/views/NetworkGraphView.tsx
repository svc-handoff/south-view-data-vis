import { BadgeCheckIcon, ListIcon } from 'lucide-react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import NetworkGraph, { type Selection } from '@/components/NetworkGraph'
import NetworkPanel from '@/components/NetworkPanel'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useIsMobile } from '@/hooks/useIsMobile'
import { CATEGORIES, CATEGORY_STYLES } from '@/lib/supporters'
import { cn } from '@/lib/utils'

function LegendItem({ children, swatch }: { children: React.ReactNode; swatch: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      {swatch}
      {children}
    </span>
  )
}

function EdgeSwatch({ dash }: { dash?: string }) {
  return (
    <svg width="20" height="6" aria-hidden className="text-muted-foreground">
      <line x1="0" y1="3" x2="20" y2="3" stroke="currentColor" strokeWidth="1.5" strokeDasharray={dash} />
    </svg>
  )
}

function CategoryLegend() {
  return CATEGORIES.map((c) => (
    <LegendItem key={c} swatch={<span className={cn('size-2.5 rounded-full', CATEGORY_STYLES[c].bg)} />}>
      {c}
    </LegendItem>
  ))
}

function EncodingLegend() {
  return (
    <>
      <LegendItem swatch={<EdgeSwatch />}>Donor</LegendItem>
      <LegendItem swatch={<EdgeSwatch dash="5,3" />}>Sponsor</LegendItem>
      <LegendItem swatch={<BadgeCheckIcon className="size-3.5 text-foreground" />}>Verified</LegendItem>
      <span>Node size = total given</span>
    </>
  )
}

function MobileLegend({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <div className="absolute right-3 bottom-7 rounded-lg border bg-background p-1 shadow-sm">
        <PopoverPrimitive.Trigger asChild>
          <Button variant="ghost" className="h-10">
            <ListIcon />
            Legend
          </Button>
        </PopoverPrimitive.Trigger>
      </div>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="top"
          align="end"
          sideOffset={8}
          collisionPadding={12}
          aria-label="Graph legend"
          className="z-50 w-72 space-y-3 rounded-xl bg-popover p-4 text-xs text-muted-foreground shadow-md ring-1 ring-foreground/10 outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            <CategoryLegend />
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 *:last:col-span-2">
            <EncodingLegend />
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

export default function NetworkGraphView() {
  const [selection, setSelection] = useState<Selection | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()
  const [legendOpen, setLegendOpen] = useState(false)

  const select = useCallback((id: string | null, recenter = false) => {
    setSelection(id ? { id, recenter } : null)
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      } else if (e.key === 'Escape' && document.activeElement !== searchRef.current) {
        setSelection(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="flex h-full flex-col">
      {!isMobile && (
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-5 gap-y-2 border-b py-3 pr-4 pl-52 text-xs text-muted-foreground">
          <CategoryLegend />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <EncodingLegend />
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 max-lg:relative max-lg:flex-col max-lg:overflow-hidden">
        <div className="min-w-0 flex-1 max-lg:relative max-lg:min-h-0">
          {/* On mobile a tapped node could end up behind the details sheet, so bring it into view */}
          <NetworkGraph selection={selection} onSelect={(id) => select(id, isMobile)} onPress={() => setLegendOpen(false)} />
          {isMobile && <MobileLegend open={legendOpen} onOpenChange={setLegendOpen} />}
        </div>
        <NetworkPanel
          selectedId={selection?.id ?? null}
          searchRef={searchRef}
          onSelect={(id) => select(id, true)}
          onClose={() => select(null)}
        />
      </div>
    </div>
  )
}
