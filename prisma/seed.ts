import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not configured.");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const catalog = [
  { slug: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet", provider: "Anthropic", providerSlug: "anthropic", category: "Chat", description: "A thoughtful collaborator for writing, research, and complex reasoning.", context: "200K context", pricing: "$3 / 1M input tokens", badge: "Trending", mark: "A", tone: "orange" },
  { slug: "gpt-4-1", name: "GPT-4.1", provider: "OpenAI", providerSlug: "openai", category: "Chat", description: "Reliable intelligence with strong instruction following and broad knowledge.", context: "1M context", pricing: "$2 / 1M input tokens", badge: "Popular", mark: "◎", tone: "green" },
  { slug: "gemini-2-5-pro", name: "Gemini 2.5 Pro", provider: "Google", providerSlug: "google", category: "Chat", description: "Advanced multimodal reasoning built for your most demanding tasks.", context: "1M context", pricing: "$1.25 / 1M input tokens", mark: "✦", tone: "blue" },
  { slug: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek", providerSlug: "deepseek", category: "Code", description: "Open reasoning model that shows its work across math and coding.", context: "128K context", pricing: "$0.55 / 1M input tokens", badge: "Open weights", mark: "◈", tone: "slate" },
  { slug: "flux-1-1-pro", name: "FLUX.1 [pro]", provider: "Black Forest Labs", providerSlug: "black-forest-labs", category: "Image", description: "Create expressive, finely detailed images from a simple prompt.", context: "Image generation", pricing: "$0.04 / image", mark: "✳", tone: "pink" },
  { slug: "whisper-large-v3", name: "Whisper large-v3", provider: "OpenAI", providerSlug: "openai", category: "Audio", description: "Accurate speech recognition across languages, accents, and settings.", context: "Speech to text", pricing: "$0.006 / minute", mark: "≋", tone: "violet" },
];

try {
  for (const item of catalog) {
    const { provider, providerSlug, ...model } = item;
    const dbProvider = await prisma.provider.upsert({
      where: { slug: providerSlug },
      update: { name: provider },
      create: { slug: providerSlug, name: provider },
    });
    await prisma.model.upsert({
      where: { slug: model.slug },
      update: { ...model, providerId: dbProvider.id },
      create: { ...model, providerId: dbProvider.id },
    });
  }
  console.log(`Seeded ${catalog.length} models.`);
} finally {
  await prisma.$disconnect();
}
