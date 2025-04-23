import React, { useState } from 'react';
import { Avatar, Carousel, Divider, Space, Typography } from 'antd';
import styles from './styles.module.scss';
import { Comment, DeleteComment, Ticket } from '../../../models/Comment/types';
import dayjs from 'dayjs';
import { LiaQuestionCircle, LiaTelegram, LiaTwitter, LiaVk } from 'react-icons/lia';
import ClickableButton from '../../ui/Button/Button';
import {
  DeleteOutlined,
  DisconnectOutlined,
  DoubleRightOutlined,
  TagOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { message } from 'antd';
import { setAnswerDialog, setSelectedComment } from '../../../stores/commentSlice';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { Delete, MarkAsTicket } from '../../../api/api';
import { setActiveTab } from '../../../stores/basePageDialogsSlice';
import { setScrollToPost, setSelectedPostId } from '../../../stores/postsSlice';
import config from '../../../constants/appConfig';

const { Paragraph, Text } = Typography;

interface CommentProps {
  comment: Comment;
  onDelete: () => void;
}

const CommentComponent: React.FC<CommentProps> = ({ comment, onDelete }) => {
  const { created_at = dayjs('0000-00-00 00:00:00') } = comment;
  const dispatch = useAppDispatch();
  const selectedTeamId = useAppSelector((state) => state.teams.globalActiveTeamId);
  const teams = useAppSelector((state) => state.teams.teams);
  const activeTab = useAppSelector((state) => state.basePageDialogs.activeTab);
  const help_mode = useAppSelector((state) => state.settings.helpMode);
  const [ellipsis, setEllipsis] = useState(true);

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
    onDelete();
  };
  const handlePostClick = () => {
    dispatch(setActiveTab('1'));
    dispatch(setScrollToPost(true));
    dispatch(setSelectedPostId(comment.post_union_id));
  };

  const handleMarkTicket = (isTicket: boolean) => {
    const ticketData: Ticket = {
      team_id: selectedTeamId,
      comment_id: Number(comment.id),
      marked_as_ticket: isTicket,
    };
    console.log(ticketData);
    MarkAsTicket(ticketData)
      .then((r) => {
        message.success({
          content: !isTicket ? 'Тикет создан' : 'Тикет удален',
          key: 'ticketOperation',
        });
        console.log('Результат операции с тикетом:', r);
      })
      .catch((error) => {
        message.error({
          content: `Ошибка сети: ${error.message}. Пожалуйста, проверьте соединение с сервером.`,
          key: 'ticketOperation',
        });
        console.error('Ошибка при операции с тикетом:', error);
      });
  };

  return (
    <div className={comment.username || comment.is_team_reply ? styles.comment : styles.post}>
      <div className={styles['comment-header']}>
        {comment.username || comment.is_team_reply ? (
          <Avatar
            src={
              comment.avatar_mediafile &&
              config.api.baseURL + '/upload/get/' + comment.avatar_mediafile.id
            }
            onError={() => {
              console.log('img-error');
              return true;
            }}
            icon={<TeamOutlined />}
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
            <div>
              <Text className={styles['comment-full-name']}>{comment.full_name}</Text>
            </div>
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
        <Paragraph
          ellipsis={ellipsis ? { rows: 4, expandable: true, symbol: 'Читать далее' } : false}
        >
          {comment.text}
        </Paragraph>
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
      <div className={styles['comment-buttons']}>
        <div className={styles['comment-buttons-left']}>
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
        <div className={styles['comment-buttons-right']}>
          <ClickableButton
            type='default'
            variant='outlined'
            withPopover={help_mode ? true : false}
            popoverContent={
              help_mode
                ? activeTab === '4'
                  ? 'Решить тикет'
                  : 'Отправить в тикет-систему'
                : undefined
            }
            color={'default'}
            icon={activeTab === '4' ? <DisconnectOutlined /> : <TagOutlined />}
            onButtonClick={
              activeTab === '4' ? () => handleMarkTicket(false) : () => handleMarkTicket(true)
            }
          ></ClickableButton>
        </div>
      </div>
    </div>
  );
};

export default CommentComponent;
