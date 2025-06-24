import React, { FC, useContext, useState, useEffect } from 'react';
import {
  Input,
  Form,
  Button,
  Typography,
  Spin,
  Image,
  Checkbox,
  Alert,
  Tooltip,
  Skeleton,
  Space,
  Tag,
  Row,
  Col,
} from 'antd';
import DialogBox from '../dialogBox/DialogBox';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';

import { uploadFile } from '../../../api/api';
import { NotificationContext } from '../../../api/notification';
import {
  CheckOutlined,
  CloseOutlined,
  FileImageOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  RobotOutlined,
  LoadingOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { remark } from 'remark';
import strip from 'strip-markdown';
import {
  setGeneratePostDialog,
  setGeneratedTextDialog,
} from '../../../stores/basePageDialogsSlice';
import { StreamMessageData, useImprovedGenerationSSE } from '../../../api/improvedGenerationSSE';
import { MAX_FILES } from '../CreatePostDialog/types';

const { Text, Paragraph, Title } = Typography;
const { TextArea } = Input;

const AIGeneratePostDialog: FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [useText, setUseText] = useState(true);
  const [selectedImages, setSelectedImages] = useState<{ [key: string]: boolean }>({});
  const [uploadingImages, setUploadingImages] = useState<{ [key: string]: boolean }>({});
  const [uploadedFileIds, setUploadedFileIds] = useState<{ [key: string]: string }>({});
  const [timeoutError, setTimeoutError] = useState(false);

  const [isStreamGenerating, setIsStreamGenerating] = useState(false);
  const [streamMessages, setStreamMessages] = useState<StreamMessageData[]>([]);
  const [currentGeneratedText, setCurrentGeneratedText] = useState('');
  const [streamQueries, setStreamQueries] = useState<string[]>([]);
  const [streamStatus, setStreamStatus] = useState<string>('');
  const [streamComplete, setStreamComplete] = useState(false);

  // для SSE
  const { isConnected, startGeneration, stopGeneration } = useImprovedGenerationSSE({
    onMessage: async (data: StreamMessageData) => {
      // сообщение в список для отображения процесса
      setStreamMessages((prev) => [...prev, data]);

      switch (data.type) {
        case 'status':
          setStreamStatus(data.message || '');
          break;
        case 'queries':
          if (data.queries) {
            setStreamQueries(data.queries);
          }
          break;
        case 'cache':
          setStreamStatus('Найден кешированный результат');

          if (data.text || data.full_text) {
            processContent(data.text || '', true, data.full_text);
          }

          if (data.images && data.images.length > 0) {
            setGeneratedImages(data.images);
          }
          break;
        case 'content':
          if (data.text || (data.final && data.full_text)) {
            await processContent(data.text || '', !!data.final, data.full_text);

            if (data.final && data.images && data.images.length > 0) {
              setGeneratedImages(data.images);

              const lastMessage = streamMessages[streamMessages.length - 2];
              if (lastMessage && lastMessage.type === 'cache') {
                setStreamComplete(true);
                setIsStreamGenerating(false);
              }
            }
          }
          break;
        case 'generation':
          if (data.images) {
            setGeneratedImages(data.images);
          }
          break;
        case 'warning':
          console.warn('SSE Warning:', data.message);
          break;
        case 'error':
          console.error('SSE Error:', data.message);
          setError(data.message || 'Ошибка при генерации');
          break;
        case 'complete':
          setStreamComplete(true);
          setIsStreamGenerating(false);
          break;
      }
    },
    onError: (error) => {
      console.error('SSE соединение закрыто с ошибкой', error);
      setIsStreamGenerating(false);
      if (!streamComplete) {
        setError('Произошла ошибка при генерации публикации');
      }
    },
  });

  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.basePageDialogs.generatePostDialog.isOpen);
  const notificationManager = useContext(NotificationContext);
  const team_id = useAppSelector((state) => state.teams.globalActiveTeamId);

  useEffect(() => {
    const initialSelectedState: { [key: string]: boolean } = {};
    generatedImages.forEach((_, index) => {
      initialSelectedState[index.toString()] = false;
    });
    setSelectedImages(initialSelectedState);
    setUploadingImages({});
    setUploadedFileIds({});
  }, [generatedImages]);

  // для прокрутки
  useEffect(() => {
    const messagesContainer = document.querySelector(`.${styles.streamMessagesContainer}`);
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    const textContainer = document.querySelector(`.${styles.streamTextOutput}`);
    if (textContainer && currentGeneratedText) {
      textContainer.scrollTop = textContainer.scrollHeight;
    }
  }, [streamMessages, currentGeneratedText]);

  const selectedImagesCount = Object.values(selectedImages).filter(Boolean).length;
  const tooManyImagesSelected = selectedImagesCount > MAX_FILES;

  useEffect(() => {
    if (tooManyImagesSelected) {
      setError(`Выбрано слишком много изображений. Максимум: ${MAX_FILES}`);
    } else if (
      error === `Выбрано слишком много изображений. Максимум: ${MAX_FILES}` ||
      error === `Выбрано максимальное количество изображений (${MAX_FILES})` ||
      error === `Выбрано ${MAX_FILES} изображений. Это максимально допустимое количество.`
    ) {
      setError(null);
    }
  }, [selectedImagesCount, tooManyImagesSelected, error]);

  useEffect(() => {
    if (isOpen) {
      setIsStreamGenerating(false);
      setStreamComplete(false);
      setGeneratedText('');
      setCurrentGeneratedText('');
      setGeneratedImages([]);
      setStreamMessages([]);
      setStreamQueries([]);
      setStreamStatus('');
      setTimeoutError(false);
      setError(null);
    }
  }, [isOpen]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (e.target.value.trim() === '') {
      setError('Запрос не может быть пустым');
    } else {
      setError(null);
    }
  };

  const handleImageSelect = async (index: string) => {
    const isCurrentlySelected = selectedImages[index];

    if (!isCurrentlySelected && selectedImagesCount >= MAX_FILES) {
      setError(`Выбрано максимальное количество изображений (${MAX_FILES})`);
      return;
    }

    setSelectedImages((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));

    if (!isCurrentlySelected && !uploadedFileIds[index]) {
      await uploadImageFile(generatedImages[parseInt(index)], index);
    }
  };

  const selectAllImages = async () => {
    const newSelectedState: { [key: string]: boolean } = {};
    const uploadPromises: Promise<any>[] = [];

    const imagesToSelect = Math.min(generatedImages.length, MAX_FILES);

    generatedImages.slice(0, imagesToSelect).forEach((imageUrl, index) => {
      const indexStr = index.toString();
      newSelectedState[indexStr] = true;

      if (!uploadedFileIds[indexStr]) {
        uploadPromises.push(uploadImageFile(imageUrl, indexStr));
      }
    });

    for (let i = imagesToSelect; i < generatedImages.length; i++) {
      newSelectedState[i.toString()] = false;
    }

    setSelectedImages(newSelectedState);

    if (generatedImages.length > MAX_FILES) {
      setError(`Выбрано ${MAX_FILES} изображений. Это максимально допустимое количество.`);
    }

    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
    }
  };

  const deselectAllImages = () => {
    const newSelectedState: { [key: string]: boolean } = {};
    generatedImages.forEach((_, index) => {
      newSelectedState[index.toString()] = false;
    });
    setSelectedImages(newSelectedState);
  };

  const uploadImageFile = async (imageUrl: string, index: string) => {
    try {
      if (uploadedFileIds[index]) {
        return uploadedFileIds[index];
      }
      setUploadingImages((prev) => ({
        ...prev,
        [index]: true,
      }));

      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const fileName = `generated_image_${Date.now()}_${index}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      const uploadResult = await uploadFile(file, 'photo');

      setUploadedFileIds((prev) => ({
        ...prev,
        [index]: uploadResult.file_id,
      }));

      setUploadingImages((prev) => ({
        ...prev,
        [index]: false,
      }));

      return uploadResult.file_id;
    } catch (error) {
      notificationManager.createNotification(
        'error',
        'Ошибка загрузки',
        `Не удалось загрузить изображение ${parseInt(index) + 1}`,
      );

      setUploadingImages((prev) => ({
        ...prev,
        [index]: false,
      }));

      return null;
    }
  };

  const processContent = async (text: string, isFinal: boolean, fullText?: string) => {
    try {
      if (isFinal && fullText) {
        const plainText = await customMarkdownToPlainText(fullText);
        setGeneratedText(plainText);
        setCurrentGeneratedText(plainText);
      } else if (text) {
        setCurrentGeneratedText((prev) => prev + text);
      }
    } catch (error) {
      console.error('Ошибка при обработке текстового контента:', error);
      if (text) {
        setCurrentGeneratedText((prev) => prev + text);
      }
      if (isFinal && fullText) {
        setGeneratedText(fullText);
      }
    }
  };

  const customMarkdownToPlainText = async (markdown: string): Promise<string> => {
    try {
      const file = await remark().use(strip).process(markdown);
      return String(file);
    } catch (error) {
      console.error('Ошибка при преобразовании Markdown в текст:', error);
      return markdown;
    }
  };

  const onSave = async () => {
    if (!generatedText.trim() && !Object.values(selectedImages).some((selected) => selected)) {
      setError('Сгенерируйте текст или выберите изображения перед сохранением');
      return;
    }

    setLoading(true);

    try {
      const selectedFileIds: string[] = [];
      const selectedImageUrls: string[] = [];

      if (hasSelectedImages) {
        for (const [index, selected] of Object.entries(selectedImages)) {
          if (selected) {
            const imageUrl = generatedImages[parseInt(index)];
            selectedImageUrls.push(imageUrl);

            if (uploadedFileIds[index]) {
              selectedFileIds.push(uploadedFileIds[index]);
            } else {
              const fileId = await uploadImageFile(generatedImages[parseInt(index)], index);
              if (fileId) {
                selectedFileIds.push(fileId);
              }
            }
          }
        }
      }

      const plainText = useText ? await customMarkdownToPlainText(generatedText) : '';

      dispatch(
        setGeneratedTextDialog({
          isOpen: false,
          generatedText: plainText,
          generatedImages: selectedImageUrls,
          uploadedFileIds: selectedFileIds,
        }),
      );

      dispatch(setGeneratePostDialog(false));
      notificationManager.createNotification('success', 'Публикация готова к использованию', '');
      resetForm();
    } catch (error) {
      console.error('Ошибка при сохранении публикации:', error);
      notificationManager.createNotification(
        'error',
        'Ошибка сохранения',
        'Не все элементы удалось добавить в публикацию',
      );
    } finally {
      setLoading(false);
    }
  };

  const generatePostStream = () => {
    if (!prompt.trim()) {
      setError('Запрос не может быть пустым');
      return;
    }
    setIsStreamGenerating(true);
    setStreamMessages([]);
    setCurrentGeneratedText('');
    setStreamQueries([]);
    setStreamStatus('');
    setStreamComplete(false);
    setGeneratedText('');
    setGeneratedImages([]);
    setTimeoutError(false);
    setError(null);

    // Создаем объект запроса с team_id из Redux
    const generatePostReq = {
      query: prompt,
      team_id: team_id,
    };

    // Передаем объект запроса в функцию startGeneration
    startGeneration(generatePostReq);
  };

  const handleGenerateClick = () => {
    if (isStreamGenerating) {
      stopGeneration();
      setIsStreamGenerating(false);
    } else {
      generatePostStream();
    }
  };

  const resetForm = () => {
    setPrompt('');
    setGeneratedText('');
    setGeneratedImages([]);
    setError(null);
    setUseText(true);
    setSelectedImages({});
    setUploadedFileIds({});
    setTimeoutError(false);
  };

  const onCancel = () => {
    dispatch(setGeneratePostDialog(false));
    resetForm();
    setTimeoutError(false);
  };

  const hasSelectedImages = Object.values(selectedImages).some((selected) => selected);

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'status':
        return <ClockCircleOutlined />;
      case 'context':
        return <ClockCircleOutlined />;
      case 'queries':
        return <SearchOutlined />;
      case 'search':
        return <SearchOutlined />;
      case 'search_result':
        return <FileTextOutlined />;
      case 'processing':
        return <RobotOutlined />;
      case 'generation':
        return <FileTextOutlined />;
      case 'content':
        return <FileTextOutlined />;
      case 'complete':
        return <CheckOutlined />;
      case 'cache':
        return <FileImageOutlined />;
      default:
        return <LoadingOutlined />;
    }
  };

  const getActionName = (type: string) => {
    switch (type) {
      case 'status':
        return 'Статус:';
      case 'context':
        return 'Контекст:';
      case 'queries':
        return 'Запросы:';
      case 'search':
        return 'Поиск:';
      case 'search_result':
        return 'Результаты:';
      case 'processing':
        return 'Обработка:';
      case 'generation':
        return 'Генерация:';
      case 'content':
        return 'Текст:';
      case 'complete':
        return 'Готово:';
      case 'cache':
        return 'Кеш:';
      default:
        return 'Процесс:';
    }
  };

  return (
    <DialogBox
      bottomButtons={
        !isStreamGenerating && (streamComplete || generatedText)
          ? [
              {
                text: 'Отмена',
                onButtonClick: onCancel,
                type: 'default',
              },
              {
                text: 'Использовать выбранное',
                onButtonClick: onSave,
                loading: loading,
                disabled: !!error || loading || (!useText && !hasSelectedImages),
              },
            ]
          : []
      }
      isOpen={isOpen}
      onCancelClick={onCancel}
      title='Генерация публикации'
      isCenter={true}
      width={800}
    >
      <div className={styles.container}>
        <Form layout='vertical'>
          <Form.Item
            label='Запрос для генерации публикации'
            validateStatus={error && !generatedText ? 'error' : ''}
            help={error && !generatedText ? error : ''}
          >
            <Row gutter={8} align='middle'>
              <Col flex='auto'>
                <TextArea
                  rows={2}
                  placeholder='Например: "составь пост про то, как необходимо готовить  пельмени"'
                  value={prompt}
                  onChange={handlePromptChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && prompt.trim() && !isStreamGenerating) {
                      e.preventDefault();
                      generatePostStream();
                    }
                  }}
                  disabled={isStreamGenerating}
                  style={{ resize: 'none' }}
                />
              </Col>
              <Col>
                <Button
                  type='primary'
                  danger={isStreamGenerating}
                  onClick={handleGenerateClick}
                  disabled={!prompt.trim()}
                  icon={isStreamGenerating ? <CloseOutlined /> : <SendOutlined />}
                  size='large'
                  style={{
                    height: '40px',
                    width: '54px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              </Col>
            </Row>
          </Form.Item>

          {timeoutError && (
            <Alert
              message='Превышено время ожидания генерации публикации'
              description='Запрос на генерацию публикации превысил время ожидания. Попробуйте снова.'
              type='warning'
              showIcon
            />
          )}

          {generatedText && !isStreamGenerating && (
            <div className={styles.resultContainer}>
              <div className={styles.resultSection}>
                <div className={styles.textResult}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text strong>Текст публикации:</Text>
                    <Checkbox checked={useText} onChange={(e) => setUseText(e.target.checked)}>
                      Использовать текст
                    </Checkbox>
                  </div>
                  <div className={styles.generatedText}>{generatedText}</div>
                </div>
              </div>

              {generatedImages.length > 0 && (
                <div className={styles.resultSection}>
                  <div className={styles.imagesResult}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <Text strong>Изображения для публикации:</Text>
                      <Text type='secondary'>
                        Выбрано: {Object.values(selectedImages).filter(Boolean).length} из{' '}
                        {generatedImages.length}
                      </Text>
                    </div>

                    <div className={styles.selectionControls}>
                      <Button
                        size='small'
                        icon={hasSelectedImages ? <CloseOutlined /> : <CheckOutlined />}
                        onClick={hasSelectedImages ? deselectAllImages : selectAllImages}
                        disabled={generatedImages.length === 0}
                        type={hasSelectedImages ? 'default' : 'primary'}
                      >
                        {hasSelectedImages ? 'Очистить выбор' : 'Выбрать все'}
                      </Button>
                    </div>

                    <div className={styles.imagesGrid}>
                      {generatedImages.map((image, index) => (
                        <div key={index} className={styles.imageItem}>
                          <div className={styles.imageCheckbox}>
                            <Checkbox
                              checked={selectedImages[index.toString()]}
                              onChange={() => handleImageSelect(index.toString())}
                            />
                          </div>
                          {uploadingImages[index.toString()] && (
                            <div className={styles.loadingOverlay}>
                              <Spin size='small' />
                            </div>
                          )}
                          <Tooltip title={`Изображение ${index + 1}`}>
                            <Image
                              src={image}
                              alt={`Сгенерированное изображение ${index + 1}`}
                              width={120}
                              height={120}
                              style={{ objectFit: 'cover' }}
                              fallback='https://placehold.co/120x120/png?text=Ошибка+загрузки'
                            />
                          </Tooltip>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {useText || hasSelectedImages ? (
                <Alert
                  message='Выбранные элементы будут добавлены в публикацию'
                  type='info'
                  showIcon
                  icon={<FileImageOutlined />}
                />
              ) : (
                <Alert
                  message='Выберите текст или изображения для добавления в публикацию'
                  type='warning'
                  showIcon
                />
              )}
            </div>
          )}

          {timeoutError && (
            <Alert
              message='Превышено время ожидания генерации публикации'
              description='Запрос на генерацию публикации превысил время ожидания. Попробуйте снова.'
              type='warning'
              showIcon
            />
          )}

          {isStreamGenerating && (
            <div className={styles.streamStatus}>
              <div className={styles.streamStatusHeader}>
                <Space>
                  <LoadingOutlined spin />
                  <Text strong>Процесс генерации</Text>
                </Space>
                <Text type='secondary'>{streamStatus}</Text>
              </div>
              <div className={styles.streamMessagesContainer}>
                {streamMessages.map((msg, index) => {
                  if (
                    msg.type === 'content' ||
                    msg.type === 'search' ||
                    msg.type === 'queries' ||
                    msg.type === 'image_queries'
                  )
                    return null;

                  return (
                    <div key={index} className={styles.streamMessage}>
                      <Space>
                        {getMessageIcon(msg.type)}
                        <Text type='secondary'>{getActionName(msg.type)}</Text>
                        <Text>{msg.message}</Text>
                      </Space>
                    </div>
                  );
                })}
              </div>

              {streamQueries.length > 0 && (
                <div className={styles.queryTags}>
                  <Text type='secondary'>Поисковые запросы:</Text>
                  <div>
                    {streamQueries.map((query, idx) => (
                      <Tag
                        key={idx}
                        icon={<SearchOutlined />}
                        color='blue'
                        style={{ marginBottom: '4px' }}
                      >
                        {query}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.streamTextOutput}>
                {!streamComplete && currentGeneratedText && (
                  <div className={styles.typingEffect}>
                    <LoadingOutlined spin style={{ marginRight: '8px' }} />
                    <Text type='secondary'>Генерируется текст...</Text>
                  </div>
                )}

                {currentGeneratedText && (
                  <div className={styles.generatedText}>{currentGeneratedText}</div>
                )}

                {isStreamGenerating && !streamComplete && !currentGeneratedText && (
                  <div className={styles.generatedTextSkeleton}>
                    <Skeleton active paragraph={{ rows: 2 }} />
                  </div>
                )}
              </div>

              {generatedImages.length > 0 && (
                <div className={styles.streamGeneratedImages}>
                  <Text strong style={{ marginBottom: '8px', display: 'block' }}>
                    Сгенерированные изображения:
                  </Text>
                  <div className={styles.imagesGrid}>
                    {generatedImages.map((image, index) => (
                      <div key={index} className={styles.imageItem}>
                        <Image
                          src={image}
                          alt={`Сгенерированное изображение ${index + 1}`}
                          width={100}
                          height={100}
                          style={{ objectFit: 'cover' }}
                          fallback='/img.png'
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Form>
      </div>
    </DialogBox>
  );
};

export default AIGeneratePostDialog;
