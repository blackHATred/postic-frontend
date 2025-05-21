import React, { useContext, useState } from 'react';
import { NotificationContext } from '../../../api/notification';
import { Form, Input, Divider } from 'antd';
import DialogBox from '../dialogBox/DialogBox';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setLoginEmailDialog } from '../../../stores/basePageDialogsSlice';
import styles from './styles.module.scss';
import VkAuthButton from '../../ui/VkAuthButton/VkAuthButton';

const UserLoginDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const notificationManager = useContext(NotificationContext);
  const isOpen = useAppSelector((state) => state.basePageDialogs.loginEmailDialog.isOpen);

  const handleLogin = async () => {
    //
  };

  return (
    <DialogBox
      title='Вход в аккаунт'
      bottomButtons={[
        {
          text: 'Войти',
          onButtonClick: handleLogin,
          loading: loading,
        },
      ]}
      onCancelClick={() => {
        dispatch(setLoginEmailDialog(false));
      }}
      isOpen={isOpen}
      isCenter={true}
    >
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
          name='password'
          label='Пароль'
          rules={[{ required: true, message: 'Введите пароль' }]}
        >
          <Input.Password placeholder='Пароль' />
        </Form.Item>

        <Divider>или</Divider>

        <VkAuthButton text='Войти через ВКонтакте' disabled={loading} />
      </Form>
    </DialogBox>
  );
};

export default UserLoginDialog;
