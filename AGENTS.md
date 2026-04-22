# AGENTS.md

## Project Overview

**ModelLens** — A Deno + Hono + React web application for browsing and searching LLM model databases. A Deno server loads `api.json` (~1.8MB, 4,276 models) into memory at startup and serves paginated REST API endpoints. The React frontend fetches data on demand with infinite scroll.

**Tech Stack:**

- **Backend:** Deno 2, Hono (JSR), TypeScript
- **Frontend:** React 19, TypeScript 5, Vite 8, Tailwind CSS 4, shadcn-ui
- **Version Manager:** asdf (see `.tool-versions`)

## Project Status

All 11 stories are complete. See `docs/sprint-status.yaml` for details.

## Directory Structure

```
modelsdb/
├── server/
│   ├── main.ts              # Entry point - Hono server, CORS, logger, static serving, SPA fallback
│   ├── config.ts             # Env config (PORT, API_FILE, API_REMOTE, SKIP_SYNC, SYNC_INTERVAL)
│   ├── types/model.ts        # Model, Modalities, Cost, ModelLimit, ModelPage, SortField, SortDir types
│   ├── services/
│   │   ├── app-data.ts       # AppData class, load, filter, sort, find, paginate, buildPage
│   │   └── sync.ts           # Remote sync with ETag caching
│   └── routes/
│       └── models.ts         # Hono route handlers for /api/models
├── web/
│   ├── src/
│   │   ├── main.tsx           # React entry point
│   │   ├── App.tsx            # Root component - search, table, infinite scroll, detail dialog
│   │   ├── api.ts             # Fetch helpers (fetchModels, fetchModelDetail)
│   │   ├── index.css          # Tailwind v4 + shadcn theme (light/dark CSS variables)
│   │   ├── components/
│   │   │   ├── search-box.tsx       # Debounced search input with result count
│   │   │   ├── model-table.tsx      # Sortable model table with feature badges
│   │   │   ├── model-detail.tsx     # Dialog showing full model properties
│   │   │   ├── theme-toggle.tsx     # Light/dark/system theme dropdown
│   │   │   └── ui/                  # shadcn-ui primitives (badge, button, card, dialog, dropdown-menu, input, separator, table)
│   │   ├── hooks/
│   │   │   └── use-theme.ts         # Theme state with localStorage persistence
│   │   ├── lib/
│   │   │   ├── utils.ts             # cn() helper (clsx + tailwind-merge)
│   │   │   └── formatters.ts        # formatContext, formatCost, getModelFeatures
│   │   └── assets/                  # Static assets (hero.png, SVGs)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts               # React + Tailwind v4 plugin, /api proxy to localhost:3000
│   └── tsconfig.json
├── api.json                  # Data source (~4,276 models)
├── api.json.etag             # Cached ETag for sync
├── deno.json                 # Deno config with tasks and imports
├── deno.lock                 # Deno lock file
├── .tool-versions            # asdf version file
├── .gitignore
├── PRD.md
├── AGENTS.md
└── docs/
    ├── tech-spec.md
    ├── sprint-status.yaml
    ├── stories/
    └── test-cases/
```

## Setup Commands

```bash
# Install runtime versions via asdf
asdf install

# Frontend setup
cd web && npm install
```

## Development Workflow

```bash
# Start both backend and frontend (concurrently)
deno task dev

# Or start separately:
# Backend dev server
deno task dev:api

# Frontend dev server (in separate terminal)
deno task dev:web
```

The Vite dev server proxies `/api` requests to `http://localhost:3000` automatically.

## Build Commands

```bash
# Backend production build (standalone binary named "modellens")
deno task build

# Frontend production build
cd web && npm run build

# Serve production build (requires frontend build first)
./modellens
```

The production server serves the frontend from `./web/dist/` with SPA fallback (all non-API routes return `index.html`).

## Testing Instructions

```bash
# Frontend lint
cd web && npm run lint

# Frontend build check (type-check + bundle)
cd web && npm run build
```

No test framework is currently configured. The `npm test` script is not set up in `package.json`.

## Code Style

### TypeScript (Deno Server)

- Deno style: no semicolons, use `deno fmt`
- Import from JSR: `import { Hono } from "hono"` (mapped in deno.json)
- All optional JSON fields use optional types (`family?: string`)

### TypeScript (React Frontend)

- Strict mode enabled in `tsconfig.json`
- React 19 functional components with hooks
- shadcn-ui component library (ui/ subdirectory)
- Path alias: `@/*` maps to `./src/*` (configured in both `tsconfig.json` and `vite.config.ts`)
- Theme support: light/dark/system via `useTheme` hook with `localStorage` persistence

### CSS

- Tailwind CSS v4 utility-first approach
- Use `@tailwindcss/vite` plugin for build integration
- shadcn-ui theme variables defined in `index.css` using oklch color space
- Dark mode via `.dark` class on `<html>` element (not media query)

## API Endpoints

| Method | Path                                                   | Description                                    |
| ------ | ------------------------------------------------------ | ---------------------------------------------- |
| GET    | `/api/models?query=&sort_by=&sort_dir=&offset=&limit=` | Search/paginate models                         |
| GET    | `/api/models/:provider_id/:model_id`                   | Get model detail                               |
| GET    | `/api/models/:provider_id/:namespace/:model_id`        | Get model detail (namespaced IDs with slashes) |

## Environment Variables

| Variable      | Default                     | Description                                  |
| ------------- | --------------------------- | -------------------------------------------- |
| PORT          | 3000                        | Server port                                  |
| API_FILE      | api.json                    | Local data file path                         |
| API_REMOTE    | https://models.dev/api.json | Remote data source URL                       |
| SKIP_SYNC     | false                       | Skip remote sync on startup                  |
| SYNC_INTERVAL | 300                         | Auto-sync interval in seconds (0 = disabled) |

## Key Constraints

- **No compile-time embedding** of `api.json` — load at runtime for easy data refresh
- **Server-side pagination** — 100 models per batch
- **Linear search** — sufficient for 4,276 models (microsecond completion)
- **No external DB** — all in-memory
- **Production build** — `deno compile` produces standalone `modellens` binary
- **Auto-sync** — periodic background sync with ETag caching (configurable via `SYNC_INTERVAL`)
- **SPA serving** — production server serves frontend from `./web/dist/` with fallback to `index.html`

## Pull Request Guidelines

- Run `deno fmt --check` and `deno lint` on server code
- Run `cd web && npm run build` — frontend must build cleanly
- Run `cd web && npm run lint` — no ESLint errors
- Story status in `docs/sprint-status.yaml` should be updated

## Common Gotchas

- `api.json` must exist at project root for server startup — server errors if missing
- Some model IDs contain slashes (e.g., `ai21-labs/ai21-jamba-1.5-large`) — the detail endpoint supports both 2-segment and 3-segment paths
- Hono routes are mounted at `/api/models` — the sub-router handles `/` for list and `/:provider_id/:model_id` for detail
- Tailwind v4 uses `@tailwindcss/vite` plugin — no separate `postcss.config.js` needed
- Search debounce is 300ms (not 150ms as stated in PRD — PRD was written before implementation)
- The Vite dev server proxies `/api` to `localhost:3000` — both servers must run for full-stack dev
- `deno task dev` starts both backend and frontend concurrently via backgrounded processes
- `.tool-versions` currently only lists `golang` — Deno version is not pinned via asdf
- The `AppData.replace()` method allows hot-reloading models without server restart when sync runs
