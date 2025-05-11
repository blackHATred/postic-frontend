import React, { useState, useEffect } from 'react';
import styles from './styles.module.scss';
import { PostAnalytics } from '../../../models/Analytics/types';
import LineChart from '../../ui/Charts/LineChart';
import { useAppSelector } from '../../../stores/hooks';
import EngagementDashboard from '../../ui/Charts/EngagementDashboard';
import TopEngagingPostsList from '../../ui/Charts/TopEngagingPostsList';
import PeriodComparisonChart from '../../ui/Charts/PeriodComparisonChart';
import HeatmapChart from '../../ui/Charts/HeatmapChart';
import MarkerLineChart from '../../ui/Charts/MarkerLineChart';
import CircularChart from '../../ui/Charts/CircularChart';
import { getPosts, UpdateStats, GetStats } from '../../../api/api';
import { transformStatsToAnalytics } from '../../../utils/transformData';
import { useLocation, useNavigate } from 'react-router-dom';
import { Empty } from 'antd';

const AnalyticsComponent: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<PostAnalytics[]>([]);
  const activeAnalytics = useAppSelector((state) => state.analytics.activeAnalyticsFilter);
  const selectedTeamId = useAppSelector((state) => state.teams.globalActiveTeamId);
  const posts = useAppSelector((state) => state.posts.posts);
  const hasPosts = posts.length > 0;
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  useEffect(() => {
    const fetchAndUpdateData = async () => {
      if (!hasPosts) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const postsResponse = await getPosts(
          selectedTeamId,
          50,
          '2024-04-23T12:38:41Z',
          'published',
          false,
        );
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
      } catch (error) {
        console.error('Ошибка при загрузке аналитики:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAndUpdateData();
  }, [selectedTeamId, currentPath, hasPosts]);

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
          <MarkerLineChart data={analyticsData} loading={loading} />
          <EngagementDashboard data={analyticsData} loading={loading} />
          <TopEngagingPostsList data={analyticsData} loading={loading} />
          <HeatmapChart data={analyticsData} loading={loading} />
        </div>
      )}
      {activeAnalytics === 'growth' && (
        <div className={styles['spacer']}>
          <PeriodComparisonChart data={analyticsData} loading={loading} />
        </div>
      )}
    </div>
  );
};

export default AnalyticsComponent;
