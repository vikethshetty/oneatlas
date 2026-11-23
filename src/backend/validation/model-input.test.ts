import assert from "node:assert/strict";
import { test } from "node:test";
import { parseModelInput } from "./model-input";

const validModel = {
  slug: "sample-model",
  name: "Sample Model",
  providerSlug: "sample-provider",
  providerName: "Sample Provider",
  category: "Chat",
  description: "A sample model for validation tests.",
  context: "128K context",
  pricing: "$1 per million tokens",
  mark: "S",
  tone: "green",
  rankingScore: 75,
};

test("model input accepts valid catalog fields", () => {
  const result = parseModelInput(validModel, true);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value.rankingScore, 75);
});

test("model input rejects malformed slugs, unsupported categories, and invalid scores", () => {
  assert.equal(parseModelInput({ ...validModel, slug: "Bad Slug" }, true).ok, false);
  assert.equal(parseModelInput({ ...validModel, category: "Robotics" }, true).ok, false);
  assert.equal(parseModelInput({ ...validModel, rankingScore: 0 }, true).ok, false);
  assert.equal(parseModelInput({ ...validModel, rankingScore: 101 }, true).ok, false);
  assert.equal(parseModelInput({ ...validModel, rankingScore: 50.5 }, true).ok, false);
});

test("updates may omit a slug while create payloads may not", () => {
  const update = Object.fromEntries(Object.entries(validModel).filter(([key]) => key !== "slug"));
  assert.equal(parseModelInput(update, false).ok, true);
  assert.equal(parseModelInput(update, true).ok, false);
});
