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
import {
  ArrowRight,
  Infinity,
  Paperclip,
  Square,
  User,
} from "@phosphor-icons/react";
import Image from "next/image";
import React, { useState } from "react";
import Aurora from "./animation/Aurora";

const Chat: React.FC = () => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedModel, setSelectedModel] = useState("gemini-flash2");
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([]);

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
      const userMessage = { role: "user" as const, text: message };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setMessage("");
      setFiles([]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "ai" as const, text: "This is a mock AI response." },
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

  // const handleRemoveFile = (index: number) => {
  //   setFiles((prev) => prev.filter((_, i) => i !== index));
  // };

  return (
    <>
      <div className="flex-grow flex-shrink-0 h-[51px] w-full bg-white z-[2]"></div>
      <div className="flex flex-col h-[calc(100vh-51px)]">
        <div className="border-b border-b-default-200 flex items-center justify-between bg-white gap-x-3 px-3 h-[46px] font-medium">
          Agent
        </div>
        {messages.length === 0 && (
          <div className="h-42">
            <Aurora
              colorStops={["#1a1a1a", "#2d3436", "#636e72"]}
              blend={0.5}
              amplitude={1.0}
              speed={0.5}
            />
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-custom">
          {messages.length === 0 ? (
            <div className="h-full flex items-end">
              <div className="flex flex-col mb-4 transition-all duration-200 w-full">
                <div className="flex flex-col">
                  <div className="text-[35px] gradient-text leading-tight">
                    Hello Nick
                  </div>
                  <div className="text-[28px] text-default-900 leading-tight">
                    What are we working on today?
                  </div>
                </div>
                <div className="my-1.5"></div>
                <div className="border border-default-200 rounded-md p-2">
                  <div className="inline-flex items-center gap-1 text-default-900">
                    You are in
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-default-100 rounded-md bg-zinc-50 border text-sm">
                      <Infinity className="size-4" weight="regular" />
                      <span>Agent Mode</span>
                    </div>
                  </div>
                  <div className="my-1.5"></div>
                  <div className="text-sm text-default-900">
                    <div className="flex flex-col gap-1 text-muted-foreground">
                      Agent can directly edit and work on your canvas.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className="flex items-start gap-2 mb-4">
                {msg.role === "user" ? (
                  <div className="w-7 h-7 overflow-hidden flex items-center justify-center">
                    <User className="size-5 text-black" weight="regular" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg items-center flex justify-center">
                    <Image
                      src="/research.svg"
                      alt="AI"
                      width={24}
                      height={24}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-gray-900 text-sm pt-1">{msg.text}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="w-full px-2 pt-2 pb-2">
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
                            <div className="flex items-start gap-2">
                              <div className="flex-shrink-0 mt-1">
                                <Image
                                  src={option.icon}
                                  alt={`${option.label} logo`}
                                  width={16}
                                  height={16}
                                  className="object-contain"
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {option.label}
                                </span>
                                <span className="text-gray-500 text-xs">
                                  {option.description}
                                </span>
                              </div>
                            </div>
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
                  disabled={!isLoading && !message.trim() && files.length === 0}
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
      </div>
    </>
  );
};

export default Chat;
