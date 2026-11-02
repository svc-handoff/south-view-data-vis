import 'leaflet/dist/leaflet.css'
import type { LatLngBoundsExpression, Polygon as LeafletPolygon } from 'leaflet'
import { PauseIcon, PlayIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MapContainer, Polygon, TileLayer, Tooltip, useMap } from 'react-leaflet'
import MapSidebar from '@/components/MapSidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { mapSnapshots } from '@/data'
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

function FootprintOverlays({ snapshot }: { snapshot: MapSnapshot }) {
  const map = useMap()

  // Frame the final (largest) footprint once, so the camera never moves during playback
  useEffect(() => {
    const bounds = footprintBounds(mapSnapshots[LAST].footprint)
    if (bounds) map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17 })
  }, [map])

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

function Timeline({
  index,
  onChange,
  playing,
  onTogglePlay,
}: {
  index: number
  onChange: (i: number) => void
  playing: boolean
  onTogglePlay: () => void
}) {
  const snapshot = mapSnapshots[index]
  return (
    <Card className="absolute inset-x-4 bottom-4 z-[1000] mx-auto max-w-3xl gap-0 bg-background/95 p-4 shadow-lg backdrop-blur">
      <div className="flex items-center gap-4">
        <Button size="icon" variant="outline" onClick={onTogglePlay} aria-label={playing ? 'Pause timeline' : 'Play timeline'}>
          {playing ? <PauseIcon /> : <PlayIcon />}
        </Button>
        <div className="min-w-0 flex-1">
          <Slider
            min={0}
            max={LAST}
            step={1}
            value={[index]}
            onValueChange={([v]) => onChange(v)}
            aria-label="Timeline year"
          />
          <div className="relative mt-3 h-4">
            {mapSnapshots.map((s, i) => (
              <button
                key={s.year}
                type="button"
                onClick={() => onChange(i)}
                tabIndex={-1}
                className={cn(
                  'absolute -translate-x-1/2 text-xs tabular-nums transition-colors hover:text-foreground',
                  i === index ? 'font-bold text-foreground' : 'text-muted-foreground',
                )}
                // Radix thumbs are inset by half their 16px width at each end
                style={{ left: `calc(8px + (100% - 16px) * ${i / LAST})` }}
              >
                {s.year}
              </button>
            ))}
          </div>
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

function FootprintLegend({ index }: { index: number }) {
  return (
    <Card className="absolute top-3 right-3 z-[1000] gap-1.5 bg-background/95 px-3 py-2.5 text-xs shadow-sm backdrop-blur">
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
    <div className="flex h-full">
      <div className="relative min-w-0 flex-1">
        <MapContainer center={CENTER} zoom={16} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{ load: () => setTilesReady(true) }}
          />
          <FootprintOverlays snapshot={snapshot} />
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
        <Timeline
          index={index}
          onChange={(i) => {
            setPlaying(false)
            setIndex(i)
          }}
          playing={playing}
          onTogglePlay={togglePlay}
        />
      </div>
      <MapSidebar snapshot={snapshot} label={snapshotLabel(snapshot, index === LAST)} />
    </div>
  )
}
