import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not configured.");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const catalog = [
  { slug: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet", provider: "Anthropic", providerSlug: "anthropic", category: "Chat", description: "A thoughtful collaborator for writing, research, and complex reasoning.", context: "200K context", contextTokens: 200000, pricing: "$3 / 1M input tokens", inputPrice: 3, outputPrice: 15, releasedAt: new Date("2025-02-24"), modalities: ["Text", "Image"], capabilities: ["Reasoning", "Tool calling", "Vision"], modelType: "Language model", openWeights: false, badge: "Trending", mark: "A", tone: "orange", rankingScore: 88, benchmarks: [{ name: "Reasoning sample", score: 82.4, source: "Illustrative seed data" }] },
  { slug: "gpt-4-1", name: "GPT-4.1", provider: "OpenAI", providerSlug: "openai", category: "Chat", description: "Reliable intelligence with strong instruction following and broad knowledge.", context: "1M context", contextTokens: 1000000, pricing: "$2 / 1M input tokens", inputPrice: 2, outputPrice: 8, releasedAt: new Date("2025-04-14"), modalities: ["Text", "Image"], capabilities: ["Reasoning", "Tool calling", "Structured output", "Vision"], modelType: "Language model", openWeights: false, badge: "Popular", mark: "◎", tone: "green", rankingScore: 90, benchmarks: [{ name: "Reasoning sample", score: 79.1, source: "Illustrative seed data" }, { name: "Coding sample", score: 84.2, source: "Illustrative seed data" }] },
  { slug: "gemini-2-5-pro", name: "Gemini 2.5 Pro", provider: "Google", providerSlug: "google", category: "Chat", description: "Advanced multimodal reasoning built for your most demanding tasks.", context: "1M context", contextTokens: 1000000, pricing: "$1.25 / 1M input tokens", inputPrice: 1.25, outputPrice: 10, releasedAt: new Date("2025-03-25"), modalities: ["Text", "Image", "Audio", "Video"], capabilities: ["Reasoning", "Tool calling", "Vision", "Long context"], modelType: "Language model", openWeights: false, mark: "✦", tone: "blue", rankingScore: 89, benchmarks: [{ name: "Reasoning sample", score: 81.3, source: "Illustrative seed data" }] },
  { slug: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek", providerSlug: "deepseek", category: "Code", description: "Open reasoning model that shows its work across math and coding.", context: "128K context", contextTokens: 128000, pricing: "$0.55 / 1M input tokens", inputPrice: 0.55, outputPrice: 2.19, releasedAt: new Date("2025-01-20"), modalities: ["Text"], capabilities: ["Reasoning", "Code"], modelType: "Reasoning model", openWeights: true, badge: "Open weights", mark: "◈", tone: "slate", rankingScore: 86, benchmarks: [{ name: "Reasoning sample", score: 86.0, source: "Illustrative seed data" }, { name: "Coding sample", score: 80.5, source: "Illustrative seed data" }] },
  { slug: "flux-1-1-pro", name: "FLUX.1 [pro]", provider: "Black Forest Labs", providerSlug: "black-forest-labs", category: "Image", description: "Create expressive, finely detailed images from a simple prompt.", context: "Image generation", pricing: "$0.04 / image", releasedAt: new Date("2024-10-02"), modalities: ["Text", "Image"], capabilities: ["Image generation"], modelType: "Image model", openWeights: false, mark: "✳", tone: "pink", rankingScore: 84, benchmarks: [] },
  { slug: "whisper-large-v3", name: "Whisper large-v3", provider: "OpenAI", providerSlug: "openai", category: "Audio", description: "Accurate speech recognition across languages, accents, and settings.", context: "Speech to text", pricing: "$0.006 / minute", releasedAt: new Date("2023-11-06"), modalities: ["Audio", "Text"], capabilities: ["Transcription", "Multilingual"], modelType: "Speech recognition", openWeights: true, mark: "≋", tone: "violet", rankingScore: 83, benchmarks: [] },
  { slug: "veo-3-1", name: "Veo 3.1", provider: "Google", providerSlug: "google", category: "Video", description: "Generate high-quality video with synchronized audio from text or image prompts.", context: "Video generation", pricing: "$0.40 / second (720p–1080p)", modalities: ["Text", "Image", "Video", "Audio"], capabilities: ["Video generation", "Audio generation"], modelType: "Video generation model", openWeights: false, mark: "✦", tone: "blue", rankingScore: 87, benchmarks: [] },
  { slug: "veo-3-1-fast", name: "Veo 3.1 Fast", provider: "Google", providerSlug: "google", category: "Video", description: "A faster video generation option for lower-latency creative workflows.", context: "Video generation", pricing: "$0.10 / second (720p)", modalities: ["Text", "Image", "Video", "Audio"], capabilities: ["Video generation", "Audio generation", "Low latency"], modelType: "Video generation model", openWeights: false, mark: "✦", tone: "blue", rankingScore: 84, benchmarks: [] },
  { slug: "text-embedding-3-large", name: "text-embedding-3-large", provider: "OpenAI", providerSlug: "openai", category: "Embedding", description: "High-quality text embeddings for search, clustering, recommendations, and classification.", context: "Text embeddings", pricing: "$0.13 / 1M tokens", inputPrice: 0.13, modalities: ["Text"], capabilities: ["Embeddings", "Search", "Multilingual"], modelType: "Embedding model", openWeights: false, mark: "◎", tone: "green", rankingScore: 89, benchmarks: [] },
  { slug: "cohere-embed-v5-pro", name: "Cohere Embed v5.0 Pro", provider: "Cohere", providerSlug: "cohere", category: "Embedding", description: "A high-quality embedding model for text, images, and mixed-content retrieval.", context: "128K context", contextTokens: 128000, pricing: "Provider pricing varies", modalities: ["Text", "Image"], capabilities: ["Embeddings", "Multimodal retrieval", "Search"], modelType: "Embedding model", openWeights: false, mark: "C", tone: "slate", rankingScore: 88, benchmarks: [] },
  { slug: "elevenlabs-scribe-v3", name: "ElevenLabs Scribe v3", provider: "ElevenLabs", providerSlug: "elevenlabs", category: "Speech", description: "Speech recognition for recorded audio with multilingual transcription and speaker diarization.", context: "Speech to text", pricing: "Provider pricing varies", modalities: ["Audio", "Text"], capabilities: ["Transcription", "Multilingual", "Speaker diarization"], modelType: "Speech recognition", openWeights: false, mark: "E", tone: "violet", rankingScore: 88, benchmarks: [] },
  { slug: "elevenlabs-scribe-v3-live", name: "ElevenLabs Scribe v3 Live", provider: "ElevenLabs", providerSlug: "elevenlabs", category: "Speech", description: "Real-time speech recognition with turn prediction and multilingual support.", context: "Real-time speech to text", pricing: "Provider pricing varies", modalities: ["Audio", "Text"], capabilities: ["Real-time transcription", "Multilingual", "Turn prediction"], modelType: "Speech recognition", openWeights: false, mark: "E", tone: "violet", rankingScore: 86, benchmarks: [] },
  { slug: "cohere-rerank-v5-pro", name: "Cohere Rerank v5.0 Pro", provider: "Cohere", providerSlug: "cohere", category: "Rerank", description: "Rerank search results for relevance across text and structured documents.", context: "32K context", contextTokens: 32000, pricing: "Provider pricing varies", modalities: ["Text"], capabilities: ["Reranking", "Multilingual", "Context focus"], modelType: "Reranking model", openWeights: false, mark: "C", tone: "slate", rankingScore: 90, benchmarks: [] },
  { slug: "cohere-rerank-v5-fast", name: "Cohere Rerank v5.0 Fast", provider: "Cohere", providerSlug: "cohere", category: "Rerank", description: "A low-latency reranking model for high-throughput search and retrieval systems.", context: "32K context", contextTokens: 32000, pricing: "Provider pricing varies", modalities: ["Text"], capabilities: ["Reranking", "Multilingual", "Low latency"], modelType: "Reranking model", openWeights: false, mark: "C", tone: "slate", rankingScore: 87, benchmarks: [] },
];

try {
  for (const item of catalog) {
    const { provider, providerSlug, benchmarks, ...model } = item;
    const dbProvider = await prisma.provider.upsert({
      where: { slug: providerSlug },
      update: { name: provider },
      create: { slug: providerSlug, name: provider },
    });
    const savedModel = await prisma.model.upsert({
      where: { slug: model.slug },
      update: { ...model, providerId: dbProvider.id },
      create: { ...model, providerId: dbProvider.id },
    });
    for (const benchmark of benchmarks) {
      await prisma.benchmarkScore.upsert({
        where: { modelId_name: { modelId: savedModel.id, name: benchmark.name } },
        update: { score: benchmark.score, source: benchmark.source },
        create: { ...benchmark, modelId: savedModel.id },
      });
    }
  }
  console.log(`Seeded ${catalog.length} models.`);
} finally {
  await prisma.$disconnect();
}
