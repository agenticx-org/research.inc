"use client";

import { Message, ModelId } from "@/types/chat";
import { useState } from "react";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

export function Chat() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelId>("gemini-flash2");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAgent, setIsAgent] = useState(true);

  const handleSubmit = () => {
    if (message.trim() || files.length > 0) {
      const userMessage: Message = { role: "user", text: message };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setMessage("");
      setFiles([]);

      // Mock AI response - replace with actual API call
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "This is a mock AI response." },
        ]);
        setIsLoading(false);
      }, 2000);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleModeChange = (isAgent: boolean) => {
    setIsAgent(isAgent);
  };

  return (
    <>
      <div className="flex-grow flex-shrink-0 h-[51px] w-full bg-white z-[2]"></div>
      <div className="flex flex-col h-[calc(100vh-51px)]">
        <div className="border-b border-b-default-200 flex items-center justify-between bg-white gap-x-3 px-3 h-[46px] font-medium">
          {isAgent ? "Agent" : "Chat"}
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
          onModeChange={handleModeChange}
        />
      </div>
    </>
  );
}

export default Chat;
