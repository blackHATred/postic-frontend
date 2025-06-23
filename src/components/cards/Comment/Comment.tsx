import React, { useContext, useEffect, useState } from 'react';
import { Avatar, Divider, Space, Typography } from 'antd';
import styles from './styles.module.scss';
import { Comment, CommentAttachments, DeleteComment, Ticket } from '../../../models/Comment/types';
import dayjs from 'dayjs';
import { LiaQuestionCircle, LiaTelegram, LiaTwitter, LiaVk } from 'react-icons/lia';
import ClickableButton from '../../ui/Button/Button';
import Icon, {
  DeleteOutlined,
  DisconnectOutlined,
  DoubleRightOutlined,
  PaperClipOutlined,
  TagOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { message } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { Delete, getUpload, MarkAsTicket } from '../../../api/api';
import { setActiveTab } from '../../../stores/basePageDialogsSlice';
import { setSelectedPostId } from '../../../stores/postsSlice';
import config from '../../../constants/appConfig';
import MediaRenderer from './MediaRenderer';
import { Team } from '../../../models/Team/types';
import { NotificationContext } from '../../../api/notification';
import InlineReplyForm from './InlineReplyForm';

const { Paragraph, Text } = Typography;

interface CommentProps {
  comment: Comment;
}

const CommentComponent: React.FC<CommentProps> = ({ comment }) => {
  const { created_at = dayjs('0000-00-00 00:00:00') } = comment;
  const dispatch = useAppDispatch();
  const selectedTeamId = useAppSelector((state) => state.teams.globalActiveTeamId);
  const teams = useAppSelector((state) => state.teams.teams);
  const [ellipsis] = useState(true);
  const notificationManager = useContext(NotificationContext);
  const [showInlineReply, setShowInlineReply] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const openAnswerDialog = () => {
    // проверка на мобильное устройство
    // if (isMobile) {
    setShowInlineReply(true);
    // } else {
    // На десктопе модальное окно
    // dispatch(setSelectedComment?.(comment));
    // dispatch(setAnswerDialog(true));
    // }
  };

  const closeInlineReply = () => {
    setShowInlineReply(false);
  };

  const [isTicket, setIsTicket] = useState(comment.marked_as_ticket);

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
      const team = teams.find((t: Team) => t.id === comment.team_id);
      return team?.name || 'Команда';
    }
    return comment.full_name;
  }, [comment.team_id, comment.full_name, comment.is_team_reply, teams]);

  const attach_files = comment.attachments
    ? comment.attachments.filter(
        (el) =>
          el.file_type != 'photo' &&
          el.file_type != 'video' &&
          el.file_type != 'sticker' &&
          !el.file_path.endsWith('.gif') &&
          !el.file_path.endsWith('.mp4'),
      )
    : [];
  const attach_images = comment.attachments
    ? comment.attachments.filter(
        (el) =>
          el.file_type === 'photo' ||
          el.file_type === 'video' ||
          el.file_type === 'sticker' ||
          el.file_path.endsWith('.gif') ||
          el.file_path.endsWith('.mp4'),
      )
    : [];

  const deleteComment = () => {
    const res: DeleteComment = {
      team_id: selectedTeamId,
      post_comment_id: Number(comment.id),
      ban_user: false,
    };
    document.body.style.cursor = 'wait';

    Delete(res)
      .then(() => {
        document.body.style.cursor = 'default';
        notificationManager.createNotification('success', `Комментарий успещно удален`, '');
      })
      .catch(() => {
        document.body.style.cursor = 'default';
        notificationManager.createNotification('error', `Ошибка удаления коментария`, '');
      });
  };
  const handlePostClick = () => {
    dispatch(setActiveTab('1'));
    //dispatch(setScrollToPost(comment.post_union_id));
    dispatch(setSelectedPostId(comment.post_union_id));
  };

  const handleMarkTicket = (isTicket: boolean) => {
    const ticketData: Ticket = {
      team_id: selectedTeamId,
      comment_id: Number(comment.id),
      marked_as_ticket: isTicket,
    };
    MarkAsTicket(ticketData)
      .then(() => {
        message.success({
          content: !isTicket ? 'Тикет создан' : 'Тикет удален',
          key: 'ticketOperation',
        });
        setIsTicket(isTicket);
      })
      .catch((error) => {
        message.error({
          content: `Ошибка сети: ${error.message}. Пожалуйста, проверьте соединение с сервером.`,
          key: 'ticketOperation',
        });
      });
  };

  const clickedFile = (attach: CommentAttachments) => {
    getUpload(attach.id).then((data) => {
      const file = new Blob([data], { type: 'application/octet-stream' });
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(file);
      a.download = attach.file_path;
      a.click();
    });
  };

  return (
    <div className={!comment.is_deleted ? styles.comment : styles['deleted']}>
      <div
        className={
          isTicket && !comment.is_deleted ? styles['ticket-header'] : styles['comment-header']
        }
      >
        <Avatar
          src={
            comment.avatar_mediafile &&
            config.api.baseURL + '/upload/get/' + comment.avatar_mediafile.id
          }
          onError={() => {
            return true;
          }}
          icon={<TeamOutlined />}
          className={comment.is_team_reply ? styles['team-avatar'] : ''}
        />

        <div className={styles['comment-header-text']}>
          <div className={styles['comment-author']}>
            <div>
              <Text strong>{comment.is_team_reply ? teamName : comment.full_name}</Text>
              <Text type='secondary' className={styles['comment-time']}>
                {dayjs(created_at).format('D MMMM YYYY [в] HH:mm')}
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
              <Text className={styles['comment-full-name']}>{comment.username}</Text>
            </div>
          </div>
        </div>
      </div>

      <div className={styles['comment-content']}>
        <Paragraph
          italic={comment.is_deleted}
          ellipsis={ellipsis ? { rows: 4, expandable: true, symbol: 'Читать далее' } : false}
        >
          {comment.text}
        </Paragraph>
      </div>
      {attach_files.length > 0 &&
        attach_files?.map((attachment, index) => (
          <div
            className={styles['post-content-attachment']}
            key={index}
            onClick={() => clickedFile(attachment)}
          >
            <Icon component={PaperClipOutlined} className={styles['clip']} />
            <Text className={styles.primaryText}>{attachment.file_path}</Text>
          </div>
        ))}

      {attach_images.length > 0 && (
        <div className={styles['image']}>
          {' '}
          <MediaRenderer attach_images={attach_images} />
        </div>
      )}

      {!comment.is_deleted ? (
        <div className={styles['comment-buttons']}>
          <div className={styles['comment-buttons-left']}>
            <ClickableButton
              type='default'
              variant='outlined'
              color='blue'
              text={showInlineReply ? 'Свернуть' : 'Ответить'}
              icon={showInlineReply ? <DoubleRightOutlined rotate={90} /> : <DoubleRightOutlined />}
              onButtonClick={showInlineReply ? closeInlineReply : openAnswerDialog}
            />

            <ClickableButton
              type='default'
              variant='outlined'
              color='danger'
              text='Удалить'
              icon={<DeleteOutlined />}
              confirm
              onButtonClick={deleteComment}
            />
          </div>
          <div className={styles['comment-buttons-right']}>
            <ClickableButton
              type='default'
              variant='outlined'
              color={isTicket && !comment.is_deleted ? 'gold' : 'default'}
              withPopover={true}
              popoverContent={isTicket ? 'Решить тикет' : 'Отправить в тикет-систему'}
              icon={isTicket ? <DisconnectOutlined /> : <TagOutlined />}
              onButtonClick={
                isTicket ? () => handleMarkTicket(false) : () => handleMarkTicket(true)
              }
            ></ClickableButton>
          </div>
        </div>
      ) : (
        <Text type='warning'>Комментарий был удален</Text>
      )}

      {showInlineReply && (
        <div className={styles.inlineReplyWrapper}>
          <InlineReplyForm comment={comment} onCancel={closeInlineReply} />
        </div>
      )}
    </div>
  );
};

export default CommentComponent;
