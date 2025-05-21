import React, { FC, useContext, useState } from 'react';
import { Input, Form, Button, Typography, Spin, Image, Space, Card } from 'antd';
import DialogBox from '../dialogBox/DialogBox';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import {
  setGeneratedTextDialog,
  setGeneratePostDialog,
} from '../../../stores/basePageDialogsSlice';
import { generatePublication } from '../../../api/api';
import { NotificationContext } from '../../../api/notification';

const { Text } = Typography;
const { TextArea } = Input;

const AIGeneratePostDialog: FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generationLoading, setGenerationLoading] = useState(false);

  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.basePageDialogs.generatePostDialog.isOpen);
  const notificationManager = useContext(NotificationContext);

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
    try {
      const result = await generatePublication(prompt);
      setGeneratedText(result.text);
      setGeneratedImages(result.images);
      notificationManager.createNotification('success', 'Публикация успешно сгенерирована', '');
    } catch (err) {
      console.error('Ошибка при генерации публикации:', err);
      setError('Не удалось сгенерировать публикацию');
      notificationManager.createNotification(
        'error',
        'Ошибка генерации публикации',
        'Попробуйте позже',
      );
    } finally {
      setGenerationLoading(false);
    }
  };

  const onSave = () => {
    if (!generatedText.trim()) {
      setError('Сгенерируйте текст перед сохранением');
      return;
    }

    dispatch(setGeneratedTextDialog({ isOpen: false, generatedText: generatedText }));
    dispatch(setGeneratePostDialog(false)); // Закрываем диалог генерации поста
    notificationManager.createNotification('success', 'Публикация готова к использованию', '');
    resetForm();
  };

  const onCancel = () => {
    dispatch(setGeneratePostDialog(false)); // Закрываем диалог генерации поста
    resetForm();
  };

  const resetForm = () => {
    setPrompt('');
    setGeneratedText('');
    setGeneratedImages([]);
    setError(null);
  };

  return (
    <DialogBox
      bottomButtons={[
        {
          text: 'Отмена',
          onButtonClick: onCancel,
          type: 'default',
        },
        {
          text: 'Использовать публикацию',
          onButtonClick: onSave,
          loading: loading,
          disabled: !!error || loading || !generatedText.trim(),
        },
      ]}
      isOpen={isOpen}
      onCancelClick={onCancel}
      title='ИИ-генерация публикации'
      isCenter={true}
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
              <Card title='Результат генерации' className={styles.resultCard}>
                <div className={styles.textResult}>
                  <Text strong>Текст публикации:</Text>
                  <div className={styles.generatedText}>{generatedText}</div>
                </div>

                {generatedImages.length > 0 && (
                  <div className={styles.imagesResult}>
                    <Text strong>Изображения для публикации:</Text>
                    <div className={styles.imagesGrid}>
                      <Image.PreviewGroup>
                        <Space size={[8, 8]} wrap>
                          {generatedImages.slice(0, 6).map((image, index) => (
                            <Image
                              key={index}
                              src={image}
                              alt={`Сгенерированное изображение ${index + 1}`}
                              width={100}
                              height={100}
                              style={{ objectFit: 'cover' }}
                              fallback='https://placehold.co/100x100/png?text=Ошибка+загрузки'
                            />
                          ))}
                        </Space>
                      </Image.PreviewGroup>
                      {generatedImages.length > 6 && (
                        <Text type='secondary'>
                          ... и еще {generatedImages.length - 6} изображений
                        </Text>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
        </Form>
      </div>
    </DialogBox>
  );
};

export default AIGeneratePostDialog;
