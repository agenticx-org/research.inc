"use client";

import { Message } from "@/types/chat";
import { MessageItem } from "./MessageItem";
import { WelcomeMessage } from "./WelcomeMessage";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return <WelcomeMessage />;
  }

  return (
    <div className="space-y-4 p-4">
      {messages.map((message, idx) => (
        <MessageItem key={idx} message={message} />
      ))}
    </div>
  );
}
