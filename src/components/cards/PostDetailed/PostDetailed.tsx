import React from 'react';
import { Typography } from 'antd';
import styles from './styles.module.scss';
import { Post } from '../../../models/Post/types';
import './selected_style.css';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import PostComponent from '../Post/Post';

const { Text } = Typography;

const PostDetailed: React.FC<Post> = (props: Post) => {
  const dispatch = useAppDispatch();
  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);

  return (
    <div className={styles['post']}>
      <PostComponent post={props} isDetailed={true} />
    </div>
  );
};

export default PostDetailed;
