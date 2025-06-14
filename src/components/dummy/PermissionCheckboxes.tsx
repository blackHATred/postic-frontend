import { Typography, Checkbox, Tooltip } from 'antd';
import styles from './styles.module.scss';
import { useAppSelector } from '../../stores/hooks';

const { Text } = Typography;

const roleDescriptions = {
  admin: 'Полный доступ ко всем функциям',
  posts: 'Может создавать, редактировать и удалять посты',
  comments: 'Может просматривать, отвечать на комментарии и отправлять их в тикет-систему',
  analytics: 'Имеет доступ к просмотру аналитики',
};

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
  const helpMode = useAppSelector((state) => state.settings.helpMode);

  return (
    <div className={styles['checkboxes']}>
      <Text strong>Права доступа</Text>

      {helpMode ? (
        <Tooltip
          title={roleDescriptions.comments}
          placement='left'
          color='#fff'
          overlayInnerStyle={{ color: 'rgba(0, 0, 0, 0.85)' }}
        >
          <div>
            <Checkbox
              checked={permissions.comments}
              disabled={isAdmin}
              onChange={(e) => handlePermissionChange('comments', e.target.checked)}
            >
              Комментарии
            </Checkbox>
          </div>
        </Tooltip>
      ) : (
        <Checkbox
          checked={permissions.comments}
          disabled={isAdmin}
          onChange={(e) => handlePermissionChange('comments', e.target.checked)}
        >
          Комментарии
        </Checkbox>
      )}

      {helpMode ? (
        <Tooltip
          title={roleDescriptions.posts}
          placement='left'
          color='#fff'
          overlayInnerStyle={{ color: 'rgba(0, 0, 0, 0.85)' }}
        >
          <div>
            <Checkbox
              checked={permissions.posts}
              disabled={isAdmin}
              onChange={(e) => handlePermissionChange('posts', e.target.checked)}
            >
              Посты
            </Checkbox>
          </div>
        </Tooltip>
      ) : (
        <Checkbox
          checked={permissions.posts}
          disabled={isAdmin}
          onChange={(e) => handlePermissionChange('posts', e.target.checked)}
        >
          Посты
        </Checkbox>
      )}

      {helpMode ? (
        <Tooltip
          title={roleDescriptions.analytics}
          placement='left'
          color='#fff'
          overlayInnerStyle={{ color: 'rgba(0, 0, 0, 0.85)' }}
        >
          <div>
            <Checkbox
              checked={permissions.analytics}
              disabled={isAdmin}
              onChange={(e) => handlePermissionChange('analytics', e.target.checked)}
            >
              Аналитика
            </Checkbox>
          </div>
        </Tooltip>
      ) : (
        <Checkbox
          checked={permissions.analytics}
          disabled={isAdmin}
          onChange={(e) => handlePermissionChange('analytics', e.target.checked)}
        >
          Аналитика
        </Checkbox>
      )}

      {helpMode ? (
        <Tooltip
          title={roleDescriptions.admin}
          placement='left'
          color='#fff'
          overlayInnerStyle={{ color: 'rgba(0, 0, 0, 0.85)' }}
        >
          <div>
            <Checkbox checked={isAdmin} onChange={(e) => handleAdminChange(e.target.checked)}>
              Администратор
            </Checkbox>
          </div>
        </Tooltip>
      ) : (
        <Checkbox checked={isAdmin} onChange={(e) => handleAdminChange(e.target.checked)}>
          Администратор
        </Checkbox>
      )}

      {empty_checkbox && <Text type='danger'>{empty_checkbox}</Text>}
    </div>
  );
};

export default PermissionCheckboxes;
