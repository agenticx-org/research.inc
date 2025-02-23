"use client";

import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUp, Paperclip, Square } from "@phosphor-icons/react";
import React, { useState } from "react";

const Chat: React.FC = () => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedModel, setSelectedModel] = useState("gpt4");

  const MODEL_OPTIONS = [
    { label: "GPT 4.0", value: "gpt4" },
    { label: "Claude 3.5", value: "claude3.5" },
    { label: "Sonnet", value: "sonnet" },
    { label: "Gemini Flash 2.0", value: "gemini-flash2" },
    { label: "o-3 mini", value: "o3mini" },
  ];

  const handleSubmit = () => {
    if (message.trim() || files.length > 0) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setMessage("");
        setFiles([]);
      }, 2000);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  // const handleRemoveFile = (index: number) => {
  //   setFiles((prev) => prev.filter((_, i) => i !== index));
  // };

  return (
    <>
      <div className="flex-grow flex-shrink-0 h-[51px] w-full bg-white z-[2]"></div>
      <div className="flex-grow flex-shrink relative w-full h-[calc(100vh-51px)]">
        <div className="border-b border-b-default-200 flex items-center justify-between bg-white gap-x-3 px-3 h-[46px] relative">
          Agent
        </div>
        <div className="flex-grow flex-shrink w-full h-full overflow-y-scroll relative scrollbar-custom">
          {/* Chat messages will go here */}
        </div>
        <div className="w-full px-2 pt-2 absolute bottom-0 pb-2 space-y-2">
          <PromptInput
            isLoading={isLoading}
            value={message}
            onValueChange={setMessage}
            onSubmit={handleSubmit}
            className="bg-white"
          >
            <PromptInputTextarea
              placeholder="Ask me anything..."
              className="px-1"
            />
            <PromptInputActions className="flex w-full items-center gap-2 justify-between">
              <div className="flex items-center gap-1">
                <PromptInputAction tooltip="Select LLM">
                  <Select
                    value={selectedModel}
                    onValueChange={(value) => setSelectedModel(value)}
                  >
                    <SelectTrigger className="w-32 h-6 shadow-none focus:ring-0 focus:ring-offset-0 [&>svg]:rotate-180 text-xs">
                      <SelectValue placeholder="Select LLM" />
                    </SelectTrigger>
                    <SelectContent>
                      {MODEL_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </PromptInputAction>
                <PromptInputAction tooltip="Attach files">
                  <Button variant="outline" size="icon" className="h-6 w-6">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <Paperclip
                        className="text-primary size-4"
                        weight="regular"
                      />
                    </label>
                  </Button>
                </PromptInputAction>
              </div>
              <PromptInputAction
                tooltip={isLoading ? "Stop generation" : "Send message"}
              >
                <Button
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleSubmit}
                  disabled={!message.trim() && files.length === 0}
                >
                  {isLoading ? (
                    <Square className="size-5 fill-current" weight="fill" />
                  ) : (
                    <ArrowUp className="size-5" weight="regular" />
                  )}
                </Button>
              </PromptInputAction>
            </PromptInputActions>
          </PromptInput>
        </div>
      </div>
    </>
  );
};

export default Chat;
