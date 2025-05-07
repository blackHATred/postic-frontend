import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Avatar, Carousel, Divider, Image, Space, Typography } from 'antd';
import styles from './styles.module.scss';
import { Comment, DeleteComment, Ticket } from '../../../models/Comment/types';
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
import { Delete, getUpload, getUploadUrl, MarkAsTicket } from '../../../api/api';
import { setActiveTab } from '../../../stores/basePageDialogsSlice';
import { setScrollToPost, setSelectedPostId } from '../../../stores/postsSlice';
import config from '../../../constants/appConfig';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';

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
  const [sticker, setSticker] = useState(null);
  const LottieRef = useRef<LottieRefCurrentProps>(null);
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
      const team = teams.find((t: any) => t.id === comment.team_id);
      return team?.name || 'Команда';
    }
    return comment.full_name;
  }, [comment.team_id, comment.full_name, comment.is_team_reply, teams]);

  const LazyVideo = React.lazy(() => import('react-player'));

  const attach_files = comment.attachments
    ? comment.attachments.filter(
        (el) => el.file_type != 'photo' && el.file_type != 'video' && el.file_type != 'sticker',
      )
    : [];
  const attach_images = comment.attachments
    ? comment.attachments.filter(
        (el) => el.file_type === 'photo' || el.file_type === 'video' || el.file_type === 'sticker',
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
    dispatch(setScrollToPost(true));
    dispatch(setSelectedPostId(comment.post_union_id));
  };

  const handleMarkTicket = (isTicket: boolean) => {
    const ticketData: Ticket = {
      team_id: selectedTeamId,
      comment_id: Number(comment.id),
      marked_as_ticket: isTicket,
    };
    MarkAsTicket(ticketData)
      .then((r) => {
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

  useEffect(() => {
    if (
      comment &&
      comment.attachments &&
      comment.attachments.length > 0 &&
      comment.attachments[0] &&
      comment.attachments[0].file_type == 'sticker'
    ) {
      getUpload(comment.attachments[0].id).then((data: any) => {
        setSticker(data);
      });
    } else {
      return;
    }
  }, []);

  return (
    <div className={styles.comment}>
      <div className={styles['comment-header']}>
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
          <div className={styles['post-content-attachment']} key={index}>
            <Icon component={PaperClipOutlined} />
            <Text className={styles.primaryText}>{attachment.file_path}</Text>
          </div>
        ))}
      {attach_images.length > 0 &&
        (attach_images.length > 1 ? (
          <Carousel arrows className={styles['images']}>
            {attach_images.map((preview) => (
              <div key={preview.id}>
                {preview.file_path.endsWith('.webm') || preview.file_path.endsWith('.mp4') ? (
                  <Suspense fallback={<div className={styles['images']}></div>}>
                    <LazyVideo
                      controls
                      light
                      url={getUploadUrl(preview.id)}
                      height={250}
                      width={'100%'}
                      className={styles['video']}
                    />
                  </Suspense>
                ) : (
                  <Image className={styles['image']} height={250} src={getUploadUrl(preview.id)} />
                )}
              </div>
            ))}
          </Carousel>
        ) : attach_images[0].file_path.endsWith('.webm') ||
          attach_images[0].file_path.endsWith('.mp4') ? (
          <Suspense fallback={<div className={styles['images']}></div>}>
            <LazyVideo
              controls
              light
              url={getUploadUrl(attach_images[0].id)}
              height={250}
              width={'100%'}
              className={styles['video']}
            />
          </Suspense>
        ) : attach_images[0].file_type == 'sticker' &&
          attach_images[0].file_path.endsWith('.json') ? (
          <Lottie
            lottieRef={LottieRef}
            className={styles['image']}
            animationData={sticker}
            loop={false}
            onClick={() => {
              LottieRef.current?.goToAndPlay(0);
            }}
          />
        ) : (
          <div key={attach_images[0].id} className={styles['image']}>
            <Image height={250} src={getUploadUrl(attach_images[0].id)} />
          </div>
        ))}
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
            icon={isTicket ? <DisconnectOutlined /> : <TagOutlined />}
            onButtonClick={isTicket ? () => handleMarkTicket(false) : () => handleMarkTicket(true)}
          ></ClickableButton>
        </div>
      </div>
    </div>
  );
};

export default CommentComponent;
