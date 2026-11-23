export type ModelCategory = "Chat" | "Image" | "Code" | "Audio" | "Video" | "Embedding" | "Speech" | "Rerank";

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
  modelType: string;
  modalities: string[];
  capabilities: string[];
  contextTokens: number | null;
  inputPrice: number | null;
  outputPrice: number | null;
  releasedAt: string | null;
  openWeights: boolean;
  benchmarks: BenchmarkScore[];
};
export type BenchmarkScore = { name: string; score: number; source: string | null };
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
