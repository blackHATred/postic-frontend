import React, { useState } from 'react';
import styles from './styles.module.scss';
import PostComponent from '../../cards/Post/Post';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { getPostsStore, setPosts, setPostsScroll } from '../../../stores/postsSlice';
import { Post } from '../../../models/Post/types';
import { getPosts } from '../../../api/api';
import dayjs from 'dayjs';
import InfiniteScroll from '../../ui/stickyScroll/batchLoadScroll';

interface PostListProps {
  isLoading?: boolean;
  hasMore?: boolean;
}

const PostList: React.FC<PostListProps> = ({ isLoading, hasMore }) => {
  const dispatch = useAppDispatch();
  const posts = useAppSelector(getPostsStore);
  const teamId = useAppSelector((state) => state.teams.globalActiveTeamId);
  const activeFilter = useAppSelector((state) => state.posts.activePostFilter);
  const scroll = useAppSelector((state) => state.posts.postsScroll);
  const [lastActive, setLast] = useState('');

  // Загрузка постов при изменении фильтра или команды
  React.useEffect(() => {
    if (activeFilter && lastActive) {
      //dispatch(setSelectedPostId(0));

      dispatch(setPosts([]));
    } else {
      setLast(activeFilter);
    }
  }, [activeFilter]);

  const loadPosts = async (before: boolean, limit: number, last_object?: Post) => {
    try {
      const currentDate = last_object
        ? dayjs(last_object.created_at).utc().format()
        : dayjs().utc().format();
      let result;
      if (activeFilter === 'all') {
        result = await getPosts(teamId, limit, currentDate, undefined, before);
      } else {
        result = await getPosts(teamId, limit, currentDate, activeFilter, before);
      }
      return result.posts;
    } catch (error) {
      return [];
    }
  };

  return (
    <div className={styles.postListContainer}>
      {teamId != 0 && (
        <InfiniteScroll
          getObjectFromData={function (data: Post): React.ReactNode {
            return <PostComponent post={data} />;
          }}
          data={posts}
          setData={function (data: Post[]): void {
            dispatch(setPosts(data));
          }}
          getNewData={loadPosts}
          initialScroll={scroll}
          frame_size={10}
          empty_text={
            activeFilter === 'scheduled'
              ? 'Нет отложенных постов'
              : activeFilter === 'published'
                ? 'Нет опубликованных постов'
                : 'Нет постов'
          }
          setInitialScroll={(scroll: number) => {
            dispatch(setPostsScroll(scroll));
          }}
        />
      )}
    </div>
  );
};
export default PostList;
