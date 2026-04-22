import { Hono } from "hono";
import type { AppData } from "../services/app-data.ts";
import { filter, sort, find, buildPage } from "../services/app-data.ts";
import type { SortField, SortDir } from "../types/model.ts";

const VALID_SORT_FIELDS: Set<string> = new Set(["provider", "name", "context", "input_cost", "output_cost"]);
const VALID_SORT_DIRS: Set<string> = new Set(["asc", "desc"]);

export function createModelsRouter(appData: AppData): Hono {
  const router = new Hono();

  router.get("/", (c) => {
    const query = c.req.query("query") || "";
    const sortBy = (c.req.query("sort_by") || "name") as SortField;
    const sortDir = (c.req.query("sort_dir") || "asc") as SortDir;
    const offset = parseInt(c.req.query("offset") || "0", 10);
    let limit = parseInt(c.req.query("limit") || "100", 10);

    if (isNaN(offset) || offset < 0) {
      return c.json({ error: "invalid offset" }, 400);
    }
    if (isNaN(limit) || limit <= 0 || limit > 100) {
      limit = 100;
    }

    const effectiveSortBy = VALID_SORT_FIELDS.has(sortBy) ? sortBy : "name";
    const effectiveSortDir = VALID_SORT_DIRS.has(sortDir) ? sortDir : "asc";

    const filtered = filter(appData, query);
    const sorted = sort(filtered, effectiveSortBy as SortField, effectiveSortDir as SortDir);
    const page = buildPage(sorted, offset, limit);

    return c.json(page);
  });

  router.get("/:provider_id/:model_id", (c) => {
    const providerID = c.req.param("provider_id");
    const modelID = decodeURIComponent(c.req.param("model_id"));

    const model = find(appData, providerID, modelID);
    if (!model) {
      return c.json({ error: "model not found" }, 404);
    }

    return c.json(model);
  });

  router.get("/:provider_id/:namespace/:model_id", (c) => {
    const providerID = c.req.param("provider_id");
    const modelID = decodeURIComponent(c.req.param("namespace")) + "/" + decodeURIComponent(c.req.param("model_id"));

    const model = find(appData, providerID, modelID);
    if (!model) {
      return c.json({ error: "model not found" }, 404);
    }

    return c.json(model);
  });

  return router;
}
