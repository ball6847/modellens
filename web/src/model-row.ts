import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
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

@customElement("model-row")
export class ModelRow extends LitElement {
  @property({ attribute: false }) model: Model | null = null;

  createRenderRoot() {
    return this;
  }

  private handleClick() {
    if (!this.model) return;
    this.dispatchEvent(
      new CustomEvent("row-clicked", {
        detail: { providerId: this.model.provider_id, modelId: this.model.id },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      this.handleClick();
    }
  }

  private renderBadges() {
    const m = this.model;
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

  render() {
    const m = this.model;
    if (!m) return nothing;

    const context = m.limit?.context ?? null;
    const inputCost = m.cost?.input ?? null;
    const outputCost = m.cost?.output ?? null;

    return html`
      <tr class="border-b hover:bg-blue-50 cursor-pointer" tabindex="0" @click=${this.handleClick} @keydown=${this.handleKeydown}>
        <td class="px-4 py-2">${m.provider_id}</td>
        <td class="px-4 py-2 font-medium">${m.name}</td>
        <td class="px-4 py-2 text-gray-500 font-mono text-xs">${m.id}</td>
        <td class="px-4 py-2">${formatContext(context)}</td>
        <td class="px-4 py-2">${formatCost(inputCost)}</td>
        <td class="px-4 py-2">${formatCost(outputCost)}</td>
        <td class="px-4 py-2">${this.renderBadges()}</td>
      </tr>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "model-row": ModelRow;
  }
}
