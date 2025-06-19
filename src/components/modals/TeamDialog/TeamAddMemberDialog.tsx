import { useState } from 'react';
import { Input, Divider, Form, notification } from 'antd';
import DialogBox from '../dialogBox/DialogBox';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setAddMemberDialog, setTeams } from '../../../stores/teamSlice';
import { Invite, MyTeams } from '../../../api/teamApi';
import { Team } from '../../../models/Team/types';
import PermissionCheckboxes from '../../dummy/PermissionCheckboxes';

const TeamAddMemberDialog: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.teams.addMemberDialog.isOpen);
  const [permissions, setPermissions] = useState({
    comments: false,
    posts: false,
    analytics: false,
  });
  const teamId = useAppSelector((state) => state.teams.selectedTeamId);
  const [inviteUserId, setInviteUserId] = useState('');
  const [empty_checkbox, setEmptyCheckbox] = useState('');
  const [idError, setIdError] = useState('');

  const resetForm = () => {
    setCurrentStep(1);
    setIsAdmin(false);
    setPermissions({
      comments: false,
      posts: false,
      analytics: false,
    });
    setInviteUserId('');
    setEmptyCheckbox('');
    setIdError('');
  };

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
      setPermissions({ comments: true, posts: true, analytics: true });
      setEmptyCheckbox('');
    } else {
      setPermissions({ comments: false, posts: false, analytics: false });
    }
  };

  const handlePermissionChange = (key: 'comments' | 'posts' | 'analytics', checked: boolean) => {
    const newPermissions = { ...permissions, [key]: checked };
    setPermissions(newPermissions);

    if (isAdmin || newPermissions.comments || newPermissions.posts) {
      setEmptyCheckbox('');
    }
  };

  const goToNextStep = () => {
    if (!inviteUserId.trim()) {
      setIdError('Пожалуйста, введите ID участника');
      return;
    }
    setIdError('');
    setCurrentStep(2);
  };

  const goToPreviousStep = () => {
    setCurrentStep(1);
  };

  const onSubmit = async () => {
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

    try {
      const result = await Invite({
        user_id: Number(inviteUserId),
        team_id: teamId,
        roles,
      });

      // Проверяем, содержит ли результат сообщение об ошибке
      if (result && result.includes('Пользователь не найден')) {
        notification.error({
          message: 'Ошибка',
          description: 'Пользователь не найден. Проверьте правильность ID.',
          placement: 'topRight',
        });
        return;
      }

      // Если ошибки нет, значит операция успешна
      dispatch(setAddMemberDialog(false));
      updateTeamList();
      resetForm();

      notification.success({
        message: 'Успешно',
        description: 'Участник успешно добавлен в команду',
        placement: 'topRight',
      });
    } catch (error: any) {
      if (
        error.response?.data?.error === 'Пользователь не найден' ||
        error.message === 'Пользователь не найден'
      ) {
        notification.error({
          message: 'Ошибка',
          description: 'Пользователь не найден. Проверьте правильность ID.',
          placement: 'topRight',
        });
      } else {
        notification.error({
          message: 'Ошибка',
          description: 'Не удалось добавить участника. Попробуйте позже.',
          placement: 'topRight',
        });
      }
    }
  };

  const renderStep1 = () => (
    <>
      <Form>
        <Form.Item
          label='ID участника'
          labelCol={{ span: 24 }}
          validateStatus={idError ? 'error' : ''}
          help={idError}
        >
          <Input
            placeholder='Введите ID участника'
            value={inviteUserId}
            onChange={(e) => setInviteUserId(e.target.value)}
          />
        </Form.Item>
      </Form>
    </>
  );
  const renderStep2 = () => (
    <PermissionCheckboxes
      permissions={permissions}
      isAdmin={isAdmin}
      empty_checkbox={empty_checkbox}
      handlePermissionChange={handlePermissionChange}
      handleAdminChange={handleAdminChange}
    />
  );
  const getButtonsForCurrentStep = () => {
    if (currentStep === 1) {
      return [
        {
          text: 'Далее',
          onButtonClick: goToNextStep,
        },
      ];
    } else {
      return [
        {
          text: 'Назад',
          onButtonClick: goToPreviousStep,
          type: 'default' as const,
        },
        {
          text: 'Добавить',
          onButtonClick: onSubmit,
        },
      ];
    }
  };

  const getTitle = () => {
    return currentStep === 1 ? 'Шаг 1' : 'Шаг 2';
  };

  return (
    <DialogBox
      bottomButtons={getButtonsForCurrentStep()}
      isOpen={isOpen}
      onCancelClick={async () => {
        dispatch(setAddMemberDialog(false));
        resetForm();
      }}
      title={getTitle()}
      isCenter={true}
    >
      <Divider />

      <div className={styles['form']}>{currentStep === 1 ? renderStep1() : renderStep2()}</div>
    </DialogBox>
  );
};

export default TeamAddMemberDialog;
