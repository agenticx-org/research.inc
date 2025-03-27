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
  isStreaming: boolean;
  streamingContent: MessageContent[];
  files: File[];
  selectedModel: ModelId;
  messages: Message[];
  isAgent: boolean;
  selectedTextItems: SelectedTextItem[];

  // Actions
  setMessage: (message: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  updateStreamingContent: (content: MessageContent) => void;
  commitStreamingContent: () => void;
  clearStreamingContent: () => void;
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
      isStreaming: false,
      streamingContent: [],
      files: [],
      selectedModel: "claude3.7" as ModelId,
      messages: [],
      isAgent: true,
      selectedTextItems: [],

      // Actions
      setMessage: (message: string) => set({ message }),
      setIsLoading: (isLoading: boolean) => set({ isLoading }),
      setIsStreaming: (isStreaming: boolean) => set({ isStreaming }),
      
      // Update streaming content with a new chunk
      updateStreamingContent: (content: MessageContent) => 
        set((state) => {
          // If this is a text content and we already have text content, append to it
          if (content.type === "text" && 
              state.streamingContent.length > 0 && 
              state.streamingContent[state.streamingContent.length - 1].type === "text") {
            
            const lastItem = state.streamingContent[state.streamingContent.length - 1] as { type: "text", text: string };
            lastItem.text += content.text;
          } else {
            // Otherwise add as a new content item
            state.streamingContent.push(content);
          }
        }),
      
      // Commit streaming content to the messages
      commitStreamingContent: () => 
        set((state) => {
          if (state.streamingContent.length > 0) {
            state.messages.push({
              role: "ai",
              content: [...state.streamingContent],
            });
            state.streamingContent = [];
            state.isStreaming = false;
          }
        }),
      
      // Clear streaming content
      clearStreamingContent: () => 
        set((state) => {
          state.streamingContent = [];
          state.isStreaming = false;
        }),
        
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

      // Clear all selected texts
      clearSelectedTexts: () => set({ selectedTextItems: [] }),

      // Handler for when the prompt is submitted
      handleSubmit: () => {
        const { message, selectedTextItems } = get();

        // If there's no message and no selections, don't do anything
        if (!message.trim() && selectedTextItems.length === 0) {
          return;
        }

        // Set loading state
        set({ isLoading: true });

        // Create a message that includes both the typed text and any selections
        let fullMessage = message.trim();

        // Add any selected text snippets to the message
        if (selectedTextItems.length > 0) {
          fullMessage += "\n\nSelected text:\n";
          selectedTextItems.forEach((item) => {
            fullMessage += `\n---\n${item.text}\n---\n`;
          });
        }

        // Add user message to the chat
        get().addUserMessage(fullMessage);

        // Clear the input
        set({ message: "" });

        // For demonstration, add a dummy AI response after a short delay
        // This should be replaced with the actual API call
        setTimeout(() => {
          get().addAgentResponse([
            { type: "text", text: "This is a placeholder response." },
          ]);
          set({ isLoading: false });
        }, 1000);
      },

      // Handler for file input change
      handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
          // Convert FileList to array and add to state
          const fileArray = Array.from(files);
          get().addFiles(fileArray);
        }
      },

      setMessageAndTogglePanel: (
        message: string,
        isSelectedText = false,
        from?: number,
        to?: number,
        path?: number[]
      ) => {
        if (isSelectedText && from !== undefined && to !== undefined) {
          get().addSelectedText(message, undefined, undefined, from, to, path);
        } else {
          set((state) => {
            state.message = state.message
              ? `${state.message.trim()} ${message}`
              : message;
          });
        }
      },
    })),
    {
      name: "chat-store",
      partialize: (state) => ({
        messages: state.messages,
        selectedModel: state.selectedModel,
        isAgent: state.isAgent,
      }),
    }
  )
);
