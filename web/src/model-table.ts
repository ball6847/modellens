import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import type { Model, SortField, SortDir } from "./api";
import { formatContext, formatCost, renderBadges } from "./model-row";

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

  private tableRef = createRef<HTMLTableElement>();
  private observer: IntersectionObserver | null = null;

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.dispatchEvent(
              new CustomEvent("load-more", {
                bubbles: true,
                composed: true,
              })
            );
          }
        }
      },
      { rootMargin: "200px" }
    );
  }

  firstUpdated() {
    if (this.tableRef.value) {
      this.observer?.observe(this.tableRef.value);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.observer = null;
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

  private handleRowClick(model: Model) {
    this.dispatchEvent(
      new CustomEvent("row-clicked", {
        detail: { providerId: model.provider_id, modelId: model.id },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleRowKeydown(e: KeyboardEvent, model: Model) {
    if (e.key === "Enter") {
      this.handleRowClick(model);
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
        tbody tr:hover {
          background-color: #eff6ff;
        }
      </style>
      <div style="overflow-x:auto;">
        <table ${ref(this.tableRef)} style="width:100%;font-size:0.875rem;text-align:left;" role="grid">
          <thead style="font-size:0.75rem;text-transform:uppercase;background-color:#f3f4f6;color:#374151;">
            <tr>
              ${COLUMNS.map((col) => {
                const sortable = col.key !== "id" && col.key !== "features";
                return html`
                  <th
                    style="padding:0.75rem 1rem;${sortable ? "cursor:pointer;user-select:none;" : ""}"
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
              (m) => html`
                <tr
                  style="border-bottom:1px solid #e5e7eb;cursor:pointer;"
                  tabindex="0"
                  @click=${() => this.handleRowClick(m)}
                  @keydown=${(e: KeyboardEvent) => this.handleRowKeydown(e, m)}
                >
                  <td style="padding:0.5rem 1rem;">${m.provider_id}</td>
                  <td style="padding:0.5rem 1rem;font-weight:500;">${m.name}</td>
                  <td style="padding:0.5rem 1rem;color:#6b7280;font-family:monospace;font-size:0.75rem;">${m.id}</td>
                  <td style="padding:0.5rem 1rem;">${formatContext(m.limit?.context ?? null)}</td>
                  <td style="padding:0.5rem 1rem;">${formatCost(m.cost?.input ?? null)}</td>
                  <td style="padding:0.5rem 1rem;">${formatCost(m.cost?.output ?? null)}</td>
                  <td style="padding:0.5rem 1rem;">${renderBadges(m)}</td>
                </tr>
              `
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
