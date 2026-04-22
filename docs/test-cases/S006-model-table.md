# Test Cases: S006 - Model Table Component

**Story:** [S006-model-table.md](../stories/S006-model-table.md) | **Test
Cases:** this file **Total Cases:** 9 | P0: 5 | P1: 3

---

## TC-S006-001: All 7 columns render

**Priority:** P0 (Critical) **Type:** UI

1. View the model table **Expected:** Column headers visible: Provider, Name,
   ID, Context, Input Cost, Output Cost, Features **Expected:** Each column
   contains data for every visible row

---

## TC-S006-002: Context formatting (K/M suffix)

**Priority:** P0 (Critical) **Type:** Functional

1. Find a model with context = 128000 **Expected:** Displays "128K" (not
   "128000")

2. Find a model with context >= 1000000 (if any) **Expected:** Displays "1M" or
   "1.5M" format

3. Find a model with context = 8192 **Expected:** Displays "8K" (not "8192")

4. Find a model with no context limit (null) **Expected:** Displays "—" (em
   dash)

---

## TC-S006-003: Cost formatting ($X.XX)

**Priority:** P0 (Critical) **Type:** Functional

1. Find model with input cost = 0.29 **Expected:** Displays "$0.29"

2. Find model with input cost = 10.0 **Expected:** Displays "$10.00"

3. Find model with cost = null **Expected:** Displays "—" (em dash)

---

## TC-S006-004: Feature badges render with correct colors

**Priority:** P0 (Critical) **Type:** UI

1. Find model with `tool_call = true` **Expected:** Blue badge with text "Tools"
   visible

2. Find model with `reasoning = true` **Expected:** Purple badge with text
   "Reasoning" visible

3. Find model with `attachment = true` **Expected:** Green badge with text
   "Files" visible

4. Find model with `open_weights = true` **Expected:** Orange badge with text
   "Open" visible

5. Find model with `tool_call = false` **Expected:** No "Tools" badge shown

---

## TC-S006-005: Sort by clicking column header

**Priority:** P0 (Critical) **Type:** Functional

1. Click "Name" column header **Expected:** Models sorted alphabetically by name
   (ascending) **Expected:** Sort indicator (arrow) appears on Name column

2. Click "Name" column header again **Expected:** Sort direction toggles to
   descending **Expected:** Models sorted reverse-alphabetically

3. Click "Context" column header **Expected:** Sort field changes to Context,
   direction resets to Asc **Expected:** Sort indicator moves to Context column

---

## TC-S006-006: Sort indicator shows direction

**Priority:** P1 (High) **Type:** UI

1. Click "Name" column header (ascending) **Expected:** Up arrow or "↑" visible
   on Name column

2. Click "Name" again (descending) **Expected:** Down arrow or "↓" visible on
   Name column

3. Other column headers **Expected:** No sort indicator on inactive columns

---

## TC-S006-007: Row click triggers callback

**Priority:** P1 (High) **Type:** Functional

1. Click any model row **Expected:** Custom event fires with
   `{ providerId, modelId }` of clicked row **Expected:** Detail view opens for
   that model (if S008 implemented) or event is logged

---

## TC-S006-008: Table renders 100 rows on initial load

**Priority:** P0 (Critical) **Type:** Functional

1. Load page, count visible model rows **Expected:** Exactly 100 rows rendered
   (first batch)

---

## TC-S006-009: Sort by Context numeric (not alphabetic)

**Priority:** P1 (High) **Type:** Functional

1. Sort by Context descending **Expected:** Models with context=128000 appear
   before models with context=8192 **Expected:** NOT sorted as strings ("8K"
   before "128K" would be wrong)
