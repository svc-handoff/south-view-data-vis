# South-View Cemetery Data Visualization MVP

An interactive data visualization tool for exploring the history and community of [South-View Cemetery](https://www.southviewpreservation.com/) (1990 Jonesboro Rd SE, Atlanta, GA 30315). The app provides two visualizations: a temporal cemetery map, and a network of the sponsors and donors who support the cemetery.

> **Note:** Some data is still placeholder. The 30 notable figures are real people buried at South-View, each with a short sourced blurb (see [docs/notable-figures-research.md](docs/notable-figures-research.md)). Burial statistics, demographics and most supporters are fictional filler. Supporters with `"verified": true` in `supporters.json` are real and cite their public sources. The structure is designed to be populated with real archival data in the future.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | **React 19** + **TypeScript 6** | Component architecture and type safety |
| Build Tool | **Vite 8** | Dev server with HMR, production bundling |
| Styling | **Tailwind CSS 4** (via `@tailwindcss/vite`) | Utility-first CSS driven by shadcn theme tokens |
| UI components | **shadcn/ui** (Radix, Vega style, neutral base) + **lucide-react** | Accessible components in `src/components/ui`; theme lives in `src/index.css` |
| Map | **Leaflet 1.9** + **react-leaflet 5** | Interactive tiled map with polygon overlays |
| Graph | **D3.js 7** | Radial supporter network with zoom/drag |
| Routing | **React Router 7** | Client-side tab navigation (Map / Network) |
| Linting | **Oxlint** | Fast Rust-based linter for code quality |

## How It Works

### Project Structure

```
src/
├── App.tsx                  # Root layout: header with logo/nav, route outlet
├── main.tsx                 # React DOM entry point, BrowserRouter wrapper
├── index.css                # Tailwind + shadcn theme tokens (light/dark) + Leaflet overrides
├── types.ts                 # TypeScript interfaces for all data models
├── assets/
│   └── southviewlogo.avif   # South-View Preservation Foundation logo
├── data/
│   ├── index.ts             # Re-exports typed JSON data
│   ├── individuals.json     # 30 real notable burials, each with 3+ sources
│   ├── events.json          # 6 historical events (kept, not currently displayed)
│   ├── supporters.json      # Sponsors and donors (2 verified, the rest sample)
│   └── map_snapshots.json   # 6 dated footprints (1888–1977) with burial stats
├── views/
│   ├── MapView.tsx          # Leaflet map + time slider + footprint polygons
│   └── NetworkGraphView.tsx # Supporter network: legend, graph, side panel
├── lib/                     # cn() helper and shared formatters
└── components/
    ├── ui/                  # shadcn components (add more with `npx shadcn add <name>`)
    ├── AboutDialog.tsx      # Project intro dialog
    ├── MapSidebar.tsx       # Sidebar with demographics, context, notable figures
    ├── NetworkGraph.tsx     # D3 radial graph canvas (zoom controls, hover, selection)
    └── NetworkPanel.tsx     # Supporter search, cemetery overview, supporter details
```

### Data Layer

All data lives in static JSON files under `src/data/` — there is no backend or API. The `data/index.ts` barrel file imports each JSON file and casts it to the corresponding TypeScript interface (`Individual`, `CemeteryEvent`, `MapSnapshot`, `Supporter`), providing type safety throughout the app without a build-time code generation step.

Key data models (`src/types.ts`):

- **Individual** — name, birth/death years (birth may be `null` when no source gives it), burial year, optional burial section/plot, a short bio, a `sources` array (at least three, Henderson first), demographics, a `relations` array (edges to other individuals by type: spouse, parent, sibling, friend, colleague), and an `events` array (links to historical events with a role description).
- **CemeteryEvent** — name, year range, description, and type classification.
- **Supporter** — name, category (Government, Nonprofit, Foundation, Corporate, Faith community, Individual), relationship (`donor` or `sponsor`), description, a `contributions` array (year, USD amount or `null` for in-kind, purpose), and `verified` plus `sources` for supporters confirmed by public reporting. Only add a real organization or person with `verified: true` when a public source confirms the support.
- **MapSnapshot** — a point-in-time view of the cemetery: year, total burials, the cemetery's developed footprint polygon, notable figure IDs, and demographic aggregates (gender split, average age at death, acreage, historical context text).

### Cemetery Map Tab (`MapView` + `MapSidebar`)

The map uses **Leaflet** via `react-leaflet` with OpenStreetMap tiles centered on the real cemetery coordinates (33.7013, -84.3700).

- **Footprint overlays**: Each snapshot's `footprint` is the cemetery's grounds at that date: all land the South View Cemetery Association held, drawn to its property lines. Each step is a purchase dated by the 1944 plat or the Fulton County deed books (1888 original tract, 1902 and 1909 additions, 1944 Turman lots, 1957 Pauley land, 1977 North Section). Geometry comes from the plat, deed calls and the Verity Works character-area map from the National Register nomination (Aug 2025), aligned to today's parcels. Atlanta street maps from 1935–1973 corroborate the outlines. The 1977 footprint is unchanged on the 2025 map, so the timeline shows it as 1977–Present. Footprints only grow over time, so the map draws each date's added land as its own ring (that date's footprint with the previous one cut out). Older rings are shaded darker and the legend lists each date shown. All rings stay mounted as `<Polygon>` components and fade in and out as the timeline moves.
- **Timeline**: A floating card with play/pause and a shadcn slider controls which `MapSnapshot` is displayed. Changing the snapshot updates the sidebar data and triggers `map.flyToBounds()` to animate the viewport to fit the current footprint.
- **Sidebar**: Displays the selected snapshot's year, total burials, a gender demographics bar, average age at death, cemetery acreage, historical context paragraph, and a clickable list of notable figures. Figures appear once they are buried by the selected date, and the last (present-day) date lists all of them. Clicking a notable figure opens a dialog with their bio and sources.

### Network Tab (`NetworkGraphView`)

A single graph of everyone who has sponsored or donated to South-View, drawn with **D3.js** into an SVG.

- **Layout**: South-View Cemetery is the hub at the centre, and every supporter links to it. Supporters sit on two alternating elliptical rings, grouped by category so colours cluster. Labels point away from the centre, so they don't collide. A light force simulation keeps nodes draggable and springs them back to their resting positions.
- **Encoding**: node colour = category, node size = total recorded giving (square-root scale), solid edge = donor, dashed edge = sponsor, check badge = verified from a public source.
- **Interaction**: Hovering a node dims everything else and shows a tooltip. Clicking a supporter opens its details: total given, first year of support, each contribution, and sources. With nothing selected, the panel shows a cemetery overview (totals, counts by type, every supporter sorted by giving). Search (⌘K / Ctrl K) and the overview list both zoom the graph to the chosen supporter. Esc clears the selection.
- **Zoom/pan**: D3 zoom with scale extent [0.3, 4x], plus zoom in/out/fit buttons. Fit measures the rendered content, labels included.

### Theming

The UI uses **shadcn/ui** components on its neutral theme. All colours are CSS variables in `src/index.css` (light and dark), so a rebrand only touches that file:

- Base tokens (`--background`, `--foreground`, `--primary`, `--muted`, `--border`, …) drive every component.
- Data colours are the `--chart-1` … `--chart-6` tokens, used by the map footprint, the gender bar, and supporter categories. D3 elements get Tailwind classes such as `fill-chart-1`, so the graph follows the theme too.

### Routing

React Router 7 provides two routes (`/map` and `/network`) with a catch-all redirect to `/map`. The header uses shadcn `Tabs`, with each tab rendered as a router `Link`.

## Getting Started

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` with hot module replacement. No environment variables or external services are required.

### Build for Production

```bash
npm run build
npm run preview
```

The `build` command runs the TypeScript compiler followed by Vite's production bundler. Output goes to `dist/`.
