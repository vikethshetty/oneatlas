import "server-only";
import { getPrismaClient } from "@/backend/database/prisma";
import type { ModelWriteInput } from "@/backend/validation/model-input";

export function findAllModels() {
  return getPrismaClient().model.findMany({
    include: { provider: { select: { name: true, slug: true } } },
    orderBy: { name: "asc" },
  });
}

export function findRankedModels(category?: string) {
  return getPrismaClient().model.findMany({
    where: { rankingScore: { gt: 0 }, ...(category ? { category } : {}) },
    include: { provider: { select: { name: true, slug: true } } },
    orderBy: [{ rankingScore: "desc" }, { name: "asc" }],
  });
}

export function findModelBySlug(slug: string) {
  return getPrismaClient().model.findUnique({
    where: { slug },
    include: { provider: { select: { name: true, slug: true } } },
  });
}

export function upsertProvider(input: Pick<ModelWriteInput, "providerSlug" | "providerName">) {
  return getPrismaClient().provider.upsert({
    where: { slug: input.providerSlug },
    create: { slug: input.providerSlug, name: input.providerName },
    update: { name: input.providerName },
  });
}

type ModelFields = Omit<ModelWriteInput, "slug" | "providerSlug" | "providerName"> & { providerId: string };

export function createModelRecord(slug: string, fields: ModelFields) {
  return getPrismaClient().model.create({
    data: { slug, ...fields, badge: fields.badge ?? null },
    include: { provider: { select: { name: true, slug: true } } },
  });
}

export function updateModelRecord(slug: string, fields: ModelFields) {
  return getPrismaClient().model.update({
    where: { slug },
    data: { ...fields, badge: fields.badge ?? null },
    include: { provider: { select: { name: true, slug: true } } },
  });
}

export function deleteModelRecord(slug: string) {
  return getPrismaClient().model.delete({ where: { slug } });
}

export function findAllProviders() {
  return getPrismaClient().provider.findMany({
    include: {
      models: { select: { slug: true, name: true, category: true, rankingScore: true }, orderBy: [{ rankingScore: "desc" }, { name: "asc" }] },
      _count: { select: { models: true } },
    },
    orderBy: { name: "asc" },
  });
}

export function findProviderBySlug(slug: string) {
  return getPrismaClient().provider.findUnique({
    where: { slug },
    include: {
      models: {
        include: { provider: { select: { name: true, slug: true } } },
        orderBy: [{ rankingScore: "desc" }, { name: "asc" }],
      },
      _count: { select: { models: true } },
    },
  });
}
