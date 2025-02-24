"use client";

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/chat/PromptInput";
import { Button } from "@/components/ui/button";
import { ModelId } from "@/types/chat";
import { ArrowRight, Paperclip, Square } from "@phosphor-icons/react";
import { ModelSelector } from "./ModelSelector";

interface ChatInputProps {
  message: string;
  isLoading: boolean;
  selectedModel: ModelId;
  onMessageChange: (message: string) => void;
  onModelChange: (model: ModelId) => void;
  onSubmit: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ChatInput({
  message,
  isLoading,
  selectedModel,
  onMessageChange,
  onModelChange,
  onSubmit,
  onFileChange,
}: ChatInputProps) {
  return (
    <div className="w-full px-2 pt-2 pb-2">
      <PromptInput
        isLoading={isLoading}
        value={message}
        onValueChange={onMessageChange}
        onSubmit={onSubmit}
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
              onClick={onSubmit}
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
