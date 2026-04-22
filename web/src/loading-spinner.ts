import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("loading-spinner")
export class LoadingSpinner extends LitElement {
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <div class="flex justify-center py-4">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "loading-spinner": LoadingSpinner;
  }
}
