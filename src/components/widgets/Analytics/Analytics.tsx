import React, { useState, useEffect } from 'react';
import styles from './styles.module.scss';
import { mockUsersAnalytics, PostAnalytics, UserAnalytics } from '../../../models/Analytics/types';
import LineChart from '../../ui/Charts/LineChart';
import { useAppSelector } from '../../../stores/hooks';
import EngagementDashboard from '../../ui/Charts/EngagementDashboard';
import TopEngagingPostsList from '../../ui/Charts/TopEngagingPostsList';
import HeatmapChart from '../../ui/Charts/HeatmapChart';
import CircularChart from '../../ui/Charts/CircularChart';
import { getPosts, UpdateStats, GetStats } from '../../../api/api';
import { transformStatsToAnalytics } from '../../../utils/transformData';
import { useLocation, useNavigate } from 'react-router-dom';
import KPIRadarChart from '../../ui/Charts/RadarChart';
import KPIColumnChart from '../../ui/Charts/KPIColumnChart';
import { Empty } from 'antd';
import PeriodComparisonChart1 from '../../ui/Charts/PeriodComparisonChart1';

const AnalyticsComponent: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<PostAnalytics[]>([]);
  const activeAnalytics = useAppSelector((state) => state.analytics.activeAnalyticsFilter);
  const selectedTeamId = useAppSelector((state) => state.teams.globalActiveTeamId);
  const posts = useAppSelector((state) => state.posts.posts);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [usersLoading, setUsersLoading] = useState<boolean>(true);
  const [usersData, setUsersData] = useState<UserAnalytics[]>([]);
  const [hasPosts, setHasPosts] = useState<boolean>(true);

  useEffect(() => {
    const fetchAndUpdateData = async () => {
      setLoading(true);
      try {
        const postsResponse = await getPosts(
          selectedTeamId,
          50,
          '2024-04-23T12:38:41Z',
          'published',
          false,
        );

        if (postsResponse.posts && postsResponse.posts.length > 0) {
          setHasPosts(true);

          const postIds = postsResponse.posts.map((post) => post.id);
          for (const postId of postIds) {
            await UpdateStats({
              team_id: selectedTeamId,
              post_union_id: postId,
            });
          }

          const startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);

          const statsResponse = await GetStats({
            team_id: selectedTeamId,
            start: startDate.toISOString(),
            end: new Date().toISOString(),
          });
          const transformedData = await transformStatsToAnalytics(statsResponse, selectedTeamId);
          setAnalyticsData(transformedData);
        } else {
          setHasPosts(false);
        }
      } catch (error) {
        console.error('Ошибка при загрузке аналитики:', error);
        setHasPosts(false);
      } finally {
        setLoading(false);
      }
    };
    fetchAndUpdateData();
  }, [selectedTeamId, currentPath]);

  // Перемещаем этот useEffect до условного возврата
  useEffect(() => {
    const fetchUsersData = async () => {
      if (activeAnalytics !== 'kpi') {
        return;
      }

      setUsersLoading(true);
      try {
        // Здесь был код загрузки данных
        await new Promise((resolve) => setTimeout(resolve, 800));
        setUsersData(mockUsersAnalytics.users);
      } catch (error) {
        console.error('Ошибка при загрузке данных о пользователях:', error);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsersData();
  }, [selectedTeamId, activeAnalytics]);

  // Теперь условный возврат после всех хуков
  if (!hasPosts) {
    return (
      <div className={styles.analyticsContainer}>
        <Empty
          description='Для отображения аналитики необходимо создать хотя бы один пост'
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className={styles.analyticsContainer}>
      {activeAnalytics === '' && (
        <div className={styles['spacer']}>
          <LineChart data={analyticsData} loading={loading} height={400} />
          <CircularChart data={analyticsData} loading={loading} />
        </div>
      )}
      {activeAnalytics === 'audience' && (
        <div className={styles['spacer']}>
          <EngagementDashboard data={analyticsData} loading={loading} />
          <TopEngagingPostsList data={analyticsData} loading={loading} />
          <HeatmapChart data={analyticsData} loading={loading} />
        </div>
      )}
      {activeAnalytics === 'growth' && (
        <div className={styles['spacer']}>
          <PeriodComparisonChart1 data={analyticsData} loading={loading} height={400} />
        </div>
      )}
      {activeAnalytics === 'kpi' && (
        <div className={styles['spacer']}>
          <KPIRadarChart data={usersData} loading={usersLoading} height={400} />
          <KPIColumnChart data={usersData} loading={usersLoading} height={400} />
        </div>
      )}
    </div>
  );
};

export default AnalyticsComponent;
