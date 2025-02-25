"use client";

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/chat/PromptInput";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";
import { ModelId } from "@/types/chat";
import {
  ArrowRight,
  ChatCircle,
  Infinity,
  Paperclip,
  Square,
  X,
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
  const { selectedTextItems, removeSelectedText, clearSelectedTexts } =
    useChatStore();

  const handleModeChange = (checked: boolean) => {
    setIsAgent(checked);
    onModeChange?.(checked);
  };

  const handleSubmit = () => {
    onSubmit();
    clearSelectedTexts();
  };

  const hasSelectedItems = selectedTextItems.length > 0;

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

      {hasSelectedItems && (
        <div className="border rounded-t border-b-0 p-2 bg-zinc-50">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-gray-500">
              {selectedTextItems.length} selection
              {selectedTextItems.length !== 1 ? "s" : ""}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={clearSelectedTexts}
            >
              Clear all
            </Button>
          </div>

          <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto">
            {selectedTextItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "relative p-2 rounded border text-sm flex items-start group",
                  item.color
                )}
              >
                <div className="flex-1 pr-6 truncate">{item.text}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeSelectedText(item.id)}
                >
                  <X className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <PromptInput
        isLoading={isLoading}
        value={message}
        onValueChange={onMessageChange}
        onSubmit={handleSubmit}
        className={cn("bg-white", hasSelectedItems && "rounded-t-none")}
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
              disabled={!message.trim() && !hasSelectedItems}
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
