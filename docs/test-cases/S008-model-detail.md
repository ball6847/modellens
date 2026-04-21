# Test Cases: S008 - Model Detail View

**Story:** [S008-model-detail.md](../stories/S008-model-detail.md) | **Test
Cases:** this file **Total Cases:** 5 | P0: 3 | P1: 2

---

## TC-S008-001: Click row opens detail view

**Priority:** P0 (Critical) **Type:** Functional

1. Click any model row **Expected:** Detail view expands/appears showing full
   model data **Expected:** Detail shows: Provider, Name, ID, Family, Context,
   Output limit, Input cost, Output cost, Modalities, Features, Knowledge,
   Release date, Last updated

---

## TC-S008-002: Detail displays all fields correctly

**Priority:** P0 (Critical) **Type:** Functional

1. Click model "claude-3.5-sonnet" (or known model with all fields)
   **Expected:** Provider: "anthropic" **Expected:** Family displayed (e.g.,
   "claude") **Expected:** Context formatted as "128K" **Expected:** Costs
   formatted as "$X.XX" **Expected:** Modalities: "Input: text" and "Output:
   text" (or similar lists) **Expected:** Feature badges for tool_call,
   reasoning (if true) **Expected:** Knowledge cutoff displayed (e.g.,
   "2025-04") **Expected:** Release date displayed

---

## TC-S008-003: Close/collapse detail view

**Priority:** P0 (Critical) **Type:** Functional

1. Click a model row to open detail
2. Click same row again (or click close button) **Expected:** Detail view
   collapses/hides

---

## TC-S008-004: Detail shows correct model data

**Priority:** P0 (Critical) **Type:** Functional

1. Click first model in list **Expected:** Detail data matches that specific
   model (not a different one)

2. Close detail, click a different model **Expected:** Detail updates to show
   the new model's data

---

## TC-S008-005: Detail handles missing optional fields

**Priority:** P1 (High) **Type:** Functional

1. Click a model with no cost or no family **Expected:** Missing fields show "—"
   or "N/A" **Expected:** No layout breakage or empty gaps
