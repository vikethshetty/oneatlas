"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AiModel } from "@/shared/types/model";
import { fetchModelCatalog } from "@/frontend/features/models/models.api";

export function BenchmarkDirectory() {
  const [models, setModels] = useState<AiModel[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("Loading benchmark scores…");

  useEffect(() => {
    const controller = new AbortController();
    void fetchModelCatalog(controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      setModels(result.data.filter((model) => model.benchmarks.length));
      setMessage("");
    }).catch(() => { if (!controller.signal.aborted) setMessage("Could not load benchmark scores. Check the database and try again."); });
    return () => controller.abort();
  }, []);

  const benchmarkNames = useMemo(() => [...new Set(models.flatMap((model) => model.benchmarks.map((benchmark) => benchmark.name)))].sort(), [models]);
  const visibleModels = useMemo(() => models.filter((model) => `${model.name} ${model.provider} ${model.category}`.toLowerCase().includes(query.trim().toLowerCase())), [models, query]);
  const bestScores = useMemo(() => Object.fromEntries(benchmarkNames.map((name) => [name, Math.max(...models.flatMap((model) => model.benchmarks.filter((item) => item.name === name).map((item) => item.score)))])), [benchmarkNames, models]);

  return (
    <main className="directory-page benchmark-page">
      <p className="eyebrow">MODEL EVALUATIONS</p>
      <h1>Benchmarks</h1>
      <p className="section-copy">Compare published evaluation results by model. Each score includes its benchmark source where provided.</p>
      <p className="benchmark-data-note">Seed demo scores are marked as illustrative; replace them with sourced evaluations before production use.</p>
      <div className="benchmark-summary"><strong>{models.length}</strong><span>models with published scores</span><strong>{benchmarkNames.length}</strong><span>benchmark sets</span></div>
      <label className="benchmark-search">Filter models<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search model or lab" /></label>
      {message ? <p className="directory-message" role="status">{message}</p> : null}
      {!message && !models.length ? <div className="empty-results"><h2>No benchmark scores yet</h2><p>Add named evaluation scores from Catalog admin to publish a comparison here. OneAtlas editorial rankings are listed separately.</p><Link className="text-link" href="/rankings">View model rankings →</Link></div> : null}
      {models.length ? <div className="benchmark-table-wrap"><table className="benchmark-table">
        <thead><tr><th scope="col">Model</th><th scope="col">Lab</th>{benchmarkNames.map((name) => <th scope="col" key={name}>{name}</th>)}<th scope="col">Input / 1M</th></tr></thead>
        <tbody>{visibleModels.map((model) => <tr key={model.id}>
          <th scope="row"><Link href={`/models/${model.id}`}>{model.name}</Link><small>{model.category} · {model.modelType}</small></th>
          <td><Link href={`/providers/${model.providerSlug}`}>{model.provider}</Link></td>
          {benchmarkNames.map((name) => {
            const entry = model.benchmarks.find((benchmark) => benchmark.name === name);
            return <td key={name}>{entry ? <><strong className={entry.score === bestScores[name] ? "benchmark-best" : ""}>{entry.score}</strong>{entry.source ? <small className="benchmark-source">{entry.source}</small> : null}</> : "—"}</td>;
          })}
          <td>{model.inputPrice === null ? "—" : `$${model.inputPrice}`}</td>
        </tr>)}</tbody>
      </table></div> : null}
    </main>
  );
}
