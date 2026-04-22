# Test Cases: S004 - Root Shell & App Layout

**Story:** [S004-root-shell.md](../stories/S004-root-shell.md) | **Test Cases:**
this file **Total Cases:** 5 | P0: 1 | P1: 3 | P2: 1

---

## TC-S004-001: Header displays "ModelLens" branding

**Priority:** P0 (Critical) **Type:** UI **Preconditions:** Server running

1. Navigate to the app URL **Expected:** Header bar visible at top of page
   **Expected:** "ModelLens" text visible in header

---

## TC-S004-002: Initial 100 models load on page load

**Priority:** P1 (High) **Type:** Functional **Preconditions:** Server running

1. Open the app, wait for page to load **Expected:** 100 models visible in
   content area (unstyled is OK at this stage)

---

## TC-S004-003: Page title set

**Priority:** P2 (Medium) **Type:** UI **Preconditions:** Server running

1. Check browser tab title **Expected:** Tab shows "ModelLens" (or "ModelLens -
   LLM Model Browser")

2. View page source, check `<title>` tag **Expected:**
   `<title>ModelLens</title>` or similar

---

## TC-S004-004: Component state initialized correctly

**Priority:** P1 (High) **Type:** Functional **Preconditions:** App component
mounted

1. Verify Lit-Element reactive properties initialized:
   - `query` initialized to empty string
   - `sortBy` initialized to "name"
   - `sortDir` initialized to "asc" **Expected:** Default values set correctly

---

## TC-S004-005: Content area below header

**Priority:** P1 (High) **Type:** UI

1. View page layout **Expected:** Header at top, content area fills remaining
   vertical space **Expected:** No horizontal scrollbar at 1920px width
