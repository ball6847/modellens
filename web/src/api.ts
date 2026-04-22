export interface Modalities {
  input: string[];
  output: string[];
}

export interface Cost {
  input: number;
  output: number;
}

export interface ModelLimit {
  context: number;
  output: number;
}

export interface Model {
  provider_id: string;
  id: string;
  name: string;
  family?: string;
  attachment?: boolean;
  reasoning?: boolean;
  tool_call?: boolean;
  temperature?: boolean;
  knowledge?: string;
  release_date?: string;
  last_updated?: string;
  modalities?: Modalities;
  open_weights?: boolean;
  cost?: Cost;
  limit?: ModelLimit;
}

export interface ModelPage {
  models: Model[];
  total: number;
}

export type SortField = "provider" | "name" | "context" | "input_cost" | "output_cost";
export type SortDir = "asc" | "desc";

export interface FetchModelsParams {
  query?: string;
  sort_by?: SortField;
  sort_dir?: SortDir;
  offset?: number;
  limit?: number;
}

export async function fetchModels(params: FetchModelsParams = {}): Promise<ModelPage> {
  const searchParams = new URLSearchParams();
  if (params.query) searchParams.set("query", params.query);
  if (params.sort_by) searchParams.set("sort_by", params.sort_by);
  if (params.sort_dir) searchParams.set("sort_dir", params.sort_dir);
  if (params.offset != null) searchParams.set("offset", String(params.offset));
  if (params.limit != null) searchParams.set("limit", String(params.limit));

  const url = `/api/models?${searchParams.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.status}`);
  }
  return response.json() as Promise<ModelPage>;
}

export async function fetchModelDetail(providerId: string, modelId: string): Promise<Model> {
  const url = `/api/models/${encodeURIComponent(providerId)}/${encodeURIComponent(modelId)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch model detail: ${response.status}`);
  }
  return response.json() as Promise<Model>;
}
