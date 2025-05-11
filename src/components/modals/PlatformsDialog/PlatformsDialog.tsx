import { useState, useContext } from 'react';
import { Input, Divider, Form, Typography } from 'antd';
import DialogBox from '../dialogBox/DialogBox';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setPlatformsDialog } from '../../../stores/teamSlice';
import { NotificationContext } from '../../../api/notification';
import Link from 'antd/lib/typography/Link';
import { SetVK } from '../../../api/teamApi';

const { Text } = Typography;

const PlatformsDialog: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.teams.platformsDialog.isOpen);
  const notificationManager = useContext(NotificationContext);
  const selectedPlatform = useAppSelector((state) => state.teams.selectedPlatform);
  const teamId = useAppSelector((state) => state.teams.selectedTeamId);

  // Отдельные состояния для разных полей
  const [tgChannelId, setTgChannelId] = useState('');
  const [vkGroupId, setVkGroupId] = useState('');
  const [vkAdminApiKey, setVkAdminApiKey] = useState('');
  const [vkGroupApiKey, setVkGroupApiKey] = useState('');

  const renderInstructions = () => {
    switch (selectedPlatform) {
      case 'telegram':
        return (
          <div className={styles['platform-instructions']}>
            <Text strong>Инструкция по привязке Telegram канала:</Text>
            <ol>
              <li>
                Добавьте нашего бота{' '}
                <Text underline copyable>
                  @postic_dev_bot
                </Text>{' '}
                в администраторы вашего канала и обсуждения, привязанного к каналу.
              </li>
              <li>
                Для начала работы с ботом, отправьте ему команду{' '}
                <Text code copyable>
                  /start
                </Text>
              </li>
              <li>
                Чтобы получить ID канала и ID обсуждений канала, перешлите боту из канала любое
                сообщение.
              </li>
              <li>
                Шаблон сообщения привязки канала:
                <div>
                  <Text code copyable>
                    /add_channel секретный_ключ_команды ID_канала ID_обсуждения
                  </Text>
                </div>
              </li>
              <li>
                Список доступных команд:
                <ul className={styles['command-list']}>
                  <li>
                    <Text code copyable>
                      /start
                    </Text>{' '}
                    - Начать работу с ботом
                  </li>
                  <li>
                    <Text code copyable>
                      /help
                    </Text>{' '}
                    - Показать список команд
                  </li>
                  <li>
                    <Text code copyable>
                      /add_channel
                    </Text>{' '}
                    - Добавить канал. Если канал уже привязан, то вызов этой команды обновит его
                    настройки
                  </li>
                </ul>
              </li>
            </ol>
          </div>
        );
      case 'vk':
        return (
          <div className={styles['platform-instructions']}>
            <Text strong>Инструкция по привязке группы ВКонтакте:</Text>
            <ol>
              <li>Перейдите в настройки вашей группы ВКонтакте</li>
              <li>
                Выберите раздел <Text copyable>Работа с API</Text>
              </li>
              <li>Создайте ключ доступа с необходимыми правами</li>
              <li>
                Для получения личного токена:{' '}
                <Link href='https://vkhost.github.io/' target='_blank'>
                  https://vkhost.github.io/
                </Link>
              </li>
              <li>Заполните все поля ниже</li>
            </ol>
          </div>
        );
      default:
        return null;
    }
  };

  const renderFormFields = () => {
    if (selectedPlatform === 'vk') {
      return (
        <>
          <Form.Item
            label='ID группы ВКонтакте'
            name='vkGroupId'
            rules={[{ required: true, message: 'Пожалуйста, введите ID группы' }]}
            labelCol={{ span: 24 }}
          >
            <Input
              placeholder='Введите ID группы ВКонтакте'
              value={vkGroupId}
              onChange={(e) => setVkGroupId(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label='Ключ доступа API администратора (токен доступа)'
            name='vkAdminApiKey'
            rules={[{ required: true, message: 'Пожалуйста, введите ключ API администратора' }]}
            labelCol={{ span: 24 }}
          >
            <Input
              placeholder='Введите ключ API администратора'
              value={vkAdminApiKey}
              onChange={(e) => setVkAdminApiKey(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label='Ключ доступа API группы'
            name='vkGroupApiKey'
            rules={[{ required: true, message: 'Пожалуйста, введите ключ API группы' }]}
            labelCol={{ span: 24 }}
          >
            <Input
              placeholder='Введите ключ API группы'
              value={vkGroupApiKey}
              onChange={(e) => setVkGroupApiKey(e.target.value)}
            />
          </Form.Item>
        </>
      );
    }
    return null;
  };

  const onOk = async () => {
    if (selectedPlatform === 'telegram') {
      dispatch(setPlatformsDialog(false));
    } else if (selectedPlatform === 'vk') {
      try {
        await form.validateFields();

        const requestData = {
          team_id: teamId,
          group_id: parseInt(vkGroupId),
          admin_api_key: vkAdminApiKey,
          group_api_key: vkGroupApiKey,
        };

        const result = await SetVK(requestData);

        if (result.includes('успешно')) {
          notificationManager.createNotification(
            'success',
            'Платформа привязана',
            `Платформа "${selectedPlatform}" успешно привязана к команде`,
          );

          dispatch(setPlatformsDialog(false));
          form.resetFields();
          resetFormValues();
        } else {
          notificationManager.createNotification('error', 'Ошибка привязки платформы', result);
        }
      } catch (error) {
        notificationManager.createNotification(
          'error',
          'Ошибка привязки платформы',
          (error as Error).message || 'Не удалось привязать платформу',
        );
      }
    }
  };

  const resetFormValues = () => {
    setTgChannelId('');
    setVkGroupId('');
    setVkAdminApiKey('');
    setVkGroupApiKey('');
  };

  return (
    <DialogBox
      bottomButtons={[
        {
          text: selectedPlatform === 'telegram' ? 'Ок' : 'Привязать ВК',
          onButtonClick: onOk,
        },
      ]}
      isOpen={isOpen}
      onCancelClick={() => {
        form.resetFields();
        resetFormValues();
        dispatch(setPlatformsDialog(false));
      }}
      title={`Привязать платформу: ${selectedPlatform === 'telegram' ? 'Telegram' : 'ВКонтакте'}`}
      isCenter={true}
    >
      <Divider />

      {renderInstructions()}

      <div className={styles['form']}>
        <Form form={form} layout='vertical'>
          {renderFormFields()}
        </Form>
      </div>
    </DialogBox>
  );
};

export default PlatformsDialog;
