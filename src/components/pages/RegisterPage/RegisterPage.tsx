import React, { useContext, useState } from 'react';
import { useAppDispatch } from '../../../stores/hooks';
import { Form, Input } from 'antd';
import { NotificationContext } from '../../../api/notification';
import { setRegisterEmailDialog } from '../../../stores/basePageDialogsSlice';
import { setAuthorized, setCurrentUserId, setTeams } from '../../../stores/teamSlice';
import { RegisterWithUserData } from '../../../api/api';
import { MyTeams } from '../../../api/teamApi';
import { UserData } from '../../../models/User/types';
import styles from './styles.module.scss';
import ClickableButton from '../../ui/Button/Button';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../api/routers/routes';
import { validatePasswordSame } from '../../../utils/validation';

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
      const err = validatePasswordSame(values.password1, values.password2);
      if (err) {
        notificationManager.createNotification('error', 'Ошибка пароля', err);
        return;
      }

      const userData: UserData = {
        username: values.username,
        email: values.email,
        password: values.password1,
      };

      const result = await RegisterWithUserData(userData);

      if (result && result.user_id) {
        dispatch(setCurrentUserId(result.user_id));

        const teamsResult = await MyTeams();
        if (teamsResult.teams) {
          dispatch(setTeams(teamsResult.teams));
        }

        dispatch(setAuthorized('authorized'));
        dispatch(setRegisterEmailDialog(false));
        notificationManager.createNotification(
          'success',
          'Регистрация успешна',
          'Ваш аккаунт создан',
        );
        navigate(routes.teams());
      }
    } catch (error) {
      notificationManager.createNotification(
        'error',
        'Ошибка регистрации',
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

      <Form.Item
        name='password2'
        label='Повторите пароль'
        rules={[
          {
            required: true,
            message: 'Повторите пароль',
          },
        ]}
      >
        <Input.Password placeholder='Повторите пароль' />
      </Form.Item>
      <ClickableButton
        text='Зарегестрироваться'
        disabled={loading}
        onButtonClick={handleRegister}
      />
    </Form>
  );
};

export default RegisterPage;
