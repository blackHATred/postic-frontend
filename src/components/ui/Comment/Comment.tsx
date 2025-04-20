import React, { useState } from 'react';
import { Avatar, Carousel, Divider, Space, Typography } from 'antd';
import styles from './styles.module.scss';
import { Comment, DeleteComment } from '../../../models/Comment/types';
import dayjs from 'dayjs';
import { LiaQuestionCircle, LiaTelegram, LiaTwitter, LiaVk } from 'react-icons/lia';
import ClickableButton from '../Button/Button';
import { DeleteOutlined, DoubleRightOutlined } from '@ant-design/icons';
import { setAnswerDialog, setSelectedComment } from '../../../stores/commentSlice';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { Delete } from '../../../api/api';
import { setActiveTab } from '../../../stores/basePageDialogsSlice';
import { setScrollToPost, setSelectedPostId } from '../../../stores/postsSlice';

import config from '../../../constants/appConfig';

// часовой пояс и отображение времени

const { Text } = Typography;

interface CommentProps {
  comment: Comment;
}

const CommentComponent: React.FC<CommentProps> = ({ comment }) => {
  const dispatch = useAppDispatch();
  const selectedTeamId = useAppSelector((state) => state.teams.globalActiveTeamId);
  const [sticker, setSticker] = useState<object>();
  const openAnswerDialog = () => {
    dispatch(setSelectedComment?.(comment));
    dispatch(setAnswerDialog(true));
  };
  const getIcon = (platform: string) => {
    switch (platform) {
      case 'vk':
        return <LiaVk className={styles.icon} />;
      case 'tg':
        return <LiaTelegram className={styles.icon} />;
      case 'twitter':
        return <LiaTwitter className={styles.icon} />;
    }
    return <LiaQuestionCircle className={styles.icon} />;
  };

  const deleteComment = () => {
    console.log('Удаление комментария', selectedTeamId, comment.post_union_id, false);
    const res: DeleteComment = {
      team_id: selectedTeamId,
      post_comment_id: Number(comment.id),
      ban_user: false,
    };
    Delete(res);
  };
  const handlePostClick = () => {
    dispatch(setActiveTab('1'));
    dispatch(setScrollToPost(true));
    dispatch(setSelectedPostId(comment.post_union_id));
  };

  return (
    <div className={styles.comment}>
      <div className={styles['comment-header']}>
        <Avatar
          src={config.api.baseURL + '/upload/get/' + comment.avatar_mediafile.id}
          onError={() => {
            console.log('img-error');
            return true;
          }}
        />
        <div className={styles['comment-header-text']}>
          <div className={styles['comment-author']}>
            <div>
              <Text strong>{comment.username}</Text>
              <Text type='secondary' className={styles['comment-time']}>
                {dayjs.utc(comment.created_at).format('D MMMM YYYY [в] HH:mm')}
              </Text>
              <Space
                size={0}
                split={<Divider type='vertical' />}
                className={styles['platform-icons']}
              >
                {getIcon(comment.platform)}
              </Space>
            </div>
            <div>
              <Text className={styles['comment-full-name']}>{comment.full_name}</Text>
            </div>
          </div>

          <div>
            <Text
              type='secondary'
              style={{ marginTop: 'auto', marginBottom: 'auto' }}
              onClick={handlePostClick}
            >
              К <a>посту</a>
            </Text>
          </div>
        </div>
      </div>

      <div className={styles['comment-content']}>
        <Text>{comment.text}</Text>
      </div>
      {comment.attachments.length > 0 && (
        <Carousel arrows>
          {comment.attachments.map((preview) => (
            <div key={preview.id}>
              {preview.file_type == 'sticker' ? (
                <>[Стикер]</>
              ) : (
                <img src={'http://localhost:80/api/upload/get/' + preview.id} />
              )}
            </div>
          ))}
        </Carousel>
      )}
      <div>
        <ClickableButton
          type='default'
          variant='outlined'
          color='blue'
          text='Ответить'
          icon={<DoubleRightOutlined />}
          onButtonClick={openAnswerDialog}
        />
        <ClickableButton
          type='default'
          variant='outlined'
          color='danger'
          text='Удалить'
          icon={<DeleteOutlined />}
          onButtonClick={deleteComment}
        />
      </div>
    </div>
  );
};

export default CommentComponent;
