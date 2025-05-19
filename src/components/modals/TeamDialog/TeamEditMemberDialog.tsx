import { useEffect, useState } from 'react';
import { Input, Divider, Form } from 'antd';
import DialogBox from '../dialogBox/DialogBox';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setEditMemberDialog, setTeams } from '../../../stores/teamSlice';
import { MyTeams, UpdateRole } from '../../../api/teamApi';
import { Team } from '../../../models/Team/types';
import PermissionCheckboxes from '../../dummy/PermissionCheckboxes';

const TeamEditMemberDialog: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.teams.editMemberDialog.isOpen);
  const [permissions, setPermissions] = useState({
    comments: false,
    posts: false,
    analytics: false,
  });
  const teamId = useAppSelector((state) => state.teams.selectedTeamId);
  const [, setInviteUserId] = useState('');
  const selectedMemberId = useAppSelector((state) => state.teams.selectedMemberId);
  const roles = useAppSelector((state) => state.teams.teams)
    .find((value) => {
      return value.id == teamId;
    })
    ?.users.find((value) => {
      return value.user_id == selectedMemberId;
    })?.roles;

  const [empty_checkbox, setEmptyCheckbox] = useState('');

  const updateTeamList = () => {
    MyTeams().then((res: { teams: Team[] }) => {
      if (res.teams) {
        dispatch(setTeams(res.teams));
      }
    });
  };

  useEffect(() => {
    if (isOpen) {
      if (roles) {
        const hasAdminRole = roles.includes('admin');
        setIsAdmin(hasAdminRole);
        setPermissions({
          comments: hasAdminRole || roles.includes('comments'),
          posts: hasAdminRole || roles.includes('posts'),
          analytics: hasAdminRole || roles.includes('analytics'),
        });
        if (hasAdminRole || roles.includes('comments') || roles.includes('posts')) {
          setEmptyCheckbox('');
        }
      } else {
      }
    }
  }, [roles, selectedMemberId, teamId]);

  const handleAdminChange = (checked: boolean) => {
    setIsAdmin(checked);
    if (checked) {
      setPermissions({ analytics: false, comments: true, posts: true });
      setEmptyCheckbox('');
    } else {
      setPermissions({ comments: false, posts: false, analytics: false });
    }
  };

  const handlePermissionChange = (key: 'comments' | 'posts' | 'analytics', checked: boolean) => {
    const newPermissions = { ...permissions, [key]: checked };
    setPermissions(newPermissions);

    if (isAdmin || newPermissions.comments || newPermissions.posts || newPermissions.analytics) {
      setEmptyCheckbox('');
    }
  };

  const onOk = async () => {
    if (!isAdmin && !permissions.comments && !permissions.posts && !permissions.analytics) {
      setEmptyCheckbox('Пожалуйста, выберите хотя бы одно право доступа');
      return;
    }

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
    if (permissions.analytics) {
      roles.push('analytics');
    }

    await UpdateRole({
      user_id: selectedMemberId,
      team_id: teamId,
      roles,
    });
    dispatch(setEditMemberDialog(false));

    updateTeamList();
  };

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
        dispatch(setEditMemberDialog(false));
      }}
      title={'Редактирование прав'}
      isCenter={true}
    >
      <Divider />

      <div className={styles['form']}>
        <Form>
          <Form.Item
            label='ID участника'
            name='vertical'
            rules={[{ required: true }]}
            labelCol={{ span: 24 }}
          >
            <Input
              placeholder='Введите ID участника'
              defaultValue={selectedMemberId}
              onChange={(e) => setInviteUserId(e.target.value)}
              disabled={true}
            />
          </Form.Item>
        </Form>

        <PermissionCheckboxes
          permissions={permissions}
          isAdmin={isAdmin}
          empty_checkbox={empty_checkbox}
          handlePermissionChange={handlePermissionChange}
          handleAdminChange={handleAdminChange}
        />
      </div>
    </DialogBox>
  );
};

export default TeamEditMemberDialog;
