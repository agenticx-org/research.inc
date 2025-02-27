"use client";

import { useChatStore } from "@/store/chat-store";
import { useEditorStore } from "@/store/editor-store";
import CharacterCount from "@tiptap/extension-character-count";
import Code from "@tiptap/extension-code";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import FontSize from "@tiptap/extension-font-size";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Youtube from "@tiptap/extension-youtube";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import tunnel from "tunnel-rat";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorCommandTunnelContext,
} from "./components/EditorCommand";
import { EditorContent } from "./EditorContent";
import { EditorToolbar } from "./EditorToolbar";
import { SelectionHighlight } from "./extensions/SelectionHighlight";
import { handleCommandNavigation } from "./extensions/SlashCommand";
import { EditorBubbleMenu } from "./tools";
import { slashCommand, suggestionItems } from "./tools/SlashCommand";

// Create a tunnel for the slash command
const commandTunnel = tunnel();

const Editor = () => {
  const { selectedTextItems, removeSelectedText } = useChatStore();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      FontSize,
      Underline,
      TextStyle.configure(),
      Color.configure(),
      CharacterCount,
      SelectionHighlight,
      slashCommand,
      Code.configure({
        HTMLAttributes: {
          class: "font-mono bg-gray-100 rounded px-1.5 py-0.5",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 hover:underline cursor-pointer",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "left",
      }),
      Placeholder.configure({
        placeholder:
          "⌘K to autogenerate content anywhere on canvas, or type '/' for blocks...",
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto",
        },
        allowBase64: true,
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: "w-full aspect-video rounded-md overflow-hidden my-4",
        },
        width: 640,
        height: 480,
        controls: true,
        nocookie: true,
        modestBranding: true,
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose sm:max-w-none max-w-none w-full focus:outline-none",
      },
      handleDOMEvents: {
        keydown: (_view, event) => handleCommandNavigation(event),
      },
    },
    onUpdate: ({ editor }) => {
      // Check if any highlighted text has been deleted
      if (selectedTextItems.length > 0) {
        const currentContent = editor.state.doc.textContent;

        // Check each selected text item to see if it still exists in the document
        selectedTextItems.forEach((item) => {
          const itemText = item.text.trim();

          // If the text no longer exists in the document, remove it from the store
          if (!currentContent.includes(itemText)) {
            removeSelectedText(item.id);
          }
        });
      }
    },
  });

  // Sync selected text items with editor highlights
  useEffect(() => {
    if (!editor) return;

    // Clear all highlights first
    editor.commands.clearHighlights();

    // Add highlights for each selected text item
    selectedTextItems.forEach((item) => {
      // If we have stored position information, use it directly
      if (item.from !== undefined && item.to !== undefined) {
        // Verify the positions are still valid in the current document
        const docSize = editor.state.doc.content.size;
        if (item.from >= 0 && item.to <= docSize) {
          // Check if the text at these positions matches our stored text
          const textAtPos = editor.state.doc.textBetween(
            item.from,
            item.to,
            " "
          );
          if (textAtPos.trim() === item.text.trim()) {
            // Positions are valid and text matches, use them directly
            editor.commands.addHighlight(
              { id: item.id, color: item.color },
              item.from,
              item.to
            );
            return;
          }
        }
      }

      // If we don't have position info or it's invalid, fall back to text search
      // Find the text in the document
      const doc = editor.state.doc;
      const itemText = item.text.trim();

      // More precise text search that respects paragraph boundaries
      let found = false;

      // Search for the text in each paragraph separately
      doc.forEach((node, offset) => {
        if (found) return;

        // Only search in paragraph nodes
        if (node.type.name === "paragraph") {
          const nodeText = node.textContent;

          // If this paragraph contains the exact text we're looking for
          if (nodeText.trim() === itemText) {
            // Highlight the entire paragraph
            editor.commands.addHighlight(
              { id: item.id, color: item.color },
              offset,
              offset + node.nodeSize - 1 // -1 to exclude the end token
            );
            found = true;
            return;
          }

          // If this paragraph contains the text as a substring
          const startPos = nodeText.indexOf(itemText);
          if (startPos !== -1) {
            // Make sure it's a complete word or phrase
            const from = offset + startPos;
            const to = from + itemText.length;

            editor.commands.addHighlight(
              { id: item.id, color: item.color },
              from,
              to
            );
            found = true;
            return;
          }
        }
      });

      // Fallback to the old method if not found by node search
      if (!found) {
        const content = doc.textContent;
        const foundIndex = content.indexOf(itemText);

        if (foundIndex !== -1) {
          editor.commands.addHighlight(
            { id: item.id, color: item.color },
            foundIndex,
            foundIndex + itemText.length
          );
        }
      }
    });
  }, [editor, selectedTextItems]);

  // Add event listener for removeHighlight custom event
  useEffect(() => {
    if (!editor) return;

    const handleRemoveHighlight = (event: CustomEvent) => {
      const { highlightId } = event.detail;
      if (highlightId) {
        // Remove the item from the store
        removeSelectedText(highlightId);
      }
    };

    // Add event listener to the editor DOM element
    const editorElement = editor.view.dom;
    editorElement.addEventListener(
      "removeHighlight",
      handleRemoveHighlight as EventListener
    );

    // Clean up the event listener when the component unmounts
    return () => {
      editorElement.removeEventListener(
        "removeHighlight",
        handleRemoveHighlight as EventListener
      );
    };
  }, [editor, removeSelectedText]);

  // Get word and character count
  const wordCount = editor?.storage.characterCount?.words() || 0;
  const charCount = editor?.storage.characterCount?.characters() || 0;

  return (
    <EditorCommandTunnelContext.Provider value={commandTunnel}>
      <div className="relative h-full flex flex-col">
        <EditorToolbar editor={editor} />
        <div className="flex-grow relative">
          {editor && <EditorBubbleMenu editor={editor} />}
          <EditorContent editor={editor} />

          {/* Slash Command UI */}
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto scrollbar-custom rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all text-sm">
            <EditorCommandEmpty className="px-2 text-muted-foreground text-xs">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  key={item.title}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-xs hover:bg-accent aria-selected:bg-accent"
                  onSelect={() => {
                    const range = useEditorStore.getState().range;
                    if (range && editor) {
                      item.command({ editor, range });
                    }
                  }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium text-xs">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>
        </div>

        {/* Word and character count display - sticky at bottom with inverted colors */}
        <div className="sticky bottom-2 left-0 right-0 flex justify-center z-10">
          <div className="text-xs text-white bg-black opacity-80 px-2 py-1 rounded-md shadow-sm">
            {wordCount} words | {charCount} characters
          </div>
        </div>
      </div>
    </EditorCommandTunnelContext.Provider>
  );
};

export default Editor;
