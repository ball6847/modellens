import type { Model } from "@/api";

export function formatContext(v: number | null | undefined): string {
  if (v == null) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}K`;
  return String(v);
}

export function formatCost(v: number | null | undefined): string {
  if (v == null) return "—";
  return `$${v.toFixed(2)}`;
}

export function getModelFeatures(m: Model | null): string[] {
  if (!m) return [];
  const features: string[] = [];
  if (m.tool_call) features.push("Tools");
  if (m.reasoning) features.push("Reasoning");
  if (m.attachment) features.push("Files");
  if (m.open_weights) features.push("Open");
  if (m.temperature) features.push("Temperature");
  return features;
}
