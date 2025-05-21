import { GetStatsResponse, GetPostStatsResponse, PostAnalytics } from '../models/Analytics/types';

/**
 * Преобразует данные из GetStatsResponse в формат PostAnalytics
 * без дополнительного запроса данных поста
 * @param data Данные от бэкенда в формате GetStatsResponse
 * @returns Массив объектов в формате PostAnalytics
 */
export const transformStatsToAnalytics = (data: GetStatsResponse): PostAnalytics[] => {
  const result: PostAnalytics[] = [];

  for (const postData of data.posts) {
    const timestamp = new Date().toISOString();

    const analytics: PostAnalytics = {
      post_union_id: postData.post_union_id,
      tg_views: postData.telegram?.views || 0,
      tg_comments: postData.telegram?.comments || 0,
      tg_reactions: postData.telegram?.reactions || 0,
      vk_views: postData.vkontakte?.views || 0,
      vk_comments: postData.vkontakte?.comments || 0,
      vk_reactions: postData.vkontakte?.reactions || 0,
      user_id: 0,
      timestamp: timestamp,
    };

    result.push(analytics);
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
