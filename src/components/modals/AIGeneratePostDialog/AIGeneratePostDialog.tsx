import React, { FC, useContext, useState, useEffect } from 'react';
import { Input, Form, Button, Typography, Spin, Image, Checkbox, Alert, Tooltip } from 'antd';
import DialogBox from '../dialogBox/DialogBox';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import {
  setGeneratedTextDialog,
  setGeneratePostDialog,
} from '../../../stores/basePageDialogsSlice';
import { generatePublication, uploadFile } from '../../../api/api';
import { NotificationContext } from '../../../api/notification';
import { CheckOutlined, CloseOutlined, FileImageOutlined } from '@ant-design/icons';
import { withTimeout } from '../../../utils/timeoutUtils';

const { Text } = Typography;
const { TextArea } = Input;

const AIGeneratePostDialog: FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generationLoading, setGenerationLoading] = useState(false);
  const [useText, setUseText] = useState(true);
  const [selectedImages, setSelectedImages] = useState<{ [key: string]: boolean }>({});
  const [uploadingImages, setUploadingImages] = useState<{ [key: string]: boolean }>({});
  const [uploadedFileIds, setUploadedFileIds] = useState<{ [key: string]: string }>({});
  const [timeoutError, setTimeoutError] = useState(false);

  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.basePageDialogs.generatePostDialog.isOpen);
  const notificationManager = useContext(NotificationContext);

  useEffect(() => {
    const initialSelectedState: { [key: string]: boolean } = {};
    generatedImages.forEach((_, index) => {
      initialSelectedState[index.toString()] = false;
    });
    setSelectedImages(initialSelectedState);
    setUploadingImages({});
    setUploadedFileIds({});
  }, [generatedImages]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (e.target.value.trim() === '') {
      setError('Запрос не может быть пустым');
    } else {
      setError(null);
    }
  };

  const generatePost = async () => {
    if (!prompt.trim()) {
      setError('Запрос не может быть пустым');
      return;
    }

    setGenerationLoading(true);
    setTimeoutError(false);
    try {
      const result = await withTimeout(generatePublication(prompt));
      setGeneratedText(result.text);
      setGeneratedImages(result.images);
      notificationManager.createNotification('success', 'Публикация успешно сгенерирована', '');
    } catch (err: unknown) {
      console.error('Ошибка при генерации публикации:', err);

      if (err instanceof Error && err.message === 'TIMEOUT_ERROR') {
        setTimeoutError(true);
        notificationManager.createNotification(
          'warning',
          'Превышено время ожидания',
          'Сервер перегружен, пожалуйста, попробуйте позже',
        );
      } else {
        setError('Не удалось сгенерировать публикацию');
        notificationManager.createNotification(
          'error',
          'Ошибка генерации публикации',
          'Попробуйте позже',
        );
      }
    } finally {
      setGenerationLoading(false);
    }
  };

  const handleImageSelect = async (index: string) => {
    const isCurrentlySelected = selectedImages[index];

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

    generatedImages.forEach((imageUrl, index) => {
      const indexStr = index.toString();
      newSelectedState[indexStr] = true;

      if (!uploadedFileIds[indexStr]) {
        uploadPromises.push(uploadImageFile(imageUrl, indexStr));
      }
    });

    setSelectedImages(newSelectedState);

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
      console.error('Ошибка при загрузке изображения:', error);
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

  const onSave = async () => {
    if (!generatedText.trim() && !Object.values(selectedImages).some((selected) => selected)) {
      setError('Сгенерируйте текст или выберите изображения перед сохранением');
      return;
    }

    setLoading(true);

    try {
      const selectedFileIds: string[] = [];
      const selectedImageUrls: string[] = [];

      for (const [index, selected] of Object.entries(selectedImages)) {
        if (selected) {
          const imageUrl = generatedImages[parseInt(index)];
          selectedImageUrls.push(imageUrl);

          if (uploadedFileIds[index]) {
            selectedFileIds.push(uploadedFileIds[index]);
          }
        }
      }

      dispatch(
        setGeneratedTextDialog({
          isOpen: false,
          generatedText: useText ? generatedText : '',
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

  const onCancel = () => {
    dispatch(setGeneratePostDialog(false));
    resetForm();
    setTimeoutError(false);
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

  const hasSelectedImages = Object.values(selectedImages).some((selected) => selected);

  return (
    <DialogBox
      bottomButtons={[
        {
          text: 'Отмена',
          onButtonClick: onCancel,
          type: 'default',
        },
        {
          text: 'Использовать выбранное',
          onButtonClick: onSave,
          loading: loading,
          disabled: !!error || loading || (!useText && !hasSelectedImages) || generationLoading,
        },
      ]}
      isOpen={isOpen}
      onCancelClick={onCancel}
      title='ИИ-генерация публикации'
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
            <TextArea
              rows={4}
              placeholder='Опишите, какую публикацию вы хотите сгенерировать. Например: "составь пост про то, как необходимо готовить пельмени"'
              value={prompt}
              onChange={handlePromptChange}
              disabled={generationLoading}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type='primary'
              onClick={generatePost}
              loading={generationLoading}
              disabled={!prompt.trim()}
              block
            >
              Сгенерировать публикацию
            </Button>
          </Form.Item>

          {generationLoading && (
            <div className={styles.spinnerContainer}>
              <Spin size='large' />
              <Text type='secondary'>Генерируем публикацию...</Text>
            </div>
          )}

          {generatedText && !generationLoading && (
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
                        icon={<CheckOutlined />}
                        onClick={selectAllImages}
                        disabled={generatedImages.length === 0}
                      >
                        Выбрать все
                      </Button>
                      <Button
                        size='small'
                        icon={<CloseOutlined />}
                        onClick={deselectAllImages}
                        disabled={!hasSelectedImages}
                      >
                        Снять выбор
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
        </Form>
      </div>
    </DialogBox>
  );
};

export default AIGeneratePostDialog;
