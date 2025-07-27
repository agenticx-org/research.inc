"use client";

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/chat/PromptInput";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModelId } from "@/types/chat";
import {
  ArrowRight,
  ChatCircle,
  Infinity,
  Paperclip,
  Square,
} from "@phosphor-icons/react";
import { useState } from "react";
import { ModelSelector } from "./ModelSelector";

interface ChatInputProps {
  message: string;
  isLoading: boolean;
  selectedModel: ModelId;
  onMessageChange: (message: string) => void;
  onModelChange: (model: ModelId) => void;
  onSubmit: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onModeChange?: (isAgent: boolean) => void;
}

export function ChatInput({
  message,
  isLoading,
  selectedModel,
  onMessageChange,
  onModelChange,
  onSubmit,
  onFileChange,
  onModeChange,
}: ChatInputProps) {
  const [isAgent, setIsAgent] = useState(true);

  const handleModeChange = (checked: boolean) => {
    setIsAgent(checked);
    onModeChange?.(checked);
  };

  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <div className="w-full px-2 pt-2 pb-2">
      <div className="border w-40 -mb-2 pb-2 rounded-t text-xs bg-zinc-50 flex items-center justify-center">
        <div
          role="group"
          aria-label="Chat mode selection"
          className="bg-white w-full mx-1 rounded-lg my-1 border min-h-6 flex overflow-hidden"
        >
          <button
            onClick={() => handleModeChange(true)}
            aria-pressed={isAgent}
            className={cn([
              "w-20 flex items-center justify-center gap-1 transition-colors",
              isAgent ? "bg-black text-white" : "hover:bg-zinc-100",
            ])}
          >
            <span className="flex items-center gap-1">
              {isAgent && <Infinity className="size-3" weight="bold" />}
              Agent
            </span>
            <span className="text-[8px] opacity-60">⌘I</span>
          </button>
          <button
            onClick={() => handleModeChange(false)}
            aria-pressed={!isAgent}
            className={cn([
              "w-20 flex items-center justify-center gap-1 transition-colors",
              !isAgent ? "bg-black text-white" : "hover:bg-zinc-100",
            ])}
          >
            <span className="flex items-center gap-1">
              {!isAgent && <ChatCircle className="size-3" weight="bold" />}
              Chat
            </span>
            <span className="text-[8px] opacity-60">⌘L</span>
          </button>
        </div>
      </div>

      <PromptInput
        isLoading={isLoading}
        value={message}
        onValueChange={onMessageChange}
        onSubmit={handleSubmit}
        className="bg-white"
      >
        <PromptInputTextarea
          placeholder="Ask me to do anything..."
          className="px-1"
        />
        <PromptInputActions className="flex w-full items-center gap-2 justify-between">
          <div className="flex items-center gap-1">
            <PromptInputAction tooltip="Select LLM">
              <ModelSelector
                value={selectedModel}
                onValueChange={onModelChange}
              />
            </PromptInputAction>
            <PromptInputAction tooltip="Attach files">
              <Button variant="outline" size="icon" className="h-7 w-7">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={onFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <Paperclip className="text-primary size-4" weight="regular" />
                </label>
              </Button>
            </PromptInputAction>
          </div>
          <PromptInputAction
            tooltip={isLoading ? "Stop generation" : "Send message (Enter)"}
          >
            <Button
              size="icon"
              className="h-7 w-7"
              onClick={handleSubmit}
              disabled={!message.trim()}
            >
              {isLoading ? (
                <Square className="size-4 fill-current" weight="fill" />
              ) : (
                <ArrowRight className="size-4" weight="regular" />
              )}
            </Button>
          </PromptInputAction>
        </PromptInputActions>
      </PromptInput>
    </div>
  );
}
