import { Editor, EditorContent as TiptapEditorContent } from "@tiptap/react";

interface EditorContentProps {
  editor: Editor | null;
}

export function EditorContent({ editor }: EditorContentProps) {
  if (!editor) return null;

  return (
    <div
      className="max-w-[calc(56rem+16px)] mx-auto px-6 pt-[32px]"
      onClick={() => editor.chain().focus().run()}
    >
      <TiptapEditorContent editor={editor} className="min-h-[500px]" />
      <div className="h-[70px] w-full"></div>
    </div>
  );
}
