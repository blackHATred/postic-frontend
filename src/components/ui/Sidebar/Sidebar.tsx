import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './styles.module.scss';
import {
  TeamOutlined,
  MessageOutlined,
  CommentOutlined,
  TagOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import ClickableButton from '../../ui/Button/Button';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { Switch, Typography } from 'antd';
import { setDarkMode, setHelpMode } from '../../../stores/settingsSlice';
import { setActiveTab } from '../../../stores/basePageDialogsSlice';
import { routes } from '../../../app/App.routes';
import { setSelectedPostId } from '../../../stores/postsSlice';

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedTeam = useAppSelector((state) => state.teams.globalActiveTeamId);
  const selectedUser = useAppSelector((state) => state.teams.currentUserId);
  const isDarkMode = useAppSelector((state) => state.settings.darkMode);
  const roles = useAppSelector((state) => state.teams.teams)
    .find((team) => {
      return team.id == selectedTeam;
    })
    ?.users.find((user) => {
      return user.user_id == selectedUser;
    })?.roles;

  const handleTabChange = (key: string, route: string) => {
    dispatch(setSelectedPostId(0));
    dispatch(setActiveTab(key));
    navigate(route);
  };

  const handleSettingsMode = (checked: boolean) => {
    dispatch(setHelpMode(checked));
  };

  const handleDarkMode = (checked: boolean) => {
    dispatch(setDarkMode(checked));
  };

  return (
    <div className={styles['sidebar']}>
      {selectedTeam !== 0 && (
        <>
          <div
            className={`${styles['sidebar-options']} ${location.pathname === routes.posts() ? styles['active'] : ''}`}
          >
            <ClickableButton
              className={styles['button']}
              type='text'
              text={'Посты'}
              icon={<MessageOutlined className={styles['icon-primary']} />}
              onButtonClick={() => handleTabChange('1', routes.posts())}
              disabled={
                roles
                  ? roles.find((r) => {
                      return r == 'posts' || r == 'admin';
                    }) == undefined
                  : true
              }
            />
          </div>
          <div
            className={`${styles['sidebar-options']} ${location.pathname === routes.comments() ? styles['active'] : ''}`}
          >
            <ClickableButton
              className={styles['button']}
              type='text'
              text={'Все комментарии'}
              icon={<CommentOutlined className={styles['icon-primary']} />}
              onButtonClick={() => handleTabChange('2', routes.comments())}
              disabled={
                roles
                  ? roles.find((r) => {
                      return r == 'comments' || r == 'admin';
                    }) == undefined
                  : true
              }
            />
          </div>
          <div className={styles['sidebar-divider']}></div>

          <div
            className={`${styles['sidebar-options']} ${location.pathname === routes.ticket() ? styles['active'] : ''}`}
          >
            <ClickableButton
              className={styles['button']}
              type='text'
              text={'Тикет-система'}
              icon={<TagOutlined className={styles['icon-primary']} />}
              onButtonClick={() => handleTabChange('4', routes.ticket())}
              disabled={
                roles
                  ? roles.find((r) => {
                      return r == 'ticket' || r == 'admin';
                    }) == undefined
                  : true
              }
            />
          </div>

          <div
            className={`${styles['sidebar-options']} ${location.pathname === routes.analytics() ? styles['active'] : ''}`}
          >
            <ClickableButton
              className={styles['button']}
              type='text'
              text={'Аналитика'}
              icon={<LineChartOutlined className={styles['icon-primary']} />}
              onButtonClick={() => handleTabChange('5', routes.analytics())}
              disabled={
                roles
                  ? roles.find((r) => {
                      return r == 'analitics' || r == 'admin';
                    }) == undefined
                  : true
              }
            />
          </div>
        </>
      )}

      <div
        className={`${styles['sidebar-options']} ${location.pathname === routes.teams() ? styles['active'] : ''}`}
      >
        <ClickableButton
          className={styles['button']}
          type='text'
          text={'Команды'}
          icon={<TeamOutlined className={styles['icon-primary']} />}
          onButtonClick={() => handleTabChange('3', routes.teams())}
        />
      </div>

      <div className={styles['sidebar-divider']}></div>

      <div className={styles['sidebar-option-mode']}>
        <Switch
          size='default'
          checked={useAppSelector((state) => state.settings.helpMode)}
          onChange={(checked) => handleSettingsMode(checked)}
        />
        <Typography.Text> Подсказки </Typography.Text>
      </div>

      {/*
      <div className={styles['sidebar-option-mode']}>
        <Switch
          size='default'
          checked={isDarkMode}
          onChange={(checked) => handleDarkMode(checked)}
        />
        <Typography.Text> Темная тема </Typography.Text>
      </div>
      */}
    </div>
  );
};

export default Sidebar;
