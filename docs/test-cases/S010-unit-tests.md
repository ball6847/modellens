# Test Cases: S010 - Unit Tests

**Story:** [S010-testing.md](../stories/S010-testing.md) | **Test Cases:** this
file **Total Cases:** 6 | P0: 1 | P1: 5

---

## TC-S010-001: All unit tests pass with cargo test

**Priority:** P0 (Critical) **Type:** Build

1. Run `cargo test` **Expected:** All tests pass (0 failures) **Expected:** No
   test panics

---

## TC-S010-002: Data loading tests exist

**Priority:** P1 (High) **Type:** Build

1. Verify test functions exist for:
   - Parse api.json successfully
   - Flattened Vec contains correct model count
   - Each model has correct provider_id **Expected:** At least 3 data loading
     tests

---

## TC-S010-003: Search tests exist

**Priority:** P1 (High) **Type:** Build

1. Verify test functions exist for:
   - Empty query returns all models
   - Case-insensitive match
   - Substring match
   - No-match returns total:0 **Expected:** At least 4 search tests

---

## TC-S010-004: Sort tests exist

**Priority:** P1 (High) **Type:** Build

1. Verify test functions exist for:
   - Sort by Name asc/desc
   - Sort by Context numeric
   - Sort by InputCost with None handling
   - Sort by Provider **Expected:** At least 4 sort tests

---

## TC-S010-005: Formatting tests exist

**Priority:** P1 (High) **Type:** Build

1. Verify test functions exist for:
   - 128000 → "128K"
   - 1000000 → "1M"
   - 8192 → "8K"
   - Cost formatting ($0.29)
   - Cost None → "—" **Expected:** At least 5 formatting tests

---

## TC-S010-006: Pagination tests exist

**Priority:** P1 (High) **Type:** Build

1. Verify test functions exist for:
   - Different offset produces different pages
   - Limit cap at 100 **Expected:** At least 2 pagination tests
