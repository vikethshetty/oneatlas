"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { AiModel, ModelCategory, ModelTone } from "@/shared/types/model";
import { fetchModelCatalog } from "@/frontend/features/models/models.api";

type ModelForm = {
  slug: string; name: string; providerName: string; providerSlug: string;
  category: ModelCategory; description: string; context: string; pricing: string;
  badge: string; mark: string; tone: ModelTone; rankingScore: number;
};

const blankForm: ModelForm = {
  slug: "", name: "", providerName: "", providerSlug: "", category: "Chat",
  description: "", context: "", pricing: "", badge: "", mark: "◎", tone: "green", rankingScore: 50,
};
const categories: ModelCategory[] = ["Chat", "Image", "Code", "Audio"];
const tones: ModelTone[] = ["violet", "blue", "orange", "green", "pink", "slate"];
const toSlug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function formFromModel(model: AiModel): ModelForm {
  return {
    slug: model.id,
    name: model.name,
    providerName: model.provider,
    providerSlug: model.providerSlug,
    category: model.category,
    description: model.description,
    context: model.context,
    pricing: model.pricing,
    badge: model.badge ?? "",
    mark: model.mark,
    tone: model.tone,
    rankingScore: model.rankingScore,
  };
}

export function ModelAdmin() {
  const [adminKey, setAdminKey] = useState("");
  const [catalog, setCatalog] = useState<AiModel[]>([]);
  const [form, setForm] = useState<ModelForm>(blankForm);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function refreshCatalog() {
    const result = await fetchModelCatalog();
    setCatalog(result.data);
  }

  useEffect(() => {
    let active = true;
    void fetchModelCatalog().then((result) => {
      if (active) setCatalog(result.data);
    }).catch(() => {
      if (active) setMessage("Catalog load failed.");
    });
    return () => { active = false; };
  }, []);

  function beginEdit(model: AiModel) {
    setEditingSlug(model.id);
    setForm(formFromModel(model));
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingSlug(null);
    setForm(blankForm);
  }

  async function saveModel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adminKey.trim()) { setMessage("Enter the admin API key first."); return; }
    setBusy(true);
    setMessage("");
    const { slug, ...fields } = form;
    const body = editingSlug ? fields : { slug, ...fields };
    try {
      const response = await fetch(editingSlug ? `/api/models/${encodeURIComponent(editingSlug)}` : "/api/models", {
        method: editingSlug ? "PUT" : "POST",
        headers: { "content-type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Could not save model.");
      await refreshCatalog();
      resetForm();
      setMessage(editingSlug ? "Model updated." : "Model created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save model.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteModel(model: AiModel) {
    if (!adminKey.trim()) { setMessage("Enter the admin API key first."); return; }
    if (!window.confirm(`Delete ${model.name} from the catalog?`)) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/models/${encodeURIComponent(model.id)}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey },
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error ?? "Could not delete model.");
      }
      await refreshCatalog();
      if (editingSlug === model.id) resetForm();
      setMessage("Model deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete model.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-page">
      <p className="eyebrow">CATALOG MANAGEMENT</p>
      <h1>Manage AI models</h1>
      <p className="section-copy">The admin key stays in this page’s memory and is sent only with catalog write requests.</p>
      <label className="admin-key-field">Admin API key<input type="password" autoComplete="off" value={adminKey} onChange={(event) => setAdminKey(event.target.value)} placeholder="Enter ADMIN_API_KEY" /></label>
      <form className="admin-form" onSubmit={saveModel}>
        <h2>{editingSlug ? `Edit ${editingSlug}` : "Add a model"}</h2>
        <div className="admin-form-grid">
          <label>Model name<input required maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, slug: editingSlug ? form.slug : toSlug(event.target.value) })} /></label>
          {!editingSlug ? <label>Model slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></label> : null}
          <label>Provider name<input required maxLength={100} value={form.providerName} onChange={(event) => setForm({ ...form, providerName: event.target.value, providerSlug: toSlug(event.target.value) })} /></label>
          <label>Provider slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.providerSlug} onChange={(event) => setForm({ ...form, providerSlug: event.target.value })} /></label>
          <label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ModelCategory })}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Context / capability<input required maxLength={80} value={form.context} onChange={(event) => setForm({ ...form, context: event.target.value })} /></label>
          <label>Pricing<input required maxLength={120} value={form.pricing} onChange={(event) => setForm({ ...form, pricing: event.target.value })} /></label>
          <label>OneAtlas editorial score (1–100)<input required type="number" min={1} max={100} step={1} value={form.rankingScore} onChange={(event) => setForm({ ...form, rankingScore: Number(event.target.value) })} /></label>
          <label>Badge<input maxLength={40} value={form.badge} onChange={(event) => setForm({ ...form, badge: event.target.value })} /></label>
          <label>Card mark<input required maxLength={8} value={form.mark} onChange={(event) => setForm({ ...form, mark: event.target.value })} /></label>
          <label>Color tone<select value={form.tone} onChange={(event) => setForm({ ...form, tone: event.target.value as ModelTone })}>{tones.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="admin-description-field">Description<textarea required minLength={10} maxLength={2000} rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        </div>
        <div className="admin-form-actions"><button type="submit" className="button button-dark" disabled={busy}>{busy ? "Saving…" : editingSlug ? "Save changes" : "Add model"}</button>{editingSlug ? <button type="button" className="button button-light" onClick={resetForm}>Cancel edit</button> : null}</div>
      </form>
      {message ? <p className="admin-message" role="status">{message}</p> : null}
      <section className="admin-list"><h2>Current catalog <span>{catalog.length}</span></h2>{catalog.map((model) => <article key={model.id}><div><strong>{model.name}</strong><span>{model.provider} · {model.category}</span></div><div className="admin-list-actions"><button type="button" onClick={() => beginEdit(model)}>Edit</button><button type="button" className="danger-action" disabled={busy} onClick={() => void deleteModel(model)}>Delete</button></div></article>)}</section>
    </main>
  );
}
