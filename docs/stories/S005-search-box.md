# S005: Search Box Component

**Priority:** High\
**Depends on:** S004\
**Status:** Pending\
**Test Cases:** [S005-search-box.md](../test-cases/S005-search-box.md)

## User Story

As a user, I want to type a search query and see matching models with a result
count so that I can quickly find specific models.

## Acceptance Criteria

```gherkin
Given I view the ModelLens page
Then I see a search input with placeholder text "Search models..."

When I type "claude" in the search box
Then after 150ms of no typing, the model list filters to models matching "claude"
And I see "Showing X of 4,274 models"

When I clear the search box
Then all models are shown again
And I see "Showing 4,274 of 4,274 models"
```

## Tasks

1. Create `web/src/model-search.ts` as Lit component
2. Render: `<input type="text" placeholder="Search models..." />` + result count
   span
3. Implement 150ms debounce using a simple `setTimeout` in the input handler
4. On debounced change: dispatch `search-changed` custom event with `{ query }`
5. Display: "Showing {total} of {allCount} models"
6. Expose `@property() total` and `@property() allCount` for parent to set

## Technical Notes

- Debounce: clear previous timeout on each input, set new 150ms timeout
- Use `@property()` for reactive props that parent binds to
- Custom event: `this.dispatchEvent(new CustomEvent('search-changed', { detail: { query }, bubbles: true, composed: true }))`
- On new search: offset resets to 0, models list resets

## Verification

- Search "claude" returns only matching models
- Typing quickly only triggers one API call after pause
- Clearing search restores all models
- Count display updates correctly
