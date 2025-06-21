import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './styles.module.scss';
import { Divider, Menu, Segmented, DatePicker } from 'antd';
import { PlusOutlined, BarsOutlined, CalendarOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setCreateTeamDialog } from '../../../stores/teamSlice';
import { setCreatePostDialog } from '../../../stores/basePageDialogsSlice';
import { PostFilter, setActivePostFilter, setViewMode, ViewMode } from '../../../stores/postsSlice';
import {
  AnalyticsFilter,
  setActiveAnalyticsFilter,
  setAnalyticsPeriod,
} from '../../../stores/analyticsSlice';
import { setTicketFilter, TicketFilter } from '../../../stores/commentSlice';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface SideMenuProps {
  isMobile?: boolean;
}

const SideMenu: React.FC<SideMenuProps> = ({ isMobile = false }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const currentPath = location.pathname;
  const activeFilter = useAppSelector((state) => state.posts.activePostFilter);
  const viewMode = useAppSelector((state) => state.posts.viewMode);
  const selectedTeam = useAppSelector((state) => state.teams.globalActiveTeamId);
  const activeAnalyticsFilter = useAppSelector(
    (state) => state.analytics.activeAnalyticsFilter || '',
  );
  const ticketFilter = useAppSelector((state) => state.comments.ticketFilter);
  const analyticsPeriod = useAppSelector((state) => state.analytics.period);
  // Добавляем состояние для автоматического переключения режима просмотра
  const [autoToggleViewMode, setAutoToggleViewMode] = useState(false);

  const isAnalyticsPage = currentPath.includes('/analytics');
  const isPostsPage = currentPath.includes('/posts') && !currentPath.includes('/posts/');
  const isTeamsPage = currentPath.includes('/teams');
  const isTicketPage = currentPath.includes('/ticket');

  // чтоб сайдменю аналитики не пропадало
  useEffect(() => {
    if (isAnalyticsPage && activeAnalyticsFilter === undefined) {
      dispatch(setActiveAnalyticsFilter(''));
    }
  }, [isAnalyticsPage, activeAnalyticsFilter, dispatch]);

  const handleFilterChange = (filter: PostFilter) => {
    dispatch(setActivePostFilter(filter));
  };

  const handleViewModeChange = (mode: ViewMode) => {
    dispatch(setViewMode(mode));
  };

  const handleFilterAnalyticsChange = (filter: AnalyticsFilter) => {
    dispatch(setActiveAnalyticsFilter(filter));
  };

  const handleFilterTicketChange = (filter: TicketFilter) => {
    dispatch(setTicketFilter(filter));
  };

  const handleAnalyticsPeriodChange = (dates: any) => {
    if (dates && dates.length === 2) {
      const [startDate, endDate] = dates;
      const diffDays = endDate.diff(startDate, 'day');

      if (diffDays > 30) {
        const newEndDate = startDate.clone().add(30, 'day');
        dispatch(setAnalyticsPeriod([startDate, newEndDate]));
      } else {
        dispatch(setAnalyticsPeriod([startDate, endDate]));
      }
    }
  };

  const disabledDate = (current: dayjs.Dayjs) => {
    if (!analyticsPeriod) {
      return false;
    }

    if (analyticsPeriod[0] && !analyticsPeriod[1]) {
      if (current.isBefore(analyticsPeriod[0], 'day')) {
        return true;
      }
      return current.diff(analyticsPeriod[0], 'day') > 30;
    }

    return false;
  };

  const menuClass = isMobile ? `${styles['menu']} ${styles['mobile-menu']}` : styles['menu'];

  return (
    <div className={isMobile ? styles['sidebar-right-mobile'] : styles['sidebar-right']}>
      <Menu className={menuClass} mode='vertical' selectable={false}>
        {isPostsPage && selectedTeam !== 0 && (
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

            <div className={styles['view-mode-selector']}>
              <Segmented
                options={[
                  { value: 'list', icon: <BarsOutlined /> },
                  { value: 'calendar', icon: <CalendarOutlined /> },
                ]}
                value={viewMode}
                onChange={(value) => handleViewModeChange(value as ViewMode)}
              />
            </div>

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

        {isTeamsPage && (
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

        {isTicketPage && (
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

        {isAnalyticsPage && (
          <>
            <Menu.Item
              key='all-analytics'
              className={`${styles['sidebar-options']} ${activeAnalyticsFilter === '' ? styles['active'] : ''}`}
              onClick={() => handleFilterAnalyticsChange('')}
            >
              Общая сводка
            </Menu.Item>
            <Menu.Item
              key='audience-analytics'
              className={`${styles['sidebar-options']} ${activeAnalyticsFilter === 'audience' ? styles['active'] : ''}`}
              onClick={() => handleFilterAnalyticsChange('audience')}
            >
              Вовлеченность аудитории
            </Menu.Item>
            <Menu.Item
              key='growth-analytics'
              className={`${styles['sidebar-options']} ${activeAnalyticsFilter === 'growth' ? styles['active'] : ''}`}
              onClick={() => handleFilterAnalyticsChange('growth')}
            >
              Рост и динамика
            </Menu.Item>
            <Divider className={styles['custom-divider']} />
            <Menu.Item
              key='kpi-analytics'
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
