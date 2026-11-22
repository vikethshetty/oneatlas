"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ProviderDetail as ProviderDetailData } from "@/shared/types/model";
import { fetchProvider } from "@/frontend/features/providers/providers.api";

export function ProviderDetail({ slug }: { slug: string }) {
  const [provider, setProvider] = useState<ProviderDetailData | null>(null);
  const [message, setMessage] = useState("Loading provider…");

  useEffect(() => {
    let active = true;
    void fetchProvider(slug).then((data) => {
      if (!active) return;
      setProvider(data);
      setMessage("");
    }).catch(() => { if (active) setMessage("Provider not found or currently unavailable."); });
    return () => { active = false; };
  }, [slug]);

  return (
    <main className="directory-page provider-detail-page">
      <p className="detail-topbar"><Link className="text-link" href="/providers">← All providers</Link></p>
      {provider ? <>
        <p className="eyebrow">MODEL PROVIDER</p>
        <h1>{provider.name}</h1>
        <p className="section-copy">{provider.modelCount} catalog model{provider.modelCount === 1 ? "" : "s"} across {provider.categories.join(", ") || "no categories"}.</p>
        <section className="provider-model-list" aria-label={`${provider.name} models`}>
          {provider.models.map((model) => <article className="provider-model-row" key={model.id}>
            <div className={`model-mark tone-${model.tone}`} aria-hidden="true">{model.mark}</div>
            <div className="provider-model-copy"><Link href={`/models/${model.id}`}>{model.name}</Link><span>{model.category} · {model.context} · {model.pricing}</span></div>
            <strong className="rank-score">{model.rankingScore ? <>{model.rankingScore}<small>/100</small></> : "Unranked"}</strong>
          </article>)}
        </section>
      </> : <p className="directory-message" role="status">{message}</p>}
    </main>
  );
}
