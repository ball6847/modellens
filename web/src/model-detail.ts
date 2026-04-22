import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Model } from "./api";
import { formatContext, formatCost } from "./model-row";

@customElement("model-detail")
export class ModelDetail extends LitElement {
  @property({ attribute: false }) model: Model | null = null;

  createRenderRoot() {
    return this;
  }

  private handleClose() {
    this.dispatchEvent(
      new CustomEvent("close", {
        bubbles: true,
        composed: true,
      })
    );
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
    if (m.temperature) {
      badges.push(html`<span class="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-600 text-white mr-1">Temperature</span>`);
    }

    return badges.length > 0 ? badges : html`<span class="text-gray-400">—</span>`;
  }

  private renderModalityList(items: string[] | undefined): string {
    if (!items || items.length === 0) return "—";
    return items.join(", ");
  }

  render() {
    const m = this.model;
    if (!m) return nothing;

    return html`
      <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">${m.name}</h2>
          <button
            class="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            @click=${this.handleClose}
          >
            ✕ Close
          </button>
        </div>

        <div class="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <span class="text-gray-500 font-medium">Provider</span>
            <div class="mt-0.5">${m.provider_id}</div>
          </div>
          <div>
            <span class="text-gray-500 font-medium">Name</span>
            <div class="mt-0.5">${m.name}</div>
          </div>
          <div>
            <span class="text-gray-500 font-medium">ID</span>
            <div class="mt-0.5 font-mono text-xs text-gray-600">${m.id}</div>
          </div>
          <div>
            <span class="text-gray-500 font-medium">Family</span>
            <div class="mt-0.5">${m.family ?? "—"}</div>
          </div>
          <div>
            <span class="text-gray-500 font-medium">Context Window</span>
            <div class="mt-0.5">${formatContext(m.limit?.context ?? null)}</div>
          </div>
          <div>
            <span class="text-gray-500 font-medium">Output Limit</span>
            <div class="mt-0.5">${formatContext(m.limit?.output ?? null)}</div>
          </div>
          <div>
            <span class="text-gray-500 font-medium">Input Cost</span>
            <div class="mt-0.5">${formatCost(m.cost?.input ?? null)}</div>
          </div>
          <div>
            <span class="text-gray-500 font-medium">Output Cost</span>
            <div class="mt-0.5">${formatCost(m.cost?.output ?? null)}</div>
          </div>
          <div>
            <span class="text-gray-500 font-medium">Input Modalities</span>
            <div class="mt-0.5">${this.renderModalityList(m.modalities?.input)}</div>
          </div>
          <div>
            <span class="text-gray-500 font-medium">Output Modalities</span>
            <div class="mt-0.5">${this.renderModalityList(m.modalities?.output)}</div>
          </div>
          <div>
            <span class="text-gray-500 font-medium">Features</span>
            <div class="mt-0.5">${this.renderBadges()}</div>
          </div>
          <div>
            <span class="text-gray-500 font-medium">Knowledge Cutoff</span>
            <div class="mt-0.5">${m.knowledge ?? "—"}</div>
          </div>
          <div>
            <span class="text-gray-500 font-medium">Release Date</span>
            <div class="mt-0.5">${m.release_date ?? "—"}</div>
          </div>
          <div>
            <span class="text-gray-500 font-medium">Last Updated</span>
            <div class="mt-0.5">${m.last_updated ?? "—"}</div>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "model-detail": ModelDetail;
  }
}
