# Test Cases: S002 - Data Layer (models + app_data)

**Story:** [S002-data-layer.md](../stories/S002-data-layer.md) | **Test Cases:**
this file **Total Cases:** 8 | P0: 4 | P1: 3 | P2: 1

---

## TC-S002-001: Parse api.json successfully

**Priority:** P0 (Critical) **Type:** Functional (Unit) **Preconditions:**
api.json exists at project root, ~1.8MB

1. Run unit test: `AppData.Load("api.json")` **Expected:** Returns
   `(*AppData, nil)` without error **Expected:** `len(appData.Models) == 4274`

---

## TC-S002-002: Each model has correct provider_id

**Priority:** P0 (Critical) **Type:** Functional (Unit) **Preconditions:**
AppData loaded

1. Check first model from "anthropic" provider **Expected:**
   `model.ProviderID == "anthropic"`

2. Check first model from "openai" provider **Expected:**
   `model.ProviderID == "openai"`

3. Verify no model has empty `ProviderID` **Expected:** All models have
   non-empty `ProviderID`

---

## TC-S002-003: Model structs deserialize all fields

**Priority:** P0 (Critical) **Type:** Functional (Unit) **Preconditions:**
AppData loaded

1. Find a model with all optional fields populated (e.g., GPT-4o or Claude 3.5
   Sonnet) **Expected:** `Name` is non-empty string **Expected:** `ID` is
   non-empty string **Expected:** `Family` is `*string` (non-nil)
   **Expected:** `Cost` is `*Cost` with positive input/output values
   **Expected:** `Limit` is `*ModelLimit` with positive context value
   **Expected:** `Modalities` is `*Modalities` with non-empty input/output
   arrays **Expected:** `Reasoning`, `ToolCall`, `Attachment` are `*bool`
   (non-nil) **Expected:** `OpenWeights` is `*bool` (non-nil)

---

## TC-S002-004: Optional fields handle nil gracefully

**Priority:** P1 (High) **Type:** Functional (Unit) **Preconditions:** AppData
loaded

1. Find a model with minimal fields (missing cost, limit, family) **Expected:**
   `Family` is `nil` (or non-nil) **Expected:** `Cost` is `nil` — no panic on
   access **Expected:** `Limit` is `nil` — no panic on access **Expected:**
   Deserialization succeeds without error

---

## TC-S002-005: Server startup fails with clear message on missing file

**Priority:** P0 (Critical) **Type:** Functional (Unit) **Preconditions:**
api.json renamed or deleted

1. Run `AppData.Load("nonexistent.json")` **Expected:** Returns error
   containing "api.json" or "not found" **Expected:** Server does NOT start
   silently with empty data

---

## TC-S002-006: Server startup fails on invalid JSON

**Priority:** P0 (Critical) **Type:** Functional (Unit) **Preconditions:**
api.json contains invalid JSON

1. Write `{invalid json` to a test file, run `AppData.Load()` **Expected:**
   Returns error with parse error message **Expected:** Server does NOT start
   with corrupted data

---

## TC-S002-007: Startup log shows model count

**Priority:** P2 (Medium) **Type:** Functional **Preconditions:** Valid api.json

1. Start server, observe console output **Expected:** Log line: "Loaded 4,274
   models from api.json" (or similar with actual count)

---

## TC-S002-008: SortField and SortDir constants defined

**Priority:** P1 (High) **Type:** Build (Unit) **Preconditions:** models.go
compiled

1. Assert `SortProvider == "provider"` compiles and equals "provider"
2. Assert `SortAsc == "asc"` and `SortDesc == "desc"` **Expected:** Both
   constants work correctly
