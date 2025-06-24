import { GetStatsResponse, GetPostStatsResponse, PostAnalytics } from '../models/Analytics/types';

/**
 * Преобразует данные из GetStatsResponse в формат PostAnalytics
 * и создает записи для каждого дня в указанном периоде
 * @param data Данные от бэкенда в формате GetStatsResponse
 * @param startDate Дата начала периода
 * @param endDate Дата конца периода
 * @returns Массив объектов в формате PostAnalytics
 */
export const transformStatsToAnalytics = (
  data: GetStatsResponse,
  startDate?: Date,
  endDate?: Date,
): PostAnalytics[] => {
  const result: PostAnalytics[] = [];

  // Если даты не переданы, используем текущую дату
  const start = startDate || new Date();
  const end = endDate || new Date();

  if (end < start) {
    end.setTime(start.getTime());
  }

  // массив дней в указанном периоде
  const days: Date[] = [];
  const currentDate = new Date(start);
  while (currentDate <= end) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Для каждого поста создаем записи по дням
  for (const postData of data.posts) {
    for (let i = 0; i < days.length; i++) {
      const day = days[i];

      // Равномерно распределяем значения по дням (баг, а не фича)
      const totalDays = days.length;
      const dayRatio = 1 / totalDays;

      const analytics: PostAnalytics = {
        post_union_id: postData.post_union_id,
        tg_views: Math.round((postData.telegram?.views || 0) * dayRatio),
        tg_comments: Math.round((postData.telegram?.comments || 0) * dayRatio),
        tg_reactions: Math.round((postData.telegram?.reactions || 0) * dayRatio),
        vk_views: Math.round((postData.vkontakte?.views || 0) * dayRatio),
        vk_comments: Math.round((postData.vkontakte?.comments || 0) * dayRatio),
        vk_reactions: Math.round((postData.vkontakte?.reactions || 0) * dayRatio),
        user_id: 0,
        timestamp: day.toISOString(),
      };

      result.push(analytics);
    }

    /*
    // для работы с моками
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const randomFactor = 0.8 + Math.random() * 0.4;

      const tgViewsPerDay = Math.round(
        ((postData.telegram?.views || 0) / totalDays) * randomFactor,
      );
      const tgCommentsPerDay = Math.round(
        ((postData.telegram?.comments || 0) / totalDays) * randomFactor,
      );
      const tgReactionsPerDay = Math.round(
        ((postData.telegram?.reactions || 0) / totalDays) * randomFactor,
      );

      const vkViewsPerDay = Math.round(
        ((postData.vkontakte?.views || 0) / totalDays) * randomFactor,
      );
      const vkCommentsPerDay = Math.round(
        ((postData.vkontakte?.comments || 0) / totalDays) * randomFactor,
      );
      const vkReactionsPerDay = Math.round(
        ((postData.vkontakte?.reactions || 0) / totalDays) * randomFactor,
      );

      const analytics: PostAnalytics = {
        post_union_id: postData.post_union_id,
        tg_views: tgViewsPerDay,
        tg_comments: tgCommentsPerDay,
        tg_reactions: tgReactionsPerDay,
        vk_views: vkViewsPerDay,
        vk_comments: vkCommentsPerDay,
        vk_reactions: vkReactionsPerDay,
        user_id: 0,
        timestamp: day.toISOString(),
      };

      result.push(analytics);
    }
    */
  }

  return result;
};

export const transformPostStatsToAnalytics = (data: GetPostStatsResponse): PostAnalytics[] => {
  const result: PostAnalytics[] = [];
  const groupedData: Record<number, Record<string, any>> = {};

  for (const item of data) {
    if (!groupedData[item.post_union_id]) {
      groupedData[item.post_union_id] = {};
    }

    const platformKey =
      item.platform.toLowerCase() === 'telegram'
        ? 'tg'
        : item.platform.toLowerCase() === 'vkontakte' || item.platform.toLowerCase() === 'vk'
          ? 'vk'
          : item.platform.toLowerCase();

    groupedData[item.post_union_id][platformKey] = {
      views: item.views,
      comments: item.comments,
      reactions: item.reactions,
    };
  }

  for (const postId in groupedData) {
    const timestamp = new Date().toISOString();

    const analytics: PostAnalytics = {
      post_union_id: parseInt(postId),
      tg_views: groupedData[postId].tg?.views || 0,
      tg_comments: groupedData[postId].tg?.comments || 0,
      tg_reactions: groupedData[postId].tg?.reactions || 0,
      vk_views: groupedData[postId].vk?.views || 0,
      vk_comments: groupedData[postId].vk?.comments || 0,
      vk_reactions: groupedData[postId].vk?.reactions || 0,
      user_id: 0,
      timestamp: timestamp,
    };

    result.push(analytics);
  }

  return result;
};

/**
 * Генерирует моковые данные для графиков аналитики
 * @param days Количество дней для генерации данных
 * @param hasTelegram Флаг наличия данных Телеграм
 * @param hasVk Флаг наличия данных ВКонтакте
 * @returns Массив объектов PostAnalytics с моковыми данными
 */
export const generateMockAnalyticsData = (
  days = 7,
  hasTelegram = true,
  hasVk = true,
): PostAnalytics[] => {
  const result: PostAnalytics[] = [];
  const baseDate = new Date();

  const postCount = 5;

  for (let postIndex = 0; postIndex < postCount; postIndex++) {
    const baseViews = 500 + Math.floor(Math.random() * 2500); // от 500 до 3000
    const baseComments = 10 + Math.floor(Math.random() * 140); // от 10 до 150
    const baseReactions = 20 + Math.floor(Math.random() * 280); // от 20 до 300

    const amplitude = 0.4 + Math.random() * 0.6; // Амплитуда колебаний (от 0.4 до 1.0)
    const frequency = 1 + Math.random() * 2; // Частота колебаний (от 1 до 3)
    const phase = Math.random() * Math.PI * 2; // Случайная фаза (0 до 2π)

    const eventDay = Math.floor(Math.random() * days);
    const eventMultiplier = 1.5 + Math.random() * 1.5; // от 1.5 до 3.0

    const vkCorrelation = 0.7 + Math.random() * 0.5; // от 0.7 до 1.2
    const vkPhaseShift = (Math.random() * Math.PI) / 2; // небольшой сдвиг фазы

    for (let i = 0; i < days; i++) {
      const day = new Date(baseDate);
      day.setDate(day.getDate() - (days - 1) + i);

      const tgWave = Math.sin((i / days) * Math.PI * frequency * 2 + phase) * amplitude + 1;
      const vkWave =
        Math.sin((i / days) * Math.PI * frequency * 2 + phase + vkPhaseShift) *
          amplitude *
          vkCorrelation +
        1;

      const tgRandom = 0.85 + Math.random() * 0.3;
      const vkRandom = 0.85 + Math.random() * 0.3;

      const tgEventFactor = i === eventDay ? eventMultiplier : 1;
      const vkEventDay = Math.random() > 0.5 ? eventDay : Math.min(eventDay + 1, days - 1);
      const vkEventFactor = i === vkEventDay ? eventMultiplier * 0.8 : 1;

      const tgFactor = tgWave * tgRandom * tgEventFactor;
      const vkFactor = vkWave * vkRandom * vkEventFactor;

      // множители к базовым значениям
      const tgViews = hasTelegram ? Math.max(100, Math.floor(baseViews * tgFactor)) : 0;
      const tgComments = hasTelegram ? Math.floor(baseComments * tgFactor) : 0;
      const tgReactions = hasTelegram ? Math.floor(baseReactions * tgFactor) : 0;

      const vkViews = hasVk ? Math.max(80, Math.floor(baseViews * 0.7 * vkFactor)) : 0;
      const vkComments = hasVk ? Math.floor(baseComments * 0.8 * vkFactor) : 0;
      const vkReactions = hasVk ? Math.floor(baseReactions * 1.2 * vkFactor) : 0;

      result.push({
        post_union_id: 1000 + postIndex,
        tg_views: tgViews,
        tg_comments: tgComments,
        tg_reactions: tgReactions,
        vk_views: vkViews,
        vk_comments: vkComments,
        vk_reactions: vkReactions,
        user_id: 1,
        timestamp: day.toISOString(),
      });
    }
  }

  return result;
};

/**
 * Генерирует моковые данные пользовательской аналитики для KPI графиков
 * @param userCount Количество пользователей
 * @returns Массив объектов UserAnalytics с моковыми данными
 */
export const generateMockUserAnalytics = (userCount = 5): any[] => {
  const result = [];

  const userNames = [
    'Анна Петрова',
    'Сергей Иванов',
    'Екатерина Смирнова',
    'Алексей Кузнецов',
    'Мария Соколова',
    'Дмитрий Попов',
    'Ольга Лебедева',
    'Николай Новиков',
    'Татьяна Морозова',
    'Артем Волков',
  ];

  for (let i = 0; i < userCount; i++) {
    const userName = userNames[i % userNames.length];

    const baseReactions = 30 + Math.floor(Math.random() * 70); // от 30 до 100
    const baseViews = 200 + Math.floor(Math.random() * 800); // от 200 до 1000
    const baseComments = 10 + Math.floor(Math.random() * 40); // от 10 до 50
    const baseKpi = 50 + Math.floor(Math.random() * 50); // от 50 до 100

    const user = {
      user_id: i + 1,
      nickname: userName,
      username: userName.split(' ')[0],
      reactions: baseReactions,
      views: baseViews,
      comments: baseComments,
      kpi: baseKpi,
      kpiDetails: {
        posts: 50 + Math.floor(Math.random() * 50),
        engagement: 40 + Math.floor(Math.random() * 60),
        reactions: baseReactions,
        comments: baseComments,
        views: baseViews,
      },
    };

    result.push(user);
  }

  return result;
};

/**
 * Создает моковые данные для сравнения периодов
 * @returns Объект с данными для текущего и предыдущего периодов
 */
export const generateMockPeriodComparisonData = (
  hasTelegram = true,
  hasVk = true,
): { currentPeriod: PostAnalytics[]; previousPeriod: PostAnalytics[] } => {
  const currentPeriod = generateMockAnalyticsData(7, hasTelegram, hasVk).map((item) => ({
    ...item,
    tg_views: Math.floor(item.tg_views * 1.2),
    tg_comments: Math.floor(item.tg_comments * 1.15),
    tg_reactions: Math.floor(item.tg_reactions * 1.25),
    vk_views: Math.floor(item.vk_views * 1.18),
    vk_comments: Math.floor(item.vk_comments * 1.1),
    vk_reactions: Math.floor(item.vk_reactions * 1.22),
  }));

  const previousPeriod = generateMockAnalyticsData(7, hasTelegram, hasVk);

  return {
    currentPeriod,
    previousPeriod,
  };
};
