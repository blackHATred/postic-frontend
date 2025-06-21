import { useState, useEffect, useRef } from 'react';
import { GeneratePostReq } from '../models/Post/types';
import config from '../constants/appConfig';
import { backendMockMessages, formatAsBackendSSE } from '../models/Post/tmp';
// true - моки, false - реальные данные с бэкенда
export const USE_MOCK_GENERATION = true;

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
    | 'warning'
    | 'error'
    | 'complete';
  message?: string;
  text?: string;
  final?: boolean;
  full_text?: string;
  query?: string;
  queries?: string[];
  time_context?: Record<string, unknown>;
  images?: string[] | null;
}

const DEBUG_MODE = true;
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

  const extractJsonFromSSEData = (chunk: string): StreamMessageData | null => {
    const lines = chunk.split('\n').map((line) => line.trim());
    let jsonString: string | null = null;

    for (const line of lines) {
      if (line.startsWith('data: data:')) {
        const potentialJson = line.substring('data: data:'.length).trim();
        if (potentialJson.startsWith('{') && potentialJson.endsWith('}')) {
          jsonString = potentialJson;
          break;
        }
      } else if (line.startsWith('data:')) {
        const potentialJson = line.substring('data:'.length).trim();
        if (potentialJson.startsWith('{') && potentialJson.endsWith('}')) {
          jsonString = potentialJson;
          break;
        }
      }
    }

    if (jsonString) {
      try {
        debugLog('Attempting to parse JSON string:', jsonString);
        return JSON.parse(jsonString);
      } catch (error) {
        debugLog('Ошибка парсинга JSON:', error, 'Raw JSON string:', jsonString);
        return null;
      }
    }
    debugLog('JSON data not found or invalid in chunk:', chunk);
    return null;
  };

  const startGeneration = async (req: GeneratePostReq) => {
    stopGeneration();

    setIsConnected(true);
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      if (USE_MOCK_GENERATION) {
        debugLog('Использование МОКОВ БЭКЕНДА');
        const encoder = new TextEncoder();
        const currentMockIndex = 0;

        const mockStreamGenerator = (async function* () {
          for (const messageData of backendMockMessages) {
            if (signal.aborted) {
              debugLog('Mock stream aborted by user.');
              break;
            }

            const formattedMessage = formatAsBackendSSE(messageData);
            debugLog('Mock sending formatted message chunk:', formattedMessage.trim());

            yield encoder.encode(formattedMessage);

            let delay = 100;
            if (messageData.type === 'content' && !messageData.final) {
              delay = 10;
            } else if (messageData.type === 'generation' || messageData.type === 'search') {
              delay = 300;
            }
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        })();

        // Имитируем response.body.getReader()
        const reader: ReadableStreamDefaultReader<Uint8Array> = {
          read: async () => {
            const { value, done } = await mockStreamGenerator.next();
            if (done) {
              return { value: undefined, done: true };
            }
            return { value, done: false };
          },
          releaseLock: () => {},
          cancel: async () => {
            debugLog('Mock reader cancelled.');
          },
          closed: Promise.resolve(undefined),
        };

        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        // eslint-disable-next-line no-constant-condition
        while (true) {
          if (signal.aborted) {
            debugLog('Поток прерван пользователем (в моке)');
            break;
          }

          const { value, done } = await reader.read();

          if (done) {
            debugLog('Поток завершен (в моке)');
            if (buffer.trim().length > 0) {
              const remainingData = extractJsonFromSSEData(buffer);
              if (remainingData) {
                options.onMessage(remainingData);
              }
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          debugLog('Получены данные (из мока), буфер:', buffer);

          let eventEnd = 0;
          while ((eventEnd = buffer.indexOf('\n\n')) !== -1) {
            const eventData = buffer.substring(0, eventEnd).trim();
            buffer = buffer.substring(eventEnd + 2); // +2 for \n\n

            debugLog('Обрабатываем полный блок события (из мока):', eventData);

            if (!eventData) continue;

            const data = extractJsonFromSSEData(eventData);
            if (data) {
              debugLog('Распаршенные данные (из мока):', data);
              options.onMessage(data);

              if (data.type === 'complete') {
                debugLog('Получен сигнал завершения (из мока). Закрываем поток.');
                reader.cancel(); // Завершаем имитацию потока
                setIsConnected(false);
                abortControllerRef.current = null;
                return;
              }
            } else {
              debugLog('Не удалось распарсить данные из блока (из мока):', eventData);
            }
          }
        }
      } else {
        debugLog('Отправка запроса на генерацию (реальный бэкенд):', req);
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
          const errorText = await response.text();
          throw new Error(`HTTP ошибка! Статус: ${response.status}. Ответ сервера: ${errorText}`);
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
            if (buffer.trim().length > 0) {
              const remainingData = extractJsonFromSSEData(buffer);
              if (remainingData) {
                options.onMessage(remainingData);
              }
            }
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

            const data = extractJsonFromSSEData(eventData); // Используем extractJsonFromSSEData
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
            } else {
              debugLog('Не удалось распарсить данные из блока:', eventData);
            }
          }
        }
      } // End of USE_MOCK_GENERATION else block
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
    // Логика остановки остается прежней
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsConnected(false);
  };

  useEffect(() => {
    return () => {
      stopGeneration();
    };
  }, []);

  return { isConnected, startGeneration, stopGeneration };
}
