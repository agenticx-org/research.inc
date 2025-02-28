import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Code as CodeIcon,
  Link as LinkIcon,
  TextBolder,
  TextItalic,
  TextStrikethrough,
  TextUnderline,
} from "@phosphor-icons/react";
import { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";

interface TextFormatButtonsProps {
  editor: Editor | null;
}

export function TextFormatButtons({ editor }: TextFormatButtonsProps) {
  // Add state for each formatting option
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);

  // Update states when selection changes
  useEffect(() => {
    if (!editor) return;

    // Update states initially
    setIsBold(editor.isActive("bold"));
    setIsItalic(editor.isActive("italic"));
    setIsStrike(editor.isActive("strike"));
    setIsUnderline(editor.isActive("underline"));
    setIsCode(editor.isActive("code"));
    setIsLink(editor.isActive("link"));

    // Add event listeners for selection changes
    const updateStates = () => {
      setIsBold(editor.isActive("bold"));
      setIsItalic(editor.isActive("italic"));
      setIsStrike(editor.isActive("strike"));
      setIsUnderline(editor.isActive("underline"));
      setIsCode(editor.isActive("code"));
      setIsLink(editor.isActive("link"));
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

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn([
              "p-1 rounded transition-colors duration-200",
              isBold
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "hover:bg-gray-100 dark:hover:bg-gray-700",
            ])}
          >
            <TextBolder size={16} />
          </button>
        </TooltipTrigger>
        <TooltipContent className="px-2 py-1 text-xs">Bold (⌘B)</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn([
              "p-1 rounded transition-colors duration-200",
              isItalic
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "hover:bg-gray-100 dark:hover:bg-gray-700",
            ])}
          >
            <TextItalic size={16} />
          </button>
        </TooltipTrigger>
        <TooltipContent className="px-2 py-1 text-xs">
          Italic (⌘I)
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn([
              "p-1 rounded transition-colors duration-200",
              isStrike
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "hover:bg-gray-100 dark:hover:bg-gray-700",
            ])}
          >
            <TextStrikethrough size={16} />
          </button>
        </TooltipTrigger>
        <TooltipContent className="px-2 py-1 text-xs">
          Strike (⌘S)
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn([
              "p-1 rounded transition-colors duration-200",
              isUnderline
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "hover:bg-gray-100 dark:hover:bg-gray-700",
            ])}
          >
            <TextUnderline size={16} />
          </button>
        </TooltipTrigger>
        <TooltipContent className="px-2 py-1 text-xs">
          Underline (⌘U)
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn([
              "p-1 rounded transition-colors duration-200",
              isCode
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "hover:bg-gray-100 dark:hover:bg-gray-700",
            ])}
          >
            <CodeIcon size={16} />
          </button>
        </TooltipTrigger>
        <TooltipContent className="px-2 py-1 text-xs">Code (⌘E)</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={setLink}
            className={cn([
              "p-1 rounded transition-colors duration-200",
              isLink
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "hover:bg-gray-100 dark:hover:bg-gray-700",
            ])}
          >
            <LinkIcon size={16} />
          </button>
        </TooltipTrigger>
        <TooltipContent className="px-2 py-1 text-xs">Link (⌘L)</TooltipContent>
      </Tooltip>
    </>
  );
}
