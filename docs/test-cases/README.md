# Test Cases Index: ModelLens MVP

**Version:** 1.1 **Date:** 2026-04-22 **Based on:** docs/tech-spec.md,
docs/sprint-status.yaml

## Per-Story Test Plans

| Story     | File                                                       | Cases  | P0     | P1     | P2    | P3    |
| --------- | ---------------------------------------------------------- | ------ | ------ | ------ | ----- | ----- |
| S001      | [S001-project-scaffolding.md](S001-project-scaffolding.md) | 6      | 3      | 3      | 0     | 0     |
| S002      | [S002-data-layer.md](S002-data-layer.md)                   | 8      | 4      | 3      | 1     | 0     |
| S003      | [S003-server-functions.md](S003-server-functions.md)       | 16     | 8      | 4      | 0     | 0     |
| S004      | [S004-root-shell.md](S004-root-shell.md)                   | 5      | 1      | 3      | 1     | 0     |
| S005      | [S005-search-box.md](S005-search-box.md)                   | 7      | 4      | 2      | 0     | 0     |
| S006      | [S006-model-table.md](S006-model-table.md)                 | 9      | 5      | 3      | 0     | 0     |
| S007      | [S007-infinite-scroll.md](S007-infinite-scroll.md)         | 7      | 4      | 3      | 0     | 0     |
| S008      | [S008-model-detail.md](S008-model-detail.md)               | 5      | 3      | 2      | 0     | 0     |
| S009      | [S009-styling.md](S009-styling.md)                         | 8      | 2      | 3      | 2     | 0     |
| S010      | [S010-unit-tests.md](S010-unit-tests.md)                   | 6      | 1      | 5      | 0     | 0     |
| S011      | [S011-polish.md](S011-polish.md)                           | 9      | 2      | 3      | 3     | 1     |
| **Total** |                                                            | **86** | **37** | **34** | **7** | **1** |

## Test Environment

| Item       | Value                                           |
| ---------- | ----------------------------------------------- |
| OS         | Linux                                           |
| Go         | 1.22+                                           |
| Node.js    | 18+                                             |
| Browser    | Chrome 130+, Firefox 130+, Safari, Edge         |
| Device     | Desktop (1920x1080), Mobile (375x812 iPhone SE) |
| Build tool | go build + npm/vite                             |

## Entry/Exit Criteria

**Entry:**

- [ ] Story code complete
- [ ] `go build ./...` compiles without errors
- [ ] `cd web && npm run build` compiles without errors

**Exit (per story):**

- [ ] All P0 test cases pass
- [ ] All P1 test cases pass
- [ ] No critical bugs open

## Risk Assessment

| Risk                               | Probability | Impact   | Mitigation                          |
| ---------------------------------- | ----------- | -------- | ----------------------------------- |
| Go ServeMux pattern matching       | Low         | Low      | Go 1.22+ supports path params       |
| Lit-Element component rendering    | Low         | Medium   | Test rendering on every build       |
| CORS issues in dev                 | Medium      | High     | Vite proxy config or CORS middleware|
| IntersectionObserver not supported | Low         | Medium   | Scroll event fallback               |

## Smoke Tests (run after every story)

| TC ID       | Title                                    | Story | Priority |
| ----------- | ---------------------------------------- | ----- | -------- |
| TC-S001-002 | Go server compiles and serves            | S001  | P0       |
| TC-S001-003 | Vite dev server starts and proxies API   | S001  | P0       |
| TC-S002-001 | Parse api.json successfully              | S002  | P0       |
| TC-S003-001 | Empty query returns all models           | S003  | P0       |
| TC-S003-006 | No-match search returns empty            | S003  | P0       |
| TC-S004-001 | Header displays ModelLens                | S004  | P0       |
| TC-S005-002 | Typing filters models after debounce     | S005  | P0       |
| TC-S006-001 | All 7 columns render                     | S006  | P0       |
| TC-S007-001 | Scrolling loads next batch               | S007  | P0       |
| TC-S008-001 | Click row opens detail                   | S008  | P0       |
| TC-S011-001 | Server error shows error + retry         | S011  | P0       |
| TC-S011-002 | Empty search results message             | S011  | P0       |

## Full Regression

Run all 86 test cases in story order (S001 → S011) before release.
