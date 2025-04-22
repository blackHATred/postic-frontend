import React from 'react';
import { Typography } from 'antd';
import styles from './styles.module.scss';
import { Post } from '../../../models/Post/types';
import './selected_style.css';
import { useAppDispatch } from '../../../stores/hooks';
import ClickableButton from '../../ui/Button/Button';
import { routes } from '../../../app/App.routes';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const PostDetailed: React.FC<Post> = (props: Post) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <div className={styles['post']}>
      <ClickableButton
        text='<'
        size='small'
        variant='outlined'
        color='primary'
        onButtonClick={() => {
          navigate(routes.posts());
        }}
      />
      <div className={styles['content']}>
        <Text type='secondary' className={styles['post-name']}>
          Модератор {props.user_id}
        </Text>
        {props.text}
      </div>
    </div>
  );
};

export default PostDetailed;
