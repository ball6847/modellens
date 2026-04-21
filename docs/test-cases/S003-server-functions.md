# Test Cases: S003 - Server Functions (search + detail)

**Story:** [S003-server-functions.md](../stories/S003-server-functions.md) |
**Test Cases:** this file **Total Cases:** 16 | P0: 8 | P1: 4

---

## TC-S003-001: Empty query returns all models

**Priority:** P0 (Critical) **Type:** Functional (Unit) **Preconditions:**
AppData loaded with 4,274 models

1. Call `search_models(None, SortField::Name, SortDir::Asc, 0, 100)`
   **Expected:** `result.total == 4274` **Expected:**
   `result.models.len() == 100`

2. Call
   `search_models(Some("".to_string()), SortField::Name, SortDir::Asc, 0, 100)`
   **Expected:** `result.total == 4274` (whitespace-only treated as empty)

---

## TC-S003-002: Search by name (case-insensitive substring)

**Priority:** P0 (Critical) **Type:** Functional (Unit)

1. Call `search_models(Some("claude"), SortField::Name, SortDir::Asc, 0, 100)`
   **Expected:** `result.total > 0` **Expected:** Every model in result has
   name/id/family/provider_id containing "claude" (case-insensitive)

2. Call `search_models(Some("CLAUDE"), SortField::Name, SortDir::Asc, 0, 100)`
   **Expected:** Same total count as lowercase "claude"

---

## TC-S003-003: Search by id

**Priority:** P0 (Critical) **Type:** Functional (Unit)

1. Call `search_models(Some("gpt-4o"), _, _, 0, 100)` **Expected:** Results
   include models with id containing "gpt-4o"

---

## TC-S003-004: Search by family

**Priority:** P0 (Critical) **Type:** Functional (Unit)

1. Call `search_models(Some("qwen"), _, _, 0, 100)` **Expected:** Results
   include models where family contains "qwen"

---

## TC-S003-005: Search by provider_id

**Priority:** P0 (Critical) **Type:** Functional (Unit)

1. Call `search_models(Some("anthropic"), _, _, 0, 100)` **Expected:** All
   results have `provider_id` containing "anthropic"

---

## TC-S003-006: No-match search returns empty

**Priority:** P0 (Critical) **Type:** Functional (Unit)

1. Call `search_models(Some("xyznonexistent123"), _, _, 0, 100)` **Expected:**
   `result.total == 0` **Expected:** `result.models` is empty Vec

---

## TC-S003-007: Pagination - offset produces different pages

**Priority:** P0 (Critical) **Type:** Functional (Unit)

1. Call `search_models(None, SortField::Name, SortDir::Asc, 0, 100)` → page0
2. Call `search_models(None, SortField::Name, SortDir::Asc, 100, 100)` → page1
   **Expected:** `page0.models[0].id != page1.models[0].id` **Expected:** No
   model IDs overlap between page0 and page1

3. Call `search_models(None, SortField::Name, SortDir::Asc, 4200, 100)` → last
   page **Expected:** `result.models.len() < 100` (partial page) **Expected:**
   `result.total == 4274`

---

## TC-S003-008: Limit capped at 100

**Priority:** P1 (High) **Type:** Functional (Unit)

1. Call `search_models(None, _, _, 0, 500)` (request 500) **Expected:**
   `result.models.len() <= 100` (server caps at 100)

---

## TC-S003-009: Sort by Name ascending

**Priority:** P0 (Critical) **Type:** Functional (Unit)

1. Call `search_models(None, SortField::Name, SortDir::Asc, 0, 100)`
   **Expected:** Models sorted alphabetically: first model name <= second model
   name

---

## TC-S003-010: Sort by Name descending

**Priority:** P0 (Critical) **Type:** Functional (Unit)

1. Call `search_models(None, SortField::Name, SortDir::Desc, 0, 100)`
   **Expected:** First model name >= second model name (reverse alphabetical)

---

## TC-S003-011: Sort by Context (numeric)

**Priority:** P0 (Critical) **Type:** Functional (Unit)

1. Call `search_models(None, SortField::Context, SortDir::Desc, 0, 100)`
   **Expected:** Models with highest context window appear first **Expected:**
   Models with `limit == None` appear at the end

2. Call `search_models(None, SortField::Context, SortDir::Asc, 0, 100)`
   **Expected:** Models with lowest context window appear first

---

## TC-S003-012: Sort by InputCost (handles None)

**Priority:** P1 (High) **Type:** Functional (Unit)

1. Call `search_models(None, SortField::InputCost, SortDir::Asc, 0, 100)`
   **Expected:** Models with cost appear first (sorted by cost) **Expected:**
   Models with `cost == None` appear at the end

2. Call `search_models(None, SortField::InputCost, SortDir::Desc, 0, 100)`
   **Expected:** Models with highest cost appear first **Expected:** Models with
   `cost == None` appear at the end

---

## TC-S003-013: Sort by OutputCost (handles None)

**Priority:** P1 (High) **Type:** Functional (Unit)

1. Call `search_models(None, SortField::OutputCost, SortDir::Desc, 0, 100)`
   **Expected:** Same None-handling behavior as InputCost

---

## TC-S003-014: Sort by Provider

**Priority:** P1 (High) **Type:** Functional (Unit)

1. Call `search_models(None, SortField::Provider, SortDir::Asc, 0, 100)`
   **Expected:** Models sorted by provider_id alphabetically

---

## TC-S003-015: get_model_detail returns correct model

**Priority:** P0 (Critical) **Type:** Functional (Unit)

1. Call `get_model_detail("anthropic", "claude-3.5-sonnet")` (or known existing
   model) **Expected:** Returns `Ok(Model)` with matching provider_id and id

2. Call `get_model_detail("nonexistent", "fake-model")` **Expected:** Returns
   `Err(ServerFnError)` ("Model not found" or similar)

---

## TC-S003-016: Search + sort + paginate combined

**Priority:** P0 (Critical) **Type:** Functional (Unit)

1. Call `search_models(Some("gpt"), SortField::Context, SortDir::Desc, 0, 10)`
   **Expected:** Results contain "gpt" substring, sorted by context descending,
   limited to 10 **Expected:** `result.total` reflects total "gpt" matches (not
   just 10)
