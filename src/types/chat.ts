export interface Message {
  role: "user" | "ai";
  content: MessageContent[];
}

export type MessageContent = TextContent | ElementContent;

export interface TextContent {
  type: "text";
  text: string;
}

export interface ElementContent {
  type: "element";
  element: AgentUIElement;
}

export interface AgentUIElement {
  type: "web_search" | "code_block" | "file_tree" | "image";
  content: WebSearchElement | CodeBlockElement | FileTreeElement | ImageElement;
}

export interface WebSearchElement {
  title: string;
  url: string;
  snippet: string;
}

export interface CodeBlockElement {
  language: string;
  code: string;
}

export interface FileTreeElement {
  files: string[];
}

export interface ImageElement {
  src: string;
  alt: string;
  width?: number;
  height?: number;
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
