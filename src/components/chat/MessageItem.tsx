"use client";

import { ElementContent, Message, TextContent } from "@/types/chat";
import { User } from "@phosphor-icons/react";
import Image from "next/image";
import { UIElement } from "./ui-elements";

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  return (
    <div className="flex items-start gap-2 mb-4">
      {message.role === "user" ? (
        <div className="w-7 h-7 overflow-hidden flex items-center justify-center">
          <User className="size-5 text-black" weight="regular" />
        </div>
      ) : (
        <div className="w-7 h-7 rounded-lg items-center flex justify-center">
          <Image src="/research.svg" alt="AI" width={24} height={24} />
        </div>
      )}
      <div className="flex-1">
        <div className="space-y-3">
          {message.content.map((content, idx) => (
            <MessageContent key={idx} content={content} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface MessageContentProps {
  content: TextContent | ElementContent;
}

function MessageContent({ content }: MessageContentProps) {
  if (content.type === "text") {
    return <div className="text-gray-900 text-sm mt-1">{content.text}</div>;
  } else if (content.type === "element") {
    return <UIElement element={content.element} />;
  }
  return null;
}
