# AGENTS.md

## Project Overview

**ModelLens** — A Deno + Hono + React web application for browsing and searching LLM model databases. A Deno server loads `api.json` (~1.8MB, 4,276 models) into memory at startup and serves paginated REST API endpoints. The React frontend fetches data on demand with infinite scroll.

**Tech Stack:**

- **Backend:** Deno 2, Hono (JSR), TypeScript
- **Frontend:** React 19, TypeScript 5, Vite 8, Tailwind CSS 4, shadcn-ui
- **Version Manager:** asdf (see `.tool-versions`)

## Project Status

Implementation follows 11 ordered stories in `docs/stories/`. See `docs/sprint-status.yaml` for the full plan.

## Directory Structure

```
modelsdb/
├── server/
│   ├── main.ts              # Entry point - Hono server setup
│   ├── config.ts             # Env config (PORT, API_FILE, API_REMOTE, SKIP_SYNC)
│   ├── types/model.ts        # Model, Cost, ModelLimit, ModelPage, SortField types
│   ├── services/
│   │   ├── appData.ts        # Load, filter, sort, paginate, find models
│   │   └── sync.ts           # Remote sync with ETag caching
│   └── routes/
│       └── models.ts         # Hono route handlers for /api/models
├── web/
│   ├── src/
│   │   ├── api.ts            # Fetch helpers
│   │   ├── App.tsx           # Root React component
│   │   ├── components/       # shadcn-ui + custom components
│   │   └── ...
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── api.json                  # Data source (4,276 models)
├── deno.json                 # Deno config with tasks and imports
├── deno.lock                 # Deno lock file
├── .tool-versions            # asdf version file
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
# Start backend dev server
deno task dev

# Start frontend dev server (in separate terminal)
cd web && npm run dev
```

## Build Commands

```bash
# Backend production build (standalone binary)
deno task build

# Frontend production build
cd web && npm run build
```

## Testing Instructions

```bash
# Frontend tests (Vitest)
cd web && npm test
```

## Code Style

### TypeScript (Deno Server)

- Deno style: no semicolons, use `deno fmt`
- Import from JSR: `import { Hono } from "hono"` (mapped in deno.json)
- All optional JSON fields use optional types (`family?: string`)

### TypeScript (React Frontend)

- Strict mode enabled in `tsconfig.json`
- React 19 functional components with hooks
- shadcn-ui component library

### CSS

- Tailwind CSS v4 utility-first approach
- Use `@tailwindcss/vite` plugin for build integration

## API Endpoints

| Method | Path                                                    | Description            |
| ------ | ------------------------------------------------------- | ---------------------- |
| GET    | `/api/models?query=&sort_by=&sort_dir=&offset=&limit=`  | Search/paginate models |
| GET    | `/api/models/:provider_id/:model_id`                    | Get model detail       |
| GET    | `/api/models/:provider_id/:namespace/:model_id`         | Get model detail (namespaced IDs with slashes) |

## Environment Variables

| Variable    | Default                     | Description                          |
| ----------- | --------------------------- | ------------------------------------ |
| PORT        | 3000                        | Server port                          |
| API_FILE    | api.json                    | Local data file path                 |
| API_REMOTE  | https://models.dev/api.json | Remote data source URL               |
| SKIP_SYNC   | false                       | Skip remote sync on startup          |

## Key Constraints

- **No compile-time embedding** of `api.json` — load at runtime for easy data refresh
- **Server-side pagination** — 100 models per batch
- **Linear search** — sufficient for 4,276 models (microsecond completion)
- **No external DB** — all in-memory
- **Production build** — `deno compile` produces standalone `modellens` binary

## Pull Request Guidelines

- Run `deno fmt --check` and `deno lint` on server code
- Run `cd web && npm run build` — frontend must build cleanly
- Story status in `docs/sprint-status.yaml` should be updated

## Common Gotchas

- `api.json` must exist at project root for server startup — server errors if missing
- Some model IDs contain slashes (e.g., `ai21-labs/ai21-jamba-1.5-large`) — the detail endpoint supports both 2-segment and 3-segment paths
- Hono routes are mounted at `/api/models` — the sub-router handles `/` for list and `/:provider_id/:model_id` for detail
- Tailwind v4 uses `@tailwindcss/vite` plugin — no separate `postcss.config.js` needed
