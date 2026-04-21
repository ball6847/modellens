# Test Cases: S001 - Project Scaffolding

**Story:** [S001-project-scaffolding.md](../stories/S001-project-scaffolding.md)
| **Test Cases:** this file **Total Cases:** 6 | P0: 3 | P1: 3

---

## TC-S001-001: cargo-leptos install and project init

**Priority:** P0 (Critical) **Type:** Build **Preconditions:** Rust 1.90.0
installed, cargo-leptos not installed

1. Run `cargo install cargo-leptos` **Expected:** Installation completes without
   errors

2. Run `cargo leptos --version` **Expected:** Prints version number (e.g.,
   `cargo-leptos 0.2.x`)

---

## TC-S001-002: Project compiles with cargo leptos watch

**Priority:** P0 (Critical) **Type:** Build **Preconditions:** Project
scaffolded, Cargo.toml configured

1. Run `cargo leptos watch` **Expected:** Compiles successfully, serves at
   localhost:3000 **Expected:** No compilation errors or warnings about missing
   deps **Expected:** Console output shows "Serving at http://127.0.0.1:3000" or
   similar

2. Open browser to `http://localhost:3000` **Expected:** Page loads with HTTP
   200 **Expected:** "ModelLens" text visible in page content

---

## TC-S001-003: WASM hydration works

**Priority:** P0 (Critical) **Type:** Functional **Preconditions:** Server
running via `cargo leptos watch`

1. Open browser DevTools console
2. Navigate to `http://localhost:3000` **Expected:** No JavaScript errors in
   console **Expected:** No "hydration mismatch" warnings **Expected:** Page is
   interactive (can click/type if any interactive elements exist)

---

## TC-S001-004: SSR renders before hydration

**Priority:** P1 (High) **Type:** Functional **Preconditions:** Server running

1. Disable JavaScript in browser
2. Navigate to `http://localhost:3000` **Expected:** Page renders server-side
   HTML (even if not interactive) **Expected:** "ModelLens" text visible in HTML
   source (View Source)

3. Re-enable JavaScript, reload page **Expected:** Page becomes interactive
   after WASM loads

---

## TC-S001-005: Cargo.toml dependencies correct

**Priority:** P1 (High) **Type:** Build **Preconditions:** Cargo.toml exists

1. Verify Cargo.toml contains:
   - `leptos = "0.7"` with ssr feature
   - `leptos_meta = "0.7"`
   - `leptos_axum = "0.7"`
   - `axum = "0.8"`
   - `tokio` with full features
   - `serde` with derive
   - `serde_json = "1"` **Expected:** All dependencies present with correct
     versions

2. Verify features section has `ssr` and `hydrate` feature flags **Expected:**
   `ssr = ["leptos/ssr", "leptos_axum", "dep:axum", "dep:tokio"]` **Expected:**
   `hydrate = ["leptos/hydrate"]`

---

## TC-S001-006: File structure matches spec

**Priority:** P1 (High) **Type:** Build **Preconditions:** Project scaffolded

1. Verify file structure exists:
   - `src/main.rs` (server entry)
   - `src/lib.rs` (re-exports)
   - `src/app.rs` (root component)
   - `src/components/mod.rs`
   - `style/main.scss`
   - `.cargo/config.toml` **Expected:** All files exist and are non-empty
