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

1. Create `web/src/infinite-scroll.ts` as Lit component
2. Render a sentinel `<div>` at the bottom of the model list
3. Use `IntersectionObserver` on the sentinel in `connectedCallback()`
4. When sentinel enters viewport AND `isFetching == false` AND more results
   exist: dispatch `load-more` custom event
5. Show `<loading-spinner>` while `isFetching == true`
6. Expose `@property() isFetching` and `@property() hasMore` for parent to set
7. Disconnect observer in `disconnectedCallback()`

## Technical Notes

- `isFetching` and `hasMore` set by parent component
- On search/sort change: parent resets offset to 0, replaces models (doesn't
  append)
- Sentinel: empty div used as IntersectionObserver root
- IntersectionObserver with `{ rootMargin: '200px' }` for early triggering

## Verification

- Scrolling to bottom loads next batch
- Loading indicator appears during fetch
- Models append (not replace) on scroll
- New search resets list and offset
- No loading when all models fetched
