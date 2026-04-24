# S013: Copy Model JSON

**Priority:** Medium\
**Depends on:** S008\
**Status:** Done

## User Story

As a user, I want to copy a model's JSON definition to my clipboard from the detail dialog so I can easily reuse model configuration when adding support for a model to another provider not yet listed on models.dev.

## Acceptance Criteria

```gherkin
Given I open a model detail dialog
Then I see a "Copy JSON" button in the dialog

When I click the "Copy JSON" button
Then the model's raw JSON definition (without provider_id) is copied to my clipboard as pretty-printed JSON
And I see a brief confirmation (e.g., button text changes to "Copied!" or a toast appears)

Given the copied JSON in my clipboard
Then it is the model object exactly as it appears in api.json (excluding provider_id)
And it is pretty-printed with 2-space indentation
And it does NOT include the provider_id field

When the model has optional fields that are undefined (e.g., family is missing)
Then those fields are NOT included in the copied JSON
And the copied JSON matches the original api.json structure for that model
```

## Tasks

1. Update `web/src/components/model-detail.tsx`:
   - Add a "Copy JSON" button next to the "Close" button in the dialog footer
   - On click, serialize the model object excluding `provider_id`, stripping undefined fields
   - Use `navigator.clipboard.writeText()` to copy pretty-printed JSON (2-space indent)
   - Show brief "Copied!" feedback on the button (revert after 2 seconds)
2. No backend changes needed — the detail endpoint already returns the full model; frontend just strips `provider_id` and undefined fields before copying

## Technical Notes

- Strip `provider_id` from the serialized object since it's a server-added field not present in api.json
- Strip undefined/missing optional fields to match the original api.json structure (JSON.stringify naturally omits undefined values)
- Use `JSON.stringify(modelData, null, 2)` for pretty-printed output
- `navigator.clipboard.writeText()` requires HTTPS or localhost — works in dev and production
- Button feedback: temporarily change button text to "Copied ✓" or similar, then revert after ~2s using setTimeout
- No new npm packages needed

## Test Cases

### TC-S013-001: Copy JSON button is visible in model detail dialog

**Priority:** P0 (Critical)
**Type:** Functional
**Preconditions:**
- Application is running and accessible
- At least one model is available in the model list

**Test Steps:**
1. Navigate to the application homepage
2. Click on any model row to open the model detail dialog
3. Inspect the dialog footer area

**Expected:**
- A "Copy JSON" button is visible in the dialog footer, positioned next to the "Close" button
- Button is clearly labeled and clickable

---

### TC-S013-002: Clicking Copy JSON copies model JSON to clipboard

**Priority:** P0 (Critical)
**Type:** Functional
**Preconditions:**
- Application is running and accessible
- At least one model is available in the model list
- Clipboard access is permitted (HTTPS or localhost)

**Test Steps:**
1. Open a model detail dialog for any model (e.g., `openai/gpt-4o`)
2. Click the "Copy JSON" button
3. Paste clipboard content into a text editor

**Expected:**
- Clipboard contains valid JSON
- JSON is the model object without `provider_id` field
- JSON is pretty-printed with 2-space indentation

---

### TC-S013-003: Copied JSON excludes provider_id field

**Priority:** P0 (Critical)
**Type:** Functional
**Preconditions:**
- Application is running and accessible

**Test Steps:**
1. Open a model detail dialog for any model
2. Click the "Copy JSON" button
3. Paste clipboard content into a text editor
4. Search for `provider_id` in the pasted JSON

**Expected:**
- The `provider_id` field is NOT present in the copied JSON
- All other model fields (id, name, family, etc.) that have values ARE present

---

### TC-S013-004: Copied JSON excludes undefined optional fields

**Priority:** P1 (High)
**Type:** Functional
**Preconditions:**
- Application is running and accessible
- A model with missing optional fields exists (e.g., a model with no `family`, `knowledge`, or `release_date`)

**Test Steps:**
1. Open a model detail dialog for a model known to have undefined optional fields (e.g., no `family` field)
2. Click the "Copy JSON" button
3. Paste clipboard content into a text editor
4. Verify the undefined fields are absent from the JSON

**Expected:**
- Undefined optional fields (e.g., `family`, `knowledge`, `release_date`) are NOT included in the JSON
- Fields that have values ARE included
- JSON structure matches the original api.json entry for that model

---

### TC-S013-005: Copied JSON is pretty-printed with 2-space indentation

**Priority:** P1 (High)
**Type:** Functional
**Preconditions:**
- Application is running and accessible

**Test Steps:**
1. Open a model detail dialog for any model
2. Click the "Copy JSON" button
3. Paste clipboard content into a text editor

**Expected:**
- JSON is formatted with 2-space indentation (not tab, not 4-space)
- JSON is human-readable with proper line breaks between fields
- Example format:
  ```json
  {
    "id": "gpt-4o",
    "name": "GPT-4o",
    "family": "GPT-4o",
    ...
  }
  ```

---

### TC-S013-006: Button shows "Copied" confirmation feedback

**Priority:** P1 (High)
**Type:** UI/Functional
**Preconditions:**
- Application is running and accessible

**Test Steps:**
1. Open a model detail dialog for any model
2. Click the "Copy JSON" button
3. Observe the button text immediately after clicking
4. Wait approximately 2 seconds
5. Observe the button text again

**Expected:**
- Immediately after click, button text changes to a confirmation state (e.g., "Copied!" or "Copied ✓")
- After ~2 seconds, button text reverts back to "Copy JSON"
- Button remains clickable after revert

---

### TC-S013-007: Copy JSON button works with namespaced model IDs

**Priority:** P1 (High)
**Type:** Functional
**Preconditions:**
- Application is running and accessible
- A model with a namespaced ID (containing slashes) exists (e.g., `ai21-labs/ai21-jamba-1.5-large`)

**Test Steps:**
1. Open a model detail dialog for a model with a namespaced ID
2. Click the "Copy JSON" button
3. Paste clipboard content into a text editor
4. Verify the `id` field in the JSON contains the full namespaced ID

**Expected:**
- JSON is copied successfully despite the model having a namespaced ID
- The `id` field preserves whatever value is in the model's `id` property as stored in api.json (may or may not include slashes depending on the data)
- `provider_id` is still excluded

---

### TC-S013-008: Copy JSON works on dark theme

**Priority:** P2 (Medium)
**Type:** UI
**Preconditions:**
- Application is running and accessible
- Theme is set to dark mode

**Test Steps:**
1. Switch the application to dark theme using the theme toggle
2. Open a model detail dialog for any model
3. Verify the "Copy JSON" button is visible and styled correctly
4. Click the "Copy JSON" button
5. Paste clipboard content into a text editor

**Expected:**
- "Copy JSON" button is visible and readable in dark theme
- Button uses appropriate dark theme styling (consistent with other buttons)
- Copy functionality works correctly in dark theme
- Confirmation feedback displays correctly in dark theme

---

### TC-S013-009: Copy JSON works on light theme

**Priority:** P2 (Medium)
**Type:** UI
**Preconditions:**
- Application is running and accessible
- Theme is set to light mode

**Test Steps:**
1. Switch the application to light theme using the theme toggle
2. Open a model detail dialog for any model
3. Verify the "Copy JSON" button is visible and styled correctly
4. Click the "Copy JSON" button
5. Paste clipboard content into a text editor

**Expected:**
- "Copy JSON" button is visible and readable in light theme
- Button uses appropriate light theme styling (consistent with other buttons)
- Copy functionality works correctly in light theme
- Confirmation feedback displays correctly in light theme

---

### TC-S013-010: Copied JSON preserves nested object structures

**Priority:** P1 (High)
**Type:** Functional
**Preconditions:**
- Application is running and accessible
- A model with populated nested fields is selected (e.g., model with `cost`, `limit`, and `modalities`)

**Test Steps:**
1. Open a model detail dialog for a model with populated `cost`, `limit`, and `modalities` fields
2. Click the "Copy JSON" button
3. Paste clipboard content into a text editor
4. Verify nested object structures are intact

**Expected:**
- `cost` object is present with `input` and `output` numeric values
- `limit` object is present with `context` and `output` numeric values
- `modalities` object is present with `input` and `output` arrays
- Nested objects are also pretty-printed with 2-space indentation
- No data loss or corruption in nested structures

---

### TC-S013-011: Copy JSON button can be clicked multiple times

**Priority:** P2 (Medium)
**Type:** Functional
**Preconditions:**
- Application is running and accessible

**Test Steps:**
1. Open a model detail dialog for any model
2. Click the "Copy JSON" button
3. Wait for confirmation to revert (~2 seconds)
4. Click the "Copy JSON" button again
5. Paste clipboard content into a text editor

**Expected:**
- Second click also copies JSON successfully
- Clipboard content from the second click matches the expected JSON
- Button feedback works correctly on repeated clicks
- No JavaScript errors in browser console

---

### TC-S013-012: Copy JSON button does not cause dialog to close

**Priority:** P1 (High)
**Type:** Functional
**Preconditions:**
- Application is running and accessible

**Test Steps:**
1. Open a model detail dialog for any model
2. Click the "Copy JSON" button
3. Observe the dialog state

**Expected:**
- Dialog remains open after clicking "Copy JSON"
- Only the "Close" button (or dialog overlay click) closes the dialog
- User can click "Copy JSON" and then continue viewing the model detail

---

### TC-S013-013: Clipboard API failure is handled gracefully

**Priority:** P2 (Medium)
**Type:** Functional — Error Handling
**Preconditions:**
- Application is running in a context where `navigator.clipboard.writeText()` may fail (e.g., non-HTTPS, non-localhost, or clipboard permission denied)

**Test Steps:**
1. Open the application in a non-secure context (if possible) or deny clipboard permission
2. Open a model detail dialog for any model
3. Click the "Copy JSON" button
4. Observe application behavior

**Expected:**
- No unhandled JavaScript error crashes the application
- Dialog remains functional
- User receives some indication that the copy failed (or button gracefully handles the error without breaking the UI)
