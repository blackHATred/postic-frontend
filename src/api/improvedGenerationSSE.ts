import { useState, useEffect, useRef } from 'react';
import { GeneratePostReq } from '../models/Post/types';
import config from '../constants/appConfig';

// true - моки, false - реальные данные с бэкенда
export const USE_MOCK_GENERATION = false;

export interface StreamMessageData {
  type:
    | 'status'
    | 'context'
    | 'queries'
    | 'search'
    | 'search_result'
    | 'processing'
    | 'generation'
    | 'content'
    | 'complete'
    | 'warning'
    | 'error';
  message?: string;
  text?: string;
  final?: boolean;
  full_text?: string;
  query?: string;
  queries?: string[];
  time_context?: Record<string, unknown>;
  images?: string[] | null;
}

const DEBUG_MODE = false;
function debugLog(...args: any[]) {
  if (DEBUG_MODE) {
    console.log('[SSE Debug]', ...args);
  }
}

export function useImprovedGenerationSSE(options: {
  onMessage: (data: StreamMessageData) => void;
  onError?: (error: Event | Error) => void;
}) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mockIndexRef = useRef<number>(0);

  const parseSSEMessage = (text: string): StreamMessageData | null => {
    try {
      if (text.startsWith('data: data:')) {
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonString = text.substring(jsonStart, jsonEnd + 1);
          debugLog('Извлеченный JSON из data: data:', jsonString);
          return JSON.parse(jsonString);
        }
      } else if (text.startsWith('data:')) {
        const jsonString = text.substring(5).trim();
        debugLog('Извлеченный JSON из data:', jsonString);
        return JSON.parse(jsonString);
      } else if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
        debugLog('Прямой JSON:', text.trim());
        return JSON.parse(text.trim());
      }
      return null;
    } catch (error) {
      debugLog('Ошибка парсинга:', error, 'Текст:', text);
      return null;
    }
  };

  const sendNextMockMessage = () => {
    setIsConnected(false);
  };

  const startGeneration = async (req: GeneratePostReq) => {
    stopGeneration();

    if (USE_MOCK_GENERATION) {
      setIsConnected(true);
      mockIndexRef.current = 0;
      mockTimerRef.current = setTimeout(sendNextMockMessage, 200);
      return;
    }

    try {
      setIsConnected(true);
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      debugLog('Отправка запроса на генерацию:', req);
      debugLog('URL:', `${config.api.baseURL}/posts/generate`);

      const response = await fetch(`${config.api.baseURL}/posts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_id: req.team_id,
          query: req.query,
        }),
        signal: signal,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ошибка! Статус: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Тело ответа пустое');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (signal.aborted) {
          debugLog('Поток прерван пользователем');
          break;
        }

        const { value, done } = await reader.read();

        if (done) {
          debugLog('Поток завершен');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        debugLog('Получены данные:', buffer);

        let eventEnd = 0;
        while ((eventEnd = buffer.indexOf('\n\n')) !== -1) {
          const eventData = buffer.substring(0, eventEnd).trim();
          buffer = buffer.substring(eventEnd + 2);

          debugLog('Обрабатываем событие:', eventData);

          if (!eventData) continue;

          const data = parseSSEMessage(eventData);
          if (data) {
            debugLog('Распаршенные данные:', data);
            options.onMessage(data);

            if (data.type === 'complete') {
              debugLog('Получен сигнал завершения. Закрываем поток.');
              reader.cancel();
              setIsConnected(false);
              abortControllerRef.current = null;
              return;
            }
          }
        }

        if (buffer.trim()) {
          const lines = buffer.split('\n');
          let processedUpTo = 0;

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine) {
              const data = parseSSEMessage(trimmedLine);
              if (data) {
                debugLog('Обработан JSON напрямую:', data);
                options.onMessage(data);
                processedUpTo += line.length + 1; // +1 для '\n'

                if (data.type === 'complete') {
                  debugLog('Получен сигнал завершения (прямой JSON). Закрываем поток.');
                  reader.cancel();
                  setIsConnected(false);
                  abortControllerRef.current = null;
                  return;
                }
              }
            }
          }

          if (processedUpTo > 0) {
            buffer = buffer.substring(processedUpTo);
          }
        }
      }
    } catch (err: any) {
      debugLog('Ошибка при работе с потоком:', err);
      if (err.name === 'AbortError') {
        debugLog('Запрос отменен пользователем');
      } else {
        console.error('Ошибка при создании или чтении SSE-подобного соединения:', err);
        if (options.onError) {
          options.onError(err);
        }
      }
    } finally {
      if (isConnected) {
        setIsConnected(false);
      }
      abortControllerRef.current = null;
    }
  };

  const stopGeneration = () => {
    if (USE_MOCK_GENERATION) {
      if (mockTimerRef.current) {
        clearTimeout(mockTimerRef.current);
        mockTimerRef.current = null;
      }
    } else {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }
    setIsConnected(false);
  };

  // Очистка соединения при размонтировании компонента
  useEffect(() => {
    return () => {
      stopGeneration();
    };
  }, []);

  return { isConnected, startGeneration, stopGeneration };
}
