"use client";

import { useMemo, useState } from "react";
import { models } from "@/lib/models";

const categories = ["All models", "Chat", "Image", "Code", "Audio"] as const;

export function ModelExplorer() {
  const [category, setCategory] = useState<(typeof categories)[number]>("All models");
  const [query, setQuery] = useState("");
  const visibleModels = useMemo(() => models.filter((model) => {
    const matchesCategory = category === "All models" || model.category === category;
    const searchText = `${model.name} ${model.provider} ${model.description} ${model.category}`.toLowerCase();
    return matchesCategory && searchText.includes(query.trim().toLowerCase());
  }), [category, query]);

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

      <div className="model-grid" role="tabpanel">
        {visibleModels.map((model) => (
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
        {visibleModels.length === 0 ? <div className="empty-results"><span>⌕</span><h3>No models found</h3><p>Try another search or category.</p></div> : null}
      </div>
      <div className="catalog-footer"><span>Showing {visibleModels.length} of {models.length} curated models</span><a className="text-link" href="#models">Browse the directory <span aria-hidden="true">→</span></a></div>
    </section>
  );
}
