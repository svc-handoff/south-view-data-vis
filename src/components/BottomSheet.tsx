import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type SheetSnap = 'peek' | 'half' | 'full'

const BODY_HINT = 64 // how much of the body shows at rest, hinting there's more to pull up
const SHORT_SCREEN = 480 // below this (phones in landscape) the map needs that space more
const MIN_HALF_BODY = 120
const CORNER_OVERLAP = 16 // content behind runs under the rounded corners
const TAP_SLOP = 6
const FLICK_MS = 150 // how far ahead a release is projected when picking a snap point

/**
 * Mobile stand-in for the desktop side panels. `pinned` stays visible at every snap point
 * and doubles as the drag area; its buttons, inputs and sliders keep working as normal.
 * Render inside a positioned flex column: the sheet reserves its resting height in the flow.
 */
export default function BottomSheet({
  label,
  pinned,
  snap,
  onSnapChange,
  scrollKey,
  children,
}: {
  label: string
  pinned: ReactNode
  snap: SheetSnap
  onSnapChange: (snap: SheetSnap) => void
  /** The body scrolls back to the top whenever this changes */
  scrollKey?: string
  children: ReactNode
}) {
  const sheetRef = useRef<HTMLElement>(null)
  const pinnedRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startY: number; from: number; lastY: number; lastT: number; velocity: number } | null>(null)
  const [size, setSize] = useState({ full: 0, pinned: 0 })
  const [dragY, setDragY] = useState<number | null>(null)

  useLayoutEffect(() => {
    const measure = () =>
      setSize({ full: sheetRef.current?.offsetHeight ?? 0, pinned: pinnedRef.current?.offsetHeight ?? 0 })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(sheetRef.current!)
    observer.observe(pinnedRef.current!)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 })
  }, [scrollKey])

  const peek = size.pinned + (size.full >= SHORT_SCREEN ? BODY_HINT : 0)
  const heights: Record<SheetSnap, number> = {
    peek,
    half: Math.min(size.full, Math.max(peek + MIN_HALF_BODY, Math.round(size.full * 0.55))),
    full: size.full,
  }
  const restY = size.full - heights[snap]
  const maxY = size.full - peek
  const toggle = () => onSnapChange(snap === 'peek' ? 'half' : 'peek')

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const target = e.target as Element
    if (e.button !== 0 || target.closest('button:not([data-sheet-handle]), a, input, [data-slot="slider"], [cmdk-list]')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startY: e.clientY, from: restY, lastY: e.clientY, lastT: e.timeStamp, velocity: 0 }
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const dt = e.timeStamp - drag.lastT
    if (dt > 0) drag.velocity = (e.clientY - drag.lastY) / dt
    drag.lastY = e.clientY
    drag.lastT = e.timeStamp
    if (Math.abs(e.clientY - drag.startY) >= TAP_SLOP || dragY !== null) {
      setDragY(Math.min(maxY, Math.max(0, drag.from + e.clientY - drag.startY)))
    }
  }

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    dragRef.current = null
    setDragY(null)
    if (Math.abs(e.clientY - drag.startY) < TAP_SLOP) {
      toggle()
      return
    }
    const projected = drag.from + e.clientY - drag.startY + drag.velocity * FLICK_MS
    const nearest = (['peek', 'half', 'full'] as const).reduce((best, s) =>
      Math.abs(size.full - heights[s] - projected) < Math.abs(size.full - heights[best] - projected) ? s : best,
    )
    onSnapChange(nearest)
  }

  const onPointerCancel = () => {
    dragRef.current = null
    setDragY(null)
  }

  return (
    <>
      <div aria-hidden className="shrink-0" style={{ height: Math.max(0, peek - CORNER_OVERLAP) }} />
      <section
        ref={sheetRef}
        aria-label={label}
        className={cn(
          'absolute inset-x-0 top-2 bottom-0 z-[1200] flex flex-col overflow-hidden rounded-t-2xl border-t bg-background shadow-[0_-6px_20px_rgb(0_0_0/0.12)]',
          dragY === null && 'transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
        )}
        style={{ transform: `translate3d(0, ${dragY ?? restY}px, 0)` }}
      >
        <div
          ref={pinnedRef}
          className="relative z-10 shrink-0 touch-none bg-background select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        >
          <button
            type="button"
            data-sheet-handle
            aria-label={snap === 'peek' ? `Expand ${label}` : `Collapse ${label}`}
            aria-expanded={snap !== 'peek'}
            // Pointer taps are handled by the drag logic above; this is for keyboards and screen readers
            onClick={(e) => e.detail === 0 && toggle()}
            className="flex h-6 w-full items-center justify-center outline-none focus-visible:bg-muted"
          >
            <span className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </button>
          {pinned}
        </div>
        {/* The sheet slides partly off-screen, so pad the scroll range to keep the end reachable */}
        <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain" style={{ paddingBottom: restY }}>
          {children}
        </div>
      </section>
    </>
  )
}
