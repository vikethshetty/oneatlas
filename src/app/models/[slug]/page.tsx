import { Suspense } from "react";
import { ModelDetail } from "@/frontend/features/models/model-detail";

async function ModelPageContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ModelDetail slug={slug} />;
}

export default function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<main className="model-detail-page"><div className="detail-message">Loading model page…</div></main>}>
      <ModelPageContent params={params} />
    </Suspense>
  );
}
