# S003: Server Functions (search + detail)

**Priority:** Critical\
**Depends on:** S002\
**Status:** Pending\
**Test Cases:**
[S003-server-functions.md](../test-cases/S003-server-functions.md)

## User Story

As a client, I need server functions to search/filter/sort/paginate models and
get individual model details so that I can browse the database without
downloading it all.

## Acceptance Criteria

```gherkin
Given the server has AppData in context
When I call search_models(None, SortField::Name, SortDir::Asc, 0, 100)
Then I receive ModelPage with 100 models sorted by name and total=4274

When I call search_models(Some("gpt"), SortField::Name, SortDir::Asc, 0, 100)
Then I receive models where name/id/family/provider_id contains "gpt" (case-insensitive)

When I call search_models(Some("xyz"), _, _, 0, 100)
Then I receive ModelPage { models: [], total: 0 }

When I call get_model_detail("anthropic", "claude-3.5-sonnet")
Then I receive the matching Model struct
```

## Tasks

1. Create `src/server_fns.rs`
2. Implement
   `search_models(query, sort_by, sort_dir, offset, limit) -> Result<ModelPage, ServerFnError>`
   - Filter: case-insensitive substring on name, id, family, provider_id
   - Sort: by SortField in SortDir (handle None values — sort to end)
   - Paginate: skip(offset).take(limit), cap limit at 100
   - Return ModelPage { models, total }
3. Implement
   `get_model_detail(provider_id, model_id) -> Result<Model, ServerFnError>`
   - Find by provider_id + id match
   - Return Err if not found
4. Extract search/sort logic into pure functions for testability
5. Add `#[server]` attribute macros

## Technical Notes

- Use `expect_context::<Arc<AppData>>()` inside server functions
- Sort: match on SortField, compare with cmp, handle Option with
  `.unwrap_or(f64::MAX)` for costs
- Limit cap: `let limit = limit.min(100);`

## Verification

- Unit test: empty query returns all models
- Unit test: "gpt" returns >0 results
- Unit test: "xyz" returns total: 0
- Unit test: pagination offset produces different first model
- Unit test: sort ascending vs descending produces reversed order
- Unit test: get_model_detail with valid id returns model
- Unit test: get_model_detail with invalid id returns error
