import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { addComment, addComments, getLastDate } from '../../../stores/commentSlice';
import { getSseUrl } from '../../../constants/appConfig';
import { getComment, getComments } from '../../../api/api';
import { useAuthenticatedSSE } from '../../../api/newSSE';
import { routes } from '../../../app/App.routes';
import { useLocation } from 'react-router-dom';

export const useComments = (postId?: number) => {
  const dispatch = useAppDispatch();
  const comments = useAppSelector((state) => state.comments.comments);
  const last_date = useAppSelector(getLastDate);
  const [loading, setLoading] = useState(false);
  const requestSize = 20;
  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);
  const selectedTeamId = useAppSelector((state) => state.teams.globalActiveTeamId);
  const effectivePostId = postId || selectedPostId;
  const activeTab = useAppSelector((state) => state.basePageDialogs.activeTab);
  const activeTicketFilter = useAppSelector((state) => state.comments.ticketFilter);
  const location = useLocation();

  const url = getSseUrl(selectedTeamId, selectedPostId || 0);

  const filteredComments = comments.comments
    ? selectedPostId !== 0
      ? comments.comments.filter(
          (comment) =>
            comment.post_union_id === Number(selectedPostId) ||
            (comment.reply_to_comment_id !== null && comment.reply_to_comment_id !== 0),
        )
      : comments.comments
    : [];

  const newComment = (data: any) => {
    if (data.type === 'new') {
      getComment(selectedTeamId, data.comment_id).then((data) => {
        dispatch(addComment(data.comment));
      });
    }
  };

  const { isConnected, close } = useAuthenticatedSSE({ url, onMessage: newComment });

  useEffect(() => {
    if (!effectivePostId || !selectedTeamId) return;

    setLoading(true);

    if (location.pathname === routes.ticket()) {
      console.log('Загрузка комментариев с  тикет');
      getComments(selectedTeamId, effectivePostId, 20, last_date, true)
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
    } else {
      console.log('Загрузка комментариев без фильтра');
      getComments(selectedTeamId, effectivePostId, requestSize, last_date)
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
    }
  }, [effectivePostId, selectedTeamId]);

  useEffect(() => {
    const union_id = selectedPostId ? Number(selectedPostId) : 0;

    if (filteredComments.length < requestSize) {
      if (location.pathname === routes.ticket() && activeTicketFilter === 'done') {
        console.log('Загрузка2 комментариев с фильтром done');
        getComments(selectedTeamId, union_id, requestSize, last_date, false)
          .then((val) => {
            if (val.comments) {
              dispatch(addComments(val.comments));
            }
          })
          .catch((error) => {
            console.error(
              'Ошибка при загрузке комментариев:',
              error.response?.data || error.message,
            );
          });
      }
      if (location.pathname === routes.ticket() && activeTicketFilter === 'not_done') {
        console.log('Загрузка2 комментариев с фильтром not_done');
        getComments(selectedTeamId, union_id, requestSize, last_date, true)
          .then((val) => {
            if (val.comments) {
              dispatch(addComments(val.comments));
            }
          })
          .catch((error) => {
            console.error(
              'Ошибка при загрузке комментариев:',
              error.response?.data || error.message,
            );
          });
      } else {
        console.log('Загрузка2 комментариев без фильтра');
        getComments(selectedTeamId, union_id, requestSize, last_date)
          .then((val) => {
            if (val.comments) {
              dispatch(addComments(val.comments));
            }
          })
          .catch((error) => {
            console.error(
              'Ошибка при загрузке комментариев:',
              error.response?.data || error.message,
            );
          });
      }
    }

    return () => {
      close();
    };
  }, []);

  return { filteredComments, activeTicketFilter, loading, isConnected };
};
