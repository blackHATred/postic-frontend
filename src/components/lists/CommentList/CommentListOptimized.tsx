import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { Divider, Empty, Spin, Typography, message } from 'antd';
import { useCollapsedComments } from './commentTree';
import CommentTreeItem from './CommentTreeItem';
import { addComment, setComments } from '../../../stores/commentSlice';
import { getSseUrl } from '../../../constants/appConfig';
import { useAuthenticatedSSE } from '../../../api/newSSE';
import { getComment, getComments } from '../../../api/api';

const { Text } = Typography;

// Размер партии загружаемых комментариев
const BATCH_SIZE = 10;

interface CommentListOptimizedProps {
  postId?: number;
  isDetailed?: boolean;
}

const CommentListOptimized: React.FC<CommentListOptimizedProps> = ({ postId }) => {
  const dispatch = useAppDispatch();
  const teamId = useAppSelector((state) => state.teams.globalActiveTeamId);
  const comments = useAppSelector((state) => state.comments.comments);
  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);
  const effectivePostId = postId !== undefined ? postId : selectedPostId;

  const { collapsedComments, toggleCollapse } = useCollapsedComments();

  const [isInitialLoading, setIsInitialLoading] = useState(false); // Изменил начальное значение на false
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [lastCommentDate, setLastCommentDate] = useState<string | null>(null);
  const [loadingMessageKey, setLoadingMessageKey] = useState<string | null>(null);
  const [initialLoadTriggered, setInitialLoadTriggered] = useState(false); // Добавил флаг для отслеживания первой загрузки

  // Контейнер для скролла
  const containerRef = useRef<HTMLDivElement>(null);
  // Реф для отслеживания предыдущего постИД, чтобы избежать повторных загрузок
  const prevPostIdRef = useRef<number | undefined>(undefined);

  // Обработка новых комментариев через SSE
  const [newComment, setNewComment] = useState<any>();
  const url = getSseUrl(teamId, effectivePostId || 0);

  const onNewComment = useCallback((data: any) => {
    setNewComment(data);
  }, []);

  // Подключаемся к SSE для получения новых комментариев в реальном времени
  useAuthenticatedSSE({
    url,
    onMessage: onNewComment,
  });

  // Оптимизация collapse: мемоизированный обработчик
  const memoizedToggleCollapse = useCallback(
    (id: number) => {
      toggleCollapse(id);
    },
    [toggleCollapse],
  );

  // Рендерим все комментарии в обычном потоке с мемоизацией
  const commentElements = useMemo(() => {
    return comments.comments.map((comment) => (
      <CommentTreeItem
        key={comment.id}
        comment={comment}
        level={0}
        isCollapsed={!!collapsedComments[comment.id]}
        onToggleCollapse={memoizedToggleCollapse}
        collapsedComments={collapsedComments}
      />
    ));
  }, [comments.comments, collapsedComments, memoizedToggleCollapse]);

  // Добавление нового комментария, полученного через SSE
  useEffect(() => {
    if (newComment) {
      getComment(teamId, newComment.comment_id)
        .then((data) => {
          dispatch(addComment(data.comment));
          message.success({
            content: 'Получен новый комментарий',
            key: 'newComment',
            duration: 2,
          });
        })
        .catch((error) => {
          console.error('Ошибка при получении нового комментария:', error);
        });
    }
  }, [newComment, dispatch, teamId]);

  // Загрузка комментариев с сохранением позиции скролла
  const loadComments = useCallback(
    async (isInitial: boolean) => {
      // Если происходит первичная загрузка, но флаг уже установлен - предотвращаем повторную загрузку
      if (isInitial && isInitialLoading) {
        return;
      }

      // Сохраняем текущую позицию скролла перед загрузкой
      let prevScrollTop = 0;
      let currentScrolledDistance = 0; // Расстояние, на которое пользователь уже проскроллил

      if (!isInitial && containerRef.current) {
        const container = containerRef.current;
        prevScrollTop = container.scrollTop;
        // Также запоминаем, сколько контента пользователь уже проскроллил
        currentScrolledDistance = prevScrollTop;

        // Теперь мы НЕ используем флаг wasAtBottom, который вызывал проблемы
      }

      if (isInitial) {
        setIsInitialLoading(true);
        const key = 'loadingComments_' + Date.now();
        setLoadingMessageKey(key);
        message.loading({
          content: 'Загрузка комментариев...',
          key,
          duration: 0,
        });
      } else {
        setIsLoadingMore(true);
        const key = 'loadingMoreComments_' + Date.now();
        setLoadingMessageKey(key);
        message.loading({
          content: 'Загрузка дополнительных комментариев...',
          key,
          duration: 0,
        });
      }

      try {
        // Для первичной загрузки используем текущую дату в качестве offset
        const offset = isInitial ? new Date().toISOString() : lastCommentDate;
        const res = await getComments(
          teamId,
          effectivePostId || 0,
          BATCH_SIZE,
          offset || undefined,
          true, // before = true для загрузки более старых комментариев
          undefined,
        );

        const newComments = res.comments || [];

        // Обновляем состояние
        if (isInitial) {
          dispatch(setComments(newComments));

          if (loadingMessageKey) {
            if (newComments.length > 0) {
              message.success({
                content: `Загружено ${newComments.length} комментариев`,
                key: loadingMessageKey,
                duration: 2,
              });
            } else {
              message.info({
                content: 'Комментарии не найдены',
                key: loadingMessageKey,
                duration: 2,
              });
            }
          }
        } else if (newComments.length > 0) {
          dispatch(setComments([...comments.comments, ...newComments]));

          if (loadingMessageKey) {
            message.success({
              content: `Загружено ещё ${newComments.length} комментариев`,
              key: loadingMessageKey,
              duration: 2,
            });
          }
        } else if (loadingMessageKey) {
          message.info({
            content: 'Больше комментариев нет',
            key: loadingMessageKey,
            duration: 2,
          });
        }

        // Обновляем флаг наличия дополнительных комментариев
        setHasMoreComments(newComments.length === BATCH_SIZE);

        // Запоминаем дату последнего комментария для пагинации
        if (newComments.length > 0) {
          const lastComment = newComments[newComments.length - 1];
          setLastCommentDate(lastComment.created_at);
        }
      } catch (error) {
        console.error('Ошибка при загрузке комментариев:', error);
        if (loadingMessageKey) {
          message.error({
            content: 'Не удалось загрузить комментарии',
            key: loadingMessageKey,
            duration: 3,
          });
        }
      } finally {
        if (isInitial) {
          setInitialLoadTriggered(true); // Помечаем, что первичная загрузка была выполнена
        }
        setIsInitialLoading(false);
        setIsLoadingMore(false);

        // Восстановление позиции прокрутки после обновления DOM
        if (!isInitial && containerRef.current) {
          // Используем setTimeout + requestAnimationFrame для гарантированного выполнения после перерисовки DOM
          setTimeout(() => {
            requestAnimationFrame(() => {
              const container = containerRef.current;
              if (!container) return;
              // Сохраняем абсолютную позицию скролла, а не пропорцию, что предотвращает "прыжки" при загрузке
              container.scrollTop = currentScrolledDistance;
            });
          }, 10); // Небольшая задержка для гарантии завершения всех обновлений DOM
        }
      }
    },
    [
      teamId,
      effectivePostId,
      lastCommentDate,
      comments.comments,
      dispatch,
      loadingMessageKey,
      isInitialLoading,
    ],
  );

  // Первичная загрузка комментариев
  useEffect(() => {
    // Проверяем изменение ID поста для предотвращения повторных загрузок
    if (effectivePostId && effectivePostId !== prevPostIdRef.current) {
      prevPostIdRef.current = effectivePostId;
      // Сбрасываем состояние при изменении поста
      setLastCommentDate(null);
      setHasMoreComments(true);
      setInitialLoadTriggered(false); // Сбрасываем флаг при смене поста
      loadComments(true);
    }
  }, [effectivePostId, loadComments]);

  // Расширенный обработчик скролла для подгрузки новых комментариев с защитой от "дребезга"
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoadingMore || !hasMoreComments) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const scrollPosition = scrollHeight - scrollTop - clientHeight;

    // Увеличиваем порог срабатывания загрузки новых комментариев до 1px
    // Это обеспечит более заблаговременную подгрузку комментариев
    if (scrollPosition < 1) {
      loadComments(false);
    }
  }, [isLoadingMore, hasMoreComments, loadComments]);

  // Мемоизируем показ загрузки
  const isLoading = isInitialLoading && initialLoadTriggered;

  return (
    <div ref={containerRef} className={styles.postListContainer} onScroll={handleScroll}>
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Spin className={styles.spinner} size='large' />
        </div>
      ) : commentElements.length === 0 ? (
        <Empty className={styles.empty} description={<span>Нет комментариев</span>} />
      ) : (
        <>
          {commentElements}

          {isLoadingMore && (
            <div className={styles.loadingMore}>
              <Spin className={styles.spinner} />
            </div>
          )}

          {!hasMoreComments && comments.comments.length > 0 && (
            <Divider className={styles.endDivider}>
              <Text type='secondary'>Конец комментариев</Text>
            </Divider>
          )}
        </>
      )}
    </div>
  );
};

export default React.memo(CommentListOptimized);
