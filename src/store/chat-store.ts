import { Message, MessageContent, ModelId } from "@/types/chat";
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
  addUserMessage: (text: string) => void;
  addAgentResponse: (content: MessageContent[]) => void;
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
      addUserMessage: (text: string) =>
        set((state) => {
          state.messages.push({
            role: "user",
            content: [{ type: "text", text }],
          });
        }),
      addAgentResponse: (content: MessageContent[]) =>
        set((state) => {
          state.messages.push({
            role: "ai",
            content,
          });
        }),
      clearMessages: () => set({ messages: [] }),
      setIsAgent: (isAgent: boolean) => set({ isAgent }),

      // Handlers
      handleSubmit: () => {
        const { message, files } = get();

        if (message.trim() || files.length > 0) {
          // Add user message
          set((state) => {
            state.messages.push({
              role: "user",
              content: [{ type: "text", text: message }],
            });
            state.isLoading = true;
            state.message = "";
            state.files = [];
          });

          // Mock AI response - replace with actual API call
          setTimeout(() => {
            // Example of an agent response with mixed content
            if (get().isAgent) {
              set((state) => {
                state.messages.push({
                  role: "ai",
                  content: [
                    {
                      type: "text",
                      text: "I found some information for you:",
                    },
                    {
                      type: "element",
                      element: {
                        type: "web_search",
                        content: {
                          title: "Example Search Result",
                          url: "https://example.com",
                          snippet:
                            "This is an example search result that demonstrates the UI element for web search results.",
                        },
                      },
                    },
                  ],
                });
                state.isLoading = false;
              });
            } else {
              set((state) => {
                state.messages.push({
                  role: "ai",
                  content: [
                    {
                      type: "text",
                      text: "This is a standard AI response without UI elements.",
                    },
                  ],
                });
                state.isLoading = false;
              });
            }
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
        // messages: state.messages,
        isAgent: state.isAgent,
      }),
    }
  )
);
