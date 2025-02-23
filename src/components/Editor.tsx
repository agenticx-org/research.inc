import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Link as LinkIcon,
  ListBullets,
  ListNumbers,
  TextAa,
  TextAlignCenter,
  TextAlignJustify,
  TextAlignLeft,
  TextAlignRight,
  TextBolder,
  TextH,
  TextHThree,
  TextHTwo,
  TextItalic,
  TextStrikethrough,
  TextT,
  TextUnderline,
} from "@phosphor-icons/react";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
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

// Add these colors near your other constants
const HIGHLIGHT_COLORS = [
  { label: "Yellow", value: "#ffeb3b" },
  { label: "Green", value: "#a5d6a7" },
  { label: "Blue", value: "#90caf9" },
  { label: "Pink", value: "#f48fb1" },
  { label: "Purple", value: "#ce93d8" },
];

// Add this near your other constants
const TEXT_COLORS = [
  { label: "Default", value: "#000000" },
  { label: "Purple", value: "#9333EA" },
  { label: "Red", value: "#E11D48" },
  { label: "Blue", value: "#2563EB" },
  { label: "Green", value: "#16A34A" },
];

const Editor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      Underline,
      TextStyle.configure(),
      Color.configure(),
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
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose mx-auto focus:outline-none",
      },
    },
  });

  const setLink = () => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="w-full sticky top-0 z-50 bg-white">
        <div className="z-50 w-full border-b border-default-200 transition-all duration-200 overflow-x-scroll max-w-full no-scrollbar">
          <div className="mx-auto w-fit">
            <div className="h-[48px] py-2 px-2 bg-white dark:bg-black">
              <div className="flex items-center h-full py-1.5 gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
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
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-xs">
                    Text style
                  </TooltipContent>
                </Tooltip>
                <Separator orientation="vertical" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Select
                        value={
                          editor?.getAttributes("textStyle").fontFamily ||
                          "default"
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
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-xs">
                    Font family
                  </TooltipContent>
                </Tooltip>
                <Separator orientation="vertical" />
                <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-xs">
                    Bold (⌘B)
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() =>
                        editor?.chain().focus().toggleItalic().run()
                      }
                      className={cn([
                        "p-1 rounded transition-colors duration-200",
                        editor?.isActive("italic")
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
                      onClick={() =>
                        editor?.chain().focus().toggleStrike().run()
                      }
                      className={cn([
                        "p-1 rounded transition-colors duration-200",
                        editor?.isActive("strike")
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
                      onClick={() =>
                        editor?.chain().focus().toggleUnderline().run()
                      }
                      className={cn([
                        "p-1 rounded transition-colors duration-200",
                        editor?.isActive("underline")
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
                      onClick={setLink}
                      className={cn([
                        "p-1 rounded transition-colors duration-200",
                        editor?.isActive("link")
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
                <Separator orientation="vertical" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() =>
                        editor?.chain().focus().setTextAlign("left").run()
                      }
                      className={cn([
                        "p-1 rounded transition-colors duration-200",
                        editor?.isActive({ textAlign: "left" })
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700",
                      ])}
                    >
                      <TextAlignLeft size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-xs">
                    Left (⌘L)
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() =>
                        editor?.chain().focus().setTextAlign("center").run()
                      }
                      className={cn([
                        "p-1 rounded transition-colors duration-200",
                        editor?.isActive({ textAlign: "center" })
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700",
                      ])}
                    >
                      <TextAlignCenter size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-xs">
                    Center (⌘E)
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() =>
                        editor?.chain().focus().setTextAlign("right").run()
                      }
                      className={cn([
                        "p-1 rounded transition-colors duration-200",
                        editor?.isActive({ textAlign: "right" })
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700",
                      ])}
                    >
                      <TextAlignRight size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-xs">
                    Right (⌘R)
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() =>
                        editor?.chain().focus().setTextAlign("justify").run()
                      }
                      className={cn([
                        "p-1 rounded transition-colors duration-200",
                        editor?.isActive({ textAlign: "justify" })
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700",
                      ])}
                    >
                      <TextAlignJustify size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-xs">
                    Justify (⌘J)
                  </TooltipContent>
                </Tooltip>
                <Separator orientation="vertical" />
                <div className="flex items-center gap-0.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Select
                          value={
                            editor?.getAttributes("textStyle").color ||
                            "default"
                          }
                          onValueChange={(value) => {
                            if (value === "default") {
                              editor?.chain().focus().unsetColor().run();
                            } else {
                              editor?.chain().focus().setColor(value).run();
                            }
                          }}
                        >
                          <SelectTrigger className="w-8 h-8 border-none shadow-none focus:ring-0 focus:ring-offset-0 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded">
                            <div
                              className="w-full h-full rounded-full border border-gray-200 flex-shrink-0"
                              style={{
                                backgroundColor:
                                  editor?.getAttributes("textStyle").color ||
                                  "currentColor",
                              }}
                            />
                          </SelectTrigger>
                          <SelectContent className="p-1 rounded-xl shadow-lg">
                            <SelectItem value="default" className="py-2">
                              Default color
                            </SelectItem>
                            {TEXT_COLORS.map((color) => (
                              <SelectItem
                                key={color.value}
                                value={color.value}
                                className="py-2"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: color.value }}
                                  />
                                  {color.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="px-2 py-1 text-xs">
                      Text color
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Select
                          value={
                            editor?.getAttributes("highlight").color || "none"
                          }
                          onValueChange={(value) => {
                            if (value === "none") {
                              editor?.chain().focus().unsetHighlight().run();
                            } else {
                              editor
                                ?.chain()
                                .focus()
                                .setHighlight({ color: value })
                                .run();
                            }
                          }}
                        >
                          <SelectTrigger className="w-8 h-8 border-none shadow-none focus:ring-0 focus:ring-offset-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                            <div
                              className="p-1 rounded"
                              style={{
                                backgroundColor:
                                  editor?.getAttributes("highlight").color ||
                                  "white",
                              }}
                            >
                              <TextAa size={16} />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="p-1 rounded-xl shadow-lg">
                            <SelectItem value="none" className="py-2">
                              No highlight
                            </SelectItem>
                            {HIGHLIGHT_COLORS.map((color) => (
                              <SelectItem
                                key={color.value}
                                value={color.value}
                                className="py-2"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: color.value }}
                                  />
                                  {color.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="px-2 py-1 text-xs">
                      Highlight color
                    </TooltipContent>
                  </Tooltip>
                </div>
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
    </TooltipProvider>
  );
};

export default Editor;
