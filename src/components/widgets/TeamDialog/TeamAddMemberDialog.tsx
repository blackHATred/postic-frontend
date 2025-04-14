import { useContext, useState } from 'react';
import { Typography, Input, Divider, Form, Checkbox } from 'antd';
import DialogBox, { DialogBoxProps } from '../../ui/dialogBox/DialogBox';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setAddMemberDialog, setTeams } from '../../../stores/teamSlice';
import { NotificationContext } from '../../../api/notification';
import { Invite, MyTeams } from '../../../api/teamApi';
import { Team } from '../../../models/Team/types';

const { Text } = Typography;

export interface TeamAddMemberDialogProps extends Omit<DialogBoxProps, 'onCancelClick'> {
  setOpen: (value: boolean) => void;
}

const TeamAddMemberDialog: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.teams.addMemberDialog.isOpen);
  const [permissions, setPermissions] = useState({
    comments: false,
    posts: false,
  });
  const teamId = useAppSelector((state) => state.teams.selectedTeamId);
  const notificationManager = useContext(NotificationContext);
  const [inviteUserId, setInviteUserId] = useState('');

  const [empty_checkbox, setEmptyCheckbox] = useState('');

  const updateTeamList = () => {
    MyTeams()
      .then((res: { teams: Team[] }) => {
        if (res.teams) {
          dispatch(setTeams(res.teams));
        }
      })
      .catch(() => {});
  };

  const handleAdminChange = (checked: boolean) => {
    setIsAdmin(checked);
    if (checked) {
      setPermissions({ comments: true, posts: true });
      setEmptyCheckbox('');
    } else {
      setPermissions({ comments: false, posts: false });
    }
  };

  const handlePermissionChange = (key: 'comments' | 'posts', checked: boolean) => {
    const newPermissions = { ...permissions, [key]: checked };
    setPermissions(newPermissions);

    if (isAdmin || newPermissions.comments || newPermissions.posts) {
      setEmptyCheckbox('');
    }
  };

  const onOk = async () => {
    if (!isAdmin && !permissions.comments && !permissions.posts) {
      setEmptyCheckbox('Пожалуйста, выберите хотя бы одно право доступа');
      return;
    }

    // Prepare roles array based on permissions
    const roles: string[] = [];
    if (isAdmin) {
      roles.push('admin');
    }
    if (permissions.comments) {
      roles.push('comments');
    }
    if (permissions.posts) {
      roles.push('posts');
    }

    const result = await Invite({
      user_id: Number(inviteUserId),
      team_id: teamId,
      roles,
    });
    dispatch(setAddMemberDialog(false));
    updateTeamList();
  };

  return (
    <DialogBox
      bottomButtons={[
        {
          text: 'Добавить',
          onButtonClick: onOk,
        },
      ]}
      isOpen={isOpen}
      onCancelClick={async () => {
        dispatch(setAddMemberDialog(false));
      }}
      title={'Добавление участника'}
      isCenter={true}
    >
      <Divider />

      <div className={styles['form']}>
        <Form>
          <Form.Item label='ID участника' name='vertical' rules={[{ required: true }]} labelCol={{ span: 24 }}>
            <Input placeholder='Введите ID участника' value={inviteUserId} onChange={(e) => setInviteUserId(e.target.value)} />
          </Form.Item>
        </Form>

        <div className={styles['checkboxes']}>
          <Text strong>Права доступа</Text>
          <Checkbox
            checked={permissions.comments}
            disabled={isAdmin}
            onChange={(e) => handlePermissionChange('comments', e.target.checked)}
          >
            Комментарии
          </Checkbox>
          <Checkbox checked={permissions.posts} disabled={isAdmin} onChange={(e) => handlePermissionChange('posts', e.target.checked)}>
            Посты
          </Checkbox>
          <Checkbox checked={isAdmin} onChange={(e) => handleAdminChange(e.target.checked)}>
            Администратор
          </Checkbox>
          {empty_checkbox && <Text type='danger'>{empty_checkbox}</Text>}
        </div>
      </div>
    </DialogBox>
  );
};

export default TeamAddMemberDialog;
