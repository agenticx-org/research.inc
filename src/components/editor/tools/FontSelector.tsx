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

// Define available fonts
const FONTS = [
  { label: "Lausanne", value: "Lausanne" },
  { label: "Arial", value: "Arial" },
  { label: "Helvetica", value: "Helvetica" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Courier New", value: "Courier New" },
  { label: "Georgia", value: "Georgia" },
  { label: "Verdana", value: "Verdana" },
];

interface FontSelectorProps {
  editor: Editor | null;
}

export function FontSelector({ editor }: FontSelectorProps) {
  if (!editor) return null;

  const getCurrentFont = () => {
    return editor.getAttributes("textStyle").fontFamily || "default";
  };

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
          <Select value={getCurrentFont()} onValueChange={handleFontChange}>
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
              {FONTS.map((font) => (
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
