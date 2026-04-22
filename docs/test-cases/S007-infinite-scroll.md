# Test Cases: S007 - Infinite Scroll Component

**Story:** [S007-infinite-scroll.md](../stories/S007-infinite-scroll.md) |
**Test Cases:** this file **Total Cases:** 7 | P0: 4 | P1: 3

---

## TC-S007-001: Scrolling loads next batch

**Priority:** P0 (Critical) **Type:** Functional

1. Load page, observe 100 models
2. Scroll to bottom of list **Expected:** Loading indicator appears briefly
   **Expected:** Next 100 models append to the list (now 200 visible)

3. Scroll to bottom again **Expected:** Another 100 models load (now 300
   visible)

---

## TC-S007-002: Loading indicator while fetching

**Priority:** P1 (High) **Type:** UI

1. Scroll to trigger next batch load **Expected:** Spinner or "Loading..." text
   visible at bottom during fetch **Expected:** Indicator disappears after
   models are appended

---

## TC-S007-003: No loading when all models fetched

**Priority:** P0 (Critical) **Type:** Functional

1. Keep scrolling until all models loaded
2. Scroll to very bottom **Expected:** No loading indicator **Expected:** No
   additional API calls (check Network tab)

---

## TC-S007-004: Search resets scroll and offset

**Priority:** P0 (Critical) **Type:** Functional

1. Scroll down to load 300+ models
2. Type new search query **Expected:** Model list resets to first 100 matches
   **Expected:** Scroll position resets to top **Expected:** Offset resets to 0

---

## TC-S007-005: Sort change resets scroll and offset

**Priority:** P1 (High) **Type:** Functional

1. Scroll down to load 200+ models
2. Click a column header to change sort **Expected:** Model list resets to
   first 100 sorted results **Expected:** Scroll position resets to top

---

## TC-S007-006: Models append (not replace) on scroll

**Priority:** P0 (Critical) **Type:** Functional

1. Load page, note first model name (page 0)
2. Scroll to load second batch **Expected:** First 100 models still visible at
   top **Expected:** New models appear below existing ones **Expected:** No
   duplicate model IDs between old and new batches

---

## TC-S007-007: Infinite scroll works with search results

**Priority:** P1 (High) **Type:** Functional

1. Search for "gpt" (say 250 results)
2. Scroll down through first 100 results **Expected:** Next 100 "gpt" results
   load **Expected:** Scroll stops after all 250 results loaded
