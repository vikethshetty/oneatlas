import type { ProviderDetail, ProviderSummary } from "@/shared/types/model";

async function readData<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error("The provider directory could not be loaded.");
  return result.data as T;
}

export function fetchProviders() {
  return readData<ProviderSummary[]>("/api/providers");
}

export function fetchProvider(slug: string) {
  return readData<ProviderDetail>(`/api/providers/${encodeURIComponent(slug)}`);
}
