import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { fetchModels, type Model, type SortField, type SortDir } from "./api";
import "./model-search";
import "./model-table";
import "./infinite-scroll";
import "./model-detail";

@customElement("model-lens-app")
export class ModelLensApp extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
  `;

  @state() models: Model[] = [];
  @state() total = 0;
  @state() allCount = 0;
  @state() sortBy: SortField = "name";
  @state() sortDir: SortDir = "asc";
  @state() query = "";
  @state() offset = 0;
  @state() isFetching = false;
  @state() selectedModel: Model | null = null;
  @state() error: string | null = null;

  private readonly limit = 100;

  connectedCallback() {
    super.connectedCallback();
    document.title = "ModelLens - LLM Model Browser";
    this.fetchData(true);
  }

  private async fetchData(replace = false) {
    this.isFetching = true;
    this.error = null;
    try {
      const page = await fetchModels({
        query: this.query,
        sort_by: this.sortBy,
        sort_dir: this.sortDir,
        offset: this.offset,
        limit: this.limit,
      });
      if (replace) {
        this.models = page.models;
      } else {
        this.models = [...this.models, ...page.models];
      }
      this.total = page.total;
      if (this.allCount === 0) {
        this.allCount = page.total;
      }
    } catch (err) {
      this.error = err instanceof Error ? err.message : "Failed to fetch models";
      console.error("Failed to fetch models:", err);
    } finally {
      this.isFetching = false;
    }
  }

  private handleRetry() {
    this.error = null;
    this.fetchData(true);
  }

  private handleSearchChanged(e: CustomEvent<{ query: string }>) {
    this.query = e.detail.query;
    this.offset = 0;
    this.fetchData(true);
  }

  private handleSortChanged(e: CustomEvent<{ sortBy: SortField; sortDir: SortDir }>) {
    this.sortBy = e.detail.sortBy;
    this.sortDir = e.detail.sortDir;
    this.offset = 0;
    this.fetchData(true);
  }

  private handleLoadMore() {
    if (this.isFetching) return;
    if (this.models.length >= this.total) return;
    this.offset += this.limit;
    this.fetchData(false);
  }

  private handleRowClicked(e: CustomEvent<{ providerId: string; modelId: string }>) {
    this.selectedModel = this.models.find(
      (m) => m.provider_id === e.detail.providerId && m.id === e.detail.modelId
    ) ?? null;
  }

  private handleCloseDetail() {
    this.selectedModel = null;
  }

  render() {
    const hasMore = this.models.length < this.total;
    const isEmpty = !this.isFetching && !this.error && this.models.length === 0 && this.total === 0;

    return html`
      <header class="sticky top-0 z-10 bg-gray-900 text-white px-6 py-4 shadow-md">
        <h1 class="text-xl font-bold">ModelLens</h1>
        <p class="text-sm text-gray-400">LLM Model Database Browser</p>
      </header>

      <main class="flex-1 p-6">
        <model-search
          .query=${this.query}
          .total=${this.total}
          .allCount=${this.allCount}
          @search-changed=${this.handleSearchChanged}
        ></model-search>

        ${this.error
          ? html`
              <div class="mt-4 flex items-center gap-4 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800" role="alert">
                <span>${this.error}</span>
                <button
                  class="shrink-0 rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  @click=${this.handleRetry}
                >
                  Retry
                </button>
              </div>
            `
          : ""}

        ${isEmpty
          ? html`
              <div class="mt-8 flex flex-col items-center justify-center py-12 text-gray-500">
                <p class="text-lg">No models found for &ldquo;${this.query}&rdquo;</p>
              </div>
            `
          : ""}

        <model-table
          .models=${this.models}
          .sortBy=${this.sortBy}
          .sortDir=${this.sortDir}
          @sort-changed=${this.handleSortChanged}
          @row-clicked=${this.handleRowClicked}
        ></model-table>

        ${this.isFetching ? html`<loading-spinner></loading-spinner>` : ""}

        <infinite-scroll
          .isFetching=${this.isFetching}
          .hasMore=${hasMore}
          @load-more=${this.handleLoadMore}
        ></infinite-scroll>

        ${this.selectedModel
          ? html`<model-detail
              .model=${this.selectedModel}
              @close=${this.handleCloseDetail}
            ></model-detail>`
          : ""}
      </main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "model-lens-app": ModelLensApp;
  }
}
