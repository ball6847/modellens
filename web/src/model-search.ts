import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("model-search")
export class ModelSearch extends LitElement {
  @property() query = "";
  @property() total = 0;
  @property() allCount = 0;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private localQuery = "";

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.localQuery = this.query;
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("query") && this.query !== this.localQuery) {
      this.localQuery = this.query;
    }
  }

  private handleInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.localQuery = input.value;
    this.requestUpdate();

    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent("search-changed", {
          detail: { query: this.localQuery },
          bubbles: true,
          composed: true,
        })
      );
    }, 150);
  }

  render() {
    return html`
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between" role="search">
        <input
          type="text"
          class="w-full sm:max-w-md rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search models..."
          aria-label="Search models"
          .value=${this.localQuery}
          @input=${this.handleInput}
        />
        <span class="text-sm text-gray-600">
          Showing ${this.total.toLocaleString()} of ${this.allCount.toLocaleString()} models
        </span>
      </div>
    `;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "model-search": ModelSearch;
  }
}
