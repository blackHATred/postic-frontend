import React, { useRef, useState } from 'react';
import styles from './styles.module.scss';
import PostComponent from '../../cards/Post/Post';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { getPostsStore, setPosts, setPostsScroll } from '../../../stores/postsSlice';
import { Post } from '../../../models/Post/types';
import { getPosts } from '../../../api/api';
import dayjs from 'dayjs';
import { Divider, Empty, Spin, Typography } from 'antd';

const frame_size = 3;
const { Text } = Typography;

const PostList: React.FC = () => {
  const dispatch = useAppDispatch();
  const posts = useAppSelector(getPostsStore);
  const teamId = useAppSelector((state) => state.teams.globalActiveTeamId);

  const activeFilter = useAppSelector((state) => state.posts.activePostFilter);

  const scroll = useAppSelector((state) => state.posts.postsScroll);

  const [postElements, setPostElements] = useState<{ id: number; element: any }[]>([]);
  const divRef = useRef<HTMLDivElement>(null);

  const [showBottom, setShowBottom] = useState(false);

  const [hasMoreTop, setHasMoreTop] = useState(true);
  const [hasMoreBottom, setHasMoreBottom] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBottom, setIsLoadingBottom] = useState(false);
  const [isLoadingTop, setIsLoadingTop] = useState(false);
  const [lastTop, setLastTop] = useState<number>(0);

  const [newData, setNewData] = useState<Post[]>([]);

  const [doNowShow, setDoNowShow] = useState(true);

  React.useEffect(() => {
    setHasMoreBottom(true);
    setShowBottom(false);
    if (posts.length == 0) {
      setHasMoreTop(false);
      // NOTE: первичная загрузка
      setIsLoading(true);
      loadPost();
    } else if (postElements.length == 0) {
      //NOTE: открытие элемента с уже существующим списком постов
      setDoNowShow(true);
      setHasMoreTop(true);
    } else {
      setHasMoreTop(false);
      //NOTE: смена страницы
      setDoNowShow(true);
      dispatch(setPostsScroll(0));
      setIsLoading(true);
      if (divRef.current) divRef.current.scrollTop = 0;
      loadPost();
    }
  }, [activeFilter]);

  const loadPost = () => {
    loadPosts(true, frame_size * 3)
      .then((posts) => {
        dispatch(setPosts(posts));
        if (posts.length < frame_size * 3) {
          setHasMoreBottom(false);
        }
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  React.useEffect(() => {
    if (posts.length > 0) {
      if (postElements.length == 0) {
        // NOTE: EITHER LOADED FIRST DATA OR HAD DATA LOADED
        if (isLoading) {
          //NOTE: Loaded first data
          loadFromData();
        } else {
          //NOTE: Had data loaded
          setDoNowShow(false);
          setTimeout(() => {
            loadFromData();
          }, 100);
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
  }, [posts]);

  const loadFromData = async () => {
    if (posts.length > 0) {
      setPostElements(
        posts.map((post) => {
          return {
            id: post.id,
            element: <PostComponent post={post} />,
          };
        }),
      );
    } else {
      setPostElements([]);
      setDoNowShow(false);
    }
  };

  React.useEffect(() => {
    if (divRef.current && postElements.length > 0) {
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
            dispatch(setPosts(posts.slice(0, posts.length - newData.length)));
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
        divRef.current.scrollTo(0, scroll);
      }
    }
  }, [postElements]);

  const onNewTop = (data: Post[]) => {
    if (data.length > 0) {
      if (data.length != frame_size) {
        setHasMoreTop(false);
      }
      setHasMoreBottom(true);
      if (divRef.current) {
        setLastTop(divRef.current.scrollTop - divRef.current.scrollHeight);
      }
      dispatch(setPosts([...data, ...posts]));
      setNewData(data);
    } else {
      setHasMoreTop(false);
      setIsLoading(false);
      setIsLoadingTop(false);
    }
  };

  const onNewBottom = (data: Post[]) => {
    if (data.length > 0) {
      if (data.length != frame_size) {
        setHasMoreBottom(false);
      }
      dispatch(setPosts([...posts, ...data]));
    } else {
      setHasMoreBottom(false);
      setIsLoading(false);
      setIsLoadingBottom(false);
      if (divRef.current && divRef.current.scrollHeight > divRef.current.clientHeight) {
        setShowBottom(true);
      }
    }
  };

  const loadPosts = async (before: boolean, limit: number, last_object?: Post) => {
    try {
      const currentDate = last_object
        ? before
          ? dayjs(last_object.created_at).utc().format()
          : dayjs(last_object.created_at).add(1, 'second').utc().format()
        : dayjs().utc().format();
      let result;
      if (activeFilter === 'all') {
        result = await getPosts(teamId, limit, currentDate, undefined, before);
      } else {
        result = await getPosts(teamId, limit, currentDate, activeFilter, before);
      }
      if (before == false) {
        return [...result.posts].reverse();
      }
      return result.posts ? result.posts : [];
    } catch (error) {
      return [];
    }
  };

  const handleScroll = () => {
    if (divRef.current) {
      dispatch(setPostsScroll(divRef.current.scrollTop));
      const max_scroll = divRef.current.scrollHeight - divRef.current.clientHeight;
      if (
        divRef.current.scrollTop <= max_scroll * 0.1 &&
        hasMoreTop &&
        !isLoadingTop &&
        !isLoading &&
        !isLoadingBottom &&
        posts.length > 0
      ) {
        //NOTE: load more data bottom
        setIsLoading(true);
        setIsLoadingTop(true);
        loadPosts(false, frame_size, posts[0]).then((data) => onNewTop(data));
      }
      if (
        divRef.current.scrollTop >= max_scroll * 0.9 &&
        hasMoreBottom &&
        !isLoadingBottom &&
        !isLoading &&
        !isLoadingTop &&
        posts.length > 0
      ) {
        //NOTE: load more data top
        setIsLoading(true);
        setIsLoadingBottom(true);
        loadPosts(true, frame_size, posts[posts.length - 1]).then((data) => onNewBottom(data));
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
        postElements.length > 0 &&
        postElements.map((el) => (
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

      {!isLoading && posts.length == 0 && !doNowShow && (
        <Empty key={'empty'} className={styles.empty} description={<span>Нет постов</span>} />
      )}
    </div>
  );
};
export default PostList;
