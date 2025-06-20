import dayjs from 'dayjs';
import { getPost } from '../api/api';
import { GetStatsResponse, GetPostStatsResponse, PostAnalytics } from '../models/Analytics/types';

/**
 * Преобразует данные из GetStatsResponse в формат PostAnalytics
 * и создает записи для каждого дня в указанном периоде
 * @param data Данные от бэкенда в формате GetStatsResponse
 * @param startDate Дата начала периода
 * @param endDate Дата конца периода
 * @returns Массив объектов в формате PostAnalytics
 */
export const transformStatsToAnalytics = async (
  team: number,
  data: GetStatsResponse,
  startDate?: Date,
  endDate?: Date,
): Promise<PostAnalytics[]> => {
  const result: PostAnalytics[] = [];

  // Для каждого поста создаем записи по дням
  for (const postData of data.posts) {
    const post = (await getPost(team, postData.post_union_id)).post;
    const day = dayjs(post.created_at);

    const analytics: PostAnalytics = {
      post_union_id: postData.post_union_id,
      tg_views: Math.round(postData.telegram?.views || 0),
      tg_comments: Math.round(postData.telegram?.comments || 0),
      tg_reactions: Math.round(postData.telegram?.reactions || 0),
      vk_views: Math.round(postData.vkontakte?.views || 0),
      vk_comments: Math.round(postData.vkontakte?.comments || 0),
      vk_reactions: Math.round(postData.vkontakte?.reactions || 0),
      user_id: 0,
      timestamp: day.toISOString(),
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
