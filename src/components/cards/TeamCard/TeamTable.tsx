import React, { useState } from 'react';
import { Table, TableColumnsType } from 'antd';
import { MinusOutlined } from '@ant-design/icons';
import ClickableButton from '../../ui/Button/Button';

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
          onClick={() => onEditMember(row.id)}
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
            onButtonClick={() => onKickMember(row.id)}
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
    />
  );
};

export { formatRoles, roleTranslations, type DataType };
export default TeamTable;
