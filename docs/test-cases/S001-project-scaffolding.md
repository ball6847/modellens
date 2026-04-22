# Test Cases: S001 - Project Scaffolding

**Story:** [S001-project-scaffolding.md](../stories/S001-project-scaffolding.md)
| **Test Cases:** this file **Total Cases:** 6 | P0: 3 | P1: 3

---

## TC-S001-001: Go module and npm initialized

**Priority:** P0 (Critical) **Type:** Build **Preconditions:** Go 1.22+
installed, Node.js 18+ installed

1. Run `go mod init github.com/user/modelsdb` **Expected:** `go.mod` created
2. Run `cd web && npm install` **Expected:** `node_modules` created, no errors

---

## TC-S001-002: Go server compiles and serves

**Priority:** P0 (Critical) **Type:** Build **Preconditions:** Project
scaffolded, go.mod configured

1. Run `go run ./cmd/server` **Expected:** Compiles successfully, serves at
   localhost:3000 **Expected:** Console output shows "Listening on :3000" or
   similar

2. Open browser to `http://localhost:3000` **Expected:** Page loads with HTTP
   200 **Expected:** "ModelLens" text visible in page content

---

## TC-S001-003: Vite dev server starts and proxies API

**Priority:** P0 (Critical) **Type:** Build **Preconditions:** web/package.json
configured

1. Run `cd web && npm run dev` **Expected:** Vite dev server starts at
   localhost:5173 **Expected:** No compilation errors

2. Open browser to `http://localhost:5173` **Expected:** Lit-Element app
   renders **Expected:** API calls to `/api/*` proxy to Go backend

---

## TC-S001-004: Go server serves static files in production

**Priority:** P1 (High) **Type:** Build **Preconditions:** Frontend built with
`npm run build`

1. Run `cd web && npm run build` **Expected:** `web/dist/` directory created
   with bundled assets

2. Run `go run ./cmd/server` with static file serving **Expected:** Server
   serves `web/dist/` files at `/`

---

## TC-S001-005: go.mod and package.json dependencies correct

**Priority:** P1 (High) **Type:** Build **Preconditions:** Files exist

1. Verify go.mod contains:
   - `go 1.22` or higher **Expected:** Module properly configured

2. Verify package.json contains:
   - `lit` in dependencies
   - `vite`, `typescript`, `tailwindcss` in devDependencies **Expected:** All
     dependencies present

---

## TC-S001-006: File structure matches spec

**Priority:** P1 (High) **Type:** Build **Preconditions:** Project scaffolded

1. Verify file structure exists:
   - `cmd/server/main.go` (server entry)
   - `internal/models/model.go`
   - `internal/data/appdata.go`
   - `internal/api/handler.go`
   - `web/index.html`
   - `web/src/index.ts`
   - `web/vite.config.ts` **Expected:** All files exist and are non-empty
