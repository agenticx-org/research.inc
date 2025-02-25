import { AgentUIElement, WebSearchElement } from "@/types/chat";
import { WebSearchUI } from "./WebSearchUI";

interface UIElementProps {
  element: AgentUIElement;
}

export function UIElement({ element }: UIElementProps) {
  switch (element.type) {
    case "web_search":
      return <WebSearchUI content={element.content as WebSearchElement} />;
    default:
      return null;
  }
}
