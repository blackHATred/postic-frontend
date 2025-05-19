import React, { FC, useEffect, useState } from 'react';
import { Input, Divider, DatePicker, Form } from 'antd';
import DialogBox from '../dialogBox/DialogBox';
import styles from './styles.module.scss';
import ClickableButton from '../../ui/Button/Button';
import { EditOutlined, RobotOutlined, SmileOutlined } from '@ant-design/icons';
import PlatformSettings from './PlatformSettings';
import FileUploader from './FileUploader';
import { Dayjs } from 'dayjs';
import Picker from 'emoji-picker-react';
import { getPost, sendPostRequest } from '../../../api/api';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import {
  addFile,
  clearFiles,
  removeFile,
  setCreatePostDialog,
  setPostStatusDialog,
} from '../../../stores/basePageDialogsSlice';
import ru from 'antd/es/date-picker/locale/ru_RU';
import { Post, sendPostResult } from '../../../models/Post/types';
import { addPost, setSelectedPostId } from '../../../stores/postsSlice';
import { EmojiStyle } from 'emoji-picker-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Categories } from 'emoji-picker-react';
import debounce from 'lodash/debounce';
import { Checkbox, Button, Space, Typography } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

dayjs.extend(utc);

const { Text } = Typography;

const buddhistLocale: typeof ru = {
  ...ru,
  lang: {
    ...ru.lang,
    fieldDateTimeFormat: 'DD-MM-YYYY HH:mm',
    yearFormat: 'YYYY',
    cellYearFormat: 'YYYY',
  },
};

const MAX_TEXT_LENGTH = {
  vk: 16384,
  tg: 4096,
  withFiles: 1024,
};

const emoji_config = [
  {
    category: Categories.SUGGESTED,
    name: 'Недавние',
  },
  {
    category: Categories.SMILEYS_PEOPLE,
    name: 'Эмоции и люди',
  },
  {
    category: Categories.ANIMALS_NATURE,
    name: 'Животные и природа',
  },
  {
    category: Categories.FOOD_DRINK,
    name: 'Еда',
  },
  {
    category: Categories.TRAVEL_PLACES,
    name: 'Путешествия',
  },
  {
    category: Categories.ACTIVITIES,
    name: 'Активнсть',
  },
  {
    category: Categories.OBJECTS,
    name: 'Объекты',
  },
  {
    category: Categories.SYMBOLS,
    name: 'Симболы',
  },
  {
    category: Categories.FLAGS,
    name: 'Флаги',
  },
];

const CreatePostDialog: FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [postText, setPostText] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.basePageDialogs.createPostDialog.isOpen);
  const team_id = useAppSelector((state) => state.teams.globalActiveTeamId);
  const fileIds = useAppSelector((state) => state.basePageDialogs.createPostDialog.files);
  const [files, setFiles] = useState<{ id: string; files: any }[]>([]);

  const [platformError, setPlatformError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const activeFilter = useAppSelector((state) => state.posts.activePostFilter);

  const validateTextWithDebounce = React.useRef(
    debounce((text: string, fileCount: number, platforms: string[]) => {
      if (text.trim() === '' && fileCount === 0) {
        setContentError('Добавьте текст или прикрепите файл');
        return;
      }

      const hasFiles = fileCount > 0;

      for (const platform of platforms) {
        const maxLength = hasFiles
          ? MAX_TEXT_LENGTH.withFiles
          : MAX_TEXT_LENGTH[platform as keyof typeof MAX_TEXT_LENGTH];

        if (text.length > maxLength) {
          setContentError(
            hasFiles
              ? `При наличии файлов длина текста ограничена до ${MAX_TEXT_LENGTH.withFiles} символов`
              : `Длина текста превышает лимит для ${platform}`,
          );
          return;
        }
      }
      setContentError(null);
    }, 300),
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setPostText(newText);
    validateTextWithDebounce.current(newText, files.length, selectedPlatforms);
  };

  useEffect(() => {
    return () => validateTextWithDebounce.current.cancel();
  }, []);

  const validateTextLength = (): string | null => {
    if (!postText.trim() && files.length === 0) {
      return 'Добавьте текст или прикрепите файл';
    }

    const hasFiles = files.length > 0;

    for (const platform of selectedPlatforms) {
      const maxLength = hasFiles
        ? MAX_TEXT_LENGTH.withFiles
        : MAX_TEXT_LENGTH[platform as keyof typeof MAX_TEXT_LENGTH];

      if (postText.length > maxLength) {
        return hasFiles
          ? `При наличии файлов длина текста ограничена до ${MAX_TEXT_LENGTH.withFiles} символов`
          : `Длина текста превышает максимально допустимую для ${platform}: ${MAX_TEXT_LENGTH[platform as keyof typeof MAX_TEXT_LENGTH]} символов`;
      }
    }

    return null;
  };

  const goToNextStep = () => {
    if (currentStep === 1) {
      if (selectedPlatforms.length === 0) {
        setPlatformError('Выберите хотя бы одну платформу для публикации');
        return;
      }
      setPlatformError(null);
    } else if (currentStep === 2) {
      const textError = validateTextLength();
      if (textError) {
        setContentError(textError);
        return;
      }
      setContentError(null);
    }

    setCurrentStep(currentStep + 1);
  };

  const goToPreviousStep = () => {
    setContentError('');
    setSelectedDate(null);
    setIsTimePickerVisible(false);
    setCurrentStep(currentStep - 1);
  };

  const onOk = () => {
    if (selectedDate) {
      if (selectedDate <= dayjs()) {
        setContentError('Дата должна быть позже нынешнего времени');
        return;
      }
      if (selectedDate >= dayjs().add(1, 'year')) {
        setContentError('Дата должна быть не позже чем через год от нынешнего времени');
        return;
      }
    }

    const postPayload = {
      text: postText,
      attachments: fileIds,
      platforms: selectedPlatforms,
      team_id: team_id,
      pub_datetime: selectedDate ? selectedDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ') : undefined,
    };

    sendPostRequest(postPayload).then((data: sendPostResult) => {
      getPost(team_id, data.post_id).then((res: { post: Post }) => {
        if (res.post) {
          const isScheduledPost =
            res.post.pub_datetime && new Date(res.post.pub_datetime) > new Date();

          if (isScheduledPost) {
            if (activeFilter != 'published') dispatch(addPost(res.post));
          } else {
            if (activeFilter != 'scheduled') dispatch(addPost(res.post));
            dispatch(setPostStatusDialog(true));
          }
          dispatch(setSelectedPostId(data.post_id));
        } else {
          console.error('Ошибка получения поста:', res);
        }
        clearFields();
      });
    });

    dispatch(setCreatePostDialog(false));
  };

  const clearFields = () => {
    setCurrentStep(1);
    setIsTimePickerVisible(false);
    setPostText('');
    setValidationErrors([]);
    setPlatformError(null);
    setContentError(null);
    setSelectedDate(null);
    setSelectedPlatforms([]);
    setShowEmojiPicker(false);
    dispatch(clearFiles());
    setFiles([]);
  };

  const onCancel = async () => {
    dispatch(setCreatePostDialog(false));
    setShowEmojiPicker(false);
    clearFields();
  };

  const onEmojiClick = (emojiObject: any) => {
    setPostText((prevText) => prevText + emojiObject.emoji);
  };

  const addFiles = (id: string, file: any) => {
    setFiles([...files, { id: id, files: file }]);
    dispatch(addFile(id));
    setContentError(null);
  };

  const removeFiles = (file: any) => {
    const id = files.filter((filed) => {
      return filed.files.uid == file.uid;
    })[0].id;
    dispatch(removeFile(id));

    const updatedFiles = files.filter((filed) => {
      return filed.files.uid != file.uid;
    });

    setFiles(updatedFiles);

    if (currentStep === 2) {
      if (postText.trim() === '' && updatedFiles.length === 0) {
        setContentError('Добавьте текст или прикрепите файл');
      } else {
        validateTextWithDebounce.current(postText, updatedFiles.length, selectedPlatforms);
      }
    }
  };

  const activePlatforms = useAppSelector((state) => state.teams.globalActivePlatforms);
  const linkedPlatforms = activePlatforms.filter((p) => p.isLinked);

  const renderStep1 = () => {
    const selectAll = () => {
      setSelectedPlatforms(linkedPlatforms.map((p) => p.platform));
      setPlatformError(null);
    };

    const clearAll = () => {
      setSelectedPlatforms([]);
    };

    return (
      <>
        <div className={styles['post']}>
          <div className={styles['platforms-header']}>
            <Text strong>Выберите платформы для публикации</Text>
          </div>

          <div className={styles['platforms-list']}>
            {linkedPlatforms.length > 0 ? (
              <>
                {linkedPlatforms.length > 1 && (
                  <div className={styles['platforms-list-buttons']}>
                    <Button
                      icon={<CheckOutlined />}
                      size='small'
                      variant='text'
                      color='geekblue'
                      onClick={selectAll}
                      disabled={linkedPlatforms.length === 0}
                    >
                      Выбрать все
                    </Button>
                    <Button
                      icon={<CloseOutlined />}
                      size='small'
                      variant='text'
                      color='default'
                      onClick={clearAll}
                      disabled={selectedPlatforms.length === 0}
                    >
                      Очистить выбор
                    </Button>
                  </div>
                )}
                <div>
                  <Checkbox.Group
                    value={selectedPlatforms}
                    onChange={(values) => {
                      const selected = values as string[];
                      setSelectedPlatforms(selected);
                      setPlatformError(
                        selected.length === 0 ? 'Выберите хотя бы одну платформу' : null,
                      );
                    }}
                  >
                    <Space direction='vertical'>
                      {linkedPlatforms.map((platform) => (
                        <Checkbox key={platform.platform} value={platform.platform}>
                          {platform.name}
                        </Checkbox>
                      ))}
                    </Space>
                  </Checkbox.Group>
                </div>
              </>
            ) : (
              <Text type='secondary'>К команде не привязано ни одной платформы</Text>
            )}
          </div>

          {platformError && <div className={styles['error-message']}>{platformError}</div>}
        </div>
      </>
    );
  };

  const renderStep2 = () => (
    <>
      <div className={styles['post']}>
        <Form.Item validateStatus={contentError ? 'error' : ''} help={contentError}>
          <div className={styles['post-text']}>
            <Input.TextArea
              rows={3}
              placeholder='Введите текст поста'
              value={postText}
              onChange={handleTextChange}
            />
            <div className={styles['post-icons']}>
              <ClickableButton
                icon={<EditOutlined />}
                type='default'
                size='small'
                withPopover={true}
                popoverContent={
                  'Редактор автоматически исправит грамматические, пунктуационные и другие ошибки в тексте'
                }
                disabled={true}
              />
              <ClickableButton
                icon={<RobotOutlined />}
                type='default'
                size='small'
                withPopover={true}
                popoverContent={'ИИ-генерация текста поста'}
                disabled={true}
              />
              <ClickableButton
                icon={<SmileOutlined />}
                type='default'
                size='small'
                withPopover={true}
                onButtonClick={() => setShowEmojiPicker(!showEmojiPicker)}
                popoverContent={'Эмодзи'}
              />
            </div>
          </div>
        </Form.Item>

        {showEmojiPicker && (
          <div className={styles.emojiPicker}>
            <Picker
              onEmojiClick={onEmojiClick}
              lazyLoadEmojis={true}
              emojiStyle={EmojiStyle.APPLE}
              previewConfig={{ showPreview: false }}
              categories={emoji_config}
              searchPlaceHolder='Поиск'
            />
          </div>
        )}

        <FileUploader
          addFiles={addFiles}
          removeFile={removeFiles}
          files={files.map((file) => file.files)}
        />

        <PlatformSettings selectedPlatforms={selectedPlatforms} />
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <div className={styles['post']}>
        <div className={styles['post-time']}>
          <Checkbox
            checked={isTimePickerVisible}
            onChange={(e) => {
              const checked = e.target.checked;
              setIsTimePickerVisible(checked);
              if (!checked) {
                setSelectedDate(null);
              }
            }}
          >
            Сделать публикацию отложенной
          </Checkbox>
        </div>
        {isTimePickerVisible && (
          <div className={styles['time-and-data']}>
            <DatePicker
              placeholder='Выберите дату и время'
              showTime
              locale={buddhistLocale}
              status={contentError ? 'error' : ''}
              defaultValue={dayjs()}
              onChange={(date: Dayjs | null) => {
                setSelectedDate(date);
                if (date) {
                  if (date <= dayjs()) {
                    setContentError('Дата должна быть позже нынешнего времени');
                    return;
                  } else if (date >= dayjs().add(1, 'year')) {
                    setContentError('Дата должна быть не позже чем через год от нынешнего времени');
                    return;
                  } else {
                    setContentError('');
                  }
                } else {
                  setContentError('');
                }
              }}
            />
          </div>
        )}
        <Text type='danger'>{contentError}</Text>
      </div>
    </>
  );

  const getButtonsForCurrentStep = () => {
    if (currentStep === 1) {
      return [
        {
          text: 'Далее',
          onButtonClick: goToNextStep,
        },
      ];
    } else if (currentStep === 2) {
      return [
        {
          text: 'Назад',
          onButtonClick: goToPreviousStep,
          type: 'default' as const,
        },
        {
          text: 'Далее',
          onButtonClick: goToNextStep,
        },
      ];
    } else {
      return [
        {
          text: 'Назад',
          onButtonClick: goToPreviousStep,
          type: 'default' as const,
        },
        {
          text: 'Опубликовать',
          onButtonClick: onOk,
        },
      ];
    }
  };

  const getTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Выбор платформ';
      case 2:
        return 'Содержание';
      case 3:
        return 'Время публикации';
      default:
        return 'Создание поста';
    }
  };

  return (
    <DialogBox
      bottomButtons={getButtonsForCurrentStep()}
      isOpen={isOpen}
      onCancelClick={onCancel}
      title={getTitle()}
      isCenter={true}
    >
      <Divider>{`Шаг ${currentStep} из 3`}</Divider>

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {validationErrors.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {validationErrors.map((error, index) => (
            <Text key={index} style={{ color: 'red', display: 'block' }}>
              {error}
            </Text>
          ))}
        </div>
      )}
    </DialogBox>
  );
};

export default CreatePostDialog;
