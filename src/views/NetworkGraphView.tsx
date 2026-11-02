import { BadgeCheckIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import NetworkGraph, { type Selection } from '@/components/NetworkGraph'
import NetworkPanel from '@/components/NetworkPanel'
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

export default function NetworkGraphView() {
  const [selection, setSelection] = useState<Selection | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

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
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-5 gap-y-2 border-b py-3 pr-4 pl-52 text-xs text-muted-foreground">
        {CATEGORIES.map((c) => (
          <LegendItem key={c} swatch={<span className={cn('size-2.5 rounded-full', CATEGORY_STYLES[c].bg)} />}>
            {c}
          </LegendItem>
        ))}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <LegendItem swatch={<EdgeSwatch />}>Donor</LegendItem>
          <LegendItem swatch={<EdgeSwatch dash="5,3" />}>Sponsor</LegendItem>
          <LegendItem swatch={<BadgeCheckIcon className="size-3.5 text-foreground" />}>Verified</LegendItem>
          <span>Node size = total given</span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1">
          <NetworkGraph selection={selection} onSelect={(id) => select(id)} />
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
