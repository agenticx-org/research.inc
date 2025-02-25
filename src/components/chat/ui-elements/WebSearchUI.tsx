import { WebSearchElement } from "@/types/chat";
import { Globe } from "@phosphor-icons/react";

interface WebSearchUIProps {
  content: WebSearchElement;
}

const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

export function WebSearchUI({ content }: WebSearchUIProps) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white overflow-hidden shadow-none">
      <div className="px-3 py-2 flex items-center gap-1.5">
        <Globe className="size-4 text-blue-500" weight="regular" />
        <h3 className="text-sm font-medium">Web Search Result</h3>
      </div>
      <div className="px-3 pb-3">
        <a
          href={isValidUrl(content.url) ? content.url : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          {content.title}
        </a>
        <p className="text-xs mt-1 text-gray-600">{content.snippet}</p>
        <div className="text-xs text-gray-500 mt-1 truncate">{content.url}</div>
      </div>
    </div>
  );
}
