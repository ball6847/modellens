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

1. Create `src/components/search_box.rs`
2. Render: `<input type="text" placeholder="Search models..." />` + result count
   span
3. Implement 150ms debounce using `leptos_use::use_debounce_fn` or manual
   `set_timeout`
4. On debounced change: update `query` signal, call
   `search_models(query, sort, 0, 100)`, reset scroll
5. Display: "Showing {total} of {all_count} models"
6. Register in `src/components/mod.rs`

## Technical Notes

- Debounce: `use_debounce_fn(callback, 150.0)` from leptos-use, or
  `gloo_timers::callback::Timeout`
- Query signal is `RwSignal<Option<String>>`
- On new search: offset resets to 0, models list resets

## Verification

- Search "claude" returns only matching models
- Typing quickly only triggers one server call after pause
- Clearing search restores all models
- Count display updates correctly
