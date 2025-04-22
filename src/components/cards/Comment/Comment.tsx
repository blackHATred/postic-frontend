import React from 'react';
import { Avatar, Carousel, Divider, Space, Typography } from 'antd';
import styles from './styles.module.scss';
import { Comment, DeleteComment } from '../../../models/Comment/types';
import dayjs from 'dayjs';
import { LiaQuestionCircle, LiaTelegram, LiaTwitter, LiaVk } from 'react-icons/lia';
import ClickableButton from '../../ui/Button/Button';
import { DeleteOutlined, DoubleRightOutlined, TeamOutlined } from '@ant-design/icons';
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
  const { created_at = dayjs('0000-00-00 00:00:00') } = comment;
  const dispatch = useAppDispatch();
  const selectedTeamId = useAppSelector((state) => state.teams.globalActiveTeamId);
  const teams = useAppSelector((state) => state.teams.teams);

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

  const teamName = React.useMemo(() => {
    if (comment.is_team_reply && comment.team_id) {
      const team = teams.find((t: any) => t.id === comment.team_id);
      return team?.name || 'Команда';
    }
    return comment.full_name;
  }, [comment.team_id, comment.full_name, comment.is_team_reply, teams]);

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
    <div className={comment.username ? styles.comment : styles.post}>
      <div className={styles['comment-header']}>
        {comment.username ? (
          <Avatar
            src={
              comment.avatar_mediafile
                ? config.api.baseURL + '/upload/get/' + comment.avatar_mediafile.id
                : ''
            }
            onError={() => {
              console.log('img-error');
              return true;
            }}
            icon={comment.is_team_reply ? <TeamOutlined /> : null}
            className={comment.is_team_reply ? styles['team-avatar'] : ''}
          />
        ) : (
          <Text strong>Пост</Text>
        )}
        <div className={styles['comment-header-text']}>
          <div className={styles['comment-author']}>
            <div>
              <Text strong>{comment.is_team_reply ? teamName : comment.username}</Text>
              <Text type='secondary' className={styles['comment-time']}>
                {dayjs.utc(created_at).format('D MMMM YYYY [в] HH:mm')}
              </Text>
              <Space
                size={0}
                split={<Divider type='vertical' />}
                className={styles['platform-icons']}
              >
                {getIcon(comment.platform)}
              </Space>
            </div>
            {comment.username && (
              <div>
                <Text className={styles['comment-full-name']}>{comment.full_name}</Text>
              </div>
            )}
          </div>
          {comment.post_union_id && (
            <div>
              <Text
                type='secondary'
                style={{ marginTop: 'auto', marginBottom: 'auto' }}
                onClick={handlePostClick}
              >
                К <a>посту</a>
              </Text>
            </div>
          )}
        </div>
      </div>

      <div className={styles['comment-content']}>
        <Text>{comment.text}</Text>
      </div>
      {comment.attachments.length > 0 && (
        <Carousel arrows className={styles['image']}>
          {comment.attachments.map((preview) => (
            <div key={preview.id} className={styles['image']}>
              {preview.file_type == 'sticker' ? (
                <>[Стикер]</>
              ) : (
                <img
                  src={'http://localhost:80/api/upload/get/' + preview.id}
                  className={styles['image']}
                />
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
