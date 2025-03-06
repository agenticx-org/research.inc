"use client";

import Chat from "@/components/chat/Chat";
import Editor from "@/components/editor/Editor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { SignOut, User } from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DashboardViewProps {
  documentId: string;
}

export default function DashboardView({ documentId }: DashboardViewProps) {
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);
  const router = useRouter();

  // Log the document ID for debugging
  useEffect(() => {
    console.log("Document ID:", documentId);
  }, [documentId]);

  useEffect(() => {
    const handleToggleChatPanel = (
      e: CustomEvent<{ shouldOpen: boolean; forceToggle?: boolean }>
    ) => {
      if (e.detail.shouldOpen) {
        // If shouldOpen is true, always open the panel
        setIsRightPanelVisible(true);
      } else if (e.detail.forceToggle) {
        // If forceToggle is true, always toggle the panel
        setIsRightPanelVisible((prev) => !prev);
      }
    };

    window.addEventListener(
      "toggleChatPanel",
      handleToggleChatPanel as EventListener
    );
    return () =>
      window.removeEventListener(
        "toggleChatPanel",
        handleToggleChatPanel as EventListener
      );
  }, []);

  const { data: session, isPending } = authClient.useSession();
  const isLoading = isPending;

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess() {
            router.push("/login");
          },
        },
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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
              {isLoading ? (
                <Skeleton className="w-8 h-8 rounded-full" />
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="w-8 h-8 cursor-pointer select-none">
                      {session?.user?.image ? (
                        <AvatarImage
                          src={session.user.image}
                          alt={session.user.name || "User profile"}
                        />
                      ) : null}
                      <AvatarFallback className="bg-white border">
                        <User size={14} weight="bold" aria-hidden="true" />
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 rounded-lg border shadow-md"
                  >
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium">
                        {session?.user?.name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session?.user?.email || ""}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="focus:bg-accent cursor-pointer py-2"
                    >
                      <div className="flex items-center px-2">
                        <SignOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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
                <ResizablePanel
                  defaultSize={30}
                  minSize={30}
                  className="hidden md:block"
                >
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
