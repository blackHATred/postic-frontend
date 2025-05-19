import { Comment } from '../../../models/Comment/types';
import { useState } from 'react';

export interface CommentWithChildren extends Comment {
  children: CommentWithChildren[];
  realLevel?: number;
}

/**
 * Создает дерево комментариев из плоского массива
 * Оптимизированная версия с улучшенной производительностью
 */
export const createCommentTree = (comments: Comment[]): CommentWithChildren[] => {
  // Используем Map вместо обычного объекта для более быстрого доступа
  const commentMap = new Map<number, CommentWithChildren>();
  const roots: CommentWithChildren[] = [];

  // Первый проход: создаем объекты с children для каждого комментария
  for (const comment of comments) {
    commentMap.set(comment.id, { ...comment, children: [], realLevel: 0 });
  }

  // Второй проход: строим дерево
  for (const comment of comments) {
    const commentWithChildren = commentMap.get(comment.id)!;

    // Если это корневой комментарий (без родителя)
    if (comment.reply_to_comment_id === null || comment.reply_to_comment_id === 0) {
      roots.push(commentWithChildren);
    }
    // Если это дочерний комментарий и родитель существует
    else if (commentMap.has(comment.reply_to_comment_id)) {
      const parent = commentMap.get(comment.reply_to_comment_id)!;
      // Вычисляем реальный уровень вложенности
      commentWithChildren.realLevel = (parent.realLevel || 0) + 1;
      parent.children.push(commentWithChildren);
    }
    // Если родитель не найден (удален или по какой-то причине отсутствует)
    else {
      roots.push(commentWithChildren);
    }
  }

  // Сортируем комментарии по времени: новые в начале
  const sortByTime = (a: CommentWithChildren, b: CommentWithChildren): number =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

  // Рекурсивно сортируем дочерние комментарии
  const sortChildren = (node: CommentWithChildren): void => {
    if (node.children.length > 0) {
      node.children.sort(sortByTime);
      node.children.forEach(sortChildren);
    }
  };

  // Сортируем корневые комментарии и рекурсивно их потомков
  roots.sort(sortByTime);
  roots.forEach(sortChildren);

  return roots;
};

// Хук для управления состоянием сворачивания комментариев
export const useCollapsedComments = () => {
  const [collapsedComments, setCollapsedComments] = useState<Record<number, boolean>>({});

  const toggleCollapse = (commentId: number) => {
    setCollapsedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  return { collapsedComments, toggleCollapse };
};
