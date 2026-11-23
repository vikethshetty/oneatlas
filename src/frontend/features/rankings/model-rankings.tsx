"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AiModel } from "@/shared/types/model";

const categories = ["All", "Chat", "Image", "Code", "Audio", "Video", "Embedding", "Speech", "Rerank"] as const;
const emptyModels: AiModel[] = [];

export function ModelRankings() {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [rankingResult, setRankingResult] = useState<{
    category: (typeof categories)[number];
    attempt: number;
    models: AiModel[];
    message: string;
  }>({ category: "All", attempt: 0, models: [], message: "Loading rankings…" });
  const [metric, setMetric] = useState("editorial");
  const [provider, setProvider] = useState("All labs");
  const [query, setQuery] = useState("");

  const hasCurrentResult = rankingResult.category === category && rankingResult.attempt === loadAttempt;
  const models = hasCurrentResult ? rankingResult.models : emptyModels;
  const message = hasCurrentResult ? rankingResult.message : "Loading rankings…";

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
      setRankingResult({ category, attempt: loadAttempt, models: [], message: "The rankings request timed out. Check the database connection and try again." });
    }, 15_000);
    const suffix = category === "All" ? "" : `?category=${encodeURIComponent(category)}`;
    void fetch(`/api/rankings${suffix}`, { cache: "no-store", signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error("Rankings unavailable.");
      const result = await response.json() as { data: AiModel[] };
      setRankingResult({ category, attempt: loadAttempt, models: result.data, message: result.data.length ? "" : "No scores have been published in this category yet. Add scores from Catalog admin." });
    }).catch(() => { if (!controller.signal.aborted) setRankingResult({ category, attempt: loadAttempt, models: [], message: "Could not load rankings. Check the database connection and try again." }); })
      .finally(() => window.clearTimeout(timeoutId));
    return () => { window.clearTimeout(timeoutId); controller.abort(); };
  }, [category, loadAttempt]);

  const benchmarkNames = useMemo(() => [...new Set(models.flatMap((model) => model.benchmarks.map((item) => item.name)))].sort(), [models]);
  const activeMetric = metric === "editorial" || benchmarkNames.includes(metric) ? metric : "editorial";
  const labs = useMemo(() => [...new Set(models.map((model) => model.provider))].sort(), [models]);
  const valueFor = useCallback((model: AiModel) => activeMetric === "editorial" ? model.rankingScore : model.benchmarks.find((item) => item.name === activeMetric)?.score ?? null, [activeMetric]);
  const visibleModels = useMemo(() => models.filter((model) => (provider === "All labs" || model.provider === provider) && `${model.name} ${model.provider}`.toLowerCase().includes(query.trim().toLowerCase()) && valueFor(model) !== null).sort((a, b) => (valueFor(b) ?? 0) - (valueFor(a) ?? 0)), [models, provider, query, valueFor]);
  const maxValue = Math.max(1, ...visibleModels.map((model) => valueFor(model) ?? 0));

  return (
    <main className="directory-page rankings-page">
      <p className="eyebrow">THE ONEATLAS RANKING</p>
      <h1>Compare models by editorial score.</h1>
      <p className="section-copy">Scores are maintained by the OneAtlas catalog editor on a 0–100 scale. Starter catalog scores are illustrative, not independent benchmark results.</p>
      <p className="ranking-benchmark-link"><Link href="/benchmarks">Looking for published evaluation scores? Browse benchmarks →</Link></p>
      <div className="ranking-board-tools">
        <label>Rank by<select value={activeMetric} onChange={(event) => setMetric(event.target.value)}><option value="editorial">OneAtlas editorial score</option>{benchmarkNames.map((name) => <option key={name}>{name}</option>)}</select></label>
        <label>Lab<select value={provider} onChange={(event) => setProvider(event.target.value)}><option>All labs</option>{labs.map((lab) => <option key={lab}>{lab}</option>)}</select></label>
        <label>Filter models<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or lab" /></label>
      </div>
      <div className="ranking-filters" aria-label="Filter rankings by category">
        {categories.map((item) => <button key={item} type="button" className={category === item ? "selected" : ""} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
      </div>
      {message ? <div className="directory-message" role="status"><span>{message}</span>{message !== "Loading rankings…" ? <button type="button" className="button button-light rankings-retry" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Try again</button> : null}</div> : null}
      <section className="ranking-list" aria-label="Ranked AI models">
        {visibleModels.map((model, index) => <article className="ranking-row" key={model.id}>
          <span className="ranking-position">{String(index + 1).padStart(2, "0")}</span>
          <div className={`model-mark tone-${model.tone}`} aria-hidden="true">{model.mark}</div>
          <div className="ranking-model-copy"><Link href={`/models/${model.id}`}>{model.name}</Link><Link href={`/providers/${model.providerSlug}`} className="model-provider">{model.provider}</Link><span>{model.category} · {model.context}</span></div>
          <div className="ranking-meter" role="img" aria-label={`${activeMetric === "editorial" ? "Editorial score" : activeMetric} ${valueFor(model)}`}><span style={{ width: `${((valueFor(model) ?? 0) / maxValue) * 100}%` }} /></div>
          <strong className="rank-score">{valueFor(model)}<small>{activeMetric === "editorial" ? "/100" : ""}</small></strong>
        </article>)}
        {!message && !visibleModels.length ? <p className="directory-message">No matching scores. Try another lab, search, or category.</p> : null}
      </section>
    </main>
  );
}
