import React, { useContext, useState } from 'react';
import { Button } from 'antd';
import { getVkAuthUrl } from '../../../api/api';
import { NotificationContext } from '../../../api/notification';
import styles from './styles.module.scss';

interface VkAuthButtonProps {
  text: string;
  disabled?: boolean;
}

const VkAuthButton: React.FC<VkAuthButtonProps> = ({ text, disabled = false }) => {
  const [loading, setLoading] = useState(false);
  const notificationManager = useContext(NotificationContext);

  const handleVkAuth = async () => {
    try {
      setLoading(true);
      const response = await getVkAuthUrl();
      if (response && response.auth_url) {
        window.location.href = response.auth_url;
      } else {
        throw new Error('Не удалось получить URL для авторизации');
      }
    } catch (error) {
      notificationManager.createNotification(
        'error',
        'Ошибка авторизации через ВКонтакте',
        'Попробуйте позже',
      );
      setLoading(false);
    }
  };

  return (
    <Button
      type='primary'
      className={styles.vkButton}
      onClick={handleVkAuth}
      loading={loading}
      disabled={disabled}
      block
    >
      {text}
    </Button>
  );
};

export default VkAuthButton;
