"use client";

import Editor from "@/components/Editor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useEffect, useState } from "react";

export default function Home() {
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "l" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsRightPanelVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen min-w-screen">
      <div className="h-screen w-screen overflow-y-hidden">
        <div className="relative z-60">
          <div className="min-h-12 max-h-12 bg-background border-b border-b-default-200 fixed top-0 z-50 flex items-center w-full bg-white dark:bg-black">
            <div className="flex items-center justify-between px-3 w-full">
              Research.inc
            </div>
          </div>
        </div>
        <div className="flex w-full h-full">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel
              defaultSize={isRightPanelVisible ? 70 : 100}
              minSize={30}
            >
              <div className="w-full transition-all duration-200 h-[calc(100vh-48px)] mt-[48px] overflow-y-scroll no-scrollbar relative editor-container">
                <Editor />
              </div>
            </ResizablePanel>
            {isRightPanelVisible && (
              <>
                <ResizableHandle />
                <ResizablePanel defaultSize={30} minSize={30}>
                  <div className="flex-grow flex-shrink-0 h-[51px] w-full bg-white z-[2]"></div>
                  <div className="flex-grow flex-shrink relative w-full h-[calc(100vh-51px)]">
                    <div className="border-b border-b-default-200 flex items-center justify-between bg-white gap-x-3 px-3 h-[46px] relative">
                      Composer
                    </div>
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
}
