import React, { useContext, useState } from 'react';
import { useAppDispatch } from '../../../stores/hooks';
import { Form, Input, Divider, Typography } from 'antd';
import { NotificationContext } from '../../../api/notification';
import { setAuthorized, setCurrentUserId, setTeams } from '../../../stores/teamSlice';
import { Login } from '../../../api/api';
import { MyTeams } from '../../../api/teamApi';
import styles from './styles.module.scss';
import ClickableButton from '../../ui/Button/Button';
import { useNavigate, Link } from 'react-router-dom';
import { routes } from '../../../app/App.routes';
import VkAuthButton from '../../ui/VkAuthButton/VkAuthButton';
import { saveAuthToken } from '../../../utils/tokenStorage';
import { HomeOutlined } from '@ant-design/icons';
import { EMAIL_REGEX, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from '../../../utils/validation';
import axios from 'axios';

const { Text } = Typography;

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const notificationManager = useContext(NotificationContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      dispatch(setAuthorized('loading'));

      try {
        const response = await Login(values.email, values.password);

        if (response && response.token) {
          saveAuthToken(response.token);
        }

        if (response && response.user_id) {
          const userId = Number(response.user_id);
          dispatch(setCurrentUserId(userId));

          try {
            const teamsResult = await MyTeams();
            if (teamsResult.teams) {
              dispatch(setTeams(teamsResult.teams));
            }
            dispatch(setAuthorized('authorized'));
          } catch {
            dispatch(setAuthorized('authorized'));
          }

          notificationManager.createNotification(
            'success',
            'Вход в аккаунт',
            'Вы успешно вошли в аккаунт',
          );
          navigate(routes.teams());
        } else {
          dispatch(setAuthorized('not_authorized'));
        }
      } catch (error) {
        dispatch(setAuthorized('not_authorized'));

        if (axios.isAxiosError(error)) {
          const errorResponse = error.response?.data;
          if (errorResponse && errorResponse.error) {
            notificationManager.createNotification('error', 'Ошибка входа', errorResponse.error);
          } else if (error.response?.status === 401) {
            notificationManager.createNotification(
              'error',
              'Ошибка входа',
              'Неверный email или пароль',
            );
          } else if (error.response?.status === 400) {
            notificationManager.createNotification(
              'error',
              'Ошибка входа',
              'Email и пароль обязательны для заполнения',
            );
          } else {
            notificationManager.createNotification(
              'error',
              'Ошибка входа',
              'Произошла непредвиденная ошибка',
            );
          }
        } else {
          notificationManager.createNotification(
            'error',
            'Ошибка входа',
            'Произошла непредвиденная ошибка',
          );
        }
      }
    } catch (error) {
      notificationManager.createNotification(
        'error',
        'Ошибка входа',
        'Пожалуйста, заполните все обязательные поля корректно',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.headerActions}>
        <ClickableButton
          className={styles.homeButton}
          icon={<HomeOutlined />}
          text='На главную'
          type='link'
          onButtonClick={() => navigate(routes.home())}
        />
      </div>
      <h1 className={styles.title}>Вход в аккаунт</h1>
      <Form form={form} layout='vertical' className={styles.form}>
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

        <ClickableButton text='Войти' disabled={loading} onButtonClick={handleLogin} />

        <div className={styles.linkContainer}>
          <Text>Нет аккаунта?</Text>
          <Link to={routes.register()}>Зарегистрироваться</Link>
        </div>

        <Divider>или</Divider>

        <VkAuthButton text='Войти через ВКонтакте' disabled={loading} />
      </Form>
    </div>
  );
};

export default LoginPage;
