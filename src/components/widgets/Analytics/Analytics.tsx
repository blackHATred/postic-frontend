// src/components/widgets/Analytics/Analytics.tsx
import React, { useState, useEffect, useMemo } from 'react';
import styles from './styles.module.scss';
import {
  mockData,
  mockDataGetStatsResponse,
  mockGetStatsResponse,
} from '../../../models/Analytics/types';
import LineChart from '../../ui/Charts/LineChart';
import { useAppSelector } from '../../../stores/hooks';
import EngagementDashboard from '../../ui/Charts/EngagementDashboard';
import TopEngagingPostsList from '../../ui/Charts/TopEngagingPostsList';
import PeriodComparisonChart from '../../ui/Charts/PeriodComparisonChart';
import HeatmapChart from '../../ui/Charts/HeatmapChart';
import MarkerLineChart from '../../ui/Charts/MarkerLineChart';
import CircularChart from '../../ui/Charts/CircularChart';

const AnalyticsComponent: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const activeAnalytics = useAppSelector((state) => state.analytics.activeAnalyticsFilter);
  const DataGetStatsResponse = mockDataGetStatsResponse;
  const GetStatsResponse = mockGetStatsResponse;

  // Преобразуем данные для графика динамики
  const dynamicsData = useMemo(() => {
    return mockData.map((item, index) => {
      return {
        ...item,
        timestamp: `День ${index + 1}`,
      };
    });
  }, []);

  useEffect(() => {
    // Имитация загрузки данных
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <div className={styles.analyticsContainer}>
      {activeAnalytics === '' && (
        <>
          <CircularChart data={mockData} loading={loading} />
          <LineChart data={mockData} loading={loading} height={400} />
        </>
      )}
      {activeAnalytics === 'audience' && (
        <>
          <MarkerLineChart data={mockData} loading={loading} />
          <EngagementDashboard data={mockData} loading={loading} />
          <TopEngagingPostsList data={mockData} loading={loading} />
          <HeatmapChart data={mockData} loading={loading} />
        </>
      )}
      {activeAnalytics === 'growth' && (
        <>
          <PeriodComparisonChart data={mockData} loading={loading} />
        </>
      )}
    </div>
  );
};

export default AnalyticsComponent;
