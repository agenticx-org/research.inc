import { ModelOption } from "@/types/chat";

export const MODEL_OPTIONS: ModelOption[] = [
  // Google models
  {
    label: "Gemini Flash 2.0",
    value: "gemini-flash2",
    icon: "/google-logo.webp",
    description: "fastest, most detailed",
  },
  {
    label: "Gemini Pro 1.5",
    value: "gemini-pro",
    icon: "/google-logo.webp",
    description: "medium speed, paragraph/report like output",
  },
  // Anthropic models
  {
    label: "Claude 3.5 Sonnet",
    value: "claude3.5",
    icon: "/anthropic-logo.svg",
    description: "medium speed, detailed write up like output",
  },
  // OpenAI models
  {
    label: "GPT-4o",
    value: "gpt4",
    icon: "/openai-logo.svg",
    description: "medium speed, succint write up like output",
  },
  {
    label: "o3-mini",
    value: "o3mini",
    icon: "/openai-logo.svg",
    description: "slow, intelligent reasoning, research paper like output",
  },
  // Deepseek models
  {
    label: "Deepseek R1",
    value: "deepseek",
    icon: "/deepseek-logo.png",
    description: "slowest, intelligent reasoning, highly detailed report",
  },
];
