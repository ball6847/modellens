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
And the first 100 models appear in the content area
```

## Tasks

1. Implement `<model-lens-app>` Lit component in `web/src/model-lens-app.ts`
2. Layout: header bar (title "ModelLens") + main content area
3. On `connectedCallback()`: fetch `GET /api/models?offset=0&limit=100`
4. Store state as reactive properties: `models`, `total`, `sortBy`, `sortDir`,
   `query`, `offset`, `isFetching`
5. Wire child components: `<model-search>`, `<model-table>`,
   `<infinite-scroll>`
6. Handle custom events from children (search-changed, sort-changed, load-more,
   row-clicked)
7. Set page title via `document.title`

## Technical Notes

- Use `@state()` for internal reactive state, `@property()` for public props
- Fetch via `api.ts` helper module
- Event delegation: listen for custom events bubbled from child components
- On sort/search change: reset offset, re-fetch, replace models

## Verification

- Page renders with header
- Initial 100 models load and display (even if unstyled)
- No console errors
