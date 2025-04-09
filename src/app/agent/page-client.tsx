"use client";

import LetterGlitch from "@/components/animation/Glitch";
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
import { Checks, SignOut, User } from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AgentViewProps {
  agentId: string;
}

export default function AgentView({ agentId }: AgentViewProps) {
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);
  const router = useRouter();

  // Log the document ID for debugging
  useEffect(() => {
    console.log("Agent ID:", agentId);
  }, [agentId]);

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
              defaultSize={isRightPanelVisible ? 60 : 100}
              minSize={60}
            >
              <div className="w-full transition-all duration-200 h-[calc(100vh-48px)] mt-[48px] overflow-y-scroll no-scrollbar relative editor-container">
                <div className="p-4"></div>
              </div>
            </ResizablePanel>
            {isRightPanelVisible && (
              <>
                <ResizableHandle />
                <ResizablePanel
                  defaultSize={40}
                  minSize={40}
                  className="hidden md:block"
                >
                  <div className="flex-grow flex-shrink-0 h-[51px] w-full bg-white z-[2]"></div>
                  <div className="flex flex-col h-[calc(100vh-51px)]">
                    <div className="border-b border-b-default-200 flex items-center justify-between bg-white gap-x-3 px-3 h-[46px] font-medium">
                      <div>Argos Computer</div>
                    </div>
                    <div className="mt-2 mx-2">
                      <div className="flex items-center gap-2 p-3 bg-zinc-50 border rounded-lg">
                        <div className="min-w-2 h-2 w-2 rounded-full bg-zinc-300 animate-pulse" />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          Argos isn&apos;t currently executing any command...
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 w-full rounded-md my-2">
                      <div className="h-full border rounded-lg mx-2 p-3">
                        <LetterGlitch
                          glitchSpeed={90}
                          glitchColors={[
                            "#000000",
                            "#333333",
                            "#666666",
                            "#999999",
                          ]}
                          centerVignette={false}
                          outerVignette={false}
                          smooth={true}
                        />
                      </div>
                    </div>
                    <div className="mx-2 mb-2">
                      <div className="flex items-center gap-2 p-3 bg-white border rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Checks
                            className="text-zinc-400"
                            size={18}
                            weight="bold"
                          />
                          <span>No Tasks Currently Assigned</span>
                        </div>
                      </div>
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
