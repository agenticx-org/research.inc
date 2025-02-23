"use client";

import Chat from "@/components/Chat";
import Editor from "@/components/Editor";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { User } from "@phosphor-icons/react";
import Image from "next/image";
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
              <div className="flex items-center gap-1.5 font-medium">
                <Image
                  src={"/research.svg"}
                  height={25}
                  width={25}
                  alt="research.inc logo"
                />
                Research.inc
              </div>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-white border">
                  <User size={14} weight="bold" aria-hidden="true" />
                </AvatarFallback>
              </Avatar>
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
                  <Chat />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
}
