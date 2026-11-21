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