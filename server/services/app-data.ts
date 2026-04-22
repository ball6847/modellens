import type { Model, ModelPage, SortField, SortDir } from "../types/model.ts";

export class AppData {
  models: Model[];

  constructor(models: Model[]) {
    this.models = models;
  }

  replace(models: Model[]) {
    this.models = models;
  }
}

export async function load(path: string): Promise<AppData> {
  const data = await Deno.readTextFile(path);
  const raw: Record<string, { models: Record<string, Model> }> = JSON.parse(data);

  const allModels: Model[] = [];
  for (const [providerID, providerData] of Object.entries(raw)) {
    if (!providerData.models) continue;
    for (const m of Object.values(providerData.models)) {
      allModels.push({ ...m, provider_id: providerID });
    }
  }

  return new AppData(allModels);
}

export function filter(data: AppData, query: string): Model[] {
  if (!query) return data.models;
  const q = query.toLowerCase();
  return data.models.filter((m) =>
    m.name.toLowerCase().includes(q) ||
    m.id.toLowerCase().includes(q) ||
    m.provider_id.toLowerCase().includes(q) ||
    (m.family && m.family.toLowerCase().includes(q))
  );
}

export function sort(items: Model[], sortBy: SortField, dir: SortDir): Model[] {
  const sorted = [...items];

  sorted.sort((a, b) => {
    switch (sortBy) {
      case "name":
        return sortDirLess(a.name < b.name, a.name === b.name, dir);
      case "provider":
        return sortDirLess(a.provider_id < b.provider_id, a.provider_id === b.provider_id, dir);
      case "context":
        return sortDirLessWithNil(
          a.limit?.context,
          b.limit?.context,
          dir,
        );
      case "input_cost":
        return sortDirLessWithNil(
          a.cost?.input,
          b.cost?.input,
          dir,
        );
      case "output_cost":
        return sortDirLessWithNil(
          a.cost?.output,
          b.cost?.output,
          dir,
        );
      default:
        return sortDirLess(a.name < b.name, a.name === b.name, dir);
    }
  });

  return sorted;
}

function sortDirLess(less: boolean, equal: boolean, dir: SortDir): number {
  if (equal) return 0;
  if (dir === "desc") return less ? 1 : -1;
  return less ? -1 : 1;
}

function sortDirLessWithNil(vi: number | undefined, vj: number | undefined, dir: SortDir): number {
  const ni = vi === undefined;
  const nj = vj === undefined;
  if (ni && nj) return 0;
  if (ni) return 1;
  if (nj) return -1;
  if (dir === "desc") return vj! - vi!;
  return vi! - vj!;
}

export function find(data: AppData, providerID: string, modelID: string): Model | undefined {
  return data.models.find((m) => m.provider_id === providerID && m.id === modelID);
}

export function paginate(items: Model[], offset: number, limit: number): Model[] {
  if (offset >= items.length) return [];
  const end = Math.min(offset + limit, items.length);
  return items.slice(offset, end);
}

export function buildPage(items: Model[], offset: number, limit: number): ModelPage {
  const total = items.length;
  const page = paginate(items, offset, limit);
  return { models: page, total };
}
