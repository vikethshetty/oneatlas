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
};

type ParseResult = { ok: true; value: ModelWriteInput } | { ok: false; message: string };
const categories: ModelCategory[] = ["Chat", "Image", "Code", "Audio"];
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

  if (!name || !providerName || !description || !context || !pricing || !mark) {
    return { ok: false, message: "Required text fields are missing or outside their allowed length." };
  }
  if (!providerSlug || !slugPattern.test(providerSlug)) {
    return { ok: false, message: "providerSlug must contain lowercase letters, numbers, and hyphens." };
  }
  if (typeof category !== "string" || !categories.includes(category as ModelCategory)) {
    return { ok: false, message: "category must be Chat, Image, Code, or Audio." };
  }
  if (typeof tone !== "string" || !tones.includes(tone as ModelTone)) {
    return { ok: false, message: "tone is not supported." };
  }
  if (!Number.isInteger(rankingScore) || (rankingScore as number) < 1 || (rankingScore as number) > 100) {
    return { ok: false, message: "rankingScore must be a whole number from 1 to 100." };
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
    },
  };
}
