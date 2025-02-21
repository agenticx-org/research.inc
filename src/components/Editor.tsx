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
            <div className="h-[48px]"></div>
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
