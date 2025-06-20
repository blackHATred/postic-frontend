import React, { useContext, useEffect, useRef, useState } from 'react';
import { Divider, Space, Typography } from 'antd';
import styles from './styles.module.scss';
import { Post } from '../../../models/Post/types';
import ClickableButton from '../../ui/Button/Button';
import Icon, {
  CommentOutlined,
  DeleteOutlined,
  EditOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { LiaQuestionCircle, LiaTelegram, LiaTwitter, LiaVk } from 'react-icons/lia';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../app/App.routes';
import MediaRenderer from '../Comment/MediaRenderer';
import { DeletePost, GetProfile } from '../../../api/api';
import { PostReq } from '../../../models/Analytics/types';
import { setEditPostDialog } from '../../../stores/basePageDialogsSlice';
import './selected_style.css';
import { removePost, setSelectedPostId } from '../../../stores/postsSlice';
import { NotificationContext } from '../../../api/notification';

const { Text, Paragraph } = Typography;

interface PostProps {
  post: Post;
  isDetailed?: boolean;
}

const PostComponent: React.FC<PostProps> = ({ post, isDetailed }) => {
  const [userNickname, setUserNickname] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserNickname = async () => {
      try {
        if (post.user_id) {
          const response = await GetProfile(post.user_id.toString());
          if (response && response.nickname) {
            setUserNickname(response.nickname);
          }
        }
      } catch (error) {
        console.error('Ошибка при получении информации о пользователе:', error);
      }
    };

    fetchUserNickname();
  }, [post.user_id]);

  const getIcon = (platform: string) => {
    switch (platform) {
      case 'vk':
        return <LiaVk className={styles['icon']} />;
      case 'tg':
        return <LiaTelegram className={styles['icon']} />;
      case 'twitter':
        return <LiaTwitter className={styles['icon']} />;
    }
    return <LiaQuestionCircle className={styles['icon']} />;
  };
  const [ellipsis] = useState(true);

  const dispatch = useAppDispatch();
  const refer = useRef<HTMLDivElement>(null);
  const attach_files = post.attachments
    ? post.attachments.filter(
        (el) => el.file_type != 'photo' && el.file_type != 'video' && el.file_type != 'sticker',
      )
    : [];
  const attach_images = post.attachments
    ? post.attachments.filter(
        (el) => el.file_type === 'photo' || el.file_type === 'video' || el.file_type === 'sticker',
      )
    : [];

  const navigate = useNavigate();

  const selectedTeam = useAppSelector((state) => state.teams.globalActiveTeamId);
  const selectedUser = useAppSelector((state) => state.teams.currentUserId);
  const teams = useAppSelector((state) => state.teams.teams);
  const notificationManager = useContext(NotificationContext);

  const userRoles =
    teams
      .find((team) => team.id == selectedTeam)
      ?.users.find((user) => user.user_id == selectedUser)?.roles || [];

  const hasCommentsAccess = userRoles.some((role) => role === 'comments' || role === 'admin');

  const onCommentClick = () => {
    dispatch(setSelectedPostId(post.id));
    setTimeout(() => navigate(routes.post(post.id)), 100);
  };

  return (
    <div
      ref={refer}
      {...(isDetailed ? { className: styles['postDetailed'] } : { className: styles['post'] })}
      id={String(post.id)}
    >
      {/* хедер*/}
      <div className={styles['post-header']}>
        <div className={styles['post-header-info']}>
          <div className={styles['post-header-info-text']}>
            <Text strong className={styles['post-name']}>
              {userNickname ? userNickname : `Модератор ${post.user_id}`}
            </Text>
            {post.pub_datetime && new Date(post.pub_datetime) > new Date() ? (
              <Text type='secondary' className={styles['post-name']}></Text>
            ) : (
              <Text type='secondary' className={styles['post-time']}>
                {dayjs(post.created_at).format('DD MMMM HH:mm')}
              </Text>
            )}

            <Space size={0} split={<Divider type='vertical' />}>
              {post.platforms?.map((plat) => {
                return getIcon(plat);
              })}
            </Space>
          </div>
        </div>
        <div className={styles['post-header-buttons']}>
          {(!post.pub_datetime || new Date(post.pub_datetime) <= new Date()) && (
            <>
              {!isDetailed && hasCommentsAccess ? (
                <ClickableButton
                  text='Комментарии'
                  type='link'
                  icon={<CommentOutlined />}
                  withPopover={true}
                  popoverContent='Посмотреть комментарии к посту'
                  onButtonClick={onCommentClick}
                />
              ) : (
                <></>
              )}
            </>
          )}
          {post.pub_datetime && new Date(post.pub_datetime) > new Date() && (
            <Text type='secondary'>
              Будет опубликовано {dayjs(post.pub_datetime).format('D MMMM YYYY [в] HH:mm')}
            </Text>
          )}
        </div>
      </div>
      <Divider className={styles.customDivider} />
      <div className={styles['post-content']}>
        <div className={styles['post-content-text']}>
          <Paragraph
            style={{ whiteSpace: 'pre-line' }}
            ellipsis={ellipsis ? { rows: 8, expandable: true, symbol: 'Читать далее' } : false}
          >
            {post.text}
          </Paragraph>
        </div>
        <div className={styles['post-content-attachments']}>
          {attach_files.length > 0 &&
            attach_files?.map((attachment, index) => (
              <div className={styles['post-content-attachment']} key={index}>
                <Icon component={PaperClipOutlined} />
                <Text className={styles.primaryText}>{attachment.file_path}</Text>
              </div>
            ))}
          {attach_images.length > 0 && (
            <div className={styles['images']}>
              {' '}
              <MediaRenderer attach_images={attach_images} />
            </div>
          )}
        </div>

        <div className={styles['post-content-buttons']}>
          <ClickableButton
            text='Редактировать'
            variant='outlined'
            color='primary'
            icon={<EditOutlined />}
            onButtonClick={() => {
              dispatch(setEditPostDialog({ isOpen: true, postId: post.id, teamId: post.team_id }));
            }}
          />
          <ClickableButton
            text='Удалить'
            variant='outlined'
            color='danger'
            confirm
            icon={<DeleteOutlined />}
            onButtonClick={() => {
              const info: PostReq = {
                team_id: post.team_id,
                post_union_id: post.id,
              };
              DeletePost(info).then((data: any) => {
                if (data.status == 'ok') {
                  if (refer.current) refer.current.className += ' ' + 'animation';
                  setTimeout(() => dispatch(removePost(post)), 350);
                  notificationManager.createNotification('success', 'Пост успешно изменен', '');
                }
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(
  PostComponent,
  (p_1, p_2) =>
    p_1.post.id == p_2.post.id &&
    p_1.post.attachments == p_2.post.attachments &&
    p_1.post.text == p_2.post.text,
);
