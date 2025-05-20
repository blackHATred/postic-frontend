import React, { useState } from 'react';
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
import { setAnswerDialog, setSelectedComment } from '../../../stores/commentSlice';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { Delete, getUpload, MarkAsTicket } from '../../../api/api';
import { setActiveTab } from '../../../stores/basePageDialogsSlice';
import { setScrollToPost, setSelectedPostId } from '../../../stores/postsSlice';
import config from '../../../constants/appConfig';
import MediaRenderer from './MediaRenderer';
import { Team } from '../../../models/Team/types';

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
  const [ellipsis] = useState(true);

  const openAnswerDialog = () => {
    dispatch(setSelectedComment?.(comment));
    dispatch(setAnswerDialog(true));
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
    Delete(res);
    onDelete();
  };
  const handlePostClick = () => {
    dispatch(setActiveTab('1'));
    dispatch(setScrollToPost(comment.post_union_id));
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
      a.download = attach.file_path; // Set to whatever file name you want
      // Now just click the link you created
      // Note that you may have to append the a element to the body somewhere
      // for this to work in Firefox
      a.click();
    });
  };

  return (
    <div className={styles.comment}>
      <div className={isTicket ? styles['ticket-header'] : styles['comment-header']}>
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
              <Text className={styles['comment-full-name']}>{comment.username}</Text>
            </div>
          </div>
        </div>
      </div>

      <div className={styles['comment-content']}>
        <Paragraph
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
            confirm
            onButtonClick={deleteComment}
          />
        </div>
        <div className={styles['comment-buttons-right']}>
          <ClickableButton
            type='default'
            variant='outlined'
            color={isTicket ? 'gold' : 'default'}
            withPopover={true}
            popoverContent={isTicket ? 'Решить тикет' : 'Отправить в тикет-систему'}
            icon={isTicket ? <DisconnectOutlined /> : <TagOutlined />}
            onButtonClick={isTicket ? () => handleMarkTicket(false) : () => handleMarkTicket(true)}
          ></ClickableButton>
        </div>
      </div>
    </div>
  );
};

export default CommentComponent;
