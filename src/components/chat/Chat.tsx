"use client";

import { useChatStore } from "@/store/chat-store";
import { Plus } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

export function Chat() {
  const {
    message,
    isLoading,
    selectedModel,
    messages,
    isAgent,
    setMessage,
    setSelectedModel,
    handleSubmit,
    handleFileChange,
    setIsAgent,
    clearMessages,
  } = useChatStore();

  return (
    <>
      <div className="flex-grow flex-shrink-0 h-[51px] w-full bg-white z-[2]"></div>
      <div className="flex flex-col h-[calc(100vh-51px)]">
        <div className="border-b border-b-default-200 flex items-center justify-between bg-white gap-x-3 px-3 h-[46px] font-medium">
          <div>Agent</div>
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={clearMessages}>
                  <Plus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-xs">New Chat</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="flex-1 relative overflow-y-auto scrollbar-custom overflow-x-hidden">
          <MessageList messages={messages} isAgent={isAgent} />
        </div>
        <ChatInput
          message={message}
          isLoading={isLoading}
          selectedModel={selectedModel}
          onMessageChange={setMessage}
          onModelChange={setSelectedModel}
          onSubmit={handleSubmit}
          onFileChange={handleFileChange}
          onModeChange={setIsAgent}
        />
      </div>
    </>
  );
}

export default Chat;
