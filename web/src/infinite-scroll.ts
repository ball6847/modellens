import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import "./loading-spinner";

@customElement("infinite-scroll")
export class InfiniteScroll extends LitElement {
  @property({ type: Boolean }) isFetching = false;
  @property({ type: Boolean }) hasMore = true;

  private observer: IntersectionObserver | null = null;
  private sentinelRef = createRef<HTMLDivElement>();

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !this.isFetching && this.hasMore) {
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
    if (this.sentinelRef.value) {
      this.observer?.observe(this.sentinelRef.value);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.observer = null;
  }

  render() {
    return html`
      ${this.isFetching ? html`<loading-spinner></loading-spinner>` : ""}
      ${this.hasMore ? html`<div class="h-px" ${ref(this.sentinelRef)}></div>` : ""}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "infinite-scroll": InfiniteScroll;
  }
}
