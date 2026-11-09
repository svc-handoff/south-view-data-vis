import 'leaflet/dist/leaflet.css'
import type { LatLng, LatLngBoundsExpression, Polygon as LeafletPolygon } from 'leaflet'
import { MaximizeIcon, PauseIcon, PlayIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { MapContainer, Polygon, TileLayer, Tooltip, useMap } from 'react-leaflet'
import MapSidebar from '@/components/MapSidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { mapSnapshots } from '@/data'
import { useIsMobile } from '@/hooks/useIsMobile'
import { snapshotLabel } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { MapSnapshot } from '@/types'

const CENTER: [number, number] = [33.7013, -84.37]
const PLAY_INTERVAL_MS = 3500 // how long each period stays on screen
const FILL_OPACITY = 0.7
const RING_COLORS = ['#ffffd4', '#fee391', '#fec44f', '#fe9929', '#d95f0e', '#993404']
const LAST = mapSnapshots.length - 1

// Land added at each date: that date's footprint with the previous one cut out as a hole.
// A date that adds nothing (same footprint as the previous date) gets no ring.
const RINGS = mapSnapshots
  .flatMap((s, i) => {
    const prev = mapSnapshots[i - 1]
    if (prev && JSON.stringify(prev.footprint) === JSON.stringify(s.footprint)) return []
    return [{ year: s.year, index: i, positions: prev ? [s.footprint, prev.footprint] : [s.footprint] }]
  })
  .map((r, i) => ({ ...r, color: RING_COLORS[i % RING_COLORS.length], first: i === 0 }))

function visibleRings(index: number) {
  return RINGS.filter((r) => r.index <= index)
}

function footprintBounds(footprint: [number, number][]): LatLngBoundsExpression | null {
  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180
  for (const [lat, lng] of footprint) {
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
  }
  return maxLat < minLat ? null : [[minLat, minLng], [maxLat, maxLng]]
}

function FootprintOverlays({
  snapshot,
  resetRef,
  onAtHomeChange,
}: {
  snapshot: MapSnapshot
  resetRef: RefObject<() => void>
  onAtHomeChange: (atHome: boolean) => void
}) {
  const map = useMap()
  const isMobile = useIsMobile()

  // Frame the final (largest) footprint once, so the camera never moves during playback
  useEffect(() => {
    const bounds = footprintBounds(mapSnapshots[LAST].footprint)
    if (!bounds) return
    if (!isMobile) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17 })
      return
    }
    // Mobile: the sheet settles the map's size after mount, and rotating the phone changes it
    let home: { center: LatLng; zoom: number } | null = null
    const fit = () => {
      map.invalidateSize({ animate: false })
      map.fitBounds(bounds, { paddingTopLeft: [16, 48], paddingBottomRight: [16, 16], maxZoom: 17, animate: false })
      home = { center: map.getCenter(), zoom: map.getZoom() }
      onAtHomeChange(true)
    }
    const onMoveEnd = () => {
      if (!home) return
      const offset = map.latLngToContainerPoint(home.center).distanceTo(map.getSize().divideBy(2))
      onAtHomeChange(offset < 2 && map.getZoom() === home.zoom)
    }
    resetRef.current = () => {
      if (home) map.setView(home.center, home.zoom)
    }
    map.on('moveend', onMoveEnd)
    const observer = new ResizeObserver(fit)
    observer.observe(map.getContainer())
    return () => {
      observer.disconnect()
      map.off('moveend', onMoveEnd)
    }
  }, [map, isMobile, resetRef, onAtHomeChange])

  const shownYears = new Set(visibleRings(mapSnapshots.indexOf(snapshot)).map((r) => r.year))

  // Every ring stays mounted and fades in/out, so the cemetery appears to grow smoothly.
  return (
    <>
      {RINGS.map((ring) => (
        <FootprintRing key={ring.year} ring={ring} shown={shownYears.has(ring.year)} />
      ))}
      {/* One thin line around the current outer boundary only */}
      <Polygon
        key={snapshot.year}
        positions={snapshot.footprint}
        interactive={false}
        pathOptions={{ color: '#5c2a06', weight: 1, fill: false }}
      />
    </>
  )
}

function FootprintRing({ ring, shown }: { ring: (typeof RINGS)[number]; shown: boolean }) {
  const ref = useRef<LeafletPolygon>(null)

  // Hidden rings must not catch clicks or hovers
  useEffect(() => {
    const el = ref.current?.getElement() as SVGPathElement | undefined
    if (el) el.style.pointerEvents = shown ? '' : 'none'
  }, [shown])

  return (
    <Polygon
      ref={ref}
      positions={ring.positions}
      pathOptions={{
        className: 'transition-[fill-opacity] duration-1000',
        stroke: false,
        fillColor: ring.color,
        fillOpacity: shown ? FILL_OPACITY : 0,
      }}
    >
      {shown && (
        <Tooltip sticky className="sv-tooltip">
          {ring.first ? `Original grounds (${ring.year})` : `Added ${ring.year}`}
        </Tooltip>
      )}
    </Polygon>
  )
}

interface TimelineProps {
  index: number
  onChange: (i: number) => void
  playing: boolean
  onTogglePlay: () => void
}

function TimelineTrack({ index, onChange, mobile = false }: Pick<TimelineProps, 'index' | 'onChange'> & { mobile?: boolean }) {
  const thumb = mobile ? 24 : 16
  return (
    <>
      <Slider
        min={0}
        max={LAST}
        step={1}
        value={[index]}
        onValueChange={([v]) => onChange(v)}
        aria-label="Timeline year"
        className={mobile ? 'py-2 **:data-[slot=slider-thumb]:size-6' : undefined}
      />
      <div className={mobile ? 'relative h-8' : 'relative mt-3 h-4'}>
        {mapSnapshots.map((s, i) => (
          <button
            key={s.year}
            type="button"
            onClick={() => onChange(i)}
            tabIndex={-1}
            className={cn(
              'absolute -translate-x-1/2 text-xs tabular-nums transition-colors hover:text-foreground',
              mobile && 'px-2 py-2',
              i === index ? 'font-bold text-foreground' : 'text-muted-foreground',
            )}
            // Radix thumbs are inset by half their width at each end
            style={{ left: `calc(${thumb / 2}px + (100% - ${thumb}px) * ${i / LAST})` }}
          >
            {s.year}
          </button>
        ))}
      </div>
    </>
  )
}

function PlayButton({ playing, onTogglePlay, size }: Pick<TimelineProps, 'playing' | 'onTogglePlay'> & { size: 'icon' | 'icon-lg' }) {
  return (
    <Button size={size} variant="outline" onClick={onTogglePlay} aria-label={playing ? 'Pause timeline' : 'Play timeline'}>
      {playing ? <PauseIcon /> : <PlayIcon />}
    </Button>
  )
}

function Timeline({ index, onChange, playing, onTogglePlay }: TimelineProps) {
  const snapshot = mapSnapshots[index]
  return (
    <Card className="absolute inset-x-4 bottom-4 z-[1000] mx-auto max-w-3xl gap-0 bg-background/95 p-4 shadow-lg backdrop-blur">
      <div className="flex items-center gap-4">
        <PlayButton playing={playing} onTogglePlay={onTogglePlay} size="icon" />
        <div className="min-w-0 flex-1">
          <TimelineTrack index={index} onChange={onChange} />
        </div>
        <div className="w-48 shrink-0 text-right">
          <p className="text-2xl font-semibold tracking-tight whitespace-nowrap tabular-nums">
            {snapshotLabel(snapshot, index === LAST)}
          </p>
        </div>
      </div>
    </Card>
  )
}

// Lives in the bottom sheet: one row in landscape, year above the slider in portrait
function MobileTimeline({ index, onChange, playing, onTogglePlay }: TimelineProps) {
  return (
    <div className="mx-auto grid max-w-2xl grid-cols-[auto_1fr] items-center gap-x-3 px-4 sm:grid-cols-[auto_1fr_auto] sm:gap-x-4">
      <PlayButton playing={playing} onTogglePlay={onTogglePlay} size="icon-lg" />
      <p className="text-2xl font-semibold tracking-tight whitespace-nowrap tabular-nums sm:order-last">
        {snapshotLabel(mapSnapshots[index], index === LAST)}
      </p>
      <div className="col-span-2 mt-1 min-w-0 sm:col-span-1 sm:mt-0 sm:pt-3">
        <TimelineTrack index={index} onChange={onChange} mobile />
      </div>
    </div>
  )
}

function FootprintLegend({ index }: { index: number }) {
  return (
    <Card className="absolute top-3 right-3 z-[1000] gap-1.5 bg-background/95 px-3 py-2.5 text-xs shadow-sm backdrop-blur max-lg:top-2 max-lg:right-2 max-lg:left-2 max-lg:ml-auto max-lg:w-fit max-lg:flex-row max-lg:flex-wrap max-lg:items-center max-lg:gap-x-2.5 max-lg:gap-y-1 max-lg:px-2.5 max-lg:py-1.5">
      <p className="font-bold">Grounds by</p>
      {visibleRings(index).map((r) => (
        <div key={r.year} className="flex items-center gap-2 tabular-nums">
          <span
            className="size-3 rounded-sm border border-black/30"
            style={{ backgroundColor: r.color }}
          />
          <span>{r.year}</span>
        </div>
      ))}
    </Card>
  )
}

export default function MapView() {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false) // starts paused: the user presses play
  const [tilesReady, setTilesReady] = useState(false)
  const quickStepRef = useRef(false)
  const snapshot = mapSnapshots[index]
  const isMobile = useIsMobile()
  const resetViewRef = useRef<() => void>(() => {})
  const [atHome, setAtHome] = useState(true)

  const scrub = (i: number) => {
    setPlaying(false)
    setIndex(i)
  }

  // Don't leave the skeleton up forever if tiles can't load
  useEffect(() => {
    const t = setTimeout(() => setTilesReady(true), 5000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!playing) return
    const delay = quickStepRef.current ? PLAY_INTERVAL_MS / 2 : PLAY_INTERVAL_MS
    const t = setTimeout(() => {
      quickStepRef.current = false
      if (index >= LAST) setPlaying(false)
      else setIndex(index + 1)
    }, delay)
    return () => clearTimeout(t)
  }, [playing, index])

  const togglePlay = useCallback(() => {
    quickStepRef.current = !playing
    if (!playing && index >= LAST) setIndex(0)
    setPlaying((p) => !p)
  }, [playing, index])

  return (
    <div className="flex h-full max-lg:relative max-lg:flex-col max-lg:overflow-hidden">
      <div className="relative min-w-0 flex-1 max-lg:min-h-0">
        <MapContainer center={CENTER} zoom={16} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{ load: () => setTilesReady(true) }}
          />
          <FootprintOverlays snapshot={snapshot} resetRef={resetViewRef} onAtHomeChange={setAtHome} />
        </MapContainer>
        <div
          className={cn(
            'pointer-events-none absolute inset-0 z-[1100] transition-opacity duration-500',
            tilesReady ? 'opacity-0' : 'opacity-100',
          )}
          aria-hidden={tilesReady}
        >
          <Skeleton className="h-full w-full rounded-none" />
        </div>

        <FootprintLegend index={index} />
        {!isMobile && <Timeline index={index} onChange={scrub} playing={playing} onTogglePlay={togglePlay} />}
        {isMobile && !atHome && (
          <div className="absolute bottom-7 left-3 z-[1000] rounded-lg border bg-background p-1 shadow-sm">
            <Button variant="ghost" size="icon-sm" className="size-10" onClick={() => resetViewRef.current()} aria-label="Reset map view">
              <MaximizeIcon />
            </Button>
          </div>
        )}
      </div>
      <MapSidebar
        snapshot={snapshot}
        label={snapshotLabel(snapshot, index === LAST)}
        pinned={<MobileTimeline index={index} onChange={scrub} playing={playing} onTogglePlay={togglePlay} />}
      />
    </div>
  )
}
