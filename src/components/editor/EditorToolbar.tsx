import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Editor } from "@tiptap/react";
import { ColorSelectors } from "./tools/ColorSelectors";
import { FontSelector } from "./tools/FontSelector";
import { FontSizeSelector } from "./tools/FontSizeSelector";
import { TextAlignButtons } from "./tools/TextAlignButtons";
import { TextFormatButtons } from "./tools/TextFormatButtons";
import { TextStyleSelector } from "./tools/TextStyleSelector";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="w-full sticky top-0 z-50 bg-white">
        <div className="z-50 w-full border-b border-default-200 transition-all duration-200 overflow-x-scroll max-w-full no-scrollbar">
          <div className="mx-auto w-fit">
            <div className="h-[48px] py-2 px-2 bg-white dark:bg-black">
              <div className="flex items-center h-full py-1.5 gap-2">
                <TextStyleSelector editor={editor} />
                <Separator orientation="vertical" />
                <FontSelector editor={editor} />
                <Separator orientation="vertical" />
                <FontSizeSelector editor={editor} />
                <Separator orientation="vertical" />
                <TextFormatButtons editor={editor} />
                <Separator orientation="vertical" />
                <TextAlignButtons editor={editor} />
                <Separator orientation="vertical" />
                <ColorSelectors editor={editor} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
