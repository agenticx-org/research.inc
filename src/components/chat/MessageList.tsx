"use client";

import { Message, MessageContent } from "@/types/chat";
import { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";
import { WelcomeMessage } from "./WelcomeMessage";

interface MessageListProps {
  messages: Message[];
  isAgent: boolean;
  streamingContent?: MessageContent[];
}

export function MessageList({ messages, isAgent, streamingContent }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change or streaming content updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  if (messages.length === 0 && !streamingContent) {
    return <WelcomeMessage isAgent={isAgent} />;
  }

  return (
    <div className="space-y-4 p-4">
      {messages.map((message, idx) => (
        <MessageItem key={idx} message={message} />
      ))}
      
      {/* Show streaming content if available */}
      {streamingContent && streamingContent.length > 0 && (
        <MessageItem 
          message={{ 
            role: "ai", 
            content: streamingContent 
          }} 
          isStreaming={true}
        />
      )}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
