import React, { useMemo } from 'react';
import { Button, Empty } from 'antd';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import CommentTreeItem from './CommentTreeItem';
import { useComments } from './useComments';
import { CommentWithChildren, createCommentTree, useCollapsedComments } from './commentTree';
import { Comment } from '../../../models/Comment/types';

interface CommentListProps {
  postId?: number;
  isDetailed?: boolean;
}

const CommentList: React.FC<CommentListProps> = ({ postId, isDetailed }) => {
  const dispatch = useAppDispatch();
  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);
  const { filteredComments, loading } = useComments(postId);
  const commentsData = useAppSelector((state) => state.comments.comments);
  const { collapsedComments, toggleCollapse } = useCollapsedComments();

  // Создаем дерево комментариев
  const commentTree = useMemo(() => {
    const tree = createCommentTree(filteredComments);

    // Логируем дерево комментариев в более читабельном виде
    console.log(
      'Дерево комментариев:',
      JSON.stringify(
        tree,
        (key, value) => {
          if (key === 'children') {
            return value.map((child: CommentWithChildren) => ({
              id: child.id,
              text: child.text.substring(0, 30) + (child.text.length > 30 ? '...' : ''),
              reply_to: child.reply_to_comment_id,
              children_count: child.children.length,
            }));
          }
          return value;
        },
        2,
      ),
    );

    return tree;
  }, [filteredComments]);

  // Функция отладки для вывода структуры комментариев
  const debugComments = () => {
    console.group('🔍 ОТЛАДКА КОММЕНТАРИЕВ');

    console.log('📊 Все комментарии в store:', commentsData.comments);
    console.log('🔍 Отфильтрованные комментарии:', filteredComments);
    console.log('🌳 Дерево комментариев:', commentTree);

    // Анализ вложенности
    const replyStructure: Record<number, Array<{ id: number; text: string }>> = {};

    filteredComments.forEach((c: Comment) => {
      if (c.reply_to_comment_id) {
        if (!replyStructure[c.reply_to_comment_id]) {
          replyStructure[c.reply_to_comment_id] = [];
        }
        replyStructure[c.reply_to_comment_id].push({
          id: c.id,
          text: c.text.substring(0, 20),
        });
      }
    });

    console.log('👪 Структура ответов (комментарий -> [ответы]):', replyStructure);

    // Анализ по уровням вложенности
    const commentsByLevel: Record<number, Comment[]> = { 0: [] };

    const findLevel = (comment: Comment, level = 0): number => {
      if (!comment.reply_to_comment_id) return 0;

      const parentComment = filteredComments.find((c) => c.id === comment.reply_to_comment_id);
      return parentComment ? findLevel(parentComment, level + 1) + 1 : 0;
    };

    filteredComments.forEach((comment) => {
      const level = findLevel(comment);
      if (!commentsByLevel[level]) commentsByLevel[level] = [];
      commentsByLevel[level].push(comment);
    });

    console.log('Комментарии по уровням вложенности:', commentsByLevel);
    console.groupEnd();
  };

  return (
    <div className={styles.commentListContainer}>
      {commentTree.length > 0 ? (
        <div className={styles.commentTreeContainer}>
          {commentTree.map((comment) => (
            <CommentTreeItem
              key={comment.id}
              comment={comment}
              level={0}
              isCollapsed={!!collapsedComments[comment.id]}
              onToggleCollapse={toggleCollapse}
              collapsedComments={collapsedComments}
            />
          ))}
        </div>
      ) : (
        <Empty
          description={loading ? 'Загрузка комментариев...' : 'Комментарии отсутствуют'}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      {/* Кнопка отладки */}
      <Button onClick={debugComments} style={{ marginBottom: 10 }} type='dashed'>
        Отладить комментарии
      </Button>
    </div>
  );
};

export default CommentList;
