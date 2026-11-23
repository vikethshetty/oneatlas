"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AiModel } from "@/shared/types/model";
import { fetchModelCatalog } from "@/frontend/features/models/models.api";

const categories = ["All models", "Chat", "Image", "Code", "Audio", "Video", "Embedding", "Speech", "Rerank"] as const;

export function ModelExplorer({ directoryPage = false }: { directoryPage?: boolean }) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<(typeof categories)[number]>("All models");
  const [query, setQuery] = useState(initialQuery);
  const [provider, setProvider] = useState("All labs");
  const [modelType, setModelType] = useState("All types");
  const [modality, setModality] = useState("All modalities");
  const [capability, setCapability] = useState("All capabilities");
  const [sortBy, setSortBy] = useState("name");
  const [openWeightsOnly, setOpenWeightsOnly] = useState(false);
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

  const labs = useMemo(() => [...new Set(catalog.map((model) => model.provider))].sort(), [catalog]);
  const modelTypes = useMemo(() => [...new Set(catalog.map((model) => model.modelType))].sort(), [catalog]);
  const modalities = useMemo(() => [...new Set(catalog.flatMap((model) => model.modalities))].sort(), [catalog]);
  const capabilities = useMemo(() => [...new Set(catalog.flatMap((model) => model.capabilities))].sort(), [catalog]);
  const visibleModels = useMemo(() => catalog.filter((model) => {
    const matchesCategory = category === "All models" || model.category === category;
    const searchText = `${model.name} ${model.provider} ${model.description} ${model.category} ${model.modelType} ${model.modalities.join(" ")} ${model.capabilities.join(" ")}`.toLowerCase();
    return matchesCategory && (provider === "All labs" || model.provider === provider) && (modelType === "All types" || model.modelType === modelType) && (modality === "All modalities" || model.modalities.includes(modality)) && (capability === "All capabilities" || model.capabilities.includes(capability)) && (!openWeightsOnly || model.openWeights) && searchText.includes(query.trim().toLowerCase());
  }).sort((a, b) => {
    if (sortBy === "inputPrice") return (a.inputPrice ?? Infinity) - (b.inputPrice ?? Infinity);
    if (sortBy === "contextTokens") return (b.contextTokens ?? 0) - (a.contextTokens ?? 0);
    if (sortBy === "releasedAt") return (b.releasedAt ?? "").localeCompare(a.releasedAt ?? "");
    return a.name.localeCompare(b.name);
  }), [catalog, category, query, provider, modelType, modality, capability, openWeightsOnly, sortBy]);

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
    <section className={`catalog-section${directoryPage ? " catalog-directory-page" : ""}`} id="models" aria-labelledby="catalog-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">THE MODEL DIRECTORY</p>
          <h2 id="catalog-heading">{directoryPage ? "Browse every AI model." : "Find your next favorite model."}</h2>
          <p className="section-copy">Compare capabilities, context windows, and pricing—all in one place.</p>
        </div>
        {!directoryPage ? <Link className="text-link" href="/models">View all models <span aria-hidden="true">→</span></Link> : null}
      </div>

      <div className="catalog-tools catalog-tools-expanded">
        <div className="category-list" role="tablist" aria-label="Filter models by category">
          {categories.map((item) => (
            <button key={item} type="button" role="tab" aria-selected={category === item} className={`category-tab${category === item ? " selected" : ""}`} onClick={() => setCategory(item)}>
              {item === "All models" ? <span className="tab-sparkle" aria-hidden="true">✦</span> : null}{item}
            </button>
          ))}
        </div>
        <label className="search-box">
          <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.8" cy="8.8" r="5.8"/><path d="m13.2 13.2 4 4"/></svg>
          <input ref={searchInputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search models, labs, capabilities" aria-label="Search models, labs, providers, and capabilities" />
          <kbd>Ctrl/⌘ K</kbd>
        </label>
      </div>

      <div className="catalog-filter-row" aria-label="Refine model results">
        <label>Lab<select value={provider} onChange={(event) => setProvider(event.target.value)}><option>All labs</option>{labs.map((lab) => <option key={lab}>{lab}</option>)}</select></label>
        <label>Type<select value={modelType} onChange={(event) => setModelType(event.target.value)}><option>All types</option>{modelTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
        <label>Modality<select value={modality} onChange={(event) => setModality(event.target.value)}><option>All modalities</option>{modalities.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Capability<select value={capability} onChange={(event) => setCapability(event.target.value)}><option>All capabilities</option>{capabilities.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Sort by<select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="name">Name</option><option value="inputPrice">Lowest input price</option><option value="contextTokens">Longest context</option><option value="releasedAt">Newest release</option></select></label>
        <label className="open-weights-filter"><input type="checkbox" checked={openWeightsOnly} onChange={(event) => setOpenWeightsOnly(event.target.checked)} />Open weights</label>
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
              <div className="model-meta"><span><span className="meta-dot" />{model.contextTokens ? `${model.contextTokens.toLocaleString()} context` : model.context}</span><span>{model.pricing}</span></div>
              <div className="model-capability-chips">{model.modalities.slice(0, 3).map((item) => <span key={item}>{item}</span>)}{model.capabilities.slice(0, 2).map((item) => <span key={item}>{item}</span>)}</div>
              <div className="model-card-actions">
                <Link className="model-detail-link" href={`/models/${model.id}`}>Model details <span aria-hidden="true">↗</span></Link>
                <button type="button" className={`compare-toggle${selected ? " active" : ""}`} aria-pressed={selected} onClick={() => toggleCompare(model.id)}>{selected ? "Added" : "Compare"}</button>
              </div>
            </article>
          );
        })}
        {!isLoading && !hasLoadError && visibleModels.length === 0 ? <div className="empty-results"><span>⌕</span><h3>No models found</h3><p>Try another search or category.</p></div> : null}
      </div>
      <div className="catalog-footer"><span>Showing {visibleModels.length} of {catalog.length} curated models</span>{!directoryPage ? <Link className="text-link" href="/models">Browse the directory <span aria-hidden="true">→</span></Link> : null}</div>
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
