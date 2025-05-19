import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Empty, Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setSelectedPostId } from '../../../stores/postsSlice';
import styles from './styles.module.scss';
import PostDetailed from '../../cards/PostDetailed/PostDetailed';
import CommentList from '../../lists/CommentList/CommentList';
import { Post } from '../../../models/Post/types';
import { getPost } from '../../../api/api';

const PostDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const posts = useAppSelector((state) => state.posts.posts);
  const team_id = useAppSelector((state) => state.teams.globalActiveTeamId);
  const [p, setP] = useState<Post | undefined>(posts.find((post) => post.id === Number(id)));
  const post: Post = p
    ? p
    : {
        id: 0,
        text: '',
        platforms: [],
        pub_datetime: '',
        attachments: [],
        created_at: 0,
        user_id: 0,
        team_id: 0,
      };
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!p && id) {
      setIsLoading(true);
      getPost(team_id, +id)
        .then((p) => {
          setIsLoading(false);
          setP(p.post);
        })
        .catch(() => {
          setIsLoading(false);
          setP(undefined);
        });
    }
    return () => {
      dispatch(setSelectedPostId(0));
    };
  }, [dispatch]);

  return p ? (
    <div className={styles.detailsContainer}>
      <div className={styles.postSection}>
        <PostDetailed {...post} />
      </div>
      <div className={styles.commentsSection}>
        <CommentList key={'post_list'} save_redux={false} />
      </div>
    </div>
  ) : isLoading ? (
    <div className={styles.detailsContainer}>
      <Spin style={{ paddingTop: '20px' }}></Spin>
    </div>
  ) : (
    <Empty description='Пост не найден' />
  );
};

export default PostDetailsPage;
