import { Comment } from '../../../models/Comment/types';
import { useState } from 'react';

export interface CommentWithChildren extends Comment {
  children: CommentWithChildren[];
  realLevel?: number;
}

export const createCommentTree = (comments: Comment[]) => {
  const map: Record<number, CommentWithChildren> = {};
  const roots: CommentWithChildren[] = [];

  comments.forEach((comment) => {
    map[comment.id] = { ...comment, children: [], realLevel: 0 };
  });

  const sortedComments = [...comments].sort((a, b) => {
    const aIsRoot = !a.reply_to_comment_id || a.reply_to_comment_id === 0;
    const bIsRoot = !b.reply_to_comment_id || b.reply_to_comment_id === 0;

    if (aIsRoot && !bIsRoot) return -1;
    if (!aIsRoot && bIsRoot) return 1;

    return 0;
  });

  sortedComments.forEach((comment) => {
    if (comment.reply_to_comment_id === 0 || comment.reply_to_comment_id === null) {
      roots.push(map[comment.id]);
    } else if (map[comment.reply_to_comment_id]) {
      const parent = map[comment.reply_to_comment_id];
      // вложенности ребенка - родитель + 1
      map[comment.id].realLevel = (parent.realLevel || 0) + 1;
      parent.children.push(map[comment.id]);
    } else {
      // если кто-то удалил родительский коммент или это просто что-то странное, пусть будет корневым
      roots.push(map[comment.id]);
    }
  });
  const sortNodeChildren = (node: CommentWithChildren) => {
    if (node.children.length > 0) {
      node.children.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      node.children.forEach(sortNodeChildren);
    }
  };

  roots.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  roots.forEach(sortNodeChildren);

  return roots;
};

// сворачивание
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
