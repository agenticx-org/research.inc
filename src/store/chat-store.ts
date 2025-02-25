import { Message, ModelId } from "@/types/chat";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface ChatState {
  // State
  message: string;
  isLoading: boolean;
  files: File[];
  selectedModel: ModelId;
  messages: Message[];
  isAgent: boolean;

  // Actions
  setMessage: (message: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setFiles: (files: File[]) => void;
  addFiles: (newFiles: File[]) => void;
  clearFiles: () => void;
  setSelectedModel: (model: ModelId) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setIsAgent: (isAgent: boolean) => void;

  // Handlers
  handleSubmit: () => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    immer<ChatState>((set, get) => ({
      // Initial state
      message: "",
      isLoading: false,
      files: [],
      selectedModel: "claude3.7" as ModelId,
      messages: [],
      isAgent: true,

      // Actions
      setMessage: (message: string) => set({ message }),
      setIsLoading: (isLoading: boolean) => set({ isLoading }),
      setFiles: (files: File[]) => set({ files }),
      addFiles: (newFiles: File[]) =>
        set((state) => {
          state.files = [...state.files, ...newFiles];
        }),
      clearFiles: () => set({ files: [] }),
      setSelectedModel: (selectedModel: ModelId) => set({ selectedModel }),
      addMessage: (message: Message) =>
        set((state) => {
          state.messages.push(message);
        }),
      clearMessages: () => set({ messages: [] }),
      setIsAgent: (isAgent: boolean) => set({ isAgent }),

      // Handlers
      handleSubmit: () => {
        const { message, files } = get();

        if (message.trim() || files.length > 0) {
          const userMessage: Message = { role: "user", text: message };

          set((state) => {
            state.messages.push(userMessage);
            state.isLoading = true;
            state.message = "";
            state.files = [];
          });

          // Mock AI response - replace with actual API call
          setTimeout(() => {
            set((state) => {
              state.messages.push({
                role: "ai",
                text: "This is a mock AI response.",
              });
              state.isLoading = false;
            });
          }, 2000);
        }
      },

      handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
          const newFiles = Array.from(event.target.files);
          set((state) => {
            state.files = [...state.files, ...newFiles];
          });
        }
      },
    })),
    {
      name: "chat-storage",
      partialize: (state) => ({
        // Only persist specific parts of the state
        // Files can't be serialized, so we exclude them
        selectedModel: state.selectedModel,
        messages: state.messages,
        isAgent: state.isAgent,
      }),
    }
  )
);
