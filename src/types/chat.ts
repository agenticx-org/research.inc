export interface Message {
  role: "user" | "ai";
  text: string;
}

export interface ModelOption {
  label: string;
  value: string;
  icon: string;
  description: string;
}

export type ModelId =
  | "gemini-flash2"
  | "gemini-pro"
  | "claude3.5"
  | "gpt4"
  | "o3mini"
  | "deepseek";
