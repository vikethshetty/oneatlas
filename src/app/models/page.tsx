import { Suspense } from "react";
import { ModelExplorer } from "@/frontend/features/models/model-explorer";

export default function ModelsPage() {
  return (
    <main>
      <Suspense fallback={<section className="catalog-section" aria-busy="true"><p className="directory-message">Loading model directory…</p></section>}>
        <ModelExplorer directoryPage />
      </Suspense>
    </main>
  );
}
