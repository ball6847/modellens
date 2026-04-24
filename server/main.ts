import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "hono/deno";
import { loadConfig } from "./config.ts";
import { sync } from "./services/sync.ts";
import { AppData, load } from "./services/app-data.ts";
import { createModelsRouter } from "./routes/models.ts";

async function main() {
  const cfg = loadConfig();

  if (!cfg.skipSync) {
    await sync(cfg.apiFile, cfg.apiRemote);
  }

  const appData: AppData = await load(cfg.apiFile);
  console.log(
    `Loaded ${appData.models.length.toLocaleString()} models from ${cfg.apiFile}`,
  );

  if (!cfg.skipSync && cfg.syncInterval > 0) {
    setInterval(async () => {
      try {
        const prevCount = appData.models.length;
        await sync(cfg.apiFile, cfg.apiRemote);
        const fresh = await load(cfg.apiFile);
        appData.replace(fresh.models);
        const currCount = appData.models.length;
        if (currCount !== prevCount) {
          console.log(
            `Data reloaded: ${prevCount.toLocaleString()} → ${currCount.toLocaleString()} models`,
          );
        } else {
          console.log(`Data reloaded: ${currCount.toLocaleString()} models`);
        }
      } catch (err) {
        console.error(`Sync interval failed: ${err}`);
      }
    }, cfg.syncInterval);
    console.log(`Sync interval: every ${cfg.syncInterval / 1000}s`);
  }

  const app = new Hono();

  app.use("*", cors());
  app.use("*", logger());

  const modelsRouter = createModelsRouter(appData);
  app.route("/api/models", modelsRouter);

  app.get("/api/providers", (c) => c.json(appData.providers()));

  app.get("/*", serveStatic({ root: "./web/dist" }));

  app.notFound(async (c) => {
    try {
      const index = await Deno.readTextFile("./web/dist/index.html");
      return c.html(index);
    } catch {
      return c.text("Not Found", 404);
    }
  });

  Deno.serve({ port: cfg.port }, app.fetch);
  console.log(`Listening on port ${cfg.port}`);
}

main();
