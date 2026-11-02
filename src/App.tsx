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
      <div className="relative h-dvh bg-background text-foreground">
        {/* isolate keeps Leaflet's high z-indexes below the About dialog */}
        <main className="isolate h-full">
          <Routes>
            <Route path="/map" element={<MapView />} />
            <Route path="/network" element={<NetworkGraphView />} />
            <Route path="*" element={<Navigate to="/map" replace />} />
          </Routes>
        </main>

	<nav
	  aria-label="Main"
	  className="absolute top-3 left-3 z-10 flex w-44 flex-col gap-1 rounded-xl border bg-background/95 p-2 shadow-md backdrop-blur"
	>
	  <Link to="/map" className="block rounded-md px-1 pb-1">
	    <img src={logo} alt="Historic South-View Preservation Foundation" className="h-auto w-full" />
	  </Link>
	  <Separator className="my-1" />
	  {NAV.map((n) => (
	    <Button
	      key={n.to}
	      asChild
	      size="sm"
	      variant={pathname.startsWith(n.to) ? 'secondary' : 'ghost'}
	      className="justify-start"
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
