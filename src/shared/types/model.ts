export type ModelCategory = "Chat" | "Image" | "Code" | "Audio";

export type AiModel = {
  id: string;
  name: string;
  provider: string;
  providerSlug: string;
  category: ModelCategory;
  rankingScore: number;
  description: string;
  context: string;
  pricing: string;
  badge?: string;
  mark: string;
  tone: "violet" | "blue" | "orange" | "green" | "pink" | "slate";
};
export type ModelTone = AiModel['tone'];

export type ProviderSummary = {
  name: string;
  slug: string;
  modelCount: number;
  categories: ModelCategory[];
  topModel: Pick<AiModel, "id" | "name" | "rankingScore"> | null;
};

export type ProviderDetail = ProviderSummary & { models: AiModel[] };

export type ModelCatalogResponse = {
  data: AiModel[];
  count: number;
};
