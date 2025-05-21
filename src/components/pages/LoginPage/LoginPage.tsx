import React, { useContext, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { Form, Input } from 'antd';
import { NotificationContext } from '../../../api/notification';
import { setLoginEmailDialog } from '../../../stores/basePageDialogsSlice';
import { setAuthorized, setCurrentUserId, setTeams } from '../../../stores/teamSlice';
import { Login, Me } from '../../../api/api';
import { MyTeams } from '../../../api/teamApi';
import { UserData } from '../../../models/User/types';
import styles from './styles.module.scss';
import ClickableButton from '../../ui/Button/Button';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../api/routers/routes';

const loginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const notificationManager = useContext(NotificationContext);
  const isOpen = useAppSelector((state) => state.basePageDialogs.loginEmailDialog.isOpen);
  const navigate = useNavigate();
  const handleLogin = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const userDataReq: UserData = {
        username: values.username,
        email: values.email,
        password: values.password1,
      };

      dispatch(setLoginEmailDialog(false));

      dispatch(setAuthorized('loading'));

      try {
        await Login(Number(userDataReq.username));

        const userData = await Me();

        if (userData && userData.user_id) {
          const userId = Number(userData.user_id);
          dispatch(setCurrentUserId(userId));

          try {
            const teamsResult = await MyTeams();
            if (teamsResult.teams) {
              dispatch(setTeams(teamsResult.teams));
            }
            dispatch(setAuthorized('authorized'));
          } catch {
            // Если не удалось загрузить команды, всё равно авторизуем пользователя
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
    <Form form={form} layout='vertical' className={styles.form}>
      <Form.Item
        name='username'
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
          { type: 'email', message: 'Некорректный формат email' },
        ]}
      >
        <Input placeholder='Email' />
      </Form.Item>

      <Form.Item
        name='password1'
        label='Пароль'
        rules={[{ required: true, message: 'Введите пароль' }]}
      >
        <Input.Password placeholder='Пароль' />
      </Form.Item>
      <ClickableButton text='Войти' disabled={loading} onButtonClick={handleLogin} />
    </Form>
  );
};

export default loginPage;
