# S006: Model Table Component

**Priority:** High\
**Depends on:** S004\
**Status:** Pending\
**Test Cases:** [S006-model-table.md](../test-cases/S006-model-table.md)

## User Story

As a user, I want to see models in a table with sortable columns so that I can
browse and compare models at a glance.

## Acceptance Criteria

```gherkin
Given models are loaded
Then I see a table with columns: Provider, Name, ID, Context, Input Cost, Output Cost, Features

When I click the "Context" column header
Then models are sorted by context window size descending
And the column header shows a sort direction indicator

When I click "Context" again
Then the sort direction toggles to ascending

Given a model has tool_call=true and reasoning=true
Then I see blue "Tools" and purple "Reasoning" badges in the Features column

Given a model has context=128000
Then I see "128K" in the Context column

Given a model has cost.input=0.29
Then I see "$0.29" in the Input Cost column
```

## Tasks

1. Create `web/src/model-table.ts` and `web/src/model-row.ts` as Lit components
2. Column headers: clickable, show sort indicator (arrow) for active sort column
3. On column click: dispatch `sort-changed` event with `{ sortBy, sortDir }`
4. Render rows via `<model-row>` component
5. Each row: Provider, Name, ID, formatted Context, formatted costs, Feature
   badges
6. Context formatting: >=1M → "X.XM", >=1K → "XK", else as-is
7. Cost formatting: value → "$X.XX", null → "—"
8. Badge colors: Tools=blue, Reasoning=purple, Files=green, Open=orange
9. Row click: dispatch `row-clicked` event with `{ providerId, modelId }`

## Technical Notes

- Format functions: `formatContext(v: number | null): string`,
  `formatCost(v: number | null): string`
- Sort callback triggers parent to re-fetch with new sort params
- Use Tailwind classes for badge styling

## Verification

- All 7 columns render with data
- Sort by each column works (ascending + descending)
- Context "128000" displays as "128K"
- Cost 0.29 displays as "$0.29", null displays as "—"
- Badges render with correct colors for true values
- Row click triggers callback
