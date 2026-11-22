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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
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
    void fetch("/api/admin/session", { cache: "no-store" }).then(async (response) => {
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Admin sign-in is unavailable.");
      if (!active) return;
      setAuthenticated(Boolean(result.authenticated));
      if (result.authenticated) {
        const catalog = await fetchModelCatalog();
        if (active) setCatalog(catalog.data);
      }
    }).catch((error: unknown) => {
      if (active) setMessage(error instanceof Error ? error.message : "Admin sign-in is unavailable.");
    }).finally(() => { if (active) setAuthReady(true); });
    return () => { active = false; };
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Could not sign in.");
      setAuthenticated(true);
      setPassword("");
      await refreshCatalog();
      setMessage("Signed in.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      if (!response.ok) throw new Error("Could not end the admin session.");
      setAuthenticated(false);
      setUsername("");
      setPassword("");
      resetForm();
      setMessage("Signed out.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not end the admin session.");
    } finally {
      setBusy(false);
    }
  }

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
    setBusy(true);
    setMessage("");
    const { slug, ...fields } = form;
    const body = editingSlug ? fields : { slug, ...fields };
    try {
      const response = await fetch(editingSlug ? `/api/models/${encodeURIComponent(editingSlug)}` : "/api/models", {
        method: editingSlug ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => ({}));
      if (response.status === 401) setAuthenticated(false);
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
    if (!window.confirm(`Delete ${model.name} from the catalog?`)) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/models/${encodeURIComponent(model.id)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        if (response.status === 401) setAuthenticated(false);
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
      <p className="section-copy">Manage catalog records using your secure admin session.</p>
      {!authReady ? <p className="admin-message" role="status">Checking admin session…</p> : null}
      {authReady && !authenticated ? <form className="admin-login-form" onSubmit={signIn}>
        <h2>Admin sign in</h2>
        <label>Username<input required autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} /></label>
        <label>Password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        <button type="submit" className="button button-dark" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form> : null}
      {authenticated ? <div className="admin-session-bar"><span>Signed in to catalog management</span><button type="button" className="button button-light" disabled={busy} onClick={() => void signOut()}>Sign out</button></div> : null}
      {authenticated ? <form className="admin-form" onSubmit={saveModel}>
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
      </form> : null}
      {message ? <p className="admin-message" role="status">{message}</p> : null}
      {authenticated ? <section className="admin-list"><h2>Current catalog <span>{catalog.length}</span></h2>{catalog.map((model) => <article key={model.id}><div><strong>{model.name}</strong><span>{model.provider} · {model.category} · score {model.rankingScore || "unranked"}</span></div><div className="admin-list-actions"><button type="button" onClick={() => beginEdit(model)}>Edit</button><button type="button" className="danger-action" disabled={busy} onClick={() => void deleteModel(model)}>Delete</button></div></article>)}</section> : null}
    </main>
  );
}
