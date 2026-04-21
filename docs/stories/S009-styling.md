# S009: Tailwind CSS Styling

**Priority:** Medium\
**Depends on:** S005, S006\
**Status:** Pending\
**Test Cases:** [S009-styling.md](../test-cases/S009-styling.md)

## User Story

As a user, I want the app to look polished with a clean, responsive design so
that I can comfortably browse models on any screen size.

## Acceptance Criteria

```gherkin
Given the app loads
Then the header has a dark background with white "ModelLens" text
And the search box is full-width with a clean border
And the table has alternating row colors and clear column headers

Given I view on a mobile screen (375px width)
Then the table scrolls horizontally
And the search box remains full-width

Given a model has tool_call=true
Then I see a small blue pill badge labeled "Tools"
```

## Tasks

1. Configure Tailwind CSS with cargo-leptos (tailwind.config.js, PostCSS)
2. Style header: dark bg, white text, padding, sticky
3. Style search box: full-width, border, focus ring, padding
4. Style table: `w-full`, `border-collapse`, alternating `bg-gray-50`/`bg-white`
5. Style column headers: `cursor-pointer`, hover effect, sort arrow indicator
6. Style feature badges: small pills with colored backgrounds and white text
7. Style loading spinner: centered, animated
8. Style detail view: card-like panel with padding and shadow
9. Responsive: `overflow-x-auto` on table wrapper for mobile
10. Style empty state: centered message with icon

## Technical Notes

- Tailwind with cargo-leptos: `style/main.scss` imports tailwind directives
- `@tailwind base; @tailwind components; @tailwind utilities;`
- May need `npx tailwindcss` in build process or cargo-leptos tailwind
  integration
- Badge classes: `inline-block px-2 py-0.5 text-xs font-semibold rounded-full`

## Verification

- App looks clean and professional
- No unstyled elements
- Mobile: table scrolls horizontally, no overflow
- Badges have correct colors
- Sort indicators visible
