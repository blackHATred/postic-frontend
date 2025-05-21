import React, { useState, useEffect } from 'react';
import styles from './styles.module.scss';
import { PostAnalytics, UserAnalytics } from '../../../models/Analytics/types';
import LineChart from '../../ui/Charts/LineChart';
import { useAppSelector } from '../../../stores/hooks';
import EngagementDashboard from '../../ui/Charts/EngagementDashboard';
import TopEngagingPostsList from '../../ui/Charts/TopEngagingPostsList';
import CircularChart from '../../ui/Charts/CircularChart';
import { transformStatsToAnalytics } from '../../../utils/transformData';
import { useLocation } from 'react-router-dom';
import KPIRadarChart from '../../ui/Charts/RadarChart';
import KPIColumnChart from '../../ui/Charts/KPIColumnChart';
import { Empty } from 'antd';
import PeriodComparisonChart1 from '../../ui/Charts/PeriodComparisonChart1';
import { GetStats, getKPI } from '../../../api/api';

const AnalyticsComponent: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<PostAnalytics[]>([]);
  const activeAnalytics = useAppSelector((state) => state.analytics.activeAnalyticsFilter);
  const selectedTeamId = useAppSelector((state) => state.teams.globalActiveTeamId);
  const location = useLocation();
  const currentPath = location.pathname;
  const [usersLoading, setUsersLoading] = useState<boolean>(true);
  const [usersData, setUsersData] = useState<UserAnalytics[]>([]);
  const [hasPosts, setHasPosts] = useState<boolean>(true);
  const dateRange = useAppSelector((state) => state.analytics.period);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        const startDate = dateRange[0].toISOString();
        const endDate = dateRange[1].toISOString();

        const statsResponse = await GetStats({
          team_id: selectedTeamId,
          start: startDate,
          end: endDate,
        });

        if (statsResponse.posts && statsResponse.posts.length > 0) {
          setHasPosts(true);
          const transformedData = transformStatsToAnalytics(statsResponse);
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

    if (selectedTeamId !== 0) {
      fetchAnalyticsData();
    }
  }, [selectedTeamId, currentPath, dateRange]);

  useEffect(() => {
    const fetchUsersData = async () => {
      if (activeAnalytics !== 'kpi' || selectedTeamId === 0) {
        return;
      }

      setUsersLoading(true);
      try {
        const startDate = dateRange[0].toISOString();
        const endDate = dateRange[1].toISOString();

        const kpiResponse = await getKPI({
          team_id: selectedTeamId,
          start: startDate,
          end: endDate,
        });

        if (kpiResponse.users && Array.isArray(kpiResponse.users)) {
          setUsersData(kpiResponse.users);
        } else if (Array.isArray(kpiResponse.kpi)) {
          setUsersData(kpiResponse.kpi);
        } else if (kpiResponse.kpi) {
          setUsersData([kpiResponse.kpi]);
        } else {
          console.warn('Неожиданный формат ответа KPI:', kpiResponse);
          setUsersData([]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных KPI:', error);
        setUsersData([]);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsersData();
  }, [selectedTeamId, activeAnalytics, dateRange]);

  if (selectedTeamId === 0) {
    return (
      <div className={styles.analyticsContainer}>
        <Empty
          description='Выберите команду для просмотра аналитики'
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

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
