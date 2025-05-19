import React, { useEffect, useRef, useState } from 'react';
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
import { setComments } from '../../../stores/commentSlice';
import MediaRenderer from '../Comment/MediaRenderer';
import { DeletePost } from '../../../api/api';
import { PostReq } from '../../../models/Analytics/types';

const { Text, Paragraph } = Typography;

interface PostProps {
  post: Post;
  isDetailed?: boolean;
}

const PostComponent: React.FC<PostProps> = ({ post, isDetailed }) => {
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
  const [ellipsis] = useState(true);

  useEffect(() => {
    console.log('reload');
  });

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

  const userRoles =
    teams
      .find((team) => team.id == selectedTeam)
      ?.users.find((user) => user.user_id == selectedUser)?.roles || [];

  const hasCommentsAccess = userRoles.some((role) => role === 'comments' || role === 'admin');

  const onCommentClick = () => {
    dispatch(setComments([]));
    navigate(routes.post(post.id));
  };

  return (
    <div
      ref={refer}
      {...(isDetailed ? { className: styles.postDetailed } : { className: styles.post })}
      id={String(post.id)}
    >
      {/* хедер*/}
      <div className={styles['post-header']}>
        <div className={styles['post-header-info']}>
          <div className={styles['post-header-info-text']}>
            {/* NOTE: заменить потом на информацию пользователя */}
            <Text strong className={styles['post-name']}>
              Модератор {post.user_id}
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
                  onButtonClick={() => {
                    onCommentClick();
                  }}
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
                  console.info('COMMENT DELETED, REMOVE VISUALLY');
                }
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PostComponent;
