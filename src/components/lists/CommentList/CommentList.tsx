import React, { useEffect, useMemo, useState } from 'react';
import { Breadcrumb, Empty, Typography, Button } from 'antd';
import CommentComponent from '../../cards/Comment/Comment';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { addComment, addComments, getLastDate } from '../../../stores/commentSlice';
import { getComment, getComments } from '../../../api/api';
import { getSseUrl } from '../../../constants/appConfig';
import { setActiveTab } from '../../../stores/basePageDialogsSlice';
import { setScrollToPost } from '../../../stores/postsSlice';
import { useAuthenticatedSSE } from '../../../api/newSSE';
import { Comment, mockComments } from '../../../models/Comment/types';
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';

// уровень вложенности для отображения
const MAX_NESTING_LEVEL = 4;

interface CommentListProps {
  postId?: number;
  isDetailed?: boolean;
}

interface CommentWithChildren extends Comment {
  children: CommentWithChildren[];
  realLevel?: number;
}

const CommentList: React.FC<CommentListProps> = ({ postId, isDetailed }) => {
  const comments = mockComments;
  const last_date = useAppSelector(getLastDate);
  const dispatch = useAppDispatch();
  const requestSize = 20;
  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);
  const selectedteamid = useAppSelector((state) => state.teams.globalActiveTeamId);
  const url = getSseUrl(selectedteamid, selectedPostId || 0);
  // Получаем ID поста для фильтрации комментариев
  const effectivePostId = postId || useAppSelector((state) => state.posts.selectedPostId);
  const [loading, setLoading] = useState(false);
  // Фильтруем комментарии по ID активного поста
  const filteredComments = comments.comments.filter(
    (comment) => comment.post_union_id === effectivePostId,
  );
  // Загружаем комментарии при изменении ID поста
  useEffect(() => {
    if (!effectivePostId || !selectedteamid) return;

    setLoading(true);
    getComments(selectedteamid, effectivePostId, 20, last_date)
      .then((val) => {
        if (val.comments) {
          dispatch(addComments(val.comments));
        }
      })
      .catch((error) => {
        console.error('Ошибка при загрузке комментариев:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [effectivePostId, selectedteamid]);

  // для отслеживания свернутых комментариев
  const [collapsedComments, setCollapsedComments] = useState<Record<number, boolean>>({});

  const commentTree = useMemo(() => {
    const createTree = (comments: Comment[]) => {
      // map - хранит комментарии по их id, roots - комменты без родителя
      const map: Record<number, CommentWithChildren> = {};
      const roots: CommentWithChildren[] = [];

      // первый проход - создаем узлы
      comments.forEach((comment) => {
        map[comment.id] = { ...comment, children: [], realLevel: 0 };
      });

      // второй проходик - строим дерево комментов
      comments.forEach((comment) => {
        if (comment.reply_to_comment_id !== null && map[comment.reply_to_comment_id]) {
          // находим родительский коммент в мапе
          const parent = map[comment.reply_to_comment_id];
          // реальный уровень вложенности - на 1 больше, чем у родителя
          map[comment.id].realLevel = (parent.realLevel || 0) + 1;
          // теперь он чилдрен родителя
          parent.children.push(map[comment.id]);
        } else {
          roots.push(map[comment.id]);
        }
      });

      return roots;
    };

    return createTree(filteredComments);
  }, [filteredComments]);

  const newComment = (data: any) => {
    if (data.type == 'new') {
      getComment(selectedteamid, data.comment_id).then((data) => {
        dispatch(addComment(data.comment));
      });
    }
  };

  const { isConnected, close } = useAuthenticatedSSE({ url: url, onMessage: newComment });

  useEffect(() => {
    const union_id = selectedPostId ? Number(selectedPostId) : 0;

    if (filteredComments.length < requestSize) {
      getComments(selectedteamid, union_id, requestSize, last_date)
        .then((val) => {
          if (val.comments) {
            dispatch(addComments(val.comments));
          }
        })
        .catch((error) => {
          console.error('Ошибка при загрузке комментариев:', error.response?.data || error.message);
        });
    }
    return () => {
      close();
    };
  }, []);

  const handleBreadcrumbClick = () => {
    dispatch(setActiveTab('1'));
    dispatch(setScrollToPost(true));
  };

  // сворачивание
  const toggleCollapse = (commentId: number) => {
    setCollapsedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Мемоизируем компонент для отображения одного комментария, чтобы улучшить производительность
  const CommentItem = React.memo(
    ({
      comment,
      level,
    }: {
      comment: CommentWithChildren;
      level: number;
      isLastInChain?: boolean;
    }) => {
      const isCollapsed = collapsedComments[comment.id];
      const hasChildren = comment.children.length > 0;
      const visibleLevel = level % MAX_NESTING_LEVEL;
      const isResetLevel = level > 0 && visibleLevel === 0;

      const levelColors = ['#ddeffd', '#BAE0FF', '#91CAFF', '#69B1FF'];
      const lineColor = levelColors[visibleLevel % levelColors.length];

      return (
        <div className={styles.commentTreeItem}>
          <div className={`${styles.commentWrapper} ${isResetLevel ? styles.resetLevel : ''}`}>
            {isResetLevel && (
              <div className={styles.continuationIndicator}>
                <div
                  className={styles.continuationLine}
                  style={{ backgroundColor: lineColor }}
                ></div>
                <span className={styles.levelInfo}>Продолжение ветки (уровень {level})</span>
              </div>
            )}
            <CommentComponent comment={comment} />
            {hasChildren && (
              <Button
                type='text'
                icon={isCollapsed ? <CaretRightOutlined /> : <CaretDownOutlined />}
                onClick={() => toggleCollapse(comment.id)}
                className={styles.collapseButton}
              >
                {isCollapsed ? 'Показать ответы' : 'Скрыть ответы'} ({comment.children.length})
              </Button>
            )}
          </div>

          {!isCollapsed && hasChildren && (
            <div
              className={styles.commentReplies}
              style={{
                borderLeft: `2px solid ${lineColor}`,
                paddingLeft: isResetLevel ? '15px' : '10px',
              }}
            >
              {comment.children.map((child, index) => (
                <CommentItem
                  key={child.id}
                  comment={child}
                  level={level + 1}
                  isLastInChain={index === comment.children.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      );
    },
  );

  return (
    <div className={styles.commentListContainer}>
      {selectedPostId != 0 && (
        <Breadcrumb className={styles['breadcrumb']}>
          <Breadcrumb.Item
            onClick={handleBreadcrumbClick}
            className={styles['breadcrumb-item-link']}
          >
            <a>{'Пост #' + selectedPostId}</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Комментарии</Breadcrumb.Item>
        </Breadcrumb>
      )}

      {commentTree.length > 0 ? (
        <div className={styles.commentTreeContainer}>
          {commentTree.map((comment) => (
            <CommentItem key={comment.id} comment={comment} level={0} />
          ))}
        </div>
      ) : (
        <Empty
          styles={{ image: { height: 60 }, root: { paddingTop: 25 } }}
          description={<Typography.Text>Нет комментариев</Typography.Text>}
        ></Empty>
      )}
    </div>
  );
};

export default CommentList;
