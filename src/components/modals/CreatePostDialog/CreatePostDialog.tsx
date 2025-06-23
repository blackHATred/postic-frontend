import React, { FC, useEffect, useState, useContext } from 'react';
import { Input, Divider, DatePicker, Form } from 'antd';
import DialogBox from '../dialogBox/DialogBox';
import styles from './styles.module.scss';
import ClickableButton from '../../ui/Button/Button';
import {
  EditOutlined,
  RobotOutlined,
  SmileOutlined,
  CheckOutlined,
  CloseOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import PlatformSettings from './PlatformSettings';
import FileUploader from './FileUploader';
import GeneratedImagesViewer from './GeneratedImagesViewer';
import { Dayjs } from 'dayjs';
import Picker from 'emoji-picker-react';
import { fixPublication, getPost, sendPostRequest } from '../../../api/api';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import {
  addFile,
  clearFiles,
  removeFile,
  setCreatePostDialog,
  setGeneratedTextDialog,
  setGeneratePostDialog,
  setPostStatusDialog,
} from '../../../stores/basePageDialogsSlice';
import ru from 'antd/es/date-picker/locale/ru_RU';
import { Post, sendPostResult } from '../../../models/Post/types';
import { addPost, setSelectedPostId } from '../../../stores/postsSlice';
import { EmojiStyle } from 'emoji-picker-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Categories } from 'emoji-picker-react';
import { Checkbox, Button, Space, Typography } from 'antd';
import { withTimeout } from '../../../utils/timeoutUtils';
import { NotificationContext } from '../../../api/notification';

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
  fb: 63206,
  ok: 32000,
  ig: 2200,
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
    name: 'Активность',
  },
  {
    category: Categories.OBJECTS,
    name: 'Объекты',
  },
  {
    category: Categories.SYMBOLS,
    name: 'Символы',
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
  const [isFixingText, setIsFixingText] = useState(false);
  const [fixedText, setFixedText] = useState('');
  const [isFixLoading, setIsFixLoading] = useState(false);
  const [showFixControls, setShowFixControls] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.basePageDialogs.createPostDialog.isOpen);
  const team_id = useAppSelector((state) => state.teams.globalActiveTeamId);
  const fileIds = useAppSelector((state) => state.basePageDialogs.createPostDialog.files);
  const [files, setFiles] = useState<{ id: string; files: any }[]>([]);
  const notificationManager = useContext(NotificationContext);

  const [platformError, setPlatformError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const activeFilter = useAppSelector((state) => state.posts.activePostFilter);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setPostText(newText);

    if (newText.trim() === '' && files.length === 0) {
      setContentError('Добавьте текст или прикрепите файл');
    } else {
      setContentError(null);
    }
  };

  const generatedText = useAppSelector(
    (state) => state.basePageDialogs.generatedTextDialog.generatedText,
  );
  const generatedImages = useAppSelector(
    (state) => state.basePageDialogs.generatedTextDialog.generatedImages,
  );
  const uploadedFileIds = useAppSelector(
    (state) => state.basePageDialogs.generatedTextDialog.uploadedFileIds,
  );
  const isGeneratedTextDialogOpen = useAppSelector(
    (state) => state.basePageDialogs.generatedTextDialog.isOpen,
  );

  const prevGeneratedTextRef = React.useRef('');
  const generatedIdsAdded = React.useRef(false);

  useEffect(() => {
    if (generatedText && generatedText !== prevGeneratedTextRef.current) {
      setPostText((prevText) => {
        const newText = prevText ? `${prevText}\n${generatedText}` : generatedText;
        return newText;
      });
      prevGeneratedTextRef.current = generatedText;

      if (contentError === 'Добавьте текст или прикрепите файл') {
        setContentError(null);
      }
    }
  }, [generatedText, contentError]);

  useEffect(() => {
    if (
      !generatedIdsAdded.current &&
      !isGeneratedTextDialogOpen &&
      uploadedFileIds &&
      uploadedFileIds.length > 0
    ) {
      uploadedFileIds.forEach((fileId) => {
        if (typeof fileId === 'object' && fileId !== null && 'file_id' in fileId) {
          const id = String((fileId as any).file_id);
          dispatch(addFile(id));
        } else if (
          (typeof fileId === 'string' || typeof fileId === 'number') &&
          !fileIds.includes(String(fileId))
        ) {
          const id = String(fileId);
          dispatch(addFile(id));
        }
      });

      if (contentError === 'Добавьте текст или прикрепите файл') {
        setContentError(null);
      }
      generatedIdsAdded.current = true;
      setTimeout(() => {
        dispatch(
          setGeneratedTextDialog({
            isOpen: false,
            generatedText: '',
            generatedImages: generatedImages || [],
            uploadedFileIds: uploadedFileIds || [],
          }),
        );
      }, 100);
    }
  }, [
    uploadedFileIds,
    isGeneratedTextDialogOpen,
    dispatch,
    contentError,
    fileIds,
    generatedImages,
  ]);

  const validateTextLength = (): string | null => {
    // наличие файлов в Redux, а не только в локальном состоянии !!!!!!!!!
    const hasFilesInStore = fileIds.length > 0;

    if (!postText.trim() && files.length === 0 && !hasFilesInStore) {
      return 'Добавьте текст или прикрепите файл';
    }

    const hasFiles = files.length > 0 || hasFilesInStore;
    const normalizedText = postText.replace(/\r\n/g, '\n');

    for (const platform of selectedPlatforms) {
      if (platform === 'tg' && hasFiles && normalizedText.length > 1024) {
        return `Для Telegram с вложениями длина текста ограничена до 1024 символов (сейчас ${normalizedText.length})`;
      }

      if (platform === 'tg' && !hasFiles && normalizedText.length > 4096) {
        return `Для Telegram без вложений длина текста ограничена до 4096 символов (сейчас ${normalizedText.length})`;
      }

      const maxLength = MAX_TEXT_LENGTH[platform as keyof typeof MAX_TEXT_LENGTH];
      if (platform !== 'tg' && normalizedText.length > maxLength) {
        const platformNames: { [key: string]: string } = {
          vk: 'ВКонтакте',
          fb: 'Facebook',
          ok: 'Одноклассники',
          ig: 'Instagram',
        };

        const platformName = platformNames[platform] || platform.toUpperCase();
        return `Длина текста превышает максимально допустимую для ${platformName}: ${maxLength} символов (сейчас ${normalizedText.length})`;
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
        setContentError('Дата должна быть позднее текущего времени');
        return;
      }
      if (selectedDate >= dayjs().add(1, 'year')) {
        setContentError('Дата должна быть не позже чем через год от нынешнего времени');
        return;
      }
    }

    const attachmentsAsNumbers = fileIds.map((id) => parseInt(id, 10));
    const postPayload = {
      text: postText,
      attachments: attachmentsAsNumbers,
      platforms: selectedPlatforms,
      team_id: team_id,
      pub_datetime: selectedDate ? selectedDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ') : undefined,
    };

    const apiPostPayload = {
      ...postPayload,
    } as any;

    sendPostRequest(apiPostPayload)
      .then((data: sendPostResult) => {
        getPost(team_id, data.post_id)
          .then((res: { post: Post }) => {
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

              notificationManager.createNotification(
                'success',
                'Пост успешно создан',
                isScheduledPost ? 'Пост добавлен в расписание' : 'Пост отправлен на публикацию',
              );
            } else {
              notificationManager.createNotification(
                'error',
                'Ошибка публикации',
                'Не удалось получить информацию о созданном посте',
              );
            }
            clearFields();
            dispatch(setCreatePostDialog(false));
          })
          .catch((error) => {
            notificationManager.createNotification(
              'error',
              'Ошибка публикации',
              'Не удалось получить информацию о созданном посте. Пожалуйста, проверьте раздел постов позже.',
            );

            clearFields();
            dispatch(setCreatePostDialog(false));
          });
      })
      .catch((error) => {
        let errorMessage = 'Не удалось создать пост. Пожалуйста, попробуйте позже.';

        if (error.response) {
          const status = error.response.status;

          if (status === 400) {
            errorMessage =
              'Некорректные данные в форме. Пожалуйста, проверьте введенную информацию.';
          } else if (status === 401) {
            errorMessage = 'Необходима авторизация. Пожалуйста, войдите в систему снова.';
          } else if (status === 403) {
            errorMessage = 'У вас нет прав для создания поста в выбранных платформах.';
          } else if (status === 413) {
            errorMessage =
              'Слишком большой размер вложений. Пожалуйста, уменьшите размер или количество файлов.';
          } else if (status === 429) {
            errorMessage = 'Превышен лимит запросов. Пожалуйста, попробуйте позже.';
          }
        }

        notificationManager.createNotification('error', 'Ошибка создания поста', errorMessage);

        clearFields();
        dispatch(setCreatePostDialog(false));
      });
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
    dispatch(
      setGeneratedTextDialog({
        isOpen: false,
        generatedText: '',
        generatedImages: [],
        uploadedFileIds: [],
      }),
    );
    generatedIdsAdded.current = false;
    prevGeneratedTextRef.current = '';
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
    if (contentError === 'Добавьте текст или прикрепите файл') {
      setContentError(null);
    }
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

    if (currentStep === 2 && postText.trim() === '' && updatedFiles.length === 0) {
      setContentError('Добавьте текст или прикрепите файл');
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
                    {selectedPlatforms.length === 0 ? (
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
                    ) : (
                      <Button
                        icon={<CloseOutlined />}
                        size='small'
                        variant='text'
                        color='default'
                        onClick={clearAll}
                      >
                        Очистить все
                      </Button>
                    )}
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
              {!showFixControls ? (
                <>
                  <ClickableButton
                    icon={isFixLoading ? <LoadingOutlined spin /> : <EditOutlined />}
                    type='default'
                    size='small'
                    withPopover={true}
                    popoverContent={
                      'Редактор автоматически исправит грамматические, пунктуационные и другие ошибки в тексте'
                    }
                    onButtonClick={handleFixText}
                    disabled={isFixLoading}
                  />
                  <ClickableButton
                    icon={<RobotOutlined />}
                    type='default'
                    size='small'
                    withPopover={true}
                    popoverContent={'ИИ-генерация текста поста с изображениями'}
                    onButtonClick={() => {
                      generatedIdsAdded.current = false;
                      dispatch(setGeneratePostDialog(true));
                    }}
                  />
                  <ClickableButton
                    icon={showEmojiPicker ? <CloseOutlined /> : <SmileOutlined />}
                    type='default'
                    size='small'
                    withPopover={true}
                    onButtonClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    popoverContent={showEmojiPicker ? 'Закрыть эмодзи' : 'Эмодзи'}
                    className={styles['emoji-button']}
                  />
                </>
              ) : (
                <>
                  <ClickableButton
                    icon={<CheckOutlined />}
                    type='primary'
                    size='small'
                    withPopover={true}
                    popoverContent={'Применить исправленный текст'}
                    onButtonClick={applyFixedText}
                  />
                  <ClickableButton
                    icon={<CloseOutlined />}
                    type='default'
                    size='small'
                    withPopover={true}
                    popoverContent={'Отменить исправления'}
                    onButtonClick={cancelFixedText}
                  />
                </>
              )}
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

        {generatedImages &&
          uploadedFileIds &&
          generatedImages.length > 0 &&
          uploadedFileIds.length > 0 && (
            <GeneratedImagesViewer images={generatedImages} uploadedFileIds={uploadedFileIds} />
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
                    setContentError('Дата должна быть позднее текущего времени');
                    return;
                  } else if (date >= dayjs().add(1, 'year')) {
                    setContentError(
                      'Дата должна быть не позднее чем через год от текущего времени',
                    );
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

  const handleFixText = async () => {
    if (!postText.trim()) {
      setContentError('Введите текст для исправления');
      return;
    }
    setOriginalText(postText);
    setIsFixLoading(true);

    try {
      const fixPostReq = {
        text: postText,
        team_id: team_id,
      };
      const result = await withTimeout(fixPublication(fixPostReq));
      if (result && result.text) {
        setPostText(result.text);
        setFixedText(result.text);
        setShowFixControls(true);
      } else {
        setContentError('Не удалось получить исправленный текст. Попробуйте позже.');
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'TIMEOUT_ERROR') {
        setContentError('Сервер сейчас перегружен или недоступен, пожалуйста, попробуйте позже');
      } else {
        setContentError('Произошла ошибка при исправлении текста. Попробуйте позже.');
      }
    } finally {
      setIsFixLoading(false);
      setIsFixingText(true);
    }
  };

  const applyFixedText = () => {
    setIsFixingText(false);
    setShowFixControls(false);
    setFixedText('');
  };

  const cancelFixedText = () => {
    setPostText(originalText);
    setIsFixingText(false);
    setShowFixControls(false);
    setFixedText('');
  };

  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      const emojiPickerElement = document.querySelector(`.${styles.emojiPicker}`);
      const emojiButtonElement = document.querySelector(`.${styles['emoji-button']}`);

      if (
        emojiPickerElement &&
        emojiButtonElement &&
        !emojiPickerElement.contains(event.target as Node) &&
        !emojiButtonElement.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

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
