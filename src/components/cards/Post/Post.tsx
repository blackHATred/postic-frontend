import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Divider, Space, Typography, Image, Carousel } from 'antd';
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
import { getUpload, getUploadUrl } from '../../../api/api';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';

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
    ? post.attachments.filter((el) => el.file_type != 'photo' && el.file_type != 'video')
    : [];
  const attach_images = post.attachments
    ? post.attachments.filter((el) => el.file_type === 'photo' || el.file_type === 'video')
    : [];
  const help_mode = useAppSelector((state) => state.settings.helpMode);
  const navigate = useNavigate();
  const LazyVideo = React.lazy(() => import('react-player'));
  const LottieRef = useRef<LottieRefCurrentProps>(null);
  const [sticker, setSticker] = useState(null);

  const onCommentClick = () => {
    dispatch(setSelectedPostId(post.id));
    dispatch(setComments([]));
    navigate(routes.post(post.id));
  };

  const onSummaryClick = async () => {
    // При нажатии кнопки суммаризации
    dispatch(setSummaryDialog(true));
    dispatch(setSelectedPostId(post.id));
  };

  useEffect(() => {
    if (
      post &&
      post.attachments &&
      post.attachments.length > 0 &&
      post.attachments[0] &&
      post.attachments[0].file_type == 'sticker'
    ) {
      getUpload(post.attachments[0].id).then((data: any) => {
        setSticker(data);
      });
    } else {
      return;
    }
  }, []);

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
                      <Image
                        className={styles['image']}
                        height={250}
                        src={getUploadUrl(preview.id)}
                      />
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
