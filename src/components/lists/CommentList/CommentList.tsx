import React, { useEffect } from 'react';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import CommentTreeItem from './CommentTreeItem';
import { addComment, setComments } from '../../../stores/commentSlice';
import InfiniteScroll from '../../ui/stickyScroll/batchLoadScroll';
import { CommentWithChildren, createCommentTree, useCollapsedComments } from './commentTree';
import { getSseUrl } from '../../../constants/appConfig';
import { getComment, getComments } from '../../../api/api';
import { useAuthenticatedSSE } from '../../../api/newSSE';
import dayjs from 'dayjs';
import { useLocation } from 'react-router-dom';
import { routes } from '../../../app/App.routes';

interface CommentListProps {
  postId?: number;
  isDetailed?: boolean;
}

const CommentList: React.FC<CommentListProps> = ({ postId, isDetailed }) => {
  const dispatch = useAppDispatch();
  const teamId = useAppSelector((state) => state.teams.globalActiveTeamId);
  const { collapsedComments, toggleCollapse } = useCollapsedComments();
  const comments = useAppSelector((state) => state.comments.comments);
  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);
  const selectedTeamId = useAppSelector((state) => state.teams.globalActiveTeamId);
  const effectivePostId = postId != undefined ? postId : selectedPostId;
  const activeTicketFilter = useAppSelector((state) => state.comments.ticketFilter);
  const location = useLocation();

  const isTicketPage = location.pathname === routes.ticket();

  useEffect(() => {
    if (!isDetailed) {
      dispatch(setComments([]));
    }
  }, [isTicketPage]);

  const getData = async (
    before: boolean,
    limit: number,
    last_object?: CommentWithChildren,
    top?: boolean,
  ) => {
    const union_id = effectivePostId ? effectivePostId : 0;

    let marked_as_ticket: boolean | undefined;

    if (!isTicketPage) {
      marked_as_ticket = undefined;
    } else {
      marked_as_ticket = true;
    }

    const res = await getComments(
      selectedTeamId,
      union_id,
      limit,
      last_object
        ? dayjs(
            !top && last_object.children.length > 0
              ? last_object.children[last_object.children.length - 1].created_at
              : last_object.created_at,
          )
            .utc()
            .format()
        : dayjs().utc().format(),
      before,
      marked_as_ticket,
    ).catch(() => {
      console.log('bad');
    });
    return createCommentTree(res ? (res.comments ? res.comments : []) : []);
  };

  const url = getSseUrl(selectedTeamId, selectedPostId || 0);

  const newComment = (data: any) => {
    if (data.type === 'new') {
      getComment(selectedTeamId, data.comment_id).then((data) => {
        dispatch(addComment(data.comment));
      });
    }
  };

  const { isConnected, close } = useAuthenticatedSSE({ url, onMessage: newComment });

  return (
    <div className={styles.commentListContainer}>
      {teamId != 0 && (
        <InfiniteScroll
          getObjectFromData={(comment: CommentWithChildren) => (
            <CommentTreeItem
              comment={comment}
              level={0}
              isCollapsed={!!collapsedComments[comment.id]}
              onToggleCollapse={toggleCollapse}
              collapsedComments={collapsedComments}
            />
          )}
          data={comments.comments}
          setData={(data: CommentWithChildren[]) => {
            dispatch(setComments(data));
          }}
          getNewData={getData}
          initialScroll={0}
          frame_size={3}
          empty_text={'нет комментариев'}
        />
      )}
    </div>
  );
};

export default CommentList;
