# Test Cases: S004 - Root Shell & App Layout

**Story:** [S004-root-shell.md](../stories/S004-root-shell.md) | **Test Cases:**
this file **Total Cases:** 5 | P0: 1 | P1: 3 | P2: 1

---

## TC-S004-001: Header displays "ModelLens" branding

**Priority:** P0 (Critical) **Type:** UI **Preconditions:** Server running

1. Navigate to `http://localhost:3000` **Expected:** Header bar visible at top
   of page **Expected:** "ModelLens" text visible in header

---

## TC-S004-002: Initial 100 models load via SSR

**Priority:** P0 (Critical) **Type:** Functional **Preconditions:** Server
running

1. View page source (before JS loads) **Expected:** HTML contains model data
   rendered server-side

2. After hydration, view page **Expected:** 100 models visible in content area
   (unstyled is OK at this stage)

---

## TC-S004-003: Page title and meta tags set

**Priority:** P2 (Medium) **Type:** UI **Preconditions:** Server running

1. Check browser tab title **Expected:** Tab shows "ModelLens" (or "ModelLens -
   LLM Model Browser")

2. View page source, check `<title>` tag **Expected:**
   `<title>ModelLens</title>` or similar

---

## TC-S004-004: Signals initialized correctly

**Priority:** P1 (High) **Type:** Functional **Preconditions:** App component
mounted

1. Verify reactive signals exist:
   - `query: RwSignal<Option<String>>` initialized to None
   - `sort_by: RwSignal<SortField>` initialized to SortField::Name
   - `sort_dir: RwSignal<SortDir>` initialized to SortDir::Asc **Expected:**
     Default values set correctly

---

## TC-S004-005: Content area below header

**Priority:** P1 (High) **Type:** UI

1. View page layout **Expected:** Header at top, content area fills remaining
   vertical space **Expected:** No horizontal scrollbar at 1920px width
