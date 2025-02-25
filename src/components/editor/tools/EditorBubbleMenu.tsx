import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";
import {
  Code as CodeIcon,
  Link as LinkIcon,
  TextBolder,
  TextItalic,
  TextStrikethrough,
  TextUnderline,
} from "@phosphor-icons/react";
import { BubbleMenu, Editor } from "@tiptap/react";
import { useEffect } from "react";

interface EditorBubbleMenuProps {
  editor: Editor;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const { setMessageAndTogglePanel, addSelectedText } = useChatStore();

  // Add keyboard shortcut for Command+L to add selected text to chat
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "l" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, " ");

        if (selectedText && selectedText.trim()) {
          // If text is selected, add it to chat and open panel
          setMessageAndTogglePanel(selectedText, true);
        } else {
          // If no text is selected, just toggle the panel with empty message
          const event = new CustomEvent("toggleChatPanel", {
            detail: { shouldOpen: false, forceToggle: true },
          });
          window.dispatchEvent(event);
        }
      }

      // Add Command+K shortcut for Edit functionality
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleEdit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor, setMessageAndTogglePanel]);

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

  const handleAddToChat = () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");
    if (selectedText && selectedText.trim()) {
      // Use addSelectedText directly to add a new selection
      addSelectedText(selectedText);

      // Also toggle the panel to show it's been added
      const event = new CustomEvent("toggleChatPanel", {
        detail: { shouldOpen: true, forceToggle: false },
      });
      window.dispatchEvent(event);
    } else {
      // If no text is selected, just toggle the panel
      const event = new CustomEvent("toggleChatPanel", {
        detail: { shouldOpen: false, forceToggle: true },
      });
      window.dispatchEvent(event);
    }
  };

  // Add handleEdit function
  const handleEdit = () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");

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
      tippyOptions={{
        duration: 100,
        animation: "shift-away",
      }}
      className="flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md min-w-[365px]"
    >
      <TooltipProvider delayDuration={0}>
        <div className="flex items-center gap-1 p-1">
          {/* Add to Chat button */}
          <button
            onClick={handleAddToChat}
            className="px-2 py-1 rounded text-xs font-medium transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Add to Chat
            <span className="ml-1 text-[10px] text-gray-500 font-normal">
              ⌘L
            </span>
          </button>

          {/* Edit button - new */}
          <button
            onClick={handleEdit}
            className="px-2 py-1 rounded text-xs font-medium transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Edit
            <span className="ml-1 text-[10px] text-gray-500 font-normal">
              ⌘K
            </span>
          </button>

          {/* Separator - moved after both buttons */}
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

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
