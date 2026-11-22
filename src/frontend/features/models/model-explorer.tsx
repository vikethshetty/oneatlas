"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AiModel } from "@/shared/types/model";
import { fetchModelCatalog } from "@/frontend/features/models/models.api";

const categories = ["All models", "Chat", "Image", "Code", "Audio"] as const;

export function ModelExplorer() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<(typeof categories)[number]>("All models");
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<AiModel[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [compareLimitReached, setCompareLimitReached] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadModels() {
      try {
        const result = await fetchModelCatalog(controller.signal);
        setCatalog(result.data);
      } catch {
        if (!controller.signal.aborted) setHasLoadError(true);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    void loadModels();
    return () => controller.abort();
  }, [loadAttempt]);

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  const visibleModels = useMemo(() => catalog.filter((model) => {
    const matchesCategory = category === "All models" || model.category === category;
    const searchText = `${model.name} ${model.provider} ${model.description} ${model.category}`.toLowerCase();
    return matchesCategory && searchText.includes(query.trim().toLowerCase());
  }), [catalog, category, query]);

  function toggleCompare(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
      setCompareLimitReached(false);
      return;
    }
    if (selectedIds.length >= 3) {
      setCompareLimitReached(true);
      return;
    }
    setSelectedIds([...selectedIds, id]);
    setCompareLimitReached(false);
  }

  const compareHref = `/compare?models=${selectedIds.map(encodeURIComponent).join(",")}`;

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
          <input ref={searchInputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search models or providers" aria-label="Search models or providers" />
          <kbd>Ctrl/⌘ K</kbd>
        </label>
      </div>

      <div className="model-grid" role="tabpanel" aria-live="polite">
        {isLoading ? <div className="empty-results">Loading models…</div> : null}
        {hasLoadError ? <div className="empty-results" role="alert"><span>!</span><h3>Couldn’t load models</h3><p>Check the database connection and try again.</p><button type="button" className="button button-light" onClick={() => { setIsLoading(true); setHasLoadError(false); setLoadAttempt((attempt) => attempt + 1); }}>Try again</button></div> : null}
        {!isLoading && !hasLoadError && visibleModels.map((model) => {
          const selected = selectedIds.includes(model.id);
          return (
            <article className="model-card" key={model.id}>
              <div className="card-topline">
                <div className={`model-mark tone-${model.tone}`} aria-hidden="true">{model.mark}</div>
                {model.badge ? <span className={`model-badge${model.badge === "Open weights" ? " badge-neutral" : ""}`}><span />{model.badge}</span> : null}
              </div>
              <div className="model-title-row"><h3><Link href={`/models/${model.id}`}>{model.name}</Link></h3><span className="model-category">{model.category}</span></div>
              <p className="model-provider">{model.provider}</p>
              <p className="model-description">{model.description}</p>
              <div className="card-divider" />
              <div className="model-meta"><span><span className="meta-dot" />{model.context}</span><span>{model.pricing}</span></div>
              <div className="model-card-actions">
                <Link className="model-detail-link" href={`/models/${model.id}`}>Model details <span aria-hidden="true">↗</span></Link>
                <button type="button" className={`compare-toggle${selected ? " active" : ""}`} aria-pressed={selected} onClick={() => toggleCompare(model.id)}>{selected ? "Added" : "Compare"}</button>
              </div>
            </article>
          );
        })}
        {!isLoading && !hasLoadError && visibleModels.length === 0 ? <div className="empty-results"><span>⌕</span><h3>No models found</h3><p>Try another search or category.</p></div> : null}
      </div>
      <div className="catalog-footer"><span>Showing {visibleModels.length} of {catalog.length} curated models</span><a className="text-link" href="#models">Browse the directory <span aria-hidden="true">→</span></a></div>
      {compareLimitReached ? <p className="compare-limit-message" role="status">Choose up to three models to compare.</p> : null}
      {selectedIds.length > 0 ? (
        <aside className="compare-dock" aria-live="polite">
          <span>{selectedIds.length} model{selectedIds.length === 1 ? "" : "s"} selected</span>
          <button type="button" className="compare-clear" onClick={() => setSelectedIds([])}>Clear</button>
          <Link className="button button-dark" href={compareHref}>Compare models <span aria-hidden="true">→</span></Link>
        </aside>
      ) : null}
    </section>
  );
}
