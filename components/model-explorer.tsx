"use client";

import { useEffect, useMemo, useState } from "react";
import type { AiModel } from "@/lib/models";

const categories = ["All models", "Chat", "Image", "Code", "Audio"] as const;

type ModelsResponse = { data: AiModel[]; count: number };

export function ModelExplorer() {
  const [category, setCategory] = useState<(typeof categories)[number]>("All models");
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<AiModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadModels() {
      try {
        const response = await fetch("/api/models", { signal: controller.signal });
        if (!response.ok) throw new Error("Model request failed");
        const result = (await response.json()) as ModelsResponse;
        setCatalog(result.data);
      } catch {
        if (!controller.signal.aborted) setHasLoadError(true);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadModels();
    return () => controller.abort();
  }, []);

  const visibleModels = useMemo(() => catalog.filter((model) => {
    const matchesCategory = category === "All models" || model.category === category;
    const searchText = `${model.name} ${model.provider} ${model.description} ${model.category}`.toLowerCase();
    return matchesCategory && searchText.includes(query.trim().toLowerCase());
  }), [catalog, category, query]);

  return (
    <section className="catalog-section" id="models" aria-labelledby="catalog-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">THE MODEL DIRECTORY</p>
          <h2 id="catalog-heading">Find your next favorite model.</h2>
          <p className="section-copy">Compare capabilities, context windows, and pricing—all in one place.</p>
        </div>
        <a className="text-link" href="#models">View all models <span aria-hidden="true">→</span></a>
      </div>

      <div className="catalog-tools">
        <div className="category-list" role="tablist" aria-label="Filter models by category">
          {categories.map((item) => (
            <button key={item} type="button" role="tab" aria-selected={category === item} className={`category-tab${category === item ? " selected" : ""}`} onClick={() => setCategory(item)}>
              {item === "All models" ? <span className="tab-sparkle" aria-hidden="true">✦</span> : null}{item}
            </button>
          ))}
        </div>
        <label className="search-box">
          <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.8" cy="8.8" r="5.8"/><path d="m13.2 13.2 4 4"/></svg>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search models or providers" aria-label="Search models or providers" />
          <kbd>⌘ K</kbd>
        </label>
      </div>

      <div className="model-grid" role="tabpanel" aria-live="polite">
        {isLoading ? <div className="empty-results">Loading models…</div> : null}
        {hasLoadError ? <div className="empty-results" role="alert"><span>!</span><h3>Couldn’t load models</h3><p>Check the database connection and try again.</p></div> : null}
        {!isLoading && !hasLoadError && visibleModels.map((model) => (
          <article className="model-card" key={model.id}>
            <div className="card-topline">
              <div className={`model-mark tone-${model.tone}`} aria-hidden="true">{model.mark}</div>
              {model.badge ? <span className={`model-badge${model.badge === "Open weights" ? " badge-neutral" : ""}`}><span />{model.badge}</span> : null}
            </div>
            <div className="model-title-row"><h3>{model.name}</h3><span className="model-category">{model.category}</span></div>
            <p className="model-provider">{model.provider}</p>
            <p className="model-description">{model.description}</p>
            <div className="card-divider" />
            <div className="model-meta"><span><span className="meta-dot" />{model.context}</span><span>{model.pricing}</span></div>
            <a className="card-arrow" href={`#${model.id}`} aria-label={`Explore ${model.name}`}>↗</a>
          </article>
        ))}
        {!isLoading && !hasLoadError && visibleModels.length === 0 ? <div className="empty-results"><span>⌕</span><h3>No models found</h3><p>Try another search or category.</p></div> : null}
      </div>
      <div className="catalog-footer"><span>Showing {visibleModels.length} of {catalog.length} curated models</span><a className="text-link" href="#models">Browse the directory <span aria-hidden="true">→</span></a></div>
    </section>
  );
}