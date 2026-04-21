# Test Cases: S002 - Data Layer (models + app_data)

**Story:** [S002-data-layer.md](../stories/S002-data-layer.md) | **Test Cases:**
this file **Total Cases:** 8 | P0: 4 | P1: 3 | P2: 1

---

## TC-S002-001: Parse api.json successfully

**Priority:** P0 (Critical) **Type:** Functional (Unit) **Preconditions:**
api.json exists at project root, ~1.8MB

1. Run unit test: `AppData::load("api.json")` **Expected:** Returns
   `Ok(AppData)` without panic **Expected:** `app_data.models.len() == 4274`

---

## TC-S002-002: Each model has correct provider_id

**Priority:** P0 (Critical) **Type:** Functional (Unit) **Preconditions:**
AppData loaded

1. Check first model from "anthropic" provider **Expected:**
   `model.provider_id == "anthropic"`

2. Check first model from "openai" provider **Expected:**
   `model.provider_id == "openai"`

3. Verify no model has empty `provider_id` **Expected:** All models have
   non-empty `provider_id`

---

## TC-S002-003: Model structs deserialize all fields

**Priority:** P0 (Critical) **Type:** Functional (Unit) **Preconditions:**
AppData loaded

1. Find a model with all optional fields populated (e.g., GPT-4o or Claude 3.5
   Sonnet) **Expected:** `name` is non-empty string **Expected:** `id` is
   non-empty string **Expected:** `family` is `Some(String)` **Expected:**
   `cost` is `Some(Cost)` with positive input/output values **Expected:**
   `limit` is `Some(ModelLimit)` with positive context value **Expected:**
   `modalities` is `Some(Modalities)` with non-empty input/output arrays
   **Expected:** `reasoning`, `tool_call`, `attachment` are `Some(bool)`
   **Expected:** `open_weights` is `Some(bool)`

---

## TC-S002-004: Optional fields handle None gracefully

**Priority:** P1 (High) **Type:** Functional (Unit) **Preconditions:** AppData
loaded

1. Find a model with minimal fields (missing cost, limit, family) **Expected:**
   `family` is `None` (or `Some`) **Expected:** `cost` is `None` — no panic on
   access **Expected:** `limit` is `None` — no panic on access **Expected:**
   Deserialization succeeds without error

---

## TC-S002-005: Server startup fails with clear message on missing file

**Priority:** P0 (Critical) **Type:** Functional (Unit) **Preconditions:**
api.json renamed or deleted

1. Run `AppData::load("nonexistent.json")` **Expected:** Returns `Err` or panics
   with message containing "api.json" or "not found" **Expected:** Server does
   NOT start silently with empty data

---

## TC-S002-006: Server startup fails on invalid JSON

**Priority:** P0 (Critical) **Type:** Functional (Unit) **Preconditions:**
api.json contains invalid JSON

1. Write `{invalid json` to a test file, run `AppData::load()` **Expected:**
   Returns `Err` or panics with parse error message **Expected:** Server does
   NOT start with corrupted data

---

## TC-S002-007: Startup log shows model count

**Priority:** P2 (Medium) **Type:** Functional **Preconditions:** Valid api.json

1. Start server, observe console output **Expected:** Log line: "Loaded 4,274
   models from api.json" (or similar with actual count)

---

## TC-S002-008: SortField and SortDir enums derive PartialEq

**Priority:** P1 (High) **Type:** Build (Unit) **Preconditions:** models.rs
compiled

1. Assert `SortField::Name == SortField::Name` compiles and returns true
2. Assert `SortDir::Asc != SortDir::Desc` compiles and returns true
   **Expected:** Both comparisons compile and work correctly
