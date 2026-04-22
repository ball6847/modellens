import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Model, SortField, SortDir } from "./api";
import "./model-row";

const COLUMNS: { key: SortField | "id" | "features"; label: string }[] = [
  { key: "provider", label: "Provider" },
  { key: "name", label: "Name" },
  { key: "id", label: "ID" },
  { key: "context", label: "Context" },
  { key: "input_cost", label: "Input Cost" },
  { key: "output_cost", label: "Output Cost" },
  { key: "features", label: "Features" },
];

@customElement("model-table")
export class ModelTable extends LitElement {
  @property({ type: Array }) models: Model[] = [];
  @property() sortBy: SortField = "name";
  @property() sortDir: SortDir = "asc";

  createRenderRoot() {
    return this;
  }

  private handleHeaderClick(key: string) {
    if (key === "id" || key === "features") return;

    const sortKey = key as SortField;
    let dir: SortDir = "asc";
    if (this.sortBy === sortKey) {
      dir = this.sortDir === "asc" ? "desc" : "asc";
    }

    this.dispatchEvent(
      new CustomEvent("sort-changed", {
        detail: { sortBy: sortKey, sortDir: dir },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleHeaderKeydown(e: KeyboardEvent, key: string) {
    if (e.key === "Enter") {
      this.handleHeaderClick(key);
    }
  }

  private renderSortIndicator(key: string) {
    if (key !== this.sortBy) return "";
    return this.sortDir === "asc" ? " \u2191" : " \u2193";
  }

  render() {
    return html`
      <style>
        table {
          border-collapse: collapse;
        }
        tbody tr:nth-child(even) {
          background-color: #f9fafb;
        }
        tbody tr:nth-child(odd) {
          background-color: #ffffff;
        }
      </style>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left" role="grid">
          <thead class="text-xs uppercase bg-gray-100 text-gray-700">
            <tr>
              ${COLUMNS.map((col) => {
                const sortable = col.key !== "id" && col.key !== "features";
                return html`
                  <th
                    class="px-4 py-3 ${sortable ? "cursor-pointer select-none hover:bg-gray-200" : ""}"
                    @click=${() => this.handleHeaderClick(col.key)}
                    @keydown=${(e: KeyboardEvent) => this.handleHeaderKeydown(e, col.key)}
                    tabindex="${sortable ? "0" : nothing}"
                    aria-label="${sortable ? `Sort by ${col.label}` : nothing}"
                  >
                    ${col.label}${this.renderSortIndicator(col.key)}
                  </th>
                `;
              })}
            </tr>
          </thead>
          <tbody>
            ${this.models.map(
              (model) => html`<model-row .model=${model}></model-row>`
            )}
          </tbody>
        </table>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "model-table": ModelTable;
  }
}
