import React, { useMemo } from 'react';
import { Empty } from 'antd';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import CommentTreeItem from './CommentTreeItem';
import { useComments } from './useComments';
import { createCommentTree, useCollapsedComments } from './commentTree';

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

    return tree;
  }, [filteredComments]);

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
    </div>
  );
};

export default CommentList;
