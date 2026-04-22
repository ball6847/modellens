# Technical Specification: ModelLens

**Version:** 1.1\
**Date:** 2025-04-22\
**Project Level:** 1 (Small feature)\
**Based on:** PRD.md

---

## 1. Executive Summary

ModelLens is a Go + Lit-Element web application for browsing and searching LLM
model databases. A Go server loads the full `api.json` (~1.8MB, 4,274 models)
into memory at startup and serves paginated batches of 100 models via REST API
endpoints. The Lit-Element frontend fetches only what it needs. The browser
never downloads the full dataset.

### Key Technical Decisions

| Decision          | Choice                      | Rationale                                                    |
| ----------------- | --------------------------- | ------------------------------------------------------------ |
| Server Language    | Go                          | Fast startup, efficient concurrency, simple deployment      |
| HTTP Router        | Go net/http (1.22+ ServeMux)| Method/path pattern matching built-in, no external deps      |
| Frontend Framework | Lit-Element (TypeScript)    | Lightweight Web Components, fast rendering, no framework lock-in |
| Build Tool (BE)    | go build                    | Standard Go toolchain                                        |
| Build Tool (FE)    | Vite + npm                  | Fast HMR, TypeScript, Tailwind integration                  |
| Data Loading       | Runtime file read at startup| Allows data refresh without redeploy; binary stays small     |
| Client-Server API  | REST JSON endpoints          | Simple, standard, easy to debug                             |
| Pagination         | Server-side, 100 per batch  | Small payloads (~15-20KB), fast round-trips                 |
| Search             | Linear scan in-memory       | 4,274 structs with strings.Contains completes in microseconds|
| CSS                | Tailwind CSS                | Utility-first, fast iteration, Vite integration             |

---

## 2. System Architecture

### 2.1 High-Level Flow

```
┌──────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│ api.json         │────▶│ Server Startup     │────▶│ AppData          │
│ (1.8MB on disk)  │     │ Parse + Flatten    │     │ (in-memory)      │
└──────────────────┘     └───────────────────┘     └──────────────────┘
                                                             │
                                                   HTTP handlers          │
                                                             ▼
┌──────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│ Browser          │────▶│ REST API Endpoints │────▶│ Search/Sort/     │
│ Lit-Element      │     │ GET /api/models    │     │ Paginate data    │
│ IntersectionObs  │     │ GET /api/models/   │     │ in AppData       │
│ Debounced input  │     │  {provider}/{id}   │     │                  │
└──────────────────┘     └───────────────────┘     └──────────────────┘
```

### 2.2 Component Responsibilities

| Component                  | Responsibility                                              |
| -------------------------- | ----------------------------------------------------------- |
| `cmd/server/main.go`       | Entry point, loads data, registers handlers, starts server  |
| `internal/models/model.go` | Model, ModelPage, SortField structs (JSON marshal/unmarshal) |
| `internal/data/appdata.go` | Loads api.json, builds flat []Model, stores AppData         |
| `internal/api/handler.go`  | HTTP handlers for search and detail endpoints               |
| `model-lens-app.ts`        | Root Lit-Element component, manages state and orchestration |
| `model-search.ts`          | Search input with debounce, result count display            |
| `model-table.ts`           | Table rendering + column sort                               |
| `model-row.ts`             | Single table row                                            |
| `model-detail.ts`          | Expanded model detail view                                  |
| `infinite-scroll.ts`       | IntersectionObserver sentinel                               |
| `loading-spinner.ts`       | Loading indicator                                           |
| `api.ts`                   | Fetch helpers for REST API                                  |

---

## 3. Module Design

### 3.1 File Structure

```
modelsdb/
├── cmd/
│   └── server/
│       └── main.go            # Server entry point
├── internal/
│   ├── models/
│   │   └── model.go           # Model, ModelPage, SortField, SortDir
│   ├── data/
│   │   └── appdata.go         # AppData loading + storage
│   └── api/
│       └── handler.go         # HTTP handlers
├── web/
│   ├── index.html             # Main HTML page
│   ├── package.json           # npm deps (lit, typescript, vite, tailwindcss)
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── model-lens-app.ts   # Root <model-lens-app> component
│   │   ├── model-search.ts     # <model-search> component
│   │   ├── model-table.ts      # <model-table> component
│   │   ├── model-row.ts        # <model-row> component
│   │   ├── model-detail.ts     # <model-detail> component
│   │   ├── infinite-scroll.ts  # <infinite-scroll> component
│   │   ├── loading-spinner.ts  # <loading-spinner> component
│   │   └── api.ts              # Fetch helpers
│   └── styles/
│       └── main.css            # Tailwind imports + custom styles
├── api.json                    # Data source
├── go.mod
├── go.sum
├── Makefile                    # Build + dev commands
└── docs/
```

### 3.2 Core Data Structures

```go
type Model struct {
    ProviderID  string      `json:"provider_id"`
    ID          string      `json:"id"`
    Name        string      `json:"name"`
    Family      *string     `json:"family"`
    Attachment  *bool       `json:"attachment"`
    Reasoning   *bool       `json:"reasoning"`
    ToolCall    *bool       `json:"tool_call"`
    Temperature *bool       `json:"temperature"`
    Knowledge   *string     `json:"knowledge"`
    ReleaseDate *string     `json:"release_date"`
    LastUpdated *string     `json:"last_updated"`
    Modalities  *Modalities `json:"modalities"`
    OpenWeights *bool       `json:"open_weights"`
    Cost        *Cost       `json:"cost"`
    Limit       *ModelLimit `json:"limit"`
}

type Modalities struct {
    Input  []string `json:"input"`
    Output []string `json:"output"`
}

type Cost struct {
    Input  float64 `json:"input"`
    Output float64 `json:"output"`
}

type ModelLimit struct {
    Context int `json:"context"`
    Output  int `json:"output"`
}

type ModelPage struct {
    Models []Model `json:"models"`
    Total  int     `json:"total"`
}

type SortField string

const (
    SortProvider  SortField = "provider"
    SortName      SortField = "name"
    SortContext   SortField = "context"
    SortInputCost SortField = "input_cost"
    SortOutputCost SortField = "output_cost"
)

type SortDir string

const (
    SortAsc  SortDir = "asc"
    SortDesc SortDir = "desc"
)

type AppData struct {
    Models []Model
}
```

### 3.3 API Endpoint Signatures

```go
// GET /api/models?query=&sort_by=name&sort_dir=asc&offset=0&limit=100
func (h *Handler) SearchModels(w http.ResponseWriter, r *http.Request) {
    query := r.URL.Query().Get("query")
    sortBy := SortField(r.URL.Query().Get("sort_by"))
    sortDir := SortDir(r.URL.Query().Get("sort_dir"))
    offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
    limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

    if limit > 100 || limit <= 0 {
        limit = 100
    }

    filtered := h.appData.Filter(query)
    sorted := h.appData.Sort(filtered, sortBy, sortDir)
    total := len(sorted)
    page := paginate(sorted, offset, limit)

    json.NewEncoder(w).Encode(ModelPage{Models: page, Total: total})
}

// GET /api/models/{provider_id}/{model_id}
func (h *Handler) GetModelDetail(w http.ResponseWriter, r *http.Request) {
    providerID := r.PathValue("provider_id")
    modelID := r.PathValue("model_id")

    model, err := h.appData.Find(providerID, modelID)
    if err != nil {
        http.Error(w, "model not found", http.StatusNotFound)
        return
    }
    json.NewEncoder(w).Encode(model)
}
```

### 3.4 Client Components

#### Search Box

```typescript
@customElement('model-search')
export class ModelSearch extends LitElement {
  @property() query = '';
  @property() total = 0;
  @property() allCount = 0;

  // 150ms debounce on input
  // Dispatches 'search-changed' event with detail: { query }
  // Displays "Showing {total} of {allCount} models"
}
```

#### Model Table

```typescript
@customElement('model-table')
export class ModelTable extends LitElement {
  @property() models: Model[] = [];
  @property() sortBy: string = 'name';
  @property() sortDir: string = 'asc';

  // Columns: Provider, Name, ID, Context, Input Cost, Output Cost, Features
  // Context formatted: 128000 -> "128K"
  // Cost formatted: 0.29 -> "$0.29"
  // Features: badge pills for tool_call, reasoning, attachment, open_weights
  // Dispatches 'sort-changed' and 'row-clicked' events
}
```

#### Infinite Scroll Sentinel

```typescript
@customElement('infinite-scroll')
export class InfiniteScroll extends LitElement {
  @property() isFetching = false;
  @property() hasMore = true;

  // Renders a sentinel div at bottom
  // Uses IntersectionObserver on sentinel
  // When sentinel enters viewport AND !isFetching AND hasMore:
  //   dispatches 'load-more' event
  // Shows loading spinner while isFetching
}
```

---

## 4. Data Flow

### 4.1 Startup Sequence

```
Server Start
    |
    v
Load api.json from filesystem (os.ReadFile)
    |
    v
Parse JSON -> map[string]Provider (json.Unmarshal)
    |
    v
Flatten to []Model (iterate providers, push provider_id into each model)
    |
    v
Store in AppData struct
    |
    v
Register HTTP handlers on ServeMux
    |
    v
Start listening on :3000
```

### 4.2 Client Interaction Sequence

```
Browser loads index.html + Lit-Element bundle
    |
    v
Client fetches GET /api/models?offset=0&limit=100
    |
    ├── User types in search box
    |       |
    |       v 150ms debounce
    |       Client calls GET /api/models?query=xxx&offset=0&limit=100
    |       |
    |       v Server returns ModelPage JSON
    |       Client resets scroll, renders 100 matches
    |
    ├── User scrolls down
    |       |
    |       v IntersectionObserver triggers
    |       Client calls GET /api/models?query=xxx&offset=100&limit=100
    |       |
    |       v Server returns next batch
    |       Client appends to list
    |
    └── User clicks column header
            |
            v Toggle sort_dir, set sort_by
            Client calls GET /api/models?sort_by=xxx&sort_dir=asc&offset=0&limit=100
            |
            v Server returns sorted ModelPage
            Client resets scroll, renders sorted results
```

---

## 5. Data Formatting

### 5.1 Context Window Display

| Raw Value | Display |
| --------- | ------- |
| `128000`  | `128K`  |
| `1000000` | `1M`    |
| `8192`    | `8K`    |
| `32000`   | `32K`   |

Algorithm: if value >= 1,000,000, show `X.XM`; if >= 1,000, show `XK`; else show
as-is.

### 5.2 Cost Display

| Raw Value | Display |
| --------- | ------- |
| `0.29`    | `$0.29` |
| `2.86`    | `$2.86` |
| `0.0`     | `$0.00` |
| `None`    | `—`     |

### 5.3 Feature Badges

| Field          | Badge Color | Label       |
| -------------- | ----------- | ----------- |
| `tool_call`    | Blue        | `Tools`     |
| `reasoning`    | Purple      | `Reasoning` |
| `attachment`   | Green       | `Files`     |
| `open_weights` | Orange      | `Open`      |

---

## 6. Go Module Configuration

### 6.1 go.mod

```
module github.com/user/modelsdb

go 1.22
```

No external dependencies — uses only Go standard library (net/http, encoding/json, etc.)

### 6.2 package.json (Frontend)

```json
{
  "name": "modellens",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lit": "^3"
  },
  "devDependencies": {
    "typescript": "^5",
    "vite": "^6",
    "tailwindcss": "^4",
    "@tailwindcss/vite": "^4",
    "postcss": "^8",
    "autoprefixer": "^10"
  }
}
```

### 6.3 Build & Run

```bash
# Development (backend)
go run ./cmd/server

# Development (frontend)
cd web && npm run dev

# Production build (frontend)
cd web && npm run build

# Production build (backend, embeds web/dist)
go build -o bin/server ./cmd/server

# Run production server
./bin/server
```

---

## 7. Error Handling Strategy

| Scenario                 | Behavior                                    | HTTP Status |
| ------------------------ | ------------------------------------------- | ----------- |
| api.json not found       | Server log.Fatal at startup with clear msg  | N/A (crash) |
| Invalid JSON in api.json | Server log.Fatal at startup with parse err  | N/A (crash) |
| Empty search results     | Return `ModelPage { models: [], total: 0 }` | 200         |
| Model not found (detail) | Return JSON error                           | 404         |
| Invalid offset/limit     | Clamp offset, cap limit at 100              | 200         |
| API call failure         | Client shows error state, retry button      | N/A (client)|

### Startup Validation

- `api.json` must exist and be valid JSON — fail fast at startup
- Print model count on startup: `"Loaded 4,274 models from api.json"`

---

## 8. Dependencies

### Runtime (Server - Go)

| Package       | Purpose                     |
| ------------- | --------------------------- |
| net/http      | HTTP server + router        |
| encoding/json | JSON marshal/unmarshal      |
| os            | File reading                |
| fmt           | Formatting + logging        |
| strings       | Search (Contains, ToLower)  |
| sort          | Slice sorting               |
| strconv       | Query param parsing         |
| log           | Startup logging             |

### Frontend (npm)

| Package    | Version | Purpose                           |
| ---------- | ------- | --------------------------------- |
| lit        | ^3      | Web Components framework          |
| typescript | ^5      | Type checking                     |
| vite       | ^6      | Build tool + dev server           |
| tailwindcss| ^4      | Utility CSS framework             |

---

## 9. Testing Strategy

### 9.1 Test Categories

| Category    | Approach            | Coverage                               |
| ----------- | ------------------- | -------------------------------------- |
| Unit (Go)   | go test             | Data loading, search, sort, formatting |
| Unit (TS)   | Vitest / web-test-runner | Component rendering, formatting      |
| Integration | HTTP test (net/http/httptest) | API endpoints             |

### 9.2 Unit Test Cases

**Data Loading:**

- Parse api.json successfully
- Flattened slice contains all models from all providers
- Each model has correct provider_id
- Startup fails with clear message if file missing

**Search:**

- Empty query returns all models
- Case-insensitive match on name, id, family, provider_id
- Substring match ("gpt" matches "gpt-4o" and "GPT-4")
- Query "anthropic" returns only anthropic models
- No matches returns empty slice with total: 0

**Sort:**

- Sort by Name ascending/descending
- Sort by Context (numeric) ascending/descending
- Sort by InputCost (handles nil values — sorted to end)
- Sort by Provider ascending

**Formatting:**

- 128000 -> "128K"
- 1000000 -> "1M"
- Cost nil -> "—"
- Cost 0.29 -> "$0.29"

### 9.3 Server Handler Test Example

```go
func TestSearchModels(t *testing.T) {
    data := testAppData()
    handler := NewHandler(data)

    req := httptest.NewRequest("GET", "/api/models?query=claude&offset=0&limit=100", nil)
    w := httptest.NewRecorder()
    handler.SearchModels(w, req)

    var page ModelPage
    json.NewDecoder(w.Body).Decode(&page)

    if page.Total == 0 {
        t.Error("expected results for 'claude'")
    }
}
```

---

## 10. Risks & Mitigations

| Risk                          | Impact | Likelihood | Mitigation                                             |
| ----------------------------- | ------ | ---------- | ------------------------------------------------------ |
| Go ServeMux pattern matching  | Low    | Low        | Go 1.22+ supports path params natively                 |
| Lit-Element bundle size       | Medium | Low        | Lit is ~5KB gzipped, very small                       |
| CORS in dev (different ports) | Medium | High       | Vite proxy config or Go server CORS middleware         |
| IntersectionObserver compat   | Low    | Low        | Use IntersectionObserver polyfill or scroll fallback   |
| api.json schema changes       | Medium | Low        | Use pointer types for all non-required fields          |
| Search performance at 10K+    | Low    | Low        | Linear scan sufficient up to ~50K; add index later     |
| Tailwind CSS build config     | Low    | Medium     | Use Vite plugin for Tailwind v4                        |

---

## 11. Success Criteria Verification

| Criteria                            | Verification Method                        |
| ----------------------------------- | ------------------------------------------ |
| First 100 models render in <3s      | Manual timing, Lighthouse audit            |
| Search "gpt" returns results <100ms | Browser devtools network tab               |
| Scroll loads next batch seamlessly  | Visual test, no blank screen               |
| Total count updates on search       | UI assertion: count matches server total   |
| Sort by column changes order        | Visual: first row changes after click      |
| Model detail shows all fields       | Click row, verify all fields displayed     |
| Mobile viewport usable              | Chrome DevTools responsive mode, iPhone SE |
| Server memory <50MB                 | Check RSS after startup                    |
| Server startup <500ms               | Timing log on startup                      |

---

## 12. Out of Scope Confirmation

| Feature                   | Status | Rationale                       |
| ------------------------- | ------ | ------------------------------- |
| Advanced filters          | ❌ Out | PRD P2, future roadmap          |
| Provider page             | ❌ Out | PRD P2, future roadmap          |
| Pricing calculator        | ❌ Out | PRD P3, future roadmap          |
| Data refresh endpoint     | ❌ Out | PRD P3, future roadmap          |
| Bookmarking               | ❌ Out | PRD P3, future roadmap          |
| Comparison mode           | ❌ Out | PRD P3, future roadmap          |
| User accounts             | ❌ Out | PRD open question, deferred     |
| Custom api.json URL       | ❌ Out | PRD open question, deferred     |
| compile-time embedding    | ❌ Out | Deferred to future optimization |

---

## 13. Implementation Order

1. **Project Scaffolding** — go mod init, npm init, Vite + Lit setup, Go server
2. **Data Layer** — `AppData`, `Model` structs, JSON loading, flatten into
   `[]Model`
3. **Server API** — HTTP handlers for search and detail endpoints
4. **Root Shell** — `model-lens-app.ts`, layout with header + search + table
5. **Search Box** — `model-search.ts`, debounced input, result count display
6. **Model Table** — `model-table.ts`, column headers, row rendering, sort
7. **Infinite Scroll** — `infinite-scroll.ts`, IntersectionObserver sentinel,
   batch loading
8. **Model Detail** — `model-detail.ts`, expand row or navigate to detail
9. **Styling** — Tailwind CSS, responsive layout, badge pills, loading states
10. **Testing** — go test for data/search/sort, httptest for API endpoints
11. **Polish** — Error states, empty state, mobile responsiveness, a11y

---

**Document Status:** Ready for Implementation\
**Next Step:** Create sprint plan and stories
