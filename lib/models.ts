export type ModelCategory = "Chat" | "Image" | "Code" | "Audio";

export type AiModel = {
  id: string;
  name: string;
  provider: string;
  category: ModelCategory;
  description: string;
  context: string;
  pricing: string;
  badge?: string;
  mark: string;
  tone: "violet" | "blue" | "orange" | "green" | "pink" | "slate";
};

export const models: AiModel[] = [
  { id: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet", provider: "Anthropic", category: "Chat", description: "A thoughtful collaborator for writing, research, and complex reasoning.", context: "200K context", pricing: "$3 / 1M input tokens", badge: "Trending", mark: "A", tone: "orange" },
  { id: "gpt-4-1", name: "GPT-4.1", provider: "OpenAI", category: "Chat", description: "Reliable intelligence with strong instruction following and broad knowledge.", context: "1M context", pricing: "$2 / 1M input tokens", badge: "Popular", mark: "◎", tone: "green" },
  { id: "gemini-2-5-pro", name: "Gemini 2.5 Pro", provider: "Google", category: "Chat", description: "Advanced multimodal reasoning built for your most demanding tasks.", context: "1M context", pricing: "$1.25 / 1M input tokens", mark: "✦", tone: "blue" },
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek", category: "Code", description: "Open reasoning model that shows its work across math and coding.", context: "128K context", pricing: "$0.55 / 1M input tokens", badge: "Open weights", mark: "◈", tone: "slate" },
  { id: "flux-1-1-pro", name: "FLUX.1 [pro]", provider: "Black Forest Labs", category: "Image", description: "Create expressive, finely detailed images from a simple prompt.", context: "Image generation", pricing: "$0.04 / image", mark: "✳", tone: "pink" },
  { id: "whisper-large-v3", name: "Whisper large-v3", provider: "OpenAI", category: "Audio", description: "Accurate speech recognition across languages, accents, and settings.", context: "Speech to text", pricing: "$0.006 / minute", mark: "≋", tone: "violet" },
];
