# S001: Project Scaffolding

**Priority:** Critical\
**Depends on:** None\
**Status:** Pending\
**Test Cases:**
[S001-project-scaffolding.md](../test-cases/S001-project-scaffolding.md)

## User Story

As a developer, I need the project scaffolded with Leptos 0.7+ and cargo-leptos
so that I can build and run the application.

## Acceptance Criteria

```gherkin
Given cargo-leptos is installed
When I run `cargo leptos watch`
Then the app compiles and serves at localhost:3000
And I see a placeholder "ModelLens" page in the browser
```

## Tasks

1. Install cargo-leptos: `cargo install cargo-leptos`
2. Initialize project: `cargo leptos new modelsdb` (or manual setup)
3. Configure `Cargo.toml` with Leptos 0.7 deps (leptos, leptos_meta,
   leptos_axum, axum, tokio, serde, serde_json)
4. Set up `src/lib.rs`, `src/main.rs`, `src/app.rs` with minimal Leptos
   hello-world
5. Configure `.cargo/config.toml` for cargo-leptos targets
6. Create `style/main.scss` with Tailwind imports
7. Verify `cargo leptos watch` compiles and serves

## Technical Notes

- Leptos 0.7 uses `leptos::view!` macro
- `main.rs` is server entry (Axum), `lib.rs` re-exports for WASM
- `app.rs` contains the root `#[component] fn App()`
- Need `features = ["ssr"]` / `features = ["hydrate"]` in Cargo.toml

## Verification

- `cargo leptos watch` starts without errors
- Browser at localhost:3000 shows rendered page
- WASM hydration works (check console for errors)
