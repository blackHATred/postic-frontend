import React, { useEffect, useRef } from 'react';
import { Divider, Space, Typography, Image, Collapse, Carousel } from 'antd';
import styles from './styles.module.scss';
import { Post } from '../../../models/Post/types';
import ClickableButton from '../Button/Button';
import Icon, { CommentOutlined, DeleteOutlined, EditOutlined, PaperClipOutlined } from '@ant-design/icons';
import './selected_style.css';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setActiveTab, setSummaryDialog } from '../../../stores/basePageDialogsSlice';
import { setIsOpened, setSelectedPostId } from '../../../stores/postsSlice';
import { LiaQuestionCircle, LiaTelegram, LiaTwitter, LiaVk } from 'react-icons/lia';
import 'dayjs/locale/ru';
import utc from 'dayjs/plugin/utc';
import config from '../../../constants/appConfig';

// часовой пояс и отображение времени
dayjs.locale('ru');
dayjs.extend(utc);
const { Text } = Typography;

const PostComponent: React.FC<Post> = (props: Post) => {
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
  const attach_files = props.attachments ? props.attachments.filter((el) => el.file_type != 'photo') : [];
  const attach_images = props.attachments ? props.attachments.filter((el) => el.file_type === 'photo') : [];
  const isOpened = useAppSelector((state) => state.posts.isOpened[props.id]);
  const help_mode = useAppSelector((state) => state.settings.helpMode);

  useEffect(() => {
    if (props.id === selectedPostId) setSelected();
  }, [scrollToPost]);

  const setSelected = async () => {
    if (refer.current) {
      refer.current.className += ' selected';
      setTimeout(() => {
        dispatch(setSelectedPostId(0));
        if (refer.current) refer.current.className = refer.current.className.replace(' selected', '');
      }, 3000);
    }
  };

  const onCommentClick = () => {
    dispatch(setSelectedPostId(props.id));
    dispatch(setActiveTab('2'));
  };

  const onSummaryClick = async () => {
    // При нажатии кнопки суммаризации
    dispatch(setSummaryDialog(true));
    dispatch(setSelectedPostId(props.id));
  };

  return (
    <div ref={refer} className={styles['post']}>
      {/* хедер*/}
      <div className={styles['post-header']}>
        <div className={styles['post-header-info']}>
          <div className={styles['post-header-info-text']}>
            {/* NOTE: заменить потом на информацию пользователя */}
            <Text strong className={styles['post-name']}>
              Модератор {props.user_id}
            </Text>
            <Text type='secondary' className={styles['post-time']}>
              {dayjs.utc(props.created_at).format('D MMMM YYYY [в] HH:mm')}
            </Text>
            <Space size={0} split={<Divider type='vertical' />}>
              {props.platforms?.map((plat) => {
                return getIcon(plat);
              })}
            </Space>
          </div>
        </div>
        <div className={styles['post-header-buttons']}>
          {(!props.pub_datetime || new Date(props.pub_datetime) <= new Date()) && (
            <>
              <ClickableButton
                text='Комментарии'
                type='link'
                icon={<CommentOutlined />}
                onButtonClick={() => {
                  onCommentClick();
                }}
              />

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
                <ClickableButton text='Суммаризация' variant='dashed' color='primary' onButtonClick={onSummaryClick} />
              )}
            </>
          )}
          {props.pub_datetime && new Date(props.pub_datetime) > new Date() && (
            <Text type='secondary'>Будет опубликовано {dayjs(props.pub_datetime).format('D MMMM YYYY [в] HH:mm')}</Text>
          )}
        </div>
      </div>
      <Divider className={styles.customDivider} />
      <div className={styles['post-content']}>
        <div className={styles['post-content-text']}>
          <Text style={{ whiteSpace: 'pre-line' }}>{props.text}</Text>
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
              onChange={(key) => dispatch(setIsOpened({ key: props.id, value: key.length >= 1 }))}
              defaultActiveKey={isOpened ? '1' : undefined}
              items={[
                {
                  key: '1',
                  label: 'Фотографии',
                  children: (
                    <Carousel arrows>
                      {attach_images.map((preview) => (
                        <div key={preview.id}>
                          <Image src={`${config.api.baseURL}/upload/get/${preview.id}`} />
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
          <ClickableButton text='Редактировать' variant='outlined' color='primary' icon={<EditOutlined />} />
          <ClickableButton text='Удалить' variant='outlined' color='danger' icon={<DeleteOutlined />} />
        </div>
      </div>
    </div>
  );
};

export default PostComponent;
