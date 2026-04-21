# S002: Data Layer (models + app_data)

**Priority:** Critical\
**Depends on:** S001\
**Status:** Pending\
**Test Cases:** [S002-data-layer.md](../test-cases/S002-data-layer.md)

## User Story

As a developer, I need the data layer structs and JSON loading logic so that
server functions can query model data from memory.

## Acceptance Criteria

```gherkin
Given api.json exists at the project root
When the server starts
Then AppData loads all 4,274 models into a Vec<Model>
And each Model has the correct provider_id from its parent provider
And the server logs "Loaded 4,274 models from api.json"

Given api.json is missing or invalid
When the server starts
Then the server panics with a clear error message
```

## Tasks

1. Create `src/models.rs` with structs: Model, Modalities, Cost, ModelLimit,
   ModelPage, SortField, SortDir
2. Add `Serialize`/`Deserialize`/`Clone`/`Debug` derives
3. Create `src/app_data.rs` with `AppData { models: Vec<Model> }`
4. Implement `AppData::load(path: &str) -> Result<AppData>` — reads JSON, parses
   into `HashMap<String, Provider>`, flattens to `Vec<Model>` with provider_id
   injected
5. Add `PartialEq` derive on SortField and SortDir
6. Wire AppData loading into `main.rs` server startup
7. Wrap in `Arc<AppData>` and provide via Leptos `provide_context()`

## Technical Notes

- JSON root: `HashMap<String, Provider>` where Provider has a `models` field
- Each model under a provider gets `provider_id = provider_key`
- All optional fields use `Option<T>`
- Fail fast at startup — `expect("Failed to load api.json: ...")`

## Verification

- Unit test: parse api.json, assert model count == 4274
- Unit test: first model has non-empty provider_id
- Unit test: missing file causes panic
