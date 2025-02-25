import { Message, MessageContent, ModelId } from "@/types/chat";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// Define a type for selected text items with color
interface SelectedTextItem {
  id: string;
  text: string;
  color: string;
  from?: number;
  to?: number;
  path?: number[];
}

// Array of colors to cycle through for selections
export const SELECTION_COLORS = [
  "bg-blue-50 border-blue-200",
  "bg-green-50 border-green-200",
  "bg-purple-50 border-purple-200",
  "bg-amber-50 border-amber-200",
  "bg-rose-50 border-rose-200",
  "bg-teal-50 border-teal-200",
  "bg-indigo-50 border-indigo-200",
  "bg-orange-50 border-orange-200",
];

interface ChatState {
  // State
  message: string;
  isLoading: boolean;
  files: File[];
  selectedModel: ModelId;
  messages: Message[];
  isAgent: boolean;
  selectedTextItems: SelectedTextItem[];

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
  setMessageAndTogglePanel: (
    message: string,
    isSelectedText?: boolean,
    from?: number,
    to?: number,
    path?: number[]
  ) => void;
  addSelectedText: (
    text: string,
    id?: string,
    color?: string,
    from?: number,
    to?: number,
    path?: number[]
  ) => void;
  removeSelectedText: (id: string) => void;
  clearSelectedTexts: () => void;

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
      selectedTextItems: [],

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

      // Add a new selected text item with a unique color
      addSelectedText: (
        text: string,
        id?: string,
        color?: string,
        from?: number,
        to?: number,
        path?: number[]
      ) =>
        set((state) => {
          const trimmedText = text.trim();
          if (trimmedText) {
            // Check if this exact text already exists in the selections
            const isDuplicate = state.selectedTextItems.some(
              (item) => item.text === trimmedText
            );

            // Only add if it's not a duplicate
            if (!isDuplicate) {
              const colorIndex =
                state.selectedTextItems.length % SELECTION_COLORS.length;
              state.selectedTextItems.push({
                id: id || Date.now().toString(),
                text: trimmedText,
                color: color || SELECTION_COLORS[colorIndex],
                from,
                to,
                path,
              });
            }
          }
        }),

      // Remove a selected text item by id
      removeSelectedText: (id: string) =>
        set((state) => {
          state.selectedTextItems = state.selectedTextItems.filter(
            (item) => item.id !== id
          );
        }),

      // Clear all selected text items
      clearSelectedTexts: () => set({ selectedTextItems: [] }),

      setMessageAndTogglePanel: (
        message: string,
        isSelectedText = false,
        from?: number,
        to?: number,
        path?: number[]
      ) => {
        if (isSelectedText) {
          // Generate a unique ID for this selection
          const id = Date.now().toString();

          // Calculate the color index based on current selections
          const { selectedTextItems } = get();
          const colorIndex = selectedTextItems.length % SELECTION_COLORS.length;
          const colorClass = SELECTION_COLORS[colorIndex];

          // Add the selected text with position information
          get().addSelectedText(message, id, colorClass, from, to, path);
        } else {
          set({ message });
        }
        // This is a custom event to toggle the panel visibility
        const event = new CustomEvent("toggleChatPanel", {
          detail: {
            shouldOpen: !!message.trim(),
            forceToggle: !message.trim(),
          },
        });
        window.dispatchEvent(event);
      },

      // Handlers
      handleSubmit: () => {
        const { message, files, selectedTextItems } = get();

        // Combine all selected texts with the message
        let textToSend = message;

        if (selectedTextItems.length > 0) {
          const selectedTextsContent = selectedTextItems
            .map((item) => item.text)
            .join("\n\n");

          textToSend = selectedTextsContent + (message ? `\n\n${message}` : "");
        }

        if (textToSend.trim() || files.length > 0) {
          // Add user message
          set((state) => {
            state.messages.push({
              role: "user",
              content: [{ type: "text", text: textToSend }],
            });
            state.isLoading = true;
            state.message = "";
            state.selectedTextItems = [];
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
