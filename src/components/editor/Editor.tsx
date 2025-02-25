"use client";

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
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent } from "./EditorContent";
import { EditorToolbar } from "./EditorToolbar";
import { EditorBubbleMenu } from "./tools";

const Editor = () => {
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
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose sm:max-w-none max-w-none w-full focus:outline-none",
      },
    },
  });

  // Get word and character count
  const wordCount = editor?.storage.characterCount?.words() || 0;
  const charCount = editor?.storage.characterCount?.characters() || 0;

  return (
    <div className="relative h-full flex flex-col">
      <EditorToolbar editor={editor} />
      <div className="flex-grow relative">
        {editor && <EditorBubbleMenu editor={editor} />}
        <EditorContent editor={editor} />
      </div>

      {/* Word and character count display - sticky at bottom with inverted colors */}
      <div className="sticky bottom-2 left-0 right-0 flex justify-center z-10">
        <div className="text-xs text-white bg-black opacity-80 px-2 py-1 rounded-md shadow-sm">
          {wordCount} words | {charCount} characters
        </div>
      </div>
    </div>
  );
};

export default Editor;
