"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AiModel } from "@/shared/types/model";
import { fetchModel, ModelApiError } from "@/frontend/features/models/models.api";

export function ModelDetail({ slug }: { slug: string }) {
  const [model, setModel] = useState<AiModel | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void fetchModel(slug, controller.signal)
      .then(setModel)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof ModelApiError && error.status === 404) setNotFound(true);
        else setFailed(true);
      });
    return () => controller.abort();
  }, [slug]);

  if (notFound) return <main className="model-detail-page"><div className="detail-message"><h1>Model not found</h1><Link className="text-link" href="/">Back to the directory →</Link></div></main>;
  if (failed) return <main className="model-detail-page"><div className="detail-message"><h1>Couldn’t load this model</h1><p>Check your connection and try again.</p><Link className="text-link" href="/">Back to the directory →</Link></div></main>;
  if (!model) return <main className="model-detail-page"><div className="detail-message">Loading model…</div></main>;

  return (
    <main className="model-detail-page">
      <div className="detail-topbar"><Link className="text-link" href="/#models">← Back to all models</Link></div>
      <section className="detail-hero">
        <div className="detail-model-mark"><div className={`model-mark tone-${model.tone}`} aria-hidden="true">{model.mark}</div><span className="model-category">{model.category}</span></div>
        {model.badge ? <span className="model-badge">{model.badge}</span> : null}
        <p className="eyebrow"><Link href={`/providers/${model.providerSlug}`}>{model.provider.toUpperCase()} ↗</Link></p>
        <h1>{model.name}</h1>
        <p className="detail-description">{model.description}</p>
        <Link className="button button-dark" href="/#models">Back to model directory <span aria-hidden="true">↓</span></Link>
      </section>
      <section className="detail-specs" aria-label="Model specifications">
        <article><span>Lab</span><strong><Link href={`/providers/${model.providerSlug}`}>{model.provider}</Link></strong></article>
        <article><span>Model type</span><strong>{model.modelType}</strong></article>
        <article><span>Category</span><strong>{model.category}</strong></article>
        <article><span>Context window</span><strong>{model.contextTokens ? `${model.contextTokens.toLocaleString()} tokens` : model.context}</strong></article>
        <article><span>Input price / 1M tokens</span><strong>{model.inputPrice === null ? "Not listed" : `$${model.inputPrice}`}</strong></article>
        <article><span>Output price / 1M tokens</span><strong>{model.outputPrice === null ? "Not listed" : `$${model.outputPrice}`}</strong></article>
        <article><span>Modalities</span><strong>{model.modalities.join(", ") || "Not listed"}</strong></article>
        <article><span>Capabilities</span><strong>{model.capabilities.join(", ") || "Not listed"}</strong></article>
        <article><span>Weights</span><strong>{model.openWeights ? "Open weights" : "Closed"}</strong></article>
        <article><span>Released</span><strong>{model.releasedAt ? new Date(model.releasedAt).toLocaleDateString() : "Not listed"}</strong></article>
        <article><span>OneAtlas editorial score</span><strong>{model.rankingScore ? `${model.rankingScore} / 100` : "Unranked"}</strong></article>
      </section>
      <section className="detail-benchmarks" aria-labelledby="model-benchmarks-heading">
        <div className="section-heading"><div><p className="eyebrow">EVALUATION</p><h2 id="model-benchmarks-heading">Benchmark results</h2></div><Link className="text-link" href="/benchmarks">Compare benchmarks <span aria-hidden="true">→</span></Link></div>
        {model.benchmarks.length ? <div className="benchmark-score-list">{model.benchmarks.map((item) => <article key={item.name}><strong>{item.name}</strong><span>{item.source || "Source not provided"}</span><b>{item.score}</b></article>)}</div> : <p className="directory-message">No benchmark results have been added for this model yet.</p>}
      </section>
    </main>
  );
}
