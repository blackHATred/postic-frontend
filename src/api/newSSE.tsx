// hooks/useAuthenticatedSSE.ts
import { useState, useEffect, useRef } from 'react';

interface SSEOptions {
  url: string;
  onMessage: (data: any) => void;
  onError?: (error: Event) => void;
  withCredentials?: boolean;
}

export function useAuthenticatedSSE({ url, onMessage, onError, withCredentials = true }: SSEOptions): {
  isConnected: boolean;
  close: () => void;
} {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const MAX_RETRIES = 3;
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const setupSSE = async () => {
      if (retryCount >= MAX_RETRIES) {
        console.log(`Достигнут лимит попыток (${MAX_RETRIES}). SSE отключен.`);
        return;
      }
      try {
        // Create EventSource with authentication
        const eventSource = new EventSource(`${url}`, {
          withCredentials,
        });

        eventSourceRef.current = eventSource;

        eventSource.onopen = (ev) => {
          if (ev.type == 'open') {
            console.log('SSE подключение установлено');
            setIsConnected(true);
            setRetryCount(0);
          } else {
            console.warn(`SSE подключение не удалось. Статус: ${ev.type}`);
            setIsConnected(false);
            setRetryCount((prev) => prev + 1);
            setTimeout(setupSSE, 2000);
          }
        };

        eventSource.addEventListener('comment', (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch (err) {
            console.error('Failed to parse SSE data:', err);
          }
        });

        eventSource.onerror = (error) => {
          console.error('SSE ошибка:', error);

          setIsConnected(false);
          if (onError) {
            onError(error);
          }
          eventSource.close();
          setRetryCount((prev) => prev + 1);
          setTimeout(setupSSE, 5000);
        };
      } catch (err) {
        console.error('Failed to establish SSE connection:', err);
        setTimeout(setupSSE, 5000);
      }
    };

    setupSSE();
  }, []);

  useEffect(() => {
    return close;
  }, [eventSourceRef]);

  const close = () => {
    if (eventSourceRef.current) {
      console.log('close');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  };

  return { isConnected, close };
}
