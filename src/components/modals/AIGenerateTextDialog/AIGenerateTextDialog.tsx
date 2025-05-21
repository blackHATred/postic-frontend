import React, { FC, useContext, useState } from 'react';
import { Input, Form, Button, Typography, Spin } from 'antd';
import DialogBox from '../dialogBox/DialogBox';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setGeneratedTextDialog } from '../../../stores/basePageDialogsSlice';
import { generateAiText } from '../../../api/api';
import { NotificationContext } from '../../../api/notification';

const { Text } = Typography;
const { TextArea } = Input;

const AIGenerateTextDialog: FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generationLoading, setGenerationLoading] = useState(false);

  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.basePageDialogs.generatedTextDialog.isOpen);
  const notificationManager = useContext(NotificationContext);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (e.target.value.trim() === '') {
      setError('Запрос не может быть пустым');
    } else {
      setError(null);
    }
  };

  const generateText = async () => {
    if (!prompt.trim()) {
      setError('Запрос не может быть пустым');
      return;
    }

    setGenerationLoading(true);
    try {
      const result = await generateAiText(prompt);
      setGeneratedText(result.text);
      notificationManager.createNotification('success', 'Текст успешно сгенерирован', '');
    } catch (err) {
      console.error('Ошибка при генерации текста:', err);
      setError('Не удалось сгенерировать текст');
      notificationManager.createNotification(
        'error',
        'Ошибка генерации текста',
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
    notificationManager.createNotification(
      'success',
      'Текст готов к использованию в публикации',
      '',
    );
    resetForm();
  };

  const onCancel = () => {
    dispatch(setGeneratedTextDialog({ isOpen: false, generatedText: '' }));
    resetForm();
  };

  const resetForm = () => {
    setPrompt('');
    setGeneratedText('');
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
          text: 'Использовать текст',
          onButtonClick: onSave,
          loading: loading,
          disabled: !!error || loading || !generatedText.trim(),
        },
      ]}
      isOpen={isOpen}
      onCancelClick={onCancel}
      title='ИИ-генерация текста поста'
      isCenter={true}
    >
      <div className={styles.container}>
        <Form layout='vertical'>
          <Form.Item
            label='Запрос для генерации'
            validateStatus={error && !generatedText ? 'error' : ''}
            help={error && !generatedText ? error : ''}
          >
            <TextArea
              rows={4}
              placeholder='Опишите, какой текст вы хотите получить'
              value={prompt}
              onChange={handlePromptChange}
              disabled={generationLoading}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type='primary'
              onClick={generateText}
              loading={generationLoading}
              disabled={!prompt.trim()}
              block
            >
              Сгенерировать текст
            </Button>
          </Form.Item>

          {generationLoading && (
            <div className={styles.spinnerContainer}>
              <Spin size='large' />
            </div>
          )}

          {generatedText && !generationLoading && (
            <div className={styles.resultContainer}>
              <Text strong>Результат:</Text>
              <div className={styles.textResult}>{generatedText}</div>
            </div>
          )}
        </Form>
      </div>
    </DialogBox>
  );
};

export default AIGenerateTextDialog;
