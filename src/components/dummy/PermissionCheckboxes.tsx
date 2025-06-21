import React, { useRef } from 'react';
import { Checkbox, Form, Alert } from 'antd';
import styles from './styles.module.scss';

interface PermissionsProps {
  comments: boolean;
  posts: boolean;
  analytics: boolean;
}

interface PermissionCheckboxesProps {
  permissions: PermissionsProps;
  isAdmin: boolean;
  empty_checkbox: string;
  handlePermissionChange: (key: 'comments' | 'posts' | 'analytics', checked: boolean) => void;
  handleAdminChange: (checked: boolean) => void;
  demoMode?: boolean;
}

const PermissionCheckboxes: React.FC<PermissionCheckboxesProps> = ({
  permissions,
  isAdmin,
  empty_checkbox,
  handlePermissionChange,
  handleAdminChange,
  demoMode = false,
}) => {
  // Рефы для доступа к DOM-элементам чекбоксов
  const postsCheckboxRef = useRef<HTMLInputElement>(null);
  const commentsCheckboxRef = useRef<HTMLInputElement>(null);

  return (
    <Form layout='vertical'>
      <Form.Item label='Права доступа'>
        <Checkbox
          checked={isAdmin}
          onChange={(e) => handleAdminChange(e.target.checked)}
          className={demoMode ? styles.animatedCheckbox : ''}
        >
          Администратор
        </Checkbox>
        <br />
        <Checkbox
          ref={postsCheckboxRef}
          checked={permissions.posts}
          onChange={(e) => handlePermissionChange('posts', e.target.checked)}
          disabled={isAdmin}
          className={demoMode ? styles.animatedCheckbox : ''}
        >
          Управление постами
        </Checkbox>
        <br />
        <Checkbox
          ref={commentsCheckboxRef}
          checked={permissions.comments}
          onChange={(e) => handlePermissionChange('comments', e.target.checked)}
          disabled={isAdmin}
          className={demoMode ? styles.animatedCheckbox : ''}
        >
          Работа с комментариями
        </Checkbox>
        <br />
        <Checkbox
          checked={permissions.analytics}
          onChange={(e) => handlePermissionChange('analytics', e.target.checked)}
          disabled={isAdmin}
          className={demoMode ? styles.animatedCheckbox : ''}
        >
          Просмотр аналитики
        </Checkbox>
      </Form.Item>

      {empty_checkbox && (
        <Form.Item>
          <Alert message={empty_checkbox} type='error' showIcon />
        </Form.Item>
      )}
    </Form>
  );
};

export default PermissionCheckboxes;
