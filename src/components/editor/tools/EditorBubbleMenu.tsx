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
import { useEffect, useState } from "react";

// Import SELECTION_COLORS from the store
import { SELECTION_COLORS } from "@/store/chat-store";

interface EditorBubbleMenuProps {
  editor: Editor;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const { setMessageAndTogglePanel, addSelectedText, selectedTextItems } =
    useChatStore();
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  // Add state for each formatting option
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);

  // Update formatting states when selection changes
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

  // Add keyboard shortcut for Command+L to add selected text to chat
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "l" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const { from, to } = editor.state.selection;

        // Get the selected text with proper handling of paragraph boundaries
        let selectedText = "";

        // Get the resolved positions to check if we're crossing paragraph boundaries
        const $from = editor.state.doc.resolve(from);
        const $to = editor.state.doc.resolve(to);

        // Check if the selection spans multiple blocks
        const sameBlock =
          $from.sameParent($to) &&
          $from.parent.type.name === $to.parent.type.name;

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
          // Check if this is a duplicate
          const isDuplicate = selectedTextItems.some(
            (item) => item.text === selectedText.trim()
          );

          if (isDuplicate) {
            // Show duplicate warning
            setShowDuplicateWarning(true);
            setTimeout(() => setShowDuplicateWarning(false), 2000);
          } else {
            // Generate a unique ID for this selection
            const id = Date.now().toString();

            // Calculate the color index based on current selections
            const colorIndex =
              selectedTextItems.length % SELECTION_COLORS.length;
            const colorClass = SELECTION_COLORS[colorIndex];

            // If text is selected, add it to chat and open panel
            addSelectedText(selectedText, id, colorClass, from, to);

            // Also toggle the panel
            const event = new CustomEvent("toggleChatPanel", {
              detail: { shouldOpen: true, forceToggle: false },
            });
            window.dispatchEvent(event);
          }
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
  }, [editor, setMessageAndTogglePanel, selectedTextItems, addSelectedText]);

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
      // Check if this is a duplicate
      const isDuplicate = selectedTextItems.some(
        (item) => item.text === selectedText.trim()
      );

      if (isDuplicate) {
        // Show duplicate warning
        setShowDuplicateWarning(true);
        setTimeout(() => setShowDuplicateWarning(false), 2000);
      } else {
        // Generate a unique ID for this selection
        const id = Date.now().toString();

        // Calculate the color index based on current selections
        const colorIndex = selectedTextItems.length % SELECTION_COLORS.length;
        const colorClass = SELECTION_COLORS[colorIndex];

        // Use addSelectedText directly to add a new selection with position information
        addSelectedText(selectedText, id, colorClass, from, to);

        // Also toggle the panel to show it's been added
        const event = new CustomEvent("toggleChatPanel", {
          detail: { shouldOpen: true, forceToggle: false },
        });
        window.dispatchEvent(event);
      }
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
      tippyOptions={{
        duration: 100,
        animation: "shift-away",
      }}
      className="flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md min-w-[365px]"
    >
      <TooltipProvider delayDuration={0}>
        <div className="flex items-center gap-1 p-1">
          {/* Add to Chat button */}
          <div className="relative">
            <button
              onClick={handleAddToChat}
              className="px-2 py-1 rounded text-xs font-medium transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Add to Chat
              <span className="ml-1 text-[10px] text-gray-500 font-normal">
                ⌘L
              </span>
            </button>

            {/* Duplicate warning tooltip */}
            {showDuplicateWarning && (
              <div className="absolute top-full left-0 mt-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded border border-amber-200 whitespace-nowrap z-50">
                This text is already selected
              </div>
            )}
          </div>

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
                  isBold
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
                  isItalic
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
                  isUnderline
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
                  isStrike
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
                  isCode
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
                  isLink
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
