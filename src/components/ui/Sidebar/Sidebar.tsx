import React from 'react';
import styles from './styles.module.scss';
import { PlusOutlined, TeamOutlined, MessageOutlined, CommentOutlined } from '@ant-design/icons';
import ClickableButton from '../../ui/Button/Button';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setCreateTeamDialog } from '../../../stores/teamSlice';
import { Switch, Typography } from 'antd';
import { setHelpMode } from '../../../stores/settingsSlice';
import { setActiveTab } from '../../../stores/basePageDialogsSlice';

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.basePageDialogs.activeTab);

  const handleTabChange = (key: string) => {
    dispatch(setActiveTab(key));
  };

  const handleSettingsMode = (checked: boolean) => {
    dispatch(setHelpMode(checked));
  };

  return (
    <div className={styles['sidebar']}>
      <div className={`${styles['sidebar-options']} ${activeTab === '1' ? styles['active'] : ''}`}>
        <ClickableButton
          type='text'
          text={'Посты'}
          icon={<MessageOutlined className={styles['icon-primary']} />}
          onButtonClick={() => handleTabChange('1')}
        />
      </div>
      <div className={`${styles['sidebar-options']} ${activeTab === '2' ? styles['active'] : ''}`}>
        <ClickableButton
          type='text'
          text={'Все комментарии'}
          icon={<CommentOutlined className={styles['icon-primary']} />}
          onButtonClick={() => handleTabChange('2')}
        />
      </div>

      <div className={styles['sidebar-divider']}></div>

      <div className={styles['sidebar-options']}>
        <ClickableButton
          type='text'
          text={'Добавить команду'}
          icon={<PlusOutlined className={styles['icon-primary']} />}
          onButtonClick={() => dispatch(setCreateTeamDialog(true))}
        />
      </div>
      <div className={styles['sidebar-options']} onClick={() => setActiveTab('3')}>
        <ClickableButton
          type='text'
          text={'Команды'}
          icon={<TeamOutlined className={styles['icon-primary']} />}
          onButtonClick={() => handleTabChange('3')}
        />
      </div>
      <div className={styles['sidebar-option-mode']}>
        <Switch size='default' onChange={(checked) => handleSettingsMode(checked)} />
        <Typography.Text> Подсказки </Typography.Text>
      </div>
    </div>
  );
};

export default Sidebar;
