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
import { useEffect, useState } from "react";

interface TextAlignButtonsProps {
  editor: Editor | null;
}

export function TextAlignButtons({ editor }: TextAlignButtonsProps) {
  // Add state for each alignment option
  const [isAlignLeft, setIsAlignLeft] = useState(false);
  const [isAlignCenter, setIsAlignCenter] = useState(false);
  const [isAlignRight, setIsAlignRight] = useState(false);
  const [isAlignJustify, setIsAlignJustify] = useState(false);

  // Update states when selection changes
  useEffect(() => {
    if (!editor) return;

    // Update states initially
    setIsAlignLeft(editor.isActive({ textAlign: "left" }));
    setIsAlignCenter(editor.isActive({ textAlign: "center" }));
    setIsAlignRight(editor.isActive({ textAlign: "right" }));
    setIsAlignJustify(editor.isActive({ textAlign: "justify" }));

    // Add event listeners for selection changes
    const updateStates = () => {
      setIsAlignLeft(editor.isActive({ textAlign: "left" }));
      setIsAlignCenter(editor.isActive({ textAlign: "center" }));
      setIsAlignRight(editor.isActive({ textAlign: "right" }));
      setIsAlignJustify(editor.isActive({ textAlign: "justify" }));
    };

    editor.on("selectionUpdate", updateStates);
    editor.on("update", updateStates);

    return () => {
      // Clean up event listeners
      editor.off("selectionUpdate", updateStates);
      editor.off("update", updateStates);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={cn([
              "p-1 rounded transition-colors duration-200",
              isAlignLeft
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
              isAlignCenter
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
              isAlignRight
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
              isAlignJustify
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
