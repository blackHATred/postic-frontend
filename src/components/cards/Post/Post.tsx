import React, { useRef, useState } from 'react';
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
import { setSummaryDialog } from '../../../stores/basePageDialogsSlice';
import { setSelectedPostId } from '../../../stores/postsSlice';
import { LiaQuestionCircle, LiaTelegram, LiaTwitter, LiaVk } from 'react-icons/lia';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../app/App.routes';
import { setComments } from '../../../stores/commentSlice';
import MediaRenderer from '../Comment/MediaRenderer';

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
  const [ellipsis, setEllipsis] = useState(true);

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
  const help_mode = useAppSelector((state) => state.settings.helpMode);
  const navigate = useNavigate();

  const onCommentClick = () => {
    dispatch(setComments([]));
    navigate(routes.post(post.id));
  };

  const onSummaryClick = async () => {
    dispatch(setSummaryDialog(true));
    dispatch(setSelectedPostId(post.id));
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
                {dayjs(post.created_at).format('DD.MM.YYYY HH:mm')}
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
              {!isDetailed ? (
                <ClickableButton
                  text='Комментарии'
                  type='link'
                  icon={<CommentOutlined />}
                  onButtonClick={() => {
                    onCommentClick();
                  }}
                />
              ) : (
                <></>
              )}

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
            ellipsis={ellipsis ? { rows: 4, expandable: true, symbol: 'Читать далее' } : false}
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
            disabled={true}
          />
          <ClickableButton
            text='Удалить'
            variant='outlined'
            color='danger'
            icon={<DeleteOutlined />}
            disabled={true}
          />
        </div>
      </div>
    </div>
  );
};

export default PostComponent;
