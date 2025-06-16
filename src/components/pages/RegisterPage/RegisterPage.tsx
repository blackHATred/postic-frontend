import React, { useContext, useState } from 'react';
import { useAppDispatch } from '../../../stores/hooks';
import { Form, Input, Divider, Typography } from 'antd';
import { NotificationContext } from '../../../api/notification';
import { setAuthorized, setCurrentUserId, setTeams } from '../../../stores/teamSlice';
import { RegisterWithUserData } from '../../../api/api';
import { MyTeams } from '../../../api/teamApi';
import { RegisterRequest } from '../../../models/User/types';
import styles from './styles.module.scss';
import ClickableButton from '../../ui/Button/Button';
import { useNavigate, Link } from 'react-router-dom';
import { routes } from '../../../app/App.routes';
import {
  EMAIL_REGEX,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  validatePasswordSame,
} from '../../../utils/validation';
import VkAuthButton from '../../ui/VkAuthButton/VkAuthButton';
import { saveAuthToken } from '../../../utils/tokenStorage';
import { HomeOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text } = Typography;

const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const notificationManager = useContext(NotificationContext);
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const err = validatePasswordSame(values.password, values.password2);
      if (err) {
        notificationManager.createNotification('error', 'Ошибка пароля', err);
        return;
      }

      const userData: RegisterRequest = {
        nickname: values.nickname,
        email: values.email,
        password: values.password,
      };

      try {
        const result = await RegisterWithUserData(userData);

        if (result && result.user_id) {
          if (result.token) {
            saveAuthToken(result.token);
          }

          dispatch(setCurrentUserId(result.user_id));

          const teamsResult = await MyTeams();
          if (teamsResult.teams) {
            dispatch(setTeams(teamsResult.teams));
          }

          dispatch(setAuthorized('authorized'));
          notificationManager.createNotification(
            'success',
            'Регистрация успешна',
            'Ваш аккаунт создан',
          );
          navigate(routes.teams());
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorResponse = error.response?.data;
          if (errorResponse && errorResponse.error) {
            notificationManager.createNotification(
              'error',
              'Ошибка регистрации',
              errorResponse.error,
            );
          } else if (error.response?.status === 409) {
            notificationManager.createNotification(
              'error',
              'Ошибка регистрации',
              'Пользователь с таким email уже существует',
            );
          } else if (error.response?.status === 400) {
            notificationManager.createNotification(
              'error',
              'Ошибка регистрации',
              'Email, пароль и имя пользователя обязательны для заполнения',
            );
          } else {
            notificationManager.createNotification(
              'error',
              'Ошибка регистрации',
              'Произошла непредвиденная ошибка',
            );
          }
        } else {
          notificationManager.createNotification(
            'error',
            'Ошибка регистрации',
            'Произошла непредвиденная ошибка',
          );
        }
      }
    } catch (error) {
      notificationManager.createNotification(
        'error',
        'Ошибка регистрации',
        'Пожалуйста, заполните все обязательные поля корректно',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.headerActions}>
        <ClickableButton
          className={styles.homeButton}
          icon={<HomeOutlined />}
          text='На главную'
          type='link'
          onButtonClick={() => navigate(routes.home())}
        />
      </div>
      <h1 className={styles.title}>Регистрация</h1>
      <Form form={form} layout='vertical' className={styles.form}>
        <Form.Item
          name='nickname'
          label='Имя пользователя'
          rules={[{ required: true, message: 'Введите имя пользователя' }]}
        >
          <Input placeholder='Имя пользователя' />
        </Form.Item>

        <Form.Item
          name='email'
          label='Email'
          rules={[
            { required: true, message: 'Введите email' },
            { pattern: EMAIL_REGEX, message: 'Пожалуйста, введите корректный email' },
          ]}
        >
          <Input placeholder='Email' />
        </Form.Item>

        <Form.Item
          name='password'
          label='Пароль'
          rules={[
            { required: true, message: 'Введите пароль' },
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
          <Input.Password placeholder='Пароль' />
        </Form.Item>

        <Form.Item
          name='password2'
          label='Повторите пароль'
          dependencies={['password']}
          rules={[
            { required: true, message: 'Повторите пароль' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Пароли не совпадают'));
              },
            }),
          ]}
        >
          <Input.Password placeholder='Повторите пароль' />
        </Form.Item>

        <ClickableButton
          text='Зарегистрироваться'
          disabled={loading}
          onButtonClick={handleRegister}
        />

        <div className={styles.linkContainer}>
          <Text>Уже есть аккаунт?</Text>
          <Link to={routes.login()}>Войти</Link>
        </div>

        <Divider>или</Divider>

        <VkAuthButton text='Зарегистрироваться через ВКонтакте' disabled={loading} />
      </Form>
    </div>
  );
};

export default RegisterPage;
