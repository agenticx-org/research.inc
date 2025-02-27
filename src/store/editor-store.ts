import type { Range } from "@tiptap/core";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface EditorState {
  // State
  query: string;
  range: Range | null;

  // Actions
  setQuery: (query: string) => void;
  setRange: (range: Range) => void;
}

export const useEditorStore = create<EditorState>()(
  immer<EditorState>((set) => ({
    // Initial state
    query: "",
    range: null,

    // Actions
    setQuery: (query: string) => set({ query }),
    setRange: (range: Range) => set({ range }),
  }))
);
