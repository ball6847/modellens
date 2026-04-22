# S011: Polish (error/empty states, mobile, a11y)

**Priority:** Low\
**Depends on:** S007, S008, S009\
**Status:** Pending\
**Test Cases:** [S011-polish.md](../test-cases/S011-polish.md)

## User Story

As a user, I want graceful error handling, clear empty states, and good
accessibility so that the app feels robust and inclusive.

## Acceptance Criteria

```gherkin
Given the API call returns an error
Then I see an error message with a "Retry" button

Given my search returns no results
Then I see "No models found" with the search term displayed

Given I navigate with a keyboard
Then I can Tab to the search box, table rows, and sort headers
And I can press Enter to activate them

Given I view on iPhone SE (375px)
Then the layout adapts with horizontal table scroll and full-width search
```

## Tasks

1. Error state: catch fetch errors, display error banner + retry button
2. Empty state: "No models found for '{query}'" message with clear styling
3. Loading state: skeleton rows or spinner while initial data loads
4. Keyboard navigation: `tabindex` on interactive elements, `keydown` handlers
5. ARIA labels: search input, sort buttons, table regions
6. Mobile responsiveness: verify at 375px, test touch interactions
7. Favicon and page title
8. Graceful degradation if IntersectionObserver unavailable (scroll event
   fallback)

## Technical Notes

- Error handling: check `response.ok` in fetch, catch network errors
- ARIA: `role="search"`, `aria-label` on sort buttons, `role="grid"` on table
- Focus management: auto-focus search box on page load? (optional)
- Skeleton loading: gray pulsing rectangles matching row height

## Verification

- Kill server mid-request: client shows error + retry
- Search "zzzzz": shows "No models found"
- Tab through page: reaches all interactive elements
- Mobile: no horizontal overflow on body, table scrolls in wrapper
