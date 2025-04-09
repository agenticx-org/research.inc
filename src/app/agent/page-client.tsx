"use client";

import LetterGlitch from "@/components/animation/Glitch";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/chat/PromptInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ArrowUpRight,
  Checks,
  Paperclip,
  SignOut,
  Square,
  User,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

// Isolated GlitchContainer component to prevent re-renders from parent state changes
const GlitchContainer = () => {
  // Use useMemo to ensure props are stable
  const glitchProps = useMemo(
    () => ({
      glitchSpeed: 90,
      glitchColors: ["#000000", "#333333", "#666666", "#999999"],
      centerVignette: false,
      outerVignette: false,
      smooth: true,
    }),
    []
  );

  return (
    <div className="h-full border rounded-lg mx-2 p-3 flex-1">
      <LetterGlitch {...glitchProps} />
    </div>
  );
};

// Prevent re-renders with memo
const MemoizedGlitchContainer = memo(GlitchContainer);

interface AgentViewProps {
  agentId: string;
}

type MessageType =
  | "user"
  | "agent"
  | "status"
  | "thought"
  | "plan"
  | "findings"
  | "tool_call"
  | "tool_result"
  | "final_answer"
  | "plan_markdown"
  | "findings_markdown";

interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
}

export default function AgentView({ agentId }: AgentViewProps) {
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientId, setClientId] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const hasSelectedItems = selectedFiles.length > 0;

  const relevantMessages = messages.filter((msg) => {
    if (msg.type === "tool_call") {
      return (
        msg.content.includes("execute_python") ||
        msg.content.includes("update_plan") ||
        msg.content.includes("record_findings")
      );
    }
    return ["plan", "plan_markdown", "findings_markdown"].includes(msg.type);
  });

  // Ensure currentStep is valid when messages change
  useEffect(() => {
    if (relevantMessages.length > 0) {
      // Auto-navigate to the latest step when new messages arrive
      setCurrentStep(relevantMessages.length - 1);
    }
  }, [relevantMessages.length]);

  const onMessageChange = (value: string) => {
    setMessage(value);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    scrollToBottom();
  }, [messages]);

  // Generate clientId only on the client side to avoid hydration mismatch
  useEffect(() => {
    setClientId(uuidv4());
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!clientId) return; // Don't connect if clientId is not yet generated

    const wsUrl = `ws://localhost:8000/ws/${clientId}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);

        // Handle different message types
        if (data.type === "status") {
          addMessage("status", data.content);
        } else if (data.type === "thought") {
          addMessage("thought", data.content);
        } else if (data.type === "plan") {
          addMessage("plan", data.content);
        } else if (data.type === "findings") {
          addMessage("findings", data.content);
        } else if (data.type === "tool_call") {
          addMessage(
            "tool_call",
            `Using tool: ${data.tool} with args: ${JSON.stringify(data.args)}`
          );
        } else if (data.type === "tool_result") {
          addMessage("tool_result", data.content || JSON.stringify(data));
        } else if (data.type === "final_answer") {
          addMessage("final_answer", data.content);
          setIsProcessing(false);
        } else if (data.type === "execution_complete") {
          setIsProcessing(false);
        } else if (data.type === "plan_markdown") {
          addMessage("plan_markdown", data.content);
        } else if (data.type === "findings_markdown") {
          addMessage("findings_markdown", data.content);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [clientId]);

  const addMessage = (type: MessageType, content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: uuidv4(),
        type,
        content,
        timestamp: new Date(),
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!message.trim() && !hasSelectedItems) return;
    if (!isConnected) {
      alert("WebSocket is not connected. Please try again later.");
      return;
    }

    // Add user message to the UI
    addMessage("user", message);
    setIsProcessing(true);

    // Send command to the WebSocket server
    const command = {
      command: "initialize",
      task: message,
    };

    wsRef.current?.send(JSON.stringify(command));

    // Clear the input after submission
    setMessage("");
    setSelectedFiles([]);
  };

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
  const isLoading = isPending || isProcessing;

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

  const getMessageComponent = (message: Message) => {
    switch (message.type) {
      case "user":
        return (
          <div className="flex flex-col space-y-1 mb-4">
            <div className="flex items-start justify-end gap-3">
              <div className="flex-1 overflow-hidden flex justify-end">
                <div className="prose prose-sm dark:prose-invert break-words bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
                  <p>{message.content}</p>
                </div>
              </div>
              <Avatar className="w-8 h-8 mt-2">
                {session?.user?.image ? (
                  <AvatarImage
                    src={session.user.image}
                    alt={session.user.name || "User"}
                  />
                ) : (
                  <AvatarFallback>
                    <User size={16} weight="bold" />
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
          </div>
        );
      case "final_answer":
        return (
          <div className="flex flex-col space-y-1 mb-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8 mt-2">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  AI
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="prose prose-sm dark:prose-invert break-words bg-primary/5 p-3 rounded-lg">
                  <p className="font-medium">{message.content}</p>
                </div>
              </div>
            </div>
          </div>
        );
      case "status":
        return (
          <div className="flex items-center gap-2 py-1 px-3 text-xs text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-pulse"></div>
            <span>{message.content}</span>
          </div>
        );
      case "thought":
        return (
          <div className="flex flex-col space-y-1 mb-2">
            <div className="flex items-start gap-3">
              <div className="flex-1 overflow-hidden">
                <div className="prose prose-sm dark:prose-invert break-words bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                  <div className="text-xs text-muted-foreground mb-1">
                    Thought:
                  </div>
                  <p className="text-sm text-zinc-700">{message.content}</p>
                </div>
              </div>
            </div>
          </div>
        );
      case "plan":
      case "findings":
        return (
          <div className="flex flex-col space-y-1 mb-2">
            <div className="flex items-start gap-3">
              <div className="flex-1 overflow-hidden">
                <div className="prose prose-sm dark:prose-invert break-words bg-blue-50 p-2 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-500 mb-1">
                    {message.type === "plan" ? "Plan:" : "Findings:"}
                  </div>
                  <pre className="text-xs text-zinc-700 whitespace-pre-wrap">
                    {message.content}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        );
      case "tool_call":
      case "tool_result":
        return (
          <div className="flex flex-col space-y-1 mb-2">
            <div className="flex items-start gap-3">
              <div className="flex-1 overflow-hidden">
                <div className="prose prose-sm dark:prose-invert break-words bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <div className="text-xs text-amber-600 mb-1">
                    {message.type === "tool_call"
                      ? "Tool Call:"
                      : "Tool Result:"}
                  </div>
                  <p className="text-sm text-zinc-700">{message.content}</p>
                </div>
              </div>
            </div>
          </div>
        );
      case "plan_markdown":
      case "findings_markdown":
        return (
          <div className="flex flex-col space-y-1 mb-2">
            <div className="flex items-start gap-3">
              <div className="flex-1 overflow-hidden">
                <div className="prose prose-sm dark:prose-invert break-words bg-blue-50 p-2 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-500 mb-1">
                    {message.type === "plan_markdown" ? "Plan:" : "Findings:"}
                  </div>
                  <pre className="text-xs text-zinc-700 whitespace-pre-wrap">
                    {message.content}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 py-1 px-3 text-xs text-muted-foreground">
            <span>{message.content}</span>
          </div>
        );
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
              <div className="w-full transition-all duration-200 h-[calc(100vh-48px)] mt-[48px] overflow-hidden relative editor-container flex flex-col">
                <div className="flex-1 overflow-y-auto no-scrollbar">
                  <div className="flex flex-col py-4 px-3">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)]">
                        <div className="mb-8">
                          <Image
                            src="/research.svg"
                            height={100}
                            width={100}
                            alt="research.inc logo"
                            className="opacity-10 filter grayscale"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full">
                        {messages
                          .filter(
                            (msg) =>
                              !["plan", "plan_markdown", "tool_call"].includes(
                                msg.type
                              ) &&
                              !(
                                msg.type === "tool_result" &&
                                (msg.content.includes("update_plan") ||
                                  msg.content.includes("execute_python") ||
                                  msg.content.includes(
                                    '"tool":"final_answer"'
                                  ) ||
                                  msg.content.includes(
                                    '"tool": "final_answer"'
                                  ) ||
                                  msg.content.includes("tool=final_answer"))
                              ) &&
                              !(
                                msg.type === "status" &&
                                (msg.content.includes(
                                  "Preparing LLM request"
                                ) ||
                                  msg.content.includes("Calling LLM"))
                              )
                          )
                          .map((msg) => (
                            <div key={msg.id}>{getMessageComponent(msg)}</div>
                          ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-2 pt-2">
                  {messages.length === 0 && !isProcessing && (
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Do a competitive analysis between Volkswagen and Toyota vehicles",
                        "Create a professional presentation deck on climate change initiatives",
                        "Analyze the latest quarterly earnings report for Tesla",
                        "Write a content marketing strategy for a fintech startup",
                      ].map((text, index) => (
                        <button
                          key={index}
                          className="flex items-start gap-2 p-3 py-1.5 text-left bg-zinc-50 hover:bg-zinc-100 rounded-lg transition-colors duration-200"
                          onClick={() => setMessage(text)}
                        >
                          <div className="flex items-center pt-0.5">
                            <ArrowUpRight
                              className="size-3.5"
                              weight="regular"
                            />
                          </div>
                          <span className="text-[11px] text-default-700">
                            {text}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="px-2 py-2 bg-background">
                  <PromptInput
                    isLoading={isLoading}
                    value={message}
                    onValueChange={onMessageChange}
                    onSubmit={handleSubmit}
                    className={cn("bg-white")}
                  >
                    <PromptInputTextarea
                      placeholder="Ask me to do anything..."
                      className="px-1"
                    />
                    <PromptInputActions className="flex w-full items-center gap-2 justify-between">
                      <div className="flex items-center gap-1">
                        <PromptInputAction tooltip="Attach files">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                          >
                            <label
                              htmlFor="file-upload"
                              className="cursor-pointer"
                            >
                              <input
                                type="file"
                                multiple
                                onChange={onFileChange}
                                className="hidden"
                                id="file-upload"
                              />
                              <Paperclip
                                className="text-primary size-4"
                                weight="regular"
                              />
                            </label>
                          </Button>
                        </PromptInputAction>
                      </div>
                      <PromptInputAction
                        tooltip={
                          isLoading ? "Stop generation" : "Send message (Enter)"
                        }
                      >
                        <Button
                          size="icon"
                          className="h-7 w-7"
                          onClick={handleSubmit}
                          disabled={isLoading || !message.trim()}
                        >
                          {isLoading ? (
                            <Square
                              className="size-4 fill-current"
                              weight="fill"
                            />
                          ) : (
                            <ArrowRight className="size-4" weight="regular" />
                          )}
                        </Button>
                      </PromptInputAction>
                    </PromptInputActions>
                  </PromptInput>
                </div>
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
                      <div
                        className={`h-2 w-2 rounded-full ${
                          isConnected ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                    </div>
                    <div className="flex-1 relative overflow-y-auto scrollbar-custom overflow-x-hidden flex flex-col">
                      <div className="mt-2 mx-2">
                        <div className="flex items-center gap-2 p-3 bg-zinc-50 border rounded-lg">
                          <div className="min-w-2 h-2 w-2 rounded-full bg-zinc-300 animate-pulse" />
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {isConnected
                              ? isProcessing
                                ? "Argos is processing your task..."
                                : "Argos is ready for your instructions..."
                              : "Connecting to Argos..."}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 w-full rounded-md my-2 flex-grow overflow-hidden">
                        {isProcessing || relevantMessages.length > 0 ? (
                          <>
                            {relevantMessages.length === 0 ? (
                              <div className="h-full flex items-center justify-center">
                                <div className="text-sm text-muted-foreground">
                                  Waiting for execution steps...
                                </div>
                              </div>
                            ) : (
                              <div className="h-full flex flex-col">
                                <div className="p-3 flex-1 overflow-y-auto">
                                  {(() => {
                                    const msg = relevantMessages[currentStep];
                                    return (
                                      <>
                                        <div className="mb-2 flex items-center justify-between">
                                          <div className="text-xs font-medium text-zinc-500">
                                            Step {currentStep + 1} of{" "}
                                            {relevantMessages.length}
                                          </div>
                                          <div className="text-xs font-medium">
                                            {(() => {
                                              if (msg.type === "plan")
                                                return "Plan";
                                              if (msg.type === "plan_markdown")
                                                return "Plan";
                                              if (
                                                msg.type === "findings_markdown"
                                              )
                                                return "Findings";
                                              if (
                                                msg.content.includes(
                                                  "execute_python"
                                                )
                                              )
                                                return "Python Execution";
                                              if (
                                                msg.content.includes(
                                                  "update_plan"
                                                )
                                              )
                                                return "Plan Update";
                                              return "Record Findings";
                                            })()}
                                          </div>
                                        </div>
                                        <div
                                          className={cn(
                                            "p-3 rounded-lg text-sm border mb-3 h-[calc(100%-70px)] overflow-y-auto",
                                            msg.type === "plan" ||
                                              msg.type === "plan_markdown" ||
                                              msg.content?.includes(
                                                "update_plan"
                                              )
                                              ? "bg-blue-50 border-blue-200"
                                              : msg.type ===
                                                  "findings_markdown" ||
                                                msg.content?.includes(
                                                  "record_findings"
                                                )
                                              ? "bg-green-50 border-green-200"
                                              : "bg-amber-50 border-amber-200"
                                          )}
                                        >
                                          <pre className="whitespace-pre-wrap text-xs">
                                            {msg.content}
                                          </pre>
                                        </div>
                                      </>
                                    );
                                  })()}
                                </div>
                                <div className="p-3 border-t flex items-center justify-between">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setCurrentStep((prev) =>
                                        Math.max(0, prev - 1)
                                      )
                                    }
                                    disabled={currentStep === 0}
                                  >
                                    Previous
                                  </Button>
                                  <div className="flex gap-1">
                                    {relevantMessages.map((_, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => setCurrentStep(idx)}
                                        className={cn(
                                          "w-2 h-2 rounded-full",
                                          currentStep === idx
                                            ? "bg-primary"
                                            : "bg-zinc-300"
                                        )}
                                      />
                                    ))}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setCurrentStep((prev) =>
                                        Math.min(
                                          relevantMessages.length - 1,
                                          prev + 1
                                        )
                                      )
                                    }
                                    disabled={
                                      currentStep ===
                                      relevantMessages.length - 1
                                    }
                                  >
                                    Next
                                  </Button>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <MemoizedGlitchContainer />
                        )}
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
                          <span>
                            {clientId
                              ? `Client ID: ${clientId.substring(0, 8)}...`
                              : "Generating client ID..."}
                          </span>
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
