import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

interface SSEOptions {
  url: string;
  onMessage: (data: any) => void;
}

const AuthenticatedSSE: React.FC<SSEOptions> = (props: SSEOptions) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const MAX_RETRIES = 3;

  // реф для сейва значений между рендерами без вызова рендера
  const ctrlRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);

  // Функция для очистки ресурсов
  const cleanup = () => {
    if (ctrlRef.current) {
      ctrlRef.current.abort();
      ctrlRef.current = null;
    }

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    const setupSSE = () => {
      cleanup();

      if (retryCount >= MAX_RETRIES) {
        console.log(`Достигнут лимит попыток (${MAX_RETRIES}). SSE отключен.`);
        return;
      }

      try {
        ctrlRef.current = new AbortController();

        console.log(`Попытка SSE подключения №${retryCount + 1} к ${props.url}`);

        fetchEventSource(`${props.url}`, {
          method: 'get',
          credentials: 'include',
          signal: ctrlRef.current.signal,
          headers: {
            Accept: 'text/event-stream',
          },
          onmessage(ev) {
            props.onMessage(ev);
          },
          async onopen(response) {
            if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
              console.log('SSE подключение установлено');
              setIsConnected(true);
              setRetryCount(0);
            } else {
              console.warn(`SSE подключение не удалось. Статус: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);
              setIsConnected(false);

              // Планируем повторную попытку
              setRetryCount((prev) => prev + 1);
              timerRef.current = window.setTimeout(setupSSE, 2000);
            }
          },
          onerror(err) {
            console.error('SSE ошибка:', err);
            setIsConnected(false);
            // подход подход еще подход
            setRetryCount((prev) => prev + 1);
            timerRef.current = window.setTimeout(setupSSE, 2000);
          },
          onclose() {
            console.log('SSE соединение закрыто');
            setIsConnected(false);

            if (!ctrlRef.current?.signal.aborted) {
              timerRef.current = window.setTimeout(setupSSE, 2000);
            }
          },
        });
      } catch (err) {
        console.error('Ошибка при установке SSE:', err);
        setIsConnected(false);
        setRetryCount((prev) => prev + 1);
        timerRef.current = window.setTimeout(setupSSE, 2000);
      }
    };

    if (!isConnected) {
      setupSSE();
    }

    return cleanup;
  }, [props.url]);

  return null;
};

export default AuthenticatedSSE;
