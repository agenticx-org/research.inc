"use client";

import { useWebSocket, useWebSocketHandlers } from "@/contexts/WebSocketContext";
import { useChatStore } from "@/store/chat-store";
import { MessageContent } from "@/types/chat";
import { Plus } from "@phosphor-icons/react";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

// WebSocket URL from environment variable or default
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8000/ws/chat";

export function Chat() {
  const {
    message,
    isLoading,
    isStreaming,
    streamingContent,
    selectedModel,
    messages,
    isAgent,
    setMessage,
    setSelectedModel,
    setIsLoading,
    setIsStreaming,
    updateStreamingContent,
    commitStreamingContent,
    clearStreamingContent,
    addUserMessage,
    handleFileChange,
    setIsAgent,
    clearMessages,
    clearSelectedTexts,
  } = useChatStore();

  // Get WebSocket from context
  const { isConnected, sendMessage } = useWebSocket();

  // Register message handlers
  useWebSocketHandlers({
    onStatusChange: (status) => {
      if (status === 'thinking') {
        setIsLoading(true);
        setIsStreaming(false);
      } else if (status === 'complete') {
        setIsLoading(false);
        setIsStreaming(false);
        commitStreamingContent();
      } else if (status === 'error') {
        setIsLoading(false);
        setIsStreaming(false);
        clearStreamingContent();
      }
    },
    onChunk: (content: MessageContent) => {
      if (!isStreaming) {
        setIsStreaming(true);
      }
      updateStreamingContent(content);
    },
  });

  // Custom handle submit
  const handleSubmit = () => {
    if (!message.trim() || !isConnected) return;

    // Add user message to the chat
    addUserMessage(message);
    
    // Send the message via WebSocket
    sendMessage(message, selectedModel, isAgent);
    
    // Clear the input
    setMessage("");
    clearSelectedTexts();
  };

  const handleClearChat = () => {
    clearMessages();
    clearSelectedTexts();
  };

  // Show connection status
  useEffect(() => {
    if (!isConnected) {
      console.warn("WebSocket disconnected");
    }
  }, [isConnected]);

  return (
    <>
      <div className="flex-grow flex-shrink-0 h-[51px] w-full bg-white z-[2]"></div>
      <div className="flex flex-col h-[calc(100vh-51px)]">
        <div className="border-b border-b-default-200 flex items-center justify-between bg-white gap-x-3 px-3 h-[46px] font-medium">
          <div className="flex items-center gap-2">
            Agent
            {!isConnected && (
              <span className="text-xs text-red-500 font-normal">
                (WebSocket disconnected)
              </span>
            )}
          </div>
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleClearChat}>
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
          <MessageList 
            messages={messages} 
            isAgent={isAgent} 
            streamingContent={isStreaming ? streamingContent : undefined}
          />
        </div>
        <ChatInput
          message={message}
          isLoading={isLoading || isStreaming}
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
