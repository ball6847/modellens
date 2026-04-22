# Test Cases: S011 - Polish (error/empty states, mobile, a11y)

**Story:** [S011-polish.md](../stories/S011-polish.md) | **Test Cases:** this
file **Total Cases:** 9 | P0: 2 | P1: 3 | P2: 3 | P3: 1

---

## TC-S011-001: Server error shows error message + retry

**Priority:** P0 (Critical) **Type:** Functional

1. Simulate API error (e.g., kill server, then trigger search) **Expected:**
   Error message/banner appears **Expected:** "Retry" button visible

2. Click "Retry" button **Expected:** API call re-attempted

---

## TC-S011-002: Empty search results message

**Priority:** P0 (Critical) **Type:** UI

1. Search for "zzzzzzz" (no matches) **Expected:** "No models found for
   'zzzzzzz'" message displayed **Expected:** Message centered, clearly visible

---

## TC-S011-003: Keyboard navigation to search box

**Priority:** P1 (High) **Type:** A11y

1. Press Tab key from page load **Expected:** Focus reaches search input
   **Expected:** Focus ring visible on search input

2. Type in search box with keyboard **Expected:** Text input works normally

---

## TC-S011-004: Keyboard navigation to sort headers

**Priority:** P1 (High) **Type:** A11y

1. Tab from search box to table **Expected:** Column headers are focusable
   (tabindex)
2. Press Enter on a focused column header **Expected:** Sort activates (same as
   click)

---

## TC-S011-005: Keyboard navigation to table rows

**Priority:** P2 (Medium) **Type:** A11y

1. Tab to a model row
2. Press Enter **Expected:** Detail view opens for that row

---

## TC-S011-006: ARIA labels on interactive elements

**Priority:** P2 (Medium) **Type:** A11y

1. Inspect search input **Expected:** Has `aria-label` or `role="search"`
   attribute

2. Inspect sort column headers **Expected:** Have `aria-label` describing sort
   action (e.g., "Sort by Name")

3. Inspect table **Expected:** Has appropriate `role` attribute (e.g.,
   `role="grid"` or semantic `<table>`)

---

## TC-S011-007: Mobile layout at 375px

**Priority:** P1 (High) **Type:** UI/Responsive

1. Set viewport to 375x812 (iPhone SE) **Expected:** No horizontal overflow on
   body **Expected:** Table scrolls horizontally within wrapper **Expected:**
   Search box full-width and usable **Expected:** Header spans full width
   **Expected:** Touch scrolling works on table

---

## TC-S011-008: Mobile layout at 428px

**Priority:** P2 (Medium) **Type:** UI/Responsive

1. Set viewport to 428x926 (iPhone 14 Pro Max) **Expected:** Same as
   TC-S011-007, layout adapts

---

## TC-S011-009: Favicon and page title present

**Priority:** P3 (Low) **Type:** UI

1. Check browser tab **Expected:** Favicon icon displayed **Expected:** Tab
   title "ModelLens" or similar
