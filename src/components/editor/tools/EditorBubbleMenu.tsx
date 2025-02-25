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
import { BubbleMenu, Editor } from "@tiptap/react";

interface EditorBubbleMenuProps {
  editor: Editor;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
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
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        animation: "shift-away",
      }}
      className="flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md"
    >
      <TooltipProvider delayDuration={0}>
        <div className="flex items-center gap-1 p-1">
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
            <TooltipContent className="px-2 py-1 text-xs">
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
            <TooltipContent className="px-2 py-1 text-xs">
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
            <TooltipContent className="px-2 py-1 text-xs">
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
            <TooltipContent className="px-2 py-1 text-xs">
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
            <TooltipContent className="px-2 py-1 text-xs">
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
            <TooltipContent className="px-2 py-1 text-xs">
              Link (⌘L)
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </BubbleMenu>
  );
}
