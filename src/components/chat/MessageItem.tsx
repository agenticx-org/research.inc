"use client";

import { Message } from "@/types/chat";
import { User } from "@phosphor-icons/react";
import Image from "next/image";

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
        <div className="text-gray-900 text-sm pt-1">{message.text}</div>
      </div>
    </div>
  );
}
