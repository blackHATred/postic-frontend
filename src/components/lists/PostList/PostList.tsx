import React, { useRef, useState } from 'react';
import styles from './styles.module.scss';
import PostComponent from '../../cards/Post/Post';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { getPostsStore, setPosts, setPostsScroll } from '../../../stores/postsSlice';
import { Post } from '../../../models/Post/types';
import { getPosts } from '../../../api/api';
import dayjs from 'dayjs';
import { Divider, Empty, Spin, Typography } from 'antd';
import PostCalendar from '../../ui/Calendar/PostCalendar';

const frame_size = 10;
const { Text } = Typography;

const PostList: React.FC = () => {
  const dispatch = useAppDispatch();
  const posts = useAppSelector(getPostsStore);
  const teamId = useAppSelector((state) => state.teams.globalActiveTeamId);

  const activeFilter = useAppSelector((state) => state.posts.activePostFilter);
  const [lastActive, setLast] = useState('');

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

  const [newData, setNewData] = useState<Post[]>([]);

  const [initialLoad, setInitialLoad] = useState<boolean>(false);

  React.useEffect(() => {
    //NOTE: Первичная загрузка данных и перезагрузка при смене фильтра
    setHasMoreTop(false);
    setShowBottom(false);
    setIsLoading(true);
    if (activeFilter && lastActive) {
      //dispatch(setSelectedPostId(0));
      dispatch(setPostsScroll(0));
      if (divRef.current) divRef.current.scrollTop = 0;
      loadPost();
    } else {
      if (posts.length == 0) {
        dispatch(setPostsScroll(0));
        loadPost();
      } else {
      }
      setLast(activeFilter);
    }
  }, [activeFilter]);

  const loadPost = () => {
    loadPosts(true, frame_size * 3)
      .then((posts) => {
        if (posts.length > 0) dispatch(setPosts(posts));
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

  React.useEffect(() => {
    if (posts.length == 0) {
      setShowBottom(false);
      setIsLoading(true);
      loadPost();
    }
    setTimeout(() => {
      loadFromData();
    }, 10);
    if (postElements.length == 0) {
      setInitialLoad(true);
      setHasMoreBottom(true);
      setHasMoreTop(true);
    }
  }, [posts]);

  const loadFromData = async () => {
    if (posts.length > 0) {
      const p: { id: number; element: any }[] = [];
      posts.forEach((post) => {
        const el = postElements.find((el) => post.id == el.id);
        if (el) {
          p.push(el);
        } else {
          const CompMemo = React.memo(PostComponent);
          p.push({
            id: post.id,
            element: <CompMemo post={post} />,
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
      if (initialLoad) {
        divRef.current.scrollTop = scroll;
        setInitialLoad(false);
      }
      if (isLoadingBottom) {
        setIsLoadingBottom(false);
      }
      if (isLoadingTop) {
        if (divRef.current.scrollTop == 0) {
          divRef.current.scrollTo(0, lastTop + divRef.current.scrollHeight);
        }
        dispatch(setPosts(posts.slice(0, posts.length - newData.length)));
        setIsLoadingTop(false);
      }
      if (divRef.current.scrollHeight > divRef.current.clientHeight) {
        setShowBottom(true);
      }
    }
  }, [postElements]);

  const onNewTop = (data: Post[]) => {
    if (data) {
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
    }
  };

  const onNewBottom = (data: Post[]) => {
    if (data) {
      if (data.length != frame_size) {
        setHasMoreBottom(false);
      }
      setHasMoreTop(true);
      dispatch(setPosts([...posts.slice(data.length), ...data]));
    } else {
      setHasMoreBottom(false);
    }
  };

  const loadPosts = async (before: boolean, limit: number, last_object?: Post) => {
    try {
      const currentDate = last_object
        ? before
          ? dayjs(last_object.created_at).utc().format()
          : dayjs(last_object.created_at).add(1, 'second').utc().format()
        : dayjs().utc().format();
      let result: { posts: Post[] } = { posts: [] };

      if (activeFilter === 'all') {
        result = await getPosts(teamId, limit, currentDate, undefined, before);
      }
      if (activeFilter === 'published' || activeFilter === 'scheduled') {
        result = await getPosts(teamId, limit, currentDate, activeFilter, before);
      }
      if (activeFilter === 'calendar') {
        result = await getPosts(teamId, limit, currentDate, 'scheduled', before);
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
      setAtTop(divRef.current.scrollTop <= max_scroll * 0.1);
      if (
        divRef.current.scrollTop <= max_scroll * 0.1 &&
        hasMoreTop &&
        !isLoadingTop &&
        !isLoading &&
        posts.length > 0
      ) {
        //NOTE: load more data bottom
        setIsLoadingTop(true);
        loadPosts(false, frame_size, posts[0]).then((data) => onNewTop(data));
      }
      if (
        divRef.current.scrollTop >= max_scroll * 0.9 &&
        hasMoreBottom &&
        !isLoadingBottom &&
        !isLoading &&
        posts.length > 0
      ) {
        //NOTE: load more data top
        setIsLoadingBottom(true);
        loadPosts(true, frame_size, posts[posts.length - 1]).then((data) => onNewBottom(data));
      }
    }
  };

  return (
    <>
      {activeFilter === 'calendar' ? (
        <PostCalendar posts={posts} />
      ) : (
        <div className={styles.postListContainer} ref={divRef} onScroll={handleScroll}>
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
          {!isLoading && posts.length == 0 && (
            <Empty key={'empty'} className={styles.empty} description={<span>Нет постов</span>} />
          )}
        </div>
      )}
    </>
  );
};
export default PostList;
