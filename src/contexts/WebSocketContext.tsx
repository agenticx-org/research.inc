"use client";

import { MessageContent, ModelId } from "@/types/chat";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface WebSocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  sendMessage: (message: string, modelId: ModelId, isAgent: boolean) => boolean;
  lastMessage: any | null;
  connect: () => void;
  disconnect: () => void;
}

interface WebSocketProviderProps {
  children: React.ReactNode;
  url: string;
}

// Create context with default values
const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  isConnecting: false,
  error: null,
  sendMessage: () => false,
  lastMessage: null,
  connect: () => {},
  disconnect: () => {},
});

// Custom event handlers
type MessageHandler = (data: any) => void;
type StatusHandler = (status: 'thinking' | 'complete' | 'error') => void;
type ChunkHandler = (content: MessageContent) => void;

// Message handler registry
const messageHandlers = new Set<MessageHandler>();
const statusHandlers = new Set<StatusHandler>();
const chunkHandlers = new Set<ChunkHandler>();

export function WebSocketProvider({ children, url }: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL = 3000;

  // Connect to WebSocket
  const connect = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      console.log(`Connecting to WebSocket: ${url}`);
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;
      };
      
      ws.onclose = (event) => {
        console.log(`WebSocket closed: ${event.code} ${event.reason}`);
        setIsConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);
          
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_INTERVAL);
        }
      };
      
      ws.onerror = (e) => {
        console.error('WebSocket error:', e);
        setError('WebSocket error occurred');
        setIsConnecting(false);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          
          // Distribute messages to all registered handlers
          messageHandlers.forEach(handler => handler(data));
          
          // Handle specific message types
          if (data.type === 'status') {
            statusHandlers.forEach(handler => handler(data.status));
          } else if (data.type === 'md') {
            chunkHandlers.forEach(handler => handler(data.content));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      socketRef.current = ws;
    } catch (err) {
      console.error('Failed to connect to WebSocket:', err);
      setError('Failed to connect to WebSocket');
      setIsConnecting(false);
      
      // Attempt to reconnect
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current += 1;
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, RECONNECT_INTERVAL);
      }
    }
  };

  // Disconnect WebSocket
  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  // Send message
  const sendMessage = (message: string, modelId: ModelId, isAgent: boolean) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        "name" : "chat_message",
        "message": {
            "content" : message,
            "role": "user"
        },
        "model":modelId,
        "mode":"chat",
        "block_ids":"234234234AWEFAWEF",
        "document_id":"AWEFAWE3453453453",
        "chat_id":"34234DFAWFA", 
        "user_id":"23423423AWEFAWEFAWEF",
    });
      console.log('Sending message:', payload);
      socketRef.current.send(payload);
      return true;
    } else {
      console.warn('WebSocket not connected, attempting to reconnect...');
      connect();
      return false;
    }
  };

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [url]);

  const value = {
    isConnected,
    isConnecting,
    error,
    sendMessage,
    lastMessage,
    connect,
    disconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Custom hook to use WebSocket context
export function useWebSocket() {
  return useContext(WebSocketContext);
}

// Custom hook to register message handlers
export function useWebSocketHandlers({
  onMessage,
  onStatusChange,
  onChunk,
}: {
  onMessage?: MessageHandler;
  onStatusChange?: StatusHandler;
  onChunk?: ChunkHandler;
}) {
  useEffect(() => {
    // Register handlers
    if (onMessage) messageHandlers.add(onMessage);
    if (onStatusChange) statusHandlers.add(onStatusChange);
    if (onChunk) chunkHandlers.add(onChunk);
    
    // Clean up handlers on unmount
    return () => {
      if (onMessage) messageHandlers.delete(onMessage);
      if (onStatusChange) statusHandlers.delete(onStatusChange);
      if (onChunk) chunkHandlers.delete(onChunk);
    };
  }, [onMessage, onStatusChange, onChunk]);
} 