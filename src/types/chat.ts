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
  | "claude3.7"
  | "claude3.7-reasoning"
  | "gpt4"
  | "o3mini"
  | "deepseek";
