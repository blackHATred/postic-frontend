import React from 'react';
import { Typography, Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';
import { Post } from '../../../models/Post/types';
import './selected_style.css';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../app/App.routes';
import ClickableButton from '../../ui/Button/Button';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setSummaryDialog } from '../../../stores/basePageDialogsSlice';
import { setSelectedPostId } from '../../../stores/postsSlice';

const { Text, Paragraph } = Typography;

const PostDetailed: React.FC<Post> = (props: Post) => {
  const navigate = useNavigate();
  const help_mode = useAppSelector((state) => state.settings.helpMode);
  const dispatch = useAppDispatch();

  const onSummaryClick = async () => {
    dispatch(setSummaryDialog(true));
    dispatch(setSelectedPostId(props.id));
  };

  return (
    <div className={styles['post']}>
      <Button icon={<LeftOutlined />} onClick={() => navigate(routes.posts())} />
      <div className={styles['content']}>
        <Text type='secondary' className={styles['post-name']}>
          Модератор {props.user_id}
        </Text>
        <Text className={styles['ellipsis']}>{props.text}</Text>
      </div>
      <div className={styles['button-right']}>
        {help_mode ? (
          <ClickableButton
            text='Анализ комментариев'
            variant='dashed'
            color='primary'
            onButtonClick={onSummaryClick}
            withPopover={true}
            popoverContent={'Получить краткий анализ комментариев'}
          />
        ) : (
          <ClickableButton
            text='Анализ комментариев'
            variant='dashed'
            color='primary'
            onButtonClick={onSummaryClick}
          />
        )}
      </div>
    </div>
  );
};

export default PostDetailed;
