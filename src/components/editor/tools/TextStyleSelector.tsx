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
import {
  ListBullets,
  ListNumbers,
  TextAa,
  TextH,
  TextHThree,
  TextHTwo,
} from "@phosphor-icons/react";
import { Editor } from "@tiptap/react";

// Text style options
const TEXT_STYLES = [
  { label: "Paragraph", value: "paragraph", icon: TextAa },
  { label: "Heading 1", value: "heading-1", icon: TextH },
  { label: "Heading 2", value: "heading-2", icon: TextHTwo },
  { label: "Heading 3", value: "heading-3", icon: TextHThree },
  { label: "Bullet List", value: "bullet-list", icon: ListBullets },
  { label: "Numbered List", value: "numbered-list", icon: ListNumbers },
];

interface TextStyleSelectorProps {
  editor: Editor | null;
}

export function TextStyleSelector({ editor }: TextStyleSelectorProps) {
  if (!editor) return null;

  const getCurrentTextStyle = () => {
    if (editor.isActive("paragraph")) return "paragraph";
    if (editor.isActive("heading", { level: 1 })) return "heading-1";
    if (editor.isActive("heading", { level: 2 })) return "heading-2";
    if (editor.isActive("heading", { level: 3 })) return "heading-3";
    if (editor.isActive("bulletList")) return "bullet-list";
    if (editor.isActive("orderedList")) return "numbered-list";
    return "paragraph";
  };

  const handleStyleChange = (value: string) => {
    switch (value) {
      case "paragraph":
        editor.chain().focus().setParagraph().run();
        break;
      case "heading-1":
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case "heading-2":
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case "heading-3":
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case "bullet-list":
        editor.chain().focus().toggleBulletList().run();
        break;
      case "numbered-list":
        editor.chain().focus().toggleOrderedList().run();
        break;
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <Select
            value={getCurrentTextStyle()}
            onValueChange={handleStyleChange}
          >
            <SelectTrigger className="w-[150px] h-8 border-none shadow-none focus:ring-0 focus:ring-offset-0 pr-0">
              <SelectValue placeholder="Paragraph" />
            </SelectTrigger>
            <SelectContent className="p-1 rounded-xl shadow-lg">
              {TEXT_STYLES.map((style) => (
                <SelectItem
                  key={style.value}
                  value={style.value}
                  className="py-2"
                >
                  <div className="flex items-center gap-2">
                    <style.icon size={16} />
                    {style.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TooltipTrigger>
      <TooltipContent className="px-2 py-1 text-xs">Text style</TooltipContent>
    </Tooltip>
  );
}
