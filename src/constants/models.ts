import { ModelOption } from "@/types/chat";

export const MODEL_OPTIONS: ModelOption[] = [
  // Anthropic models
  {
    label: "Claude 4 Sonnet",
    value: "claude-sonnet-4",
    icon: "/anthropic-logo.svg",
    description: "fast, highly intelligent, versatile output",
  },
  // Kimi K2
  {
    label: "Kimi K2",
    value: "kimi-k2",
    icon: "/kimi-k2.png",
    description: "smart, ultra fast, open source model",
  },
];
