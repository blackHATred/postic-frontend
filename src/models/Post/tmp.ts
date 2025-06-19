import { StreamMessageData } from '../../api/generationSSE';

function escapeRu(str: string): string {
  return str.replace(/[\u0400-\u04FF]/g, (char) => {
    return '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
  });
}

export function formatAsBackendSSE(data: StreamMessageData): string {
  const jsonString = JSON.stringify(data);
  const escapedJsonString = jsonString;

  return `id: \ndata: data: ${escapedJsonString}\ndata: \nevent: message\n\n`;
}

const MOCK_IMAGES_FOR_SSE = [
  'https://ic.pics.livejournal.com/stalic/2762948/2293407/2293407_original.jpg',
  'https://ic.pics.livejournal.com/stalic/2762948/2292900/2292900_original.jpg',
  'https://ic.pics.livejournal.com/stalic/2762948/2294582/2294582_original.jpg',
];

const MOCK_FULL_POST_TEXT = `## Нейросети для генерации текста в 2025 году: ваш бесплатный помощник

2025 год – это эпоха повсеместного использования нейросетей, и генерация текста не исключение. Если вы ищете инструменты, которые помогут вам создавать контент быстро и эффективно, то вот топ бесплатных решений:

**1. OpenAI ChatGPT (бесплатная версия):** Продолжает быть одним из лидеров. Идеален для создания черновиков, идей, коротких статей, постов для соцсетей. Его универсальность делает его незаменимым помощником.

**2. Google Gemini (бесплатная версия):** Мощный конкурент от Google, предлагающий глубокое понимание контекста и способность генерировать качественный текст на различные темы.

**3. Microsoft Copilot:** Интегрированный в продукты Microsoft, он становится все более доступным. Поможет с написанием писем, отчетов, презентаций.

**4. Jasper (с ограничениями в бесплатной версии):** Хотя Jasper в основном коммерческий, у него бывают бесплатные пробные периоды или ограниченные бесплатные планы, которые стоит изучить. Отлично подходит для маркетинговых текстов.

**5. Writesonic (бесплатный план):** Предлагает бесплатный план с ограниченным количеством слов, но с доступом к многим функциям, таким как создание рекламных текстов, заголовков и описаний продуктов.

Эти инструменты значительно упрощают процесс создания контента, экономят время и помогают добиться более высокого качества. Начните использовать их сегодня, чтобы оставаться на шаг впереди!

`;

export const backendMockMessages: StreamMessageData[] = [
  {
    type: 'status',
    message: 'Начинаем обработку запроса...',
    query: 'аааа текст сгенерируй',
  },
  {
    type: 'context',
    message: 'Контекст времени: 2025-06-19 16:41:23',
    time_context: {
      current_date: '2025-06-19',
      current_time: '16:41',
      current_datetime: '2025-06-19 16:41:23',
      day_of_week: 'четверг',
      month: 'июня',
      current_month_name: 'июня',
      year: 2025,
      current_year: '2025',
      hour: 16,
      day: 19,
      weekday_number: 4,
      is_weekend: false,
      time_of_day: 'день',
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
      "LLM сгенерировал запросы: ['Что такое ssss?', 'Смысл слова ssss', 'ssss: определение и значение']",
    queries: ['Что такое ssss?', 'Смысл слова ssss', 'ssss: определение и значение'],
  },
  {
    type: 'search',
    message: 'Поиск 1/3: Что такое ssss?',
  },
  {
    type: 'search_result',
    message: 'Найдено 2 результатов для: Что такое ssss?',
  },
  {
    type: 'search',
    message: 'Поиск 2/3: Смысл слова ssss',
  },
  {
    type: 'search_result',
    message: 'Найдено 3 результатов для: Смысл слова ssss',
  },
  {
    type: 'search',
    message: 'Поиск 3/3: ssss: определение и значение',
  },
  {
    type: 'search_result',
    message: 'Найдено 2 результатов для: ssss: определение и значение',
  },
  {
    type: 'processing',
    message: 'Обработано материалов: 3 блоков',
  },
  {
    type: 'generation',
    message: 'Генерируем финальный ответ через LLM...',
    images: null,
  },
  ...MOCK_FULL_POST_TEXT.split('').map((char, index, arr) => ({
    type: 'content' as const,
    text: char,
    final: index === arr.length - 1,
    full_text: index === arr.length - 1 ? MOCK_FULL_POST_TEXT : undefined,
    images: index === arr.length - 1 ? MOCK_IMAGES_FOR_SSE : undefined,
  })),
  {
    type: 'complete',
    message: 'Генерация завершена',
  },
];
