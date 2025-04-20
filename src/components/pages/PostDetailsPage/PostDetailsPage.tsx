import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Empty } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setSelectedPostId } from '../../../stores/postsSlice';
import CommentList from '../../lists/CommentList/CommentList';
import styles from './styles.module.scss';
import PostDetailed from '../../cards/PostDetailed/PostDetailed';

const PostDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const posts = useAppSelector((state) => state.posts.posts);

  useEffect(() => {
    if (id) {
      dispatch(setSelectedPostId(Number(id)));
    }
  }, [id, dispatch]);

  // Находим пост по ID
  const post = posts.find((post) => post.id === Number(id));

  if (!post) {
    return <Empty description='Пост не найден' />;
  }

  return (
    <div className={styles.detailsContainer}>
      <div className={styles.postSection}>
        <PostDetailed {...post} />
      </div>
      <div className={styles.commentsSection}>
        <CommentList />
      </div>
    </div>
  );
};

export default PostDetailsPage;
