import type { AiModel, ModelCatalogResponse } from "@/shared/types/model";

export class ModelApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export async function fetchModelCatalog(signal?: AbortSignal): Promise<ModelCatalogResponse> {
  const response = await fetch("/api/models", { cache: "no-store", signal });
  if (!response.ok) throw new ModelApiError("Could not load the model catalog.", response.status);
  return (await response.json()) as ModelCatalogResponse;
}

export async function fetchModel(slug: string, signal?: AbortSignal): Promise<AiModel> {
  const response = await fetch(`/api/models/${encodeURIComponent(slug)}`, { cache: "no-store", signal });
  if (!response.ok) throw new ModelApiError("Could not load this model.", response.status);
  const result = (await response.json()) as { data: AiModel };
  return result.data;
}
