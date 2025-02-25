"use client";

import { useChatStore } from "@/store/chat-store";
import { ArrowUpRight, ChatCircle, Infinity } from "@phosphor-icons/react";
import Aurora from "../animation/Aurora";
import GradientText from "../animation/GradientText";

interface WelcomeMessageProps {
  isAgent: boolean;
}

export function WelcomeMessage({ isAgent }: WelcomeMessageProps) {
  const { setMessage, handleSubmit } = useChatStore();

  const handleExampleClick = (text: string) => {
    setMessage(text);
    handleSubmit();
  };

  return (
    <div className="relative h-full w-full min-h-[500px]">
      <div className="h-36 relative z-10">
        <Aurora
          colorStops={["#1a1a1a", "#2d3436", "#636e72"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 z-[1]">
        <div className="flex flex-col transition-all duration-200">
          <div className="flex flex-col">
            <GradientText
              colors={["#1a1a1a", "#2d3436", "#636e72", "#2d3436", "#1a1a1a"]}
              animationSpeed={3}
              showBorder={false}
              className="text-[35px] mx-0"
            >
              Hello Nick
            </GradientText>
            <div className="text-[28px] text-default-900 leading-tight">
              What are we working on today?
            </div>
          </div>
          <div className="my-1.5"></div>
          <div className="border border-default-200 rounded-md p-2 bg-white/80 backdrop-blur-sm">
            <div className="inline-flex items-center gap-1 text-default-900">
              You are in
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-default-100 rounded-md bg-zinc-50 border text-sm">
                {isAgent ? (
                  <Infinity className="size-4" weight="regular" />
                ) : (
                  <ChatCircle className="size-4" weight="regular" />
                )}
                <span>{isAgent ? "Agent Mode" : "Chat Mode"}</span>
              </div>
            </div>
            <div className="my-1.5"></div>
            <div className="text-sm text-default-900">
              <div className="flex flex-col gap-1 text-muted-foreground">
                {isAgent
                  ? "Agent can directly edit and work on your canvas."
                  : "Chat with me about anything you'd like to know."}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {[
              {
                text: "Analyze potential PE investment opportunities in the automotive supplier market, focusing on EV component manufacturers.",
                icon: <ArrowUpRight className="size-3.5" weight="regular" />,
              },
              {
                text: "Evaluate the PE exit opportunities and multiples for software companies in the automotive diagnostic tools sector.",
                icon: <ArrowUpRight className="size-3.5" weight="regular" />,
              },
              {
                text: "Research buy-and-build strategies in the automotive aftermarket sector, identifying potential add-on acquisitions.",
                icon: <ArrowUpRight className="size-3.5" weight="regular" />,
              },
            ].map((item, index) => (
              <button
                key={index}
                className="flex items-center gap-2 p-3 py-1.5 text-left bg-zinc-50 hover:bg-zinc-100 rounded-lg transition-colors duration-200"
                onClick={() => handleExampleClick(item.text)}
              >
                <div className="flex items-center">{item.icon}</div>
                <span className="text-[11px] text-default-700">
                  {item.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
