import { Typography, Checkbox } from 'antd';
import styles from './styles.module.scss';

const { Text } = Typography;

interface PermissionCheckboxesProps {
  permissions: {
    comments: boolean;
    posts: boolean;
    analytics: boolean;
  };
  isAdmin: boolean;
  empty_checkbox: string;
  handlePermissionChange: (key: 'comments' | 'posts' | 'analytics', checked: boolean) => void;
  handleAdminChange: (checked: boolean) => void;
}

const PermissionCheckboxes: React.FC<PermissionCheckboxesProps> = ({
  permissions,
  isAdmin,
  empty_checkbox,
  handlePermissionChange,
  handleAdminChange,
}) => {
  return (
    <div className={styles['checkboxes']}>
      <Text strong>Права доступа</Text>
      <Checkbox
        checked={permissions.comments}
        disabled={isAdmin}
        onChange={(e) => handlePermissionChange('comments', e.target.checked)}
      >
        Комментарии
      </Checkbox>
      <Checkbox
        checked={permissions.posts}
        disabled={isAdmin}
        onChange={(e) => handlePermissionChange('posts', e.target.checked)}
      >
        Посты
      </Checkbox>
      <Checkbox
        checked={permissions.analytics}
        disabled={isAdmin}
        onChange={(e) => handlePermissionChange('analytics', e.target.checked)}
      >
        Аналитика
      </Checkbox>
      <Checkbox checked={isAdmin} onChange={(e) => handleAdminChange(e.target.checked)}>
        Администратор
      </Checkbox>
      {empty_checkbox && <Text type='danger'>{empty_checkbox}</Text>}
    </div>
  );
};

export default PermissionCheckboxes;
