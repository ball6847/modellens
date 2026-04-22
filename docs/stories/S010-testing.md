# S010: Unit Tests (data/search/sort/format)

**Priority:** Medium\
**Depends on:** S003\
**Status:** Pending\
**Test Cases:** [S010-unit-tests.md](../test-cases/S010-unit-tests.md)

## User Story

As a developer, I need comprehensive unit tests for data loading, search, sort,
and formatting logic so that I can verify correctness and prevent regressions.

## Acceptance Criteria

```gherkin
Given I run `go test ./...`
Then all tests pass covering:
  - Data loading (parse, flatten, provider_id assignment)
  - Search (empty query, case-insensitive, substring, no-match)
  - Sort (by each field, ascending/descending, nil handling)
  - Formatting (context K/M, cost $X.XX, cost nil → "—")
```

## Tasks

1. Create test file `internal/data/appdata_test.go` (data loading)
2. Create test file `internal/api/handler_test.go` (search, sort, pagination)
3. Create formatting test helpers in `internal/models/model_test.go`
4. Test helper: `testAppData()` loads a small fixture or subset of api.json
5. Data loading tests: parse success, model count, provider_id correctness
6. Search tests: empty query, "gpt" match, case-insensitive, family match,
   no-match → total:0
7. Sort tests: Name asc/desc, Context numeric, InputCost with nil values
8. Format tests: 128000→"128K", 1000000→"1M", 8192→"8K", cost formatting, nil
   cost
9. Pagination tests: offset produces different pages, limit cap at 100
10. API handler tests using `net/http/httptest`

## Technical Notes

- Extract pure methods on AppData for testability (Filter, Sort, Find)
- Use `httptest.NewRecorder()` and `httptest.NewRequest()` for handler tests
- For data loading tests, can use a small test fixture JSON file
- Table-driven tests following Go conventions

## Verification

- `go test ./...` passes all tests
- Tests cover: data loading, search (4+ cases), sort (4+ cases), formatting (6+
  cases), pagination (2+ cases)
