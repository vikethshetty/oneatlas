import { Suspense } from "react";
import { ProviderDetail } from "@/frontend/features/providers/provider-detail";

async function ProviderPageContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProviderDetail slug={slug} />;
}

export default function ProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<main className="directory-page"><p className="directory-message">Loading provider page…</p></main>}>
      <ProviderPageContent params={params} />
    </Suspense>
  );
}
