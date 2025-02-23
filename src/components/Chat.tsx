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
} from "@/components/ui/select";
import { ArrowRight, Paperclip, Square } from "@phosphor-icons/react";
import Image from "next/image";
import React, { useState } from "react";

const Chat: React.FC = () => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedModel, setSelectedModel] = useState("gemini-flash2");

  const MODEL_OPTIONS = [
    // Google models
    {
      label: "Gemini Flash 2.0",
      value: "gemini-flash2",
      icon: "/google-logo.webp",
      description: "fastest, most detailed",
    },
    {
      label: "Gemini Pro 1.5",
      value: "gemini-pro",
      icon: "/google-logo.webp",
      description: "medium speed, paragraph/report like output",
    },
    // Anthropic models
    {
      label: "Claude 3.5 Sonnet",
      value: "claude3.5",
      icon: "/anthropic-logo.svg",
      description: "medium speed, detailed write up like output",
    },
    // OpenAI models
    {
      label: "GPT-4o",
      value: "gpt4",
      icon: "/openai-logo.svg",
      description: "medium speed, succint write up like output",
    },
    {
      label: "o3-mini",
      value: "o3mini",
      icon: "/openai-logo.svg",
      description: "slow, intelligent reasoning, research paper like output",
    },
    // Deepseek models
    {
      label: "Deepseek R1",
      value: "deepseek",
      icon: "/deepseek-logo.png",
      description: "slowest, intelligent reasoning, highly detailed report",
    },
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
              placeholder="Ask me to do anything..."
              className="px-1"
            />
            <PromptInputActions className="flex w-full items-center gap-2 justify-between">
              <div className="flex items-center gap-1">
                <PromptInputAction tooltip="Select LLM">
                  <Select
                    value={selectedModel}
                    onValueChange={(value) => setSelectedModel(value)}
                  >
                    <SelectTrigger className="h-7 shadow-none focus:ring-0 focus:ring-offset-0 [&>svg]:rotate-180 text-xs flex-row-reverse pl-1.5">
                      <div className="flex items-center gap-1 font-medium">
                        <Image
                          src={
                            MODEL_OPTIONS.find(
                              (opt) => opt.value === selectedModel
                            )?.icon || ""
                          }
                          alt="Model logo"
                          width={16}
                          height={16}
                          className="object-contain"
                        />
                        {
                          MODEL_OPTIONS.find(
                            (opt) => opt.value === selectedModel
                          )?.label
                        }
                      </div>
                    </SelectTrigger>
                    <SelectContent className="p-1 rounded-xl shadow-lg">
                      {MODEL_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="[&>span:first-child]:hidden py-2"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Image
                                src={option.icon}
                                alt={`${option.label} logo`}
                                width={16}
                                height={16}
                                className="object-contain"
                              />
                              <span className="font-medium">
                                {option.label}
                              </span>
                            </div>
                            <span className="text-gray-500 text-xs ml-6">
                              {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </PromptInputAction>
                <PromptInputAction tooltip="Attach files">
                  <Button variant="outline" size="icon" className="h-7 w-7">
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
                tooltip={isLoading ? "Stop generation" : "Send message (Enter)"}
              >
                <Button
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleSubmit}
                  disabled={!message.trim() && files.length === 0}
                >
                  {isLoading ? (
                    <Square className="size-5 fill-current" weight="fill" />
                  ) : (
                    <ArrowRight className="size-4" weight="regular" />
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
