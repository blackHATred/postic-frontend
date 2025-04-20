import React, { useState } from 'react';
import styles from './styles.module.scss';
import PostComponent from '../../cards/Post/Post';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { getPostsStore, setPosts } from '../../../stores/postsSlice';
import { Post } from '../../../models/Post/types';
import { getPosts } from '../../../api/api';
import dayjs from 'dayjs';
import { Radio } from 'antd';
import { RadioChangeEvent } from 'antd/es/radio';
import InfiniteScroll from '../../ui/stickyScroll/batchLoadScroll';

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

  // Загрузка постов при изменении фильтра или команды
  useEffect(() => {
    dispatch(setPosts([]));
  }, [activeFilter]);

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

  return (
    <div className={styles.postListContainer}>
      <div className={styles.filterContainer}>
        <Radio.Group
          defaultValue=''
          buttonStyle='solid'
          onChange={handleFilterChange}
          value={filter}
        >
          <Radio.Button value=''>Все посты</Radio.Button>
          <Radio.Button value='published'>Опубликованные</Radio.Button>
          <Radio.Button value='scheduled'>Отложенные</Radio.Button>
        </Radio.Group>
      </div>

      {teamId != 0 && (
        <InfiniteScroll
          getObjectFromData={function (data: Post, index: number): React.ReactNode {
            return <PostComponent {...data} key={index} />;
          }}
          data={posts}
          setData={function (data: Post[]): void {
            dispatch(setPosts(data));
          }}
          getNewData={async (before: boolean, limit: number, last_object?: Post) => {
            const currentDate = last_object
              ? dayjs(last_object.created_at).utc().format()
              : dayjs().utc().format();
            const result = await getPosts(teamId, limit, currentDate, filter || undefined, before);
            return result.posts;
          }}
          initialScroll={0}
          frame_size={3}
          empty_text={
            filter === 'scheduled'
              ? 'Нет отложенных постов'
              : filter === 'published'
                ? 'Нет опубликованных постов'
                : 'Нет постов'
          }
        />
      )}
    </div>
  );
};
export default PostList;
