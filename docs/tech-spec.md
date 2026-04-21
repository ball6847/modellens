# Technical Specification: ModelLens

**Version:** 1.0\
**Date:** 2025-04-22\
**Project Level:** 1 (Small feature)\
**Based on:** PRD.md

---

## 1. Executive Summary

ModelLens is a Rust full-stack web application for browsing and searching LLM
model databases. A Leptos 0.7+ WASM client communicates with an Axum server via
typed server functions. The server loads the full `api.json` (~1.8MB, 4,274
models) into memory at startup and serves paginated batches of 100 models. The
browser never downloads the full dataset.

### Key Technical Decisions

| Decision          | Choice                       | Rationale                                                          |
| ----------------- | ---------------------------- | ------------------------------------------------------------------ |
| Framework         | Leptos 0.7+ full-stack       | SSR + WASM hydration from a single Rust codebase                   |
| Server Runtime    | Axum (Leptos default)        | High-performance async runtime, Leptos integration                 |
| Build Tool        | cargo-leptos                 | Official Leptos build tool for SSR + WASM                          |
| Data Loading      | Runtime file read at startup | Allows data refresh without redeploy; binary stays small           |
| Client-Server API | Leptos `#[server]` functions | Type-safe, no REST boilerplate, automatic serialization            |
| Pagination        | Server-side, 100 per batch   | Small payloads (~15-20KB), fast round-trips                        |
| Search            | Linear scan in-memory        | 4,274 structs with `str::contains` completes in microseconds       |
| CSS               | Tailwind CSS                 | Utility-first, fast iteration, Leptos integration via cargo-leptos |

---

## 2. System Architecture

### 2.1 High-Level Flow

```
┌──────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│ api.json         │────▶│ Server Startup     │────▶│ Arc<AppData>     │
│ (1.8MB on disk)  │     │ Parse + Index      │     │ (in-memory)      │
└──────────────────┘     └───────────────────┘     └──────────────────┘
                                                            │
                                  provide_context()         │
                                                            ▼
┌──────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│ Browser (WASM)   │────▶│ Server Functions   │────▶│ Search/Sort/     │
│ Leptos reactive  │     │ #[server]          │     │ Paginate data   │
│ IntersectionObs  │     │ search_models()    │     │ in AppData       │
│ Debounced input  │     │ get_model_detail() │     │                  │
└──────────────────┘     └───────────────────┘     └──────────────────┘
```

### 2.2 Component Responsibilities

| Component            | Responsibility                                              |
| -------------------- | ----------------------------------------------------------- |
| `app.rs`             | Root component, provides AppData context, routes            |
| `app_data.rs`        | Loads api.json, builds flat Vec<Model>, stores in Arc       |
| `models.rs`          | Model structs (Serialize/Deserialize/Clone)                 |
| `search_models`      | Server function: filter, sort, paginate, return ModelPage   |
| `get_model_detail`   | Server function: return single model by provider + id       |
| `model_table.rs`     | Client component: renders table, handles sort clicks        |
| `search_box.rs`      | Client component: debounced search input, result count      |
| `infinite_scroll.rs` | Client component: IntersectionObserver, triggers next batch |
| `model_detail.rs`    | Client component: expanded row or page for single model     |

---

## 3. Module Design

### 3.1 File Structure

```
modelsdb/
├── Cargo.toml                  # Workspace config (leptos deps)
├── style/
│   └── main.scss               # Tailwind imports + custom styles
├── src/
│   ├── app.rs                  # Root component, shell layout
│   ├── app_data.rs             # Data loading + AppData struct
│   ├── models.rs               # Model, ModelPage, SortField, SortDir
│   ├── server_fns.rs           # #[server] functions
│   ├── components/
│   │   ├── mod.rs
│   │   ├── search_box.rs       # Search input with debounce
│   │   ├── model_table.rs      # Table rendering + column sort
│   │   ├── model_row.rs        # Single table row
│   │   ├── model_detail.rs     # Expanded model detail view
│   │   ├── infinite_scroll.rs  # IntersectionObserver sentinel
│   │   └── loading.rs          # Loading spinner
│   ├── lib.rs                  # Re-exports
│   └── main.rs                 # Server entry point
├── api.json                    # Data source (gitignored or bundled)
├── bmad/
│   └── config.yaml
├── docs/
│   ├── bmm-workflow-status.yaml
│   ├── PRD.md
│   ├── tech-spec.md
│   └── stories/
└── .cargo/
    └── config.toml              # cargo-leptos target config
```

### 3.2 Core Data Structures

```rust
#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Model {
    pub provider_id: String,
    pub id: String,
    pub name: String,
    pub family: Option<String>,
    pub attachment: Option<bool>,
    pub reasoning: Option<bool>,
    pub tool_call: Option<bool>,
    pub temperature: Option<bool>,
    pub knowledge: Option<String>,
    pub release_date: Option<String>,
    pub last_updated: Option<String>,
    pub modalities: Option<Modalities>,
    pub open_weights: Option<bool>,
    pub cost: Option<Cost>,
    pub limit: Option<ModelLimit>,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Modalities {
    pub input: Vec<String>,
    pub output: Vec<String>,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Cost {
    pub input: f64,
    pub output: f64,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct ModelLimit {
    pub context: u64,
    pub output: u64,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct ModelPage {
    pub models: Vec<Model>,
    pub total: usize,
}

#[derive(Clone, Serialize, Deserialize, Debug, PartialEq)]
pub enum SortField {
    Provider,
    Name,
    Context,
    InputCost,
    OutputCost,
}

#[derive(Clone, Serialize, Deserialize, Debug, PartialEq)]
pub enum SortDir {
    Asc,
    Desc,
}

#[derive(Clone, Debug)]
pub struct AppData {
    pub models: Vec<Model>,
}
```

### 3.3 Server Function Signatures

```rust
#[server]
pub async fn search_models(
    query: Option<String>,
    sort_by: SortField,
    sort_dir: SortDir,
    offset: usize,
    limit: usize,
) -> Result<ModelPage, ServerFnError> {
    let app_data = expect_context::<Arc<AppData>>();
    let models = &app_data.models;

    let filtered: Vec<&Model> = match query {
        None | Some(ref q) if q.trim().is_empty() => models.iter().collect(),
        Some(q) => {
            let q_lower = q.to_lowercase();
            models.iter()
                .filter(|m| {
                    m.name.to_lowercase().contains(&q_lower)
                        || m.id.to_lowercase().contains(&q_lower)
                        || m.family.as_ref().map_or(false, |f| f.to_lowercase().contains(&q_lower))
                        || m.provider_id.to_lowercase().contains(&q_lower)
                })
                .collect()
        }
    };

    let total = filtered.len();
    let sorted = sort_models(&filtered, &sort_by, &sort_dir);
    let page: Vec<Model> = sorted.into_iter()
        .skip(offset)
        .take(limit)
        .cloned()
        .collect();

    Ok(ModelPage { models: page, total })
}

#[server]
pub async fn get_model_detail(
    provider_id: String,
    model_id: String,
) -> Result<Model, ServerFnError> {
    let app_data = expect_context::<Arc<AppData>>();
    app_data.models.iter()
        .find(|m| m.provider_id == provider_id && m.id == model_id)
        .cloned()
        .ok_or_else(|| ServerFnError::new("Model not found"))
}
```

### 3.4 Client Components

#### Search Box

```rust
#[component]
fn SearchBox(
    query: Signal<Option<String>>,
    set_query: WriteSignal<Option<String>>,
    total: Signal<usize>,
    all_count: usize,
) -> impl IntoView {
    // 150ms debounce via leptos::watch or setTimeout
    // Displays "Showing {total} of {all_count} models"
}
```

#### Model Table

```rust
#[component]
fn ModelTable(
    models: Signal<Vec<Model>>,
    sort_by: Signal<SortField>,
    sort_dir: Signal<SortDir>,
    on_sort: Callback<(SortField, SortDir)>,
    on_row_click: Callback<(String, String)>,
) -> impl IntoView {
    // Columns: Provider, Name, ID, Context, Input Cost, Output Cost, Features
    // Context formatted: 128000 -> "128K"
    // Cost formatted: 0.29 -> "$0.29"
    // Features: badge pills for tool_call, reasoning, attachment, open_weights
}
```

#### Infinite Scroll Sentinel

```rust
#[component]
fn InfiniteScroll(
    on_load_more: Callback<()>,
    is_fetching: Signal<bool>,
) -> impl IntoView {
    // Renders a sentinel div at the bottom of the list
    // Uses IntersectionObserver (via wasm-bindgen or leptos-use)
    // When sentinel enters viewport, calls on_load_more
    // Shows loading indicator while is_fetching is true
}
```

---

## 4. Data Flow

### 4.1 Startup Sequence

```
Server Start
    │
    ▼
Load api.json from filesystem (std::fs::read_to_string)
    │
    ▼
Parse JSON -> HashMap<String, Provider> (serde_json::from_str)
    │
    ▼
Flatten to Vec<Model> (iterate providers, push provider_id into each model)
    │
    ▼
Wrap in Arc<AppData> -> provide_context()
    │
    ▼
Leptos SSR: render first 100 models as HTML
    │
    ▼
Send to browser + WASM bundle
```

### 4.2 Client Interaction Sequence

```
Browser receives SSR HTML
    │
    ▼
WASM Hydrates -> Search box becomes interactive
    │
    ├── User types in search box
    │       │
    │       ▼ 150ms debounce
    │       Client calls search_models(query, sort, 0, 100)
    │       │
    │       ▼ Server returns ModelPage
    │       Client resets scroll, renders 100 matches
    │
    ├── User scrolls down
    │       │
    │       ▼ IntersectionObserver triggers
    │       Client calls search_models(query, sort, offset+=100, 100)
    │       │
    │       ▼ Server returns next batch
    │       Client appends to list
    │
    └── User clicks column header
            │
            ▼ Toggle sort_dir, set sort_by
            Client calls search_models(query, new_sort, 0, 100)
            │
            ▼ Server returns sorted ModelPage
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

Algorithm: if value >= 1_000_000, show `X.XM`; if >= 1_000, show `XK`; else show
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

## 6. Leptos Configuration

### 6.1 Cargo.toml (Key Dependencies)

```toml
[dependencies]
leptos = { version = "0.7", features = ["ssr"] }
leptos_meta = "0.7"
leptos_axum = "0.7"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
axum = "0.8"
tokio = { version = "1", features = ["full"] }

[features]
default = []
ssr = ["leptos/ssr", "leptos_axum", "dep:axum", "dep:tokio"]
hydrate = ["leptos/hydrate"]
```

### 6.2 Build & Run

```bash
# Install cargo-leptos (if not installed)
cargo install cargo-leptos

# Development (hot-reload)
cargo leptos watch

# Production build
cargo leptos build --release

# Run production server
cargo leptos serve --release
```

---

## 7. Error Handling Strategy

| Scenario                 | Behavior                                    | HTTP Status |
| ------------------------ | ------------------------------------------- | ----------- |
| api.json not found       | Server panic at startup with clear message  | N/A (crash) |
| Invalid JSON in api.json | Server panic at startup with parse error    | N/A (crash) |
| Empty search results     | Return `ModelPage { models: [], total: 0 }` | 200         |
| Model not found (detail) | Return `Err(ServerFnError)`                 | 500         |
| Invalid offset/limit     | Clamp offset, cap limit at 100              | 200         |
| Server function failure  | Client shows error state, retry button      | 500         |

### Startup Validation

- `api.json` must exist and be valid JSON — fail fast at startup
- Print model count on startup: `"Loaded 4,274 models from api.json"`

---

## 8. Dependencies

### Runtime (Server)

| Crate       | Version | Purpose                          |
| ----------- | ------- | -------------------------------- |
| leptos      | 0.7     | Full-stack reactive framework    |
| leptos_meta | 0.7     | `<Title/>`, `<Meta/>` components |
| leptos_axum | 0.7     | Axum integration for Leptos      |
| axum        | 0.8     | HTTP server                      |
| tokio       | 1       | Async runtime                    |
| serde       | 1       | Serialization/deserialization    |
| serde_json  | 1       | JSON parsing                     |

### Client-Only (WASM)

| Crate      | Version | Purpose                                        |
| ---------- | ------- | ---------------------------------------------- |
| leptos-use | 0.15    | `use_debounce_fn`, `use_intersection_observer` |

### Build

| Tool         | Purpose                   |
| ------------ | ------------------------- |
| cargo-leptos | Build tool for SSR + WASM |
| tailwindcss  | Utility CSS framework     |

---

## 9. Testing Strategy

### 9.1 Test Categories

| Category    | Approach            | Coverage                               |
| ----------- | ------------------- | -------------------------------------- |
| Unit        | Rust #[test]        | Data loading, search, sort, formatting |
| Server Fn   | Leptos server tests | search_models, get_model_detail        |
| Integration | wasm-pack test      | Component rendering, signal reactivity |

### 9.2 Unit Test Cases

**Data Loading:**

- Parse api.json successfully
- Flattened Vec contains all models from all providers
- Each model has correct provider_id
- Startup fails with clear message if file missing

**Search:**

- Empty query returns all models
- Case-insensitive match on name, id, family, provider_id
- Substring match ("gpt" matches "gpt-4o" and "GPT-4")
- Query "anthropic" returns only anthropic models
- No matches returns empty Vec with total: 0

**Sort:**

- Sort by Name ascending/descending
- Sort by Context (numeric) ascending/descending
- Sort by InputCost (handles None values — sorted to end)
- Sort by Provider ascending

**Formatting:**

- 128000 -> "128K"
- 1000000 -> "1M"
- Cost None -> "—"
- Cost 0.29 -> "$0.29"

### 9.3 Server Function Test Example

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_search_by_name() {
        let data = test_app_data();
        let result = search_in_memory(&data, Some("claude".into()), SortField::Name, SortDir::Asc, 0, 100);
        assert!(result.total > 0);
        assert!(result.models[0].name.to_lowercase().contains("claude"));
    }

    #[test]
    fn test_pagination_offset() {
        let data = test_app_data();
        let page0 = search_in_memory(&data, None, SortField::Name, SortDir::Asc, 0, 100);
        let page1 = search_in_memory(&data, None, SortField::Name, SortDir::Asc, 100, 100);
        assert_ne!(page0.models[0].id, page1.models[0].id);
    }
}
```

---

## 10. Risks & Mitigations

| Risk                        | Impact | Likelihood | Mitigation                                             |
| --------------------------- | ------ | ---------- | ------------------------------------------------------ |
| Leptos 0.7 API instability  | High   | Low        | Pin exact version, check changelog before upgrading    |
| cargo-leptos tool issues    | Medium | Medium     | Use latest stable, fallback to manual build            |
| WASM bundle size            | Medium | Low        | Monitor with `cargo leptos build`, use tree-shaking    |
| IntersectionObserver compat | Low    | Low        | Use leptos-use abstraction, fallback to scroll event   |
| api.json schema changes     | Medium | Low        | Deserialize with Option<T> for all non-required fields |
| Search performance at 10K+  | Low    | Low        | Linear scan sufficient up to ~50K; add index later     |
| Tailwind CSS build config   | Low    | Medium     | Follow cargo-leptos tailwind guide                     |

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
| Server memory <50MB                 | `ps aux` or `/proc` check after startup    |
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
| compile-time include_str! | ❌ Out | Deferred to future optimization |

---

## 13. Implementation Order

1. **Project Scaffolding** — `cargo leptos new`, Cargo.toml deps, file structure
2. **Data Layer** — `app_data.rs`, `models.rs`, JSON loading, flatten into
   Vec<Model>
3. **Server Functions** — `search_models()`, `get_model_detail()`, wire up
   AppData context
4. **Root Shell** — `app.rs`, layout with header + search box area + table area
5. **Search Box** — `search_box.rs`, debounced input, result count display
6. **Model Table** — `model_table.rs`, column headers, row rendering, sort
   interaction
7. **Infinite Scroll** — `infinite_scroll.rs`, IntersectionObserver sentinel,
   batch loading
8. **Model Detail** — `model_detail.rs`, expand row or navigate to detail
9. **Styling** — Tailwind CSS, responsive layout, badge pills, loading states
10. **Testing** — Unit tests for data/search/sort, integration tests for server
    functions
11. **Polish** — Error states, empty state, mobile responsiveness, a11y

---

**Document Status:** Ready for Implementation\
**Next Step:** Create sprint plan and stories (`/sprint-planning`)
