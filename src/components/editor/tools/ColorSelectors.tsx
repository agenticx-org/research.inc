import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TextAa } from "@phosphor-icons/react";
import { Editor } from "@tiptap/react";

// Text color options
const TEXT_COLORS = [
  { label: "Black", value: "#000000" },
  { label: "Purple", value: "#9333EA" },
  { label: "Red", value: "#E11D48" },
  { label: "Blue", value: "#2563EB" },
  { label: "Green", value: "#16A34A" },
];

// Highlight color options
const HIGHLIGHT_COLORS = [
  { label: "Yellow", value: "#ffeb3b" },
  { label: "Green", value: "#a5d6a7" },
  { label: "Blue", value: "#90caf9" },
  { label: "Pink", value: "#f48fb1" },
  { label: "Purple", value: "#ce93d8" },
];

interface ColorSelectorsProps {
  editor: Editor | null;
}

export function ColorSelectors({ editor }: ColorSelectorsProps) {
  if (!editor) return null;

  const getCurrentTextColor = () => {
    return editor.getAttributes("textStyle").color || "default";
  };

  const getCurrentHighlightColor = () => {
    return editor.getAttributes("highlight").color || "none";
  };

  const handleTextColorChange = (value: string) => {
    if (value === "default") {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(value).run();
    }
  };

  const handleHighlightColorChange = (value: string) => {
    if (value === "none") {
      editor.chain().focus().unsetHighlight().run();
    } else {
      editor.chain().focus().setHighlight({ color: value }).run();
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Select
              value={getCurrentTextColor()}
              onValueChange={handleTextColorChange}
            >
              <SelectTrigger className="w-8 h-8 border-none shadow-none focus:ring-0 focus:ring-offset-0 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded">
                <div
                  className="w-full h-full rounded-full border border-gray-200 flex-shrink-0"
                  style={{
                    backgroundColor:
                      editor.getAttributes("textStyle").color || "currentColor",
                  }}
                />
              </SelectTrigger>
              <SelectContent className="p-1 rounded-xl shadow-lg">
                {TEXT_COLORS.map((color) => (
                  <SelectItem
                    key={color.value}
                    value={color.value}
                    className="py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TooltipTrigger>
        <TooltipContent className="px-2 py-1 text-xs">
          Text color
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Select
              value={getCurrentHighlightColor()}
              onValueChange={handleHighlightColorChange}
            >
              <SelectTrigger className="w-8 h-8 border-none shadow-none focus:ring-0 focus:ring-offset-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <div
                  className="p-1 rounded"
                  style={{
                    backgroundColor:
                      editor.getAttributes("highlight").color || "white",
                  }}
                >
                  <TextAa size={16} />
                </div>
              </SelectTrigger>
              <SelectContent className="p-1 rounded-xl shadow-lg">
                <SelectItem value="none" className="py-2">
                  No highlight
                </SelectItem>
                {HIGHLIGHT_COLORS.map((color) => (
                  <SelectItem
                    key={color.value}
                    value={color.value}
                    className="py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TooltipTrigger>
        <TooltipContent className="px-2 py-1 text-xs">
          Highlight color
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
