# Product Requirements Document (PRD): ModelLens

## 1. Overview

| Field            | Description |
| ---------------- | ----------- |
| **Product Name** | ModelLens   |
| **Version**      | 1.0.0       |
| **Date**         | 2025-04-22  |
| **Status**       | Draft       |

**Product Description**: ModelLens is a lightweight, high-performance web-based
tool for browsing and searching Large Language Model (LLM) databases. It
addresses the performance and usability limitations of existing solutions (e.g.,
models.dev) by providing a fast, responsive interface backed by a Go server
with in-memory data and a Lit-Element frontend.

**One-Sentence Mission**: Deliver a blazing-fast, Go-powered model directory
where the server holds the full dataset in memory and the Lit-Element client
fetches only what it needs — no more shipping 1.8MB of JSON to the browser.

---

## 2. Problem Statement

Existing model database browsers (such as `models.dev`) suffer from significant
performance degradation when handling large datasets. With a database containing
**4,274+ models** across **115+ providers** and a JSON payload exceeding **1.8
MB**, users experience:

- **Slow initial page loads** due to heavy server-rendered HTML or unoptimized
  API calls.
- **Unresponsive search/filtering** when querying large datasets.
- **Browser lag** when rendering massive DOM trees.

ModelLens solves this with a **client-server architecture**: a Go server loads
the full `api.json` into memory at startup (no per-request I/O), and a
Lit-Element frontend fetches only the 100-model batch it needs via REST API
endpoints. The browser never downloads the full 1.8MB dataset.

---

## 3. Goals & Objectives

| Goal                         | Metric                                                                 | Priority |
| ---------------------------- | ---------------------------------------------------------------------- | -------- |
| **Instant Search**           | Search results (first 100 batch) returned from server in < 100ms       | P0       |
| **Smooth Scrolling**         | Infinite scroll loads 100 models seamlessly without frame drops        | P0       |
| **Fast Time-to-Interactive** | Full UI interactive within 3 seconds on a standard connection          | P1       |
| **Server In-Memory Data**    | api.json loaded into server memory at startup; no per-request file I/O | P1       |
| **Responsive Design**        | Fully usable on screens from 320px to 4K desktop                       | P1       |

---

## 4. Target Audience

- **AI/ML Engineers**: Evaluating models for integration based on capabilities
  and pricing.
- **Product Managers**: Comparing model providers and feature sets.
- **Researchers**: Browsing the latest model releases and their specifications.
- **Developers**: Quickly finding model IDs and configuration details.

---

## 5. Functional Requirements

### 5.1 Data Source & Ingestion

- **FR-DATA-01**: The application shall consume a JSON file conforming to the
  `models.dev` API schema.
- **FR-DATA-02**: The data structure is an object mapping `provider_id` (string)
  to a provider object.
- **FR-DATA-03**: Each provider contains a `models` array. Each model has the
  following fields:

```typescript
interface Model {
  id: string;
  name: string;
  family?: string;
  attachment?: boolean;
  reasoning?: boolean;
  tool_call?: boolean;
  temperature?: boolean;
  knowledge?: string;
  release_date?: string;
  last_updated?: string;
  modalities?: {
    input: string[];
    output: string[];
  };
  open_weights?: boolean;
  cost?: {
    input: number;
    output: number;
  };
  limit?: {
    context: number;
    output: number;
  };
}
```

- **FR-DATA-04**: On server startup, the JSON shall be loaded into server memory
  as a flat slice of `Model` structs enriched with `provider_id`, enabling
  efficient server-side queries.
- **FR-DATA-05**: The server shall expose the data via REST API endpoints;
  the client never fetches or parses `api.json` directly.

### 5.2 Search & Filter

- **FR-SEARCH-01**: A persistent search box shall be displayed at the top of the
  model table.
- **FR-SEARCH-02**: The search shall perform a case-insensitive substring match
  across:
  - `name` (Model Name)
  - `id` (Model ID)
  - `family` (Model Family)
  - Parent `provider_id` (Provider Name)
- **FR-SEARCH-03**: **Default state**: If the search box is empty, no filter is
  applied; all 4,274+ models are eligible for display.
- **FR-SEARCH-04**: **Debouncing**: Search shall execute only after the user
  stops typing for 150ms to avoid hammering the server with requests on every
  keystroke.
- **FR-SEARCH-05**: The total count of filtered results shall be displayed near
  the search box (e.g., "Showing 124 of 4,274 models") — returned by the server
  alongside each batch.

### 5.3 Results Table & Display

- **FR-TABLE-01**: Models shall be displayed in a clean, scannable table or grid
  layout.
- **FR-TABLE-02**: Required visible columns:
  | Column      | Description                                                       |
  | ----------- | ----------------------------------------------------------------- |
  | Provider    | `provider_id` (e.g., `anthropic`, `openai`)                       |
  | Name        | `name` (e.g., `Claude 3.5 Sonnet`)                                |
  | ID          | `id` (e.g., `claude-3-5-sonnet-20240620`)                         |
  | Context     | `limit.context` (formatted, e.g., `128K`)                         |
  | Input Cost  | `cost.input` (e.g., `$0.29`)                                      |
  | Output Cost | `cost.output` (e.g., `$2.86`)                                     |
  | Features    | Badges for `tool_call`, `reasoning`, `attachment`, `open_weights` |

- **FR-TABLE-03**: Clicking a row shall expand or navigate to a detail view
  showing all properties of the model (modality, release date, knowledge cutoff,
  etc.).
- **FR-TABLE-04**: The table header shall allow sorting by clicking column
  headers (Provider, Name, Context, Cost).

### 5.4 Infinite Scroll (Server-Side Pagination)

- **FR-SCROLL-01**: The results list shall use **infinite scroll** backed by
  server-side pagination.
- **FR-SCROLL-02**: Each request to the server shall return a batch of **100
  models** along with the total match count.
- **FR-SCROLL-03**: The client shall only render the models it has received; no
  virtual scrolling library is needed since the DOM never exceeds a few hundred
  nodes at a time.
- **FR-SCROLL-04**: As the user scrolls near the bottom of the currently
  rendered list, the client shall request the next batch (offset + 100) from
  the server via a REST API call.
- **FR-SCROLL-05**: If a search query changes, the scroll position shall reset
  to the top, and the client shall request the first 100 matching models from
  the server.
- **FR-SCROLL-06**: A loading indicator shall be shown while a batch request is
  in flight.

---

## 6. Non-Functional Requirements

### 6.1 Performance

- **NFR-PERF-01**: **Initial Load**: Time from navigation to first meaningful
  paint < 1.5s. The server already has data in memory, so the first batch
  returns instantly.
- **NFR-PERF-02**: **Server Startup**: Time to parse and index `api.json` into
  memory < 500ms on a modern CPU.
- **NFR-PERF-03**: **Search Latency**: Server-side search + filter + sort on
  4,274 in-memory models must complete in < 5ms. End-to-end (network round-trip
  included) < 100ms on localhost/same-region.
- **NFR-PERF-04**: **Scroll Performance**: Scrolling through the rendered list
  shall sustain 60fps since the DOM never exceeds ~200-300 nodes.
- **NFR-PERF-05**: **Server Memory**: The in-memory dataset + index shall
  consume < 50MB of server RAM.

### 6.2 Compatibility & Accessibility

- **NFR-COMP-01**: **Browser Support**: Chrome, Firefox, Safari, Edge (last 2
  major versions).
- **NFR-COMP-02**: **Mobile**: Touch-friendly table/grid with horizontal swipe
  if needed.
- **NFR-A11Y-01**: The search input shall have an accessible label
  (`aria-label`).
- **NFR-A11Y-02**: Table rows shall be navigable via keyboard (arrow keys /
  Tab).
- **NFR-A11Y-03**: Color contrast ratios shall meet WCAG AA standards.

---

## 7. UI/UX Specification

### 7.1 Layout Wireframe (ASCII)

```
+------------------------------------------------------------------+
|  [Logo] ModelLens                                          [?]   |
+------------------------------------------------------------------+
|                                                                    |
|  Search models...                                    4,274 models  |
|  [_________________________________________]      [v] Sort: Name   |
|                                                                    |
+------------------------------------------------------------------+
| Provider      | Name              | ID              | Ctx | ...  |
|---------------|-------------------|-----------------|-----|------|
| Anthropic     | Claude 3.5 Sonnet | claude-3-5-...  | 128K| ...  |  <-- Batch 1 (1-100)
| OpenAI        | GPT-4o            | gpt-4o          | 128K| ...  |
| ...           | ...               | ...             | ... | ...  |
|-------------------------------------------------------------------|
| Loading...                                                        |  <-- Trigger next batch
+------------------------------------------------------------------+
```

### 7.2 Interaction Flow

```
User Opens App
    |
    v
Browser loads index.html + Lit-Element bundle
    |
    v
Client fetches GET /api/models?offset=0&limit=100 -> First 100 models
    |
    v
User Types in Search Box
    |
    v
Debounce (150ms)
    |
    v
Client calls GET /api/models?query=gpt&offset=0&limit=100
    |
    v
Server queries in-memory data -> Returns { models: [...], total: N }
    |
    v
Client Resets Scroll to Top -> Renders First 100 Matches
    |
    v
User Scrolls Down
    |
    v
IntersectionObserver Triggers -> Client calls GET /api/models?query=gpt&offset=100&limit=100
    |
    v
Server returns next batch -> Client appends to list
```

### 7.3 State Definitions

| State       | Description                                                 |
| ----------- | ----------------------------------------------------------- |
| `idle`      | App loaded, no search query, showing top 100 models         |
| `searching` | User is typing (debounce active)                            |
| `fetching`  | API call in flight (search or next batch)                   |
| `filtered`  | Search applied, showing subset of models, scroll at top     |
| `empty`     | Search returned 0 results; show "No models found" message   |

---

## 8. Technical Architecture

### 8.1 Stack

| Layer              | Technology                                                    |
| ------------------ | ------------------------------------------------------------- |
| **Server**         | Go (net/http with Go 1.22+ ServeMux)                          |
| **Frontend**       | Lit-Element (TypeScript Web Components)                       |
| **CSS**            | Tailwind CSS                                                  |
| **Build Tool**     | `go build` + `npm` (Vite for frontend bundling)              |
| **Data Source**    | `api.json` loaded at server startup via runtime file read     |

### 8.2 Architecture Layers

```
+-----------------------------------+
|  Browser (Lit-Element)            |
|  - Web Components (custom elems)  |
|  - Search input (debounced)      |
|  - IntersectionObserver for scroll|
|  - fetch() API calls              |
+-----------------------------------+
           |  HTTP (REST JSON)
           v
+-----------------------------------+
|  Server (Go net/http)             |
|  - REST handlers (typed)          |
|  - In-memory []Model              |
|  - Search/sort/paginate logic     |
+-----------------------------------+
           |
           v
+-----------------------------------+
|  Data Layer                       |
|  - api.json (loaded once at      |
|    startup, kept in sync.Once)    |
+-----------------------------------+
```

### 8.3 REST API Endpoints

The client-server contract is defined via REST endpoints:

```
GET /api/models?query=&sort_by=name&sort_dir=asc&offset=0&limit=100
  -> { "models": [...], "total": 4274 }

GET /api/models/{provider_id}/{model_id}
  -> { "provider_id": "...", "id": "...", ... }
```

### 8.4 Server Data Lifecycle

```
Server Startup
    |
    v
Load api.json from file (os.ReadFile)
    |
    v
Parse JSON -> map[string]Provider (json.Unmarshal)
    |
    v
Flatten to []Model (iterate providers, inject provider_id)
    |
    v
Store in AppData struct (sync.Once for safe init)
    |
    v
Register HTTP handlers -> Server ready
```

### 8.5 Performance Strategy

1. **In-Memory Dataset**: The full ~4,274 models live in server RAM. No disk I/O
   on requests. With Go's efficient JSON parsing, startup is < 500ms.
2. **Server-Side Search**: Linear scan over 4,274 Go structs with
   `strings.Contains` is ~microseconds. No need for a complex inverted index for
   this dataset size — but one can be added later if the dataset grows.
3. **Small Payloads**: Each client request returns only 100 models (~15-20KB
   JSON), not the full 1.8MB.
4. **Client-Side Rendering**: Lit-Element renders efficiently with reactive
   properties, updating only what changes.
5. **Debounced Requests**: The client debounces search input at 150ms to avoid
   request flooding.
6. **No Virtual Scroll Needed**: The DOM only grows as the user scrolls, capped
   at a few hundred nodes since the user would need to scroll a long way to
   accumulate thousands.

---

## 9. Data Flow Summary

| Step  | Action      | Location         | Detail                                                                                    |
| ----- | ----------- | ---------------- | ----------------------------------------------------------------------------------------- |
| **1** | **Startup** | Server           | Load `api.json` from filesystem, parse into `[]Model`, store in `AppData`                 |
| **2** | **Load**    | Browser          | Fetch `index.html` + Lit-Element JS bundle                                                |
| **3** | **First**   | Browser → Server | Client calls `GET /api/models?offset=0&limit=100`                                         |
| **4** | **Return**  | Server → Browser | Server filters in-memory data, returns `{ models: [...], total: N }`                      |
| **5** | **Render**  | Browser          | Lit-Element renders the 100 models, updates count display                                |
| **6** | **Search**  | Browser → Server | Client calls `GET /api/models?query=gpt&offset=0&limit=100`                               |
| **7** | **Scroll**  | Browser → Server | IntersectionObserver triggers `GET /api/models?query=gpt&offset=100&limit=100` for next batch |

---

## 10. Acceptance Criteria (Definition of Done)

- [ ] **AC-01**: The application loads and displays the first 100 models within
      3 seconds.
- [ ] **AC-02**: Typing "gpt" in the search box calls the API and
      returns matching models (provider or model name contains "gpt",
      case-insensitive) within 100ms round-trip on localhost.
- [ ] **AC-03**: Searching "anthropic" returns only models under the `anthropic`
      provider, and the scroll resets to the top.
- [ ] **AC-04**: Scrolling to the bottom of the list automatically renders the
      next 100 models without a full page reload or blank screen.
- [ ] **AC-05**: The search box being empty shows all models, starting from the
      first 100.
- [ ] **AC-06**: The total number of matching models is always visible and
      updates in real time as the user types.
- [ ] **AC-07**: The application is fully interactive (search, scroll, sort) on
      a mobile device (iPhone SE viewport size).

---

## 11. Future Roadmap / Nice-to-Have

| Feature                | Description                                                                        | Priority |
| ---------------------- | ---------------------------------------------------------------------------------- | -------- |
| **Advanced Filters**   | Toggle filters for capabilities (e.g., only show models with `tool_call`).          | P2       |
| **Provider Page**      | Clicking a provider name navigates to a dedicated page showing all its models.    | P2       |
| **Pricing Calculator** | Built-in cost calculator based on input/output token count.                       | P3       |
| **Data Refresh**       | Server endpoint to re-fetch `api.json` at runtime without restart.                 | P3       |
| **Bookmarking**        | Allow users to bookmark/star favorite models for quick access (client-side only).  | P3       |
| **Comparison Mode**    | Select 2-3 models and view their specs side-by-side.                               | P3       |

---

## 12. Open Questions

1. ~~What technology stack to use?~~ **Resolved**:
   Go server + Lit-Element frontend + Tailwind CSS.
2. Is there a need for user accounts/persisted preferences (dark mode,
   bookmarks)?
3. Should we support importing custom `api.json` URLs, or only hardcoded to
   `models.dev/api.json`?
4. Are there specific providers or models that should be featured/pinned at the
   top?
5. Should `api.json` be embedded at compile time or read from filesystem at
   runtime? (Tradeoff: binary size vs. data refresh without redeploy)

---

_End of PRD_
