import { html, nothing } from "lit";
import type { Model } from "./api";

export function formatContext(v: number | null): string {
  if (v == null) return "\u2014";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}K`;
  return String(v);
}

export function formatCost(v: number | null): string {
  if (v == null) return "\u2014";
  return `$${v.toFixed(2)}`;
}

export function renderBadges(m: Model | null) {
  if (!m) return nothing;
  const badges: ReturnType<typeof html>[] = [];

  if (m.tool_call) {
    badges.push(html`<span class="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-600 text-white mr-1">Tools</span>`);
  }
  if (m.reasoning) {
    badges.push(html`<span class="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-600 text-white mr-1">Reasoning</span>`);
  }
  if (m.attachment) {
    badges.push(html`<span class="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-green-600 text-white mr-1">Files</span>`);
  }
  if (m.open_weights) {
    badges.push(html`<span class="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-600 text-white mr-1">Open</span>`);
  }

  return badges.length > 0 ? badges : "\u2014";
}
