# S003: REST API Endpoints (search + detail)

**Priority:** Critical\
**Depends on:** S002\
**Status:** Pending\
**Test Cases:**
[S003-server-functions.md](../test-cases/S003-server-functions.md)

## User Story

As a client, I need REST API endpoints to search/filter/sort/paginate models and
get individual model details so that I can browse the database without
downloading it all.

## Acceptance Criteria

```gherkin
Given the server has AppData loaded
When I call GET /api/models?offset=0&limit=100
Then I receive ModelPage with 100 models sorted by name and total=4274

When I call GET /api/models?query=gpt&offset=0&limit=100
Then I receive models where name/id/family/provider_id contains "gpt" (case-insensitive)

When I call GET /api/models?query=xyz&offset=0&limit=100
Then I receive ModelPage { models: [], total: 0 }

When I call GET /api/models/anthropic/claude-3.5-sonnet
Then I receive the matching Model JSON
```

## Tasks

1. Create `internal/api/handler.go` with `Handler` struct holding `*AppData`
2. Implement `SearchModels(w, r)` handler
   - Parse query params: query, sort_by, sort_dir, offset, limit
   - Filter: case-insensitive substring on name, id, family, provider_id
   - Sort: by SortField in SortDir (handle nil values — sort to end)
   - Paginate: skip offset, take limit, cap limit at 100
   - Return ModelPage as JSON
3. Implement `GetModelDetail(w, r)` handler
   - Path params: provider_id, model_id
   - Find by provider_id + id match
   - Return 404 if not found
4. Extract search/sort logic into pure functions on AppData for testability
5. Register routes in main.go: `mux.HandleFunc("GET /api/models", ...)` and
   `mux.HandleFunc("GET /api/models/{provider_id}/{model_id}", ...)`
6. Add CORS headers for development

## Technical Notes

- Go 1.22+ ServeMux supports `GET /api/models/{provider_id}/{model_id}` patterns
- Sort: use sort.Slice with comparison function, handle nil with sentinels
- Limit cap: `if limit > 100 { limit = 100 }`
- Use `json.NewEncoder(w).Encode()` for JSON responses
- Set `Content-Type: application/json` header

## Verification

- Unit test: empty query returns all models
- Unit test: "gpt" returns >0 results
- Unit test: "xyz" returns total: 0
- Unit test: pagination offset produces different first model
- Unit test: sort ascending vs descending produces reversed order
- Unit test: get model detail with valid id returns model
- Unit test: get model detail with invalid id returns 404
