# South-View Cemetery Data Visualization

An interactive data visualization tool for exploring the history and community of [South-View Cemetery](https://www.southviewpreservation.com/) (1990 Jonesboro Rd SE, Atlanta, GA 30315). The app has two pages: a timeline map of how the cemetery's grounds grew, and a network of the sponsors and donors who support it.

**Live site:** <https://south-view-data-vis.vercel.app>

> **Note:** Some content is still sample data, including most supporters and all notable figures. See [Data status](#data-status) before publishing or relying on any of it.

## Contents

- [Quick start](#quick-start)
- [Setting up the repository](#setting-up-the-repository)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Data status](#data-status)
- [Editing content](#editing-content)
- [How the app works](#how-the-app-works)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Known limitations](#known-limitations)

## Quick start

```bash
git clone https://github.com/xelanehc/south-view-data-vis.git
cd south-view-data-vis
npm ci
npm run dev
```

Open <http://localhost:5173>. No accounts, API keys, environment variables or database are needed.

## Setting up the repository

### Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| [Node.js](https://nodejs.org) | 20.19+ or 22.12+ | Required by Vite 8. Includes npm. Check with `node -v`. |
| [Git](https://git-scm.com) | Any recent version | Check with `git --version`. |
| Internet connection | | `npm ci` needs it, and the map's street background loads from OpenStreetMap. |

### Install and run

1. Clone the repository and enter its folder:

   ```bash
   git clone https://github.com/xelanehc/south-view-data-vis.git
   cd south-view-data-vis
   ```

2. Install the exact dependency versions from `package-lock.json`:

   ```bash
   npm ci
   ```

   `npm audit` currently reports advisories in the dependency tree. They don't stop the app from installing or running. Avoid `npm audit fix --force`, because it can introduce breaking upgrades.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open <http://localhost:5173>. The page reloads as you save files. If that port is busy, Vite picks the next free one and prints it in the terminal. Press `Ctrl+C` to stop the server.

### Check your setup

Run these before you commit a change:

```bash
npm run lint
npm run build
```

The build should finish with `✓ built in`. You can expect two non-blocking messages:

- Lint reports `only-export-components` warnings for files in `src/components/ui/`.
- The build warns that a chunk is larger than 500 kB.

The project has no automated tests, so also open both pages and click through them.

### Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Starts the development server with hot reload |
| `npm run build` | Type-checks with `tsc -b`, then writes the production site to `dist/` |
| `npm run preview` | Serves the built `dist/` folder locally; run `npm run build` first |
| `npm run lint` | Runs Oxlint |

`node_modules/` and `dist/` are ignored by Git.

## Tech stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | **React 19** + **TypeScript 6** | Components and type safety |
| Build tool | **Vite 8** | Dev server and production bundling |
| Styling | **Tailwind CSS 4** (via `@tailwindcss/vite`) | Utility classes driven by theme tokens |
| UI components | **shadcn/ui** (Radix, neutral base) + **lucide-react** | Accessible components in `src/components/ui` |
| Map | **Leaflet 1.9** + **react-leaflet 5** | Tiled map with polygon overlays |
| Graph | **D3.js 7** | Supporter network with zoom and drag |
| Routing | **React Router 7** | `/map` and `/network` pages |
| Linting | **Oxlint** | Code quality checks |

## Project structure

```
src/
├── App.tsx                  # Floating menu (logo, Map, Network, About) and routes
├── main.tsx                 # React entry point, BrowserRouter wrapper
├── index.css                # Tailwind, theme tokens and Leaflet overrides
├── types.ts                 # TypeScript interfaces for the data models
├── assets/
│   └── southviewlogo.avif   # Logo used in the app
├── data/
│   ├── index.ts             # Re-exports typed JSON data
│   ├── map_snapshots.json   # 6 dated footprints (1888–1977) with acreage and context
│   ├── memorials.json       # Find a Grave memorial counts by timeline year
│   ├── individuals.json     # 30 sample people (hidden from visitors)
│   ├── supporters.json      # 21 sponsors and donors
│   └── events.json          # 6 sample historical events (not displayed)
├── views/
│   ├── MapView.tsx          # Leaflet map, timeline, legend and footprint rings
│   └── NetworkGraphView.tsx # Network key, graph and side panel
├── lib/
│   ├── format.ts            # Timeline label formatting
│   ├── supporters.ts        # Category colors and giving helpers
│   └── utils.ts             # cn() class name helper
└── components/
    ├── ui/                  # shadcn components (add more with `npx shadcn add <name>`)
    ├── AboutDialog.tsx      # Project description dialog
    ├── MapSidebar.tsx       # Context, cemetery size, burial records, notable figures
    ├── NetworkGraph.tsx     # D3 graph (zoom controls, hover, selection)
    └── NetworkPanel.tsx     # Supporter search, overview and details
public/                      # Static files, including the browser-tab icon
vercel.json                  # Sends all paths to index.html on Vercel
STEERING.md                  # Original build plan, kept for history and now out of date
```

`src/assets/hero.png`, `react.svg` and `vite.svg`, `public/icons.svg`, and the copies of `southview.jpg` and `southviewlogo.avif` in the root folder aren't used by the app. `public/favicon.svg` is the default Vite icon.

## Data status

| Content | Status |
|---------|--------|
| Map footprints | Real: traced from the 1944 plat, Fulton County deed books and the Verity Works map from the National Register nomination (Aug 2025). The source images aren't stored in this repository. |
| Historical context | Real: written from those same records |
| Cemetery size | Stored per date; each figure is within 0.3 acres of the area of its drawn footprint. Not separately checked against survey records. |
| Burial records | Online memorial counts from [Find a Grave](https://www.findagrave.com/cemetery/37101), accessed October 26, 2026. Not official burial totals. |
| Notable figures | **Sample:** invented people. Hidden from visitors by `SHOW_NOTABLE_FIGURES`. |
| `total_burials`, `gender`, `avg_age_at_death` | **Sample:** stored in `map_snapshots.json` but not displayed |
| Events | **Sample:** stored in `events.json` but not displayed |
| City of Atlanta, Atlanta Preservation Center | Real: `verified: true`, with public sources linked |
| Walter Pierce | `verified: true` and added as a real supporter, but no `sources` are listed. The commit that added him refers to <https://givebutter.com/south-view-cemetery-nqvhuj>. |
| Other 18 supporters | **Sample:** invented names and amounts, so the $274,025 giving total isn't real |

### Open work

- The `michael/blurbs` branch has 30 researched people with sources. It isn't merged, and it conflicts with later changes to the map and sidebar.
- The text in `AboutDialog.tsx` and `NetworkPanel.tsx` that describes the data needs updating once the sample content is replaced. Unverified supporters show a "Sample data" badge until `SourceBadge` in `NetworkPanel.tsx` is changed.

## Editing content

Routine content lives in `src/data/`. These files aren't validated when the app builds, apart from JSON syntax, so check both pages after every edit.

| To change | Edit |
|-----------|------|
| Cemetery size, historical context or the listed people for a date | `map_snapshots.json` |
| Burial record counts or their source | `memorials.json` |
| A person's details | `individuals.json` |
| A supporter's details | `supporters.json` |

### Supporters (`supporters.json`)

```json
{
  "id": "sup-example-family-fund",
  "name": "Example Family Fund",
  "category": "Foundation",
  "relationship": "donor",
  "description": "Supports preservation of the historic grounds.",
  "contributions": [
    { "year": 2026, "amount": 5000, "purpose": "Monument cleaning" },
    { "year": 2025, "amount": null, "purpose": "Volunteer day supplies" }
  ],
  "verified": true,
  "sources": [
    { "label": "Foundation annual report", "url": "https://www.southviewpreservation.com/foundation" }
  ]
}
```

- `id` must be unique.
- `category` must be exactly `Government`, `Nonprofit`, `Foundation`, `Corporate`, `Faith community` or `Individual`. Any other value blanks the Network page, even though the build passes.
- `relationship` must be `donor` or `sponsor`.
- `amount` is a plain number in USD, or `null` for in-kind support.
- Keep at least one contribution, or the panel shows "Supporting since Infinity".
- Only use `verified: true` when a public source confirms the support, and list that source in `sources`.
- To add a category, update `SupporterCategory` in `src/types.ts` and `CATEGORY_STYLES` in `src/lib/supporters.ts`.

### Timeline dates (`map_snapshots.json` and `memorials.json`)

Each entry in `map_snapshots.json` is one stop on the timeline, and entries must stay in year order:

```json
{
  "year": 1944,
  "total_burials": 1180,
  "notable_figures": ["person-5", "person-6"],
  "demographics": {
    "gender": { "Male": 660, "Female": 520 },
    "avg_age_at_death": 52,
    "cemetery_acreage": 49.1,
    "historical_context": "In 1944 the Association bought lots north of the old grounds..."
  },
  "footprint": [
    [33.698739, -84.36876],
    [33.699006, -84.36868]
  ]
}
```

To add a date:

1. Add its entry to `map_snapshots.json`, in year order. The last entry automatically gets the "–Present" label.
2. Add a line with the same year under `counts` in `memorials.json`. Without it, that date has no Burial records card:

   ```json
   "1944": { "count": 5098, "scope": "through 1944" }
   ```

3. If you refresh the counts, also update `source.accessed` in `memorials.json`.

Footprint rules:

- Points are `[latitude, longitude]`. Many GIS tools export longitude first, so check the order.
- List points in order around the boundary, and don't repeat the first point at the end.
- Each footprint must contain the previous one, because the app cuts out the previous footprint to find the land each date added.
- Reuse the exact coordinates of any shared edge, or thin slivers can appear.
- If the land didn't change, copy the previous footprint exactly. The app adds no new ring.
- `RING_COLORS` in `MapView.tsx` has six colors, so a seventh land date reuses the first color.

### Notable figures (`individuals.json`)

Notable figures are hidden until real people are added. To show them:

1. Replace the sample entries in `individuals.json`.
2. List each person's `id` under `notable_figures` for every timeline date they should appear on. A person only appears on dates at or after their `death` year.
3. Set `SHOW_NOTABLE_FIGURES` to `true` in `src/components/MapSidebar.tsx`.

The story dialog shows `name`, `birth`, `death`, `occupation`, `bio`, `section` and `plot`. A mistyped `id` is skipped silently.

## How the app works

### Data layer

All data lives in static JSON files, with no backend or API. `src/data/index.ts` imports most of the files and casts them to the interfaces in `src/types.ts`. The casts give type safety in the code, but they don't check values in the JSON at build time. `MapSidebar.tsx` imports `memorials.json` directly. `MapSnapshot` also declares a `known_memorials` field that the data and the code don't use.

### Map page (`MapView` + `MapSidebar`)

- **Footprints**: Each snapshot's `footprint` is all the land the South View Cemetery Association held at that date. The map draws the land added at each date as its own colored ring, using that footprint with the previous one cut out. A thin line marks the current outer boundary. Rings stay mounted and fade in and out, and hovering a ring shows when that land was added.
- **Timeline**: The page opens paused at 1888. Play advances through the dates, spending 3.5 seconds on each. The map is framed once around the final footprint, so it doesn't move during playback.
- **Sidebar**: Shows the historical context, cemetery size, Find a Grave memorial count with its source, and the notable figures card.

### Network page (`NetworkGraphView`)

- **Layout**: South-View is the hub, and every supporter links to it. Supporters sit on two alternating elliptical rings, grouped by category. A light force simulation keeps nodes draggable and springs them back to their resting positions.
- **Encoding**: Node color shows category, and node size shows total recorded giving on a square-root scale. A solid edge means donor, a dashed edge means sponsor, and a check badge means `verified: true`.
- **Interaction**: Hovering a node dims everything else and shows a tooltip. Selecting a supporter opens its details. With nothing selected, the panel shows totals, counts by type and every supporter sorted by giving. Search (`⌘K` / `Ctrl K`) and the list zoom the graph to a supporter, and `Esc` clears the selection.
- **Zoom and pan**: D3 zoom runs from 0.3x to 4x, with zoom in, zoom out and fit buttons.

### Theming

Colors are CSS variables in `src/index.css`:

- Base tokens such as `--background`, `--foreground` and `--primary` drive every component.
- `--chart-1` to `--chart-6` color the supporter categories.
- The map's ring colors are set in `RING_COLORS` in `MapView.tsx`.
- The stylesheet defines dark tokens, but nothing in the app turns dark mode on.

### Routing

React Router provides `/map` and `/network`, and any other path redirects to `/map`. The menu in `App.tsx` links between them.

## Deployment

The site is a static build, so any static host can serve it.

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Output folder | `dist` |
| Node version | 20.19+ or 22.12+ |
| Environment variables | None |

The live site runs on Vercel from a project team member's personal account, and it was deploying from `main` at handoff. To keep using Vercel, transfer that project or import this repository into a new one. Vercel's Hobby plan is limited to [non-commercial personal use](https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage), so check that it fits before relying on it.

Two things to get right on any host:

- **Direct links**: The host must send unknown paths to `index.html`, or opening `/network` directly returns a 404. `vercel.json` handles this on Vercel. Other hosts need their own setting.
- **Sub-folders**: The app expects to be at the root of its address. In a sub-folder such as `example.com/history/`, it shows a blank page because its assets load from the root. To host it there, set `base` in `vite.config.ts` and `basename` on `BrowserRouter` in `src/main.tsx`.

### Embedding in another website

Embedding only displays the app from its own web address, so it still needs a host. The target page needs room for it, because the layout gets cramped below about 1100 × 760 pixels:

```html
<iframe
  src="https://south-view-data-vis.vercel.app/map"
  title="South-View cemetery history map"
  width="100%"
  height="760"
  loading="lazy"
  style="border: 1px solid #ccc; border-radius: 8px;">
</iframe>
```

Replace the address if the app moves to a new host.

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| `npm ci` or Vite reports an unsupported engine | Node.js is too old | Install Node 20.19+ or 22.12+ |
| `npm ci` says the lock file is out of sync | `package.json` changed without its lock file | Run `npm install`, then commit both files |
| Build fails with `Unterminated string literal` or `',' expected` | Missing quotation mark or comma in a JSON file | Go to the file and line in the error, then check that line and the one above |
| Build fails with `Invalid character` | Curly quotes, often pasted from a word processor | Retype them as straight quotes |
| Build fails with a `builtin:vite-json` error | Usually a trailing comma in a JSON file | Remove it, or use a JSON validator to find the line |
| Build fails with `is declared but its value is never read` | Unused import or variable | Remove it; `noUnusedLocals` is on |
| Network page is blank, but Map works | Misspelled `category` in `supporters.json` | Use one of the allowed values |
| Burial records card is missing for a date | No matching year in `memorials.json` | Add a line for that year |
| Notable figures only shows a message | `SHOW_NOTABLE_FIGURES` is `false` | See [Notable figures](#notable-figures-individualsjson) |
| Timeline doesn't move | It starts paused | Press play |
| Map background is gray or missing | OpenStreetMap is unreachable or slow | Check the connection; the loading overlay clears after 5 seconds regardless |
| Footprint is in the wrong place | Latitude and longitude are swapped | Use `[latitude, longitude]` |
| Opening `/network` directly returns a 404 | The host has no path fallback | See [Deployment](#deployment) |
| Blank page with 404s for files in `/assets/` | The app is in a sub-folder | See [Deployment](#deployment) |

## Known limitations

- **Phones and tablets**: The fixed 384-pixel sidebar covers the map at phone width, and the floating menu covers part of the sidebar. The timeline's year labels overlap at around 800 pixels wide.
- **Error handling**: There is no error boundary, so bad values in the data can blank a whole page.
- **Tests**: There are no automated tests or CI checks in this repository.
- **Map tiles**: The background uses OpenStreetMap's free tile service, which has [no availability guarantee](https://operations.osmfoundation.org/policies/tiles/). Keep its attribution visible.
- **License**: The repository has no license file, so agree on usage rights before reusing the code.
