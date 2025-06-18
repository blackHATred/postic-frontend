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
