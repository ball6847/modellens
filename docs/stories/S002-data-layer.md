# S002: Data Layer (models + app_data)

**Priority:** Critical\
**Depends on:** S001\
**Status:** Pending\
**Test Cases:** [S002-data-layer.md](../test-cases/S002-data-layer.md)

## User Story

As a developer, I need the data layer structs and JSON loading logic so that
API handlers can query model data from memory.

## Acceptance Criteria

```gherkin
Given api.json exists at the project root
When the server starts
Then AppData loads all 4,274 models into a []Model
And each Model has the correct provider_id from its parent provider
And the server logs "Loaded 4,274 models from api.json"

Given api.json is missing or invalid
When the server starts
Then the server exits with a clear error message
```

## Tasks

1. Create `internal/models/model.go` with structs: Model, Modalities, Cost,
   ModelLimit, ModelPage, SortField, SortDir
2. Add `json` struct tags for serialization
3. Create `internal/data/appdata.go` with `AppData { Models []Model }`
4. Implement `AppData::Load(path string) (*AppData, error)` — reads JSON, parses
   into `map[string]Provider`, flattens to `[]Model` with provider_id injected
5. Define SortField and SortDir as string constants
6. Wire AppData loading into `cmd/server/main.go` server startup
7. Pass `*AppData` to API handlers

## Technical Notes

- JSON root: `map[string]Provider` where Provider has a `models` field
- Each model under a provider gets `provider_id = provider_key`
- All optional fields use pointer types (`*string`, `*bool`, `*Cost`)
- Fail fast at startup — `log.Fatalf` if data loading fails

## Verification

- Unit test: parse api.json, assert model count == 4274
- Unit test: first model has non-empty provider_id
- Unit test: missing file causes error
