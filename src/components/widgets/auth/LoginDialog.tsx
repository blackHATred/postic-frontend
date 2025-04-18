import React, { useContext } from 'react';
import DialogBoxXInputs from '../dialogBoxes/DialogBoxXInputs';
import { NotificationContext } from '../../../api/notification';

import { RegisterResult } from '../../../models/User/types';
import { Login } from '../../../api/api';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setLoginDialog } from '../../../stores/basePageDialogsSlice';

const LoginDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const notificationManager = useContext(NotificationContext);
  const isOpen = useAppSelector((state) => state.basePageDialogs.loginDialog.isOpen);

  return (
    <DialogBoxXInputs
      text={'Введите ID'}
      title={'Вход'}
      input_placeholders={{ id: 'ID' }}
      bottomButtons={[
        {
          text: 'Ok',
          onButtonClick: (args) => {
            if (args['id'])
              Login(parseInt(args['id']))
                .then((res: RegisterResult) => {
                  dispatch(setLoginDialog(false));
                })
                .catch(() => {
                  notificationManager.createNotification('error', 'Ошибка регистрации', '');
                });
          },
        },
      ]}
      onCancelClick={async () => {
        dispatch(setLoginDialog(false));
      }}
      isOpen={isOpen}
    />
  );
};

export default LoginDialog;
