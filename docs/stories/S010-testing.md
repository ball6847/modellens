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
Given I run `cargo test`
Then all tests pass covering:
  - Data loading (parse, flatten, provider_id assignment)
  - Search (empty query, case-insensitive, substring, no-match)
  - Sort (by each field, ascending/descending, None handling)
  - Formatting (context K/M, cost $X.XX, cost None → "—")
```

## Tasks

1. Create test module in `src/models.rs` (format functions)
2. Create test module in `src/app_data.rs` (data loading)
3. Create test module in `src/server_fns.rs` (search, sort, pagination)
4. Test helper: `test_app_data()` loads a small fixture or subset of api.json
5. Data loading tests: parse success, model count, provider_id correctness
6. Search tests: empty query, "gpt" match, case-insensitive, family match,
   no-match → total:0
7. Sort tests: Name asc/desc, Context numeric, InputCost with None values
8. Format tests: 128000→"128K", 1000000→"1M", 8192→"8K", cost formatting, None
   cost
9. Pagination tests: offset produces different pages, limit cap at 100

## Technical Notes

- Extract pure functions from server functions for testability (search_logic,
  sort_logic)
- Use `#[cfg(test)] mod tests` pattern
- For data loading tests, can use `include_str!("../api.json")` or a small test
  fixture
- Consider `rstest` or plain `#[test]` functions

## Verification

- `cargo test` passes all tests
- Tests cover: data loading, search (4+ cases), sort (4+ cases), formatting (6+
  cases), pagination (2+ cases)
