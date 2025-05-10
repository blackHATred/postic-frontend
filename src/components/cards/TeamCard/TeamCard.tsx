import React, { useEffect, useState } from 'react';
import { Button, Divider, Dropdown, MenuProps, Table, TableColumnsType, Typography } from 'antd';
import styles from './styles.module.scss';
import ClickableButton from '../../ui/Button/Button';
import {
  EditOutlined,
  KeyOutlined,
  MinusOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Team } from '../../../models/Team/types';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import {
  getTeamsFromStore,
  setAddMemberDialog,
  setEditMemberDialog,
  setGlobalActiveTeamId,
  setRenameTeamDialog,
  setSelectedMemberId,
  setSelectedTeamId,
  setTeams,
} from '../../../stores/teamSlice';
import { Kick, MyTeams } from '../../../api/teamApi';
import { setPersonalInfoDialog } from '../../../stores/basePageDialogsSlice';
import { setComments } from '../../../stores/commentSlice';

const { Text } = Typography;

interface TeamCardProps {
  teamcard: Team;
}

const TeamCard: React.FC<TeamCardProps> = ({ teamcard }) => {
  const dispatch = useAppDispatch();
  const { id, name: team_name, users: team_members } = teamcard;
  const teams = useAppSelector(getTeamsFromStore);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  const currentUserId = useAppSelector((state) => state.teams.currentUserId);

  useEffect(() => {
    if (currentUserId !== null) {
      const userMember = team_members.find((member) => member.user_id === currentUserId);
      const isAdmin = userMember?.roles.includes('admin') || false;

      setIsUserAdmin(isAdmin);
    }
  }, [currentUserId, team_members]);

  const handleAddMember = () => {
    dispatch(setSelectedTeamId?.(id));
    dispatch(setAddMemberDialog(true));
  };

  const handleKick = async () => {
    if (currentUserId !== null) {
      try {
        await Kick({ kicked_user_id: currentUserId, team_id: id });
        const response = await MyTeams();
        if (response) {
          dispatch(setTeams(response.teams));

          dispatch(setGlobalActiveTeamId(0));
          dispatch(setComments([]));
        }
      } catch (error) {
        console.error('Ошибка при выходе из команды:', error);
      }
    } else {
      console.error('ID пользователя отсутствует. Невозможно выйти из команды.');
    }
  };

  const handleKickMember = (userId: number) => {
    if (userId !== null) {
      Kick({ kicked_user_id: userId, team_id: id });
    } else {
      console.error('Current user ID is null. Cannot kick user.');
    }
  };

  const handleRename = () => {
    dispatch(setRenameTeamDialog(true));
    dispatch(setSelectedTeamId?.(id));
  };

  const onEditMemberClick = async (userId: number) => {
    const member = team_members.find((member) => member.user_id === userId);
    dispatch(setEditMemberDialog(true));
    dispatch(setSelectedTeamId?.(id));
    dispatch(setSelectedMemberId(userId));
  };
  const roleTranslations: Record<string, string> = {
    admin: 'администратор',
    comments: 'комментарии',
    posts: 'посты',
    analytics: 'аналитика',
  };

  const formatRoles = (roles: string[]): string => {
    if (roles.includes('admin')) {
      return roleTranslations['admin'];
    }
    return roles.map((role) => roleTranslations[role] || role).join(', ');
  };

  interface DataType {
    key: React.Key;
    member: string;
    id: number;
    access: string[];
  }

  const columns: TableColumnsType<DataType> = [
    {
      title: 'Участники',
      dataIndex: 'member',
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: 'Права',
      dataIndex: 'access',
      render: (roles: string[], row: DataType) => (
        <button
          onClick={() => onEditMemberClick(row.id)}
          style={{
            background: 'none',
            border: 'none',
            color: '#1890ff',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {formatRoles(roles)}
        </button>
      ),
    },
    {
      title: '',
      dataIndex: '',
      key: 'x',
      render: (row: DataType) =>
        isUserAdmin && row.id !== currentUserId ? (
          <ClickableButton
            type='link'
            color='danger'
            variant='filled'
            icon={<MinusOutlined />}
            onButtonClick={() => handleKickMember(row.id)}
          />
        ) : null,
    },
  ];

  const tabledata: DataType[] = team_members.map((member) => ({
    key: member.user_id,
    member: member.user_id.toString(),
    id: member.user_id,
    access: member.roles,
  }));

  const handleTableChange = (newPagination: any) => {
    setPagination(newPagination);
  };

  const handleKeyClick = () => {
    dispatch(setSelectedTeamId?.(id));
    dispatch(setPersonalInfoDialog(true));
  };

  const startIndex = (pagination.current - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const paginatedData = tabledata.slice(startIndex, endIndex);

  const items: MenuProps['items'] = [
    {
      label: 'Секретный ключ',
      key: 'secret',
      icon: <KeyOutlined />,
    },
    {
      label: 'Привязать платформу',
      key: 'platform',
      icon: <QuestionCircleOutlined />,
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    switch (e.key) {
      case 'secret': {
        dispatch(setSelectedTeamId?.(id));
        dispatch(setPersonalInfoDialog(true));
        return;
      }
      case 'platform': {
        //dispatch(setRegiserDialog(true));
        return;
      }
    }
  };

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  return (
    <div className={styles['post']}>
      {/* хедер*/}
      <div className={styles['post-header']}>
        <div className={styles['post-header-info']}>
          <div className={styles['post-header-info-text']}>
            <Text strong>Команда: </Text>
            <Text className={styles['teamName']} strong>
              {team_name}
            </Text>
          </div>
          {isUserAdmin && (
            <ClickableButton
              type='text'
              size={'small'}
              icon={<EditOutlined />}
              onButtonClick={handleRename}
            />
          )}
        </div>

        <div className={styles['post-header-buttons']}>
          <div className={styles['post-header-buttons-pair']}>
            <ClickableButton
              text='Покинуть команду'
              type='primary'
              color='danger'
              variant='solid'
              icon={<MinusOutlined />}
              confirm
              onButtonClick={handleKick}
            />
            {isUserAdmin && (
              <>
                <ClickableButton
                  text='Добавить участника'
                  icon={<PlusOutlined />}
                  color='primary'
                  onButtonClick={handleAddMember}
                />
                <Dropdown menu={menuProps} placement='bottom'>
                  <Button type='default' className={styles['icon']} icon={<SettingOutlined />} />
                </Dropdown>
              </>
            )}
          </div>
        </div>
      </div>
      <Divider className={styles.customDivider} />
      <div className={styles['post-content']}>
        <div className={styles['post-content-text']}>
          <div>
            <Table<DataType>
              columns={columns}
              dataSource={paginatedData}
              pagination={{
                ...pagination,
                total: tabledata.length,
              }}
              onChange={handleTableChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
