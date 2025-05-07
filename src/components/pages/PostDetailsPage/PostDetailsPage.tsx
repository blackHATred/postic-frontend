import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Empty } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setSelectedPostId } from '../../../stores/postsSlice';
import CommentList from '../../lists/CommentList/CommentList';
import styles from './styles.module.scss';
import PostDetailed from '../../cards/PostDetailed/PostDetailed';
import { setComments } from '../../../stores/commentSlice';
import { getPost } from '../../../api/api';
import { Post } from '../../../models/Post/types';

const PostDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const posts = useAppSelector((state) => state.posts.posts);
  const team_id = useAppSelector((state) => state.teams.globalActiveTeamId);
  const [post, setPost] = useState<Post>();

  useEffect(() => {
    if (id) {
      dispatch(setSelectedPostId(Number(id)));
      const p = posts.find((post) => post.id === Number(id));
      if (!p && id) {
        getPost(team_id, +id).then((p) => setPost(p.post));
      } else if (!p) {
      } else {
        setPost(p);
      }
    }
    return () => {
      dispatch(setSelectedPostId(0));
      dispatch(setComments([]));
    };
  }, [dispatch]);

  return post ? (
    <div className={styles.detailsContainer}>
      <div className={styles.postSection}>
        <PostDetailed {...post} />
      </div>
      <div className={styles.commentsSection}>
        <CommentList />
      </div>
    </div>
  ) : (
    <Empty description='Пост не найден' />
  );
};

export default PostDetailsPage;
