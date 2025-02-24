"use client";

import { Infinity } from "@phosphor-icons/react";
import Aurora from "../animation/Aurora";

export function WelcomeMessage() {
  return (
    <div className="relative h-full w-full">
      <div className="h-42">
        <Aurora
          colorStops={["#1a1a1a", "#2d3436", "#636e72"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex flex-col transition-all duration-200">
          <div className="flex flex-col">
            <div className="text-[35px] gradient-text leading-tight">
              Hello Nick
            </div>
            <div className="text-[28px] text-default-900 leading-tight">
              What are we working on today?
            </div>
          </div>
          <div className="my-1.5"></div>
          <div className="border border-default-200 rounded-md p-2 bg-white/80 backdrop-blur-sm">
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
    </div>
  );
}
