import React, { useEffect } from 'react';
import PostList from '../../lists/PostList/PostList';
import { useAppSelector } from '../../../stores/hooks';

const PostsPage: React.FC = () => {
  const globalActiveTeamId = useAppSelector((state) => state.teams.globalActiveTeamId);
  useEffect(() => {
    if (globalActiveTeamId) {
      // Загрузить данные для текущей страницы с учетом новой команды
      // TODO: loadDataForCurrentPage(globalActiveTeamId);
    }
  }, [globalActiveTeamId]);

  return <PostList hasMore={true} />;
};

export default PostsPage;
