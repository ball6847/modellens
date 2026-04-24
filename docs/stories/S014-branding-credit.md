# S014: Branding & Credit

**Priority:** Medium\
**Depends on:** S004\
**Status:** Done

## User Story

As a visitor to ModelLens, I want to see a logo icon that identifies the app and a credit to models.dev as the data source, so that I can recognize the brand and discover where the model data comes from.

## Acceptance Criteria

```gherkin
Given I view the ModelLens page
Then I see a logo icon in the navbar next to the "ModelLens" title on the left side
And I see "Made possible by models.dev" as muted text on the right side of the navbar before the theme toggle
And I see the ModelLens logo as a favicon in my browser tab

Given I view the ModelLens page in light mode
Then the logo icon uses a light-mode-appropriate variant (monochrome, theme-aware)

Given I view the ModelLens page in dark mode
Then the logo icon switches to a dark-mode-appropriate variant

Given I view the ModelLens page on a mobile/narrow screen
Then the "Made possible by models.dev" credit text is hidden
And the logo and title remain visible

When I click the "Made possible by models.dev" link
Then https://models.dev opens in a new browser tab
And the link has target="_blank" and rel="noopener noreferrer"

When I navigate to the credit link via keyboard
Then the link is focusable
And a visible focus ring appears

Given the logo icon is rendered
Then it visually suggests a lens/magnifier combined with a data element
And the SVG file size is under 2KB

Given the navbar layout
Then logo + "ModelLens" title are on the left
And "Made possible by models.dev" + theme toggle are on the right
And the credit text is visually muted compared to other header elements
```

## Design Decisions

- **Logo**: Placeholder inline SVG with lens/magnifier + data concept. Monochrome, theme-aware via `currentColor`. Two variants (light/dark) selected via theme context. Stored in `web/src/components/logo.tsx`.
- **Favicon**: SVG `<link rel="icon" type="image/svg+xml">` in `index.html`.
- **Credit**: Muted `<a>` link, `target="_blank" rel="noopener noreferrer"`. Hidden on mobile via Tailwind responsive class.
- **No new npm packages** — pure SVG + CSS.
- AI generation prompt documented in PRD (`docs/prds/branding-credit-v1.0-prd.md`) for future high-fidelity logo.

## Files to Change

| File | Change |
|------|--------|
| `web/src/components/logo.tsx` | **New** — SVG logo component with light/dark variants |
| `web/src/App.tsx` | Add logo to navbar left, add credit link to navbar right (before theme toggle) |
| `web/index.html` | Add SVG favicon `<link>` tag |

## Out of Scope

- Splash screen / loading state logo
- Marketing page / about page
- PNG favicon fallbacks
- Backend changes
