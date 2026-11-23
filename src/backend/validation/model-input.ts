import type { ModelCategory, ModelTone } from "@/shared/types/model";

export type ModelWriteInput = {
  slug?: string;
  name: string;
  providerSlug: string;
  providerName: string;
  category: ModelCategory;
  description: string;
  context: string;
  pricing: string;
  badge?: string;
  mark: string;
  tone: ModelTone;
  rankingScore: number;
  modelType: string;
  modalities: string[];
  capabilities: string[];
  contextTokens: number | null;
  inputPrice: number | null;
  outputPrice: number | null;
  releasedAt: string | null;
  openWeights: boolean;
  benchmarks: { name: string; score: number; source?: string }[];
};

type ParseResult = { ok: true; value: ModelWriteInput } | { ok: false; message: string };
const categories: ModelCategory[] = ["Chat", "Image", "Code", "Audio", "Video", "Embedding", "Speech", "Rerank"];
const tones: ModelTone[] = ["violet", "blue", "orange", "green", "pink", "slate"];
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getText(value: Record<string, unknown>, key: string, min: number, max: number) {
  const field = value[key];
  if (typeof field !== "string") return null;
  const text = field.trim();
  return text.length >= min && text.length <= max ? text : null;
}

export function parseModelInput(value: unknown, requireSlug: boolean): ParseResult {
  if (!isRecord(value)) return { ok: false, message: "Request body must be a JSON object." };

  const slug = requireSlug ? getText(value, "slug", 2, 80) : undefined;
  if (requireSlug && (!slug || !slugPattern.test(slug))) {
    return { ok: false, message: "slug must contain lowercase letters, numbers, and hyphens." };
  }

  const name = getText(value, "name", 2, 100);
  const providerSlug = getText(value, "providerSlug", 2, 80);
  const providerName = getText(value, "providerName", 2, 100);
  const description = getText(value, "description", 10, 2000);
  const context = getText(value, "context", 2, 80);
  const pricing = getText(value, "pricing", 2, 120);
  const mark = getText(value, "mark", 1, 8);
  const category = value.category;
  const tone = value.tone;
  const rankingScore = value.rankingScore;
  const modelType = value.modelType === undefined ? "Language model" : getText(value, "modelType", 2, 50);
  const contextTokens = value.contextTokens === undefined || value.contextTokens === null || value.contextTokens === "" ? null : value.contextTokens;
  const inputPrice = value.inputPrice === undefined || value.inputPrice === null || value.inputPrice === "" ? null : value.inputPrice;
  const outputPrice = value.outputPrice === undefined || value.outputPrice === null || value.outputPrice === "" ? null : value.outputPrice;
  const releasedAt = value.releasedAt === undefined || value.releasedAt === null || value.releasedAt === "" ? null : value.releasedAt;
  const listField = (key: string) => {
    const field = value[key];
    if (field === undefined) return [];
    if (!Array.isArray(field) || field.length > 20 || field.some((item) => typeof item !== "string" || !item.trim() || item.length > 40)) return null;
    return [...new Set(field.map((item) => (item as string).trim()))];
  };
  const modalities = listField("modalities");
  const capabilities = listField("capabilities");
  const benchmarks = value.benchmarks === undefined ? [] : value.benchmarks;

  if (!name || !providerName || !description || !context || !pricing || !mark) {
    return { ok: false, message: "Required text fields are missing or outside their allowed length." };
  }
  if (!providerSlug || !slugPattern.test(providerSlug)) {
    return { ok: false, message: "providerSlug must contain lowercase letters, numbers, and hyphens." };
  }
  if (typeof category !== "string" || !categories.includes(category as ModelCategory)) {
    return { ok: false, message: "category must be Chat, Image, Code, Audio, Video, Embedding, Speech, or Rerank." };
  }
  if (typeof tone !== "string" || !tones.includes(tone as ModelTone)) {
    return { ok: false, message: "tone is not supported." };
  }
  if (!Number.isInteger(rankingScore) || (rankingScore as number) < 1 || (rankingScore as number) > 100) {
    return { ok: false, message: "rankingScore must be a whole number from 1 to 100." };
  }
  if (!modelType || !modalities || !capabilities) return { ok: false, message: "Model type, modalities, or capabilities are invalid." };
  for (const [key, number] of [["contextTokens", contextTokens], ["inputPrice", inputPrice], ["outputPrice", outputPrice]] as const) {
    if (number !== null && (typeof number !== "number" || !Number.isFinite(number) || number < 0 || (key === "contextTokens" && !Number.isInteger(number)))) {
      return { ok: false, message: `${key} must be a non-negative ${key === "contextTokens" ? "whole number" : "number"}.` };
    }
  }
  if (releasedAt !== null && (typeof releasedAt !== "string" || Number.isNaN(Date.parse(releasedAt)))) return { ok: false, message: "releasedAt must be a valid date." };
  if (value.openWeights !== undefined && typeof value.openWeights !== "boolean") return { ok: false, message: "openWeights must be a boolean." };
  if (!Array.isArray(benchmarks) || benchmarks.length > 30 || benchmarks.some((item) => !isRecord(item) || typeof item.name !== "string" || item.name.trim().length < 2 || item.name.trim().length > 80 || typeof item.score !== "number" || !Number.isFinite(item.score) || item.score < 0 || item.score > 10000 || (item.source !== undefined && (typeof item.source !== "string" || item.source.trim().length > 160)))) {
    return { ok: false, message: "benchmarks must contain named scores from 0 to 10000 and optional source labels." };
  }
  const seenBenchmarks = new Set<string>();
  for (const item of benchmarks as { name: string; score: number; source?: string }[]) {
    const key = item.name.trim().toLowerCase();
    if (seenBenchmarks.has(key)) return { ok: false, message: "Benchmark names must be unique per model." };
    seenBenchmarks.add(key);
  }

  let badge: string | undefined;
  if (value.badge !== undefined && value.badge !== null && value.badge !== "") {
    if (typeof value.badge !== "string" || value.badge.trim().length > 40) {
      return { ok: false, message: "badge must be 40 characters or fewer." };
    }
    badge = value.badge.trim();
  }

  return {
    ok: true,
    value: {
      ...(slug ? { slug } : {}),
      name,
      providerSlug,
      providerName,
      category: category as ModelCategory,
      description,
      context,
      pricing,
      ...(badge ? { badge } : {}),
      mark,
      tone: tone as ModelTone,
      rankingScore: rankingScore as number,
      modelType,
      modalities,
      capabilities,
      contextTokens: contextTokens as number | null,
      inputPrice: inputPrice as number | null,
      outputPrice: outputPrice as number | null,
      releasedAt: releasedAt as string | null,
      openWeights: value.openWeights === true,
      benchmarks: (benchmarks as { name: string; score: number; source?: string }[]).map((item) => ({ name: item.name.trim(), score: item.score, ...(item.source?.trim() ? { source: item.source.trim() } : {}) })),
    },
  };
}
