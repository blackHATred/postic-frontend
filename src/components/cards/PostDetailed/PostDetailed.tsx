import React, { useEffect, useState } from 'react';
import { Typography, Button, Image } from 'antd';
import { LeftOutlined, VideoCameraOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';
import { Post } from '../../../models/Post/types';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../app/App.routes';
import ClickableButton from '../../ui/Button/Button';
import { useAppDispatch } from '../../../stores/hooks';
import { setSummaryDialog } from '../../../stores/basePageDialogsSlice';
import { setSelectedPostId } from '../../../stores/postsSlice';
import { getUploadUrl, GetProfile } from '../../../api/api';

const { Text } = Typography;

const PostDetailed: React.FC<Post> = (props: Post) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [userNickname, setUserNickname] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserNickname = async () => {
      try {
        if (props.user_id) {
          const response = await GetProfile(props.user_id.toString());
          if (response && response.nickname) {
            setUserNickname(response.nickname);
          }
        }
      } catch (error) {
        console.error('Ошибка при получении информации о пользователе:', error);
      }
    };

    fetchUserNickname();
  }, [props.user_id]);

  const attach_files = props.attachments
    ? props.attachments.filter(
        (el) => el.file_type != 'photo' && el.file_type != 'video' && el.file_type != 'sticker',
      )
    : [];
  const attach_images = props.attachments
    ? props.attachments.filter(
        (el) => el.file_type === 'photo' || el.file_type === 'video' || el.file_type === 'sticker',
      )
    : [];

  const onSummaryClick = async () => {
    dispatch(setSummaryDialog(true));
    dispatch(setSelectedPostId(props.id));
  };

  return (
    <div className={styles['post']}>
      <Button
        className={styles['button-left']}
        icon={<LeftOutlined />}
        onClick={() => {
          navigate(routes.posts());
        }}
      />
      {attach_images.length > 0 && attach_images[0].file_type == 'photo' && (
        <div className={styles['preview']}>
          <Image
            height={'100%'}
            width={'100%'}
            style={{ objectFit: 'contain' }}
            preview={false}
            src={getUploadUrl(attach_images[0].id)}
          />
        </div>
      )}
      {attach_images.length > 0 && attach_images[0].file_type == 'video' && (
        <VideoCameraOutlined className={styles['preview']} />
      )}
      <div className={styles['content']}>
        <Text type='secondary' className={styles['post-name']}>
          {userNickname ? userNickname : `Модератор ${props.user_id}`}
        </Text>
        {props.text && <Text className={styles['ellipsis']}>{props.text}</Text>}

        {attach_images.length > 0 && attach_images[0].file_type == 'sticker' && (
          <Text className={styles['ellipsis']}>Стикер</Text>
        )}
      </div>
      <div className={styles['button-right']}>
        <ClickableButton
          text='Анализ комментариев'
          variant='dashed'
          color='primary'
          onButtonClick={onSummaryClick}
          withPopover={true}
          popoverContent={'Получить краткий анализ комментариев'}
        />
      </div>
    </div>
  );
};

export default PostDetailed;
