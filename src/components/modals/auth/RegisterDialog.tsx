import React, { useContext, useEffect, useState } from 'react';
import { NotificationContext } from '../../../api/notification';
import DialogBox from '../dialogBox/DialogBox';
import BlueDashedTextBox from '../../ui/BlueDashedTextBox/BlueDashedTextBox';
import { Me, Register } from '../../../api/api';
import { RegisterResult } from '../../../models/User/types';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setRegiserDialog } from '../../../stores/basePageDialogsSlice';
import { setAuthorized, setCurrentUserId, setTeams } from '../../../stores/teamSlice';
import { MyTeams } from '../../../api/teamApi';
import { Team } from '../../../models/Team/types';

const RegisterDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const [id, setID] = useState('');
  const [loading, setLoading] = useState(true);
  const notificationManager = useContext(NotificationContext);
  const isOpen = useAppSelector((state) => state.basePageDialogs.registerDialog.isOpen);

  useEffect(() => {
    setLoading(true);
    if (isOpen) {
      Register()
        .then((res: RegisterResult) => {
          setID(res.user_id.toString());
          dispatch(setAuthorized('loading'));
          Me().then((userData) => {
            if (userData && userData.user_id) {
              const userId = Number(userData.user_id);
              dispatch(setCurrentUserId(userId));

              MyTeams()
                .then((res: { teams: Team[] }) => {
                  if (res.teams) {
                    dispatch(setTeams(res.teams));
                    dispatch(setAuthorized('authorized'));
                  }
                })
                .catch(() => {
                  dispatch(setAuthorized('authorized'));
                });
            } else {
              dispatch(setAuthorized('not_authorized'));
            }
          });
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
