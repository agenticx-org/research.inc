import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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
import { BubbleMenu } from "@tiptap/react/menus";
import { useEffect } from "react";

interface EditorBubbleMenuProps {
  editor: Editor;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  // Add keyboard shortcut for Command+K for Edit functionality
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Add Command+K shortcut for Edit functionality
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleEdit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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

  // Add handleEdit function
  const handleEdit = () => {
    const { from, to } = editor.state.selection;

    // Get the selected text with proper handling of paragraph boundaries
    let selectedText = "";

    // Get the resolved positions to check if we're crossing paragraph boundaries
    const $from = editor.state.doc.resolve(from);
    const $to = editor.state.doc.resolve(to);

    // Check if the selection spans multiple blocks
    const sameBlock =
      $from.sameParent($to) && $from.parent.type.name === $to.parent.type.name;

    // If we're in the same block, get the text directly
    if (sameBlock) {
      selectedText = editor.state.doc.textBetween(from, to, " ");
    } else {
      // For multi-block selections, use the fragment approach
      const fragment = editor.state.doc.slice(from, to).content;

      // Iterate through the fragment to properly handle paragraphs
      fragment.forEach((node) => {
        if (selectedText && node.type.name === "paragraph") {
          selectedText += "\n\n"; // Add paragraph breaks
        }
        selectedText += node.textContent;
      });
    }

    // If no content, fall back to simple text extraction
    if (!selectedText) {
      selectedText = editor.state.doc.textBetween(from, to, " ");
    }

    if (selectedText && selectedText.trim()) {
      // Dispatch a custom event for edit functionality
      const event = new CustomEvent("editSelectedText", {
        detail: { text: selectedText },
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <BubbleMenu
      editor={editor}
      options={{
        strategy: "absolute",
        placement: "top",
      }}
      className="flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md"
    >
      <TooltipProvider delayDuration={0}>
        <div className="flex items-center gap-1 p-1">
          {/* Formatting options */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn([
                  "p-1 rounded transition-colors duration-200",
                  editor.isActive("bold")
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700",
                ])}
              >
                <TextBolder size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="px-2 py-1 text-xs mb-1">
              Bold (⌘B)
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn([
                  "p-1 rounded transition-colors duration-200",
                  editor.isActive("italic")
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700",
                ])}
              >
                <TextItalic size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="px-2 py-1 text-xs mb-1">
              Italic (⌘I)
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={cn([
                  "p-1 rounded transition-colors duration-200",
                  editor.isActive("underline")
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700",
                ])}
              >
                <TextUnderline size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="px-2 py-1 text-xs mb-1">
              Underline (⌘U)
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn([
                  "p-1 rounded transition-colors duration-200",
                  editor.isActive("strike")
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700",
                ])}
              >
                <TextStrikethrough size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="px-2 py-1 text-xs mb-1">
              Strike (⌘S)
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={cn([
                  "p-1 rounded transition-colors duration-200",
                  editor.isActive("code")
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700",
                ])}
              >
                <CodeIcon size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="px-2 py-1 text-xs mb-1">
              Code (⌘E)
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={setLink}
                className={cn([
                  "p-1 rounded transition-colors duration-200",
                  editor.isActive("link")
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700",
                ])}
              >
                <LinkIcon size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="px-2 py-1 text-xs mb-1">
              Link (⌘L)
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </BubbleMenu>
  );
}
