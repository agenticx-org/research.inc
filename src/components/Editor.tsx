import { cn } from "@/lib/utils";
import {
  TextBolder,
  TextItalic,
  TextStrikethrough,
} from "@phosphor-icons/react";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const Editor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder:
          "⌘K to autogenerate content anywhere on canvas, or type '/' for blocks...",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
  });

  return (
    <>
      <div className="w-full sticky top-0 z-50 bg-white">
        <div className="z-50 w-full border-b border-default-200 transition-all duration-200 overflow-x-scroll max-w-full no-scrollbar">
          <div className="mx-auto w-fit">
            <div className="h-[48px] py-2 px-2 bg-white dark:bg-black">
              <div className="flex items-center h-full py-1.5 gap-2">
                <button
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={cn([
                    "p-1 rounded transition-colors duration-200",
                    editor?.isActive("bold")
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700",
                  ])}
                >
                  <TextBolder size={16} />
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={cn([
                    "p-1 rounded transition-colors duration-200",
                    editor?.isActive("italic")
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700",
                  ])}
                >
                  <TextItalic size={16} />
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleStrike().run()}
                  className={cn([
                    "p-1 rounded transition-colors duration-200",
                    editor?.isActive("strike")
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700",
                  ])}
                >
                  <TextStrikethrough size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="max-w-4xl mx-auto px-6 pt-[70px]"
        onClick={() => editor?.chain().focus().run()}
      >
        <EditorContent editor={editor} className="min-h-[500px]" />
        <div className="h-[70px] w-full"></div>
      </div>
    </>
  );
};

export default Editor;
