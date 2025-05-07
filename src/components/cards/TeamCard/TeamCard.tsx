import React, { useEffect, useState } from 'react';
import { Divider, Table, TableColumnsType, Typography } from 'antd';
import styles from './styles.module.scss';
import ClickableButton from '../../ui/Button/Button';
import { EditOutlined, KeyOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Team } from '../../../models/Team/types';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import {
  setAddMemberDialog,
  setEditMemberDialog,
  setRenameTeamDialog,
  setSelectedMemberId,
  setSelectedTeamId,
} from '../../../stores/teamSlice';
import { Kick } from '../../../api/teamApi';
import { setPersonalInfoDialog } from '../../../stores/basePageDialogsSlice';

const { Text } = Typography;

interface TeamCardProps {
  teamcard: Team;
}

const TeamCard: React.FC<TeamCardProps> = ({ teamcard }) => {
  const dispatch = useAppDispatch();
  const { id, name: team_name, users: team_members } = teamcard;
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

  const handleKick = () => {
    if (currentUserId !== null) {
      Kick({ kicked_user_id: currentUserId, team_id: id });
    } else {
      console.error('Current user ID is null. Cannot kick user.');
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
    //dispatch(setOldTeamName(oldTeamName));
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

  return (
    <div className={styles['post']}>
      {/* хедер*/}
      <div className={styles['post-header']}>
        <div className={styles['post-header-info-text']}>
          <Text strong>Команда: </Text>
          <Text className={styles['teamName']} strong>
            {team_name}
          </Text>
        </div>
        <div className={styles['post-header-buttons']}>
          {isUserAdmin && (
            <div className={styles['post-header-buttons-pair']}>
              <ClickableButton
                type='text'
                variant='solid'
                icon={<EditOutlined />}
                onButtonClick={handleRename}
              />
              <ClickableButton
                type='text'
                variant='solid'
                onButtonClick={handleKeyClick}
                icon={<KeyOutlined className={styles['icon-primary']} />}
              />
            </div>
          )}

          <div className={styles['post-header-buttons-pair']}>
            <ClickableButton
              text='Покинуть команду'
              type='primary'
              color='danger'
              variant='solid'
              icon={<MinusOutlined />}
              onButtonClick={handleKick}
            />
            {isUserAdmin && (
              <ClickableButton
                text='Добавить участника'
                icon={<PlusOutlined />}
                color='primary'
                onButtonClick={handleAddMember}
              />
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
