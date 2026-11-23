"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AiModel } from "@/shared/types/model";
import { fetchModelCatalog } from "@/frontend/features/models/models.api";

export function ModelComparison() {
  const [models, setModels] = useState<AiModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const ids = new URLSearchParams(window.location.search).get("models")?.split(",").filter(Boolean).slice(0, 3) ?? [];
    void fetchModelCatalog(controller.signal)
      .then((result) => setModels(result.data.filter((model) => ids.includes(model.id))))
      .catch(() => { if (!controller.signal.aborted) setFailed(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return (
    <main className="comparison-page">
      <div className="detail-topbar"><Link className="text-link" href="/#models">← Back to all models</Link></div>
      <p className="eyebrow">SIDE-BY-SIDE</p>
      <h1>Compare AI models</h1>
      <p className="section-copy">Review key details together to find the best fit.</p>
      {loading ? <div className="empty-results">Loading comparison…</div> : null}
      {failed ? <div className="empty-results" role="alert">Couldn’t load models for comparison.</div> : null}
      {!loading && !failed && models.length < 2 ? (
        <div className="empty-results"><h2>Select at least two models</h2><p>Choose up to three models from the directory.</p><Link className="text-link" href="/#models">Choose models →</Link></div>
      ) : null}
      {!loading && !failed && models.length >= 2 ? (
        <div className="comparison-table-wrap">
          <table className="comparison-table">
            <thead><tr><th scope="col">Details</th>{models.map((model) => <th scope="col" key={model.id}><span className={`model-mark tone-${model.tone}`}>{model.mark}</span><br /><Link href={`/models/${model.id}`}>{model.name}</Link><small>{model.provider}</small></th>)}</tr></thead>
            <tbody>
              <tr><th scope="row">Category</th>{models.map((model) => <td key={model.id}>{model.category}</td>)}</tr>
              <tr><th scope="row">Model type</th>{models.map((model) => <td key={model.id}>{model.modelType}</td>)}</tr>
              <tr><th scope="row">Context window</th>{models.map((model) => <td key={model.id}>{model.contextTokens ? `${model.contextTokens.toLocaleString()} tokens` : model.context}</td>)}</tr>
              <tr><th scope="row">Input price / 1M</th>{models.map((model) => <td key={model.id}>{model.inputPrice === null ? "Not listed" : `$${model.inputPrice}`}</td>)}</tr>
              <tr><th scope="row">Output price / 1M</th>{models.map((model) => <td key={model.id}>{model.outputPrice === null ? "Not listed" : `$${model.outputPrice}`}</td>)}</tr>
              <tr><th scope="row">Modalities</th>{models.map((model) => <td key={model.id}>{model.modalities.join(", ") || "Not listed"}</td>)}</tr>
              <tr><th scope="row">Capabilities</th>{models.map((model) => <td key={model.id}>{model.capabilities.join(", ") || "Not listed"}</td>)}</tr>
              <tr><th scope="row">Open weights</th>{models.map((model) => <td key={model.id}>{model.openWeights ? "Yes" : "No"}</td>)}</tr>
              <tr><th scope="row">Released</th>{models.map((model) => <td key={model.id}>{model.releasedAt ? new Date(model.releasedAt).toLocaleDateString() : "Not listed"}</td>)}</tr>
              <tr><th scope="row">Editorial score</th>{models.map((model) => <td key={model.id}>{model.rankingScore || "Unranked"} / 100</td>)}</tr>
              <tr><th scope="row">Benchmarks</th>{models.map((model) => <td key={model.id}>{model.benchmarks.length ? model.benchmarks.map((benchmark) => `${benchmark.name}: ${benchmark.score}${benchmark.source ? ` (${benchmark.source})` : ""}`).join(" · ") : "No results"}</td>)}</tr>
              <tr><th scope="row">Description</th>{models.map((model) => <td key={model.id}>{model.description}</td>)}</tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}
