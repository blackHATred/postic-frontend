import React, { useContext, useEffect, useState } from 'react';
import { Form, Input, Tabs, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { NotificationContext } from '../../../api/notification';
import ClickableButton from '../../ui/Button/Button';
import styles from './styles.module.scss';
import { Me, UpdatePassword, UpdateProfile } from '../../../api/api';
import { EMAIL_REGEX, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from '../../../utils/validation';
import axios from 'axios';

const { Title, Text } = Typography;

interface UserProfile {
  id: number;
  nickname: string;
  email: string;
}

const ProfilePage: React.FC = () => {
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const notificationManager = useContext(NotificationContext);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await Me();
      setUserProfile(response);

      profileForm.setFieldsValue({
        nickname: response.nickname,
        email: response.email,
      });
    } catch (error) {
      notificationManager.createNotification(
        'error',
        'Ошибка загрузки данных',
        'Не удалось загрузить информацию о пользователе',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const values = await profileForm.validateFields();
      setLoading(true);

      try {
        await UpdateProfile(values.nickname, values.email);

        setUserProfile((prev) =>
          prev ? { ...prev, nickname: values.nickname, email: values.email } : null,
        );
        notificationManager.createNotification(
          'success',
          'Профиль обновлен',
          'Ваш профиль успешно обновлен',
        );
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorResponse = error.response?.data;
          if (errorResponse && errorResponse.error) {
            notificationManager.createNotification(
              'error',
              'Ошибка обновления профиля',
              errorResponse.error,
            );
          } else if (error.response?.status === 401) {
            notificationManager.createNotification(
              'error',
              'Ошибка авторизации',
              'Пользователь не авторизован',
            );
          } else if (error.response?.status === 409) {
            notificationManager.createNotification(
              'error',
              'Ошибка обновления профиля',
              'Пользователь с таким email уже существует',
            );
          } else if (error.response?.status === 400) {
            notificationManager.createNotification(
              'error',
              'Ошибка обновления профиля',
              'Должно быть указано хотя бы одно поле для обновления',
            );
          } else {
            notificationManager.createNotification(
              'error',
              'Ошибка обновления профиля',
              'Произошла непредвиденная ошибка',
            );
          }
        } else {
          notificationManager.createNotification(
            'error',
            'Ошибка обновления профиля',
            'Произошла непредвиденная ошибка',
          );
        }
      }
    } catch (error) {
      notificationManager.createNotification(
        'error',
        'Ошибка валидации',
        'Пожалуйста, заполните все обязательные поля корректно',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      setLoading(true);

      try {
        await UpdatePassword(values.oldPassword, values.newPassword);

        passwordForm.resetFields();
        notificationManager.createNotification(
          'success',
          'Пароль обновлен',
          'Ваш пароль успешно изменен',
        );
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorResponse = error.response?.data;
          if (errorResponse && errorResponse.error) {
            notificationManager.createNotification(
              'error',
              'Ошибка смены пароля',
              errorResponse.error,
            );
          } else if (
            error.response?.status === 401 &&
            error.response?.data?.error === 'Неверный старый пароль'
          ) {
            notificationManager.createNotification(
              'error',
              'Ошибка смены пароля',
              'Неверный старый пароль',
            );
          } else if (error.response?.status === 401) {
            notificationManager.createNotification(
              'error',
              'Ошибка авторизации',
              'Пользователь не авторизован',
            );
          } else if (error.response?.status === 400) {
            notificationManager.createNotification(
              'error',
              'Ошибка смены пароля',
              'Старый и новый пароли обязательны для заполнения',
            );
          } else {
            notificationManager.createNotification(
              'error',
              'Ошибка смены пароля',
              'Произошла непредвиденная ошибка',
            );
          }
        } else {
          notificationManager.createNotification(
            'error',
            'Ошибка смены пароля',
            'Произошла непредвиденная ошибка',
          );
        }
      }
    } catch (error) {
      notificationManager.createNotification(
        'error',
        'Ошибка валидации',
        'Пожалуйста, заполните все обязательные поля корректно',
      );
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: '1',
      label: 'Личные данные',
      children: (
        <div className={styles.formContainer}>
          <Form form={profileForm} layout='vertical'>
            <Form.Item
              name='nickname'
              label='Имя пользователя'
              rules={[{ required: true, message: 'Введите имя пользователя' }]}
            >
              <Input prefix={<UserOutlined />} placeholder='Имя пользователя' />
            </Form.Item>

            <Form.Item
              name='email'
              label='Email'
              rules={[
                { required: true, message: 'Введите email' },
                {
                  pattern: EMAIL_REGEX,
                  message: 'Пожалуйста, введите корректный email',
                },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder='Email' />
            </Form.Item>

            <ClickableButton
              text='Сохранить'
              disabled={loading}
              onButtonClick={handleUpdateProfile}
            />
          </Form>
        </div>
      ),
    },
    {
      key: '2',
      label: 'Изменить пароль',
      children: (
        <div className={styles.formContainer}>
          <Form form={passwordForm} layout='vertical'>
            <Form.Item
              name='oldPassword'
              label='Текущий пароль'
              rules={[{ required: true, message: 'Введите текущий пароль' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder='Текущий пароль' />
            </Form.Item>

            <Form.Item
              name='newPassword'
              label='Новый пароль'
              rules={[
                { required: true, message: 'Введите новый пароль' },
                {
                  min: MIN_PASSWORD_LENGTH,
                  message: `Пароль должен содержать минимум ${MIN_PASSWORD_LENGTH} символов`,
                },
                {
                  max: MAX_PASSWORD_LENGTH,
                  message: `Пароль не должен превышать ${MAX_PASSWORD_LENGTH} символов`,
                },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder='Новый пароль' />
            </Form.Item>

            <Form.Item
              name='confirmPassword'
              label='Подтвердите новый пароль'
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Подтвердите новый пароль' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Пароли не совпадают'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder='Подтвердите новый пароль' />
            </Form.Item>

            <ClickableButton
              text='Изменить пароль'
              disabled={loading}
              onButtonClick={handleUpdatePassword}
            />
          </Form>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.profileContainer}>
      <div>
        <Title level={2}>Профиль пользователя</Title>
        {userProfile && (
          <div className={styles.userInfoHeader}>
            <Text strong>{userProfile.nickname}</Text>
            <Text type='secondary'>{userProfile.email}</Text>
            <Text>
              {' '}
              ID пользователя: <Text copyable={true}>{userProfile.id}</Text>
            </Text>
          </div>
        )}
      </div>

      <Tabs defaultActiveKey='1' items={items} />
    </div>
  );
};

export default ProfilePage;
