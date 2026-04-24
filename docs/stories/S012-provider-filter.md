# S012: Provider Filter

**Priority:** High\
**Depends on:** S005\
**Status:** Done

## User Story

As a user, I want to filter models by a specific provider using a searchable dropdown, and have the search box only match model names/IDs/families, so I can quickly narrow down to a provider's models without mixing provider names into text search results.

## Acceptance Criteria

```gherkin
Given I view the ModelLens page
Then I see a searchable combobox next to the search box
And the combobox defaults to "All Providers"
And the search box placeholder reads "Search models..."

When I click the provider combobox
Then I see a list of all available providers sorted alphabetically

When I type "open" in the provider combobox
Then the dropdown filters to show only providers matching "open"

When I select "openai" from the provider combobox
Then the model list filters to show only OpenAI models
And I see the updated result count reflecting only OpenAI models

When I type "gpt" in the search box while "openai" is selected
Then the model list filters to OpenAI models matching "gpt" in name, ID, or family
And provider_id is NOT matched by the search box

When I select "All Providers" from the combobox
Then all models are shown again regardless of provider

Given the API is available
When I call GET /api/providers
Then I receive a JSON array of unique provider ID strings sorted alphabetically

When I call GET /api/models?provider=openai
Then only models with provider_id exactly equal to "openai" are returned
And models with provider_id containing "openai" as a substring (e.g. "x-openai") are NOT returned
And pagination, sorting, and search still work correctly within the filtered set
```

## Tasks

### Backend

1. Add `GET /api/providers` route in `server/routes/models.ts`
   - Return sorted array of unique `provider_id` values from `AppData.models`
2. Add `provider` query param support to `GET /api/models`
   - When `provider` is provided, filter models by `provider_id` before search/sort/paginate
3. Update `server/services/app-data.ts`:
   - Add `providers()` method to `AppData` returning sorted unique provider IDs
   - Update `filter()` to accept optional `provider` param for pre-filtering
4. Remove `provider_id` from the `filter()` function's search matching

### Frontend

5. Add `fetchProviders()` to `web/src/api.ts`
6. Add `provider` param to `FetchModelsParams` and `fetchModels()`
7. Create `web/src/components/provider-filter.tsx` — searchable combobox using shadcn-ui `Command` + `Popover` pattern
   - Props: `providers: string[]`, `value: string | null`, `onChange: (provider: string | null) => void`
   - "All Providers" option to clear filter
   - Type-ahead filtering within the dropdown
8. Update `web/src/App.tsx`:
   - Fetch providers on mount via `fetchProviders()`
   - Pass `provider` param to `fetchModels()`
   - Render `ProviderFilter` next to `SearchBox`
   - Reset offset when provider changes
9. Update `web/src/components/search-box.tsx` placeholder if needed

## Technical Notes

- Provider filtering happens server-side (alongside existing search/sort/paginate)
- The combobox uses shadcn-ui's `Command` (cmdk) + `Popover` pattern for searchable dropdown
- Provider list is fetched once on app load and cached in App state
- When provider filter changes, offset resets to 0 (same behavior as search)
- Search and provider filter are independent: search matches name/id/family, provider filter matches provider_id
- Install `cmdk` package if not already available: `cd web && npm install cmdk`

## Test Cases

### Backend — GET /api/providers

#### TC-S012-001: Providers endpoint returns sorted unique provider IDs

**Priority:** P0 (Critical)
**Type:** Functional / API

**Preconditions:**
- Server running with `api.json` loaded

**Test Steps:**
1. `GET /api/providers`
   **Expected:** HTTP 200, JSON array of strings, alphabetically sorted, no duplicates. Example: `["ai21-labs", "anthropic", "openai", ...]`

---

#### TC-S012-002: Providers list matches distinct provider_id values in models

**Priority:** P0 (Critical)
**Type:** Functional / API

**Preconditions:**
- Server running with `api.json` loaded

**Test Steps:**
1. `GET /api/providers` — capture the returned array
2. `GET /api/models?limit=9999` — collect all `provider_id` values from returned models
3. Compare the two sets
   **Expected:** The providers array contains exactly the same set of unique `provider_id` values found in the models data, no more, no fewer

---

#### TC-S012-003: Providers array is sorted alphabetically

**Priority:** P1 (High)
**Type:** Functional / API

**Preconditions:**
- Server running with `api.json` loaded

**Test Steps:**
1. `GET /api/providers`
2. Verify the array is in ascending alphabetical order
   **Expected:** Each element is lexicographically <= the next element

---

### Backend — GET /api/models?provider=...

#### TC-S012-004: Exact provider filter returns only matching models

**Priority:** P0 (Critical)
**Type:** Functional / API

**Preconditions:**
- Server running with `api.json` loaded
- At least one model with `provider_id: "openai"` exists

**Test Steps:**
1. `GET /api/models?provider=openai`
   **Expected:** All returned models have `provider_id === "openai"`. The `total` field matches the count of OpenAI models in the full dataset.

---

#### TC-S012-005: Provider filter uses exact match, not substring

**Priority:** P0 (Critical)
**Type:** Functional / API

**Preconditions:**
- A model exists with `provider_id` that contains "openai" as a substring but is not exactly "openai" (e.g., hypothetical "x-openai" or "my-openai-proxy")

**Test Steps:**
1. `GET /api/models?provider=openai`
2. Inspect all returned models' `provider_id` values
   **Expected:** No model with `provider_id !== "openai"` is returned, even if its `provider_id` contains "openai" as a substring

---

#### TC-S012-006: Provider filter with unknown provider returns empty set

**Priority:** P1 (High)
**Type:** Functional / API

**Preconditions:**
- Server running with `api.json` loaded

**Test Steps:**
1. `GET /api/models?provider=nonexistent-provider-xyz`
   **Expected:** HTTP 200, `{ models: [], total: 0 }`

---

#### TC-S012-007: Provider filter composes with search query

**Priority:** P0 (Critical)
**Type:** Functional / API

**Preconditions:**
- Server running with `api.json` loaded
- OpenAI models with "gpt" in name/ID/family exist

**Test Steps:**
1. `GET /api/models?provider=openai&query=gpt`
   **Expected:** All returned models have `provider_id === "openai"` AND match "gpt" in name, ID, or family. No model from another provider is returned even if it matches "gpt".

---

#### TC-S012-008: Search no longer matches provider_id

**Priority:** P0 (Critical)
**Type:** Functional / API

**Preconditions:**
- Server running with `api.json` loaded
- Models exist with `provider_id: "openai"` but whose name, ID, and family do NOT contain "openai"

**Test Steps:**
1. `GET /api/models?query=openai` (no provider filter)
   **Expected:** Only models whose name, ID, or family contains "openai" are returned. Models that match only by `provider_id` are NOT returned.

---

#### TC-S012-009: Provider filter composes with sorting

**Priority:** P1 (High)
**Type:** Functional / API

**Preconditions:**
- Server running with `api.json` loaded
- Multiple OpenAI models exist

**Test Steps:**
1. `GET /api/models?provider=openai&sort_by=name&sort_dir=asc`
   **Expected:** All returned models have `provider_id === "openai"` and are sorted by name ascending
2. `GET /api/models?provider=openai&sort_by=context&sort_dir=desc`
   **Expected:** All returned models have `provider_id === "openai"` and are sorted by context descending (nulls last)

---

#### TC-S012-010: Provider filter composes with pagination

**Priority:** P1 (High)
**Type:** Functional / API

**Preconditions:**
- Server running with `api.json` loaded
- At least a few OpenAI models exist

**Test Steps:**
1. `GET /api/models?provider=openai&offset=0&limit=10`
   **Expected:** First 10 (or fewer) OpenAI models returned, `total` reflects full OpenAI count
2. `GET /api/models?provider=openai&offset=10&limit=10`
   **Expected:** Next 10 (or fewer) OpenAI models returned, same `total`
3. Verify no overlap between page 1 and page 2 models
   **Expected:** The two pages contain disjoint model sets

---

#### TC-S012-011: Provider filter omitted returns all models (backward compatible)

**Priority:** P0 (Critical)
**Type:** Functional / Regression

**Preconditions:**
- Server running with `api.json` loaded

**Test Steps:**
1. `GET /api/models` (no `provider` param)
   **Expected:** Same behavior as before S012 — all models returned, search/sort/paginate work as before

---

#### TC-S012-012: Provider filter with empty string treated as no filter

**Priority:** P2 (Medium)
**Type:** Functional / API

**Preconditions:**
- Server running with `api.json` loaded

**Test Steps:**
1. `GET /api/models?provider=`
   **Expected:** All models returned — empty string is treated as no filter, consistent with omitting the param

---

#### TC-S012-013: Provider filter is case-sensitive

**Priority:** P1 (High)
**Type:** Functional / API

**Preconditions:**
- Server running with `api.json` loaded
- `provider_id` values in data are lowercase (e.g., "openai")

**Test Steps:**
1. `GET /api/models?provider=OpenAI`
   **Expected:** Returns `{ models: [], total: 0 }` — exact match means case-sensitive; "OpenAI" !== "openai"

---

### Frontend — Provider Combobox

#### TC-S012-014: Combobox renders next to search box with "All Providers" default

**Priority:** P0 (Critical)
**Type:** UI / Functional

**Preconditions:**
- App loaded in browser

**Test Steps:**
1. Navigate to ModelLens homepage
   **Expected:** A searchable combobox/dropdown is visible next to the search box, displaying "All Providers" as default text

---

#### TC-S012-015: Search box placeholder is "Search models..."

**Priority:** P1 (High)
**Type:** UI

**Preconditions:**
- App loaded in browser

**Test Steps:**
1. Navigate to ModelLens homepage
2. Inspect the search input placeholder text
   **Expected:** Placeholder reads "Search models..."

---

#### TC-S012-016: Clicking combobox shows alphabetically sorted provider list

**Priority:** P0 (Critical)
**Type:** UI / Functional

**Preconditions:**
- App loaded in browser
- Providers fetched from `/api/providers`

**Test Steps:**
1. Click the provider combobox
   **Expected:** Dropdown opens showing all providers sorted alphabetically, with "All Providers" as the first option

---

#### TC-S012-017: Type-ahead filters providers within dropdown

**Priority:** P0 (Critical)
**Type:** UI / Functional

**Preconditions:**
- App loaded in browser
- Provider combobox is open

**Test Steps:**
1. Type "open" in the combobox search field
   **Expected:** Dropdown filters to show only providers matching "open" (e.g., "openai")
2. Clear the type-ahead text
   **Expected:** All providers shown again

---

#### TC-S012-018: Selecting a provider filters model list

**Priority:** P0 (Critical)
**Type:** Functional / Integration

**Preconditions:**
- App loaded in browser
- OpenAI models exist in the dataset

**Test Steps:**
1. Select "openai" from the provider combobox
   **Expected:** Model table shows only OpenAI models; result count reflects only OpenAI models; API call includes `provider=openai` param

---

#### TC-S012-019: Selecting a provider resets pagination offset to 0

**Priority:** P1 (High)
**Type:** Functional

**Preconditions:**
- App loaded in browser
- User has scrolled down to load multiple pages of models

**Test Steps:**
1. Scroll down to load 2+ pages of models
2. Select a provider from the combobox
   **Expected:** Model list resets to page 1 (offset=0); only first batch of filtered models shown

---

#### TC-S012-020: Provider filter and search box compose as AND

**Priority:** P0 (Critical)
**Type:** Functional / Integration

**Preconditions:**
- App loaded in browser
- OpenAI models with "gpt" in name/ID exist

**Test Steps:**
1. Select "openai" from the provider combobox
2. Type "gpt" in the search box
   **Expected:** Model list shows only OpenAI models matching "gpt" in name, ID, or family. The search does NOT match by `provider_id`. API call includes both `provider=openai&query=gpt`.

---

#### TC-S012-021: Search box does not match provider_id

**Priority:** P0 (Critical)
**Type:** Functional / Integration

**Preconditions:**
- App loaded in browser
- Models exist whose name/ID/family do NOT contain "openai" but whose `provider_id` is "openai"

**Test Steps:**
1. Ensure "All Providers" is selected (no provider filter)
2. Type "openai" in the search box
   **Expected:** Only models whose name, ID, or family contains "openai" are returned. Models that only match by `provider_id` are NOT shown.

---

#### TC-S012-022: "All Providers" clears provider filter

**Priority:** P0 (Critical)
**Type:** Functional

**Preconditions:**
- A specific provider is selected (e.g., "openai")

**Test Steps:**
1. Open the provider combobox
2. Select "All Providers"
   **Expected:** Model list shows all models regardless of provider; result count reflects total; API call omits `provider` param

---

#### TC-S012-023: Provider filter persists during sort changes

**Priority:** P1 (High)
**Type:** Functional

**Preconditions:**
- A specific provider is selected (e.g., "openai")

**Test Steps:**
1. Click a column header to change sort (e.g., sort by context descending)
   **Expected:** Model list remains filtered to the selected provider; models are re-sorted within the filtered set; API call includes both `provider` and `sort_by`/`sort_dir` params

---

#### TC-S012-024: Provider filter persists during infinite scroll

**Priority:** P1 (High)
**Type:** Functional

**Preconditions:**
- A specific provider is selected
- Enough models exist to trigger infinite scroll

**Test Steps:**
1. Scroll to bottom of model table to trigger next page load
   **Expected:** Additional models loaded belong to the selected provider; API call includes `provider` param with incremented offset

---

#### TC-S012-025: Combobox closes after selecting a provider

**Priority:** P2 (Medium)
**Type:** UI

**Preconditions:**
- Provider combobox is open

**Test Steps:**
1. Click a provider option
   **Expected:** Dropdown closes; selected provider name displays in the combobox; model list updates

---

#### TC-S012-026: Keyboard navigation within combobox

**Priority:** P2 (Medium)
**Type:** UI / Accessibility

**Preconditions:**
- Provider combobox is open

**Test Steps:**
1. Press Arrow Down key
   **Expected:** Focus moves to next provider option
2. Press Enter on a highlighted option
   **Expected:** Provider is selected, dropdown closes, model list updates

---

### Regression — Existing Functionality

#### TC-S012-027: Model detail dialog still works with provider filter active

**Priority:** P1 (High)
**Type:** Regression

**Preconditions:**
- A provider is selected (e.g., "openai")
- Model list shows filtered models

**Test Steps:**
1. Click a model row to open the detail dialog
   **Expected:** Detail dialog opens with full model information; model's `provider_id` matches the selected filter

---

#### TC-S012-028: Theme toggle works with provider filter active

**Priority:** P2 (Medium)
**Type:** Regression

**Preconditions:**
- A provider is selected

**Test Steps:**
1. Toggle theme between light/dark
   **Expected:** Theme changes correctly; provider filter state is preserved; combobox renders correctly in both themes

---

#### TC-S012-029: Infinite scroll still works without provider filter

**Priority:** P1 (High)
**Type:** Regression

**Preconditions:**
- "All Providers" is selected (default state)

**Test Steps:**
1. Scroll down to trigger infinite scroll
   **Expected:** Next batch of models loads correctly; total count updates; same behavior as pre-S012

---

#### TC-S012-030: Search-only filtering still works (no provider selected)

**Priority:** P0 (Critical)
**Type:** Regression

**Preconditions:**
- "All Providers" is selected

**Test Steps:**
1. Type "claude" in the search box
   **Expected:** Models matching "claude" in name, ID, or family are returned (but NOT by `provider_id`); result count reflects filtered total; sorting and pagination work within the search result set

---

## Verification

- `GET /api/providers` returns sorted array like `["ai21-labs", "anthropic", "openai", ...]`
- `GET /api/models?provider=openai` returns only OpenAI models with correct total
- Search box typing "openai" does NOT match by provider_id
- Combobox type-ahead filters provider list within the dropdown
- Selecting a provider + typing a search query works as AND filter
- "All Providers" clears the provider filter
- Provider filter + sort + pagination all compose correctly
