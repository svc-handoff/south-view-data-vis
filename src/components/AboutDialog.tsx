import { InfoIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function AboutDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="justify-start">
          <InfoIcon />
          About
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>About this project</DialogTitle>
          <DialogDescription>
            An interactive look at South-View Cemetery, founded in 1886 in Atlanta, Georgia and
            the oldest African American-owned cemetery in the United States.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-bold">Map</h3>
            <p className="text-muted-foreground">
              Move the timeline to watch the cemetery grow, with land and historical context for
              each period.
            </p>
          </div>
          <div>
            <h3 className="font-bold">Network</h3>
            <p className="text-muted-foreground">
              See the sponsors and donors who support South-View and how each one has contributed
              to the cemetery over time.
            </p>
          </div>
          <p className="rounded-md border bg-muted/50 p-3 text-muted-foreground">
            Most names, biographies, statistics and supporters shown are cross-refrenced data for 
            demonstration. Supporters marked 'Verified' are confirmed by public sources.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
