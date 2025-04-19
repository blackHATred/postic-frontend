import React from 'react';
import styles from './styles.module.scss';
import { Menu, Switch, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../../../stores/hooks';
import { setCreateTeamDialog } from '../../../stores/teamSlice';
import { setHelpMode } from '../../../stores/settingsSlice';

interface SideMenuProps {
  setActivePage: (page: string) => void;
}

const { Text } = Typography;

const SideMenu: React.FC<SideMenuProps> = ({ setActivePage }) => {
  const dispatch = useAppDispatch();

  const handleSettingsMode = (checked: boolean) => {
    dispatch(setHelpMode(checked));
  };

  return (
    <div className={styles['sidebar-right']}>
      <Menu className={styles['menu']} mode='vertical' selectable={false}>
        <Menu.Item
          key='add-team'
          className={styles['sidebar-options']}
          onClick={() => dispatch(setCreateTeamDialog(true))}
          icon={<PlusOutlined className={styles['icon-primary']} />}
        >
          Добавить команду
        </Menu.Item>

        <Menu.Item key='help-mode' className={styles['sidebar-option-mode']}>
          <Switch size='default' onChange={handleSettingsMode} />
          <Typography.Text> Подсказки </Typography.Text>
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default SideMenu;
