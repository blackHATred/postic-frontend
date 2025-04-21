import React, { useContext, useEffect, useState } from 'react';
import { NotificationContext } from '../../../api/notification';
import DialogBox from '../dialogBox/DialogBox';
import BlueDashedTextBox from '../../ui/BlueDashedTextBox/BlueDashedTextBox';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setPersonalInfoDialog } from '../../../stores/basePageDialogsSlice';
import { Secret } from '../../../api/teamApi';
import { MeSecretInfo } from '../../../models/Team/types';
import { Typography } from 'antd';
import styles from './styles.module.scss';

const { Text } = Typography;

const MeDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const [secretTeamKey, setSecretTeamKey] = useState('');
  const [loading, setLoading] = useState(true);
  const isOpen = useAppSelector((state) => state.basePageDialogs.personalInfoDialog.isOpen);
  const notificationManager = useContext(NotificationContext);
  const team_id = useAppSelector((state) => state.teams.selectedTeamId);

  useEffect(() => {
    setLoading(true);
    if (isOpen) {
      Secret(team_id)
        .then((res: MeSecretInfo) => {
          setSecretTeamKey(res.secret);
        })
        .catch(() => {
          notificationManager.createNotification('error', 'Ошибка получения личной информации', '');
        });
      setLoading(false);
    }
  }, [isOpen]);

  return (
    <DialogBox
      title={'Секретный ключ'}
      bottomButtons={[
        {
          text: 'Ok',
          onButtonClick: () => {
            dispatch(setPersonalInfoDialog(false));
          },
        },
      ]}
      onCancelClick={async () => {
        dispatch(setPersonalInfoDialog(false));
      }}
      isOpen={isOpen}
    >
      <BlueDashedTextBox isLoading={loading}>
        <div className={styles['secret-text']}>
          <div>
            <Text strong>Командный секретный ключ:</Text>
          </div>
          <div className={styles['secret-text-key']}>
            <Text copyable> {secretTeamKey}</Text>
          </div>
        </div>
      </BlueDashedTextBox>
    </DialogBox>
  );
};

export default MeDialog;
