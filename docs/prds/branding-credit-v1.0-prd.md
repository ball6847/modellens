# Branding & Credit - Product Requirements Document (PRD)

## Requirements Description

### Background
- **Business Problem**: ModelLens lacks visual identity (no logo/icon) and does not credit models.dev, the data source that makes the app possible. Users visiting the site see a plain text title with no brand mark, and models.dev receives no attribution.
- **Target Users**: All ModelLens visitors — developers and researchers browsing LLM model databases.
- **Value Proposition**: A logo establishes brand identity and professionalism. Crediting models.dev is both ethical (they provide the data) and practical (users can discover the source).

### Feature Overview
- **Core Features**:
  1. Logo icon for ModelLens — lens/magnifier + data concept
  2. "Made possible by models.dev" credit in header
- **Feature Boundaries**:
  - Included: Navbar logo, favicon, header credit link
  - Not included: Redesigning the overall page layout, splash screens, loading states, marketing pages
- **User Scenarios**:
  - User opens ModelLens → sees logo icon next to title in navbar, identifies the brand
  - User wants to explore the original data source → clicks "Made possible by models.dev" → opens models.dev in new tab
  - User bookmarks the site → sees ModelLens logo in browser tab via favicon

### Detailed Requirements
- **Input/Output**: No user input required — branding and credit are always visible (credit hidden on mobile)
- **User Interaction**: Credit is a clickable link; logo is purely visual
- **Data Requirements**: Two SVG logo variants (light/dark theme-aware, monochrome). AI generation prompt for future high-fidelity logo.
- **Edge Cases**:
  - Dark mode: logo switches to dark variant
  - Mobile/narrow screens: credit text hides to preserve navbar space
  - Clipboard/keyboard: credit link should be keyboard-focusable with visible focus ring

## Design Decisions

### Technical Approach
- **Logo Implementation**: Inline SVG component (React) with `currentColor` for theme adaptation. Two variants selected via CSS class or theme context. Stored in `web/src/components/logo.tsx`.
- **Favicon**: SVG `<link rel="icon" type="image/svg+xml">` in `index.html`. Modern browsers support SVG favicons natively.
- **Credit Implementation**: Text link in header navbar, right side, before theme toggle. Uses `<a>` with `target="_blank" rel="noopener noreferrer"`. Styled with muted/secondary text color. Hidden on mobile via Tailwind `hidden md:inline` or similar.
- **AI Generation Prompt**: Written prompt for ChatGPT/DALL-E/Midjourney included in the PRD appendix. User generates externally and replaces placeholder SVG.

### Key Components
1. `web/src/components/logo.tsx` — SVG logo component with light/dark variants
2. `web/src/App.tsx` — Updated navbar layout (logo left, credit+toggle right)
3. `web/index.html` — Favicon link tag
4. `web/src/assets/logo-light.svg` / `logo-dark.svg` — SVG asset files (if not inline)

### Constraints
- **Performance**: Inline SVG preferred over external file to avoid extra HTTP request. Should be < 2KB.
- **Compatibility**: SVG favicon works in Chrome, Firefox, Safari, Edge. No PNG fallback needed for this project's target audience.
- **Accessibility**: Credit link must have `aria-label` or descriptive text. Logo image needs `aria-hidden="true"` or alt text.

### Risk Assessment
- **Technical Risks**: Low — SVG logo and text link are standard patterns.
- **Dependency Risks**: None — no new npm packages required.
- **Schedule Risks**: Minimal — primarily UI work, no backend changes.

## Acceptance Criteria

### Functional Acceptance
- [ ] Logo icon appears in navbar next to "ModelLens" title (left side)
- [ ] Logo icon adapts to dark mode (different variant or color)
- [ ] SVG favicon appears in browser tab
- [ ] "Made possible by models.dev" text appears in header (right side, before theme toggle)
- [ ] Credit link opens https://models.dev in new tab
- [ ] Credit link has `target="_blank" rel="noopener noreferrer"`
- [ ] Credit text is visually muted/subtle compared to other header elements
- [ ] Credit text is hidden on mobile/narrow screens
- [ ] Credit link is keyboard-focusable
- [ ] Placeholder SVG logo is included in the codebase
- [ ] AI generation prompt is documented in the story/PRD for future use

### Quality Standards
- [ ] `npm run build` passes cleanly
- [ ] `npm run lint` passes with 0 errors
- [ ] SVG logo file size < 2KB
- [ ] Works in both light and dark themes

### User Acceptance
- [ ] Navbar layout looks balanced with logo, title, credit, and toggle
- [ ] Credit is readable but not visually dominant
- [ ] Logo concept clearly suggests "lens/magnifier + data"
- [ ] Favicon is crisp and recognizable at tab size (16x16 effective)

## Execution Phases

### Phase 1: Logo Component
**Goal**: Create placeholder SVG logo and React component
- [ ] Create `logo.tsx` component with light/dark variants (monochrome, theme-aware via `currentColor`)
- [ ] Design lens/magnifier + data SVG concept as placeholder
- [ ] Add SVG favicon link to `index.html`
- [ ] Document AI generation prompt in story file
- **Deliverables**: `logo.tsx`, favicon in `index.html`, AI prompt

### Phase 2: Navbar Integration
**Goal**: Add logo and credit to the header navbar
- [ ] Update `App.tsx` navbar: logo + title on left, credit + theme toggle on right
- [ ] Add "Made possible by models.dev" muted link
- [ ] Hide credit on mobile (`hidden md:inline` or similar)
- [ ] Ensure keyboard accessibility on credit link
- **Deliverables**: Updated `App.tsx` navbar

### Phase 3: Verification
**Goal**: Ensure quality and cross-theme consistency
- [ ] Run `npm run build` — must pass
- [ ] Run `npm run lint` — 0 errors
- [ ] Visual check in light and dark themes
- [ ] Visual check on mobile viewport (credit hidden)
- [ ] Verify credit link opens models.dev in new tab
- **Deliverables**: Verified build and lint

---

## Appendix: AI Logo Generation Prompt

Use the following prompt with ChatGPT (DALL-E), Midjourney, or similar tools to generate a polished logo:

> **Prompt**: Create a minimalist, monochrome logo icon for "ModelLens", a web app for browsing AI/LLM model databases. The icon should combine a magnifying glass (lens) with a data element (small grid, database cylinder, or abstract data nodes). Style: clean, flat, single-color, works on both light and dark backgrounds. No text. Square aspect ratio, suitable for use as a favicon and navbar icon at 32x32px effective size. Think: simple enough to be recognizable at 16x16, detailed enough to be interesting at 64x64.

> **Style notes**: Monochrome line art, stroke-based (not filled). Thin, elegant lines. The magnifying glass should be the dominant shape, with 2-3 small data indicators (dots, mini bars, or grid cells) visible through or near the lens.

---

**Document Version**: 1.0
**Created**: 2026-04-25
**Clarification Rounds**: 4
**Quality Score**: 90/100
