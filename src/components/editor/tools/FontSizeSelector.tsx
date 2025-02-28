import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";

// Font size options
const FONT_SIZES = [
  { label: "12px", value: "12px" },
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
  { label: "30px", value: "30px" },
  { label: "36px", value: "36px" },
];

interface FontSizeSelectorProps {
  editor: Editor | null;
}

export function FontSizeSelector({ editor }: FontSizeSelectorProps) {
  const [fontSize, setFontSize] = useState("16px");

  // Update font size state when selection changes
  useEffect(() => {
    if (!editor) return;

    // Update state initially
    setFontSize(editor.getAttributes("textStyle").fontSize || "16px");

    // Add event listeners for selection changes
    const updateFontSize = () => {
      setFontSize(editor.getAttributes("textStyle").fontSize || "16px");
    };

    editor.on("selectionUpdate", updateFontSize);
    editor.on("update", updateFontSize);

    return () => {
      // Clean up event listeners
      editor.off("selectionUpdate", updateFontSize);
      editor.off("update", updateFontSize);
    };
  }, [editor]);

  if (!editor) return null;

  const handleFontSizeChange = (value: string) => {
    editor.chain().focus().setFontSize(value).run();
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <Select value={fontSize} onValueChange={handleFontSizeChange}>
            <SelectTrigger className="w-[90px] h-8 border-none shadow-none focus:ring-0 focus:ring-offset-0 pr-0">
              <div className="flex items-center gap-1">
                <SelectValue placeholder="16px" />
              </div>
            </SelectTrigger>
            <SelectContent className="p-1 rounded-xl shadow-lg">
              {FONT_SIZES.map((size) => (
                <SelectItem
                  key={size.value}
                  value={size.value}
                  className="py-2"
                >
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TooltipTrigger>
      <TooltipContent className="px-2 py-1 text-xs">Font size</TooltipContent>
    </Tooltip>
  );
}
