"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AiModel } from "@/shared/types/model";

const categories = ["All", "Chat", "Image", "Code", "Audio"] as const;

export function ModelRankings() {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [models, setModels] = useState<AiModel[]>([]);
  const [message, setMessage] = useState("Loading rankings…");

  useEffect(() => {
    const controller = new AbortController();
    const suffix = category === "All" ? "" : `?category=${encodeURIComponent(category)}`;
    void fetch(`/api/rankings${suffix}`, { cache: "no-store", signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error("Rankings unavailable.");
      const result = await response.json() as { data: AiModel[] };
      setModels(result.data);
      setMessage(result.data.length ? "" : "No scores have been published in this category yet. Add scores from Catalog admin.");
    }).catch(() => { if (!controller.signal.aborted) setMessage("Could not load rankings. Check the database and try again."); });
    return () => controller.abort();
  }, [category]);

  return (
    <main className="directory-page rankings-page">
      <p className="eyebrow">THE ONEATLAS RANKING</p>
      <h1>Compare models by editorial score.</h1>
      <p className="section-copy">Scores are maintained by the OneAtlas catalog editor on a 0–100 scale. Starter catalog scores are illustrative, not independent benchmark results.</p>
      <div className="ranking-filters" aria-label="Filter rankings by category">
        {categories.map((item) => <button key={item} type="button" className={category === item ? "selected" : ""} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
      </div>
      {message ? <p className="directory-message" role="status">{message}</p> : null}
      <section className="ranking-list" aria-label="Ranked AI models">
        {models.map((model, index) => <article className="ranking-row" key={model.id}>
          <span className="ranking-position">{String(index + 1).padStart(2, "0")}</span>
          <div className={`model-mark tone-${model.tone}`} aria-hidden="true">{model.mark}</div>
          <div className="ranking-model-copy"><Link href={`/models/${model.id}`}>{model.name}</Link><Link href={`/providers/${model.providerSlug}`} className="model-provider">{model.provider}</Link><span>{model.category} · {model.context}</span></div>
          <div className="ranking-meter" role="img" aria-label={`Score ${model.rankingScore} out of 100`}><span style={{ width: `${model.rankingScore}%` }} /></div>
          <strong className="rank-score">{model.rankingScore}<small>/100</small></strong>
        </article>)}
      </section>
    </main>
  );
}
