import React, { useContext, useState } from 'react';
import { NotificationContext } from '../../../api/notification';
import { Form, Input, Typography } from 'antd';
import DialogBox from '../dialogBox/DialogBox';
import { RegisterWithUserData } from '../../../api/api'; // Новый метод API
import { UserData } from '../../../models/User/types';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setAuthorized, setCurrentUserId, setTeams } from '../../../stores/teamSlice';
import { MyTeams } from '../../../api/teamApi';
import { setRegisterEmailDialog } from '../../../stores/basePageDialogsSlice';

const { Text } = Typography;

const UserRegisterDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const notificationManager = useContext(NotificationContext);
  const isOpen = useAppSelector((state) => state.basePageDialogs.registerEmailDialog.isOpen);

  const handleRegister = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const userData: UserData = {
        username: values.username,
        email: values.email,
        password: values.password,
      };
      console.log(userData);

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
    <DialogBox
      title='Регистрация пользователя'
      bottomButtons={[
        {
          text: 'Зарегистрироваться',
          onButtonClick: handleRegister,
        },
      ]}
      onCancelClick={() => {
        dispatch(setRegisterEmailDialog(false));
      }}
      isOpen={isOpen}
    >
      <Form form={form} layout='vertical'>
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
          name='password'
          label='Пароль'
          rules={[{ required: true, message: 'Введите пароль' }]}
        >
          <Input.Password placeholder='Пароль' />
        </Form.Item>
      </Form>
    </DialogBox>
  );
};

export default UserRegisterDialog;
