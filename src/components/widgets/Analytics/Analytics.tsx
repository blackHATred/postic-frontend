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
  transformStatsToAnalytics,
} from '../../../utils/transformData';
import { useLocation } from 'react-router-dom';
import KPIRadarChart from '../../ui/Charts/RadarChart';
import KPIColumnChart from '../../ui/Charts/KPIColumnChart';
import { Empty, Space, Radio, Tooltip } from 'antd';
import PeriodComparisonChart1 from '../../ui/Charts/PeriodComparisonChart1';
import { GetStats, getKPI } from '../../../api/api';
import { setActiveAnalyticsFilter } from '../../../stores/analyticsSlice';
import { LeftOutlined, RightOutlined, InfoCircleOutlined } from '@ant-design/icons';
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
  const [currentWeek, setCurrentWeek] = useState<number>(0); // 0 - текущая, -1 - предыдущая, 1 - следующая

  const getWeekBoundaries = (weekOffset: number) => {
    const today = dayjs();

    const currentMonday = today.startOf('isoWeek');

    const startOfWeek = currentMonday.add(weekOffset * 7, 'day');
    const endOfWeek = startOfWeek.add(6, 'day');

    return [startOfWeek, endOfWeek];
  };

  const [weekStart, weekEnd] = getWeekBoundaries(currentWeek);

  const getWeekLabel = (weekOffset: number) => {
    switch (weekOffset) {
      case -1:
        return 'Предыдущая неделя';
      case 0:
        return 'Текущая неделя';
      case 1:
        return 'Следующая неделя';
      default:
        if (weekOffset < 0) {
          return `${Math.abs(weekOffset)} ${Math.abs(weekOffset) === 1 ? 'неделя' : 'недели'} назад`;
        }
        return `${weekOffset} ${weekOffset === 1 ? 'неделя' : 'недели'} вперед`;
    }
  };

  const goToPrevWeek = () => {
    setCurrentWeek(currentWeek - 1);
  };

  const goToNextWeek = () => {
    setCurrentWeek(currentWeek + 1);
  };

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
          const transformedData = transformStatsToAnalytics(
            statsResponse,
            new Date(startDate),
            new Date(endDate),
          );
          setAnalyticsData(transformedData);
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
    const fetchUsersData = async () => {
      if (activeAnalytics !== 'kpi' || selectedTeamId === 0) {
        return;
      }

      setUsersLoading(true);
      try {
        const startDate = dateRange[0];
        const endDate = dateRange[1];

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
          setUsersData([]);
        }
      } catch (error) {
        setUsersData([]);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsersData();
  }, [selectedTeamId, activeAnalytics, dateRange]);

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

        const addMissingVkData = (response: GetStatsResponse): GetStatsResponse => {
          if (!response || !response.posts) return response;

          return {
            ...response,
            posts: response.posts.map((post) => ({
              ...post,
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
              addMissingVkData(currentPeriodResponse),
              currentPeriodStart.toDate(),
              currentPeriodEnd.toDate(),
            )
          : [];

        const previousPeriodData = hasPreviousData
          ? transformStatsToAnalytics(
              addMissingVkData(previousPeriodResponse),
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
        {activeAnalytics !== 'growth' && activeAnalytics !== 'kpi' && (
          <div className={styles.weekSelector}>
            <Space>
              <div className={styles.weekSelectorContainer}>
                <Tooltip title='Просмотр аналитики по неделям'>
                  <InfoCircleOutlined className={styles.weekSelectorIcon} />
                </Tooltip>
                <Radio.Button onClick={goToPrevWeek}>
                  <LeftOutlined />
                </Radio.Button>
                <Radio.Button disabled>{getWeekLabel(currentWeek)}</Radio.Button>
                <Radio.Button onClick={goToNextWeek}>
                  <RightOutlined />
                </Radio.Button>
              </div>
            </Space>
          </div>
        )}

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
      {!MOCK_ANALYTICS && (
        <div className={styles.analyticsHeader}>
          <div>
            {activeAnalytics !== 'growth' && activeAnalytics !== 'kpi' && (
              <div className={styles.weekSelector}>
                <Space>
                  <div className={styles.weekSelectorContainer}>
                    <Tooltip title='Просмотр аналитики по неделям'>
                      <InfoCircleOutlined className={styles.weekSelectorIcon} />
                    </Tooltip>
                    <Radio.Button onClick={goToPrevWeek}>
                      <LeftOutlined />
                    </Radio.Button>
                    <Radio.Button disabled>{getWeekLabel(currentWeek)}</Radio.Button>
                    <Radio.Button onClick={goToNextWeek}>
                      <RightOutlined />
                    </Radio.Button>
                  </div>
                </Space>
              </div>
            )}
          </div>
        </div>
      )}

      {activeAnalytics === '' && (
        <div className={styles['spacer']}>
          <LineChart
            data={analyticsData}
            loading={loading}
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
            data={analyticsData}
            loading={loading}
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
