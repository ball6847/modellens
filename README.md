# ModelLens

A fast, lightweight web application for browsing and searching Large Language Model (LLM) databases. The server holds the full dataset in memory and the client fetches only what it needs — no more shipping 1.8MB of JSON to the browser.

## Features

- **Instant search** — case-insensitive substring match across model name, ID, family, and provider
- **Sortable table** — click column headers to sort by provider, name, context window, or cost
- **Infinite scroll** — server-side pagination loads 100 models at a time via IntersectionObserver
- **Model detail dialog** — click any row to view full model specs (modalities, release date, knowledge cutoff, etc.)
- **Dark mode** — light/dark/system theme toggle with localStorage persistence
- **Auto-sync** — periodically re-fetches data from the remote source with ETag caching
- **Standalone binary** — `deno compile` produces a single `modellens` binary with embedded frontend

## Tech Stack

| Layer       | Technology                                   |
| ----------- | -------------------------------------------- |
| Server      | Deno 2, Hono (JSR), TypeScript               |
| Frontend    | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| UI Library  | shadcn-ui                                    |
| Data Source | [models.dev](https://models.dev/api.json)    |

## Getting Started

### Prerequisites

- [Deno](https://deno.land/) 2+
- Node.js 18+ (for frontend tooling)

### Install

```bash
# Install frontend dependencies
cd web && npm install
```

### Development

```bash
# Start both backend and frontend concurrently
deno task dev
```

Or run them separately:

```bash
# Terminal 1 — backend (port 3000)
deno task dev:api

# Terminal 2 — frontend (port 5173, proxies /api to backend)
deno task dev:web
```

Open http://localhost:5173 in your browser.

### Production Build

```bash
# Build frontend assets
cd web && npm run build

# Compile standalone binary
deno task build

# Run
./modellens
```

The production server serves the API at `/api/*` and the frontend at all other routes (SPA fallback).

## API

### List/Search Models

```
GET /api/models?query=&sort_by=&sort_dir=&offset=&limit=
```

| Parameter | Default | Description                                                         |
| --------- | ------- | ------------------------------------------------------------------- |
| query     |         | Case-insensitive substring search across name, ID, family, provider |
| sort_by   | name    | One of: `provider`, `name`, `context`, `input_cost`, `output_cost`  |
| sort_dir  | asc     | `asc` or `desc`                                                     |
| offset    | 0       | Pagination offset                                                   |
| limit     | 100     | Max 100 per request                                                 |

Response:

```json
{
  "models": [{ "provider_id": "...", "id": "...", "name": "...", ... }],
  "total": 4276
}
```

### Get Model Detail

```
GET /api/models/:provider_id/:model_id
GET /api/models/:provider_id/:namespace/:model_id
```

The second form handles model IDs that contain a slash (e.g., `ai21-labs/ai21-jamba-1.5-large`).

Response: a single model object with all fields.

## Configuration

| Environment Variable | Default                     | Description                                  |
| -------------------- | --------------------------- | -------------------------------------------- |
| `PORT`               | 3000                        | Server port                                  |
| `API_FILE`           | api.json                    | Local data file path                         |
| `API_REMOTE`         | https://models.dev/api.json | Remote data source URL                       |
| `SKIP_SYNC`          | false                       | Skip remote sync on startup                  |
| `SYNC_INTERVAL`      | 300                         | Auto-sync interval in seconds (0 = disabled) |

## How It Works

1. On startup, the server syncs `api.json` from the remote source (unless `SKIP_SYNC=true`), using ETag caching to skip unchanged downloads.
2. The JSON is parsed and flattened into an in-memory array of `Model` objects (each enriched with `provider_id`).
3. All search, sort, and pagination operations run against this in-memory array — no external database, no per-request file I/O.
4. If `SYNC_INTERVAL` is set, the server periodically re-syncs and hot-reloads the model data without restarting.
5. The React frontend fetches paginated batches via the REST API, with debounced search (300ms) and infinite scroll via `IntersectionObserver`.
6. In production, the compiled binary serves both the API and the static frontend (from `./web/dist/`).

## License

MIT
