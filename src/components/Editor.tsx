import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ListBullets,
  ListNumbers,
  TextAa,
  TextBolder,
  TextH,
  TextHThree,
  TextHTwo,
  TextItalic,
  TextStrikethrough,
  TextT,
} from "@phosphor-icons/react";
import FontFamily from "@tiptap/extension-font-family";
import Placeholder from "@tiptap/extension-placeholder";
import TextStyle from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Separator } from "./ui/separator";

// Define available fonts
const FONTS = [
  { label: "Lausanne", value: "Lausanne" },
  { label: "Arial", value: "Arial" },
  { label: "Helvetica", value: "Helvetica" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Courier New", value: "Courier New" },
  { label: "Georgia", value: "Georgia" },
  { label: "Verdana", value: "Verdana" },
];

// Add this near the FONTS array
const TEXT_STYLES = [
  { label: "Paragraph", value: "paragraph", icon: TextAa },
  { label: "Heading 1", value: "heading-1", icon: TextH },
  { label: "Heading 2", value: "heading-2", icon: TextHTwo },
  { label: "Heading 3", value: "heading-3", icon: TextHThree },
  { label: "Bullet List", value: "bullet-list", icon: ListBullets },
  { label: "Numbered List", value: "numbered-list", icon: ListNumbers },
];

const Editor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      Placeholder.configure({
        placeholder:
          "⌘K to autogenerate content anywhere on canvas, or type '/' for blocks...",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose mx-auto focus:outline-none",
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
                <Select
                  value={
                    editor?.isActive("paragraph")
                      ? "paragraph"
                      : editor?.isActive("heading", { level: 1 })
                      ? "heading-1"
                      : editor?.isActive("heading", { level: 2 })
                      ? "heading-2"
                      : editor?.isActive("heading", { level: 3 })
                      ? "heading-3"
                      : editor?.isActive("bulletList")
                      ? "bullet-list"
                      : editor?.isActive("orderedList")
                      ? "numbered-list"
                      : "paragraph"
                  }
                  onValueChange={(value) => {
                    switch (value) {
                      case "paragraph":
                        editor?.chain().focus().setParagraph().run();
                        break;
                      case "heading-1":
                        editor
                          ?.chain()
                          .focus()
                          .toggleHeading({ level: 1 })
                          .run();
                        break;
                      case "heading-2":
                        editor
                          ?.chain()
                          .focus()
                          .toggleHeading({ level: 2 })
                          .run();
                        break;
                      case "heading-3":
                        editor
                          ?.chain()
                          .focus()
                          .toggleHeading({ level: 3 })
                          .run();
                        break;
                      case "bullet-list":
                        editor?.chain().focus().toggleBulletList().run();
                        break;
                      case "numbered-list":
                        editor?.chain().focus().toggleOrderedList().run();
                        break;
                    }
                  }}
                >
                  <SelectTrigger className="w-[150px] h-8 border-none shadow-none focus:ring-0 focus:ring-offset-0 pr-0">
                    <SelectValue placeholder="Paragraph" />
                  </SelectTrigger>
                  <SelectContent className="p-1 rounded-xl shadow-lg">
                    {TEXT_STYLES.map((style) => (
                      <SelectItem
                        key={style.value}
                        value={style.value}
                        className="py-2"
                      >
                        <div className="flex items-center gap-2">
                          <style.icon size={16} />
                          {style.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Separator orientation="vertical" />
                <Select
                  value={
                    editor?.getAttributes("textStyle").fontFamily || "default"
                  }
                  onValueChange={(value) => {
                    editor
                      ?.chain()
                      .focus()
                      .setFontFamily(value === "default" ? "" : value)
                      .run();
                  }}
                >
                  <SelectTrigger className="w-[150px] h-8 border-none shadow-none focus:ring-0 focus:ring-offset-0 pr-0">
                    <div className="flex items-center gap-1">
                      <TextT size={14} />
                      <SelectValue placeholder="Font family" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="p-1 rounded-xl shadow-lg">
                    <SelectItem value="default" className="py-2">
                      Geist Sans
                    </SelectItem>
                    {FONTS.map((font) => (
                      <SelectItem
                        key={font.value}
                        value={font.value}
                        style={{ fontFamily: font.value }}
                        className="py-2 text-xs"
                      >
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Separator orientation="vertical" />
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
