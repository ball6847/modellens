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

1. Create `src/components/model_table.rs` and `src/components/model_row.rs`
2. Column headers: clickable, show sort indicator (arrow) for active sort column
3. On column click: toggle sort_dir if same column, else set new sort_by + Asc
4. Call `search_models(query, new_sort, 0, 100)` on sort change
5. Render rows via ModelRow component
6. Each row: Provider, Name, ID, formatted Context, formatted costs, Feature
   badges
7. Context formatting: >=1M → "X.XM", >=1K → "XK", else as-is
8. Cost formatting: Some(x) → "$X.XX", None → "—"
9. Badge colors: Tools=blue, Reasoning=purple, Files=green, Open=orange
10. Row click handler: emit `(provider_id, model_id)` callback

## Technical Notes

- Format functions: `format_context(v: Option<u64>) -> String`,
  `format_cost(v: Option<f64>) -> String`
- Sort callback triggers parent to re-fetch with new sort params
- Use `class:` syntax for conditional Tailwind classes on badges

## Verification

- All 7 columns render with data
- Sort by each column works (ascending + descending)
- Context "128000" displays as "128K"
- Cost 0.29 displays as "$0.29", None displays as "—"
- Badges render with correct colors for true values
- Row click triggers callback
