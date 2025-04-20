import React, { useEffect, useRef } from 'react';
import { Divider, Space, Typography, Image, Collapse, Carousel } from 'antd';
import styles from './styles.module.scss';
import { Post } from '../../../models/Post/types';
import ClickableButton from '../../ui/Button/Button';
import Icon, {
  CommentOutlined,
  DeleteOutlined,
  EditOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import './selected_style.css';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setSummaryDialog } from '../../../stores/basePageDialogsSlice';
import { setIsOpened, setSelectedPostId } from '../../../stores/postsSlice';
import { LiaQuestionCircle, LiaTelegram, LiaTwitter, LiaVk } from 'react-icons/lia';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../app/App.routes';

const { Text } = Typography;

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

  const dispatch = useAppDispatch();
  const scrollToPost = useAppSelector((state) => state.posts.scrollToPost);
  const selectedPostId = useAppSelector((state) => state.posts.selectedPostId);
  const refer = useRef<HTMLDivElement>(null);
  const attach_files = post.attachments
    ? post.attachments.filter((el) => el.file_type != 'photo')
    : [];
  const attach_images = post.attachments
    ? post.attachments.filter((el) => el.file_type === 'photo')
    : [];
  const isOpened = useAppSelector((state) => state.posts.isOpened[post.id]);
  const help_mode = useAppSelector((state) => state.settings.helpMode);
  const navigate = useNavigate();

  useEffect(() => {
    if (post.id === selectedPostId) setSelected();
  }, [scrollToPost]);

  const setSelected = async () => {
    if (refer.current) {
      refer.current.className += ' selected';
      setTimeout(() => {
        dispatch(setSelectedPostId(0));
        if (refer.current)
          refer.current.className = refer.current.className.replace(' selected', '');
      }, 3000);
    }
  };

  const onCommentClick = () => {
    dispatch(setSelectedPostId(post.id));
    navigate(routes.post(post.id));
  };

  const onSummaryClick = async () => {
    // При нажатии кнопки суммаризации
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

            <Text type='secondary' className={styles['post-time']}>
              {dayjs(post.created_at).format('DD.MM.YYYY HH:mm')}
            </Text>
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
                  text='Суммаризация'
                  variant='dashed'
                  color='primary'
                  onButtonClick={onSummaryClick}
                  withPopover={true}
                  popoverContent={'Получить краткий анализ комментариев'}
                />
              ) : (
                <ClickableButton
                  text='Суммаризация'
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
          <Text style={{ whiteSpace: 'pre-line' }}>{post.text}</Text>
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
            <Collapse
              size='small'
              onChange={(key) => dispatch(setIsOpened({ key: post.id, value: key.length >= 1 }))}
              defaultActiveKey={isOpened ? '1' : undefined}
              items={[
                {
                  key: '1',
                  label: 'Фотографии',
                  children: (
                    <Carousel arrows>
                      {attach_images.map((preview) => (
                        <div key={preview.id}>
                          <Image src={'http://localhost:80/api/upload/get/' + preview.id} />
                        </div>
                      ))}
                    </Carousel>
                  ),
                },
              ]}
            />
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
            icon={<DeleteOutlined />}
          />
        </div>
      </div>
    </div>
  );
};

export default PostComponent;
