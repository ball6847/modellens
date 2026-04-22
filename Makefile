.PHONY: dev build serve

dev:
	go run ./cmd/server

build:
	cd web && npm run build
	rm -rf cmd/server/dist && cp -r web/dist cmd/server/dist
	go build -o bin/server ./cmd/server

serve: build
	./bin/server
