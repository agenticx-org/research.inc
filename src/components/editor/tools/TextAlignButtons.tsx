import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  TextAlignCenter,
  TextAlignJustify,
  TextAlignLeft,
  TextAlignRight,
} from "@phosphor-icons/react";
import { Editor } from "@tiptap/react";

interface TextAlignButtonsProps {
  editor: Editor | null;
}

export function TextAlignButtons({ editor }: TextAlignButtonsProps) {
  if (!editor) return null;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={cn([
              "p-1 rounded transition-colors duration-200",
              editor.isActive({ textAlign: "left" })
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "hover:bg-gray-100 dark:hover:bg-gray-700",
            ])}
          >
            <TextAlignLeft size={16} />
          </button>
        </TooltipTrigger>
        <TooltipContent className="px-2 py-1 text-xs">Left</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={cn([
              "p-1 rounded transition-colors duration-200",
              editor.isActive({ textAlign: "center" })
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "hover:bg-gray-100 dark:hover:bg-gray-700",
            ])}
          >
            <TextAlignCenter size={16} />
          </button>
        </TooltipTrigger>
        <TooltipContent className="px-2 py-1 text-xs">Center</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={cn([
              "p-1 rounded transition-colors duration-200",
              editor.isActive({ textAlign: "right" })
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "hover:bg-gray-100 dark:hover:bg-gray-700",
            ])}
          >
            <TextAlignRight size={16} />
          </button>
        </TooltipTrigger>
        <TooltipContent className="px-2 py-1 text-xs">Right</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={cn([
              "p-1 rounded transition-colors duration-200",
              editor.isActive({ textAlign: "justify" })
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "hover:bg-gray-100 dark:hover:bg-gray-700",
            ])}
          >
            <TextAlignJustify size={16} />
          </button>
        </TooltipTrigger>
        <TooltipContent className="px-2 py-1 text-xs">Justify</TooltipContent>
      </Tooltip>
    </>
  );
}
