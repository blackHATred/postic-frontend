import { GetStatsResponse, GetPostStatsResponse, PostAnalytics } from '../models/Analytics/types';
import { getPost } from '../api/api';

/**
 * Преобразует данные из GetStatsResponse в формат PostAnalytics
 * @param data Данные от бэкенда в формате GetStatsResponse
 * @param teamId ID команды для получения дополнительных данных поста
 * @returns Массив объектов в формате PostAnalytics
 */
export const transformStatsToAnalytics = async (
  data: GetStatsResponse,
  teamId: number,
): Promise<PostAnalytics[]> => {
  const result: PostAnalytics[] = [];

  for (const postData of data.posts) {
    try {
      const postInfo = await getPost(teamId, postData.post_union_id);
      const timestamp = postInfo.post?.pub_datetime || new Date().toISOString();

      const analytics: PostAnalytics = {
        post_union_id: postData.post_union_id,
        tg_views: postData.telegram?.views || 0,
        tg_comments: postData.telegram?.comments || 0,
        tg_reactions: postData.telegram?.reactions || 0,
        vk_views: postData.vkontakte?.views || 0,
        vk_comments: postData.vkontakte?.comments || 0,
        vk_reactions: postData.vkontakte?.reactions || 0,
        user_id: postInfo.post?.user_id || 0,
        timestamp: timestamp,
      };

      result.push(analytics);
    } catch (error) {
      console.error(`Ошибка при получении данных поста ${postData.post_union_id}:`, error);
    }
  }

  return result;
};

/**
 * Преобразует данные из GetPostStatsResponse в формат PostAnalytics
 * @param data Данные от бэкенда в формате GetPostStatsResponse
 * @param teamId ID команды для получения дополнительных данных поста
 * @returns Массив объектов в формате PostAnalytics
 */
export const transformPostStatsToAnalytics = async (
  data: GetPostStatsResponse,
  teamId: number,
): Promise<PostAnalytics[]> => {
  const result: PostAnalytics[] = [];
  const groupedData: Record<number, { tg?: any; vk?: any }> = {};

  for (const item of data) {
    if (!groupedData[item.post_union_id]) {
      groupedData[item.post_union_id] = {};
    }

    groupedData[item.post_union_id][item.platform as 'tg' | 'vk'] = {
      views: item.views,
      comments: item.comments,
      reactions: item.reactions,
    };
  }

  for (const postId in groupedData) {
    try {
      const postInfo = await getPost(teamId, parseInt(postId));
      const timestamp = postInfo.post?.pub_datetime || new Date().toISOString();

      const analytics: PostAnalytics = {
        post_union_id: parseInt(postId),
        tg_views: groupedData[postId].tg?.views || 0,
        tg_comments: groupedData[postId].tg?.comments || 0,
        tg_reactions: groupedData[postId].tg?.reactions || 0,
        vk_views: groupedData[postId].vk?.views || 0,
        vk_comments: groupedData[postId].vk?.comments || 0,
        vk_reactions: groupedData[postId].vk?.reactions || 0,
        user_id: postInfo.post?.user_id || 0,
        timestamp: timestamp,
      };

      result.push(analytics);
    } catch (error) {
      console.error(`Ошибка при получении данных поста ${postId}:`, error);
    }
  }

  return result;
};
