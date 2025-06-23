import { useState, useEffect, useRef } from 'react';

import { GeneratePostReq } from '../models/Post/types';
import config from '../constants/appConfig'; // Убедитесь, что ваш config импортируется

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

interface GenerateStreamRequest {
  query: string;
}

const MOCK_IMAGES = [
  'https://ic.pics.livejournal.com/stalic/2762948/2293407/2293407_original.jpg',
  'https://ic.pics.livejournal.com/stalic/2762948/2292900/2292900_original.jpg',
  'https://ic.pics.livejournal.com/stalic/2762948/2294582/2294582_original.jpg',
  'https://ic.pics.livejournal.com/stalic/2762948/2294904/2294904_original.jpg',
  'https://ic.pics.livejournal.com/stalic/2762948/2295220/2295220_original.jpg',
];

const fullPostText =
  '## Домашние Пельмени - вкусно и просто!\n\nСегодня я расскажу как приготовить настоящие домашние пельмени!\n\n**Ингредиенты для теста:**\n- 500 г муки\n- 1 яйцо\n- 200 мл воды\n- Щепотка соли\n\n**Для начинки:**\n- 300 г говядины\n- 200 г свинины\n- 2 луковицы\n- Соль, перец по вкусу\n- 3 ст.л. ледяной воды\n\n**Процесс приготовления:**\n\n1. Замешиваем тесто: в миску просеиваем муку, добавляем яйцо, соль и постепенно вливаем воду. Замешиваем крутое тесто и оставляем его отдохнуть 30 минут под пленкой.\n\n2. Готовим начинку: мясо и лук пропускаем через мясорубку дважды. Добавляем соль, перец и ледяную воду. Тщательно перемешиваем.\n\n3. Раскатываем тесто тонким слоем, вырезаем кружочки, в центр каждого кладем начинку и защипываем края.\n\n4. Варим пельмени в подсоленной кипящей воде 5-7 минут после всплытия.\n\n**Подавать с:**\n- Сметаной\n- Уксусом\n- Маслом\n- Или в бульоне\n\n**Приятного аппетита!**';

export const mockMessages: StreamMessageData[] = [
  {
    type: 'status',
    message: 'Начинаем обработку запроса...',
    query: 'Напиши пост с рецептом пельменей',
  },
  {
    type: 'context',
    message: 'Контекст времени: 2025-06-17 09:52:56',
    time_context: {
      current_date: '2025-06-17',
      current_time: '09:52',
      current_datetime: '2025-06-17 09:52:56',
      day_of_week: 'вторник',
      month: 'июня',
      current_month_name: 'июня',
      year: 2025,
      current_year: '2025',
      hour: 9,
      day: 17,
      weekday_number: 2,
      is_weekend: false,
      time_of_day: 'утро',
      season: 'лето',
      timezone: 'UTC+3 (Moscow Time)',
    },
  },
  {
    type: 'status',
    message: 'Генерируем умные поисковые запросы через LLM...',
  },
  {
    type: 'queries',
    message:
      "LLM сгенерировал запросы: ['рецепт пельменей дома 2025', 'как приготовить пельмени быстро', 'простой рецепт пельменей с фото']",
    queries: [
      'рецепт пельменей дома 2025',
      'как приготовить пельмени быстро',
      'простой рецепт пельменей с фото',
    ],
  },
  {
    type: 'search',
    message: 'Поиск 1/3: рецепт пельменей дома 2025',
  },
  {
    type: 'search_result',
    message: 'Найдено 9 результатов для: рецепт пельменей дома 2025',
  },
  {
    type: 'search',
    message: 'Поиск 2/3: как приготовить пельмени быстро',
  },
  {
    type: 'search_result',
    message: 'Найдено 7 результатов для: как приготовить пельмени быстро',
  },
  {
    type: 'search',
    message: 'Поиск 3/3: простой рецепт пельменей с фото',
  },
  {
    type: 'search_result',
    message: 'Найдено 12 результатов для: простой рецепт пельменей с фото',
  },
  {
    type: 'processing',
    message: 'Обработано материалов: 3 блоков',
  },
  {
    type: 'generation',
    message: 'Генерируем финальный ответ через LLM...',
  },
  { type: 'content', text: '##', final: false },
  { type: 'content', text: ' До', final: false },
  { type: 'content', text: 'маш', final: false },
  { type: 'content', text: 'ние', final: false },
  { type: 'content', text: ' Пе', final: false },
  { type: 'content', text: 'ль', final: false },
  { type: 'content', text: 'мени', final: false },
  { type: 'content', text: ' - ', final: false },
  { type: 'content', text: 'вкус', final: false },
  { type: 'content', text: 'но', final: false },
  { type: 'content', text: ' и ', final: false },
  { type: 'content', text: 'прос', final: false },
  { type: 'content', text: 'то', final: false },
  { type: 'content', text: '!', final: false },
  { type: 'content', text: '\n\n', final: false },
  { type: 'content', text: 'Се', final: false },
  { type: 'content', text: 'год', final: false },
  { type: 'content', text: 'ня ', final: false },
  { type: 'content', text: 'я', final: false },
  { type: 'content', text: ' рас', final: false },
  { type: 'content', text: 'ска', final: false },
  { type: 'content', text: 'жу', final: false },
  { type: 'content', text: ' как', final: false },
  { type: 'content', text: ' при', final: false },
  { type: 'content', text: 'гото', final: false },
  { type: 'content', text: 'вить', final: false },
  { type: 'content', text: ' на', final: false },
  { type: 'content', text: 'сто', final: false },
  { type: 'content', text: 'ящие', final: false },
  { type: 'content', text: ' до', final: false },
  { type: 'content', text: 'маш', final: false },
  { type: 'content', text: 'ние', final: false },
  { type: 'content', text: ' пе', final: false },
  { type: 'content', text: 'льме', final: false },
  { type: 'content', text: 'ни!', final: false },
  {
    type: 'content',
    text: '',
    final: true,
    full_text: fullPostText,
    images: [
      'https://images.news.ru/2025/06/08/Lk2uWn5bJ1lkfZYKiRotqI39jD979346HJoIp868_450.png',
      'https://images.news.ru/2025/06/07/f2TEPM2JVY2gfw08mV5S2mPLfL4kzpsCOMxUzKkw_450.png',
      'https://pp.userapi.com/94aVrHyY-wHPkZnMULeXIFx8l7bTfrHK4yPPBA/QulWsGFAn5k.png',
    ],
  },
  {
    type: 'complete',
    message: 'Генерация завершена',
  },
];

/**
 * Хук для использования потоковой генерации текста (SSE-подобный подход через Fetch API POST)
 */
export function useGenerationSSE(options: {
  onMessage: (data: StreamMessageData) => void;
  onError?: (error: Event | Error) => void; // Изменили тип ошибки
}) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null); // Для отмены Fetch запроса
  const mockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mockIndexRef = useRef<number>(0);

  const sendNextMockMessage = () => {
    if (mockIndexRef.current < mockMessages.length) {
      const message = mockMessages[mockIndexRef.current];
      options.onMessage(message);
      mockIndexRef.current++;

      let delay = 500;
      if (message.type === 'content' && !message.final) {
        delay = 50;
      } else if (message.type === 'generation' || message.type === 'search') {
        delay = 1000;
      }

      mockTimerRef.current = setTimeout(sendNextMockMessage, delay);
    } else {
      mockIndexRef.current = 0;
      mockTimerRef.current = null;
      setIsConnected(false);
    }
  };

  const startGeneration = async (req: GeneratePostReq) => {
    // Сделали функцию асинхронной
    stopGeneration();

    if (USE_MOCK_GENERATION) {
      setIsConnected(true);
      mockIndexRef.current = 0;
      mockTimerRef.current = setTimeout(sendNextMockMessage, 200);
    } else {
      setIsConnected(true);
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        const response = await fetch(`${config.api.baseURL}/posts/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            team_id: req.team_id,
            query: req.query,
          }),
          signal: signal, // AbortController
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        // eslint-disable-next-line no-constant-condition
        while (true) {
          if (signal.aborted) {
            break;
          }

          const { value, done } = await reader.read();
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          let lineEnd;
          while ((lineEnd = buffer.indexOf('\n\n')) !== -1) {
            const messageChunk = buffer.substring(0, lineEnd);
            buffer = buffer.substring(lineEnd + 2); // +2 для '\n\n'

            if (messageChunk.startsWith('data:')) {
              const jsonString = messageChunk.substring(5).trim();
              try {
                const data: StreamMessageData = JSON.parse(jsonString);
                options.onMessage(data);

                if (data.type === 'complete') {
                  reader.cancel();
                  setIsConnected(false);
                  abortControllerRef.current = null;
                  return;
                }
              } catch (parseError) {
                console.error(
                  'Ошибка парсинга JSON из потока:',
                  parseError,
                  'Raw data:',
                  jsonString,
                );
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.warn('Fetch aborted by user.');
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
