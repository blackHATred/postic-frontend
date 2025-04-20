import React, { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import PostComponent from '../../cards/Post/Post';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import {
  addPosts,
  getPostsStore,
  setPosts,
  setPostsScroll,
  setScrollToPost,
} from '../../../stores/postsSlice';
import { Post } from '../../../models/Post/types';
import RowVirtualizerDynamic from '../../ui/stickyScroll/InfiniteScroll';
import { getPosts } from '../../../api/api';
import dayjs from 'dayjs';
import { Empty, Spin } from 'antd';

interface PostListProps {
  isLoading?: boolean;
  hasMore?: boolean;
}

const PostList: React.FC<PostListProps> = ({ isLoading, hasMore }) => {
  const dispatch = useAppDispatch();
  const posts = useAppSelector(getPostsStore);
  const scrollToPost = useAppSelector((state) => state.posts.scrollToPost);
  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);
  const scrollAmount = useAppSelector((state) => state.posts.postsScroll);
  const teamId = useAppSelector((state) => state.teams.globalActiveTeamId);
  const activeFilter = useAppSelector((state) => state.posts.activePostFilter);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(setScrollToPost(false));
  }, [scrollToPost]);

  // Загрузка постов при изменении фильтра или команды
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const currentDate = dayjs().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';
        const result = await getPosts(teamId, 20, currentDate, activeFilter || undefined);
        dispatch(setPosts(result.posts));
      } catch (error) {
        console.error('Ошибка при загрузке постов:', error);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) loadPosts();
  }, [dispatch, teamId, activeFilter]);

  const setScroll = (scroll: number) => {
    dispatch(setPostsScroll(scroll));
  };

  const getNewData = async () => {
    const new_data: Post[] = [];
    return new_data;
  };

  return (
    <div className={styles.postListContainer}>
      {loading ? (
        <div className={styles.loaderContainer}>
          <Spin tip='Загрузка постов...' />
        </div>
      ) : posts && posts.length > 0 ? (
        <RowVirtualizerDynamic
          object={[...posts].reverse().map((post, index) => {
            return <PostComponent post={post} key={index} />;
          })}
          addData={(data) => {
            dispatch(addPosts(data));
          }}
          getNewData={getNewData}
          doSmoothScroll={scrollToPost}
          smoothScrollTarget={
            posts.length - posts.findIndex((post) => post.id === selectedPostId) - 1
          }
          scrollAmount={
            scrollToPost
              ? posts.length - posts.findIndex((post) => post.id === selectedPostId) - 1
              : scrollAmount
          }
          setScroll={(scroll) => setScroll(scroll)}
        />
      ) : (
        <Empty
          styles={{ image: { height: 60 } }}
          description={
            <span>
              {activeFilter === 'scheduled'
                ? 'Нет отложенных постов'
                : activeFilter === 'published'
                  ? 'Нет опубликованных постов'
                  : 'Нет постов'}
            </span>
          }
        />
      )}
    </div>
  );
};
export default PostList;
