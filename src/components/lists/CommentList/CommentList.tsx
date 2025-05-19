import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import dayjs from 'dayjs';
import { Divider, Empty, Spin, Typography } from 'antd';
import { CommentWithChildren, createCommentTree, useCollapsedComments } from './commentTree';
import { getComment, getComments } from '../../../api/api';
import CommentTreeItem from './CommentTreeItem';
import { routes } from '../../../app/App.routes';
import { addComment, setComments } from '../../../stores/commentSlice';
import { getSseUrl } from '../../../constants/appConfig';
import { useAuthenticatedSSE } from '../../../api/newSSE';

const frame_size = 10;
const { Text } = Typography;

interface CommentListProps {
  postId?: number;
  isDetailed?: boolean;
}

const CommentList: React.FC<CommentListProps> = ({ postId, isDetailed }) => {
  const dispatch = useAppDispatch();
  const teamId = useAppSelector((state) => state.teams.globalActiveTeamId);
  const comments = useAppSelector((state) => state.comments.comments);
  //const comments = mockComments;
  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);
  const effectivePostId = postId != undefined ? postId : selectedPostId;

  const isTicketPage = location.pathname === routes.ticket();
  const { collapsedComments, toggleCollapse } = useCollapsedComments();

  const scroll = useAppSelector((state) => state.posts.postsScroll);

  const [postElements, setPostElements] = useState<{ id: number; element: any }[]>([]);
  const divRef = useRef<HTMLDivElement>(null);

  const [showBottom, setShowBottom] = useState(false);

  const [hasMoreTop, setHasMoreTop] = useState(false);
  const [hasMoreBottom, setHasMoreBottom] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBottom, setIsLoadingBottom] = useState(false);
  const [isLoadingTop, setIsLoadingTop] = useState(false);

  const [atTop, setAtTop] = useState<boolean>(true);
  const [lastTop, setLastTop] = useState<number>(0);

  const [newData, setNewData] = useState<CommentWithChildren[]>([]);

  const [initialLoad, setInitialLoad] = useState<boolean>(false);

  const [last_collapse, setLastCollapsed] = useState<Record<number, boolean>>({});

  const url = getSseUrl(teamId, selectedPostId || 0);

  const [newComment, setNewComment] = React.useState<any>();

  const onNewComment = (data: any) => {
    setNewComment(data);
  };

  const { isConnected, close } = useAuthenticatedSSE({
    url,
    onMessage: onNewComment,
  });

  useEffect(() => {
    if (newComment) {
      if (!hasMoreTop)
        getComment(teamId, newComment.comment_id).then((data) => {
          dispatch(addComment(data.comment));
        });
    }
  }, [newComment]);

  React.useEffect(() => {
    let id: number | undefined = undefined;
    postElements.forEach((element) => {
      if (last_collapse[element.id] != collapsedComments[element.id]) {
        id = element.id;
      }
    });
    loadFromData(id);
  }, [collapsedComments]);

  const loadPost = () => {
    loadComments(true, frame_size * 3)
      .then((posts) => {
        if (posts.length > 0) dispatch(setComments(posts));
        if (posts.length == 0) {
        } else {
          if (posts.length < frame_size * 3) {
            setHasMoreBottom(false);
          } else {
            setHasMoreBottom(true);
          }
        }
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  const loadComments = async (
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

    let l_time = last_object ? dayjs(last_object.created_at) : dayjs();

    if (before) {
      l_time = l_time.subtract(1, 'millisecond');
    } else {
      l_time = l_time.add(1, 'millisecond');
    }

    const res = await getComments(
      teamId,
      union_id,
      limit,
      l_time.utc().format(),
      before,
      marked_as_ticket,
    );
    return res && res.comments && res.comments.length > 0 ? createCommentTree(res.comments) : [];
  };

  React.useEffect(() => {
    if (comments.comments.length == 0) {
      setShowBottom(false);
      setIsLoading(true);
      loadPost();
    }
    setTimeout(() => {
      loadFromData();
    }, 10);
    if (postElements.length == 0 && !isLoading) {
      setInitialLoad(true);
      setHasMoreBottom(true);
      if (comments.comments.length != 0) setHasMoreTop(true);
    }
  }, [comments]);

  const loadFromData = async (id?: number) => {
    if (comments.comments.length > 0) {
      const p: { id: number; element: any }[] = [];
      comments.comments.forEach((post) => {
        const el = postElements.find((el) => post.id == el.id);
        if (el && !(id && id == post.id)) {
          p.push(el);
        } else {
          p.push({
            id: post.id,
            element: (
              <CommentTreeItem
                comment={post}
                level={0}
                isCollapsed={!!collapsedComments[post.id]}
                onToggleCollapse={toggleCollapse}
                collapsedComments={collapsedComments}
              />
            ),
          });
        }
      });
      setPostElements(p);
      setTimeout(() => setIsLoading(false), 100);
    } else {
      setPostElements([]);
      setTimeout(() => setIsLoading(false), 100);
    }
  };

  React.useEffect(() => {
    if (divRef.current) {
      if (isLoadingBottom) {
        setIsLoadingBottom(false);
      }
      if (isLoadingTop) {
        if (divRef.current.scrollTop == 0) {
          divRef.current.scrollTo(0, lastTop + divRef.current.scrollHeight);
        }
        dispatch(
          setComments(comments.comments.slice(0, comments.comments.length - newData.length)),
        );
        setIsLoadingTop(false);
      }
      if (divRef.current.scrollHeight > divRef.current.clientHeight) {
        setShowBottom(true);
      }
    }
  }, [postElements]);

  const onNewTop = (data: CommentWithChildren[]) => {
    if (data) {
      if (data.length != frame_size) {
        setHasMoreTop(false);
      }
      if (data.length > 0) setHasMoreBottom(true);
      if (divRef.current) {
        setLastTop(divRef.current.scrollTop - divRef.current.scrollHeight);
      }
      dispatch(setComments([...data, ...comments.comments]));
      setNewData(data);
    } else {
      setHasMoreTop(false);
    }
  };

  const onNewBottom = (data: CommentWithChildren[]) => {
    if (data) {
      if (data.length != frame_size) {
        setHasMoreBottom(false);
      }
      if (data.length > 0) setHasMoreTop(true);
      dispatch(setComments([...comments.comments.slice(data.length), ...data]));
    } else {
      setHasMoreBottom(false);
    }
  };
  const handleScroll = () => {
    if (divRef.current) {
      const max_scroll = divRef.current.scrollHeight - divRef.current.clientHeight;
      setAtTop(divRef.current.scrollTop <= max_scroll * 0.1);
      if (
        divRef.current.scrollTop <= max_scroll * 0.1 &&
        hasMoreTop &&
        !isLoadingTop &&
        !isLoading &&
        comments.comments.length > 0
      ) {
        //NOTE: load more data bottom
        setIsLoadingTop(true);
        loadComments(false, frame_size, comments.comments[0]).then((data) => onNewTop(data));
      }
      if (
        divRef.current.scrollTop >= max_scroll * 0.9 &&
        hasMoreBottom &&
        !isLoadingBottom &&
        !isLoading &&
        comments.comments.length > 0
      ) {
        //NOTE: load more data top
        setIsLoadingBottom(true);
        loadComments(true, frame_size, comments.comments[comments.comments.length - 1]).then(
          (data) => onNewBottom(data),
        );
      }
    }
  };

  return (
    <div className={styles.postListContainer} ref={divRef} onScroll={handleScroll}>
      {isLoadingTop && (
        <div className={styles.end} key={'sp_loading'}>
          <Spin className={styles.spinner} />
        </div>
      )}
      {teamId != 0 &&
        postElements.length > 0 &&
        postElements.map((el) => (
          <div key={el.id} style={{ display: isLoading ? 'none' : 'block' }}>
            {el.element}
          </div>
        ))}
      {showBottom || isLoadingBottom ? (
        <div className={styles.end} key={'sp_bottom'}>
          {isLoadingBottom ? (
            <Spin className={styles.spinner} />
          ) : (
            <Divider variant='dashed' className={styles.end}>
              <Text color={'#bfbfbf'}>Конец</Text>
            </Divider>
          )}
        </div>
      ) : (
        <div key={'sp_bottom'}></div>
      )}
      {isLoading && (
        <div className={styles.end} key={'sp_loading'}>
          <Spin className={styles.spinner} />
        </div>
      )}
      {!isLoading && comments.comments.length == 0 && (
        <Empty key={'empty'} className={styles.empty} description={<span>Нет постов</span>} />
      )}
    </div>
  );
};
export default CommentList;
