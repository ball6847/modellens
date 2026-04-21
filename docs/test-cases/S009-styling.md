# Test Cases: S009 - Tailwind CSS Styling

**Story:** [S009-styling.md](../stories/S009-styling.md) | **Test Cases:** this
file **Total Cases:** 8 | P0: 2 | P1: 3 | P2: 2

---

## TC-S009-001: Header has dark background with white text

**Priority:** P1 (High) **Type:** UI

1. View header **Expected:** Dark background (e.g., `bg-gray-900`) **Expected:**
   "ModelLens" text in white

---

## TC-S009-002: Search box styled with border and focus ring

**Priority:** P1 (High) **Type:** UI

1. View search input **Expected:** Border visible (e.g., `border-gray-300`)
   **Expected:** Full-width layout

2. Click/focus search input **Expected:** Focus ring appears (e.g.,
   `ring-2 ring-blue-500`)

---

## TC-S009-003: Table has alternating row colors

**Priority:** P1 (High) **Type:** UI

1. View model table rows **Expected:** Alternating `bg-white` and `bg-gray-50`
   (or similar) **Expected:** Rows are visually distinct

---

## TC-S009-004: Column headers interactive style

**Priority:** P1 (High) **Type:** UI

1. Hover over a column header **Expected:** Cursor changes to pointer
   **Expected:** Hover background effect

---

## TC-S009-005: Feature badge styling (pill shape + colors)

**Priority:** P0 (Critical) **Type:** UI

1. View model with tool_call=true **Expected:** Small rounded pill badge
   **Expected:** Blue background with white "Tools" text

2. View model with reasoning=true **Expected:** Purple background with white
   "Reasoning" text

3. View model with attachment=true **Expected:** Green background with white
   "Files" text

4. View model with open_weights=true **Expected:** Orange background with white
   "Open" text

---

## TC-S009-006: Mobile responsive - table scrolls horizontally

**Priority:** P0 (Critical) **Type:** UI/Responsive **Preconditions:** Chrome
DevTools responsive mode at 375px width

1. Set viewport to 375px (iPhone SE) **Expected:** Table horizontally scrollable
   within its container **Expected:** Page body does NOT have horizontal
   scrollbar **Expected:** Search box remains full-width and usable

---

## TC-S009-007: Loading spinner visible and centered

**Priority:** P2 (Medium) **Type:** UI

1. Trigger a loading state (scroll to bottom for next batch) **Expected:**
   Spinner is centered in the content area **Expected:** Spinner has animation
   (rotation or pulse)

---

## TC-S009-008: Detail view styled as card

**Priority:** P2 (Medium) **Type:** UI

1. Open model detail **Expected:** Detail appears as a card/panel with padding
   and shadow **Expected:** Key-value pairs neatly aligned
