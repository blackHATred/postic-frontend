import { useState, useContext, useEffect } from 'react';
import { Input, Divider, Form } from 'antd';
import DialogBox, { DialogBoxProps } from '../dialogBox/DialogBox';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setRenameTeamDialog, setTeams } from '../../../stores/teamSlice';
import { Rename } from '../../../api/teamApi';
import { NotificationContext } from '../../../api/notification';

export interface TeamCreateDialogProps extends Omit<DialogBoxProps, 'onCancelClick'> {
  setOpen: (value: boolean) => void;
}

const TeamRenameDialog: React.FC = () => {
  const [form] = Form.useForm();
  const [teamName, setTeamName] = useState('');
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.teams.renameTeamDialog.isOpen);
  const notificationManager = useContext(NotificationContext);
  const teamId = useAppSelector((state) => state.teams.selectedTeamId);
  const oldName = useAppSelector(
    (state) =>
      state.teams.teams.find((value) => {
        return value.id == teamId;
      })?.name,
  );
  const teams = useAppSelector((value) => value.teams.teams);

  const onOk = () => {
    if (!teamName.trim()) {
      form.validateFields();
      return;
    }

    const renameRequest = {
      team_id: teamId,
      new_name: teamName,
    };
    Rename(renameRequest)
      .then((response) => {
        notificationManager.createNotification(
          'success',
          'Команда переименована',
          `Команда "${teamName}" успешно переименована`,
        );

        dispatch(setRenameTeamDialog(false));

        dispatch(
          setTeams(
            [...teams].map((team) => {
              if (team.id == teamId) return { ...team, name: teamName };
              return team;
            }),
          ),
        );

        form.resetFields();
        setTeamName('');
      })
      .catch((error) => {
        notificationManager.createNotification(
          'error',
          'Ошибка создания команды',
          error.message || 'Не удалось создать команду',
        );
      });
  };

  useEffect(() => {
    if (isOpen && oldName) {
      setTeamName(oldName);

      form.setFieldsValue({ teamName: oldName });
    }
  }, [isOpen, oldName, form]);

  return (
    <DialogBox
      bottomButtons={[
        {
          text: 'Сохранить',
          onButtonClick: onOk,
        },
      ]}
      isOpen={isOpen}
      onCancelClick={async () => {
        form.resetFields();
        setTeamName('');
        dispatch(setRenameTeamDialog(false));
      }}
      title={'Переименовать команду'}
      isCenter={true}
    >
      <Divider />

      <div className={styles['form']}>
        <Form form={form}>
          <Form.Item
            label='Название команды'
            name='teamName'
            rules={[
              {
                required: true,
                message: 'Пожалуйста, введите название команды',
              },
            ]}
            labelCol={{ span: 24 }}
          >
            <Input
              placeholder='Введите название команды'
              defaultValue={oldName}
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </Form.Item>
        </Form>
      </div>
    </DialogBox>
  );
};

export default TeamRenameDialog;
