# S001: Project Scaffolding

**Priority:** Critical\
**Depends on:** None\
**Status:** Pending\
**Test Cases:**
[S001-project-scaffolding.md](../test-cases/S001-project-scaffolding.md)

## User Story

As a developer, I need the project scaffolded with Go, Lit-Element, and Tailwind
CSS so that I can build and run the application.

## Acceptance Criteria

```gherkin
Given Go 1.22+ and Node.js are installed
When I run `go run ./cmd/server`
Then the server starts and serves at localhost:3000
And I see a placeholder "ModelLens" page in the browser
```

## Tasks

1. Initialize Go module: `go mod init github.com/user/modelsdb`
2. Create `cmd/server/main.go` with minimal HTTP server (net/http, port 3000)
3. Initialize frontend: `cd web && npm init -y`
4. Install Lit + Vite + TypeScript + Tailwind: `npm install lit` + devDeps
5. Create `web/index.html` with `<model-lens-app>` custom element
6. Create `web/src/index.ts` entry point importing Lit components
7. Create `web/vite.config.ts` with Tailwind plugin and Go server proxy
8. Create `web/tailwind.config.js` and `web/postcss.config.js`
9. Create `web/src/styles/main.css` with Tailwind directives
10. Create `Makefile` with `dev`, `build`, `serve` targets
11. Verify `go run ./cmd/server` starts and `npm run dev` serves frontend

## Technical Notes

- Go server serves API on `/api/*` and static files from `web/dist` in production
- Vite dev server proxies `/api` to Go backend during development
- Lit components registered via `@customElement` decorator
- TypeScript for type safety on frontend

## Verification

- `go run ./cmd/server` starts without errors
- `cd web && npm run dev` starts Vite dev server
- Browser at localhost:5173 (Vite) shows rendered page
- API proxy to Go backend works
