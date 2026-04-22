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

export interface ModelPage {
  models: Model[];
  total: number;
}

export type SortField = "provider" | "name" | "context" | "input_cost" | "output_cost";
export type SortDir = "asc" | "desc";
