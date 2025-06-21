import React, { useState, useEffect } from 'react';
import { Table, TableColumnsType, Typography } from 'antd';
import { MinusOutlined } from '@ant-design/icons';
import ClickableButton from '../../ui/Button/Button';
import styles from './styles.module.scss';
import { Me } from '../../../api/api';

const { Text } = Typography;

interface DataType {
  key: React.Key;
  member: string;
  id: number;
  access: string[];
  nickname?: string;
  isNew?: boolean; // Флаг для новых участников
}

interface TeamTableProps {
  members: DataType[];
  isUserAdmin: boolean;
  currentUserId: number | null;
  onEditMember: (userId: number) => void;
  onKickMember: (userId: number) => void;
  demoMode?: boolean;
  newUserId?: number;
}

const TeamTable: React.FC<TeamTableProps> = ({
  members,
  isUserAdmin,
  currentUserId,
  onEditMember,
  onKickMember,
  demoMode = false,
  newUserId,
}) => {
  const roleTranslations: Record<string, string> = {
    admin: 'администратор',
    comments: 'комментарии',
    posts: 'посты',
    analytics: 'аналитика',
  };

  // Отслеживаем новых участников для анимации
  const [animatedMembers, setAnimatedMembers] = useState<DataType[]>(members);
  const [currentUserName, setCurrentUserName] = useState<string>('');

  // Получаем имя текущего пользователя
  useEffect(() => {
    if (demoMode && currentUserId) {
      // Получаем информацию о текущем пользователе через API me
      Me()
        .then((data) => {
          setCurrentUserName(data.nickname || data.email || 'Администратор');
        })
        .catch(() => {
          setCurrentUserName('Администратор');
        });
    }
  }, [demoMode, currentUserId]);

  // Эффект для обработки анимации новых участников
  useEffect(() => {
    if (demoMode) {
      // Обновляем список участников и помечаем нового
      const updatedMembers = members.map((member) => ({
        ...member,
        // Заменяем имена всех участников, кроме текущего пользователя, на "Александр"
        member: member.id === currentUserId ? currentUserName || member.member : 'Александр',
        // Помечаем нового участника для анимации
        isNew: newUserId ? member.id === newUserId : false,
      }));

      setAnimatedMembers(updatedMembers);

      // Если появился новый участник
      if (newUserId) {
        // Добавляем задержку 2 секунды перед анимацией всплывания
        const animationTimeout = setTimeout(() => {
          // Обновляем статус для анимации
          setAnimatedMembers((prev) =>
            prev.map((member) => ({
              ...member,
              isNew: member.id === newUserId,
            })),
          );

          // Сбрасываем анимацию через 3 секунды
          setTimeout(() => {
            setAnimatedMembers((prev) =>
              prev.map((member) => ({
                ...member,
                isNew: false,
              })),
            );
          }, 3000);
        }, 2000); // Задержка 2 секунды перед анимацией

        return () => clearTimeout(animationTimeout);
      }
    } else {
      // Если это не демо-режим, просто обновляем список
      setAnimatedMembers(members);
    }
  }, [members, demoMode, newUserId, currentUserId, currentUserName]);

  const formatRoles = (roles: string[]): string => {
    if (roles.includes('admin')) {
      return roleTranslations['admin'];
    }
    return roles.map((role) => roleTranslations[role] || role).join(', ');
  };

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const columns: TableColumnsType<DataType> = [
    {
      title: 'Участники',
      dataIndex: 'member',
      render: (text: string, row: DataType) => <Text>{row.nickname || text}</Text>,
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
  const paginatedData = animatedMembers.slice(startIndex, endIndex);

  return (
    <div className={styles.teamTableContainer}>
      <Table<DataType>
        columns={columns}
        dataSource={paginatedData}
        pagination={{
          ...pagination,
          total: animatedMembers.length,
        }}
        onChange={handleTableChange}
        rowClassName={(record) => {
          let className = record.id === currentUserId ? 'current-user-row' : '';
          if (demoMode && record.isNew) {
            className += ' ' + styles.newMemberRow;
          }
          return className;
        }}
        onRow={(record) => ({
          style: record.id === currentUserId ? { backgroundColor: 'rgba(24,144,255,0.07)' } : {},
          className: demoMode && record.isNew ? styles.newMemberRow : '',
        })}
      />
    </div>
  );
};

export type { DataType };
export default TeamTable;
