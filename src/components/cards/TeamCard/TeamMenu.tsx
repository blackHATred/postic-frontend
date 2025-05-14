import React from 'react';
import { Button, Dropdown, MenuProps, Space, Typography } from 'antd';
import {
  AppstoreAddOutlined,
  EditOutlined,
  KeyOutlined,
  MinusOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import ClickableButton from '../../ui/Button/Button';
import styles from './styles.module.scss';
import { PlatformsRequest } from '../../../models/Team/types';
import { LiaTelegram, LiaVk } from 'react-icons/lia';

const { Text } = Typography;

interface TeamMenuProps {
  teamName: string;
  teamID: number;
  isUserAdmin: boolean;
  onRename: () => void;
  onKick: () => void;
  onAddMember: () => void;
  onKeyClick: () => void;
  onPlatformClick: (platform: string) => void;
  linkedPlatforms?: PlatformsRequest | null;
}

const TeamMenu: React.FC<TeamMenuProps> = ({
  teamName,
  teamID,
  isUserAdmin,
  onRename,
  onKick,
  onAddMember,
  onKeyClick,
  onPlatformClick,
  linkedPlatforms,
}) => {
  const getPlatformMenuItems = () => {
    const platforms = [
      { key: 'telegram', label: 'Telegram', field: 'tg_channel_id' },
      { key: 'vk', label: 'ВКонтакте', field: 'vk_group_id' },
    ];

    return platforms
      .filter((platform) => {
        if (!linkedPlatforms || !linkedPlatforms.platforms) return true;

        if (platform.key === 'telegram') {
          return linkedPlatforms.platforms.tg_channel_id === 0;
        } else if (platform.key === 'vk') {
          return linkedPlatforms.platforms.vk_group_id === 0;
        }
        return true;
      })
      .map((platform) => ({
        label: platform.label,
        key: `platform:${platform.key}`,
      }));
  };

  const platformMenuItems = getPlatformMenuItems();

  const items: MenuProps['items'] = [
    {
      label: 'Секретный ключ',
      key: 'secret',
      icon: <KeyOutlined />,
    },
  ];

  if (platformMenuItems.length > 0) {
    items.push({
      label: 'Привязать платформу',
      key: 'platform',
      icon: <AppstoreAddOutlined />,
      children: platformMenuItems,
    });
  }

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'secret') {
      onKeyClick();
    } else if (e.key.startsWith('platform:')) {
      const platform = e.key.split(':')[1];
      onPlatformClick(platform);
    }
  };

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  const renderPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'vk':
        return <LiaVk className={styles.icon} />;
      case 'tg':
        return <LiaTelegram className={styles.icon} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className={styles['post-header']}>
        <div className={styles['post-header-first-row']}>
          <div className={styles['post-header-left']}>
            <Text strong>Команда: </Text>
            <Text className={styles['teamName']} strong>
              {' '}
              {teamName}
            </Text>
            {isUserAdmin && (
              <ClickableButton
                type='text'
                size='small'
                icon={<EditOutlined />}
                onButtonClick={onRename}
              />
            )}
          </div>

          <div className={styles['post-header-right']}>
            <Space className={styles['platform-icons']}>
              {[
                linkedPlatforms?.platforms?.tg_channel_id ? renderPlatformIcon('tg') : null,
                linkedPlatforms?.platforms?.vk_group_id ? renderPlatformIcon('vk') : null,
              ].filter(Boolean)}
            </Space>
            <Text type='secondary' style={{ marginBottom: '5px' }}>
              {' '}
              (#{teamID})
            </Text>
          </div>
        </div>

        <div className={styles['post-header-second-row']}>
          <div className={styles['post-header-buttons']}>
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
                <Dropdown menu={menuProps} trigger={['hover']} placement='bottomRight'>
                  <Button type='default' className={styles['icon']} icon={<SettingOutlined />} />
                </Dropdown>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMenu;
