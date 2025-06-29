import React, { useState, useEffect } from 'react';
import styles from './styles.module.scss';
import { GetStatsResponse, PostAnalytics, UserAnalytics } from '../../../models/Analytics/types';
import LineChart from '../../ui/Charts/LineChart';
import { useAppSelector, useAppDispatch } from '../../../stores/hooks';
import EngagementDashboard from '../../ui/Charts/EngagementDashboard';
import TopEngagingPostsList from '../../ui/Charts/TopEngagingPostsList';
import CircularChart from '../../ui/Charts/CircularChart';
import {
  generateMockAnalyticsData,
  generateMockPeriodComparisonData,
  generateMockUserAnalytics,
  transformStatsToAnalytics,
} from '../../../utils/transformData';
import { useLocation } from 'react-router-dom';
import KPIRadarChart from '../../ui/Charts/RadarChart';
import KPIColumnChart from '../../ui/Charts/KPIColumnChart';
import { Empty } from 'antd';
import PeriodComparisonChart1 from '../../ui/Charts/PeriodComparisonChart1';
import { GetStats, getKPI } from '../../../api/api';
import { setActiveAnalyticsFilter } from '../../../stores/analyticsSlice';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);

const MOCK_ANALYTICS = false;

// для использования в API
if (typeof window !== 'undefined') {
  (window as any).MOCK_ANALYTICS = MOCK_ANALYTICS;
}

const AnalyticsComponent: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [lineChartLoading, setLineChartLoading] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<PostAnalytics[]>([]);
  const [dailyAnalyticsData, setDailyAnalyticsData] = useState<PostAnalytics[]>([]);
  const activeAnalytics = useAppSelector((state) => state.analytics.activeAnalyticsFilter);
  const selectedTeamId = useAppSelector((state) => state.teams.globalActiveTeamId);
  const activePlatforms = useAppSelector((state) => state.teams.globalActivePlatforms);
  const location = useLocation();
  const currentPath = location.pathname;
  const [usersLoading, setUsersLoading] = useState<boolean>(true);
  const [usersData, setUsersData] = useState<UserAnalytics[]>([]);
  const [hasPosts, setHasPosts] = useState<boolean>(true);
  const dateRange = useAppSelector((state) => state.analytics.period);
  const dispatch = useAppDispatch();

  const getWeekBoundaries = () => {
    const today = dayjs();
    const currentMonday = today.startOf('isoWeek');
    const endOfWeek = currentMonday.add(6, 'day');
    return [currentMonday, endOfWeek];
  };

  const [weekStart, weekEnd] = getWeekBoundaries();

  const hasTelegram = activePlatforms.some((p) => p.platform === 'tg' && p.isLinked);
  const hasVk = activePlatforms.some((p) => p.platform === 'vk' && p.isLinked);

  const availablePlatforms = {
    hasTelegram,
    hasVk,
  };

  useEffect(() => {
    if (activeAnalytics === undefined) {
      dispatch(setActiveAnalyticsFilter(''));
    }
  }, [dispatch, activeAnalytics]);

  const fetchDailyData = async (date: dayjs.Dayjs): Promise<PostAnalytics[]> => {
    try {
      const startDate = date.startOf('day').toISOString();
      const endDate = date.endOf('day').toISOString();

      if (MOCK_ANALYTICS) {
        const mockData = generateMockAnalyticsData(1, hasTelegram, hasVk);
        return mockData;
      }

      const statsResponse = await GetStats({
        team_id: selectedTeamId,
        start: startDate,
        end: endDate,
      });

      if (statsResponse.posts && statsResponse.posts.length > 0) {
        const addMissingPlatformData = (response: GetStatsResponse): GetStatsResponse => {
          if (!response || !response.posts) return response;

          return {
            ...response,
            posts: response.posts.map((post) => ({
              ...post,
              telegram: post.telegram || {
                views: 0,
                comments: 0,
                reactions: 0,
              },
              vkontakte: post.vkontakte || {
                views: 0,
                comments: 0,
                reactions: 0,
              },
            })),
          };
        };

        const transformedData = transformStatsToAnalytics(
          addMissingPlatformData(statsResponse),
          new Date(startDate),
          new Date(endDate),
        );
        return transformedData;
      }
      return [];
    } catch (error) {
      console.error('Ошибка при получении данных за день:', error);
      return [];
    }
  };

  const fetchWeeklyDataForLineChart = async () => {
    setLineChartLoading(true);
    try {
      const today = dayjs();
      const currentMonday = today.startOf('isoWeek');

      const dailyDataPromises = [];
      for (let i = 0; i < 7; i++) {
        const day = currentMonday.clone().add(i, 'day');
        dailyDataPromises.push(fetchDailyData(day));
      }

      const results = await Promise.all(dailyDataPromises);

      const combinedData = results.flat();
      setDailyAnalyticsData(combinedData);

      return combinedData;
    } catch (error) {
      console.error('Ошибка при получении данных за неделю:', error);
      return [];
    } finally {
      setLineChartLoading(false);
    }
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        let startDate, endDate;

        if (activeAnalytics !== 'growth' && activeAnalytics !== 'kpi') {
          startDate = weekStart.toISOString();
          endDate = weekEnd.toISOString();
        } else {
          startDate = dateRange[0];
          endDate = dateRange[1];
        }

        if (MOCK_ANALYTICS) {
          const days = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
          const mockData = generateMockAnalyticsData(days, hasTelegram, hasVk);
          setAnalyticsData(mockData);
          setHasPosts(true);
          setLoading(false);
          return;
        }

        const statsResponse = await GetStats({
          team_id: selectedTeamId,
          start: startDate,
          end: endDate,
        });

        if (statsResponse.posts && statsResponse.posts.length > 0) {
          setHasPosts(true);

          const addMissingPlatformData = (response: GetStatsResponse): GetStatsResponse => {
            if (!response || !response.posts) return response;

            return {
              ...response,
              posts: response.posts.map((post) => ({
                ...post,
                telegram: post.telegram || {
                  views: 0,
                  comments: 0,
                  reactions: 0,
                },
                vkontakte: post.vkontakte || {
                  views: 0,
                  comments: 0,
                  reactions: 0,
                },
              })),
            };
          };

          const transformedData = transformStatsToAnalytics(
            addMissingPlatformData(statsResponse),
            new Date(startDate),
            new Date(endDate),
          );
          setAnalyticsData(transformedData);

          if (activeAnalytics === '') {
            await fetchWeeklyDataForLineChart();
          }
        } else {
          setHasPosts(false);
        }
      } catch (error) {
        setHasPosts(false);
      } finally {
        setLoading(false);
      }
    };

    if (selectedTeamId !== 0) {
      fetchAnalyticsData();
    }
  }, [selectedTeamId, currentPath, activeAnalytics]);

  useEffect(() => {
    const fetchDailyDataForEngagement = async () => {
      if (activeAnalytics !== 'audience' || selectedTeamId === 0) {
        return;
      }

      setLineChartLoading(true);
      try {
        const dailyData = await fetchWeeklyDataForLineChart();
        setDailyAnalyticsData(dailyData);
        setHasPosts(dailyData.length > 0);
      } finally {
        setLineChartLoading(false);
      }
    };

    if (activeAnalytics === 'audience') {
      fetchDailyDataForEngagement();
    }
  }, [activeAnalytics, selectedTeamId]);

  const [growthDataLoading, setGrowthDataLoading] = useState<boolean>(true);
  const [growthData, setGrowthData] = useState<{
    currentPeriod: PostAnalytics[];
    previousPeriod: PostAnalytics[];
  }>({
    currentPeriod: [],
    previousPeriod: [],
  });
  const [periodType, setPeriodType] = useState<'week' | 'month'>('week');

  useEffect(() => {
    const fetchGrowthData = async () => {
      if (selectedTeamId === 0 || activeAnalytics !== 'growth') {
        return;
      }

      setGrowthDataLoading(true);
      try {
        const today = dayjs();

        let currentPeriodStart, currentPeriodEnd, previousPeriodStart, previousPeriodEnd;

        if (periodType === 'week') {
          currentPeriodStart = today.startOf('isoWeek');
          currentPeriodEnd = today.endOf('isoWeek');
          previousPeriodStart = currentPeriodStart.clone().subtract(1, 'week');
          previousPeriodEnd = currentPeriodEnd.clone().subtract(1, 'week');
        } else {
          currentPeriodStart = today.startOf('month');
          currentPeriodEnd = today.endOf('month');
          previousPeriodStart = currentPeriodStart.clone().subtract(1, 'month');
          previousPeriodEnd = currentPeriodEnd.clone().subtract(1, 'month');
        }

        if (MOCK_ANALYTICS) {
          const mockGrowthData = generateMockPeriodComparisonData(hasTelegram, hasVk);
          setGrowthData(mockGrowthData);
          setHasPosts(true);
          setGrowthDataLoading(false);
          return;
        }

        const currentPeriodResponse = await GetStats({
          team_id: selectedTeamId,
          start: currentPeriodStart.toISOString(),
          end: currentPeriodEnd.toISOString(),
        });

        const previousPeriodResponse = await GetStats({
          team_id: selectedTeamId,
          start: previousPeriodStart.toISOString(),
          end: previousPeriodEnd.toISOString(),
        });

        const hasCurrentData =
          currentPeriodResponse.posts && currentPeriodResponse.posts.length > 0;
        const hasPreviousData =
          previousPeriodResponse.posts && previousPeriodResponse.posts.length > 0;

        const addMissingPlatformData = (response: GetStatsResponse): GetStatsResponse => {
          if (!response || !response.posts) return response;

          return {
            ...response,
            posts: response.posts.map((post) => ({
              ...post,
              telegram: post.telegram || {
                views: 0,
                comments: 0,
                reactions: 0,
              },
              vkontakte: post.vkontakte || {
                views: 0,
                comments: 0,
                reactions: 0,
              },
            })),
          };
        };

        const currentPeriodData = hasCurrentData
          ? transformStatsToAnalytics(
              addMissingPlatformData(currentPeriodResponse),
              currentPeriodStart.toDate(),
              currentPeriodEnd.toDate(),
            )
          : [];

        const previousPeriodData = hasPreviousData
          ? transformStatsToAnalytics(
              addMissingPlatformData(previousPeriodResponse),
              previousPeriodStart.toDate(),
              previousPeriodEnd.toDate(),
            )
          : [];

        setGrowthData({
          currentPeriod: currentPeriodData,
          previousPeriod: previousPeriodData,
        });

        setHasPosts(hasCurrentData || hasPreviousData);
      } catch (error) {
        console.error('Ошибка при получении данных для графика сравнения периодов:', error);
        setHasPosts(false);
      } finally {
        setGrowthDataLoading(false);
      }
    };

    if (selectedTeamId !== 0 && activeAnalytics === 'growth') {
      fetchGrowthData();
    }
  }, [selectedTeamId, activeAnalytics, periodType]);

  useEffect(() => {
    const fetchKPIData = async () => {
      if (activeAnalytics !== 'kpi' || selectedTeamId === 0) {
        return;
      }

      setUsersLoading(true);
      try {
        const startDate = dateRange[0];
        const endDate = dateRange[1];

        if (MOCK_ANALYTICS) {
          const mockUserData = generateMockUserAnalytics(5);
          setUsersData(mockUserData);
          setHasPosts(true);
          setUsersLoading(false);
          return;
        }

        const kpiResponse = await getKPI({
          team_id: selectedTeamId,
          start: startDate,
          end: endDate,
        });

        if (kpiResponse) {
          if (kpiResponse.users && Array.isArray(kpiResponse.users)) {
            setUsersData(kpiResponse.users);
            setHasPosts(kpiResponse.users.length > 0);
          } else if (Array.isArray(kpiResponse.kpi)) {
            setUsersData(kpiResponse.kpi);
            setHasPosts(kpiResponse.kpi.length > 0);
          } else if (kpiResponse.kpi) {
            setUsersData([kpiResponse.kpi]);
            setHasPosts(true);
          } else {
            setUsersData([]);
            setHasPosts(false);
          }
        } else {
          setUsersData([]);
          setHasPosts(false);
        }
      } catch (error) {
        console.error('Ошибка при получении данных для KPI:', error);
        setUsersData([]);
        setHasPosts(false);
      } finally {
        setUsersLoading(false);
      }
    };

    if (activeAnalytics === 'kpi') {
      fetchKPIData();
    }
  }, [activeAnalytics, selectedTeamId, dateRange]);

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
        {activeAnalytics === 'kpi' && (
          <div className={styles['spacer']}>
            <KPIRadarChart data={usersData} loading={usersLoading} height={400} />
            <KPIColumnChart data={usersData} loading={usersLoading} height={400} />
          </div>
        )}
        {activeAnalytics !== 'kpi' && (
          <div className={styles['spacer']}>
            <Empty
              description='Аналитика не собрала достаточно данных для отображения'
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.analyticsContainer}>
      {activeAnalytics === '' && (
        <div className={styles['spacer']}>
          <LineChart
            data={dailyAnalyticsData.length > 0 ? dailyAnalyticsData : analyticsData}
            loading={lineChartLoading}
            height={400}
            hasTelegram={hasTelegram}
            hasVk={hasVk}
            showWeekSelector={false}
          />
          <CircularChart
            data={analyticsData}
            loading={loading}
            hasTelegram={hasTelegram}
            hasVk={hasVk}
          />
        </div>
      )}
      {activeAnalytics === 'audience' && (
        <div className={styles['spacer']}>
          <EngagementDashboard
            data={dailyAnalyticsData.length > 0 ? dailyAnalyticsData : analyticsData}
            loading={lineChartLoading}
            hasTelegram={hasTelegram}
            hasVk={hasVk}
          />
          <TopEngagingPostsList
            data={analyticsData}
            loading={loading}
            hasTelegram={hasTelegram}
            hasVk={hasVk}
          />
        </div>
      )}
      {activeAnalytics === 'growth' && (
        <div className={styles['spacer']}>
          <PeriodComparisonChart1
            currentPeriodData={growthData.currentPeriod}
            previousPeriodData={growthData.previousPeriod}
            loading={growthDataLoading}
            height={400}
            hasTelegram={hasTelegram}
            hasVk={hasVk}
            periodType={periodType}
            onPeriodTypeChange={setPeriodType}
          />
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
