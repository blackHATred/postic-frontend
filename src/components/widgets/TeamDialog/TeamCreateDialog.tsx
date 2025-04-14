import { useState, useContext } from 'react';
import { Typography, Input, Divider, Form } from 'antd';
import DialogBox, { DialogBoxProps } from '../../ui/dialogBox/DialogBox';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setCreateTeamDialog, addTeam, setTeams } from '../../../stores/teamSlice';
import { MyTeams, TeamCreate } from '../../../api/teamApi';
import { Team, TeamCreateRequest } from '../../../models/Team/types';
import { NotificationContext } from '../../../api/notification';

const { Text } = Typography;

export interface TeamCreateDialogProps extends Omit<DialogBoxProps, 'onCancelClick'> {
  setOpen: (value: boolean) => void;
}

const TeamCreateDialog: React.FC = () => {
  const [form] = Form.useForm();
  const [teamName, setTeamName] = useState('');
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.teams.createTeamDialog.isOpen);
  const notificationManager = useContext(NotificationContext);

  const updateTeamList = () => {
    MyTeams()
      .then((res: { teams: Team[] }) => {
        if (res.teams) {
          dispatch(setTeams(res.teams));
        }
      })
      .catch(() => {
        console.log('Error getting teams');
      });
  };

  const onOk = () => {
    if (!teamName.trim()) {
      form.validateFields();
      return;
    }

    const newTeam: TeamCreateRequest = {
      team_name: teamName,
    };
    TeamCreate(newTeam)
      .then((response) => {
        const createdTeam: Team = {
          ...newTeam,
          id: response.team_id,
          name: teamName,
          users: [],
          created_at: new Date().toISOString(),
        };

        dispatch(addTeam(createdTeam));

        notificationManager.createNotification('success', 'Команда создана', `Команда "${teamName}" успешно создана`);

        dispatch(setCreateTeamDialog(false));

        form.resetFields();
        setTeamName('');
      })
      .catch((error) => {
        notificationManager.createNotification('error', 'Ошибка создания команды', error.message || 'Не удалось создать команду');
      });
    updateTeamList();
    updateTeamList();
  };

  return (
    <DialogBox
      bottomButtons={[
        {
          text: 'Создать',
          onButtonClick: onOk,
        },
      ]}
      isOpen={isOpen}
      onCancelClick={async () => {
        form.resetFields();
        setTeamName('');
        dispatch(setCreateTeamDialog(false));
      }}
      title={'Создание команды'}
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
            <Input placeholder='Введите название команды' value={teamName} onChange={(e) => setTeamName(e.target.value)} />
          </Form.Item>
        </Form>
      </div>
    </DialogBox>
  );
};

export default TeamCreateDialog;
