"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { MODEL_OPTIONS } from "@/constants/models";
import { ModelId } from "@/types/chat";
import Image from "next/image";

interface ModelSelectorProps {
  value: ModelId;
  onValueChange: (value: ModelId) => void;
}

export function ModelSelector({ value, onValueChange }: ModelSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-7 shadow-none focus:ring-0 focus:ring-offset-0 [&>svg]:rotate-180 text-xs flex-row-reverse pl-1.5">
        <div className="flex items-center gap-1 font-medium">
          <Image
            src={MODEL_OPTIONS.find((opt) => opt.value === value)?.icon || ""}
            alt="Model logo"
            width={16}
            height={16}
            className="object-contain"
          />
          {MODEL_OPTIONS.find((opt) => opt.value === value)?.label}
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
                  <span className="font-medium">{option.label}</span>
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
  );
}
