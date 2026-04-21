# S004: Root Shell & App Layout

**Priority:** High\
**Depends on:** S003\
**Status:** Pending\
**Test Cases:** [S004-root-shell.md](../test-cases/S004-root-shell.md)

## User Story

As a user, I need a page shell with header and content area so that I have a
structured layout for the model browser.

## Acceptance Criteria

```gherkin
Given the app loads
When I view the page
Then I see a header with "ModelLens" branding
And a content area below the header
And the SSR-rendered first 100 models appear in the content area
```

## Tasks

1. Implement `App` component in `src/app.rs`
2. Layout: header bar (title "ModelLens") + main content area
3. Call `search_models(None, SortField::Name, SortDir::Asc, 0, 100)` on mount
   for SSR
4. Store results in signals: `models: Signal<Vec<Model>>`,
   `total: Signal<usize>`, `sort_by`, `sort_dir`, `query`
5. Pass signals down to child component slots (search box area, table area)
6. Add `<Title/>` and `<Meta/>` via leptos_meta

## Technical Notes

- Use `create_resource` or `spawn_local` for initial server function call
- Signals: `query: RwSignal<Option<String>>`, `sort_by: RwSignal<SortField>`,
  `sort_dir: RwSignal<SortDir>`
- SSR: server function runs on server during render, client hydrates with same
  data

## Verification

- Page renders with header
- Initial 100 models load and display (even if unstyled)
- No console errors on hydration
