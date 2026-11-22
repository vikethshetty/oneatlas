import "server-only";
import {
  createModelRecord,
  deleteModelRecord,
  findAllModels,
  findAllProviders,
  findModelBySlug,
  findProviderBySlug,
  findRankedModels,
  updateModelRecord,
  upsertProvider,
} from "@/backend/repositories/model.repository";
import type { AiModel, ModelCategory, ModelTone } from "@/shared/types/model";
import type { ModelWriteInput } from "@/backend/validation/model-input";

export class ModelNotFoundError extends Error {}
export class CatalogConflictError extends Error {}

function isUniqueConstraintError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

function toModel(record: {
  slug: string; name: string; category: string; description: string; context: string;
  pricing: string; badge: string | null; mark: string; tone: string; rankingScore: number;
  provider: { name: string; slug: string };
}): AiModel {
  return {
    id: record.slug,
    name: record.name,
    provider: record.provider.name,
    providerSlug: record.provider.slug,
    category: record.category as ModelCategory,
    rankingScore: record.rankingScore,
    description: record.description,
    context: record.context,
    pricing: record.pricing,
    ...(record.badge ? { badge: record.badge } : {}),
    mark: record.mark,
    tone: record.tone as ModelTone,
  };
}

export async function listModels(): Promise<AiModel[]> {
  return (await findAllModels()).map(toModel);
}

export async function listRankedModels(category?: string): Promise<AiModel[]> {
  return (await findRankedModels(category)).map(toModel);
}

export async function listProviders() {
  const providers = await findAllProviders();
  return providers.map((provider) => ({
    name: provider.name,
    slug: provider.slug,
    modelCount: provider._count.models,
    categories: [...new Set(provider.models.map((model) => model.category as ModelCategory))],
    topModel: provider.models[0]?.rankingScore ? {
      id: provider.models[0].slug,
      name: provider.models[0].name,
      rankingScore: provider.models[0].rankingScore,
    } : null,
  }));
}

export async function getProvider(slug: string) {
  const provider = await findProviderBySlug(slug);
  if (!provider) return null;
  const models = provider.models.map(toModel);
  return {
    name: provider.name,
    slug: provider.slug,
    modelCount: provider._count.models,
    categories: [...new Set(models.map((model) => model.category))],
    topModel: models[0]?.rankingScore ? { id: models[0].id, name: models[0].name, rankingScore: models[0].rankingScore } : null,
    models,
  };
}

export async function getModel(slug: string): Promise<AiModel | null> {
  const record = await findModelBySlug(slug);
  return record ? toModel(record) : null;
}

export async function createModel(input: ModelWriteInput & { slug: string }): Promise<AiModel> {
  try {
    const { slug, providerSlug, providerName, ...fields } = input;
    const provider = await upsertProvider({ providerSlug, providerName });
    return toModel(await createModelRecord(slug, { ...fields, providerId: provider.id }));
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new CatalogConflictError("A model or provider with that identifier already exists.");
    throw error;
  }
}

export async function updateModel(slug: string, input: ModelWriteInput): Promise<AiModel> {
  if (!(await findModelBySlug(slug))) throw new ModelNotFoundError("Model not found.");

  try {
    const { providerSlug, providerName, ...fields } = input;
    const provider = await upsertProvider({ providerSlug, providerName });
    return toModel(await updateModelRecord(slug, { ...fields, providerId: provider.id }));
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new CatalogConflictError("A provider with that name already exists.");
    throw error;
  }
}

export async function removeModel(slug: string): Promise<void> {
  if (!(await findModelBySlug(slug))) throw new ModelNotFoundError("Model not found.");
  await deleteModelRecord(slug);
}
