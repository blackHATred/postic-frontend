import React from 'react';
import styles from './styles.module.scss';
import PostComponent from '../../cards/Post/Post';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { getPostsStore, setPosts } from '../../../stores/postsSlice';
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

  // Загрузка постов при изменении фильтра или команды
  React.useEffect(() => {
    dispatch(setPosts([]));
  }, [activeFilter]);

  const loadPosts = async () => {
    try {
      const currentDate = dayjs().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';
      const result = await getPosts(teamId, 20, currentDate, activeFilter || undefined);
      return result.posts;
    } catch (error) {
      console.error('Ошибка при загрузке постов:', error);
      return [];
    }
  };

  return (
    <div className={styles.postListContainer}>
      {teamId != 0 && (
        <InfiniteScroll
          getObjectFromData={function (data: Post, index: number): React.ReactNode {
            return <PostComponent {...data} key={index} />;
          }}
          data={posts}
          setData={function (data: Post[]): void {
            dispatch(setPosts(data));
          }}
          getNewData={loadPosts}
          initialScroll={0}
          frame_size={3}
          empty_text={
            activeFilter === 'scheduled'
              ? 'Нет отложенных постов'
              : activeFilter === 'published'
                ? 'Нет опубликованных постов'
                : 'Нет постов'
          }
        />
      )}
    </div>
  );
};
export default PostList;
