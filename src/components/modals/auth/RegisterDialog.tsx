import React, { useContext, useEffect, useState } from 'react';
import { NotificationContext } from '../../../api/notification';
import DialogBox from '../dialogBox/DialogBox';
import BlueDashedTextBox from '../../ui/BlueDashedTextBox/BlueDashedTextBox';
import { Register } from '../../../api/api';
import { RegisterResult } from '../../../models/User/types';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setRegiserDialog } from '../../../stores/basePageDialogsSlice';
import { useCookies } from 'react-cookie';

const RegisterDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const [id, setID] = useState('');
  const [loading, setLoading] = useState(true);
  const notificationManager = useContext(NotificationContext);
  const isOpen = useAppSelector((state) => state.basePageDialogs.registerDialog.isOpen);
  const [, setCookie] = useCookies();

  useEffect(() => {
    setLoading(true);
    if (isOpen) {
      Register()
        .then((res: RegisterResult) => {
          setID(res.user_id.toString());
          setCookie('session', res.user_id.toString());
        })
        .catch(() => {
          notificationManager.createNotification('error', 'Ошибка регистрации', '');
        });
      setLoading(false);
    }
  }, [isOpen]);

  return (
    <DialogBox
      title={'Регистрация'}
      bottomButtons={[
        {
          text: 'Ok',
          onButtonClick: () => {
            dispatch(setRegiserDialog(false));
          },
        },
      ]}
      onCancelClick={async () => {
        dispatch(setRegiserDialog(false));
      }}
      isOpen={isOpen}
    >
      <BlueDashedTextBox isLoading={loading}>
        <div>Ваш ID: {id}</div>
      </BlueDashedTextBox>
    </DialogBox>
  );
};

export default RegisterDialog;
