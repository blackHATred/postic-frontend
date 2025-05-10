import React from 'react';
import { Typography, Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';
import { Post } from '../../../models/Post/types';
import './selected_style.css';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../app/App.routes';

const { Text } = Typography;

const PostDetailed: React.FC<Post> = (props: Post) => {
  const navigate = useNavigate();

  return (
    <div className={styles['post']}>
      <Button icon={<LeftOutlined />} onClick={() => navigate(routes.posts())} />
      <div className={styles['content']}>
        <Text type='secondary' className={styles['post-name']}>
          Модератор {props.user_id}
        </Text>
        <Text className={styles['ellipsis']}>{props.text}</Text>
      </div>
    </div>
  );
};

export default PostDetailed;
