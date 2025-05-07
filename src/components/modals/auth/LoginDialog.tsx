import React, { useContext } from 'react';
import DialogBoxXInputs from '../dialogBoxes/DialogBoxXInputs';
import { NotificationContext } from '../../../api/notification';

import { RegisterResult } from '../../../models/User/types';
import { Login, Me } from '../../../api/api';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setLoginDialog } from '../../../stores/basePageDialogsSlice';
import { setAuthorized, setCurrentUserId, setTeams } from '../../../stores/teamSlice';
import { MyTeams } from '../../../api/teamApi';
import { Team } from '../../../models/Team/types';

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
            if (args['id']) {
              Login(parseInt(args['id']))
                .then((res: RegisterResult) => {
                  dispatch(setLoginDialog(false));
                  dispatch(setAuthorized('loading'));
                  Me()
                    .then((userData) => {
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
                    })
                    .catch((error) => {
                      dispatch(setAuthorized('not_authorized'));
                    });
                })
                .catch(() => {
                  notificationManager.createNotification('error', 'Ошибка входа в аккаунт', '');
                });
            }
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
