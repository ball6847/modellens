# S007: Infinite Scroll Component

**Priority:** High\
**Depends on:** S006\
**Status:** Pending\
**Test Cases:** [S007-infinite-scroll.md](../test-cases/S007-infinite-scroll.md)

## User Story

As a user, I want models to load automatically as I scroll down so that I can
browse all models without pagination buttons.

## Acceptance Criteria

```gherkin
Given I scroll to the bottom of the model list
Then the next 100 models load and append to the list
And I see a loading indicator while fetching

Given all models are loaded (no more results)
Then no further loading occurs when I scroll

When I change the search query
Then the scroll resets and only the first 100 matching models show
And scrolling loads more matching models
```

## Tasks

1. Create `src/components/infinite_scroll.rs`
2. Render a sentinel `<div>` at the bottom of the model list
3. Use `leptos_use::use_intersection_observer` on the sentinel
4. When sentinel enters viewport AND `is_fetching == false` AND more results
   exist: call `search_models(query, sort, offset+100, 100)`
5. Append new models to existing list (don't replace)
6. Show loading spinner while `is_fetching == true`
7. Track `offset` signal: starts at 0, increments by 100 on each batch
8. Stop loading when `models.len() >= total` from ModelPage

## Technical Notes

- `is_fetching: Signal<bool>` — set true before server call, false after
- On search/sort change: reset offset to 0, replace models (don't append)
- Sentinel: empty div with `ref` bound for IntersectionObserver
- `use_intersection_observer` from leptos-use 0.15

## Verification

- Scrolling to bottom loads next batch
- Loading indicator appears during fetch
- Models append (not replace) on scroll
- New search resets list and offset
- No loading when all models fetched
