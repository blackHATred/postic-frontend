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

        // Сохраняем токен авторизации
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
        notificationManager.createNotification(
          'error',
          'Ошибка входа',
          (error as Error).message || '',
        );
      }
    } catch (error) {
      notificationManager.createNotification(
        'error',
        'Ошибка входа',
        (error as Error).message || '',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h1 className={styles.title}>Вход в аккаунт</h1>
      <Form form={form} layout='vertical' className={styles.form}>
        <Form.Item
          name='email'
          label='Email'
          rules={[
            { required: true, message: 'Введите email' },
            { type: 'email', message: 'Некорректный формат email' },
          ]}
        >
          <Input placeholder='Email' />
        </Form.Item>

        <Form.Item
          name='password'
          label='Пароль'
          rules={[{ required: true, message: 'Введите пароль' }]}
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
