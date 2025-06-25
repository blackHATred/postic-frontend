import React, { useState, useMemo } from 'react';
import { Card, Radio, Space, Tooltip, Alert, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';
import { PostAnalytics } from '../../../models/Analytics/types';
import BarChart from '../../ui/Charts/BarChart';
import { useAppSelector } from '../../../stores/hooks';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

const { Title, Text } = Typography;

type MetricType = 'reactions' | 'comments';
type ViewMode = 'posts' | 'days';

interface EngagementDashboardProps {
  data: PostAnalytics[];
  loading: boolean;
  hasTelegram?: boolean;
  hasVk?: boolean;
}

const EngagementDashboard: React.FC<EngagementDashboardProps> = ({
  data,
  loading,
  hasTelegram,
  hasVk,
}) => {
  const [metricType, setMetricType] = useState<MetricType>('reactions');
  const [viewMode, setViewMode] = useState<ViewMode>('days');

  // Если пропсы не переданы, получаем доступные платформы из Redux как запасной вариант
  const activePlatforms = useAppSelector((state) => state.teams.globalActivePlatforms);

  // Используем переданные пропсы или получаем значения из Redux
  const isTelegramAvailable =
    hasTelegram !== undefined
      ? hasTelegram
      : activePlatforms.some((p) => p.platform === 'telegram' && p.isLinked);
  const isVkAvailable =
    hasVk !== undefined ? hasVk : activePlatforms.some((p) => p.platform === 'vk' && p.isLinked);

  const getDailyData = (data: PostAnalytics[]) => {
    if (!data || data.length === 0) {
      return [];
    }

    const dailyMap = new Map<
      string,
      {
        date: string;
        formattedDate: string;
        dayOfWeek: string;
        tg_views: number;
        tg_reactions: number;
        tg_comments: number;
        vk_views: number;
        vk_reactions: number;
        vk_comments: number;
      }
    >();

    const sortedData = [...data].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    sortedData.forEach((post) => {
      const date = dayjs(post.timestamp).format('YYYY-MM-DD');
      const formattedDate = dayjs(post.timestamp).format('DD.MM.YYYY');
      const dayOfWeek = dayjs(post.timestamp).format('dddd');

      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          formattedDate,
          dayOfWeek,
          tg_views: 0,
          tg_reactions: 0,
          tg_comments: 0,
          vk_views: 0,
          vk_reactions: 0,
          vk_comments: 0,
        });
      }

      const dayData = dailyMap.get(date)!;
      dayData.tg_views += post.tg_views || 0;
      dayData.tg_reactions += post.tg_reactions || 0;
      dayData.tg_comments += post.tg_comments || 0;
      dayData.vk_views += post.vk_views || 0;
      dayData.vk_reactions += post.vk_reactions || 0;
      dayData.vk_comments += post.vk_comments || 0;
    });

    return Array.from(dailyMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  };

  const postChartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    const sortedData = [...data].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    const lastTenPosts = sortedData.slice(0, 10);

    const result = lastTenPosts.map((post) => {
      const postId = `Пост ${post.post_union_id}`;

      return {
        post_union_id: post.post_union_id,
        postId: postId,
        tg_views: post.tg_views || 0,
        tg_reactions: post.tg_reactions || 0,
        tg_comments: post.tg_comments || 0,
        vk_views: post.vk_views || 0,
        vk_reactions: post.vk_reactions || 0,
        vk_comments: post.vk_comments || 0,
        timestamp: post.timestamp,
      };
    });

    return result.reverse();
  }, [data]);

  const dailyChartData = useMemo(() => {
    const dailyData = getDailyData(data);

    return dailyData.map((day) => ({
      post_union_id: 0,
      postId: day.dayOfWeek,
      formattedDate: day.formattedDate,
      tg_views: day.tg_views,
      tg_reactions: day.tg_reactions,
      tg_comments: day.tg_comments,
      vk_views: day.vk_views,
      vk_reactions: day.vk_reactions,
      vk_comments: day.vk_comments,
      timestamp: day.date,
    }));
  }, [data]);

  const chartData = viewMode === 'posts' ? postChartData : dailyChartData;

  const hasZeroMetrics = useMemo(() => {
    const dataToCheck = viewMode === 'posts' ? postChartData : dailyChartData;

    if (!dataToCheck || dataToCheck.length === 0) return false;

    let hasZeroTgMetrics = true;
    let hasZeroVkMetrics = true;

    for (const item of dataToCheck) {
      if (metricType === 'reactions') {
        if (item.tg_reactions > 0 && item.tg_views > 0) hasZeroTgMetrics = false;
        if (item.vk_reactions > 0 && item.vk_views > 0) hasZeroVkMetrics = false;
      } else {
        if (item.tg_comments > 0 && item.tg_views > 0) hasZeroTgMetrics = false;
        if (item.vk_comments > 0 && item.vk_views > 0) hasZeroVkMetrics = false;
      }
    }

    return {
      telegram: hasZeroTgMetrics && isTelegramAvailable,
      vkontakte: hasZeroVkMetrics && isVkAvailable,
    };
  }, [postChartData, dailyChartData, metricType, isTelegramAvailable, isVkAvailable, viewMode]);

  const metricInfo = {
    reactions: {
      title: viewMode === 'posts' ? 'Engagement Rate по постам' : 'Engagement Rate по дням',
      description:
        viewMode === 'posts'
          ? 'Показывает процент пользователей, которые оставили реакции на 10 последних постах'
          : 'Показывает процент пользователей, которые оставили реакции за каждый день недели',
    },
    comments: {
      title: viewMode === 'posts' ? 'Discussion Rate по постам' : 'Discussion Rate по дням',
      description:
        viewMode === 'posts'
          ? 'Показывает процент пользователей, которые оставили комментарии на 10 последних постах'
          : 'Показывает процент пользователей, которые оставили комментарии за каждый день недели',
    },
  };

  return (
    <Card
      title={
        <Space>
          <span>Метрики вовлеченности</span>
          <Tooltip title='Метрики с engagement rate вашей адитории'>
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      }
      loading={loading}
      className={styles.analyticsCard}
    >
      <div className={styles.controlsContainer}>
        <Radio.Group
          value={metricType}
          onChange={(e) => setMetricType(e.target.value)}
          optionType='button'
          buttonStyle='solid'
        >
          <Radio.Button value='reactions'>Реакции</Radio.Button>
          <Radio.Button value='comments'>Комментарии</Radio.Button>
        </Radio.Group>

        <Radio.Group
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          optionType='button'
          buttonStyle='solid'
        >
          <Radio.Button value='days'>По дням</Radio.Button>
          <Radio.Button value='posts'>По постам</Radio.Button>
        </Radio.Group>
      </div>

      <div className={styles.chartsContainer}>
        <div className={styles.chartTitleContainer}>
          <Text className={styles.chartTitle}>{metricInfo[metricType].title}</Text>
          <Tooltip title={metricInfo[metricType].description}>
            <InfoCircleOutlined className={styles.titleInfoIcon} />
          </Tooltip>
        </div>

        {hasZeroMetrics.telegram && (
          <Alert
            message='Нет данных для Telegram'
            description='На графике отсутствуют метрики для Telegram, так как нет достаточно данных для расчета'
            type='info'
            showIcon
            className={styles.alert}
          />
        )}

        {hasZeroMetrics.vkontakte && (
          <Alert
            message='Нет данных для ВКонтакте'
            description='На графике отсутствуют метрики для ВКонтакте, так как нет достаточно данных для расчета'
            type='info'
            showIcon
            className={styles.alert}
          />
        )}

        <div className={styles.chart}>
          <BarChart
            data={chartData}
            loading={loading}
            metricType={metricType}
            hasTelegram={isTelegramAvailable}
            hasVk={isVkAvailable}
            height={280}
          />
        </div>
      </div>
    </Card>
  );
};

export default EngagementDashboard;
