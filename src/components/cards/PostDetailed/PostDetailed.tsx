import React, { useState } from 'react';
import { Typography, Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';
import { Post } from '../../../models/Post/types';
import './selected_style.css';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../app/App.routes';

const { Text, Paragraph } = Typography;

const PostDetailed: React.FC<Post> = (props: Post) => {
  const navigate = useNavigate();
  const [ellipsis, setEllipsis] = useState(true);

  return (
    <div className={styles['post']}>
      <Button icon={<LeftOutlined />} onClick={() => navigate(routes.posts())} />
      <div className={styles['content']}>
        <Text type='secondary' className={styles['post-name']}>
          Модератор {props.user_id}
        </Text>
        <Paragraph style={{ whiteSpace: 'pre-line' }} ellipsis={ellipsis ? { rows: 2 } : false}>
          {props.text}
        </Paragraph>
      </div>
    </div>
  );
};

export default PostDetailed;
