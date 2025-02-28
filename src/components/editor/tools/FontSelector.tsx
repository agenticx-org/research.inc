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
import { TextT } from "@phosphor-icons/react";
import { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";

// Define available fonts
const BASE_FONTS = [
  { label: "Arial", value: "Arial" },
  { label: "Helvetica", value: "Helvetica" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Courier New", value: "Courier New" },
  { label: "Georgia", value: "Georgia" },
  { label: "Verdana", value: "Verdana" },
];

// Apple system font
const APPLE_FONT = {
  label: "San Francisco",
  value: "-apple-system, BlinkMacSystemFont, 'San Francisco'",
};

interface FontSelectorProps {
  editor: Editor | null;
}

export function FontSelector({ editor }: FontSelectorProps) {
  const [fonts, setFonts] = useState(BASE_FONTS);
  const [currentFont, setCurrentFont] = useState("default");

  useEffect(() => {
    // Check if user is on an Apple device
    const isAppleDevice = /Mac|iPhone|iPad|iPod/.test(navigator.platform);

    if (isAppleDevice) {
      setFonts([APPLE_FONT, ...BASE_FONTS]);
    } else {
      setFonts(BASE_FONTS);
    }
  }, []);

  // Update font state when selection changes
  useEffect(() => {
    if (!editor) return;

    // Update state initially
    setCurrentFont(editor.getAttributes("textStyle").fontFamily || "default");

    // Add event listeners for selection changes
    const updateFont = () => {
      setCurrentFont(editor.getAttributes("textStyle").fontFamily || "default");
    };

    editor.on("selectionUpdate", updateFont);
    editor.on("update", updateFont);

    return () => {
      // Clean up event listeners
      editor.off("selectionUpdate", updateFont);
      editor.off("update", updateFont);
    };
  }, [editor]);

  if (!editor) return null;

  const handleFontChange = (value: string) => {
    editor
      .chain()
      .focus()
      .setFontFamily(value === "default" ? "" : value)
      .run();
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <Select value={currentFont} onValueChange={handleFontChange}>
            <SelectTrigger className="w-[150px] h-8 border-none shadow-none focus:ring-0 focus:ring-offset-0 pr-0">
              <div className="flex items-center gap-1">
                <TextT size={14} />
                <SelectValue placeholder="Font family" />
              </div>
            </SelectTrigger>
            <SelectContent className="p-1 rounded-xl shadow-lg">
              <SelectItem value="default" className="py-2">
                Geist Sans
              </SelectItem>
              {fonts.map((font) => (
                <SelectItem
                  key={font.value}
                  value={font.value}
                  style={{ fontFamily: font.value }}
                  className="py-2 text-xs"
                >
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TooltipTrigger>
      <TooltipContent className="px-2 py-1 text-xs">Font family</TooltipContent>
    </Tooltip>
  );
}
