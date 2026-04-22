# AGENTS.md

## Project Overview

**ModelLens** — A Go + Lit-Element web application for browsing and searching LLM model databases. A Go server loads `api.json` (~1.8MB, 4,274 models) into memory at startup and serves paginated REST API endpoints. The Lit-Element frontend fetches data on demand with infinite scroll.

**Tech Stack:**

- **Backend:** Go 1.26, Gin, Cobra (CLI), envconfig (env vars), zerolog (logging)
- **Frontend:** Lit-Element 3, TypeScript 5, Vite 6, Tailwind CSS 4
- **Version Manager:** asdf (see `.tool-versions`)

**Go Module:** `github.com/ball6847/modelsdb`

## Project Status

Greenfield — no source code exists yet. Implementation follows 11 ordered stories in `docs/stories/`. All stories currently have `status: "pending"`. See `docs/sprint-status.yaml` for the full plan.

## Directory Structure (Planned)

```
modelsdb/
├── cmd/server/main.go           # Go server entry point
├── internal/
│   ├── models/model.go          # Model, ModelPage, SortField structs
│   ├── data/appdata.go          # api.json loading + in-memory storage
│   └── api/handler.go           # Gin HTTP handlers
├── web/
│   ├── src/
│   │   ├── index.ts             # Frontend entry point
│   │   ├── model-lens-app.ts    # Root component
│   │   ├── model-search.ts      # Search box component
│   │   ├── model-table.ts       # Table component
│   │   ├── model-row.ts         # Table row component
│   │   ├── model-detail.ts      # Detail view component
│   │   ├── infinite-scroll.ts   # IntersectionObserver sentinel
│   │   ├── loading-spinner.ts   # Loading indicator
│   │   └── api.ts               # Fetch helpers
│   ├── styles/main.css          # Tailwind imports
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── api.json                     # Data source (4,274 models)
├── go.mod / go.sum
├── Makefile
├── .tool-versions               # asdf version file (golang 1.26.2)
├── PRD.md
├── AGENTS.md
└── docs/
    ├── tech-spec.md             # Full technical specification
    ├── sprint-status.yaml       # Story tracking
    ├── stories/                 # S001-S011 story files
    └── test-cases/              # 86 test cases across 11 stories
```

## Setup Commands

```bash
# Install Go version via asdf
asdf install

# Backend setup (S001)
go mod init github.com/ball6847/modelsdb
go get github.com/gin-gonic/gin@v1.10.1
go get github.com/kelseyhightower/envconfig@v1.4.0
go get github.com/rs/zerolog@v1.33.0
go get github.com/spf13/cobra@v1.9.1
go mod tidy

# Frontend setup (S001)
cd web && npm init -y
cd web && npm install lit@^3 typescript@^5 vite@^6 tailwindcss@^4 @tailwindcss/vite@^4 postcss@^8 autoprefixer@^10
```

## Development Workflow

```bash
# Start backend dev server
go run ./cmd/server

# Start frontend dev server (in separate terminal)
cd web && npm run dev
```

## Build Commands

```bash
# Backend production build
go build -o bin/server ./cmd/server

# Frontend production build
cd web && npm run build
```

## Testing Instructions

```bash
# Run all Go tests
go test ./...

# Run with coverage
go test -cover ./...

# Run specific test
go test -run TestName ./internal/...

# Frontend tests (Vitest)
cd web && npm test
```

**Test cases:** 86 total across 11 stories (37 P0, 34 P1, 7 P2, 1 P3). See `docs/test-cases/`.

## Code Style

### Go

- Follow `gofmt` formatting (run `gofmt -w .`)
- Use `strings.Contains` + `strings.ToLower` for search (no external search lib needed for 4,274 models)
- All non-required JSON fields use pointer types (`*string`, `*bool`, `*int`)
- Structured logging with zerolog JSON output
- Cobra for CLI command management (no Viper — use envconfig for env vars)

### TypeScript

- Strict mode enabled in `tsconfig.json`
- Lit-Element decorators: `@customElement`, `@property`
- Custom events dispatch pattern: `this.dispatchEvent(new CustomEvent('event-name', { detail: {...} }))`

### CSS

- Tailwind CSS v4 utility-first approach
- Use `@tailwindcss/vite` plugin for build integration

## API Endpoints

| Method | Path                                                   | Description            |
| ------ | ------------------------------------------------------ | ---------------------- |
| GET    | `/api/models?query=&sort_by=&sort_dir=&offset=&limit=` | Search/paginate models |
| GET    | `/api/models/:provider_id/:model_id`                   | Get model detail       |

## Key Constraints

- **No compile-time embedding** of `api.json` — load at runtime for easy data refresh
- **Server-side pagination** — 100 models per batch
- **Linear search** — sufficient for 4,274 models (microsecond completion)
- **No external DB** — all in-memory

## Pull Request Guidelines

- Run `gofmt -d .` to check formatting before committing
- Run `go test ./...` — all tests must pass
- Run `cd web && npm run build` — frontend must build cleanly
- Story status in `docs/sprint-status.yaml` should be updated

## Common Gotchas

- `api.json` must exist at project root for server startup — server calls `log.Fatal` if missing
- Gin uses `:provider_id` path param syntax (not `{provider_id}` like Go 1.22 ServeMux)
- Tailwind v4 uses `@tailwindcss/vite` plugin — no separate `postcss.config.js` needed
- envconfig reads from environment variables only — no `.env` file support
