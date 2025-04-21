import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './styles.module.scss';
import { TeamOutlined, MessageOutlined, CommentOutlined, TagOutlined } from '@ant-design/icons';
import ClickableButton from '../../ui/Button/Button';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { Switch, Typography } from 'antd';
import { setHelpMode } from '../../../stores/settingsSlice';
import { setActiveTab } from '../../../stores/basePageDialogsSlice';
import { routes } from '../../../app/App.routes';

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedTeam = useAppSelector((state) => state.teams.globalActiveTeamId);

  const handleTabChange = (key: string, route: string) => {
    dispatch(setActiveTab(key));
    navigate(route);
  };

  const handleSettingsMode = (checked: boolean) => {
    dispatch(setHelpMode(checked));
  };

  React.useEffect(() => {
    if (selectedTeam === 0 && location.pathname !== routes.teams()) {
      handleTabChange('3', routes.teams());
    }
  }, [selectedTeam, location.pathname]);

  return (
    <div className={styles['sidebar']}>
      {selectedTeam !== 0 && (
        <>
          <div
            className={`${styles['sidebar-options']} ${location.pathname === routes.posts() ? styles['active'] : ''}`}
          >
            <ClickableButton
              type='text'
              text={'Посты'}
              icon={<MessageOutlined className={styles['icon-primary']} />}
              onButtonClick={() => handleTabChange('1', routes.posts())}
            />
          </div>
          <div
            className={`${styles['sidebar-options']} ${location.pathname === routes.comments() ? styles['active'] : ''}`}
          >
            <ClickableButton
              type='text'
              text={'Все комментарии'}
              icon={<CommentOutlined className={styles['icon-primary']} />}
              onButtonClick={() => handleTabChange('2', routes.comments())}
            />
          </div>
          <div
            className={`${styles['sidebar-options']} ${location.pathname === routes.ticket() ? styles['active'] : ''}`}
          >
            <ClickableButton
              type='text'
              text={'Тикет-система'}
              icon={<TagOutlined className={styles['icon-primary']} />}
              onButtonClick={() => handleTabChange('4', routes.ticket())}
            />
          </div>
          <div className={styles['sidebar-divider']}></div>
        </>
      )}

      <div
        className={`${styles['sidebar-options']} ${location.pathname === routes.teams() ? styles['active'] : ''}`}
      >
        {selectedTeam === 0 ? (
          <ClickableButton
            type='text'
            text={'Команды'}
            icon={<TeamOutlined className={styles['icon-primary']} />}
            onButtonClick={() => handleTabChange('3', routes.teams())}
          />
        ) : (
          <ClickableButton
            type='text'
            text={'Команды'}
            icon={<TeamOutlined className={styles['icon-primary']} />}
            onButtonClick={() => handleTabChange('3', routes.teams())}
          />
        )}
      </div>

      <div className={styles['sidebar-option-mode']}>
        <Switch size='default' onChange={(checked) => handleSettingsMode(checked)} />
        <Typography.Text> Подсказки </Typography.Text>
      </div>
    </div>
  );
};

export default Sidebar;
