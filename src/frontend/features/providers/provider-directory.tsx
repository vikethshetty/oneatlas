"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ProviderSummary } from "@/shared/types/model";
import { fetchProviders } from "@/frontend/features/providers/providers.api";

export function ProviderDirectory({ kind = "providers" }: { kind?: "labs" | "providers" }) {
  const [providers, setProviders] = useState<ProviderSummary[]>([]);
  const [message, setMessage] = useState("Loading providers…");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    void fetchProviders().then((data) => {
      if (!active) return;
      setProviders(data);
      setMessage(data.length ? "" : "No providers are in the catalog yet.");
    }).catch(() => { if (active) setMessage("Could not load providers. Check the database and try again."); });
    return () => { active = false; };
  }, []);

  const visibleProviders = useMemo(() => providers.filter((provider) => `${provider.name} ${provider.categories.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())), [providers, query]);

  return (
    <main className="directory-page">
      <p className="eyebrow">THE {kind === "labs" ? "LAB" : "PROVIDER"} DIRECTORY</p>
      <h1>{kind === "labs" ? "Explore AI labs." : "Explore model providers."}</h1>
      <p className="section-copy">{kind === "labs" ? "Meet the companies and research groups behind the models in the catalog." : "Browse API providers and see the models available from each one."}</p>
      {message ? <p className="directory-message" role="status">{message}</p> : null}
      <label className="directory-search">Filter {kind === "labs" ? "labs" : "providers"}<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${kind}`} /></label>
      <section className="provider-grid" aria-label="AI providers">
        {visibleProviders.map((provider) => (
          <Link className="provider-card" href={`/providers/${provider.slug}`} key={provider.slug}>
            <span className="provider-initial" aria-hidden="true">{provider.name.slice(0, 1)}</span>
            <span className="provider-card-copy"><strong>{provider.name}</strong><small>{provider.modelCount} model{provider.modelCount === 1 ? "" : "s"} · {provider.categories.join(", ") || "No categories"}</small></span>
            <span className="provider-arrow" aria-hidden="true">↗</span>
            {provider.topModel ? <span className="provider-top-model">Top ranked: {provider.topModel.name} · {provider.topModel.rankingScore}/100</span> : null}
          </Link>
        ))}
      </section>
    </main>
  );
}
