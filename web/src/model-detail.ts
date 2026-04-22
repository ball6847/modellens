import { formatContext, formatCost } from "./model-row";
import type { Model } from "./api";

export class ModelDetail extends HTMLElement {
  private _model: Model | null = null;

  set model(val: Model | null) {
    this._model = val;
    this.render();
  }

  get model(): Model | null {
    return this._model;
  }

  connectedCallback() {
    this.style.display = "block";
    this.style.marginTop = "1.5rem";
    this.render();
  }

  private handleClose() {
    this.dispatchEvent(
      new CustomEvent("close", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private renderBadges(m: Model): string {
    const badges: string[] = [];
    if (m.tool_call) badges.push("Tools");
    if (m.reasoning) badges.push("Reasoning");
    if (m.attachment) badges.push("Files");
    if (m.open_weights) badges.push("Open");
    if (m.temperature) badges.push("Temperature");
    return badges.length > 0 ? badges.join(", ") : "—";
  }

  private renderModalityList(items: string[] | undefined): string {
    if (!items || items.length === 0) return "—";
    return items.join(", ");
  }

  private render() {
    const m = this._model;
    if (!m) {
      this.innerHTML = "";
      return;
    }

    const fields: [string, string][] = [
      ["Provider", m.provider_id],
      ["Name", m.name],
      ["ID", `<code style="font-size:0.75rem;color:#4b5563;">${m.id}</code>`],
      ["Family", m.family ?? "—"],
      ["Context Window", formatContext(m.limit?.context ?? null)],
      ["Output Limit", formatContext(m.limit?.output ?? null)],
      ["Input Cost", formatCost(m.cost?.input ?? null)],
      ["Output Cost", formatCost(m.cost?.output ?? null)],
      ["Input Modalities", this.renderModalityList(m.modalities?.input)],
      ["Output Modalities", this.renderModalityList(m.modalities?.output)],
      ["Features", this.renderBadges(m)],
      ["Knowledge Cutoff", m.knowledge ?? "—"],
      ["Release Date", m.release_date ?? "—"],
      ["Last Updated", m.last_updated ?? "—"],
    ];

    this.innerHTML = `
      <div style="background:#fff;border-radius:0.5rem;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);border:1px solid #e5e7eb;padding:1.5rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
          <h2 style="font-size:1.125rem;font-weight:600;color:#111827;">${m.name}</h2>
          <button id="close-detail" style="padding:0.25rem 0.75rem;font-size:0.875rem;color:#4b5563;background:none;border:1px solid #e5e7eb;border-radius:0.25rem;cursor:pointer;">
            ✕ Close
          </button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem 2rem;font-size:0.875rem;">
          ${fields
            .map(
              ([label, value]) => `
              <div style="padding:0.25rem 0;">
                <span style="color:#6b7280;font-weight:500;display:block;font-size:0.75rem;">${label}</span>
                <div style="margin-top:0.125rem;">${value}</div>
              </div>
            `
            )
            .join("")}
        </div>
      </div>
    `;

    this.querySelector("#close-detail")?.addEventListener("click", () => this.handleClose());
  }
}

customElements.define("model-detail", ModelDetail);

declare global {
  interface HTMLElementTagNameMap {
    "model-detail": ModelDetail;
  }
}
