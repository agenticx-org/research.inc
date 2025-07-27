"use client";

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
import { TextStyleKit } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Youtube from "@tiptap/extension-youtube";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import GlobalDragHandle from "tiptap-extension-global-drag-handle";
import tunnel from "tunnel-rat";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorCommandTunnelContext,
} from "./components/EditorCommand";
import { WordCountDisplay } from "./components/WordCountDisplay";
import { EditorContent } from "./EditorContent";
import { EditorToolbar } from "./EditorToolbar";
import { handleCommandNavigation } from "./extensions/SlashCommand";
import { EditorBubbleMenu } from "./tools";
import { slashCommand, suggestionItems } from "./tools/SlashCommand";

// Create a tunnel for the slash command
const commandTunnel = tunnel();

const Editor = () => {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyleKit,
      FontFamily,
      FontSize,
      Underline,
      TextStyleKit.configure(),
      Color.configure(),
      CharacterCount,
      slashCommand,
      GlobalDragHandle,
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
    onUpdate: ({ editor }) => {
      setWordCount(editor.storage.characterCount.words() || 0);
      setCharCount(editor.storage.characterCount.characters() || 0);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose sm:max-w-none max-w-none w-full focus:outline-none",
      },
      handleDOMEvents: {
        keydown: (_view, event) => handleCommandNavigation(event),
      },
    },
  });

  return (
    <EditorCommandTunnelContext.Provider value={commandTunnel}>
      <div className="relative h-full flex flex-col">
        <EditorToolbar editor={editor} />
        <div className="flex-grow relative">
          {editor && <EditorBubbleMenu editor={editor} />}
          <EditorContent editor={editor} />

          {/* Slash Command UI */}
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto scrollbar-custom rounded-md border bg-background px-1 py-2 shadow-md transition-all text-sm">
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

        {/* Replace the word count display with the new component */}
        <WordCountDisplay wordCount={wordCount} charCount={charCount} />
      </div>
    </EditorCommandTunnelContext.Provider>
  );
};

export default Editor;
