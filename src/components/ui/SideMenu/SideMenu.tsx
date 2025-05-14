import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './styles.module.scss';
import { Divider, Menu } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setCreateTeamDialog } from '../../../stores/teamSlice';
import { routes } from '../../../app/App.routes';
import { setCreatePostDialog } from '../../../stores/basePageDialogsSlice';
import { PostFilter, setActivePostFilter } from '../../../stores/postsSlice';
import { AnalyticsFilter, setActiveAnalyticsFilter } from '../../../stores/analyticsSlice';
import { setTicketFilter, TicketFilter } from '../../../stores/commentSlice';

const SideMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const activeFilter = useAppSelector((state) => state.posts.activePostFilter);
  const selectedTeam = useAppSelector((state) => state.teams.globalActiveTeamId);
  const activeAnalyticsFilter = useAppSelector((state) => state.analytics.activeAnalyticsFilter);
  const ticketFilter = useAppSelector((state) => state.comments.ticketFilter);

  const handleFilterChange = (filter: PostFilter) => {
    dispatch(setActivePostFilter(filter));
  };

  const handleFilterAnalyticsChange = (filter: AnalyticsFilter) => {
    dispatch(setActiveAnalyticsFilter(filter));
  };

  const handleFilterTicketChange = (filter: TicketFilter) => {
    dispatch(setTicketFilter(filter));
  };

  return (
    <div className={styles['sidebar-right']}>
      <Menu className={styles['menu']} mode='vertical' selectable={false}>
        {currentPath === routes.posts() && selectedTeam !== 0 && (
          <>
            <Menu.Item
              key='all-posts'
              className={`${styles['sidebar-options']} ${activeFilter === 'all' ? styles['active'] : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              Все посты
            </Menu.Item>
            <Menu.Item
              key='published-posts'
              className={`${styles['sidebar-options']} ${activeFilter === 'published' ? styles['active'] : ''}`}
              onClick={() => handleFilterChange('published')}
            >
              Опубликованные посты
            </Menu.Item>
            <Menu.Item
              key='scheduled-posts'
              className={`${styles['sidebar-options']} ${activeFilter === 'scheduled' ? styles['active'] : ''}`}
              onClick={() => handleFilterChange('scheduled')}
            >
              Отложенные посты
            </Menu.Item>
            <Divider className={styles['custom-divider']} />
            <Menu.Item
              key='add-post'
              className={styles['sidebar-options']}
              onClick={() => dispatch(setCreatePostDialog(true))}
              icon={<PlusOutlined className={styles['icon-primary']} />}
            >
              Создать пост
            </Menu.Item>
          </>
        )}

        {currentPath === routes.teams() && (
          <>
            <Menu.Item
              key='add-team'
              className={styles['sidebar-options']}
              onClick={() => dispatch(setCreateTeamDialog(true))}
              icon={<PlusOutlined className={styles['icon-primary']} />}
            >
              Создать команду
            </Menu.Item>
          </>
        )}

        {currentPath === routes.ticket() && (
          <>
            <Menu.Item
              key='published-posts'
              className={`${styles['sidebar-options']} ${ticketFilter === 'not_done' ? styles['active'] : ''}`}
              onClick={() => handleFilterTicketChange('not_done')}
            >
              Нерешенные тикеты
            </Menu.Item>
          </>
        )}

        {currentPath === routes.analytics() && (
          <>
            <Menu.Item
              key='all-posts'
              className={`${styles['sidebar-options']} ${activeAnalyticsFilter === '' ? styles['active'] : ''}`}
              onClick={() => handleFilterAnalyticsChange('')}
            >
              Общая сводка
            </Menu.Item>
            <Menu.Item
              key='published-posts'
              className={`${styles['sidebar-options']} ${activeAnalyticsFilter === 'audience' ? styles['active'] : ''}`}
              onClick={() => handleFilterAnalyticsChange('audience')}
            >
              Вовлеченность аудитории
            </Menu.Item>
            <Menu.Item
              key='scheduled-posts'
              className={`${styles['sidebar-options']} ${activeAnalyticsFilter === 'growth' ? styles['active'] : ''}`}
              onClick={() => handleFilterAnalyticsChange('growth')}
            >
              Рост и динамика
            </Menu.Item>
            <Divider className={styles['custom-divider']} />
            <Menu.Item
              key='scheduled-posts'
              className={`${styles['sidebar-options']} ${activeAnalyticsFilter === 'kpi' ? styles['active'] : ''}`}
              onClick={() => handleFilterAnalyticsChange('kpi')}
            >
              KPI команды
            </Menu.Item>
          </>
        )}
      </Menu>
    </div>
  );
};

export default SideMenu;
