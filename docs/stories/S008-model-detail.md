# S008: Model Detail View

**Priority:** Medium\
**Depends on:** S006\
**Status:** Pending\
**Test Cases:** [S008-model-detail.md](../test-cases/S008-model-detail.md)

## User Story

As a user, I want to click a model row and see full details so that I can
inspect all model properties including modalities and knowledge cutoff.

## Acceptance Criteria

```gherkin
Given I click a model row
Then I see an expanded detail view showing all model fields:
  - Provider, Name, ID, Family
  - Context window, Output limit
  - Input cost, Output cost
  - Modalities (input/output lists)
  - Features (tool_call, reasoning, attachment, open_weights, temperature)
  - Knowledge cutoff, Release date, Last updated

Given I click the same row again or click a close button
Then the detail view collapses
```

## Tasks

1. Create `src/components/model_detail.rs`
2. Implement as expandable section below the clicked row (or a side panel)
3. Call `get_model_detail(provider_id, model_id)` to fetch full data
4. Display all Model fields in a structured layout (key-value pairs or grid)
5. Format values: context as K/M, costs as $X.XX, dates as-is, booleans as
   Yes/No
6. Modalities: display as comma-separated lists (input: text, image; output:
   text)
7. Close button or toggle behavior (click same row to collapse)
8. Track `selected_model: Signal<Option<Model>>`

## Technical Notes

- Can use `create_action` for get_model_detail call
- Expanded row approach: insert detail row after clicked row in table
- Alternative: side panel with slide-in animation
- Feature flags display as badges (same style as table badges)

## Verification

- Click row shows detail with all fields
- All fields display correctly formatted
- Click same row or close button collapses detail
- Detail shows correct model data
