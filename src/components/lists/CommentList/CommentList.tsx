import React, { useRef, useState } from 'react';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
//import { setPostsScroll } from '../../../stores/postsSlice';
import { getComment, getComments } from '../../../api/api';
import dayjs from 'dayjs';
import { Divider, Empty, Spin, Typography } from 'antd';
import CommentTreeItem from './CommentTreeItem';
import { CommentWithChildren, createCommentTree, useCollapsedComments } from './commentTree';
import { routes } from '../../../app/App.routes';
import { getSseUrl } from '../../../constants/appConfig';
import { useAuthenticatedSSE } from '../../../api/newSSE';
import { setScrollToTop } from '../../../stores/basePageDialogsSlice';
import classNames from 'classnames';

const frame_size = 3;
const { Text } = Typography;

const CommentList: React.FC<{
  get_func: (state: any) => any;
  set_func: any;
  add_func: any;
  remove_func: any;
  replace_func: any;
}> = ({ get_func, set_func, remove_func, add_func, replace_func }) => {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    return () => {
      dispatch(set_func([]));
    };
  }, [dispatch]);

  const comments = useAppSelector(get_func);
  const teamId = useAppSelector((state) => state.teams.globalActiveTeamId);

  const activeFilter = useAppSelector((state) => state.posts.activePostFilter);

  //const scroll = useAppSelector((state) => state.posts.postsScroll);

  const [commentElements, setCommentElements] = useState<{ id: number; element: any }[]>([]);
  const divRef = useRef<HTMLDivElement>(null);

  const [showBottom, setShowBottom] = useState(false);

  const [hasMoreTop, setHasMoreTop] = useState(true);
  const [hasMoreBottom, setHasMoreBottom] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBottom, setIsLoadingBottom] = useState(false);
  const [isLoadingTop, setIsLoadingTop] = useState(false);

  const [lastTop, setLastTop] = useState<number>(0);

  const [newData, setNewData] = useState<CommentWithChildren[]>([]);

  const [doNowShow, setDoNowShow] = useState(true);

  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);
  const isTicketPage = location.pathname === routes.ticket();
  const { collapsedComments, toggleCollapse } = useCollapsedComments();

  const url = getSseUrl(teamId, selectedPostId || 0);

  const [newComment, setNewComment] = React.useState<any>();
  const [animatedCommentIds, setAnimatedCommentIds] = useState<number[]>([]);

  const onNewComment = (data: any) => {
    setNewComment(data);
  };

  const { isConnected, close } = useAuthenticatedSSE({
    url,
    onMessage: onNewComment,
  });

  const [toDelete, setToDelete] = useState<any>();

  const scrollToTop = useAppSelector((state) => state.basePageDialogs.scrollToTop);

  React.useEffect(() => {
    if (scrollToTop && divRef.current) {
      divRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      dispatch(setScrollToTop(false));
    }
  }, [scrollToTop]);

  React.useEffect(() => {
    if (newComment) {
      if (newComment.type == 'created') {
        if (!hasMoreTop)
          getComment(teamId, newComment.comment_id)
            .then((data) => {
              setAnimatedCommentIds((prev) => [...prev, data.comment.id]);
              setTimeout(() => {
                setAnimatedCommentIds((prev) => prev.filter((id) => id !== data.comment.id));
              }, 800);

              dispatch(add_func(data.comment));
            })
            .catch(() => {
              // хмм
            });
      } else if (newComment.type == 'deleted') {
        getComment(teamId, newComment.comment_id).then((data) => {
          dispatch(replace_func({ id: newComment.comment_id, ch: data.comment }));
        });
      }
    }
  }, [newComment]);

  React.useEffect(() => {
    setHasMoreBottom(true);
    setHasMoreTop(false);
    setShowBottom(false);
    if (comments.length == 0) {
      // NOTE: первичная загрузка
      setIsLoading(true);
      loadComment();
    } else if (commentElements.length == 0) {
      //NOTE: открытие элемента с уже существующим списком постов
      setDoNowShow(true);
      setHasMoreTop(true);
    } else {
      //NOTE: смена страницы
      setDoNowShow(true);
      setIsLoading(true);
      if (divRef.current) divRef.current.scrollTop = 0;
      loadComment();
    }
  }, [activeFilter, teamId]);

  const loadComment = () => {
    loadComments(true, frame_size * 3)
      .then((comments) => {
        dispatch(set_func(comments));
        if (comments.length < frame_size * 3) {
          setHasMoreBottom(false);
        }
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  React.useEffect(() => {
    if (comments.length > 0) {
      if (commentElements.length == 0) {
        // NOTE: EITHER LOADED FIRST DATA OR HAD DATA LOADED
        if (isLoading) {
          //NOTE: Loaded first data
          loadFromData();
        } else {
          //NOTE: Had data loaded
          setTimeout(() => {
            loadFromData();
            setIsLoading(true);
            setIsLoadingTop(true);
            loadComments(false, frame_size, comments[0]).then((data) => onNewTop(data));
          }, 10);
        }
      } else {
        // NOTE: NEW DATA LOADED
        loadFromData();
      }
    } else {
      if (isLoading) {
        loadFromData();
        setIsLoading(false);
      }
    }
  }, [comments]);

  const loadFromData = async (id?: number) => {
    if (comments.length > 0) {
      setCommentElements(
        comments.map((comment: any) => {
          return {
            id: comment.id,
            element: (
              <div
                className={classNames({
                  [styles.commentAppear]: animatedCommentIds.includes(comment.id),
                })}
              >
                <CommentTreeItem comment={comment} level={0} />
              </div>
            ),
          };
        }),
      );
    } else {
      setCommentElements([]);
      setDoNowShow(false);
    }
  };

  React.useEffect(() => {
    if (divRef.current && commentElements.length > 0) {
      setDoNowShow(false);
      if (isLoading) {
        //NOTE: LOADING FIRST DATA OR ADDING NEW DATA

        if (isLoadingBottom) {
          //NOTE: ADDED DATA TO BOTTOM
          setIsLoadingBottom(false);
          setIsLoading(false);
        } else if (isLoadingTop) {
          //NOTE: ADDED DATA TO TOP
          if (newData.length != 0) {
            if (divRef.current.scrollTop == 0) {
              //NOTE: PREVENT SCROLL JUMPING WHEN AT THE VERY TOP (OVERFLOW-ANCHOR:AUTO)
              divRef.current.scrollTo(0, lastTop + divRef.current.scrollHeight);
            }
            // NOTE: REMOVE ELEMENTS AT END
            dispatch(set_func(comments.slice(0, comments.length - newData.length)));
            setNewData([]);
          } else {
            //NOTE: REMOVED FROM BOTTOM AFTER ADDING TOP
            setIsLoadingTop(false);
            setIsLoading(false);
          }
        } else {
          //NOTE: ADDING FIRST DATA
          setIsLoading(false);
        }
        if (divRef.current.scrollHeight > divRef.current.clientHeight) {
          setShowBottom(true);
        }
      } else {
        //NOTE: ALREADY EXISTING DATA LOADED
        //divRef.current.scrollTo(0, scroll);
      }
    }
  }, [commentElements]);

  const onNewTop = (data: CommentWithChildren[]) => {
    if (data.length > 0) {
      if (data.length != frame_size) {
        setHasMoreTop(false);
      }
      setHasMoreBottom(true);
      if (divRef.current) {
        setLastTop(divRef.current.scrollTop - divRef.current.scrollHeight);
      }
      dispatch(set_func([...data, ...comments]));
      setNewData(data);
    } else {
      setHasMoreTop(false);
      setIsLoading(false);
      setIsLoadingTop(false);
    }
  };

  const onNewBottom = (data: CommentWithChildren[]) => {
    if (data.length > 0) {
      if (data.length != frame_size) {
        setHasMoreBottom(false);
      }
      dispatch(set_func([...comments, ...data]));
    } else {
      setHasMoreBottom(false);
      setIsLoading(false);
      setIsLoadingBottom(false);
      if (divRef.current && divRef.current.scrollHeight > divRef.current.clientHeight) {
        setShowBottom(true);
      }
    }
  };

  const loadComments = async (
    before: boolean,
    limit: number,
    last_object?: CommentWithChildren,
    top?: boolean,
  ) => {
    const union_id = selectedPostId;

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

  const handleScroll = () => {
    if (divRef.current) {
      const max_scroll = divRef.current.scrollHeight - divRef.current.clientHeight;
      if (
        divRef.current.scrollTop <= max_scroll * 0.1 &&
        hasMoreTop &&
        !isLoadingTop &&
        !isLoading &&
        !isLoadingBottom &&
        comments.length > 0
      ) {
        //NOTE: load more data bottom
        setIsLoading(true);
        setIsLoadingTop(true);
        loadComments(false, frame_size, comments[0]).then((data) => onNewTop(data));
      }
      if (
        divRef.current.scrollTop >= max_scroll * 0.9 &&
        hasMoreBottom &&
        !isLoadingBottom &&
        !isLoading &&
        !isLoadingTop &&
        comments.length > 0
      ) {
        //NOTE: load more data top
        setIsLoading(true);
        setIsLoadingBottom(true);
        loadComments(true, frame_size, comments[comments.length - 1]).then((data) =>
          onNewBottom(data),
        );
      }
    }
  };

  return (
    <div className={styles.postListContainer} ref={divRef} onScroll={handleScroll}>
      {(isLoading || doNowShow || isLoadingTop) && !isLoadingBottom ? (
        <div className={styles.end} key={'sp_loading'}>
          <Spin className={styles.spinner} />
        </div>
      ) : (
        <div style={{ paddingTop: '20px' }}></div>
      )}
      {teamId != 0 &&
        commentElements.length > 0 &&
        commentElements.map((el) => (
          <div key={el.id} style={{ display: doNowShow ? 'none' : 'block' }}>
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

      {!isLoading && comments.length == 0 && !doNowShow && (
        <Empty key={'empty'} className={styles.empty} description={<span>Нет Комментариев</span>} />
      )}
    </div>
  );
};
export default CommentList;
