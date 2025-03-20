import { useEffect, useRef, useState, useCallback } from 'react';
import { MessageContent, ModelId } from '@/types/chat';

interface WebSocketHookProps {
  url: string;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (data: any) => void;
  onStatusChange?: (status: 'thinking' | 'complete' | 'error') => void;
  onChunk?: (content: MessageContent) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface SendMessageOptions {
  message: string;
  modelId: ModelId;
  isAgent: boolean;
}

export function useWebSocket({
  url,
  onOpen,
  onClose,
  onError,
  onMessage,
  onStatusChange,
  onChunk,
  autoReconnect = true,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
}: WebSocketHookProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to the WebSocket
  const connect = useCallback(() => {
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
        onOpen?.();
      };
      
      ws.onclose = (event) => {
        console.log(`WebSocket closed: ${event.code} ${event.reason}`);
        setIsConnected(false);
        onClose?.();
        
        // Attempt to reconnect if enabled
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };
      
      ws.onerror = (e) => {
        console.error('WebSocket error:', e);
        setError('WebSocket error occurred');
        setIsConnecting(false);
        onError?.(e);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          if (data.type === 'status') {
            onStatusChange?.(data.status);
          } else if (data.type === 'chunk') {
            onChunk?.(data.content);
          }
          
          // General message handler
          onMessage?.(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      socketRef.current = ws;
    } catch (err) {
      console.error('Failed to connect to WebSocket:', err);
      setError('Failed to connect to WebSocket');
      setIsConnecting(false);
      
      // Attempt to reconnect if enabled
      if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current += 1;
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    }
  }, [url, onOpen, onClose, onError, onMessage, onStatusChange, onChunk, autoReconnect, reconnectInterval, maxReconnectAttempts]);

  // Disconnect from the WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Send a message through the WebSocket
  const sendMessage = useCallback(
    ({ message, modelId, isAgent }: SendMessageOptions) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        const payload = JSON.stringify({
          message,
          model_id: modelId,
          is_agent: isAgent,
        });
        socketRef.current.send(payload);
        return true;
      } else {
        console.warn('WebSocket not connected, attempting to reconnect...');
        connect();
        return false;
      }
    },
    [connect]
  );

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    sendMessage,
  };
} 