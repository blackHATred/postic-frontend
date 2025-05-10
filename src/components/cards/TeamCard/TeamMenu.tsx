import React from 'react';
import { Button, Dropdown, MenuProps, Typography } from 'antd';
import {
  EditOutlined,
  KeyOutlined,
  MinusOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import ClickableButton from '../../ui/Button/Button';
import styles from './styles.module.scss';

const { Text } = Typography;

interface TeamMenuProps {
  teamName: string;
  isUserAdmin: boolean;
  onRename: () => void;
  onKick: () => void;
  onAddMember: () => void;
  onKeyClick: () => void;
}

const TeamMenu: React.FC<TeamMenuProps> = ({
  teamName,
  isUserAdmin,
  onRename,
  onKick,
  onAddMember,
  onKeyClick,
}) => {
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
    if (e.key === 'secret') {
      onKeyClick();
    }
  };

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  return (
    <div className={styles['post-header']}>
      <div className={styles['post-header-info']}>
        <div className={styles['post-header-info-text']}>
          <Text strong>Команда: </Text>
          <Text className={styles['teamName']} strong>
            {teamName}
          </Text>
        </div>
        {isUserAdmin && (
          <ClickableButton
            type='text'
            size='small'
            icon={<EditOutlined />}
            onButtonClick={onRename}
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
            onButtonClick={onKick}
          />
          {isUserAdmin && (
            <>
              <ClickableButton
                text='Добавить участника'
                icon={<PlusOutlined />}
                color='primary'
                onButtonClick={onAddMember}
              />
              <Dropdown menu={menuProps} placement='bottom'>
                <Button type='default' className={styles['icon']} icon={<SettingOutlined />} />
              </Dropdown>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamMenu;
