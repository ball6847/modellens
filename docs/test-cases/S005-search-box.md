# Test Cases: S005 - Search Box Component

**Story:** [S005-search-box.md](../stories/S005-search-box.md) | **Test Cases:**
this file **Total Cases:** 7 | P0: 4 | P1: 2

---

## TC-S005-001: Search input renders with placeholder

**Priority:** P0 (Critical) **Type:** UI

1. View the page **Expected:** Search input visible with placeholder "Search
   models..." **Expected:** Input is focusable (click or Tab)

---

## TC-S005-002: Typing filters models after debounce

**Priority:** P0 (Critical) **Type:** Functional

1. Click search input, type "claude"
2. Wait 200ms (debounce is 150ms) **Expected:** Model list updates to show only
   models matching "claude" **Expected:** Result count updates (e.g., "Showing
   12 of 4,274 models")

---

## TC-S005-003: Debounce prevents rapid server calls

**Priority:** P1 (High) **Type:** Performance

1. Open browser DevTools Network tab
2. Type "gpt" quickly (one character at a time: g, p, t)
3. Count server function calls in Network tab **Expected:** Only 1 call made
   after typing stops (not 3 calls for g, gp, gpt) **Expected:** Delay of ~150ms
   after last keystroke before call fires

---

## TC-S005-004: Result count displays correctly

**Priority:** P0 (Critical) **Type:** UI

1. On page load (no search) **Expected:** "Showing 4,274 of 4,274 models" (or
   "Showing 100 of 4,274" depending on initial load)

2. Type "gpt" and wait for results **Expected:** "Showing X of 4,274 models"
   where X is the total match count

3. Clear search input **Expected:** Count returns to 4,274

---

## TC-S005-005: Clear search restores all models

**Priority:** P0 (Critical) **Type:** Functional

1. Type "claude" → results filter
2. Select all text in search box, press Delete
3. Wait for debounce **Expected:** All models shown again **Expected:** Scroll
   resets to top

---

## TC-S005-006: Case-insensitive search from UI

**Priority:** P0 (Critical) **Type:** Functional

1. Type "CLAUDE" (all caps) **Expected:** Same results as typing "claude"

2. Type "ClAuDe" (mixed case) **Expected:** Same results as typing "claude"

---

## TC-S005-007: Search resets offset to 0

**Priority:** P1 (High) **Type:** Functional

1. Scroll down to load 200+ models (offset >= 100)
2. Type a new search query **Expected:** Model list resets to first 100 results
   **Expected:** Scroll position resets to top
