import { MapIcon, NetworkIcon } from 'lucide-react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AboutDialog from '@/components/AboutDialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { TooltipProvider } from '@/components/ui/tooltip'
import logo from './assets/southviewlogo.avif'
import MapView from './views/MapView'
import NetworkGraphView from './views/NetworkGraphView'

const NAV = [
  { to: '/map', label: 'Map', icon: MapIcon },
  { to: '/network', label: 'Network', icon: NetworkIcon },
]

function App() {
  const { pathname } = useLocation()

  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative h-dvh bg-background text-foreground max-lg:flex max-lg:flex-col">
        {/* isolate keeps Leaflet's high z-indexes below the About dialog */}
        <main className="isolate h-full max-lg:h-auto max-lg:min-h-0 max-lg:flex-1">
          <Routes>
            <Route path="/map" element={<MapView />} />
            <Route path="/network" element={<NetworkGraphView />} />
            <Route path="*" element={<Navigate to="/map" replace />} />
          </Routes>
        </main>

	<nav
	  aria-label="Main"
	  className="absolute top-3 left-3 z-10 flex w-44 flex-col gap-1 rounded-xl border bg-background/95 p-2 shadow-md backdrop-blur max-lg:static max-lg:order-first max-lg:w-full max-lg:shrink-0 max-lg:flex-row max-lg:items-center max-lg:rounded-none max-lg:border-0 max-lg:border-b max-lg:px-3 max-lg:py-1.5 max-lg:shadow-none"
	>
	  <Link to="/map" className="block rounded-md px-1 pb-1 max-lg:mr-auto max-lg:p-0">
	    <img src={logo} alt="Historic South-View Preservation Foundation" className="h-auto w-full max-lg:h-9 max-lg:w-auto max-[379px]:h-7" />
	  </Link>
	  <Separator className="my-1 max-lg:hidden" />
	  {NAV.map((n) => (
	    <Button
	      key={n.to}
	      asChild
	      size="sm"
	      variant={pathname.startsWith(n.to) ? 'secondary' : 'ghost'}
	      className="justify-start max-lg:h-10 max-[379px]:px-2"
	    >
	      <Link to={n.to}>
		<n.icon />
		{n.label}
	      </Link>
	    </Button>
	  ))}
	  <AboutDialog />
	</nav>

      </div>
    </TooltipProvider>
  )
}

export default App
