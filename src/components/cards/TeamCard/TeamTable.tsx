import React, { useState } from 'react';
import { Table, TableColumnsType, Typography } from 'antd';
import { MinusOutlined } from '@ant-design/icons';
import ClickableButton from '../../ui/Button/Button';

const { Text } = Typography;

interface DataType {
  key: React.Key;
  member: string;
  id: number;
  access: string[];
}

interface TeamTableProps {
  members: DataType[];
  isUserAdmin: boolean;
  currentUserId: number | null;
  onEditMember: (userId: number) => void;
  onKickMember: (userId: number) => void;
}

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

const TeamTable: React.FC<TeamTableProps> = ({
  members,
  isUserAdmin,
  currentUserId,
  onEditMember,
  onKickMember,
}) => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const columns: TableColumnsType<DataType> = [
    {
      title: 'Участники',
      dataIndex: 'member',
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: 'Права',
      dataIndex: 'access',
      render: (roles: string[], row: DataType) =>
        isUserAdmin ? (
          <ClickableButton
            text={formatRoles(roles)}
            type='link'
            color='primary'
            variant='text'
            onButtonClick={() => onEditMember(row.id)}
            withPopover={true}
            popoverContent='Редактировать права участника'
          />
        ) : (
          <span>{formatRoles(roles)}</span>
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
            onButtonClick={() => onKickMember(row.id)}
            withPopover={true}
            popoverContent='Удалить участника из команды'
          />
        ) : null,
    },
  ];

  const handleTableChange = (newPagination: any) => {
    setPagination(newPagination);
  };

  const startIndex = (pagination.current - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const paginatedData = members.slice(startIndex, endIndex);

  return (
    <Table<DataType>
      columns={columns}
      dataSource={paginatedData}
      pagination={{
        ...pagination,
        total: members.length,
      }}
      onChange={handleTableChange}
      rowClassName={(record) => (record.id === currentUserId ? 'current-user-row' : '')}
      onRow={(record) => ({
        style: record.id === currentUserId ? { backgroundColor: 'rgba(24,144,255,0.07)' } : {},
      })}
    />
  );
};

export { formatRoles, roleTranslations, type DataType };
export default TeamTable;
